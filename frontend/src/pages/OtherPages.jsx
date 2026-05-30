import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { Button, Input, Card, Alert, StatCard } from "../components/UI";
import { PiHandWaving } from "react-icons/pi";

// ─── AI Coach ────────────────────────────────────────────────────────────────
export function AICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Namaste ${user?.name?.split(" ")[0] || ""}! <PiHandWaving size={24} color="#EF9F27" />
 I'm your SpendCoach AI. I can help you understand your spending, set savings goals, and give personalized advice. What's on your mind today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS = [
    "How can I save more this month?",
    "Analyze my food spending",
    "Create a budget plan for me",
    "Tips to build an emergency fund",
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const newMessages = [...messages, { role: "user", text: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are SpendCoach, an AI-powered personal finance coach for India. You help users manage spending, save money, and achieve financial goals. The user is ${user?.name || "a user"} on the ${user?.plan || "Free"} plan. Keep responses concise, practical, and India-focused (use ₹, mention UPI, SIP, etc.). Use emojis sparingly for warmth.`,
          messages: newMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const reply =
        data.content?.[0]?.text ||
        "I'm having trouble responding right now. Please try again!";
      setMessages([...newMessages, { role: "assistant", text: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: "I'm temporarily unavailable. Please try again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "calc(100vh - 80px)",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          AI Finance Coach
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
          Powered by Claude AI · Ask anything about your finances
          {user?.plan === "Free" && (
            <span style={{ color: "var(--orange)", marginLeft: 8 }}>
              ⚡ Upgrade to Pro for unlimited access
            </span>
          )}
        </p>
      </div>

      {/* Chat window */}
      <Card
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                animation: "fadeIn 0.3s ease",
              }}
            >
              {m.role === "assistant" && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--green), var(--green-dark))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    marginRight: 10,
                    flexShrink: 0,
                    alignSelf: "flex-end",
                  }}
                >
                  🤖
                </div>
              )}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius:
                    m.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    m.role === "user" ? "var(--green)" : "var(--surface-alt)",
                  color: m.role === "user" ? "#fff" : "var(--text)",
                  fontSize: 14,
                  lineHeight: 1.65,
                  border:
                    m.role === "assistant" ? "1px solid var(--border)" : "none",
                }}
              >
                {m.text.split("\n").map((line, j) => (
                  <p key={j} style={{ margin: j > 0 ? "4px 0 0" : 0 }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--green-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🤖
              </div>
              <div
                style={{
                  background: "var(--surface-alt)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "12px 16px",
                }}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--text-light)",
                        animation: "pulse 1.2s ease infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length < 3 && (
          <div
            style={{
              padding: "0 24px 12px",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  fontSize: 13,
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all var(--transition)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          style={{
            padding: "12px 24px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 12,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask your AI coach anything…"
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1.5px solid var(--border)",
              background: "var(--surface-alt)",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              color: "var(--text)",
              outline: "none",
            }}
          />
          <Button
            onClick={() => send()}
            loading={loading}
            style={{ borderRadius: 12, padding: "12px 20px" }}
          >
            Send →
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export function Goals() {
  const goals = [
    {
      name: "Emergency Fund",
      target: 150000,
      current: 42000,
      icon: "🏦",
      color: "#3B82F6",
      deadline: "Dec 2025",
    },
    {
      name: "Vacation to Goa",
      target: 40000,
      current: 18500,
      icon: "🏖",
      color: "#FF6B35",
      deadline: "Mar 2026",
    },
    {
      name: "New Laptop",
      target: 80000,
      current: 25000,
      icon: "💻",
      color: "#7F77DD",
      deadline: "Jun 2026",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            Savings Goals
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            Track your progress toward financial milestones
          </p>
        </div>
        <Button icon="+" variant="primary">
          New Goal
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const remaining = g.target - g.current;
          return (
            <Card
              key={g.name}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 32,
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: g.color + "15",
                      borderRadius: 12,
                    }}
                  >
                    {g.icon}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {g.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-light)" }}>
                      Due {g.deadline}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    color: g.color,
                  }}
                >
                  {pct}%
                </span>
              </div>

              <div>
                <div
                  style={{
                    height: 8,
                    background: "var(--surface-alt)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: g.color,
                      borderRadius: 99,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)" }}>Saved</div>
                  <div style={{ fontWeight: 700, color: "var(--text)" }}>
                    ₹{g.current.toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--text-muted)" }}>Remaining</div>
                  <div style={{ fontWeight: 700, color: "var(--text)" }}>
                    ₹{remaining.toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "var(--text-muted)" }}>Target</div>
                  <div style={{ fontWeight: 700, color: "var(--text)" }}>
                    ₹{g.target.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Add new goal card */}
        <Card
          hover
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            minHeight: 180,
            border: "2px dashed var(--border)",
            background: "var(--surface-alt)",
            cursor: "pointer",
            boxShadow: "none",
          }}
        >
          <span style={{ fontSize: 32 }}>🎯</span>
          <span style={{ fontWeight: 600, color: "var(--text-muted)" }}>
            Add New Goal
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-light)",
              textAlign: "center",
            }}
          >
            Set a target and track your progress
          </span>
        </Card>
      </div>

      {/* Free plan restriction note */}
      <Card
        style={{
          background: "var(--orange-light)",
          border: "1px solid #FFD4C2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 32 }}>⚡</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                color: "var(--orange)",
                fontFamily: "var(--font-display)",
              }}
            >
              Free Plan: 3 Goals Limit
            </div>
            <div
              style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}
            >
              Upgrade to Pro for unlimited goals, auto-save micro-rounds, and
              AI-powered goal coaching.
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            style={{ background: "var(--orange)", flexShrink: 0 }}
          >
            Upgrade to Pro
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    monthlyIncome: user?.monthlyIncome || "",
    savingsGoal: user?.savingsGoal || "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const res = await authAPI.updateProfile({
        name: form.name,
        phone: form.phone,
        monthlyIncome: +form.monthlyIncome || 0,
        savingsGoal: +form.savingsGoal || 0,
      });
      updateUser(res.data.user);
      setAlert({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        animation: "fadeIn 0.4s ease",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          Profile & Settings
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
          Manage your account and preferences
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Avatar / plan card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "var(--green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                color: "var(--navy)",
                boxShadow: "0 8px 24px rgba(0,200,150,0.3)",
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {user?.email}
              </div>
            </div>
            <span
              className={`badge ${user?.plan === "Pro" ? "badge-green" : user?.plan === "Corporate" ? "badge-orange" : "badge-gray"}`}
            >
              {user?.plan || "Free"} Plan
            </span>
            <div style={{ fontSize: 12, color: "var(--text-light)" }}>
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : "2025"}
            </div>
          </Card>

          {user?.plan === "Free" && (
            <Card
              style={{
                background:
                  "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                border: "none",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 15,
                  }}
                >
                  Upgrade to Pro ⚡
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  AI coach, unlimited goals, budget alerts, bill negotiator
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--green)",
                  }}
                >
                  ₹199
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    /mo
                  </span>
                </div>
                <Button
                  fullWidth
                  style={{ background: "var(--green)", color: "var(--navy)" }}
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Edit form */}
        <Card>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            Personal Information
          </h3>
          {alert && (
            <div style={{ marginBottom: 16 }}>
              <Alert type={alert.type} message={alert.message} />
            </div>
          )}
          <form
            onSubmit={handleSave}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Input
              label="Full Name"
              value={form.name}
              onChange={set("name")}
              icon="👤"
            />
            <Input
              label="Email Address"
              value={user?.email || ""}
              disabled
              style={{ opacity: 0.6 }}
              icon="✉️"
              hint="Email cannot be changed"
            />
            <Input
              label="WhatsApp Number"
              value={form.phone}
              onChange={set("phone")}
              icon="📱"
              placeholder="98765 43210"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Input
                label="Monthly Income (₹)"
                type="number"
                value={form.monthlyIncome}
                onChange={set("monthlyIncome")}
                icon="💰"
                placeholder="e.g. 65000"
              />
              <Input
                label="Monthly Savings Goal (₹)"
                type="number"
                value={form.savingsGoal}
                onChange={set("savingsGoal")}
                icon="🎯"
                placeholder="e.g. 15000"
              />
            </div>
            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
              <Button type="button" variant="danger" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
