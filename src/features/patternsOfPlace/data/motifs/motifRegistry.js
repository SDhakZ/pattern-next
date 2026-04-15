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
} from "./motifComponents.jsx";
import { M10, M11, M12, M13, M14, M15, M16 } from "./newMotifs.jsx";

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
  M13,
  M14,
  M15,
  M16,
];

export const SELECTABLE_MOTIFS = [
  {
    id: 0,
    name: "Ashtamangala",
    component: M01,
    previewColors: ["#f4a261", "#264653", "#2a9d8f", "#e9c46a", "#e76f51"],
  },
  {
    id: 2,
    name: "Vajra Cross",
    component: M03,
    previewColors: ["#8ecae6", "#219ebc", "#ffb703", "#fb8500", "#023047"],
  },
  {
    id: 3,
    name: "Dharma Wheel",
    component: M04,
    previewColors: ["#d8f3dc", "#95d5b2", "#52b788", "#40916c", "#1b4332"],
  },
  {
    id: 4,
    name: "Swastika",
    component: M05,
    previewColors: ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
  },
  {
    id: 5,
    name: "Suryachandra",
    component: M06,
    previewColors: ["#8338ec", "#3a86ff", "#ff006e", "#fb5607", "#ffbe0b"],
  },
  {
    id: 7,
    name: "Lotus",
    component: M08,
    previewColors: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff"],
  },
  {
    id: 8,
    name: "Vine Scroll",
    component: M09,
    previewColors: ["#f72585", "#b5179e", "#7209b7", "#560bad", "#480ca8"],
  },
  {
    id: 9,
    name: "New 1",
    component: M10,
    previewColors: ["#311463", "#18003b", "#110c19", "#ffad14", "#ffad14"],
  },
  {
    id: 10,
    name: "New 2",
    component: M11,
    previewColors: ["#e24b00", "#ffd468", "#ffa62c", "#ffa62c", "#ffd468"],
  },
  {
    id: 11,
    name: "New 3",
    component: M12,
    previewColors: ["#fdab34", "#f28521", "#f28521", "#fdab34", "#fdab34"],
  },
  {
    id: 12,
    name: "New 4",
    component: M13,
    previewColors: ["#662d91", "#2d2000", "#e8c048", "#e8c048", "#2d2000"],
  },
  {
    id: 13,
    name: "New 5",
    component: M14,
    previewColors: ["#b1142e", "#2d1da5", "#ffc900", "#ffc900", "#2d1da5"],
  },
  {
    id: 14,
    name: "New 6",
    component: M15,
    previewColors: ["#ffb700", "#1a0061", "#2c007f", "#f79800", "#fea228"],
  },
  {
    id: 15,
    name: "New 7",
    component: M16,
    previewColors: ["#ffb700", "#1a0061", "#2c007f", "#f79800", "#fea228"],
  },
];

export const MOTIF_NAMES = [
  "Ashtamangala",
  "Winged Form",
  "Vajra Cross",
  "Dharma Wheel",
  "Swastika",
  "Suryachandra",
  "Kumari",
  "Lotus",
  "Vine Scroll",
  "New 1",
  "New 2",
  "New 3",
  "New 4",
  "New 5",
  "New 6",
  "New 7",
];

export const SELECTABLE_MOTIF_NAMES = SELECTABLE_MOTIFS.map(
  (motif) => motif.name,
);

export const MOTIF_COUNT = MOTIFS.length;
