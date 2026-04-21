import { useState, useCallback, useRef, useEffect } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import {
  SET_STAGE,
  ADD_LAYER,
  REMOVE_LAYER,
  DUPLICATE_LAYER,
  UPDATE_LAYER,
  SET_ACTIVE_LAYER,
  SAVE_PRESET,
  DELETE_PRESET,
  LOAD_PRESET,
  UPDATE_PRESET,
} from "../../app/actions.js";
import {
  selectLayers,
  selectActiveLayer,
  selectLibrary,
} from "../../app/selectors.js";
import { Button } from "../shared/Button.jsx";
import { Divider } from "../shared/Divider.jsx";
import { Label } from "../shared/Label.jsx";
import { SliderControl } from "../shared/SliderControl.jsx";
import { ColorPicker } from "../shared/ColorPicker.jsx";
import { PatternTile } from "../shared/PatternTile.jsx";
import {
  MOTIFS,
  MOTIF_LAYER_COUNTS,
  MOTIF_NAMES,
  SELECTABLE_MOTIFS,
} from "../../data/motifs/motifRegistry.js";
import { PREVIEW_BG_OPTIONS } from "../../data/constants/backgrounds.js";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";
import bgImage from "../../../../assets/bg.png";

const PANEL_STYLE = {
  width: 380,
  flexShrink: 0,
  height: "100%",
  minHeight: 0,
  overflowY: "auto",
  overscrollBehavior: "contain",
  padding: "24px 20px",
  display: "flex",
  flexDirection: "column",
};

export function StagePatternLab() {
  const { state, dispatch, T: baseT } = usePatternsOfPlace();
  const T = {
    ...baseT,
    bg: "#060606",
    surf: "rgba(9, 9, 9, 0.95)",
    surf1: "rgba(12, 12, 12, 0.92)",
    surf2: "rgba(16, 16, 16, 0.9)",
    brd: "rgba(227, 176, 59, 0.3)",
    txt: "#f0c75a",
    mut: "#a08a57",
    dim: "#776543",
    gold: "#e3b03b",
    shadow: "rgba(0,0,0,0.72)",
  };
  const layers = selectLayers(state);
  const active = selectActiveLayer(state);
  const library = selectLibrary(state);
  const { activeLayerId } = state.ui;

  const [presetName, setPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [previewBgColor, setPreviewBgColor] = useState("#101010");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState(JSON.stringify(layers));
  const previewRef = useRef(null);
  const gestureRef = useRef(null);
  const editingPreset = library.find((preset) => preset.id === editingPresetId);
  const activeLayerCount = MOTIF_LAYER_COUNTS[active?.motifId] ?? 5;

  const actionButtonStyle = {
    fontSize: 20,
    padding: 0,
    minHeight: 34,
    minWidth: 34,
    borderRadius: 5,
    lineHeight: 1,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const actionIconStyle = {
    width: "1em",
    height: "1em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    transform: "translateY(-1px)",
  };

  const buildDefaultPresetName = () => {
    const existingNames = new Set(
      library.map((preset) => (preset.name || "").trim().toLowerCase()),
    );
    let index = library.length + 1;
    let candidate = `Preset ${index}`;
    while (existingNames.has(candidate.toLowerCase())) {
      index += 1;
      candidate = `Preset ${index}`;
    }
    return candidate;
  };

  useEffect(() => {
    const currentState = JSON.stringify(layers);
    setHasUnsavedChanges(currentState !== lastSavedState);
  }, [layers, lastSavedState]);

  const upd = useCallback(
    (key, value) => {
      dispatch({ type: UPDATE_LAYER, id: active.id, key, value });
    },
    [dispatch, active.id],
  );

  const addLayer = () => dispatch({ type: ADD_LAYER });
  const removeLayer = () => dispatch({ type: REMOVE_LAYER, id: activeLayerId });
  const duplicateLayer = () =>
    dispatch({ type: DUPLICATE_LAYER, id: activeLayerId });

  const saveAsNewPreset = () => {
    const normalizedName = presetName.trim() || buildDefaultPresetName();
    dispatch({ type: SAVE_PRESET, name: normalizedName });
    setSavedMsg(`"${normalizedName}" saved to library.`);
    setEditingPresetId(null);
    setPresetName("");
    setLastSavedState(JSON.stringify(layers));
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const updateSelectedPreset = () => {
    if (!editingPresetId) return;
    const normalizedName =
      presetName.trim() || editingPreset?.name || buildDefaultPresetName();
    dispatch({
      type: UPDATE_PRESET,
      id: editingPresetId,
      name: normalizedName,
    });
    setSavedMsg(`"${normalizedName}" updated.`);
    setEditingPresetId(null);
    setPresetName("");
    setLastSavedState(JSON.stringify(layers));
    setTimeout(() => setSavedMsg(""), 2000);
  };

  const stopEditingPreset = () => {
    setEditingPresetId(null);
    setPresetName("");
  };

  const goBack = () => dispatch({ type: SET_STAGE, stage: 2 });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const DRAG_DEADZONE_PX = 3;
  const MIN_PINCH_DISTANCE = 8;
  const touchDistance = (t1, t2) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  const handlePreviewTouchStart = (event) => {
    if (!active || !previewRef.current) return;
    const touches = event.touches;

    if (touches.length === 1) {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startX: active.x,
        startY: active.y,
        hasMoved: false,
      };
      return;
    }

    if (touches.length === 2) {
      const dist = touchDistance(touches[0], touches[1]);
      if (dist < MIN_PINCH_DISTANCE) return;
      gestureRef.current = {
        mode: "pinch",
        startDistance: dist,
        startScale: active.scale,
      };
    }
  };

  const handlePreviewTouchMove = (event) => {
    if (!active || !previewRef.current || !gestureRef.current) return;

    const touches = event.touches;
    let gesture = gestureRef.current;
    const rect = previewRef.current.getBoundingClientRect();

    // Smoothly switch gesture mode as fingers are added/removed.
    if (touches.length === 2 && gesture.mode !== "pinch") {
      const dist = touchDistance(touches[0], touches[1]);
      if (dist >= MIN_PINCH_DISTANCE) {
        gestureRef.current = {
          mode: "pinch",
          startDistance: dist,
          startScale: active.scale,
        };
        gesture = gestureRef.current;
      }
    }

    if (touches.length === 1 && gesture.mode !== "drag") {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startX: active.x,
        startY: active.y,
        hasMoved: false,
      };
      gesture = gestureRef.current;
    }

    if (gesture.mode === "drag" && touches.length === 1) {
      const deltaPxX = touches[0].clientX - gesture.startTouchX;
      const deltaPxY = touches[0].clientY - gesture.startTouchY;
      if (
        !gesture.hasMoved &&
        Math.hypot(deltaPxX, deltaPxY) < DRAG_DEADZONE_PX
      ) {
        return;
      }
      gesture.hasMoved = true;

      const dx = (touches[0].clientX - gesture.startTouchX) / (rect.width / 2);
      const dy = (touches[0].clientY - gesture.startTouchY) / (rect.height / 2);
      upd("x", clamp(gesture.startX + dx, -1, 1));
      upd("y", clamp(gesture.startY + dy, -1, 1));
      return;
    }

    if (gesture.mode === "pinch" && touches.length === 2) {
      const dist = touchDistance(touches[0], touches[1]);
      if (
        dist < MIN_PINCH_DISTANCE ||
        gesture.startDistance < MIN_PINCH_DISTANCE
      )
        return;
      upd(
        "scale",
        clamp(gesture.startScale * (dist / gesture.startDistance), 0.2, 3),
      );
    }
  };

  const handlePreviewTouchEnd = (event) => {
    const touches = event.touches;
    if (touches.length === 0) {
      gestureRef.current = null;
      return;
    }

    if (touches.length === 1 && active) {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startX: active.x,
        startY: active.y,
        hasMoved: false,
      };
      return;
    }

    if (touches.length === 2 && active) {
      const dist = touchDistance(touches[0], touches[1]);
      if (dist >= MIN_PINCH_DISTANCE) {
        gestureRef.current = {
          mode: "pinch",
          startDistance: dist,
          startScale: active.scale,
        };
      }
    }
  };

  return (
    <div
      style={{
        height: "100dvh",
        backgroundImage: `
          url(${bgImage.src})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "20px 24px",
          borderBottom: `1px solid ${T.brd}`,
          background:
            "linear-gradient(180deg, rgba(6,6,6,0.98) 0%, rgba(11,8,8,0.96) 100%)",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: T.gold,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily:
                "'Cormorant Garamond', 'Palatino Linotype', 'Times New Roman', serif",
              lineHeight: 1,
            }}
          >
            Pattern Lab
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <aside
          style={{
            ...PANEL_STYLE,
            background:
              "linear-gradient(180deg, rgba(9,9,9,0.95) 0%, rgba(12,6,4,0.9) 100%)",
            borderRight: `1px solid ${T.brd}`,
          }}
        >
          {/* ── Layers ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: T.gold,
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Layers ({layers.length})
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
              }}
            >
              <Button
                small
                variant="secondary"
                T={T}
                onClick={addLayer}
                style={{
                  ...actionButtonStyle,
                  color: T.gold,
                  border: `1px solid ${T.brd}`,
                  background: "rgba(57, 43, 8, 0.35)",
                }}
              >
                <span style={actionIconStyle}>+</span>
              </Button>
              <Button
                small
                variant="secondary"
                T={T}
                onClick={duplicateLayer}
                disabled={!active}
                style={{
                  ...actionButtonStyle,
                  color: "#b4b4b4",
                  border: `1px solid ${T.brd}`,
                  background: "rgba(12, 12, 12, 0.88)",
                }}
              >
                <span style={actionIconStyle}>⧉</span>
              </Button>
              <Button
                small
                variant="danger"
                T={T}
                onClick={removeLayer}
                disabled={layers.length <= 1}
                style={{
                  ...actionButtonStyle,
                  color: "#ff5a4c",
                  border: "1px solid rgba(187, 46, 36, 0.55)",
                  background: "rgba(51, 7, 7, 0.55)",
                }}
              >
                <span style={actionIconStyle}>−</span>
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              marginBottom: 10,
            }}
          >
            {layers.map((l, i) => {
              const MC = MOTIFS[l.motifId] || MOTIFS[0];
              const isActive = l.id === activeLayerId;
              return (
                <button
                  key={l.id}
                  onClick={() => dispatch({ type: SET_ACTIVE_LAYER, id: l.id })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    background: isActive ? T.surf2 : "transparent",
                    border: `1px solid ${isActive ? T.gold : T.brd}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "#111",
                      borderRadius: 3,
                      flexShrink: 0,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MC c={l.colors} size={28} />
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 11, fontWeight: 700, color: T.txt }}
                    >
                      Layer {i + 1}
                    </div>
                    <div style={{ fontSize: 9, color: T.mut }}>
                      {MOTIF_NAMES[l.motifId]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Divider T={T} />

          {/* ── Motif Grid ── */}
          <p
            style={{
              fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: T.gold,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Motif
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 3,
              marginBottom: 10,
              marginTop: 16,
            }}
          >
            {SELECTABLE_MOTIFS.map(
              ({ id, previewComponent: MCP, name, previewColors }) => {
                const isActive = active.motifId === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      upd("motifId", id);
                      upd("colors", previewColors);
                    }}
                    aria-label={name}
                    style={{
                      aspectRatio: "1",
                      padding: 1,
                      border: `1.5px solid ${isActive ? T.gold : T.brd}`,
                      background: isActive ? T.surf2 : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.15s",
                    }}
                  >
                    <MCP size={46} />
                  </button>
                );
              },
            )}
          </div>
          <Divider T={T} />

          {/* ── Save Preset ── */}
          <style>{`
            @keyframes savePresetPulse {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(227, 176, 59, 0.4);
              }
              50% {
                box-shadow: 0 0 12px 4px rgba(227, 176, 59, 0.25);
              }
            }
          `}</style>
          <div
            style={{
              border: `1px solid ${hasUnsavedChanges ? "#e3b03b" : T.brd}`,
              borderRadius: 10,
              background: "rgba(5, 5, 5, 0.9)",
              padding: "10px 10px 12px",
              marginBottom: 12,
              transition: "border-color 0.3s ease",
              animation: hasUnsavedChanges
                ? "savePresetPulse 2s infinite"
                : "none",
            }}
          >
            <Label T={T}>
              {editingPresetId ? "Edit Preset" : "Save Preset"}
              {hasUnsavedChanges && !editingPresetId && (
                <span style={{ fontSize: 10, color: "#e3b03b", marginLeft: 8 }}>
                  ● unsaved
                </span>
              )}
            </Label>
            <div style={{ fontSize: 10, color: T.mut, marginBottom: 8 }}>
              Save a new preset any time. Select one from Library only when you
              want to update it.
            </div>
            {editingPresetId && (
              <div style={{ fontSize: 10, color: T.mut, marginBottom: 8 }}>
                Editing: <strong>{editingPreset?.name || presetName}</strong>
              </div>
            )}
            <input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name (optional)"
              style={{
                width: "100%",
                padding: "9px 11px",
                fontSize: 12,
                fontFamily: FONT,
                background: T.surf2,
                color: T.txt,
                border: `1px solid ${T.brd}`,
                borderRadius: 10,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <Button
                onClick={saveAsNewPreset}
                small
                T={T}
                style={{ minHeight: 36, width: "100%" }}
              >
                Save New Preset
              </Button>
              {editingPresetId && (
                <Button
                  onClick={updateSelectedPreset}
                  disabled={!presetName.trim()}
                  small
                  T={T}
                  style={{ minHeight: 36, width: "100%" }}
                >
                  Update Selected
                </Button>
              )}
              {editingPresetId && (
                <Button
                  onClick={stopEditingPreset}
                  variant="secondary"
                  small
                  T={T}
                  style={{ minHeight: 36, width: "100%" }}
                >
                  Stop Editing
                </Button>
              )}
            </div>
            {savedMsg && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: "#4caf50",
                  fontWeight: 700,
                }}
              >
                {savedMsg}
              </div>
            )}
            {!editingPresetId && (
              <div style={{ marginTop: 8, fontSize: 10, color: T.dim }}>
                Tip: tap any library preset below to edit and update it.
              </div>
            )}
          </div>

          {/* ── Library ── */}
          {library.length > 0 && (
            <>
              <Label T={T}>Library ({library.length})</Label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {library.map((pr) => (
                  <div key={pr.id} style={{ position: "relative" }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        background: "#111",
                        borderRadius: 4,
                        overflow: "hidden",
                        border: `1px solid ${editingPresetId === pr.id ? "#00e5ff" : T.brd}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow:
                          editingPresetId === pr.id
                            ? "0 0 8px rgba(0,229,255,0.4)"
                            : "none",
                        transition: "all 0.15s",
                      }}
                      onClick={() => {
                        dispatch({ type: LOAD_PRESET, id: pr.id });
                        setEditingPresetId(pr.id);
                        setPresetName(pr.name);
                      }}
                    >
                      <PatternTile layers={pr.layers} size={52} />
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: T.mut,
                        textAlign: "center",
                        marginTop: 2,
                        maxWidth: 52,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pr.name}
                    </div>
                    <button
                      onClick={() =>
                        dispatch({ type: DELETE_PRESET, id: pr.id })
                      }
                      aria-label={`Delete preset ${pr.name}`}
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#e05a5a",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 9,
                        fontWeight: 700,
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* ── Tile Preview ── */}
        <main
          role="region"
          aria-label="Tile preview"
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            gap: 20,
            background:
              "radial-gradient(circle at 50% 30%, rgba(146, 47, 18, 0.28), rgba(0,0,0,0.2) 42%, rgba(0,0,0,0.82) 100%)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            Tile Preview
          </div>
          <div
            ref={previewRef}
            onTouchStart={handlePreviewTouchStart}
            onTouchMove={handlePreviewTouchMove}
            onTouchEnd={handlePreviewTouchEnd}
            onTouchCancel={handlePreviewTouchEnd}
            style={{
              background: previewBgColor,
              borderRadius: 10,
              padding: 30,
              backgroundImage:
                "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.11), transparent 52%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.2) 100%)",
              border: `1px solid ${T.brd}`,
              boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
              touchAction: "none",
            }}
          >
            <PatternTile
              layers={layers}
              size={300}
              activeLayerId={activeLayerId}
            />
          </div>

          <div style={{ fontSize: 10, color: T.mut, textAlign: "center" }}>
            Touch: drag motif with one finger, pinch with two fingers to scale.
          </div>
        </main>

        <aside
          style={{
            ...PANEL_STYLE,
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.95) 0%, rgba(10,7,6,0.92) 100%)",
            borderLeft: `1px solid ${T.brd}`,
          }}
        >
          <div
            style={{
              fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 18,
              lineHeight: 1,
            }}
          >
            Transform
          </div>
          <SliderControl
            label="X offset"
            val={active.x}
            min={-1}
            max={1}
            step={0.05}
            onChange={(v) => upd("x", v)}
            display={active.x.toFixed(2)}
            T={T}
          />
          <SliderControl
            label="Y offset"
            val={active.y}
            min={-1}
            max={1}
            step={0.05}
            onChange={(v) => upd("y", v)}
            display={active.y.toFixed(2)}
            T={T}
          />
          <SliderControl
            label="Scale"
            val={active.scale}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(v) => upd("scale", v)}
            display={`${active.scale.toFixed(2)}×`}
            T={T}
          />
          <SliderControl
            label="Rotation"
            val={active.rotation}
            min={0}
            max={360}
            onChange={(v) => upd("rotation", v)}
            display={`${active.rotation}°`}
            T={T}
          />

          <Divider T={T} />
          <div
            style={{
              fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 18,
              lineHeight: 1,
            }}
          >
            Color Palette
          </div>
          <ColorPicker
            key={active.id}
            label="Manual Colors"
            colors={active.colors}
            onChange={(c) => upd("colors", c)}
            layerCount={activeLayerCount}
            T={T}
          />
          <Divider T={T} />

          <div
            style={{
              fontFamily: 'Outfit, "DM Sans", system-ui, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 18,
              lineHeight: 1,
            }}
          >
            Background
          </div>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
              }}
            >
              {PREVIEW_BG_OPTIONS.map((option) => {
                const isActive = previewBgColor === option.color;
                return (
                  <button
                    key={option.color}
                    type="button"
                    onClick={() => setPreviewBgColor(option.color)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      minHeight: 36,
                      padding: "7px 10px",
                      borderRadius: 10,
                      border: `1px solid ${isActive ? T.gold : T.brd}`,
                      background: isActive ? `${T.gold}1a` : T.surf1,
                      color: isActive ? T.gold : T.txt,
                      cursor: "pointer",
                      boxShadow: isActive
                        ? "0 0 0 1px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.18)"
                        : "none",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: option.color,
                          border: "1px solid rgba(255,255,255,0.24)",
                          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: FONT,
                          fontWeight: 700,
                        }}
                      >
                        {option.name}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            ></div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="color"
                value={previewBgColor}
                onChange={(e) => setPreviewBgColor(e.target.value)}
                aria-label="Preview background color"
                style={{
                  width: "100%",
                  height: 34,
                  border: `1px solid ${T.brd}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: 2,
                  background: "transparent",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontFamily: FONT_MONO,
                  color: T.mut,
                  minWidth: 70,
                  textAlign: "center",
                  padding: "7px 8px",
                  borderRadius: 8,
                  border: `1px solid ${T.brd}`,
                  background: T.surf1,
                }}
              >
                {previewBgColor.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={() => setPreviewBgColor("#101010")}
                style={{
                  padding: "7px 10px",
                  fontSize: 10,
                  fontFamily: FONT,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: `1px solid ${T.brd}`,
                  background: T.surf2,
                  color: T.txt,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 60,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 999,
          background: "rgba(0, 0, 0, 0.82)",
          border: `1px solid ${T.brd}`,
          boxShadow: `0 12px 32px ${T.shadow}`,
          zIndex: 150,
        }}
      >
        <Button
          variant="nav"
          small={false}
          T={T}
          onClick={goBack}
          style={{
            minWidth: 132,
            minHeight: 44,
          }}
        >
          Back to Ring Studio
        </Button>
      </div>
    </div>
  );
}
