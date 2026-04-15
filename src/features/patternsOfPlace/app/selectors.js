// ─── UI selectors ─────────────────────────────────────────────────────────────
export const selectStage = s => s.ui.stage;
export const selectTheme = s => s.ui.theme;
export const selectPreviewSide = s => s.ui.previewSide;
export const selectRingSetupMode = s => s.ui.ringSetupMode;

// ─── Library ──────────────────────────────────────────────────────────────────
export const selectLibrary = s => s.library;

// ─── Editor ───────────────────────────────────────────────────────────────────
export const selectLayers = s => s.editor.layers;
export const selectBgColor = s => s.editor.bgColor;
export const selectClusters = s => s.editor.clusters;

export const selectActiveLayer = s => {
  const { activeLayerId } = s.ui;
  const { layers } = s.editor;
  return layers.find(l => l.id === activeLayerId) ?? layers[0];
};

export const selectActiveCluster = s => {
  const { activeClusterId } = s.ui;
  const { clusters } = s.editor;
  return clusters.find(c => c.id === activeClusterId) ?? clusters[0] ?? null;
};

export const selectActiveRing = s => {
  const cluster = selectActiveCluster(s);
  if (!cluster) return null;
  return cluster.rings.find(r => r.id === s.ui.activeRingId) ?? cluster.rings[0];
};

// ─── Reverse decorations ──────────────────────────────────────────────────────
export const selectReverseDecorations = s => s.editor.reverseDecorations;

export const selectActiveReverseDecoration = s => {
  const { activeReverseDecorationId } = s.ui;
  const { reverseDecorations } = s.editor;
  return reverseDecorations.find(d => d.id === activeReverseDecorationId) ?? null;
};
export const selectReverseTemplate = s => s.editor.reverseTemplate;

// ─── Export ───────────────────────────────────────────────────────────────────
export const selectExport = s => s.export;
