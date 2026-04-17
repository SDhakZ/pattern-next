import {
  M01,
  M02,
  M03,
  M04,
  M05,
  M06,
  M07,
  M08,
  M09,
  M10,
  M11,
  M12,
} from "./newMotifs.jsx";
import {
  M01_PNG,
  M02_PNG,
  M03_PNG,
  M04_PNG,
  M05_PNG,
  M06_PNG,
  M07_PNG,
  M08_PNG,
  M09_PNG,
  M10_PNG,
  M11_PNG,
  M12_PNG,
} from "./pngMotifs.jsx";
import {
  MOTIF_META,
  MOTIF_COUNT,
  MOTIF_NAMES,
  SELECTABLE_MOTIF_NAMES,
  MOTIF_LAYER_COUNTS,
} from "./motifMeta.js";

export const MOTIFS = [
  M01,
  M02,
  M03,
  M04,
  M05,
  M06,
  M07,
  M08,
  M09,
  M10,
  M11,
  M12,
];

const PREVIEW_COMPONENTS = [
  M01_PNG,
  M02_PNG,
  M03_PNG,
  M04_PNG,
  M05_PNG,
  M06_PNG,
  M07_PNG,
  M08_PNG,
  M09_PNG,
  M10_PNG,
  M11_PNG,
  M12_PNG,
];

export const SELECTABLE_MOTIFS = MOTIF_META.map((meta) => ({
  ...meta,
  component: MOTIFS[meta.id],
  previewComponent: PREVIEW_COMPONENTS[meta.id],
}));

export { MOTIF_NAMES, SELECTABLE_MOTIF_NAMES, MOTIF_COUNT, MOTIF_LAYER_COUNTS };
