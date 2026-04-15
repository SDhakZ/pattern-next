import { Button } from "../shared/Button.jsx";
import { Divider } from "../shared/Divider.jsx";
import { Label } from "../shared/Label.jsx";
import { ColorPicker } from "../shared/ColorPicker.jsx";
import { PatternTile } from "../shared/PatternTile.jsx";
import {
  ADD_CLUSTER,
  REMOVE_CLUSTER,
  SET_ACTIVE_CLUSTER,
  ADD_RING,
  REMOVE_RING,
  SET_ACTIVE_RING,
  SET_RING_SETUP_MODE,
} from "../../app/actions.js";
import { SELECTABLE_MOTIFS } from "../../data/motifs/motifRegistry.js";
import {
  DEFAULT_COLORS,
  MAX_RINGS_PER_CLUSTER,
} from "../../data/constants/defaults.js";
import { FONT } from "../../data/constants/themes.js";

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
  const panelCardStyle = {
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${T.brd}`,
    background: T.surf1,
    marginBottom: 10,
  };

  const pillStyle = (isActive) => ({
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 800,
    fontFamily: FONT,
    border: `1px solid ${isActive ? T.gold : T.brd}`,
    background: isActive ? `${T.gold}18` : T.bg,
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
          Step 3 / 4
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.txt }}>
          Ring Studio
        </div>
      </div>

      <Divider T={T} />

      <div
        style={{
          padding: 10,
          borderRadius: 12,
          border: `1px solid ${T.brd}`,
          background: T.surf1,
          marginBottom: 10,
        }}
      >
        <Label T={T}>Clusters ({clusters.length})</Label>
        <div
          style={{ fontSize: 10, color: T.mut, marginTop: 2, marginBottom: 8 }}
        >
          Choose the cluster you want to edit.
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <Button
            small
            variant="secondary"
            T={T}
            onClick={() => dispatch({ type: ADD_CLUSTER })}
            style={{ fontSize: 10, padding: "8px 10px", minHeight: 38 }}
          >
            + Add cluster
          </Button>
          <Button
            small
            variant="danger"
            T={T}
            onClick={() =>
              dispatch({ type: REMOVE_CLUSTER, id: activeClusterId })
            }
            disabled={clusters.length <= 1}
            style={{ fontSize: 10, padding: "8px 10px", minHeight: 38 }}
          >
            Remove
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
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
                  background: isActive ? `${T.gold}18` : T.bg,
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

      <div style={panelCardStyle}>
        <Label T={T}>
          Rings ({activeCl.rings.length}/{MAX_RINGS_PER_CLUSTER})
        </Label>
        <div
          style={{ fontSize: 10, color: T.mut, marginTop: 2, marginBottom: 8 }}
        >
          Pick a ring, then adjust its size and motif.
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <Button
            small
            variant="secondary"
            T={T}
            onClick={() => dispatch({ type: ADD_RING })}
            disabled={activeCl.rings.length >= MAX_RINGS_PER_CLUSTER}
            style={{ fontSize: 10, padding: "8px 10px", minHeight: 38 }}
          >
            + Add ring
          </Button>
          <Button
            small
            variant="danger"
            T={T}
            onClick={() => dispatch({ type: REMOVE_RING, id: activeRingId })}
            disabled={activeCl.rings.length <= 1}
            style={{ fontSize: 10, padding: "8px 10px", minHeight: 38 }}
          >
            Remove
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {activeCl.rings.map((ring, index) => {
            const isActive = activeRingId === ring.id;
            return (
              <button
                key={ring.id}
                onClick={() => dispatch({ type: SET_ACTIVE_RING, id: ring.id })}
                style={pillStyle(isActive)}
              >
                Ring {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div style={panelCardStyle}>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {["motif", "preset"].map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch({ type: SET_RING_SETUP_MODE, mode: tab })}
              style={{
                flex: 1,
                padding: "7px 8px",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: FONT,
                border: `1px solid ${ringSetupMode === tab ? T.gold : T.brd}`,
                background: ringSetupMode === tab ? `${T.gold}14` : T.bg,
                color: ringSetupMode === tab ? T.gold : T.mut,
                cursor: "pointer",
                borderRadius: 8,
                minHeight: 36,
              }}
            >
              {tab === "motif" ? "Single Motif" : "Preset Tile"}
            </button>
          ))}
        </div>

        {ringSetupMode === "motif" ? (
          <>
            <Button
              small
              variant="primary"
              T={T}
              onClick={onCreatePattern}
              style={{
                width: "100%",
                fontSize: 10,
                padding: "8px 10px",
                minHeight: 38,
                marginBottom: 8,
              }}
            >
              Create your own pattern
            </Button>
            <Label T={T}>Pattern Picker</Label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
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
                      padding: 2,
                      border: `1.5px solid ${isActive ? T.gold : T.brd}`,
                      background: isActive ? `${T.gold}14` : T.bg,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      overflow: "hidden",
                      boxShadow: isActive ? `0 0 0 1px ${T.gold}55` : "none",
                    }}
                  >
                    <MC c={activeRing.colors ?? DEFAULT_COLORS} size={46} />
                  </button>
                );
              })}
            </div>
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
                {library.map((preset) => {
                  const isActive = activeRing.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updRing("presetId", preset.id);
                        updRing("motifId", undefined);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: 8,
                        border: `1px solid ${isActive ? T.gold : T.brd}`,
                        background: isActive ? `${T.gold}14` : T.bg,
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        boxShadow: isActive ? `0 0 0 1px ${T.gold}55` : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          background: "#111",
                          borderRadius: 6,
                          flexShrink: 0,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PatternTile layers={preset.layers} size={38} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: T.txt,
                          }}
                        >
                          {preset.name}
                        </div>
                        <div
                          style={{ fontSize: 9, color: T.mut, marginTop: 1 }}
                        >
                          Tap to apply preset tile
                        </div>
                      </div>
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
                }}
              >
                No presets yet. Go back to Pattern Lab to create some.
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
