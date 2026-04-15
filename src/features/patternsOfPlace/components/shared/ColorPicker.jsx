import { useEffect, useMemo, useRef, useState } from "react";
import { ColorHarmonyWheel } from "./ColorHarmonyWheel.jsx";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";

const COLOR_LABELS = ["Dark", "Mid", "Accent", "Alt", "Light"];
const PALETTE_SIZE = 5;

const PICKER_MODES = [
  { id: "harmony", label: "Harmony" },
  { id: "manual", label: "Manual" },
];

const HARMONY_MODES = [
  { id: "complementary", label: "Complementary" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "split", label: "Split" },
  { id: "tetradic", label: "Tetradic" },
  { id: "monochrome", label: "Monochrome" },
];

const HARMONY_PRESETS = {
  complementary: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 180, sat: 0.78, light: 0.52 },
    { offset: 0, sat: 0.52, light: 0.7 },
    { offset: 180, sat: 0.52, light: 0.68 },
    { offset: 0, sat: 0.42, light: 0.32 },
  ],
  analogous: [
    { offset: 0, sat: 0.8, light: 0.52 },
    { offset: -28, sat: 0.72, light: 0.56 },
    { offset: 28, sat: 0.72, light: 0.56 },
    { offset: -56, sat: 0.58, light: 0.68 },
    { offset: 56, sat: 0.58, light: 0.4 },
  ],
  triadic: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 120, sat: 0.76, light: 0.54 },
    { offset: 240, sat: 0.76, light: 0.54 },
    { offset: 30, sat: 0.54, light: 0.7 },
    { offset: 210, sat: 0.54, light: 0.38 },
  ],
  split: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 150, sat: 0.78, light: 0.54 },
    { offset: 210, sat: 0.78, light: 0.54 },
    { offset: 35, sat: 0.46, light: 0.7 },
    { offset: 315, sat: 0.46, light: 0.38 },
  ],
  tetradic: [
    { offset: 0, sat: 0.82, light: 0.52 },
    { offset: 90, sat: 0.76, light: 0.54 },
    { offset: 180, sat: 0.76, light: 0.54 },
    { offset: 270, sat: 0.76, light: 0.54 },
    { offset: 45, sat: 0.5, light: 0.68 },
  ],
  monochrome: [
    { offset: 0, sat: 0.8, light: 0.52 },
    { offset: 0, sat: 0.62, light: 0.64 },
    { offset: 0, sat: 0.48, light: 0.42 },
    { offset: 0, sat: 0.34, light: 0.74 },
    { offset: 0, sat: 0.24, light: 0.3 },
  ],
};

const MANUAL_PALETTES = [
  {
    id: "earth",
    label: "Earth",
    colors: ["#2f241d", "#7a4d35", "#c47a52", "#e7c39a", "#f2eadf"],
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: ["#40152a", "#7c274f", "#c04c69", "#f08a68", "#ffd5a8"],
  },
  {
    id: "garden",
    label: "Garden",
    colors: ["#173427", "#2f6b4f", "#61a278", "#a8d4a0", "#eef8df"],
  },
  {
    id: "ink",
    label: "Ink",
    colors: ["#111827", "#334155", "#64748b", "#cbd5e1", "#f8fafc"],
  },
  {
    id: "spice",
    label: "Spice",
    colors: ["#301913", "#7b3b2b", "#c26c42", "#e2a66f", "#f5e8cf"],
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function wrapHue(value) {
  return ((value % 360) + 360) % 360;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : value;
  const int = Number.parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
    hue *= 60;
  }

  return { h: wrapHue(hue), s: saturation, l: lightness };
}

function hslToRgb(h, s, l) {
  const hue = wrapHue(h) / 360;
  const saturation = clamp(s, 0, 1);
  const lightness = clamp(l, 0, 1);

  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p, q, t) => {
    let nextT = t;
    if (nextT < 0) nextT += 1;
    if (nextT > 1) nextT -= 1;
    if (nextT < 1 / 6) return p + (q - p) * 6 * nextT;
    if (nextT < 1 / 2) return q;
    if (nextT < 2 / 3) return p + (q - p) * (2 / 3 - nextT) * 6;
    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hue) * 255),
    b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
  };
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function buildPalette(baseHex, mode) {
  const base = hexToHsl(baseHex);
  const preset = HARMONY_PRESETS[mode] ?? HARMONY_PRESETS.complementary;

  return preset.map((item) => {
    const hue = wrapHue(base.h + item.offset);
    return hslToHex(hue, clamp(item.sat, 0, 1), clamp(item.light, 0, 1));
  });
}

function normalizePalette(colors, fallbackPalette = []) {
  const safeFallback =
    Array.isArray(fallbackPalette) && fallbackPalette.length > 0
      ? fallbackPalette
      : ["#3a2417", "#6e4630", "#9a6650", "#c89a78", "#efd9c5"];
  const next = Array.isArray(colors)
    ? colors.filter(Boolean).slice(0, PALETTE_SIZE)
    : [];

  while (next.length < PALETTE_SIZE) {
    next.push(safeFallback[next.length] ?? safeFallback[0]);
  }

  return next;
}

function wheelMarker(color, index, count) {
  const { h, s } = hexToHsl(color);
  const angle = ((h - 90) * Math.PI) / 180;
  const radius = 34 + s * 54;
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;
  const isBase = index === 0;
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${isBase ? 1.15 : 1})`,
    boxShadow: isBase
      ? `0 0 0 2px rgba(0,0,0,0.55), 0 0 0 5px ${color}55`
      : `0 0 0 1px rgba(0,0,0,0.45)`,
    zIndex: count - index,
  };
}

export function ColorPicker({ label, colors, onChange, T }) {
  const wheelRef = useRef(null);
  const manualColorsRef = useRef(
    Array.isArray(colors) && colors.length > 0 ? [...colors] : null,
  );
  const [pickerMode, setPickerMode] = useState("harmony");
  const [harmonyMode, setHarmonyMode] = useState("complementary");
  const [dragging, setDragging] = useState(false);

  const harmonyFallback = buildPalette("#3a2417", harmonyMode);
  const currentColors = normalizePalette(
    Array.isArray(colors) && colors.length > 0 ? colors : harmonyFallback,
    harmonyFallback,
  );

  const baseHsl = useMemo(
    () => hexToHsl(currentColors[0] ?? "#3a2417"),
    [currentColors],
  );

  useEffect(() => {
    if (!dragging || pickerMode !== "harmony") return;

    const handleMove = (event) => {
      const rect = wheelRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const radius = rect.width / 2;
      const distance = Math.min(Math.sqrt(x * x + y * y), radius);
      const angle = (Math.atan2(y, x) * 180) / Math.PI;
      const saturation = clamp(distance / radius, 0, 1);
      const nextBase = hslToHex(
        wrapHue(angle + 90),
        saturation * 0.92 + 0.08,
        0.52,
      );
      onChange(buildPalette(nextBase, harmonyMode));
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, harmonyMode, onChange, pickerMode]);

  const commitColors = (nextColors) => {
    const normalized = normalizePalette(nextColors, currentColors);
    if (pickerMode === "manual") {
      manualColorsRef.current = [...normalized];
    }
    onChange(normalized);
  };

  const setPaletteMode = (nextMode) => {
    setHarmonyMode(nextMode);
    onChange(buildPalette(currentColors[0] ?? "#3a2417", nextMode));
  };

  const switchToHarmony = () => {
    setPickerMode("harmony");
    onChange(buildPalette(currentColors[0] ?? "#3a2417", harmonyMode));
  };

  const switchToManual = () => {
    setPickerMode("manual");
    const nextManualColors =
      manualColorsRef.current && manualColorsRef.current.length > 0
        ? manualColorsRef.current
        : currentColors;
    const normalized = normalizePalette(nextManualColors, currentColors);
    manualColorsRef.current = [...normalized];
    onChange(normalized);
  };

  const updateColor = (index, value) => {
    const next = [...currentColors];
    next[index] = value;
    commitColors(next);
  };

  const applyWheelBase = (event) => {
    const rect = wheelRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width / 2;
    const distance = Math.min(Math.sqrt(x * x + y * y), radius);
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    const saturation = clamp(distance / radius, 0, 1);
    const nextBase = hslToHex(
      wrapHue(angle + 90),
      saturation * 0.92 + 0.08,
      0.52,
    );
    onChange(buildPalette(nextBase, harmonyMode));
    setDragging(true);
  };

  const applyManualPalette = (palette) => {
    setPickerMode("manual");
    const normalized = normalizePalette(palette, currentColors);
    manualColorsRef.current = [...normalized];
    onChange(normalized);
  };

  const colorList = currentColors.length > 0 ? currentColors : ["#3a2417"];

  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}
      >
        {PICKER_MODES.map((option) => {
          const isActive = option.id === pickerMode;
          return (
            <button
              key={option.id}
              type="button"
              onClick={
                option.id === "harmony" ? switchToHarmony : switchToManual
              }
              style={{
                padding: "4px 8px",
                fontSize: 10,
                fontFamily: FONT,
                fontWeight: 700,
                letterSpacing: "0.04em",
                borderRadius: 999,
                border: `1px solid ${isActive ? T.gold : T.brd}`,
                background: isActive ? T.surf2 : "transparent",
                color: isActive ? T.gold : T.mut,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {pickerMode === "harmony" ? (
        <ColorHarmonyWheel colors={colorList} onChange={onChange} T={T} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontSize: 10, color: T.mut }}>
            Manual mode uses 5 motif colors. Tap a slot to update it.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
              gap: 6,
            }}
          >
            {MANUAL_PALETTES.map((palette) => (
              (() => {
                const normalized = normalizePalette(palette.colors, currentColors);
                const isSelected = normalized.every(
                  (color, index) =>
                    color.toLowerCase() === currentColors[index].toLowerCase(),
                );
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => applyManualPalette(palette.colors)}
                    style={{
                      padding: 0,
                      borderRadius: 10,
                      border: `1px solid ${isSelected ? T.gold : T.brd}`,
                      background: isSelected ? `${T.gold}1a` : T.surf1,
                      cursor: "pointer",
                      overflow: "hidden",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", height: 24 }}>
                      {normalized.map((color, index) => (
                        <div key={`${palette.id}-${index}`} style={{ flex: 1, background: color }} />
                      ))}
                    </div>
                    <div
                      style={{
                        padding: "6px 8px 7px",
                        fontSize: 10,
                        fontFamily: FONT,
                        fontWeight: 700,
                        color: isSelected ? T.gold : T.txt,
                      }}
                    >
                      {palette.label}
                    </div>
                  </button>
                );
              })()
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {currentColors.map((color, index) => (
              <div
                key={`slot-${index}`}
                style={{
                  border: `1px solid ${T.brd}`,
                  borderRadius: 10,
                  background: T.surf1,
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: T.txt,
                    fontWeight: 700,
                    minWidth: 54,
                  }}
                >
                  {COLOR_LABELS[index] ?? `Color ${index + 1}`}
                </span>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => updateColor(index, event.target.value)}
                  style={{
                    width: 42,
                    height: 32,
                    border: `1px solid ${T.brd}`,
                    borderRadius: 7,
                    cursor: "pointer",
                    padding: 2,
                    background: "transparent",
                  }}
                />
                <input
                  value={color}
                  onChange={(event) => updateColor(index, event.target.value)}
                  spellCheck={false}
                  style={{
                    width: "100%",
                    padding: "8px 9px",
                    borderRadius: 8,
                    border: `1px solid ${T.brd}`,
                    background: T.surf2,
                    color: T.txt,
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
