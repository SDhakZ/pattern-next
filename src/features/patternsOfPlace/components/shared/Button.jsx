import { useState } from "react";
import { FONT } from "../../data/constants/themes.js";

/**
 * Touch-optimized button component for kiosk interface.
 * Larger touch targets, no hover lift (not appropriate for touch).
 */
export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  small,
  style,
  T,
}) {
  const [active, setActive] = useState(false);
  const [focused, setFocused] = useState(false);
  const isNav = variant === "nav";

  const base = {
    fontFamily: FONT,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 999,
    transition:
      "transform 0.12s cubic-bezier(.4,0,.2,1), box-shadow 0.14s ease, opacity 0.12s ease",
    opacity: disabled ? 0.55 : 1,
    border: "none",
    outline: "none",
    fontSize: isNav ? 22 : small ? 13 : 14,
    padding: isNav ? "8px 28px" : small ? "10px 18px" : "14px 26px",
    letterSpacing: isNav ? "0.05em" : "0.02em",
    minHeight: isNav ? 44 : small ? 44 : 48,
    minWidth: isNav ? 132 : small ? 44 : 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "manipulation",
    WebkitUserSelect: "none",
    userSelect: "none",
    transform: active && !disabled ? "scale(0.985)" : "scale(1)",
    boxShadow: isNav
      ? disabled
        ? "0 0 0 1px rgba(184,137,18,0.2), inset 0 -6px 14px rgba(0,0,0,0.42)"
        : active
          ? "0 0 0 1px rgba(214,170,67,0.28), 0 0 12px rgba(214,170,67,0.42), inset 0 2px 8px rgba(0,0,0,0.52)"
          : "0 0 0 1px rgba(184,137,18,0.2), 0 0 18px rgba(184,137,18,0.34), inset 0 -8px 16px rgba(0,0,0,0.44)"
      : active && !disabled
        ? "inset 0 2px 6px rgba(0,0,0,0.22)"
        : variant === "primary"
          ? "0 4px 12px rgba(0,0,0,0.2)"
          : "0 2px 8px rgba(0,0,0,0.08)",
    ...(focused && !disabled
      ? {
          boxShadow: isNav
            ? "0 0 0 2px rgba(237,188,71,0.42), 0 0 20px rgba(214,170,67,0.52), inset 0 -8px 16px rgba(0,0,0,0.44)"
            : `0 0 0 3px ${T.gold}66, 0 4px 12px rgba(0,0,0,0.2)`,
        }
      : {}),
  };

  const variants = {
    primary: { background: T.gold, color: T.bg },
    secondary: {
      background: T.surf2,
      color: T.mut,
      border: `1px solid ${T.brd}`,
    },
    ghost: {
      background: "transparent",
      color: T.mut,
      border: `1px solid ${T.brd}`,
    },
    danger: {
      background: "transparent",
      color: "#e05a5a",
      border: "1px solid #e05a5a",
    },
    blue: { background: "#1565c0", color: "#ffffff" },
    nav: {
      background: "rgba(3,7,16,0.88)",
      color: "#d7b450",
      border: "1px solid rgba(184,137,18,0.9)",
      fontWeight: 400,
      textTransform: "uppercase",
      fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => !disabled && setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => !disabled && setActive(true)}
      onTouchEnd={() => setActive(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
