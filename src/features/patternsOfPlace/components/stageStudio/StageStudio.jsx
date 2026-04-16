import { useCallback, useRef, useState } from "react";
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
import { RingStudioLeftPanel } from "./RingStudioLeftPanel.jsx";
import { RingStudioRightPanel } from "./RingStudioRightPanel.jsx";
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
  const [showPatternLabModal, setShowPatternLabModal] = useState(false);

  const toggleTheme = () =>
    dispatch({ type: SET_THEME, theme: theme === "dark" ? "light" : "dark" });

  const updCl = useCallback(
    (key, value) => {
      if (!activeCl?.id) return;
      dispatch({ type: UPDATE_CLUSTER, id: activeCl.id, key, value });
    },
    [dispatch, activeCl?.id],
  );

  const updRing = useCallback(
    (key, value) => {
      if (!activeCl?.id || !activeRing?.id) return;
      dispatch({
        type: UPDATE_RING,
        clusterId: activeCl.id,
        id: activeRing.id,
        key,
        value,
      });
    },
    [dispatch, activeCl?.id, activeRing?.id],
  );

  const finalize = () => dispatch({ type: SET_STAGE, stage: 4 });
  const goBack = () => dispatch({ type: SET_STAGE, stage: 1 });
  const openPatternLab = () => setShowPatternLabModal(true);
  const enterPatternLab = () => {
    setShowPatternLabModal(false);
    dispatch({ type: SET_STAGE, stage: 3 });
  };

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

  const debugRows = clusters.flatMap((cluster, clusterIndex) =>
    cluster.rings.map((ring, ringIndex) => ({
      clusterId: cluster.id,
      clusterIndex,
      ringId: ring.id,
      ringIndex,
      motifId: ring.motifId,
      presetId: ring.presetId,
      hasPatternLayers:
        Array.isArray(ring.patternLayers) && ring.patternLayers.length > 0,
      c0: ring.colors?.[0] ?? "-",
      c1: ring.colors?.[1] ?? "-",
      c2: ring.colors?.[2] ?? "-",
      c3: ring.colors?.[3] ?? "-",
      c4: ring.colors?.[4] ?? "-",
      isActiveCluster: cluster.id === activeClusterId,
      isActiveRing: ring.id === activeRingId,
    })),
  );

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
        <RingStudioLeftPanel
          T={T}
          clusters={clusters}
          activeClusterId={activeClusterId}
          activeCl={activeCl}
          activeRingId={activeRingId}
          activeRing={activeRing}
          library={library}
          ringSetupMode={ringSetupMode}
          dispatch={dispatch}
          updRing={updRing}
          onCreatePattern={openPatternLab}
        />

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
          <div
            style={{
              width: 600,
              maxWidth: "100%",
              border: `1px solid ${T.brd}`,
              background: T.surf,
              borderRadius: 8,
              padding: 8,
              fontSize: 10,
              color: T.txt,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
                fontWeight: 700,
                color: T.gold,
              }}
            >
              <span>Debug State</span>
              <span>
                activeClusterId: {String(activeClusterId)} | activeRingId:{" "}
                {String(activeRingId)}
              </span>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: FONT_MONO,
              }}
            >
              <thead>
                <tr>
                  {[
                    "cluster",
                    "ring",
                    "clusterId",
                    "ringId",
                    "motif",
                    "preset",
                    "layers",
                    "c0",
                    "c1",
                    "c2",
                    "c3",
                    "c4",
                    "active",
                  ].map((head) => (
                    <th
                      key={head}
                      style={{
                        borderBottom: `1px solid ${T.brd}`,
                        padding: "4px 6px",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        color: T.mut,
                        fontWeight: 700,
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debugRows.map((row) => (
                  <tr
                    key={`${row.clusterId}-${row.ringId}`}
                    style={{
                      background:
                        row.isActiveCluster && row.isActiveRing
                          ? `${T.gold}22`
                          : row.isActiveCluster
                            ? `${T.gold}12`
                            : "transparent",
                    }}
                  >
                    <td style={{ padding: "4px 6px" }}>
                      C{row.clusterIndex + 1}
                    </td>
                    <td style={{ padding: "4px 6px" }}>R{row.ringIndex + 1}</td>
                    <td style={{ padding: "4px 6px" }}>{row.clusterId}</td>
                    <td style={{ padding: "4px 6px" }}>{row.ringId}</td>
                    <td style={{ padding: "4px 6px" }}>{row.motifId}</td>
                    <td style={{ padding: "4px 6px" }}>
                      {row.presetId ?? "-"}
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      {row.hasPatternLayers ? "yes" : "no"}
                    </td>
                    <td style={{ padding: "4px 6px", color: row.c0 }}>
                      {row.c0}
                    </td>
                    <td style={{ padding: "4px 6px", color: row.c1 }}>
                      {row.c1}
                    </td>
                    <td style={{ padding: "4px 6px", color: row.c2 }}>
                      {row.c2}
                    </td>
                    <td style={{ padding: "4px 6px", color: row.c3 }}>
                      {row.c3}
                    </td>
                    <td style={{ padding: "4px 6px", color: row.c4 }}>
                      {row.c4}
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      {row.isActiveCluster ? "C" : "-"}
                      {row.isActiveRing ? "R" : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <RingStudioRightPanel
          T={T}
          bgColor={bgColor}
          dispatch={dispatch}
          activeCl={activeCl}
          activeRing={activeRing}
          ringSetupMode={ringSetupMode}
          updCl={updCl}
          updRing={updRing}
        />
      </div>

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

      {showPatternLabModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create your own pattern"
          onClick={() => setShowPatternLabModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            padding: 24,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              borderRadius: 18,
              background: T.surf,
              border: `1px solid ${T.brd}`,
              boxShadow: `0 24px 80px ${T.shadow}`,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: T.gold,
                textTransform: "uppercase",
              }}
            >
              Create Your Own Pattern
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.txt }}>
              Open Pattern Lab
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6, color: T.mut }}>
              Build a reusable tile, save it to your library, and then come back
              to Ring Studio to apply it to your rings.
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <Button
                variant="secondary"
                T={T}
                onClick={() => setShowPatternLabModal(false)}
              >
                Cancel
              </Button>
              <Button T={T} onClick={enterPatternLab}>
                Open Pattern Lab
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
