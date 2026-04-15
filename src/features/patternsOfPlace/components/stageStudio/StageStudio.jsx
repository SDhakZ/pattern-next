import { useCallback, useRef } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import {
  SET_STAGE,
  SET_THEME,
  SET_RING_SETUP_MODE,
  ADD_CLUSTER,
  REMOVE_CLUSTER,
  UPDATE_CLUSTER,
  SET_ACTIVE_CLUSTER,
  ADD_RING,
  REMOVE_RING,
  UPDATE_RING,
  SET_ACTIVE_RING,
  SET_BG_COLOR,
} from "../../app/actions.js";
import {
  selectClusters,
  selectActiveCluster,
  selectActiveRing,
  selectLibrary,
  selectBgColor,
  selectRingSetupMode,
} from "../../app/selectors.js";
import { Button } from "../shared/Button.jsx";
import { Divider } from "../shared/Divider.jsx";
import { Label } from "../shared/Label.jsx";
import { SliderControl } from "../shared/SliderControl.jsx";
import { ColorPicker } from "../shared/ColorPicker.jsx";
import { CardCanvas } from "../shared/CardCanvas.jsx";
import { PatternTile } from "../shared/PatternTile.jsx";
import {
  MOTIFS,
  MOTIF_NAMES,
  SELECTABLE_MOTIFS,
} from "../../data/motifs/motifRegistry.js";
import { PREVIEW_BG_OPTIONS } from "../../data/constants/backgrounds.js";
import {
  DEFAULT_COLORS,
  MAX_RINGS_PER_CLUSTER,
} from "../../data/constants/defaults.js";
import { tangentSize } from "../../domain/geometry.js";
import { FONT, FONT_MONO } from "../../data/constants/themes.js";

const PANEL_STYLE = {
  width: 560,
  flexShrink: 0,
  height: "100%",
  minHeight: 0,
  overflowY: "auto",
  overscrollBehavior: "contain",
  padding: "28px 20px",
  display: "flex",
  flexDirection: "column",
};

export function StageStudio() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const clusters = selectClusters(state);
  const activeCl = selectActiveCluster(state);
  const activeRing = selectActiveRing(state);
  const library = selectLibrary(state);
  const bgColor = selectBgColor(state);
  const ringSetupMode = selectRingSetupMode(state);
  const { theme, activeClusterId, activeRingId } = state.ui;
  const previewRef = useRef(null);
  const gestureRef = useRef(null);

  const toggleTheme = () =>
    dispatch({ type: SET_THEME, theme: theme === "dark" ? "light" : "dark" });

  const updCl = useCallback(
    (key, value) => {
      dispatch({ type: UPDATE_CLUSTER, id: activeClusterId, key, value });
    },
    [dispatch, activeClusterId],
  );

  const updRing = useCallback(
    (key, value) => {
      dispatch({ type: UPDATE_RING, id: activeRingId, key, value });
    },
    [dispatch, activeRingId],
  );

  const finalize = () => dispatch({ type: SET_STAGE, stage: 4 });
  const goBack = () => dispatch({ type: SET_STAGE, stage: 2 });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const touchDistance = (t1, t2) => {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  const handlePreviewTouchStart = (event) => {
    if (!activeCl || !previewRef.current) return;

    const touches = event.touches;
    if (touches.length === 1) {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startClusterX: activeCl.x,
        startClusterY: activeCl.y,
      };
      return;
    }

    if (touches.length === 2) {
      gestureRef.current = {
        mode: "pinch",
        startDistance: touchDistance(touches[0], touches[1]),
        startScale: activeCl.scale,
      };
    }
  };

  const handlePreviewTouchMove = (event) => {
    if (!activeCl || !previewRef.current || !gestureRef.current) return;
    event.preventDefault();

    const rect = previewRef.current.getBoundingClientRect();
    const touches = event.touches;
    const gesture = gestureRef.current;

    if (gesture.mode === "drag" && touches.length === 1) {
      const dx = (touches[0].clientX - gesture.startTouchX) / rect.width;
      const dy = (touches[0].clientY - gesture.startTouchY) / rect.height;
      updCl("x", clamp(gesture.startClusterX + dx, 0, 1));
      updCl("y", clamp(gesture.startClusterY + dy, 0, 1));
      return;
    }

    if (gesture.mode === "pinch" && touches.length === 2) {
      const dist = touchDistance(touches[0], touches[1]);
      if (!gesture.startDistance) return;
      updCl(
        "scale",
        clamp(gesture.startScale * (dist / gesture.startDistance), 0.2, 3),
      );
    }
  };

  const handlePreviewTouchEnd = (event) => {
    if (event.touches.length === 0) {
      gestureRef.current = null;
    }
  };

  if (!activeCl || !activeRing) return null;

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        background: T.bg,
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
          background: T.surf,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Step 2 / 3
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>
            Ring Studio
          </div>
        </div>
        <Button variant="secondary" small={false} T={T} onClick={toggleTheme}>
          {theme === "dark" ? "☀" : "◐"}
        </Button>
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
        {/* ── Control Rail ── */}
        <aside
          style={{
            ...PANEL_STYLE,
            background: T.surf,
            borderRight: `1px solid ${T.brd}`,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: T.gold,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Step 2 / 3
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>
              Ring Studio
            </div>
          </div>

          <Divider T={T} />

          {/* ── Clusters ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Label T={T}>Clusters ({clusters.length})</Label>
            <div style={{ display: "flex", gap: 3 }}>
              <Button
                small
                variant="ghost"
                T={T}
                onClick={() => dispatch({ type: ADD_CLUSTER })}
              >
                +
              </Button>
              <Button
                small
                variant="ghost"
                T={T}
                onClick={() =>
                  dispatch({ type: REMOVE_CLUSTER, id: activeClusterId })
                }
                disabled={clusters.length <= 1}
              >
                −
              </Button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {clusters.map((cl, i) => (
              <button
                key={cl.id}
                onClick={() =>
                  dispatch({ type: SET_ACTIVE_CLUSTER, id: cl.id })
                }
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: FONT,
                  minHeight: 44,
                  border: `1.5px solid ${activeClusterId === cl.id ? T.txt : T.brd}`,
                  background:
                    activeClusterId === cl.id ? T.surf2 : "transparent",
                  color: activeClusterId === cl.id ? T.txt : T.mut,
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "all 0.15s",
                  touchAction: "manipulation",
                }}
              >
                C{i + 1}
              </button>
            ))}
          </div>

          <SliderControl
            label="X"
            val={Math.round(activeCl.x * 100)}
            min={0}
            max={100}
            onChange={(v) => updCl("x", v / 100)}
            display={`${Math.round(activeCl.x * 100)}%`}
            T={T}
          />
          <SliderControl
            label="Y"
            val={Math.round(activeCl.y * 100)}
            min={0}
            max={100}
            onChange={(v) => updCl("y", v / 100)}
            display={`${Math.round(activeCl.y * 100)}%`}
            T={T}
          />
          <SliderControl
            label="Scale"
            val={activeCl.scale}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(v) => updCl("scale", v)}
            display={`${activeCl.scale.toFixed(2)}×`}
            T={T}
          />
          <Divider T={T} />

          {/* ── Rings ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <Label T={T}>
              Rings ({activeCl.rings.length}/{MAX_RINGS_PER_CLUSTER})
            </Label>
            <div style={{ display: "flex", gap: 3 }}>
              <Button
                small
                variant="ghost"
                T={T}
                onClick={() => dispatch({ type: ADD_RING })}
                disabled={activeCl.rings.length >= MAX_RINGS_PER_CLUSTER}
              >
                +
              </Button>
              <Button
                small
                variant="ghost"
                T={T}
                onClick={() =>
                  dispatch({ type: REMOVE_RING, id: activeRingId })
                }
                disabled={activeCl.rings.length <= 1}
              >
                −
              </Button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {activeCl.rings.map((r, i) => (
              <button
                key={r.id}
                onClick={() => dispatch({ type: SET_ACTIVE_RING, id: r.id })}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: FONT,
                  minHeight: 44,
                  border: `1.5px solid ${activeRingId === r.id ? "#00e5ff" : T.brd}`,
                  background:
                    activeRingId === r.id
                      ? "rgba(0,229,255,0.12)"
                      : "transparent",
                  color: activeRingId === r.id ? T.txt : T.mut,
                  cursor: "pointer",
                  borderRadius: 4,
                  boxShadow:
                    activeRingId === r.id
                      ? "0 0 0 2px rgba(0,229,255,0.3)"
                      : "none",
                  transition: "all 0.15s",
                  touchAction: "manipulation",
                }}
              >
                R{i + 1}
              </button>
            ))}
          </div>

          <SliderControl
            label="Count"
            val={activeRing.count}
            min={2}
            max={100}
            onChange={(v) => updRing("count", v)}
            display={activeRing.count}
            T={T}
          />
          <SliderControl
            label="Radius"
            val={activeRing.radius}
            min={20}
            max={400}
            step={2}
            onChange={(v) => updRing("radius", v)}
            display={`${activeRing.radius}px`}
            T={T}
          />
          <div
            style={{
              fontSize: 10,
              color: T.mut,
              marginBottom: 10,
              fontFamily: FONT_MONO,
            }}
          >
            Tile: {Math.round(tangentSize(activeRing.radius, activeRing.count))}
            px
          </div>

          {/* ── Motif Source Toggle ── */}
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {["motif", "preset"].map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  dispatch({ type: SET_RING_SETUP_MODE, mode: tab })
                }
                style={{
                  flex: 1,
                  padding: "6px",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: FONT,
                  border: `1px solid ${ringSetupMode === tab ? T.gold : T.brd}`,
                  background: ringSetupMode === tab ? T.surf2 : "transparent",
                  color: ringSetupMode === tab ? T.gold : T.mut,
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {tab === "motif" ? "Single Motif" : "Preset Tile"}
              </button>
            ))}
          </div>

          {ringSetupMode === "motif" ? (
            <>
              <Label T={T}>Motif</Label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 3,
                  marginBottom: 8,
                }}
              >
                {SELECTABLE_MOTIFS.map(({ id, component: MC, name }) => {
                  const isActive = activeRing.motifId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        updRing("motifId", id);
                        updRing("presetId", null);
                      }}
                      aria-label={name}
                      style={{
                        aspectRatio: "1",
                        padding: 1,
                        border: `1.5px solid ${isActive ? "#00e5ff" : T.brd}`,
                        background: isActive
                          ? "rgba(0,229,255,0.1)"
                          : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 3,
                        overflow: "hidden",
                        transition: "all 0.15s",
                      }}
                    >
                      <MC c={activeRing.colors ?? DEFAULT_COLORS} size={46} />
                    </button>
                  );
                })}
              </div>
              <ColorPicker
                key={activeRing.id}
                label="Ring Colors"
                colors={activeRing.colors ?? DEFAULT_COLORS}
                onChange={(c) => updRing("colors", c)}
                T={T}
              />
            </>
          ) : (
            <>
              <Label T={T}>Pattern Preset</Label>
              {library.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {library.map((pr) => {
                    const isActive = activeRing.presetId === pr.id;
                    return (
                      <button
                        key={pr.id}
                        onClick={() => {
                          updRing("presetId", pr.id);
                          updRing("motifId", undefined);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          border: `1.5px solid ${isActive ? "#00e5ff" : T.brd}`,
                          background: isActive
                            ? "rgba(0,229,255,0.1)"
                            : "transparent",
                          borderRadius: 4,
                          cursor: "pointer",
                          textAlign: "left",
                          boxShadow: isActive
                            ? "0 0 0 2px rgba(0,229,255,0.25)"
                            : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            background: "#111",
                            borderRadius: 3,
                            flexShrink: 0,
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PatternTile layers={pr.layers} size={36} />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.txt,
                          }}
                        >
                          {pr.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 11,
                    color: T.mut,
                    fontStyle: "italic",
                    padding: 8,
                    background: T.surf2,
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  No presets yet. Go back to Pattern Lab to create some.
                </div>
              )}
            </>
          )}
        </aside>

        {/* ── Postcard Preview ── */}
        <main
          role="region"
          aria-label="Postcard preview"
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 10,
            background: T.bg,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            Postcard Preview
          </div>
          <div
            ref={previewRef}
            onTouchStart={handlePreviewTouchStart}
            onTouchMove={handlePreviewTouchMove}
            onTouchEnd={handlePreviewTouchEnd}
            onTouchCancel={handlePreviewTouchEnd}
            style={{
              borderRadius: 6,
              boxShadow: `0 12px 40px ${T.shadow}`,
              touchAction: "none",
            }}
          >
            <CardCanvas
              clusters={clusters}
              bgColor={bgColor}
              W={600}
              H={400}
              library={library}
              activeClId={activeClusterId}
              activeRingId={activeRingId}
            />
          </div>
          <div style={{ fontSize: 10, color: T.mut, textAlign: "center" }}>
            Touch: drag cluster with one finger, pinch with two fingers to zoom.
          </div>
          <div style={{ fontSize: 10, color: T.mut, textAlign: "center" }}>
            Active ring:{" "}
            <span style={{ color: "#00e5ff", fontWeight: 700 }}>
              cyan dashed
            </span>
            {"  ·  "}
            Cluster:{" "}
            <span style={{ color: "#ff6b35", fontWeight: 700 }}>
              ● orange dot
            </span>
          </div>
        </main>
        <aside
          style={{
            ...PANEL_STYLE,
            background: T.surf,
            borderLeft: `1px solid ${T.brd}`,
          }}
        >
          <Label T={T}>Card Background</Label>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: T.mut }}>
              Preview Background
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PREVIEW_BG_OPTIONS.map((option) => {
                const isActive = bgColor === option.color;
                return (
                  <button
                    key={option.color}
                    type="button"
                    onClick={() =>
                      dispatch({ type: SET_BG_COLOR, color: option.color })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 6px",
                      borderRadius: 999,
                      border: `1px solid ${isActive ? T.gold : T.brd}`,
                      background: isActive ? T.surf2 : "transparent",
                      color: isActive ? T.gold : T.mut,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: option.color,
                        border: "1px solid rgba(255,255,255,0.2)",
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
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="color"
                value={bgColor}
                onChange={(e) =>
                  dispatch({ type: SET_BG_COLOR, color: e.target.value })
                }
                aria-label="Card background color"
                style={{
                  width: "100%",
                  height: 30,
                  border: `1px solid ${T.brd}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: 2,
                  background: "transparent",
                }}
              />
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: SET_BG_COLOR, color: "#101010" })
                }
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
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 20,
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 12,
            borderRadius: 999,
            background: T.surf,
            border: `1px solid ${T.brd}`,
            boxShadow: `0 12px 32px ${T.shadow}`,
            zIndex: 150,
          }}
        >
          <Button variant="secondary" small={false} T={T} onClick={goBack}>
            ← Back
          </Button>
          <Button onClick={finalize} T={T}>
            Finalize →
          </Button>
        </div>
      </div>
    </div>
  );
}
