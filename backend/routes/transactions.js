const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user
router.get('/', async (req, res) => {
  try {
    const { category, type, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(filter);

    res.json({ success: true, count: transactions.length, total, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   POST /api/transactions
// @desc    Add new transaction
router.post(
  '/',
  [
    body('merchant').notEmpty().withMessage('Merchant is required'),
    body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Valid amount required'),
    body('type').isIn(['debit', 'credit']).withMessage('Type must be debit or credit'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const transaction = await Transaction.create({
        ...req.body,
        user: req.user._id,
      });

      res.status(201).json({ success: true, transaction });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// @route   DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    await transaction.deleteOne();
    res.json({ success: true, message: 'Transaction deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   GET /api/transactions/summary
// @desc    Get spending summary stats
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyStats, categoryBreakdown] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'debit', date: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const stats = { totalSpent: 0, totalIncome: 0, transactionCount: 0 };
    monthlyStats.forEach((s) => {
      if (s._id === 'debit') { stats.totalSpent = s.total; stats.transactionCount += s.count; }
      if (s._id === 'credit') { stats.totalIncome = s.total; stats.transactionCount += s.count; }
    });

    res.json({ success: true, stats, categoryBreakdown });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
