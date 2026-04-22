export const MOTIF_META = [
  {
    id: 0,
    name: "Motif 1",
    previewColors: ["#311463", "#080503", "#c98f2c", "#311463", "#080503"],
    layerCount: 3,
  },
  {
    id: 1,
    name: "Motif 2",
    previewColors: ["#4a1d7a", "#110c19", "#ffb10a", "#2b024d", "#4a1d7a"],
    layerCount: 4,
  },
  {
    id: 2,
    name: "Motif 3",
    previewColors: ["#f7b118", "#260e50", "#f7b118", "#260e50", "#f7b118"],
    layerCount: 2,
  },
  {
    id: 3,
    name: "Motif 4",
    previewColors: ["#fbad19", "#281050", "#fbad19", "#281050", "#fbad19"],
    layerCount: 2,
  },
  {
    id: 4,
    name: "Motif 5",
    previewColors: ["#fbb112", "#260e50", "#3f1970", "#58256c", "#fbb112"],
    layerCount: 4,
  },
  {
    id: 5,
    name: "Motif 6",
    previewColors: ["#fbad19", "#db8321", "#260e50", "#fbad19", "#db8321"],
    layerCount: 3,
  },
  {
    id: 6,
    name: "Motif 7",
    previewColors: ["#f9b115", "#e8c048", "#260e50", "#f9b115", "#260e50"],
    layerCount: 3,
  },
  {
    id: 7,
    name: "Motif 8",
    previewColors: ["#fbad19", "#db8321", "#fbad19", "#db8321", "#fbad19"],
    layerCount: 2,
  },
  {
    id: 8,
    name: "Motif 9",
    previewColors: ["#fdb10e", "#260e50", "#692e68", "#fdb10e", "#260e50"],
    layerCount: 3,
  },
  {
    id: 9,
    name: "Motif 10",
    previewColors: ["#ffb700", "#fea228", "#2c007f", "#1a0061", "#ffb700"],
    layerCount: 4,
  },
  {
    id: 10,
    name: "Motif 11",
    previewColors: ["#ffb700", "#fea228", "#2c007f", "#260e50", "#1a0061"],
    layerCount: 5,
  },
  {
    id: 11,
    name: "Motif 12",
    previewColors: ["#ff910b", "#ffad00", "#260e50", "#2c007f", "#edad23"],
    layerCount: 5,
  },
];

export const MOTIF_COUNT = MOTIF_META.length;
export const MOTIF_NAMES = MOTIF_META.map((motif) => motif.name);
export const SELECTABLE_MOTIF_NAMES = MOTIF_NAMES;
export const MOTIF_LAYER_COUNTS = MOTIF_META.map((motif) => motif.layerCount);
