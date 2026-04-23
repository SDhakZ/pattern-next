function hexToRgb(hex) {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function relativeLuminance({ r, g, b }) {
  return [r, g, b]
    .map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

/**
 * Returns line/text colors that are complementary and visible against bgColor.
 * brd  — used for lines and all text labels
 * dim  — used for secondary/branding text (slightly softer)
 */
export function getAdaptiveColors(bgColor, _T) {
  let rgb = { r: 17, g: 16, b: 16 };
  if (typeof bgColor === "string" && bgColor.startsWith("#")) {
    rgb = hexToRgb(bgColor);
  }

  const lum = relativeLuminance(rgb);
  const isDark = lum < 0.35;

  return isDark
    ? {
        brd: "rgba(255,255,255,0.52)",
        dim: "rgba(255,255,255,0.32)",
      }
    : {
        brd: "rgba(0,0,0,0.44)",
        dim: "rgba(0,0,0,0.26)",
      };
}
