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
    fontSize: small ? 13 : 14,
    padding: small ? "10px 18px" : "14px 26px",
    letterSpacing: "0.02em",
    minHeight: small ? 44 : 48,
    minWidth: small ? 44 : 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "manipulation",
    WebkitUserSelect: "none",
    userSelect: "none",
    transform: active && !disabled ? "scale(0.985)" : "scale(1)",
    boxShadow:
      active && !disabled
        ? "inset 0 2px 6px rgba(0,0,0,0.22)"
        : variant === "primary"
          ? "0 4px 12px rgba(0,0,0,0.2)"
          : "0 2px 8px rgba(0,0,0,0.08)",
    ...(focused && !disabled
      ? { boxShadow: `0 0 0 3px ${T.gold}66, 0 4px 12px rgba(0,0,0,0.2)` }
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
