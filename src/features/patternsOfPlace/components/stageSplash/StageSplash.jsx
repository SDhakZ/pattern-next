import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE } from "../../app/actions.js";
import pngPOP from "../../../../assets/welcome.png";
import logo from "../../../../assets/Logo.png";

export function StageSplash() {
  const { dispatch } = usePatternsOfPlace();
  const bgSrc = typeof pngPOP === "string" ? pngPOP : pngPOP?.src;

  const start = () => dispatch({ type: SET_STAGE, stage: 5 });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "40px",
      }}
    >
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 700 }}>
          <img
            src={typeof logo === "string" ? logo : logo?.src}
            alt="Patterns of Place"
            style={{
              width: "min(78vw, 320px)",
              height: "auto",
              display: "block",
              margin: "0 auto 12px",
              filter: "drop-shadow(0 0 16px rgba(231,175,26,0.3))",
            }}
          />
          <p
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "clamp(24px, 2.2vw, 24px)",
              color: "rgba(242,222,176,0.92)",
              margin: "24px 0 0",
              lineHeight: 1.2,
            }}
          >
            A piece of Nepal, patterned by you.
          </p>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 202,
          transform: "translateX(-50%)",
        }}
      >
        <button
          onClick={start}
          className="beginButton"
          style={{
            minWidth: 150,
            padding: "12px 34px",
            borderRadius: 999,
            border: "1px solid rgba(233, 175, 24, 0.75)",
            background:
              "linear-gradient(180deg, rgba(22,22,22,0.88), rgba(8,8,8,0.94))",
            color: "#e7af1a",
            fontFamily: "DM Sans, system-ui, sans-serif",
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow:
              "0 0 0 1px rgba(233,175,24,0.25), 0 0 18px rgba(233,175,24,0.35), inset 0 -10px 24px rgba(0,0,0,0.5)",
          }}
        >
          Begin
        </button>
      </div>
      <style jsx>{`
        .beginButton {
          animation: beginPulse 2.8s ease-in-out infinite;
          transition:
            box-shadow 140ms ease,
            filter 140ms ease;
          will-change: box-shadow, filter;
        }

        .beginButton:hover {
          box-shadow:
            0 0 0 1px rgba(233, 175, 24, 0.3),
            0 0 26px rgba(233, 175, 24, 0.5),
            inset 0 -10px 24px rgba(0, 0, 0, 0.5);
          filter: brightness(1.06);
        }

        .beginButton:active {
          box-shadow:
            0 0 0 1px rgba(233, 175, 24, 0.2),
            0 0 14px rgba(233, 175, 24, 0.28),
            inset 0 -8px 18px rgba(0, 0, 0, 0.55);
          filter: brightness(0.98);
        }

        @keyframes beginPulse {
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

        @media (prefers-reduced-motion: reduce) {
          .beginButton {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
