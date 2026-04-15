import {
  SET_STAGE,
  SET_THEME,
  SET_PREVIEW_SIDE,
  SET_RING_SETUP_MODE,
  RESET,
  ADD_LAYER,
  REMOVE_LAYER,
  DUPLICATE_LAYER,
  UPDATE_LAYER,
  SET_ACTIVE_LAYER,
  SAVE_PRESET,
  DELETE_PRESET,
  LOAD_PRESET,
  UPDATE_PRESET,
  SELECT_TEMPLATE,
  ADD_CLUSTER,
  REMOVE_CLUSTER,
  UPDATE_CLUSTER,
  SET_ACTIVE_CLUSTER,
  ADD_RING,
  REMOVE_RING,
  UPDATE_RING,
  SET_ACTIVE_RING,
  SET_BG_COLOR,
  ADD_REVERSE_DECORATION,
  REMOVE_REVERSE_DECORATION,
  UPDATE_REVERSE_DECORATION,
  SET_ACTIVE_REVERSE_DECORATION,
  SET_REVERSE_TEMPLATE,
  SET_EXPORT_STATUS,
} from "./actions.js";
import { makeId } from "../utils/id.js";
import {
  DEFAULT_COLORS,
  DEFAULT_BG_COLOR,
  MAX_RINGS_PER_CLUSTER,
} from "../data/constants/defaults.js";
import { REVERSE_TEMPLATES } from "../data/constants/templates.js";
import { MOTIF_COUNT } from "../data/motifs/motifRegistry.js";

// ─── Factories ────────────────────────────────────────────────────────────────

export const makeLayer = (motifIndex = 0) => ({
  id: makeId(),
  motifId: motifIndex % MOTIF_COUNT,
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  colors: [...DEFAULT_COLORS],
});

export const makeRing = (index = 0) => ({
  id: makeId(),
  count: 6 + index * 4,
  radius: 80 + index * 80,
  motifId: index % MOTIF_COUNT,
  colors: [...DEFAULT_COLORS],
  presetId: null,
});

export const makeCluster = (tpl) => {
  const rings = [0].map((i) => makeRing(i));
  return {
    id: makeId(),
    x: tpl.x,
    y: tpl.y,
    scale: tpl.scale,
    rings,
  };
};

/**
 * A reverse ring: same concept as a Studio ring but with an (x, y) position
 * instead of belonging to a cluster. radius is in Studio-scale px (reference H=480).
 */
export const makeReverseRing = () => ({
  id: makeId(),
  x: 0.5, // 0–1 fraction of canvas width
  y: 0.5, // 0–1 fraction of canvas height
  count: 8,
  radius: 80, // px at H=480 reference scale, matches Studio ring convention
  motifId: 0,
  presetId: null,
  colors: [...DEFAULT_COLORS],
});

// ─── Initial state ────────────────────────────────────────────────────────────

const firstLayer = makeLayer(0);

export const initialState = {
  ui: {
    stage: 0,
    theme: "dark",
    activeClusterId: null,
    activeRingId: null,
    activeLayerId: firstLayer.id,
    activeReverseDecorationId: null,
    activePresetId: null,
    ringSetupMode: "motif",
    previewSide: "front",
  },
  library: [],
  editor: {
    layers: [firstLayer],
    selectedTemplate: null,
    clusters: [],
    bgColor: DEFAULT_BG_COLOR,
    reverseDecorations: [],
    reverseTemplate: "default",
  },
  export: {
    isDownloading: false,
    statusMessage: "",
  },
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function reducer(state, action) {
  const nextValue =
    action.key === "colors" && Array.isArray(action.value)
      ? [...action.value]
      : action.value;

  switch (action.type) {
    // Navigation
    case SET_STAGE:
      return { ...state, ui: { ...state.ui, stage: action.stage } };
    case SET_THEME:
      return { ...state, ui: { ...state.ui, theme: action.theme } };
    case SET_PREVIEW_SIDE:
      return { ...state, ui: { ...state.ui, previewSide: action.side } };
    case SET_RING_SETUP_MODE:
      return { ...state, ui: { ...state.ui, ringSetupMode: action.mode } };

    // Pattern Lab layers
    case ADD_LAYER: {
      const layer = makeLayer(0);
      return {
        ...state,
        editor: { ...state.editor, layers: [...state.editor.layers, layer] },
        ui: { ...state.ui, activeLayerId: layer.id },
      };
    }
    case REMOVE_LAYER: {
      if (state.editor.layers.length <= 1) return state;
      const remaining = state.editor.layers.filter((l) => l.id !== action.id);
      return {
        ...state,
        editor: { ...state.editor, layers: remaining },
        ui: { ...state.ui, activeLayerId: remaining[remaining.length - 1].id },
      };
    }
    case DUPLICATE_LAYER: {
      const original = state.editor.layers.find((l) => l.id === action.id);
      if (!original) return state;
      const clone = { ...original, id: makeId(), colors: [...original.colors] };
      const layers = state.editor.layers.reduce((acc, layer) => {
        acc.push(layer);
        if (layer.id === action.id) acc.push(clone);
        return acc;
      }, []);
      return {
        ...state,
        editor: { ...state.editor, layers },
        ui: { ...state.ui, activeLayerId: clone.id },
      };
    }
    case UPDATE_LAYER:
      return {
        ...state,
        editor: {
          ...state.editor,
          layers: state.editor.layers.map((l) =>
            l.id === action.id ? { ...l, [action.key]: nextValue } : l,
          ),
        },
      };
    case SET_ACTIVE_LAYER:
      return { ...state, ui: { ...state.ui, activeLayerId: action.id } };

    // Preset library
    case SAVE_PRESET: {
      const preset = {
        id: makeId(),
        name: action.name,
        layers: state.editor.layers.map((l) => ({ ...l })),
      };
      return { ...state, library: [...state.library, preset] };
    }
    case DELETE_PRESET:
      return {
        ...state,
        library: state.library.filter((p) => p.id !== action.id),
      };

    case LOAD_PRESET: {
      const preset = state.library.find((p) => p.id === action.id);
      if (!preset) return state;
      const layers = preset.layers.map((l) => ({ ...l }));
      return {
        ...state,
        editor: { ...state.editor, layers },
        ui: {
          ...state.ui,
          activeLayerId: layers[0]?.id,
          activePresetId: action.id,
        },
      };
    }

    case UPDATE_PRESET: {
      return {
        ...state,
        library: state.library.map((p) =>
          p.id === action.id
            ? { ...p, layers: state.editor.layers.map((l) => ({ ...l })) }
            : p,
        ),
        ui: { ...state.ui, activePresetId: null },
      };
    }

    // Template selection → initializes clusters + advances to Studio stage
    case SELECT_TEMPLATE: {
      const clusters = action.template.clusters.map((t) => makeCluster(t));
      const firstCluster = clusters[0];
      return {
        ...state,
        editor: {
          ...state.editor,
          selectedTemplate: action.template,
          clusters,
        },
        ui: {
          ...state.ui,
          stage: 3,
          activeClusterId: firstCluster.id,
          activeRingId: firstCluster.rings[0].id,
        },
      };
    }

    // Studio clusters
    case ADD_CLUSTER: {
      const nc = makeCluster({
        x: 0.25 + Math.random() * 0.5,
        y: 0.25 + Math.random() * 0.5,
        scale: 0.7,
      });
      return {
        ...state,
        editor: { ...state.editor, clusters: [...state.editor.clusters, nc] },
        ui: {
          ...state.ui,
          activeClusterId: nc.id,
          activeRingId: nc.rings[0].id,
        },
      };
    }
    case REMOVE_CLUSTER: {
      if (state.editor.clusters.length <= 1) return state;
      const remaining = state.editor.clusters.filter((c) => c.id !== action.id);
      return {
        ...state,
        editor: { ...state.editor, clusters: remaining },
        ui: {
          ...state.ui,
          activeClusterId: remaining[0].id,
          activeRingId: remaining[0].rings[0].id,
        },
      };
    }
    case UPDATE_CLUSTER:
      return {
        ...state,
        editor: {
          ...state.editor,
          clusters: state.editor.clusters.map((c) =>
            c.id === action.id ? { ...c, [action.key]: action.value } : c,
          ),
        },
      };
    case SET_ACTIVE_CLUSTER:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeClusterId: action.id,
          activeRingId:
            state.editor.clusters.find((c) => c.id === action.id)?.rings[0]
              ?.id ?? null,
        },
      };

    // Studio rings
    case ADD_RING: {
      const activeCl = state.editor.clusters.find(
        (c) => c.id === state.ui.activeClusterId,
      );
      if (!activeCl || activeCl.rings.length >= MAX_RINGS_PER_CLUSTER)
        return state;
      const maxRadius = Math.max(...activeCl.rings.map((r) => r.radius));
      const nr = { ...makeRing(0), radius: maxRadius + 80 };
      return {
        ...state,
        editor: {
          ...state.editor,
          clusters: state.editor.clusters.map((c) =>
            c.id === state.ui.activeClusterId
              ? { ...c, rings: [...c.rings, nr] }
              : c,
          ),
        },
        ui: { ...state.ui, activeRingId: nr.id },
      };
    }
    case REMOVE_RING: {
      const activeCl = state.editor.clusters.find(
        (c) => c.id === state.ui.activeClusterId,
      );
      if (!activeCl || activeCl.rings.length <= 1) return state;
      const remaining = activeCl.rings.filter((r) => r.id !== action.id);
      return {
        ...state,
        editor: {
          ...state.editor,
          clusters: state.editor.clusters.map((c) =>
            c.id === state.ui.activeClusterId ? { ...c, rings: remaining } : c,
          ),
        },
        ui: { ...state.ui, activeRingId: remaining[remaining.length - 1].id },
      };
    }
    case UPDATE_RING:
      return {
        ...state,
        editor: {
          ...state.editor,
          clusters: state.editor.clusters.map((c) =>
            c.id === state.ui.activeClusterId
              ? {
                  ...c,
                  rings: c.rings.map((r) =>
                    r.id === action.id ? { ...r, [action.key]: nextValue } : r,
                  ),
                }
              : c,
          ),
        },
      };
    case SET_ACTIVE_RING:
      return { ...state, ui: { ...state.ui, activeRingId: action.id } };

    // Background
    case SET_BG_COLOR:
      return { ...state, editor: { ...state.editor, bgColor: action.color } };

    // Reverse decorations
    case ADD_REVERSE_DECORATION: {
      const dec = makeReverseRing();
      return {
        ...state,
        editor: {
          ...state.editor,
          reverseDecorations: [...state.editor.reverseDecorations, dec],
        },
        ui: { ...state.ui, activeReverseDecorationId: dec.id },
      };
    }
    case REMOVE_REVERSE_DECORATION: {
      const remaining = state.editor.reverseDecorations.filter(
        (d) => d.id !== action.id,
      );
      return {
        ...state,
        editor: { ...state.editor, reverseDecorations: remaining },
        ui: {
          ...state.ui,
          activeReverseDecorationId:
            remaining.length > 0 ? remaining[remaining.length - 1].id : null,
        },
      };
    }
    case UPDATE_REVERSE_DECORATION:
      return {
        ...state,
        editor: {
          ...state.editor,
          reverseDecorations: state.editor.reverseDecorations.map((d) =>
            d.id === action.id ? { ...d, [action.key]: nextValue } : d,
          ),
        },
      };
    case SET_ACTIVE_REVERSE_DECORATION:
      return {
        ...state,
        ui: { ...state.ui, activeReverseDecorationId: action.id },
      };

    case SET_REVERSE_TEMPLATE: {
      const template = REVERSE_TEMPLATES.find((t) => t.id === action.id);
      if (!template) return state;
      const rings = template.rings.map((r) => ({ ...r, id: makeId() }));
      return {
        ...state,
        editor: {
          ...state.editor,
          reverseDecorations: rings,
          reverseTemplate: action.id,
        },
        ui: {
          ...state.ui,
          activeReverseDecorationId: rings.length > 0 ? rings[0].id : null,
        },
      };
    }

    // Export
    case SET_EXPORT_STATUS:
      return {
        ...state,
        export: {
          isDownloading: action.isDownloading,
          statusMessage: action.message ?? "",
        },
      };

    case RESET:
      return {
        ...initialState,
        ui: { ...initialState.ui, theme: state.ui.theme },
      };

    default:
      return state;
  }
}
