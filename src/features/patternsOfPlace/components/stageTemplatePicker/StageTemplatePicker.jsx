import { useState } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE, SELECT_TEMPLATE } from "../../app/actions.js";
import { Button } from "../shared/Button.jsx";
import { TEMPLATES } from "../../data/constants/templates.js";
import { FONT } from "../../data/constants/themes.js";

export function StageTemplatePicker() {
  const { dispatch, T } = usePatternsOfPlace();
  const [activeId, setActiveId] = useState(null);

  const choose = (tpl) => dispatch({ type: SELECT_TEMPLATE, template: tpl });
  const goBack = () => dispatch({ type: SET_STAGE, stage: 0 });

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
        padding: "48px",
        position: "relative",
      }}
    >
      <Button
        variant="secondary"
        small={false}
        T={T}
        onClick={goBack}
        style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
        }}
      >
        ← Back
      </Button>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.3em",
          color: T.gold,
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Step 1 / 3
      </div>
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: T.txt,
          marginBottom: 12,
        }}
      >
        Choose Layout
      </h2>
      <p
        style={{
          fontSize: 16,
          color: T.mut,
          marginBottom: 48,
          lineHeight: 1.6,
        }}
      >
        Pick a starting arrangement for your clusters
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 20,
          maxWidth: 900,
          width: "100%",
        }}
      >
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => {
              setActiveId(tpl.id);
              choose(tpl);
            }}
            onMouseEnter={() => setActiveId(tpl.id)}
            onMouseLeave={() => setActiveId(null)}
            style={{
              border: `2px solid ${activeId === tpl.id ? T.gold : T.brd}`,
              background: activeId === tpl.id ? T.surf2 : T.surf,
              borderRadius: 12,
              padding: "20px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.18s ease-out",
              transform: activeId === tpl.id ? "scale(1.02)" : "scale(1)",
              minHeight: 240,
              touchAction: "manipulation",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          >
            {/* Mini cluster diagram */}
            <div
              style={{
                width: "100%",
                height: 120,
                background: T.surf2,
                borderRadius: 8,
                marginBottom: 16,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {tpl.clusters.map((cl, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${cl.x * 100}%`,
                    top: `${cl.y * 100}%`,
                    width: cl.scale * 26,
                    height: cl.scale * 26,
                    borderRadius: "50%",
                    background: `${T.gold}88`,
                    transform: "translate(-50%,-50%)",
                    border: `2px solid ${T.gold}`,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.txt }}>
              {tpl.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
