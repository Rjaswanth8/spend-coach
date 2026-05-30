import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { transactionAPI } from "../services/api";
import { StatCard, Card, Spinner } from "../components/UI";

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
  PiLightningFill,
  PiHandWaving,
} from "react-icons/pi";
import { BsCashCoin } from "react-icons/bs";

const CATEGORY_COLORS = {
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

const CATEGORY_ICONS = {
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

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DashboardHome({ onNavigate }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      transactionAPI.getSummary(),
      transactionAPI.getAll({ limit: 5 }),
    ])
      .then(([sumRes, txRes]) => {
        setSummary(sumRes.data);
        setTransactions(txRes.data.transactions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.name?.split(" ")[0] || "there";
  const spent = summary?.stats?.totalSpent || 0;
  const income = summary?.stats?.totalIncome || 0;
  const saved = income - spent;
  const savingsRate = income > 0 ? Math.round((saved / income) * 100) : 0;
  const breakdown = summary?.categoryBreakdown || [];
  const totalCatSpend = breakdown.reduce((s, c) => s + c.total, 0);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Spinner size={36} />
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>
            {greeting()}, {firstName} <PiHandWaving size={24} color="#EF9F27" />
          </h1>
          <p style={styles.date}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {user?.plan === "Free" && (
          <div style={styles.upgradeBanner}>
            <span>
              <PiLightningFill size={16} color="#EF9F27" /> Unlock AI Coach
            </span>
            <button
              style={styles.upgradeCta}
              onClick={() => onNavigate && onNavigate("profile")}
            >
              Upgrade to Pro →
            </button>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Total Spent (This Month)"
          value={fmt(spent)}
          sub={`${summary?.stats?.transactionCount || 0} transactions`}
          icon=<BsCashCoin size={22} color="#FFf" />
          accent
        />
        <StatCard
          label="Total Income"
          value={fmt(income)}
          sub="Credited this month"
          icon=<PiMoneyWavyFill size={18} color="#00C896" />
        />
        <StatCard
          label="Net Savings"
          value={fmt(Math.max(0, saved))}
          sub={
            savingsRate > 0
              ? `${savingsRate}% savings rate`
              : "Start saving today!"
          }
          icon=<BsPiggyBankFill size={16} color="#00A878" />
        />
        <StatCard
          label="Savings Goal"
          value={user?.savingsGoal ? fmt(user.savingsGoal) : "—"}
          sub={
            user?.savingsGoal
              ? `${Math.min(100, Math.round((saved / user.savingsGoal) * 100))}% achieved`
              : "Set a goal"
          }
          icon=<BsPiggyBankFill size={16} color="#00A878" />
        />
      </div>

      <div style={styles.twoCol}>
        {/* Category breakdown */}
        <Card style={{ flex: 1, minWidth: 0 }}>
          <h3 style={styles.cardTitle}>Spending by Category</h3>
          {breakdown.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 36 }}>📊</span>
              <p>
                No spending data yet.
                <br />
                Add your first transaction!
              </p>
              <button
                style={styles.emptyBtn}
                onClick={() => onNavigate && onNavigate("transactions")}
              >
                + Add Transaction
              </button>
            </div>
          ) : (
            <div style={styles.catList}>
              {breakdown.slice(0, 6).map((cat) => {
                const pct =
                  totalCatSpend > 0 ? (cat.total / totalCatSpend) * 100 : 0;
                const color = CATEGORY_COLORS[cat._id] || "#94A3B8";
                return (
                  <div key={cat._id} style={styles.catRow}>
                    <div style={styles.catLeft}>
                      <span
                        style={{
                          ...styles.catIcon,
                          background: color + "20",
                          color,
                        }}
                      >
                        {CATEGORY_ICONS[cat._id] || "📦"}
                      </span>
                      <div>
                        <div style={styles.catName}>{cat._id}</div>
                        <div style={styles.catPct}>
                          {pct.toFixed(0)}% of spend
                        </div>
                      </div>
                    </div>
                    <div style={styles.catRight}>
                      <div style={styles.catAmount}>{fmt(cat.total)}</div>
                      <div style={styles.catBar}>
                        <div
                          style={{
                            ...styles.catBarFill,
                            width: `${pct}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent transactions */}
        <Card style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={styles.cardTitle}>Recent Transactions</h3>
            <button
              style={styles.viewAll}
              onClick={() => onNavigate && onNavigate("transactions")}
            >
              View all →
            </button>
          </div>
          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 36 }}>💳</span>
              <p>
                No transactions yet.
                <br />
                Start tracking your spending!
              </p>
            </div>
          ) : (
            <div style={styles.txList}>
              {transactions.map((tx, i) => (
                <div
                  key={tx._id}
                  style={{ ...styles.txRow, animationDelay: `${i * 0.05}s` }}
                  className="animate-in"
                >
                  <div
                    style={{
                      ...styles.txIcon,
                      background:
                        (CATEGORY_COLORS[tx.category] || "#94A3B8") + "20",
                    }}
                  >
                    {CATEGORY_ICONS[tx.category] || "📦"}
                  </div>
                  <div style={styles.txInfo}>
                    <div style={styles.txMerchant}>{tx.merchant}</div>
                    <div style={styles.txMeta}>
                      {tx.category} ·{" "}
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.txAmount,
                      color:
                        tx.type === "credit"
                          ? "var(--green-dark)"
                          : "var(--text)",
                    }}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* AI Insight card */}
      <Card
        style={{
          background:
            "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)",
          border: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 48 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                color: "#fff",
                fontSize: 18,
                marginBottom: 6,
              }}
            >
              SpendCoach AI Insight
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {spent === 0
                ? "Welcome! Start adding your transactions and I'll analyze your spending patterns to give personalized insights."
                : savingsRate >= 20
                  ? `🎉 Great job! You're saving ${savingsRate}% of your income this month. You're on track to meet your financial goals!`
                  : savingsRate > 0
                    ? `You're saving ${savingsRate}% of income. Aim for 20%+ for financial security. Try cutting your top spending category.`
                    : `Your spending exceeds income this month. Let's review your ${breakdown[0]?._id || "biggest"} expenses first.`}
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate("coach")}
            style={{
              padding: "10px 20px",
              background: "var(--green)",
              color: "var(--navy)",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Ask AI Coach
          </button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    animation: "fadeIn 0.4s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
  },
  greeting: {
    fontFamily: "var(--font-display)",
    fontSize: 26,
    fontWeight: 800,
    color: "var(--text)",
  },
  date: { fontSize: 14, color: "var(--text-muted)", marginTop: 4 },
  upgradeBanner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "linear-gradient(135deg, var(--orange-light), #fff)",
    border: "1px solid #FFD4C2",
    borderRadius: 12,
    padding: "10px 16px",
    fontSize: 14,
    color: "var(--orange)",
    fontWeight: 500,
  },
  upgradeCta: {
    background: "var(--orange)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "32px 0",
    color: "var(--text-muted)",
    fontSize: 14,
    textAlign: "center",
  },
  emptyBtn: {
    padding: "8px 18px",
    background: "var(--green)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fontWeight: 600,
  },
  catList: { display: "flex", flexDirection: "column", gap: 12 },
  catRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  catLeft: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  catName: { fontSize: 13, fontWeight: 500, color: "var(--text)" },
  catPct: { fontSize: 11, color: "var(--text-light)" },
  catRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    minWidth: 90,
  },
  catAmount: { fontSize: 13, fontWeight: 600 },
  catBar: {
    width: 80,
    height: 4,
    background: "var(--surface-alt)",
    borderRadius: 99,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 99,
    transition: "width 0.6s ease",
  },
  viewAll: {
    fontSize: 13,
    color: "var(--green-dark)",
    fontWeight: 600,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  txList: { display: "flex", flexDirection: "column", gap: 2 },
  txRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid var(--surface-alt)",
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  txInfo: { flex: 1, minWidth: 0 },
  txMerchant: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  txMeta: { fontSize: 12, color: "var(--text-light)", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: 600, flexShrink: 0 },
};
