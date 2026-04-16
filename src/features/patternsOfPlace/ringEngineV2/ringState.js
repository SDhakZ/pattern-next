import { makeId } from "../utils/id.js";
import {
  DEFAULT_COLORS,
  MAX_RINGS_PER_CLUSTER,
} from "../data/constants/defaults.js";
import { MOTIF_META } from "../data/motifs/motifMeta.js";

const DEFAULT_MOTIF_ID = MOTIF_META[0]?.id ?? 0;

function cloneLayer(layer) {
  return {
    ...layer,
    colors: normalizeColors(Array.isArray(layer?.colors) ? layer.colors : []),
  };
}

function cloneLayers(layers) {
  if (!Array.isArray(layers)) return null;
  return layers.map(cloneLayer);
}

function normalizeColors(value) {
  const next = Array.isArray(value)
    ? value.slice(0, DEFAULT_COLORS.length)
    : [];
  while (next.length < DEFAULT_COLORS.length) {
    next.push(DEFAULT_COLORS[next.length]);
  }
  return next;
}

function getMotifMeta(motifId) {
  const motif =
    MOTIF_META.find((entry) => entry.id === motifId) ?? MOTIF_META[0];
  return {
    motifId: motif?.id ?? DEFAULT_MOTIF_ID,
    layerCount: motif?.layerCount ?? DEFAULT_COLORS.length,
    defaultColors: normalizeColors(motif?.previewColors ?? DEFAULT_COLORS),
  };
}

function createRing(index = 0, motifId = DEFAULT_MOTIF_ID) {
  const motif = getMotifMeta(motifId);
  return {
    id: makeId(),
    count: 6 + index * 4,
    radius: 80 + index * 80,
    motifId: motif.motifId,
    layerCount: motif.layerCount,
    colors: motif.defaultColors,
    presetId: null,
    patternLayers: null,
  };
}

function normalizeRing(ring, index = 0) {
  const motif = getMotifMeta(ring?.motifId);
  return {
    id: ring?.id ?? makeId(),
    count: Number.isFinite(ring?.count) ? ring.count : 6 + index * 4,
    radius: Number.isFinite(ring?.radius) ? ring.radius : 80 + index * 80,
    motifId: motif.motifId,
    layerCount: motif.layerCount,
    colors: normalizeColors(
      Array.isArray(ring?.colors) ? ring.colors : motif.defaultColors,
    ),
    presetId: ring?.presetId ?? null,
    patternLayers: cloneLayers(ring?.patternLayers),
  };
}

function createCluster(tpl) {
  return {
    id: makeId(),
    x: tpl.x,
    y: tpl.y,
    scale: tpl.scale,
    rings: [createRing(0, DEFAULT_MOTIF_ID)],
  };
}

function updateRingValue(ring, key, value, ringIndex) {
  const normalizedRing = normalizeRing(ring, ringIndex);

  if (key === "colors") {
    const colors = normalizeColors(value);
    return {
      ...normalizedRing,
      colors,
    };
  }

  if (key === "motifId") {
    if (typeof value !== "number") return normalizedRing;
    const motif = getMotifMeta(value);
    return {
      ...normalizedRing,
      motifId: motif.motifId,
      layerCount: motif.layerCount,
      colors: motif.defaultColors,
      presetId: null,
      patternLayers: null,
    };
  }

  if (key === "patternLayers") {
    return {
      ...normalizedRing,
      patternLayers: cloneLayers(value),
    };
  }

  return {
    ...normalizedRing,
    [key]: value,
  };
}

export function selectTemplateState(state, template) {
  const clusters = template.clusters.map((cluster) => createCluster(cluster));
  const firstCluster = clusters[0];
  return {
    ...state,
    editor: {
      ...state.editor,
      selectedTemplate: template,
      clusters,
    },
    ui: {
      ...state.ui,
      stage: 2,
      activeClusterId: firstCluster?.id ?? null,
      activeRingId: firstCluster?.rings?.[0]?.id ?? null,
    },
  };
}

export function addClusterState(state) {
  const nextCluster = createCluster({
    x: 0.25 + Math.random() * 0.5,
    y: 0.25 + Math.random() * 0.5,
    scale: 0.7,
  });

  return {
    ...state,
    editor: {
      ...state.editor,
      clusters: [...state.editor.clusters, nextCluster],
    },
    ui: {
      ...state.ui,
      activeClusterId: nextCluster.id,
      activeRingId: nextCluster.rings[0].id,
    },
  };
}

export function removeClusterState(state, clusterId) {
  if (state.editor.clusters.length <= 1) return state;

  const remaining = state.editor.clusters.filter(
    (cluster) => cluster.id !== clusterId,
  );
  const nextCluster = remaining[0];

  return {
    ...state,
    editor: {
      ...state.editor,
      clusters: remaining,
    },
    ui: {
      ...state.ui,
      activeClusterId: nextCluster?.id ?? null,
      activeRingId: nextCluster?.rings?.[0]?.id ?? null,
    },
  };
}

export function updateClusterState(state, clusterId, key, value) {
  return {
    ...state,
    editor: {
      ...state.editor,
      clusters: state.editor.clusters.map((cluster) =>
        cluster.id === clusterId ? { ...cluster, [key]: value } : cluster,
      ),
    },
  };
}

export function setActiveClusterState(state, clusterId) {
  const target = state.editor.clusters.find(
    (cluster) => cluster.id === clusterId,
  );
  if (!target) return state;

  return {
    ...state,
    ui: {
      ...state.ui,
      activeClusterId: clusterId,
      activeRingId: target.rings?.[0]?.id ?? null,
    },
  };
}

export function addRingState(state) {
  const activeCluster = state.editor.clusters.find(
    (cluster) => cluster.id === state.ui.activeClusterId,
  );
  if (!activeCluster || activeCluster.rings.length >= MAX_RINGS_PER_CLUSTER) {
    return state;
  }

  const maxRadius = Math.max(...activeCluster.rings.map((ring) => ring.radius));
  const baseMotifId =
    activeCluster.rings[activeCluster.rings.length - 1]?.motifId ??
    DEFAULT_MOTIF_ID;
  const nextRing = {
    ...createRing(0, baseMotifId),
    count: 20,
    radius: Math.min(maxRadius + 24, 400),
  };

  return {
    ...state,
    editor: {
      ...state.editor,
      clusters: state.editor.clusters.map((cluster) =>
        cluster.id === state.ui.activeClusterId
          ? { ...cluster, rings: [...cluster.rings, nextRing] }
          : cluster,
      ),
    },
    ui: {
      ...state.ui,
      activeRingId: nextRing.id,
    },
  };
}

export function removeRingState(state, ringId) {
  const activeCluster = state.editor.clusters.find(
    (cluster) => cluster.id === state.ui.activeClusterId,
  );
  if (!activeCluster || activeCluster.rings.length <= 1) return state;

  const remaining = activeCluster.rings.filter((ring) => ring.id !== ringId);
  const nextActiveRingId = remaining[remaining.length - 1]?.id ?? null;
  if (!nextActiveRingId) return state;

  return {
    ...state,
    editor: {
      ...state.editor,
      clusters: state.editor.clusters.map((cluster) =>
        cluster.id === state.ui.activeClusterId
          ? { ...cluster, rings: remaining }
          : cluster,
      ),
    },
    ui: {
      ...state.ui,
      activeRingId: nextActiveRingId,
    },
  };
}

export function updateRingState(state, action) {
  const targetClusterId = action.clusterId ?? state.ui.activeClusterId;

  if (!targetClusterId) return state;

  const targetCluster = state.editor.clusters.find(
    (cluster) => cluster.id === targetClusterId,
  );
  if (!targetCluster?.rings?.some((ring) => ring.id === action.id))
    return state;

  return {
    ...state,
    editor: {
      ...state.editor,
      clusters: state.editor.clusters.map((cluster) =>
        cluster.id === targetClusterId
          ? {
              ...cluster,
              rings: cluster.rings.map((ring, index) =>
                ring.id === action.id
                  ? updateRingValue(ring, action.key, action.value, index)
                  : normalizeRing(ring, index),
              ),
            }
          : cluster,
      ),
    },
  };
}

export function setActiveRingState(state, action) {
  const targetClusterId = action.clusterId ?? state.ui.activeClusterId;
  const targetCluster = state.editor.clusters.find(
    (cluster) => cluster.id === targetClusterId,
  );
  const ringExists = targetCluster?.rings?.some(
    (ring) => ring.id === action.id,
  );
  if (!ringExists) return state;

  return {
    ...state,
    ui: {
      ...state.ui,
      activeClusterId: targetClusterId,
      activeRingId: action.id,
    },
  };
}
