export const TEMPLATES = [
  { id: "concentric", name: "Concentric", clusters: [{ x: 0.5, y: 0.5, scale: 1 }] },
  { id: "diagonal", name: "Diagonal", clusters: [{ x: 0.28, y: 0.32, scale: 0.85 }, { x: 0.72, y: 0.68, scale: 0.85 }] },
  { id: "trinity", name: "Trinity", clusters: [{ x: 0.5, y: 0.26, scale: 0.75 }, { x: 0.27, y: 0.68, scale: 0.75 }, { x: 0.73, y: 0.68, scale: 0.75 }] },
  { id: "corners", name: "Corners", clusters: [{ x: 0.18, y: 0.24, scale: 0.6 }, { x: 0.82, y: 0.24, scale: 0.6 }, { x: 0.18, y: 0.76, scale: 0.6 }, { x: 0.82, y: 0.76, scale: 0.6 }] },
  { id: "frame", name: "Frame", clusters: [{ x: 0.5, y: 0.5, scale: 1 }, { x: 0.13, y: 0.5, scale: 0.4 }, { x: 0.87, y: 0.5, scale: 0.4 }, { x: 0.5, y: 0.18, scale: 0.4 }, { x: 0.5, y: 0.82, scale: 0.4 }] },
  { id: "custom", name: "Custom", clusters: [{ x: 0.5, y: 0.5, scale: 1 }] },
];

export const REVERSE_TEMPLATES = [
  { id: "default", name: "Default", rings: [] },
  {
    id: "luxury",
    name: "Luxury",
    rings: [
      { x: 0.15, y: 0.15, count: 8, radius: 60, motifId: 0, colors: ["#C9A646", "#9d5036", "#C9A646", "#9d5036", "#C9A646"] },
      { x: 0.25, y: 0.25, count: 6, radius: 40, motifId: 1, colors: ["#C9A646", "#9d5036", "#C9A646", "#9d5036", "#C9A646"] },
      { x: 0.35, y: 0.35, count: 5, radius: 30, motifId: 2, colors: ["#C9A646", "#9d5036", "#C9A646", "#9d5036", "#C9A646"] },
    ],
  },
];
