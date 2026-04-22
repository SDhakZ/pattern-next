/**
 * GlowButton Component
 * Reusable button with pulsing golden glow effect for navigation
 */
export function GlowButton({
  children,
  onClick,
  disabled = false,
  variant = "nav", // "nav" or "glow"
  className = "",
  ...props
}) {
  const baseClass =
    "rounded-full transition-all duration-140 cursor-pointer font-semibold uppercase";

  const variantClasses = {
    nav: "min-w-[132px] min-h-[44px] px-7 py-2 bg-[rgba(3,7,16,0.88)] text-[#d7b450] border border-[rgba(184,137,18,0.9)] font-['Outfit','DM_Sans',system-ui,sans-serif] text-[22px] font-normal tracking-[0.05em]",
    glow: "min-w-[132px] min-h-[44px] px-7 py-2 bg-gradient-to-b from-[rgba(22,22,22,0.88)] to-[rgba(8,8,8,0.94)] text-[#e7af1a] border border-[rgba(233,175,24,0.75)] font-['DM_Sans',system-ui,sans-serif] text-[22px] tracking-[0.08em]",
  };

  const disabledClass = disabled ? "opacity-55 cursor-not-allowed" : "";

  const glowStyle =
    variant === "glow"
      ? {
          boxShadow: `
      0 0 0 1px rgba(233, 175, 24, 0.25),
      0 0 18px rgba(233, 175, 24, 0.35),
      inset 0 -10px 24px rgba(0, 0, 0, 0.5)
    `,
          animation: "glowPulse 2.8s ease-in-out infinite",
          willChange: "box-shadow, filter",
        }
      : {};

  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClass} ${variantClasses[variant]} ${disabledClass} ${className}`}
        style={glowStyle}
        {...props}
      >
        {children}
      </button>

      {variant === "glow" && (
        <style>{`
          @keyframes glowPulse {
            0%,
            100% {
              box-shadow:
                0 0 0 1px rgba(233, 175, 24, 0.22),
                0 0 18px rgba(233, 175, 24, 0.32),
                inset 0 -10px 24px rgba(0, 0, 0, 0.5);
            }

            50% {
              box-shadow:
                0 0 0 1px rgba(233, 175, 24, 0.34),
                0 0 28px rgba(233, 175, 24, 0.5),
                inset 0 -10px 24px rgba(0, 0, 0, 0.5);
            }
          }

          button:hover:not(:disabled) {
            box-shadow:
              0 0 0 1px rgba(233, 175, 24, 0.3),
              0 0 26px rgba(233, 175, 24, 0.5),
              inset 0 -10px 24px rgba(0, 0, 0, 0.5) !important;
            filter: brightness(1.06);
          }

          button:active:not(:disabled) {
            box-shadow:
              0 0 0 1px rgba(233, 175, 24, 0.2),
              0 0 14px rgba(233, 175, 24, 0.28),
              inset 0 -8px 18px rgba(0, 0, 0, 0.55) !important;
            filter: brightness(0.98);
          }

          @media (prefers-reduced-motion: reduce) {
            button {
              animation: none !important;
            }
          }
        `}</style>
      )}
    </>
  );
}
