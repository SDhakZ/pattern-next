import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE, SET_THEME } from "../../app/actions.js";
import { Button } from "../shared/Button.jsx";
import { FONT } from "../../data/constants/themes.js";

export function StageSplash() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const { theme } = state.ui;

  const toggleTheme = () =>
    dispatch({ type: SET_THEME, theme: theme === "dark" ? "light" : "dark" });
  const start = () => dispatch({ type: SET_STAGE, stage: 1 });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        position: "relative",
        padding: "40px",
      }}
    >
      <Button
        variant="secondary"
        small={false}
        T={T}
        onClick={toggleTheme}
        style={{ position: "fixed", top: 28, right: 28, zIndex: 100 }}
      >
        {theme === "dark" ? "☀ Light" : "◐ Dark"}
      </Button>

      <div style={{ textAlign: "center", maxWidth: 600 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.3em",
            color: T.mut,
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Step 1 / 4
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.4em",
            color: T.gold,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Generative Postcard Kiosk
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: T.txt,
            margin: "0 0 16px",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          Patterns
          <br />
          of Place
        </h1>
        <p
          style={{
            fontSize: 18,
            color: T.mut,
            marginBottom: 56,
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          Compose a keepsake from Newari architectural motifs
        </p>
        <Button
          onClick={start}
          variant="primary"
          small={false}
          T={T}
          style={{
            fontSize: 16,
            padding: "16px 32px",
            minHeight: 56,
            margin: "0 auto",
          }}
        >
          Begin →
        </Button>
      </div>
    </div>
  );
}
