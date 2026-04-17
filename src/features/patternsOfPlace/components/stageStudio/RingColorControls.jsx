import { DEFAULT_COLORS } from "../../data/constants/defaults.js";
import { FONT_MONO } from "../../data/constants/themes.js";

function normalizeColors(colors) {
  const next = Array.isArray(colors)
    ? colors.slice(0, DEFAULT_COLORS.length)
    : [];
  while (next.length < DEFAULT_COLORS.length) {
    next.push(DEFAULT_COLORS[next.length]);
  }
  return next;
}

export function RingColorControls({ colors, onChange, layerCount = 5, T }) {
  const safeColors = normalizeColors(colors);

  const updateColor = (index, value) => {
    const next = [...safeColors];
    next[index] = value;
    onChange(next);
  };

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${T.brd}`,
        background: T.surf1,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: T.mut,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Ring Colors
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {safeColors.slice(0, Math.max(1, layerCount)).map((color, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 72px",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${T.brd}`,
                background: color,
              }}
            />
            <input
              type="color"
              value={color}
              onChange={(event) => updateColor(index, event.target.value)}
              aria-label={`Ring color ${index + 1}`}
              style={{
                width: "100%",
                height: 28,
                border: `1px solid ${T.brd}`,
                borderRadius: 6,
                padding: 0,
                background: "transparent",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: T.mut,
                textTransform: "uppercase",
              }}
            >
              {color}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
