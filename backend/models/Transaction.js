const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    merchant: {
      type: String,
      required: [true, 'Merchant name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Food & Dining',
        'Housing',
        'Transport',
        'Shopping',
        'Entertainment',
        'Healthcare',
        'Education',
        'Utilities',
        'Income',
        'Savings',
        'Other',
      ],
      default: 'Other',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    type: {
      type: String,
      enum: ['debit', 'credit'],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    upiRef: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
