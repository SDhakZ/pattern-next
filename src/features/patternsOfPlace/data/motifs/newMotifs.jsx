import { memo, useId, useMemo } from "react";

import {
  svg1Raw,
  svg2Raw,
  svg3Raw,
  svg4Raw,
  svg5Raw,
  svg6Raw,
  svg7Raw,
  svg8Raw,
  svg9Raw,
  svg10Raw,
  svg11Raw,
  svg12Raw,
} from "./rawSvgStrings.js";

function resolveSvgText(svg) {
  if (typeof svg === "string") return svg;
  if (svg && typeof svg === "object" && typeof svg.default === "string") {
    return svg.default;
  }
  return "";
}

function stripXmlHeader(svg) {
  return resolveSvgText(svg).replace(/^<\?xml[\s\S]*?\?>\s*/i, "");
}

function replaceColors(svg, colorMap) {
  const entries = Object.entries(colorMap);
  // Phase 1: replace each source color with a unique placeholder so that
  // a target color that matches another source color isn't double-replaced.
  const placeholders = entries.map((_, i) => `__C${i}__`);
  let result = stripXmlHeader(svg);
  entries.forEach(([source], i) => {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), placeholders[i]);
  });
  // Phase 2: swap placeholders for the actual target colors.
  entries.forEach(([, target], i) => {
    result = result.replace(new RegExp(placeholders[i], "g"), target);
  });
  return result;
}

function stripOuterSvg(svg) {
  return svg.replace(/^<svg\b[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
}

function withSize(svg, size, blend) {
  return svg.replace(
    /<svg\b([^>]*)>/i,
    `<svg$1 width="${size}" height="${size}" style="mix-blend-mode:${blend};display:block;">`,
  );
}

function sanitizeScopeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function scopeSvgClasses(markup, scopeId) {
  if (!markup) return markup;
  const prefix = `sc_${sanitizeScopeId(scopeId)}_`;

  let scoped = markup.replace(/\.cls-([a-zA-Z0-9_-]+)/g, `.${prefix}cls-$1`);
  scoped = scoped.replace(/class="([^"]+)"/g, (_, classValue) => {
    const nextClassValue = classValue
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => (name.startsWith("cls-") ? `${prefix}${name}` : name))
      .join(" ");

    return `class="${nextClassValue}"`;
  });

  return scoped;
}

function createMotifComponent(svg, colorMap, defaultPalette = []) {
  return memo(function Motif({ c = defaultPalette, size, blend = "normal" }) {
    const scopeId = useId();
    const palette = c.length >= 5 ? c : defaultPalette;
    const filled = useMemo(
      () =>
        replaceColors(
          svg,
          Object.fromEntries(
            Object.entries(colorMap).map(([source, index]) => [
              source,
              palette[index] ?? palette[0] ?? source,
            ]),
          ),
        ),
      [palette],
    );
    const scopedFilled = useMemo(
      () => scopeSvgClasses(filled, scopeId),
      [filled, scopeId],
    );
    return (
      <div
        style={{
          width: size,
          height: size,
          overflow: "hidden",
          display: "block",
        }}
        dangerouslySetInnerHTML={{
          __html: withSize(scopedFilled, size, blend),
        }}
      />
    );
  });
}

// SVG 1 — 3 layers: dark purple + black + brown gold
const M01_DEFAULT = ["#311463", "#080503", "#c98f2c", "#311463", "#080503"];
export const M01 = createMotifComponent(
  svg1Raw,
  { "#311463": 0, "#080503": 1, "#c98f2c": 2 },
  M01_DEFAULT,
);

// SVG 2 — 4 layers: medium purple + near-black + bright gold + dark navy
const M02_DEFAULT = ["#4a1d7a", "#110c19", "#ffb10a", "#2b024d", "#4a1d7a"];
export const M02 = createMotifComponent(
  svg2Raw,
  { "#4a1d7a": 0, "#110c19": 1, "#ffb10a": 2, "#2b024d": 3 },
  M02_DEFAULT,
);

// SVG 3 — 2 main layers: gold + dark purple (gold stroke unified with fill)
const M03_DEFAULT = ["#f7b118", "#260e50", "#f7b118", "#260e50", "#f7b118"];
export const M03 = createMotifComponent(
  svg3Raw,
  { "#f7b118": 0, "#ffad14": 0, "#260e50": 1 },
  M03_DEFAULT,
);

// SVG 4 — 2 layers: gold fill + dark purple stroke
const M04_DEFAULT = ["#fbad19", "#281050", "#fbad19", "#281050", "#fbad19"];
export const M04 = createMotifComponent(
  svg4Raw,
  { "#fbad19": 0, "#281050": 1 },
  M04_DEFAULT,
);

// SVG 5 — 4 layers: gold + 3 purple shades
const M05_DEFAULT = ["#fbb112", "#260e50", "#3f1970", "#58256c", "#fbb112"];
export const M05 = createMotifComponent(
  svg5Raw,
  { "#fbb112": 0, "#260e50": 1, "#3f1970": 2, "#58256c": 3 },
  M05_DEFAULT,
);

// SVG 6 — 3 layers: gold fill + dark gold stroke + dark purple
const M06_DEFAULT = ["#fbad19", "#db8321", "#260e50", "#fbad19", "#db8321"];
export const M06 = createMotifComponent(
  svg6Raw,
  { "#fbad19": 0, "#db8321": 1, "#260e50": 2 },
  M06_DEFAULT,
);

// SVG 7 — 3 layers: bright gold + light gold + dark purple
const M07_DEFAULT = ["#f9b115", "#e8c048", "#260e50", "#f9b115", "#260e50"];
export const M07 = createMotifComponent(
  svg7Raw,
  { "#f9b115": 0, "#e8c048": 1, "#260e50": 2 },
  M07_DEFAULT,
);

// SVG 8 — 2 layers: gold fill + dark gold stroke
const M08_DEFAULT = ["#fbad19", "#db8321", "#fbad19", "#db8321", "#fbad19"];
export const M08 = createMotifComponent(
  svg8Raw,
  { "#fbad19": 0, "#db8321": 1 },
  M08_DEFAULT,
);

// SVG 9 — 3 layers: gold + dark purple + medium purple
const M09_DEFAULT = ["#fdb10e", "#260e50", "#692e68", "#fdb10e", "#260e50"];
export const M09 = createMotifComponent(
  svg9Raw,
  { "#fdb10e": 0, "#260e50": 1, "#692e68": 2 },
  M09_DEFAULT,
);

// SVG 10 — 4 layers: bright yellow + dark gold + medium purple + dark navy
const M10_DEFAULT = ["#ffb700", "#fea228", "#2c007f", "#1a0061", "#ffb700"];
export const M10 = createMotifComponent(
  svg10Raw,
  { "#ffb700": 0, "#fea228": 1, "#2c007f": 2, "#1a0061": 3 },
  M10_DEFAULT,
);

// SVG 11 — 5 layers: bright yellow + dark gold + medium purple + darkest purple + dark navy
const M11_DEFAULT = ["#ffb700", "#fea228", "#2c007f", "#260e50", "#1a0061"];
export const M11 = createMotifComponent(
  svg11Raw,
  { "#ffb700": 0, "#fea228": 1, "#2c007f": 2, "#260e50": 3, "#1a0061": 4 },
  M11_DEFAULT,
);

// SVG 12 — 5 layers: orange + gold stroke + dark purple + medium purple + warm gold stroke
const M12_DEFAULT = ["#ff910b", "#ffad00", "#260e50", "#2c007f", "#edad23"];
export const M12 = createMotifComponent(
  svg12Raw,
  { "#ff910b": 0, "#ffad00": 1, "#260e50": 2, "#2c007f": 3, "#edad23": 4 },
  M12_DEFAULT,
);

export function renderNewMotifMarkup(id, palette) {
  const variants = {
    0: {
      svg: svg1Raw,
      map: { "#311463": 0, "#080503": 1, "#c98f2c": 2 },
      def: M01_DEFAULT,
    },
    1: {
      svg: svg2Raw,
      map: { "#4a1d7a": 0, "#110c19": 1, "#ffb10a": 2, "#2b024d": 3 },
      def: M02_DEFAULT,
    },
    2: {
      svg: svg3Raw,
      map: { "#f7b118": 0, "#ffad14": 0, "#260e50": 1 },
      def: M03_DEFAULT,
    },
    3: { svg: svg4Raw, map: { "#fbad19": 0, "#281050": 1 }, def: M04_DEFAULT },
    4: {
      svg: svg5Raw,
      map: { "#fbb112": 0, "#260e50": 1, "#3f1970": 2, "#58256c": 3 },
      def: M05_DEFAULT,
    },
    5: {
      svg: svg6Raw,
      map: { "#fbad19": 0, "#db8321": 1, "#260e50": 2 },
      def: M06_DEFAULT,
    },
    6: {
      svg: svg7Raw,
      map: { "#f9b115": 0, "#e8c048": 1, "#260e50": 2 },
      def: M07_DEFAULT,
    },
    7: { svg: svg8Raw, map: { "#fbad19": 0, "#db8321": 1 }, def: M08_DEFAULT },
    8: {
      svg: svg9Raw,
      map: { "#fdb10e": 0, "#260e50": 1, "#692e68": 2 },
      def: M09_DEFAULT,
    },
    9: {
      svg: svg10Raw,
      map: { "#ffb700": 0, "#fea228": 1, "#2c007f": 2, "#1a0061": 3 },
      def: M10_DEFAULT,
    },
    10: {
      svg: svg11Raw,
      map: {
        "#ffb700": 0,
        "#fea228": 1,
        "#2c007f": 2,
        "#260e50": 3,
        "#1a0061": 4,
      },
      def: M11_DEFAULT,
    },
    11: {
      svg: svg12Raw,
      map: {
        "#ff910b": 0,
        "#ffad00": 1,
        "#260e50": 2,
        "#2c007f": 3,
        "#edad23": 4,
      },
      def: M12_DEFAULT,
    },
  };

  const entry = variants[id];
  if (!entry) return null;

  const basePalette = palette && palette.length >= 5 ? palette : entry.def;
  const replaced = replaceColors(
    entry.svg,
    Object.fromEntries(
      Object.entries(entry.map).map(([source, index]) => [
        source,
        basePalette[index] ?? basePalette[0] ?? source,
      ]),
    ),
  );
  return stripOuterSvg(replaced);
}
