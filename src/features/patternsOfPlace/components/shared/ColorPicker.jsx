import { useEffect, useMemo, useState } from "react";
import { ColorHarmonyWheel } from "./ColorHarmonyWheel.jsx";
import { FONT } from "../../data/constants/themes.js";

const PALETTE_SIZE = 5;

const PICKER_MODES = [
  { id: "manual", label: "Manual" },
  { id: "harmony", label: "Harmony" },
];

const HARMONY_MODES = [
  { id: "complementary", label: "Complementary" },
  { id: "analogous", label: "Analogous" },
  { id: "triadic", label: "Triadic" },
  { id: "split", label: "Split" },
  { id: "tetradic", label: "Tetradic" },
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
};

const DEFAULT_HARMONY_MODE = "complementary";

const MANUAL_PALETTES = [
  {
    id: "earth",
    label: "Earth",
    colors: ["#1B1B1B", "#8B5E34", "#D9A441", "#2F6B5F", "#F4E9D8"],
  },
  {
    id: "sunset",
    label: "Sunset",
    colors: ["#1E0F2E", "#E94560", "#FF7B00", "#FFD166", "#2EC4B6"],
  },
  {
    id: "garden",
    label: "Garden",
    colors: ["#0B1F14", "#2E7D32", "#A7D129", "#FFD166", "#F6FFF8"],
  },
  {
    id: "ink",
    label: "Ink",
    colors: ["#0A0A0A", "#1D4ED8", "#22D3EE", "#F8FAFC", "#F43F5E"],
  },
  {
    id: "spice",
    label: "Spice",
    colors: ["#2B0A03", "#9A3412", "#F59E0B", "#FDE68A", "#4C1D95"],
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

export function ColorPicker({ label, colors, onChange, layerCount = 5, T }) {
  const [pickerMode, setPickerMode] = useState("manual");
  const [selectedManualPaletteId, setSelectedManualPaletteId] = useState(null);

  const harmonyFallback = buildPalette("#3a2417", DEFAULT_HARMONY_MODE);
  const currentColors = normalizePalette(
    Array.isArray(colors) && colors.length > 0 ? colors : harmonyFallback,
    harmonyFallback,
  );

  const colorSignature = useMemo(
    () => currentColors.map((color) => color.toLowerCase()).join("|"),
    [currentColors],
  );

  useEffect(() => {
    const matchingPalette = MANUAL_PALETTES.find((palette) => {
      const normalized = normalizePalette(palette.colors, currentColors);
      return normalized.every(
        (color, index) =>
          color.toLowerCase() === currentColors[index].toLowerCase(),
      );
    });
    setSelectedManualPaletteId(matchingPalette?.id ?? null);
  }, [colorSignature]);

  const commitColors = (nextColors) => {
    const normalized = normalizePalette(nextColors, currentColors);
    if (pickerMode === "manual") {
      setSelectedManualPaletteId(null);
    }
    onChange(normalized);
  };

  const switchToHarmony = () => {
    setPickerMode("harmony");
  };

  const switchToManual = () => {
    setPickerMode("manual");
  };

  const updateColor = (index, value) => {
    const next = [...currentColors];
    next[index] = value;
    commitColors(next);
  };

  const applyManualPalette = (paletteId, palette) => {
    setPickerMode("manual");
    const normalized = normalizePalette(palette, currentColors);
    setSelectedManualPaletteId(paletteId);
    onChange(normalized);
  };

  const colorList = currentColors.length > 0 ? currentColors : ["#3a2417"];

  return (
    <div
      style={{
        marginBottom: 10,
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${T.brd}`,
        background: T.surf1,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          marginBottom: 10,
        }}
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
                minHeight: 38,
                padding: "7px 7px 4px 7px",
                fontSize: 14,
                textTransform: "uppercase",
                fontWeight: 500,
                fontFamily: FONT,
                letterSpacing: "0.04em",
                borderRadius: 10,
                border: `1px solid ${isActive ? T.gold : T.brd}`,
                background: isActive ? `${T.gold}1a` : T.surf2,
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
        <div
          style={{
            border: `1px solid ${T.brd}`,
            borderRadius: 12,
            background: T.surf2,
            padding: 8,
          }}
        >
          <ColorHarmonyWheel
            colors={colorList}
            onChange={onChange}
            layerCount={layerCount}
            T={T}
            emitOnInteractionOnly
          />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {currentColors.slice(0, layerCount).map((color, index) => (
              <div
                key={`slot-${index}`}
                style={{
                  border: `1px solid ${T.brd}`,
                  borderRadius: 12,
                  background: T.surf1,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  position: "relative",
                  minHeight: 50,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: color,
                      border: `1px solid ${T.brd}`,
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: T.txt,
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {color.toUpperCase()}
                  </span>
                </div>

                <input
                  type="color"
                  value={color}
                  onChange={(event) => updateColor(index, event.target.value)}
                  aria-label={`Select color ${color.toUpperCase()}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    border: "none",
                  }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(104px, 1fr))",
              gap: 8,
            }}
          >
            {MANUAL_PALETTES.map((palette) =>
              (() => {
                const normalized = normalizePalette(
                  palette.colors,
                  currentColors,
                );
                const isSelected = selectedManualPaletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() =>
                      applyManualPalette(palette.id, palette.colors)
                    }
                    style={{
                      padding: 0,
                      borderRadius: 12,
                      border: `1px solid ${isSelected ? T.gold : T.brd}`,
                      background: isSelected ? `${T.gold}1a` : T.surf1,
                      cursor: "pointer",
                      overflow: "hidden",
                      textAlign: "left",
                      boxShadow: isSelected ? `0 0 0 1px ${T.gold}55` : "none",
                    }}
                  >
                    <div style={{ display: "flex", height: 26 }}>
                      {normalized.map((color, index) => (
                        <div
                          key={`${palette.id}-${index}`}
                          style={{ flex: 1, background: color }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        padding: "7px 9px 8px",
                        fontSize: 11,
                        fontFamily: FONT,
                        fontWeight: 700,
                        color: isSelected ? T.gold : T.txt,
                      }}
                    >
                      {palette.label}
                    </div>
                  </button>
                );
              })(),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
