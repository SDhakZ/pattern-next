import { useCallback, useEffect, useRef, useState } from "react";
import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE, UPDATE_CLUSTER, UPDATE_RING } from "../../app/actions.js";
import {
  selectClusters,
  selectActiveCluster,
  selectActiveRing,
  selectLibrary,
  selectBgColor,
  selectRingSetupMode,
} from "../../app/selectors.js";
import { Button } from "../shared/Button.jsx";
import { GlowButton } from "../shared/GlowButton.jsx";
import { CardCanvas } from "../shared/CardCanvas.jsx";
import { RingStudioLeftPanel } from "./RingStudioLeftPanel.jsx";
import { RingStudioRightPanel } from "./RingStudioRightPanel.jsx";
import { FONT } from "../../data/constants/themes.js";
import bgImage from "../../../../assets/bg.png";

export function StageStudio() {
  const { state, dispatch, T } = usePatternsOfPlace();
  const studioT = {
    ...T,
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
  const clusters = selectClusters(state);
  const activeCl = selectActiveCluster(state);
  const activeRing = selectActiveRing(state);
  const library = selectLibrary(state);
  const bgColor = selectBgColor(state);
  const ringSetupMode = selectRingSetupMode(state);
  const { activeClusterId, activeRingId } = state.ui;
  const previewRef = useRef(null);
  const gestureRef = useRef(null);
  const [showPatternLabModal, setShowPatternLabModal] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1440);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
  const DRAG_DEADZONE_PX = 3;
  const MIN_PINCH_DISTANCE = 8;
  const MIN_RING_RADIUS = 20;
  const MAX_RING_RADIUS = 400;

  const touchDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const touchSpread = (touches) => {
    if (!touches || touches.length < 2) return 0;
    let maxDistance = 0;
    for (let i = 0; i < touches.length - 1; i += 1) {
      for (let j = i + 1; j < touches.length; j += 1) {
        const dist = touchDistance(touches[i], touches[j]);
        if (dist > maxDistance) maxDistance = dist;
      }
    }
    return maxDistance;
  };

  const handlePreviewTouchStart = (event) => {
    if (event.cancelable) event.preventDefault();
    if (!activeCl || !activeRing || !previewRef.current) return;

    const touches = event.touches;
    if (touches.length === 1) {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startClusterX: activeCl.x,
        startClusterY: activeCl.y,
        hasMoved: false,
      };
      return;
    }

    if (touches.length >= 3) {
      const dist = touchSpread(touches);
      if (dist < MIN_PINCH_DISTANCE) return;
      gestureRef.current = {
        mode: "ringPinch",
        startDistance: dist,
        startRadius: activeRing.radius,
      };
      return;
    }

    if (touches.length === 2) {
      const dist = touchDistance(touches[0], touches[1]);
      if (dist < MIN_PINCH_DISTANCE) return;
      gestureRef.current = {
        mode: "pinch",
        startDistance: dist,
        startScale: activeCl.scale,
      };
      return;
    }
  };

  const handlePreviewTouchMove = (event) => {
    if (event.cancelable) event.preventDefault();
    if (!activeCl || !activeRing || !previewRef.current || !gestureRef.current)
      return;

    const rect = previewRef.current.getBoundingClientRect();
    const touches = event.touches;
    let gesture = gestureRef.current;

    // Three-finger pinch controls active ring scale.
    if (touches.length >= 3 && gesture.mode !== "ringPinch") {
      const dist = touchSpread(touches);
      if (dist >= MIN_PINCH_DISTANCE) {
        gestureRef.current = {
          mode: "ringPinch",
          startDistance: dist,
          startRadius: activeRing.radius,
        };
        gesture = gestureRef.current;
      }
    }

    // Seamlessly switch from drag to pinch when a second finger is added.
    if (touches.length === 2 && gesture.mode !== "pinch") {
      const dist = touchDistance(touches[0], touches[1]);
      if (dist >= MIN_PINCH_DISTANCE) {
        gestureRef.current = {
          mode: "pinch",
          startDistance: dist,
          startScale: activeCl.scale,
        };
        gesture = gestureRef.current;
      }
    }

    // Seamlessly switch from pinch back to drag when one finger remains.
    if (touches.length === 1 && gesture.mode !== "drag") {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startClusterX: activeCl.x,
        startClusterY: activeCl.y,
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

      const dx = (touches[0].clientX - gesture.startTouchX) / rect.width;
      const dy = (touches[0].clientY - gesture.startTouchY) / rect.height;
      updCl("x", clamp(gesture.startClusterX + dx, 0, 1));
      updCl("y", clamp(gesture.startClusterY + dy, 0, 1));
      return;
    }

    if (gesture.mode === "ringPinch" && touches.length >= 3) {
      const dist = touchSpread(touches);
      if (
        dist < MIN_PINCH_DISTANCE ||
        gesture.startDistance < MIN_PINCH_DISTANCE
      )
        return;
      const ratio = dist / gesture.startDistance;
      const newRadius = clamp(
        gesture.startRadius * ratio,
        MIN_RING_RADIUS,
        MAX_RING_RADIUS,
      );
      updRing("radius", newRadius);
      return;
    }

    if (gesture.mode === "pinch" && touches.length === 2) {
      const dist = touchDistance(touches[0], touches[1]);
      if (
        dist < MIN_PINCH_DISTANCE ||
        gesture.startDistance < MIN_PINCH_DISTANCE
      )
        return;
      const ratio = dist / gesture.startDistance;
      const newScale = clamp(gesture.startScale * ratio, 0.2, 3);
      updCl("scale", newScale);
      return;
    }
  };

  const handlePreviewTouchEnd = (event) => {
    if (event.cancelable) event.preventDefault();
    const touches = event.touches;
    if (touches.length === 0) {
      gestureRef.current = null;
      return;
    }

    if (touches.length >= 3 && activeRing) {
      const dist = touchSpread(touches);
      if (dist >= MIN_PINCH_DISTANCE) {
        gestureRef.current = {
          mode: "ringPinch",
          startDistance: dist,
          startRadius: activeRing.radius,
        };
      }
      return;
    }

    if (touches.length === 1 && activeCl) {
      gestureRef.current = {
        mode: "drag",
        startTouchX: touches[0].clientX,
        startTouchY: touches[0].clientY,
        startClusterX: activeCl.x,
        startClusterY: activeCl.y,
        hasMoved: false,
      };
      return;
    }

    if (touches.length === 2 && activeCl) {
      const dist = touchDistance(touches[0], touches[1]);
      if (dist >= MIN_PINCH_DISTANCE) {
        gestureRef.current = {
          mode: "pinch",
          startDistance: dist,
          startScale: activeCl.scale,
        };
      }
    }
  };

  if (!activeCl || !activeRing) return null;

  const handlePreviewWheel = (event) => {
    // Trackpad pinch is emitted as ctrl+wheel in many browsers.
    if (event.ctrlKey && event.cancelable) event.preventDefault();
  };

  useEffect(() => {
    const node = previewRef.current;
    if (!node) return undefined;

    // Safari emits non-standard gesture events for pinch zoom.
    const preventGestureZoom = (event) => {
      if (event.cancelable) event.preventDefault();
    };

    node.addEventListener("gesturestart", preventGestureZoom, {
      passive: false,
    });
    node.addEventListener("gesturechange", preventGestureZoom, {
      passive: false,
    });
    node.addEventListener("gestureend", preventGestureZoom, {
      passive: false,
    });

    return () => {
      node.removeEventListener("gesturestart", preventGestureZoom);
      node.removeEventListener("gesturechange", preventGestureZoom);
      node.removeEventListener("gestureend", preventGestureZoom);
    };
  }, []);

  const isTablet = viewportWidth <= 1280;
  const isMobile = viewportWidth <= 960;
  const previewW = isMobile
    ? Math.max(280, Math.min(600, viewportWidth - 36))
    : isTablet
      ? 520
      : 600;
  const previewH = Math.round((previewW * 2) / 3);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
        backgroundImage: `
          url(${bgImage.src})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: isMobile ? "auto" : "hidden",
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "32px 24px",
          background: "rgba(0, 0, 0, 0.8)",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div
            style={{
              fontSize: 42,
              fontSize: isMobile ? 30 : 42,
              fontWeight: 700,
              color: studioT.gold,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontFamily:
                "'Cormorant Garamond', 'Palatino Linotype', 'Times New Roman', serif",
              lineHeight: 1,
            }}
          >
            Ring Studio
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: isMobile ? "visible" : "hidden",
        }}
      >
        <div style={{ order: isMobile ? 2 : 1 }}>
          <RingStudioLeftPanel
            T={studioT}
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
            compactLayout={isMobile}
          />
        </div>

        <main
          role="region"
          aria-label="Postcard preview"
          style={{
            flex: 1,
            order: isMobile ? 1 : 2,
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "18px 12px 10px" : 24,
            gap: 10,

            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: studioT.mut,
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
            onWheel={handlePreviewWheel}
            style={{
              borderRadius: 6,
              boxShadow: `0 18px 40px ${studioT.shadow}`,
              border: `1px solid ${studioT.brd}`,
              touchAction: "none",
            }}
          >
            <CardCanvas
              clusters={clusters}
              bgColor={bgColor}
              W={previewW}
              H={previewH}
              library={library}
              activeClId={activeClusterId}
              activeRingId={activeRingId}
            />
          </div>
          <div
            style={{ fontSize: 10, color: studioT.mut, textAlign: "center" }}
          >
            Touch: one finger drag cluster, two finger pinch cluster scale,
            three finger pinch active ring scale.
          </div>
          <div
            style={{ fontSize: 10, color: studioT.mut, textAlign: "center" }}
          >
            Active ring:{" "}
            <span style={{ color: "#00e5ff", fontWeight: 700 }}>
              --- Cyan dashed
            </span>
            {"  ·  "}
            Active Cluster:{" "}
            <span style={{ color: "#FE28C9", fontWeight: 700 }}>
              ● Pink dot
            </span>
          </div>
        </main>

        <div style={{ order: 3 }}>
          <RingStudioRightPanel
            T={studioT}
            bgColor={bgColor}
            dispatch={dispatch}
            activeCl={activeCl}
            activeRing={activeRing}
            ringSetupMode={ringSetupMode}
            updCl={updCl}
            updRing={updRing}
            compactLayout={isMobile}
          />
        </div>
      </div>

      <div
        style={{
          position: isMobile ? "sticky" : "fixed",
          left: isMobile ? "auto" : "50%",
          bottom: isMobile ? 14 : 60,
          transform: isMobile ? "none" : "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          margin: isMobile ? "10px auto 16px" : 0,
          borderRadius: 999,
          background: "rgba(0, 0, 0, 0.82)",
          border: `1px solid ${studioT.brd}`,
          boxShadow: `0 12px 32px ${studioT.shadow}`,
          zIndex: 150,
        }}
      >
        <GlowButton variant="nav" onClick={goBack}>
          Back
        </GlowButton>
        <GlowButton variant="glow" onClick={finalize}>
          Finalize
        </GlowButton>
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
              width: "min(420px, 100%)",
              borderRadius: 18,
              background: "rgba(8, 8, 8, 0.96)",
              border: `1px solid ${studioT.brd}`,
              boxShadow: `0 24px 80px ${studioT.shadow}`,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                fontFamily:
                  "Garamond, 'Palatino Linotype', 'Times New Roman', serif",
                color: studioT.txt,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                textAlign: "center",
              }}
            >
              Create your own pattern
            </div>
            <div
              style={{
                fontSize: 12,
                maxWidth: "300px",
                lineHeight: 1.6,
                color: studioT.mut,
                textAlign: "center",
              }}
            >
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
                T={studioT}
                onClick={() => setShowPatternLabModal(false)}
                style={{
                  color: studioT.gold,
                  border: `1px solid ${studioT.brd}`,
                }}
              >
                Cancel
              </Button>
              <Button
                T={studioT}
                onClick={enterPatternLab}
                style={{
                  border: `1px solid ${studioT.brd}`,
                  background: "rgba(227, 176, 59, 0.16)",
                  color: "#f2c86a",
                }}
              >
                Open Pattern Lab
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
