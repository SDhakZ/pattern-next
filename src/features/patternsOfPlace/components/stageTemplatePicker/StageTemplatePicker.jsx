import { useState } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE, SELECT_TEMPLATE } from "../../app/actions.js";
import { Button } from "../shared/Button.jsx";
import { TEMPLATES } from "../../data/constants/templates.js";
import { FONT } from "../../data/constants/themes.js";
import concentricImg from "../../../../assets/layouts/centric.png";
import diagonalImg from "../../../../assets/layouts/diagnol.png";
import trinityImg from "../../../../assets/layouts/trinity.png";
import cornersImg from "../../../../assets/layouts/corners.png";
import bgImage from "../../../../assets/bg.png";

const LAYOUT_PREVIEWS = {
  concentric: concentricImg.src,
  diagonal: diagonalImg.src,
  trinity: trinityImg.src,
  corners: cornersImg.src,
};

const DISPLAY_LAYOUTS = ["concentric", "diagonal", "trinity", "corners"];
const DISPLAY_FONT =
  "'Cormorant Garamond', 'Palatino Linotype', 'Times New Roman', serif";

export function StageTemplatePicker() {
  const { state, dispatch } = usePatternsOfPlace();
  const [activeId, setActiveId] = useState(
    state.editor.selectedTemplate?.id ?? null,
  );
  const [hoveredId, setHoveredId] = useState(null);

  const choose = (tpl) => dispatch({ type: SELECT_TEMPLATE, template: tpl });
  const goBack = () => dispatch({ type: SET_STAGE, stage: 5 });
  const layoutOptions = DISPLAY_LAYOUTS.map((id) =>
    TEMPLATES.find((tpl) => tpl.id === id),
  ).filter(Boolean);

  const goNext = () => {
    const selectedTemplate = layoutOptions.find((tpl) => tpl.id === activeId);
    if (!selectedTemplate) return;
    choose(selectedTemplate);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `
          url(${bgImage.src})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Outfit, 'DM Sans', system-ui, sans-serif",
        padding: "40px 20px 84px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 45%, rgba(255, 158, 34, 0.2), rgba(0, 0, 0, 0) 40%)",
        }}
      />

      <h2
        style={{
          fontSize: "clamp(32px, 4vw, 42px)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: "#f0bc46",
          textTransform: "uppercase",
          margin: "0 0 36px",
          textAlign: "center",
          textShadow: "0 2px 14px rgba(167, 108, 0, 0.45)",
          fontFamily: DISPLAY_FONT,
          letterSpacing: "0em",
        }}
      >
        Pick Your Composition
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 18,
          maxWidth: 720,
          width: "100%",
          marginBottom: 34,
        }}
      >
        {layoutOptions.map((tpl) => {
          const selected = activeId === tpl.id;
          const highlighted = selected || hoveredId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => {
                setActiveId(tpl.id);
              }}
              onMouseEnter={() => setHoveredId(tpl.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                border: `1px solid ${highlighted ? "#efbe48" : "rgba(240, 188, 70, 0.45)"}`,
                background: "rgba(6, 6, 6, 0.85)",
                borderRadius: 8,
                padding: "14px 14px 10px",
                cursor: "pointer",
                textAlign: "center",
                transition:
                  "transform 0.16s ease-out, border-color 0.18s ease, box-shadow 0.18s ease",
                transform: highlighted ? "translateY(-2px)" : "translateY(0)",
                boxShadow: highlighted
                  ? "0 0 0 1px rgba(246, 196, 75, 0.45), 0 0 30px rgba(191, 121, 0, 0.38)"
                  : "0 0 0 1px rgba(0, 0, 0, 0.2)",
                touchAction: "manipulation",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1.9 / 1",
                  borderRadius: 4,
                  marginBottom: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(250, 201, 91, 0.2)",
                  background: "#050505",
                }}
              >
                <img
                  src={LAYOUT_PREVIEWS[tpl.id]}
                  alt={`${tpl.name} composition preview`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: "#d7a64a",
                  lineHeight: 1.15,
                  textShadow: highlighted
                    ? "0 0 12px rgba(181, 121, 18, 0.45)"
                    : "none",
                  fontFamily: "Outfit, 'DM Sans', system-ui, sans-serif",
                }}
              >
                {tpl.name}
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 60,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 999,
          background: "rgba(0, 0, 0, 0.82)",
          border: "1px solid rgba(184,137,18,0.45)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.55)",
          justifyContent: "center",
          flexWrap: "wrap",
          zIndex: 150,
        }}
      >
        <Button
          variant="nav"
          small={false}
          T={{
            gold: "#efbe48",
            bg: "#030303",
            surf2: "rgba(0, 0, 0, 0.74)",
            mut: "#e2b45f",
            brd: "rgba(239, 190, 72, 0.55)",
          }}
          onClick={goBack}
          style={{
            minWidth: 132,
            minHeight: 44,
          }}
        >
          Back
        </Button>

        <Button
          variant="nav"
          small={false}
          T={{
            gold: "#efbe48",
            bg: "#030303",
            surf2: "rgba(0, 0, 0, 0.74)",
            mut: activeId ? "#f3c970" : "#876322",
            brd: activeId
              ? "rgba(239, 190, 72, 0.7)"
              : "rgba(168, 118, 35, 0.5)",
          }}
          onClick={goNext}
          disabled={!activeId}
          style={{
            minWidth: 132,
            minHeight: 44,
            background: "rgba(227, 176, 59, 0.16)",
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
