import { useEffect, useState } from "react";
import "./Transactions.css";

import { transactionAPI } from "../services/api";
import { Button, Input, Select, Card, Spinner, Alert } from "../components/UI";

import { MdFastfood, MdElectricalServices } from "react-icons/md";

import { BsHouseDoorFill, BsShopWindow, BsPiggyBankFill } from "react-icons/bs";

import {
  FaCar,
  FaFileMedical,
  FaGraduationCap,
  FaBoxOpen,
} from "react-icons/fa";

import {
  PiFilmSlateFill,
  PiMoneyWavyFill,
  PiCreditCardFill,
  PiTrashSimpleBold,
  PiXBold,
  PiPlusBold,
} from "react-icons/pi";

const CATEGORIES = [
  "Food & Dining",
  "Housing",
  "Transport",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Utilities",
  "Income",
  "Savings",
  "Other",
];

const ICONS = {
  "Food & Dining": <MdFastfood size={18} color="#FF6B35" />,
  Housing: <BsHouseDoorFill size={16} color="#7F77DD" />,
  Transport: <FaCar size={16} color="#3B82F6" />,
  Shopping: <BsShopWindow size={16} color="#EC4899" />,
  Entertainment: <PiFilmSlateFill size={18} color="#F59E0B" />,
  Healthcare: <FaFileMedical size={16} color="#10B981" />,
  Education: <FaGraduationCap size={16} color="#6366F1" />,
  Utilities: <MdElectricalServices size={18} color="#64748B" />,
  Income: <PiMoneyWavyFill size={18} color="#00C896" />,
  Savings: <BsPiggyBankFill size={16} color="#00A878" />,
  Other: <FaBoxOpen size={16} color="#94A3B8" />,
};

const COLORS = {
  "Food & Dining": "#FF6B35",
  Housing: "#7F77DD",
  Transport: "#3B82F6",
  Shopping: "#EC4899",
  Entertainment: "#F59E0B",
  Healthcare: "#10B981",
  Education: "#6366F1",
  Utilities: "#64748B",
  Income: "#00C896",
  Savings: "#00A878",
  Other: "#94A3B8",
};

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const EMPTY_FORM = {
  merchant: "",
  category: "Food & Dining",
  amount: "",
  type: "debit",
  date: new Date().toISOString().split("T")[0],
  note: "",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState(null);

  const [filter, setFilter] = useState({
    type: "",
    category: "",
  });

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const params = {};

      if (filter.type) {
        params.type = filter.type;
      }

      if (filter.category) {
        params.category = filter.category;
      }

      const res = await transactionAPI.getAll({
        ...params,
        limit: 100,
      });

      setTransactions(res.data.transactions);
    } catch {
      setAlert({
        type: "error",
        message: "Failed to load transactions.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const set = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });
  };

  const validate = () => {
    const e = {};

    if (!form.merchant.trim()) {
      e.merchant = "Merchant name required";
    }

    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) {
      e.amount = "Enter a valid positive amount";
    }

    if (!form.date) {
      e.date = "Date required";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    try {
      const res = await transactionAPI.create({
        ...form,
        amount: +form.amount,
      });

      setTransactions([res.data.transaction, ...transactions]);

      setForm(EMPTY_FORM);

      setShowForm(false);

      setAlert({
        type: "success",
        message: "Transaction added successfully!",
      });

      setTimeout(() => {
        setAlert(null);
      }, 3000);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to add transaction.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    setDeletingId(id);

    try {
      await transactionAPI.delete(id);

      setTransactions(transactions.filter((t) => t._id !== id));
    } catch {
      setAlert({
        type: "error",
        message: "Failed to delete transaction.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = transactions.filter(
    (t) =>
      !search ||
      t.merchant.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  const totalDebit = filtered
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredit = filtered
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1 className="transactions-title">Transactions</h1>

          <p className="transactions-subtitle">
            {filtered.length} transactions · Debit {fmt(totalDebit)} · Credit{" "}
            {fmt(totalCredit)}
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          icon={
            showForm ? (
              <PiXBold size={16} color="#94A3B8" />
            ) : (
              <PiPlusBold size={16} color="#ffffff" />
            )
          }
          variant={showForm ? "secondary" : "primary"}
        >
          {showForm ? "Cancel" : "Add Transaction"}
        </Button>
      </div>

      {/* Alert */}
      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* Add Transaction Form */}
      {showForm && (
        <Card className="transactions-form-card">
          <h3 className="transactions-form-title">New Transaction</h3>

          <form onSubmit={handleAdd} className="transactions-form">
            <div className="transactions-form-row">
              <Input
                label="Merchant / Description"
                placeholder="e.g. Swiggy"
                value={form.merchant}
                onChange={set("merchant")}
                error={errors.merchant}
              />

              <Input
                label="Amount (₹)"
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={set("amount")}
                error={errors.amount}
              />
            </div>

            <div className="transactions-form-row">
              <Select
                label="Category"
                value={form.category}
                onChange={set("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>

              <Select label="Type" value={form.type} onChange={set("type")}>
                <option value="debit">Debit (Expense)</option>

                <option value="credit">Credit (Income)</option>
              </Select>

              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={set("date")}
                error={errors.date}
              />
            </div>

            <Input
              label="Note (optional)"
              placeholder="Any note"
              value={form.note}
              onChange={set("note")}
            />

            <div className="transactions-form-actions">
              <Button type="submit" loading={saving} className="save-tras">
                Save Transaction
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setErrors({});
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="transactions-filters">
        <input
          placeholder="🔍 Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="transactions-search"
        />

        <select
          value={filter.type}
          onChange={(e) =>
            setFilter({
              ...filter,
              type: e.target.value,
            })
          }
          className="transactions-select"
        >
          <option value="">All Types</option>

          <option value="debit">Debit</option>

          <option value="credit">Credit</option>
        </select>

        <select
          value={filter.category}
          onChange={(e) =>
            setFilter({
              ...filter,
              category: e.target.value,
            })
          }
          className="transactions-select"
        >
          <option value="">All Categories</option>

          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="transactions-card">
        {loading ? (
          <div className="transactions-loader">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="transactions-empty">
            <PiCreditCardFill size={42} color="#7F77DD" />

            <p>No transactions found.</p>

            <Button onClick={() => setShowForm(true)} variant="outline">
              + Add your first transaction
            </Button>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((tx) => {
                const color = COLORS[tx.category] || "#94A3B8";

                return (
                  <tr key={tx._id}>
                    <td>
                      <div className="merchant-cell">
                        <span
                          className="tx-icon"
                          style={{
                            background: color + "18",
                            color,
                          }}
                        >
                          {ICONS[tx.category] || "📦"}
                        </span>

                        <div>
                          <div className="merchant-name">{tx.merchant}</div>

                          {tx.note && (
                            <div className="merchant-note">{tx.note}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="cat-chip"
                        style={{
                          background: color + "18",
                          color,
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>

                    <td>
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          tx.type === "credit" ? "badge-green" : "badge-orange"
                        }`}
                      >
                        {tx.type === "credit" ? "↑ Credit" : "↓ Debit"}
                      </span>
                    </td>

                    <td className="amount-cell">
                      {tx.type === "credit" ? "+" : "-"}
                      {fmt(tx.amount)}
                    </td>

                    <td className="text-center">
                      {deletingId === tx._id ? (
                        <Spinner size={16} />
                      ) : (
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="delete-btn"
                        >
                          <PiTrashSimpleBold size={16} color="#E53E3E" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
