import React, { useEffect, useState } from "react";
import { Card, StatCard, Spinner } from "../components/UI";
import {
  PiTrophyFill,
  PiSmileyXEyesFill,
  PiPiggyBankFill,
  PiTrendDownFill,
  PiChartBarFill,
  PiChartLineUpFill,
} from "react-icons/pi";
import { transactionAPI } from "../services/api";
import "./Analytics.css";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState([]);
  const [spendData, setSpendData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [chartView, setChartView] = useState("bar"); // "bar" | "line"
  const [tooltip, setTooltip] = useState(null); // { index, x, y }
  const [stats, setStats] = useState({
    avgSpend: 0,
    bestMonth: { label: "", value: 0 },
    worstMonth: { label: "", value: 0 },
    avgSavingsRate: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const res = await transactionAPI.getAll({ limit: 1000 });
      const transactions = res.data.transactions;
      const last7Months = getLast7Months();
      const monthlyData = {};
      last7Months.forEach(({ key, label }) => {
        monthlyData[key] = { label, spend: 0, income: 0 };
      });
      transactions.forEach((tx) => {
        const date = new Date(tx.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[key]) {
          if (tx.type === "debit") monthlyData[key].spend += tx.amount;
          else monthlyData[key].income += tx.amount;
        }
      });
      const entries = Object.values(monthlyData);
      setMonths(entries.map((e) => e.label));
      setSpendData(entries.map((e) => e.spend));
      setIncomeData(entries.map((e) => e.income));
      const spends = entries.map((e) => e.spend);
      const avgSpend = spends.reduce((a, b) => a + b, 0) / spends.length;
      const bestIdx = spends.indexOf(Math.min(...spends.filter((s) => s > 0)));
      const worstIdx = spends.indexOf(Math.max(...spends));
      const savingsRates = entries
        .filter((e) => e.income > 0)
        .map((e) => ((e.income - e.spend) / e.income) * 100);
      const avgSavingsRate =
        savingsRates.length > 0
          ? savingsRates.reduce((a, b) => a + b, 0) / savingsRates.length
          : 0;
      setStats({
        avgSpend,
        bestMonth: {
          label: entries[bestIdx]?.label || "—",
          value: spends[bestIdx] || 0,
        },
        worstMonth: {
          label: entries[worstIdx]?.label || "—",
          value: spends[worstIdx] || 0,
        },
        avgSavingsRate: Math.round(avgSavingsRate),
      });
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getLast7Months = () => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short" });
      result.push({ key, label });
    }
    return result;
  };

  const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const maxVal = Math.max(...incomeData, ...spendData, 1);

  // ── Line chart SVG helpers ─────────────────────────────────────────
  const SVG_W = 600;
  const SVG_H = 160;
  const PAD = { top: 20, right: 20, bottom: 30, left: 50 };

  const xScale = (i) =>
    PAD.left + (i / (months.length - 1)) * (SVG_W - PAD.left - PAD.right);

  const yScale = (val) =>
    PAD.top + (1 - val / maxVal) * (SVG_H - PAD.top - PAD.bottom);

  const buildPath = (data) =>
    data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
      .join(" ");

  const buildArea = (data) => {
    const line = buildPath(data);
    const lastX = xScale(data.length - 1);
    const firstX = xScale(0);
    const baseY = SVG_H - PAD.bottom;
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Spinner size={36} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div>
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-sub">7-month spending overview</p>
      </div>

      {/* Stat Cards */}
      <div className="analytics-stats-grid">
        <StatCard
          label="Avg Monthly Spend"
          value={fmt(stats.avgSpend)}
          sub="Last 7 months"
          icon={<PiTrendDownFill size={22} color="#FF6B35" />}
        />
        <StatCard
          label="Best Month"
          value={fmt(stats.bestMonth.value)}
          sub={stats.bestMonth.label}
          icon={<PiTrophyFill size={22} color="#F59E0B" />}
        />
        <StatCard
          label="Worst Month"
          value={fmt(stats.worstMonth.value)}
          sub={stats.worstMonth.label}
          icon={<PiSmileyXEyesFill size={22} color="#E53E3E" />}
        />
        <StatCard
          label="Avg Savings Rate"
          value={`${stats.avgSavingsRate}%`}
          sub="vs income"
          icon={<PiPiggyBankFill size={22} color="#ffffff" />}
          accent
        />
      </div>

      {/* Income vs Spending Chart */}
      <Card>
        {/* Chart Header + Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h3 className="analytics-card-title" style={{ margin: 0 }}>
            Income vs Spending
          </h3>

          {/* Toggle Buttons */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-alt)",
              borderRadius: 10,
              padding: 4,
              gap: 4,
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => setChartView("bar")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                transition: "all 0.2s ease",
                background:
                  chartView === "bar" ? "var(--surface)" : "transparent",
                color:
                  chartView === "bar" ? "var(--text)" : "var(--text-muted)",
                boxShadow: chartView === "bar" ? "var(--shadow-sm)" : "none",
              }}
            >
              <PiChartBarFill
                size={16}
                color={
                  chartView === "bar" ? "var(--green)" : "var(--text-muted)"
                }
              />
              Bar
            </button>
            <button
              onClick={() => setChartView("line")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                transition: "all 0.2s ease",
                background:
                  chartView === "line" ? "var(--surface)" : "transparent",
                color:
                  chartView === "line" ? "var(--text)" : "var(--text-muted)",
                boxShadow: chartView === "line" ? "var(--shadow-sm)" : "none",
              }}
            >
              <PiChartLineUpFill
                size={16}
                color={
                  chartView === "line" ? "var(--green)" : "var(--text-muted)"
                }
              />
              Line
            </button>
          </div>
        </div>

        {/* ── BAR VIEW ── */}
        {chartView === "bar" && (
          <div style={{ position: "relative" }}>
            <div className="bar-chart-wrapper">
              {months.map((m, i) => (
                <div
                  key={m}
                  className="bar-chart-col"
                  onMouseEnter={(e) =>
                    setTooltip({
                      index: i,
                      x: e.currentTarget.offsetLeft,
                      y: 0,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  {/* Tooltip */}
                  {tooltip?.index === i && (
                    <div
                      style={{
                        position: "absolute",
                        top: -100,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--navy)",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        zIndex: 10,
                        boxShadow: "var(--shadow-lg)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        animation: "fadeIn 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: 6,
                          color: "var(--green)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {m}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: "var(--green-mid)",
                            flexShrink: 0,
                          }}
                        />
                        Income:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {fmt(incomeData[i])}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: "var(--orange)",
                            flexShrink: 0,
                          }}
                        />
                        Spent:{" "}
                        <span style={{ fontWeight: 600, color: "#FF6B35" }}>
                          {fmt(spendData[i])}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          borderTop: "1px solid rgba(255,255,255,0.1)",
                          paddingTop: 6,
                          marginTop: 2,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: "#7F77DD",
                            flexShrink: 0,
                          }}
                        />
                        Saved:{" "}
                        <span style={{ fontWeight: 600, color: "#B8B4FF" }}>
                          {fmt(incomeData[i] - spendData[i])}
                        </span>
                      </div>
                      {/* Arrow */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -6,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 12,
                          height: 6,
                          background: "var(--navy)",
                          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                        }}
                      />
                    </div>
                  )}

                  <div className="bar-chart-bars">
                    <div
                      className="bar-income"
                      style={{
                        height: `${(incomeData[i] / maxVal) * 100}%`,
                        opacity: tooltip && tooltip.index !== i ? 0.4 : 1,
                        transition: "all 0.2s ease",
                      }}
                    />
                    <div
                      className="bar-spend"
                      style={{
                        height: `${(spendData[i] / maxVal) * 100}%`,
                        opacity: tooltip && tooltip.index !== i ? 0.4 : 1,
                        transition: "all 0.2s ease",
                      }}
                    />
                  </div>
                  <span className="bar-label">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LINE VIEW ── */}
        {chartView === "line" && (
          <div style={{ position: "relative" }}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              style={{ width: "100%", height: 180, overflow: "visible" }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = PAD.top + pct * (SVG_H - PAD.top - PAD.bottom);
                return (
                  <g key={pct}>
                    <line
                      x1={PAD.left}
                      y1={y}
                      x2={SVG_W - PAD.right}
                      y2={y}
                      stroke="var(--border)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={PAD.left - 6}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="var(--text-light)"
                    >
                      {fmt(maxVal * (1 - pct))}
                    </text>
                  </g>
                );
              })}

              {/* Area fills */}
              <path d={buildArea(incomeData)} fill="url(#incomeGrad)" />
              <path d={buildArea(spendData)} fill="url(#spendGrad)" />

              {/* Lines */}
              <path
                d={buildPath(incomeData)}
                fill="none"
                stroke="#00C896"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildPath(spendData)}
                fill="none"
                stroke="#FF6B35"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* X-axis labels + hover dots */}
              {months.map((m, i) => (
                <g key={m}>
                  {/* Month label */}
                  <text
                    x={xScale(i)}
                    y={SVG_H - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--text-muted)"
                  >
                    {m}
                  </text>

                  {/* Income dot */}
                  <circle
                    cx={xScale(i)}
                    cy={yScale(incomeData[i])}
                    r={tooltip?.index === i ? 6 : 4}
                    fill="#00C896"
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ transition: "r 0.15s ease" }}
                  />

                  {/* Spend dot */}
                  <circle
                    cx={xScale(i)}
                    cy={yScale(spendData[i])}
                    r={tooltip?.index === i ? 6 : 4}
                    fill="#FF6B35"
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ transition: "r 0.15s ease" }}
                  />

                  {/* Invisible hover area */}
                  <rect
                    x={xScale(i) - 30}
                    y={PAD.top}
                    width={60}
                    height={SVG_H - PAD.top - PAD.bottom}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setTooltip({ index: i })}
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {/* Tooltip */}
                  {tooltip?.index === i && (
                    <g>
                      {/* Vertical line */}
                      <line
                        x1={xScale(i)}
                        y1={PAD.top}
                        x2={xScale(i)}
                        y2={SVG_H - PAD.bottom}
                        stroke="var(--border)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      {/* Tooltip box */}
                      <foreignObject
                        x={
                          xScale(i) > SVG_W / 2
                            ? xScale(i) - 145
                            : xScale(i) + 12
                        }
                        y={PAD.top}
                        width="135"
                        height="90"
                      >
                        <div
                          style={{
                            background: "var(--navy)",
                            color: "#fff",
                            borderRadius: 10,
                            padding: "10px 12px",
                            fontSize: 12,
                            boxShadow: "var(--shadow-lg)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: 6,
                              color: "var(--green)",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {m}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: "#00C896",
                                flexShrink: 0,
                              }}
                            />
                            <span>
                              Income: <b>{fmt(incomeData[i])}</b>
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: "#FF6B35",
                                flexShrink: 0,
                              }}
                            />
                            <span>
                              Spent:{" "}
                              <b style={{ color: "#FF6B35" }}>
                                {fmt(spendData[i])}
                              </b>
                            </span>
                          </div>
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot-green" />
            <span className="legend-text">Income</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot-orange" />
            <span className="legend-text">Spending</span>
          </div>
        </div>
      </Card>

      {/* Savings Trend */}
      <Card>
        <h3 className="analytics-card-title-sm">Monthly Savings Trend</h3>
        <div className="savings-trend-wrapper">
          {months.map((m, i) => {
            const saved = (incomeData[i] || 0) - (spendData[i] || 0);
            const pct = incomeData[i] > 0 ? (saved / incomeData[i]) * 100 : 0;
            return (
              <div
                key={m}
                className="savings-trend-col"
                style={{ position: "relative", cursor: "pointer" }}
                onMouseEnter={() => setTooltip({ index: i })}
                onMouseLeave={() => setTooltip(null)}
              >
                {tooltip?.index === i && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "110%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--navy)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "var(--shadow-lg)",
                      animation: "fadeIn 0.15s ease",
                    }}
                  >
                    <b style={{ color: "var(--green)" }}>{m}:</b> Saved{" "}
                    {fmt(saved)} ({Math.round(pct)}%)
                  </div>
                )}
                <span className="savings-trend-pct">{Math.round(pct)}%</span>
                <div
                  className="savings-trend-bar"
                  style={{
                    height: `${Math.min(100, Math.max(0, pct * 2))}%`,
                    background: `hsl(${160 + pct}, 60%, 50%)`,
                    opacity: tooltip && tooltip.index !== i ? 0.4 : 1,
                    transition: "all 0.2s ease",
                  }}
                />
                <span className="savings-trend-label">{m}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
