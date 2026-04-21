import { FONT, FONT_MONO } from "../../data/constants/themes.js";

export function SliderControl({
  label,
  val,
  min,
  max,
  step = 1,
  onChange,
  display,
  T,
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#a8a8a8",
            fontFamily: FONT,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#a8a8a8",
            fontFamily: FONT_MONO,
            fontWeight: 700,
          }}
        >
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) =>
          onChange(
            step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value),
          )
        }
        style={{
          width: "100%",
          accentColor: T.gold,
          cursor: "pointer",
          height: 8,
          borderRadius: 4,
          appearance: "slider-horizontal",
          WebkitAppearance: "slider-horizontal",
          touchAction: "manipulation",
        }}
      />
    </div>
  );
}
