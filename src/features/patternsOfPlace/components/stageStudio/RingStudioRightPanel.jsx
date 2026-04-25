import { Divider } from "../shared/Divider.jsx";
import { Label } from "../shared/Label.jsx";
import { SliderControl } from "../shared/SliderControl.jsx";
import { SET_BG_COLOR } from "../../app/actions.js";
import { PREVIEW_BG_OPTIONS } from "../../data/constants/backgrounds.js";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";
import { tangentSize } from "../../domain/geometry.js";
import { DEFAULT_COLORS } from "../../data/constants/defaults.js";
import { MOTIF_LAYER_COUNTS } from "../../data/motifs/motifRegistry.js";
import { ColorPicker } from "../shared/ColorPicker.jsx";

export function RingStudioRightPanel({
  T,
  bgColor,
  dispatch,
  activeCl,
  activeRing,
  ringSetupMode,
  updCl,
  updRing,
  compactLayout = false,
}) {
  const isPresetActive = activeRing.presetId != null;
  const layerCount = MOTIF_LAYER_COUNTS[activeRing.motifId] ?? 5;
  void ringSetupMode;

  return (
    <aside
      style={{
        width: compactLayout ? "100%" : 380,
        flexShrink: 0,
        height: compactLayout ? "auto" : "100%",
        maxHeight: compactLayout ? "46dvh" : "100%",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehavior: "contain",
        padding: compactLayout ? "14px 12px" : "24px 20px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(8, 8, 8, 0.58)",
        backdropFilter: "blur(10px) saturate(120%)",
        WebkitBackdropFilter: "blur(10px) saturate(120%)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
        borderTop: compactLayout ? `1px solid ${T.brd}` : "none",
      }}
    >
      <div
        style={{
          fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: T.gold,
          textTransform: "uppercase",
          marginBottom: 18,
          lineHeight: 1,
        }}
      >
        Cluster Control
      </div>
      <div style={{ marginTop: 4 }}>
        <SliderControl
          label="Scale"
          val={activeCl.scale}
          min={0.2}
          max={3}
          step={0.05}
          onChange={(v) => updCl("scale", v)}
          display={`${activeCl.scale.toFixed(2)}x`}
          T={T}
        />
        <SliderControl
          label="X-axis"
          val={Math.round(activeCl.x * 100)}
          min={0}
          max={100}
          onChange={(v) => updCl("x", v / 100)}
          display={`${Math.round(activeCl.x * 100)}%`}
          T={T}
        />
        <SliderControl
          label="Y-axis"
          val={Math.round(activeCl.y * 100)}
          min={0}
          max={100}
          onChange={(v) => updCl("y", v / 100)}
          display={`${Math.round(activeCl.y * 100)}%`}
          T={T}
        />
        <Divider T={T} />

        <div
          style={{
            fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: T.gold,
            textTransform: "uppercase",
            marginBottom: 18,
            lineHeight: 1,
          }}
        >
          Ring Control
        </div>
        <SliderControl
          label="Scale"
          val={activeRing.radius}
          min={20}
          max={400}
          step={2}
          onChange={(v) => updRing("radius", v)}
          display={`${(activeRing.radius / 100).toFixed(2)}x`}
          T={T}
        />
        <SliderControl
          label="Count"
          val={activeRing.count}
          min={2}
          max={150}
          onChange={(v) => updRing("count", v)}
          display={activeRing.count}
          T={T}
        />
      </div>
      <Divider T={T} />
      <div
        style={{
          fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: T.gold,
          textTransform: "uppercase",
          marginBottom: 18,
          lineHeight: 1,
        }}
      >
        Color Palette
      </div>
      {isPresetActive ? (
        <div
          style={{
            fontSize: 11,
            color: T.mut,
            padding: "8px 10px",
            background: "rgba(0,0,0,0.68)",
            borderRadius: 8,
            marginBottom: 8,
            border: `1px solid ${T.brd}`,
          }}
        >
          Ring colors are controlled by the selected preset.
        </div>
      ) : (
        <ColorPicker
          key={activeRing.id}
          label="Color Palette"
          colors={activeRing.colors ?? DEFAULT_COLORS}
          onChange={(c) => updRing("colors", c)}
          layerCount={layerCount}
          T={T}
        />
      )}

      <Divider T={T} />
      <div
        style={{
          fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: T.gold,
          textTransform: "uppercase",
          marginBottom: 18,
          lineHeight: 1,
        }}
      >
        Background
      </div>
      <div
        style={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 6,
          }}
        >
          {PREVIEW_BG_OPTIONS.map((option) => {
            const isActive = bgColor === option.color;
            return (
              <button
                key={option.color}
                type="button"
                onClick={() =>
                  dispatch({ type: SET_BG_COLOR, color: option.color })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  minHeight: 36,
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: `1px solid ${isActive ? T.gold : T.brd}`,
                  background: isActive
                    ? "rgba(227, 176, 59, 0.16)"
                    : "rgba(0, 0, 0, 0.72)",
                  color: isActive ? T.gold : T.txt,
                  cursor: "pointer",
                  boxShadow: isActive
                    ? "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.18)"
                    : "none",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: option.color,
                      border: "1px solid rgba(255,255,255,0.24)",
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: FONT,
                      fontWeight: 700,
                    }}
                  >
                    {option.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="color"
            value={bgColor}
            onChange={(e) =>
              dispatch({ type: SET_BG_COLOR, color: e.target.value })
            }
            aria-label="Card background color"
            style={{
              width: "100%",
              height: 34,
              border: `1px solid ${T.brd}`,
              borderRadius: 8,
              cursor: "pointer",
              padding: 2,
              background: "transparent",
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontFamily: FONT_MONO,
              color: T.mut,
              minWidth: 70,
              textAlign: "center",
              padding: "7px 8px",
              borderRadius: 8,
              border: `1px solid ${T.brd}`,
              background: "rgba(0, 0, 0, 0.72)",
            }}
          >
            {bgColor.toUpperCase()}
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: SET_BG_COLOR, color: "#101010" })}
            style={{
              padding: "7px 10px",
              fontSize: 10,
              fontFamily: FONT,
              fontWeight: 700,
              borderRadius: 6,
              border: `1px solid ${T.brd}`,
              background: "rgba(0, 0, 0, 0.72)",
              color: T.txt,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}
