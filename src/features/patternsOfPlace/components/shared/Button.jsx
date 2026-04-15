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

  const base = {
    fontFamily: FONT,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 4,
    transition: "all 0.12s cubic-bezier(.4,0,.2,1)",
    opacity: disabled ? 0.4 : 1,
    border: "none",
    outline: "none",
    fontSize: small ? 13 : 14,
    padding: small ? "10px 16px" : "14px 24px",
    letterSpacing: "0.02em",
    minHeight: small ? 44 : 48,
    minWidth: small ? 44 : 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "manipulation",
    WebkitUserSelect: "none",
    userSelect: "none",
    transform: active && !disabled ? "scale(0.98)" : "scale(1)",
    boxShadow:
      active && !disabled && variant === "primary"
        ? "inset 0 2px 4px rgba(0,0,0,0.2)"
        : "none",
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
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => !disabled && setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => !disabled && setActive(true)}
      onTouchEnd={() => setActive(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
