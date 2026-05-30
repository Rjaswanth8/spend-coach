import { useAuth } from "../context/AuthContext";

import {
  RiDashboardLine,
  RiRobot2Line,
  RiMoneyRupeeCircleLine,
} from "react-icons/ri";
import { TbCreditCard, TbTargetArrow, TbChartBarPopular } from "react-icons/tb";
import { PiUserCircleThin } from "react-icons/pi";

const navItems = [
  { icon: <RiDashboardLine size={20} />, label: "Dashboard", id: "dashboard" },
  {
    icon: <TbCreditCard size={20} />,
    label: "Transactions",
    id: "transactions",
  },
  { icon: <TbTargetArrow size={20} />, label: "Goals", id: "goals" },
  {
    icon: <TbChartBarPopular size={20} />,
    label: "Analytics",
    id: "analytics",
  },
  { icon: <RiRobot2Line size={20} />, label: "AI Coach", id: "coach" },
  { icon: <PiUserCircleThin size={22} />, label: "Profile", id: "profile" },
];

export default function Sidebar({ active, onChange }) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={{ fontSize: 26 }}>💰</span>
        <span style={styles.logoText}>SpendCoach</span>
      </div>

      {/* Plan badge */}
      <div style={styles.planBadge}>
        <span
          style={{
            ...styles.planDot,
            background:
              user?.plan === "Pro"
                ? "var(--green)"
                : user?.plan === "Corporate"
                  ? "var(--orange)"
                  : "#A8C4BE",
          }}
        />
        <span style={styles.planText}>{user?.plan || "Free"} Plan</span>
        {user?.plan === "Free" && (
          <button style={styles.upgradeBtn}>Upgrade</button>
        )}
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              ...styles.navItem,
              ...(active === item.id ? styles.navItemActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
            {active === item.id && <span style={styles.navIndicator} />}
          </button>
        ))}
      </nav>

      {/* User section at bottom */}
      <div style={styles.userSection}>
        <div style={styles.avatar}>{initials}</div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name || "User"}</div>
          <div style={styles.userEmail}>{user?.email}</div>
        </div>
        <button onClick={logout} style={styles.logoutBtn} title="Sign out">
          ⎋
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    background: "var(--navy)",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    position: "sticky",
    top: 0,
    flexShrink: 0,
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "24px 20px 16px",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.3px",
  },
  planBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "0 12px 16px",
    padding: "8px 12px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  planDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  planText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    flex: 1,
    fontWeight: 500,
  },
  upgradeBtn: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--green)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontFamily: "var(--font-body)",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "0 12px",
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "var(--font-body)",
    width: "100%",
    textAlign: "left",
    transition: "all var(--transition)",
    position: "relative",
  },
  navItemActive: {
    background: "rgba(0,200,150,0.15)",
    color: "#fff",
    border: "1px solid rgba(0,200,150,0.25)",
  },
  navIcon: { fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 },
  navLabel: { flex: 1 },
  navIndicator: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "var(--green)",
    flexShrink: 0,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 16px 20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--green)",
    color: "var(--navy)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
    fontFamily: "var(--font-display)",
  },
  userInfo: { flex: 1, overflow: "hidden" },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#fff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userEmail: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    fontSize: 18,
    color: "rgba(255,255,255,0.35)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    transition: "color var(--transition)",
    flexShrink: 0,
  },
};
