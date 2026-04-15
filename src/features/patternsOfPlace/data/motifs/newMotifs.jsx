import { memo } from "react";

import {
  n1SvgRaw,
  n2SvgRaw,
  n3SvgRaw,
  n4SvgRaw,
  n5SvgRaw,
  n6SvgRaw,
  n7SvgRaw,
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
  return Object.entries(colorMap).reduce((output, [source, target]) => {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return output.replace(new RegExp(escaped, "gi"), target);
  }, stripXmlHeader(svg));
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

function createMotifComponent(svg, colorMap, defaultPalette = []) {
  return memo(function Motif({ c = defaultPalette, size, blend = "normal" }) {
    const palette = c.length >= 5 ? c : defaultPalette;
    const filled = replaceColors(
      svg,
      Object.fromEntries(
        Object.entries(colorMap).map(([source, index]) => [
          source,
          palette[index] ?? palette[0] ?? source,
        ]),
      ),
    );
    return (
      <div
        style={{
          width: size,
          height: size,
          overflow: "hidden",
          display: "block",
        }}
        dangerouslySetInnerHTML={{ __html: withSize(filled, size, blend) }}
      />
    );
  });
}

const M10_DEFAULT = ["#311463", "#18003b", "#110c19", "#ffad14", "#ffad14"];
const M11_DEFAULT = ["#e24b00", "#ffd468", "#ffa62c", "#ffa62c", "#ffd468"];
const M12_DEFAULT = ["#fdab34", "#f28521", "#f28521", "#fdab34", "#fdab34"];
const M13_DEFAULT = ["#662d91", "#2d2000", "#e8c048", "#e8c048", "#2d2000"];
const M14_DEFAULT = ["#b1142e", "#2d1da5", "#ffc900", "#ffc900", "#2d1da5"];
const M15_DEFAULT = ["#ffb700", "#1a0061", "#2c007f", "#f79800", "#fea228"];
const M16_DEFAULT = ["#ffb700", "#1a0061", "#2c007f", "#f79800", "#fea228"];

export const M10 = createMotifComponent(
  n1SvgRaw,
  {
    "#311463": 0,
    "#18003b": 1,
    "#110c19": 2,
    "#ffad14": 3,
  },
  M10_DEFAULT,
);
export const M11 = createMotifComponent(
  n2SvgRaw,
  {
    "#e24b00": 0,
    "#ffd468": 1,
    "#ffa62c": 2,
  },
  M11_DEFAULT,
);
export const M12 = createMotifComponent(
  n3SvgRaw,
  {
    "#fdab34": 0,
    "#f28521": 1,
  },
  M12_DEFAULT,
);
export const M13 = createMotifComponent(
  n4SvgRaw,
  {
    "#662d91": 0,
    "#2d2000": 1,
    "#e8c048": 2,
  },
  M13_DEFAULT,
);
export const M14 = createMotifComponent(
  n5SvgRaw,
  {
    "#b1142e": 0,
    "#2d1da5": 1,
    "#ffc900": 2,
  },
  M14_DEFAULT,
);
export const M15 = createMotifComponent(
  n6SvgRaw,
  {
    "#ffb700": 0,
    "#1a0061": 1,
    "#2c007f": 2,
    "#f79800": 3,
    "#fa0": 3,
    "#fea228": 4,
  },
  M15_DEFAULT,
);
export const M16 = createMotifComponent(
  n7SvgRaw,
  {
    "#ffb700": 0,
    "#1a0061": 1,
    "#2c007f": 2,
    "#f79800": 3,
    "#fa0": 3,
    "#fea228": 4,
  },
  M16_DEFAULT,
);

export function renderNewMotifMarkup(id, palette) {
  const variants = {
    9: {
      svg: n1SvgRaw,
      map: { "#311463": 0, "#18003b": 1, "#110c19": 2, "#ffad14": 3 },
    },
    10: { svg: n2SvgRaw, map: { "#e24b00": 0, "#ffd468": 1, "#ffa62c": 2 } },
    11: { svg: n3SvgRaw, map: { "#fdab34": 0, "#f28521": 1 } },
    12: { svg: n4SvgRaw, map: { "#662d91": 0, "#2d2000": 1, "#e8c048": 2 } },
    13: { svg: n5SvgRaw, map: { "#b1142e": 0, "#2d1da5": 1, "#ffc900": 2 } },
    14: {
      svg: n6SvgRaw,
      map: {
        "#ffb700": 0,
        "#1a0061": 1,
        "#2c007f": 2,
        "#f79800": 3,
        "#fa0": 3,
        "#fea228": 4,
      },
    },
    15: {
      svg: n7SvgRaw,
      map: {
        "#ffb700": 0,
        "#1a0061": 1,
        "#2c007f": 2,
        "#f79800": 3,
        "#fa0": 3,
        "#fea228": 4,
      },
    },
  };

  const entry = variants[id];
  if (!entry) return null;

  const basePalette =
    palette && palette.length >= 5 ? palette : (palette ?? M15_DEFAULT);
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
