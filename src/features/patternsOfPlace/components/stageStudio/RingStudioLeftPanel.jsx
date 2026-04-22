import { Button } from "../shared/Button.jsx";
import { Divider } from "../shared/Divider.jsx";
import { ColorPicker } from "../shared/ColorPicker.jsx";
import { PatternTile } from "../shared/PatternTile.jsx";
import {
  ADD_CLUSTER,
  DUPLICATE_CLUSTER,
  REMOVE_CLUSTER,
  SET_ACTIVE_CLUSTER,
  ADD_RING,
  DUPLICATE_RING,
  REMOVE_RING,
  SET_ACTIVE_RING,
  SET_RING_SETUP_MODE,
} from "../../app/actions.js";
import { SELECTABLE_MOTIFS } from "../../data/motifs/motifRegistry.js";
import {
  MAX_CLUSTERS,
  MAX_RINGS_PER_CLUSTER,
} from "../../data/constants/defaults.js";
import { FONT } from "../../data/constants/themes.js";
import { STATIC_PATTERN_PRESETS } from "../../data/constants/patternPresets.js";

export function RingStudioLeftPanel({
  T,
  clusters,
  activeClusterId,
  activeCl,
  activeRing,
  activeRingId,
  library,
  ringSetupMode,
  dispatch,
  updRing,
  onCreatePattern,
}) {
  const isClusterLimitReached = clusters.length >= MAX_CLUSTERS;
  const presetOptions = [...library, ...STATIC_PATTERN_PRESETS];

  const getPresetPreviewSrc = (preset) => {
    const source = preset?.svgSrc;
    if (!source) return null;
    return typeof source === "string" ? source : source.src;
  };

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

  const panelCardStyle = {
    padding: 10,
    borderRadius: 6,
    border: `1px solid ${T.brd}`,
    background: "rgba(5, 5, 5, 0.9)",
    marginBottom: 10,
  };

  const pillStyle = (isActive) => ({
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 800,
    fontFamily: FONT,
    border: `1px solid ${isActive ? T.gold : T.brd}`,
    background: isActive ? "rgba(227, 176, 59, 0.2)" : "rgba(0, 0, 0, 0.74)",
    color: isActive ? T.gold : T.txt,
    cursor: "pointer",
    borderRadius: 999,
    minHeight: 38,
    boxShadow: isActive ? `0 0 0 1px ${T.gold}55` : "none",
  });

  return (
    <aside
      style={{
        width: 380,
        flexShrink: 0,
        height: "100%",
        minHeight: 0,
        overflowY: "auto",
        overscrollBehavior: "contain",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(8, 8, 8, 0.58)",
        backdropFilter: "blur(10px) saturate(120%)",
        WebkitBackdropFilter: "blur(10px) saturate(120%)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ marginBottom: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 12,
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
              lineHeight: 1,
            }}
          >
            Clusters ({clusters.length}/{MAX_CLUSTERS})
          </div>
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
              onClick={() => dispatch({ type: ADD_CLUSTER })}
              disabled={isClusterLimitReached}
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
              onClick={() =>
                dispatch({ type: DUPLICATE_CLUSTER, id: activeClusterId })
              }
              disabled={isClusterLimitReached}
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
              onClick={() =>
                dispatch({ type: REMOVE_CLUSTER, id: activeClusterId })
              }
              disabled={clusters.length <= 1}
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
            minHeight: 120,
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${T.brd}`,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignContent: "flex-start",
          }}
        >
          {clusters.map((cl, i) => {
            const isActive = activeClusterId === cl.id;
            return (
              <button
                key={cl.id}
                onClick={() =>
                  dispatch({ type: SET_ACTIVE_CLUSTER, id: cl.id })
                }
                style={{
                  padding: "8px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: FONT,
                  border: `1px solid ${isActive ? T.gold : T.brd}`,
                  background: isActive
                    ? "rgba(227, 176, 59, 0.2)"
                    : "rgba(0, 0, 0, 0.74)",
                  color: isActive ? T.gold : T.txt,
                  cursor: "pointer",
                  borderRadius: 999,
                  minHeight: 38,
                  boxShadow: isActive ? `0 0 0 1px ${T.gold}55` : "none",
                }}
              >
                Cluster {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 12,
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
              lineHeight: 1,
            }}
          >
            Rings ({activeCl.rings.length}/{MAX_RINGS_PER_CLUSTER})
          </div>
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
              onClick={() => dispatch({ type: ADD_RING })}
              disabled={activeCl.rings.length >= MAX_RINGS_PER_CLUSTER}
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
              onClick={() =>
                dispatch({ type: DUPLICATE_RING, id: activeRingId })
              }
              disabled={activeCl.rings.length >= MAX_RINGS_PER_CLUSTER}
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
              onClick={() => dispatch({ type: REMOVE_RING, id: activeRingId })}
              disabled={activeCl.rings.length <= 1}
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
            minHeight: 120,
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${T.brd}`,
            background: "rgba(0, 0, 0, 0.88)",
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignContent: "flex-start",
          }}
        >
          {activeCl.rings.map((ring, index) => {
            const isActive = activeRingId === ring.id;
            return (
              <button
                key={ring.id}
                onClick={() =>
                  dispatch({
                    type: SET_ACTIVE_RING,
                    clusterId: activeClusterId,
                    id: ring.id,
                  })
                }
                style={pillStyle(isActive)}
              >
                Ring {index + 1}
              </button>
            );
          })}
        </div>
      </div>
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
        Pattern Picker
      </div>
      <div style={panelCardStyle}>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {["motif", "preset"].map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch({ type: SET_RING_SETUP_MODE, mode: tab })}
              style={{
                flex: 1,
                padding: "7px 7px 4px 7px",
                fontSize: 14,
                textTransform: "uppercase",
                fontWeight: 500,
                fontFamily: FONT,
                border: `1px solid ${ringSetupMode === tab ? T.gold : T.brd}`,
                background:
                  ringSetupMode === tab
                    ? "rgba(227, 176, 59, 0.16)"
                    : "rgba(0, 0, 0, 0.74)",
                color: ringSetupMode === tab ? T.gold : T.mut,
                cursor: "pointer",
                borderRadius: 8,
                minHeight: 36,
              }}
            >
              {tab === "motif" ? "Motif" : "Pattern Preset"}
            </button>
          ))}
        </div>

        {ringSetupMode === "motif" ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                marginBottom: 8,
                marginTop: 14,
              }}
            >
              {SELECTABLE_MOTIFS.map(
                ({ id, previewComponent: MCP, name, previewColors }) => {
                  const isActive = activeRing.motifId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        updRing("motifId", id);
                        updRing("presetId", null);
                        updRing("patternLayers", null);
                      }}
                      aria-label={name}
                      style={{
                        aspectRatio: "1",
                        padding: 2,
                        border: `1.5px solid ${isActive ? T.gold : T.brd}`,
                        background: isActive
                          ? "rgba(227, 176, 59, 0.16)"
                          : "rgba(0, 0, 0, 0.74)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: isActive ? `0 0 0 1px ${T.gold}55` : "none",
                      }}
                    >
                      <MCP size={46} />
                    </button>
                  );
                },
              )}
            </div>
            <Button
              small
              variant="primary"
              T={T}
              onClick={onCreatePattern}
              style={{
                width: "100%",
                fontSize: 12,
                padding: "8px 10px",
                minHeight: 38,
                marginTop: 2,
                fontWeight: 600,
                textTransform: "capitalize",
                border: `1px solid ${T.brd}`,
                background: "rgba(227, 176, 59, 0.16)",
                color: "#f2c86a",
              }}
            >
              Create your own pattern
            </Button>
          </>
        ) : (
          <>
            {presetOptions.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 6,
                  marginBottom: 8,
                  marginTop: 14,
                }}
              >
                {presetOptions.map((preset) => {
                  const isActive = activeRing.presetId === preset.id;
                  const previewSrc = getPresetPreviewSrc(preset);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updRing("presetId", preset.id);
                        updRing("patternLayers", preset.layers ?? null);
                      }}
                      aria-label={preset.name}
                      style={{
                        aspectRatio: "1",
                        padding: 2,
                        border: `1.5px solid ${isActive ? T.gold : T.brd}`,
                        background: isActive
                          ? "rgba(227, 176, 59, 0.16)"
                          : "rgba(0, 0, 0, 0.74)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        overflow: "hidden",
                        boxShadow: isActive ? `0 0 0 1px ${T.gold}55` : "none",
                      }}
                    >
                      {previewSrc ? (
                        <img
                          src={previewSrc}
                          alt={preset.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <PatternTile layers={preset.layers} size={46} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  fontSize: 11,
                  color: T.mut,
                  padding: 8,
                  background: T.surf2,
                  borderRadius: 8,
                  marginBottom: 8,
                  marginTop: 14,
                }}
              >
                No presets yet. Go back to Pattern Lab to create some.
              </div>
            )}
            <Button
              small
              variant="primary"
              T={T}
              onClick={onCreatePattern}
              style={{
                width: "100%",
                fontSize: 12,
                padding: "8px 10px",
                minHeight: 38,
                marginTop: 2,
                fontWeight: 600,
                textTransform: "capitalize",
                border: `1px solid ${T.brd}`,
                background: "rgba(227, 176, 59, 0.16)",
                color: "#f2c86a",
              }}
            >
              Create your own pattern
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
