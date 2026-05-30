import { useState } from "react";

import {
  PiEyeLight,
  PiEyeClosedLight,
  PiWarningCircleLight,
} from "react-icons/pi";

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  style = {},
  ...props
}) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    borderRadius: "var(--radius-md)",
    transition: "all var(--transition)",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    width: fullWidth ? "100%" : "auto",
    border: "1.5px solid transparent",
  };
  const sizes = {
    sm: { padding: "8px 16px", fontSize: 13 },
    md: { padding: "11px 22px", fontSize: 15 },
    lg: { padding: "14px 28px", fontSize: 16 },
  };
  const variants = {
    primary: {
      background: "var(--green)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(0,200,150,0.35)",
    },
    secondary: {
      background: "var(--surface)",
      color: "var(--text)",
      border: "1.5px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(229,62,62,0.3)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1.5px solid transparent",
    },
    outline: {
      background: "transparent",
      color: "var(--green-dark)",
      border: "1.5px solid var(--green)",
    },
  };

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {loading ? (
        <Spinner
          size={16}
          color={variant === "secondary" ? "var(--green)" : "#fff"}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({
  label,
  error,
  hint,
  icon,
  type = "text",
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "var(--green-dark)" : "var(--text-light)",
              fontSize: 18,
              lineHeight: 1,
              transition: "color var(--transition)",
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={type === "password" ? (showPwd ? "text" : "password") : type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: icon ? "12px 14px 12px 44px" : "12px 14px",
            paddingRight: type === "password" ? 44 : 14,
            background: focused ? "var(--surface)" : "var(--surface-alt)",
            border: `1.5px solid ${error ? "var(--danger)" : focused ? "var(--green)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            color: "var(--text)",
            fontSize: 15,
            transition: "all var(--transition)",
            boxShadow: focused ? "0 0 0 3px rgba(0,200,150,0.12)" : "none",
          }}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-light)",
              fontSize: 18,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showPwd ? (
              <PiEyeClosedLight size={20} />
            ) : (
              <PiEyeLight size={20} />
            )}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "var(--danger)" }}>
          <PiWarningCircleLight size={16} /> {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 12, color: "var(--text-light)" }}>{hint}</span>
      )}
    </div>
  );
};

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && (
      <label
        style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}
      >
        {label}
      </label>
    )}
    <select
      style={{
        width: "100%",
        padding: "12px 14px",
        background: "var(--surface-alt)",
        border: `1.5px solid ${error ? "var(--danger)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        color: "var(--text)",
        fontSize: 15,
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235A7A74' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
      {...props}
    >
      {children}
    </select>
    {error && (
      <span style={{ fontSize: 12, color: "var(--danger)" }}>⚠ {error}</span>
    )}
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {}, hover = false, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "var(--surface)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      padding: "20px 24px",
      transition: hover ? "all var(--transition)" : undefined,
      cursor: onClick ? "pointer" : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24, color = "var(--green)" }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }}
  />
);

// ─── Alert ────────────────────────────────────────────────────────────────────
export const Alert = ({ type = "error", message }) => {
  if (!message) return null;
  const styles = {
    error: {
      bg: "var(--danger-light)",
      color: "var(--danger)",
      border: "#FEB2B2",
      icon: "⚠️",
    },
    success: {
      bg: "var(--green-light)",
      color: "var(--green-dark)",
      border: "var(--green-mid)",
      icon: "✅",
    },
    warning: {
      bg: "var(--warning-light)",
      color: "#92400E",
      border: "#FDE68A",
      icon: "⚠️",
    },
  };
  const s = styles[type];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontSize: 14,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <span>{s.icon}</span>
      <span>{message}</span>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent = false,
  style = {},
}) => (
  <div
    style={{
      background: accent ? "var(--green)" : "var(--surface)",
      borderRadius: "var(--radius-lg)",
      border: accent ? "none" : "1px solid var(--border)",
      boxShadow: accent ? "0 8px 24px rgba(0,200,150,0.3)" : "var(--shadow-sm)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: accent ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
          background: accent ? "rgba(255,255,255,0.2)" : "var(--surface-alt)",
        }}
      >
        {icon}
      </span>
    </div>
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 26,
        fontWeight: 700,
        color: accent ? "#fff" : "var(--text)",
      }}
    >
      {value}
    </div>
    {sub && (
      <div
        style={{
          fontSize: 12,
          color: accent ? "rgba(255,255,255,0.7)" : "var(--text-light)",
        }}
      >
        {sub}
      </div>
    )}
  </div>
);
