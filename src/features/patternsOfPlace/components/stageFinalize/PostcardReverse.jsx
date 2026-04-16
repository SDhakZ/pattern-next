import { MOTIFS } from "../../data/motifs/motifRegistry.js";
import { PatternTile } from "../shared/PatternTile.jsx";
import { CardCanvas } from "../shared/CardCanvas.jsx";
import { tangentSize, polar } from "../../domain/geometry.js";
import { DEFAULT_COLORS } from "../../data/constants/defaults.js";
import { FONT } from "../../data/constants/themes.js";

/**
 * Renders the postcard reverse side.
 *
 * Each item in `reverseRings` is a ring entity identical in shape to Studio rings,
 * but positioned at (x, y) fractions of W/H rather than belonging to a cluster.
 * radius uses the same H=480 reference scale as Studio rings.
 */
export function PostcardReverse({
  T,
  bgColor,
  W,
  H,
  reverseRings = [],
  library = [],
  activeRingId = null,
  template = "default",
  clusters = [],
}) {
  const pad = Math.round(H * 0.08);
  const padRight = Math.round(H * 0.07);
  const sc = H / 480; // scale factor for rings, matches Studio convention
  const renderClusters = (scaleW = W) =>
    clusters.map((cl) => {
      const ox = cl.x * scaleW;
      const oy = cl.y * H;
      return (
        <div
          key={cl.id}
          style={{
            position: "absolute",
            left: ox,
            top: oy,
            width: 0,
            height: 0,
          }}
        >
          {cl.rings.map((r) => {
            const preset = library.find((p) => p.id === r.presetId);
            const rs = r.radius * sc;
            const tileSize = Math.max(5, tangentSize(rs, r.count));
            const MC = MOTIFS[r.motifId ?? 0] || MOTIFS[0];
            return (
              <div
                key={r.id}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 0,
                  height: 0,
                }}
              >
                {Array.from({ length: r.count }).map((_, mi) => {
                  const angle = (360 / r.count) * mi;
                  const pos = polar(rs, angle);
                  return (
                    <div
                      key={mi}
                      style={{
                        position: "absolute",
                        left: pos.x,
                        top: pos.y,
                        transform: `translate(-50%,-50%) rotate(${angle}deg)`,
                        width: tileSize,
                        height: tileSize,
                      }}
                    >
                      {preset ? (
                        <PatternTile layers={preset.layers} size={tileSize} />
                      ) : (
                        <MC c={r.colors ?? DEFAULT_COLORS} size={tileSize} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    });
  const borderStyle = { border: `1px solid ${T.brd}` };

  return (
    <div
      style={{
        width: W,
        height: H,
        background: bgColor,
        borderRadius: 6,
        position: "relative",
        flexShrink: 0,
        fontFamily: FONT,
        overflow: "hidden",
        ...borderStyle,
      }}
    >
      <>
        <CardCanvas
          clusters={clusters}
          bgColor={bgColor}
          W={W}
          H={H}
          library={library}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: pad,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRight: `1px solid white`,
              position: "relative",
              zIndex: 1,
              background: "rgba(0,0,0,0.7)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 8,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "white",
                  marginBottom: 16,
                }}
              >
                Note
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{ height: 1, background: "white", marginBottom: 18 }}
                />
              ))}
            </div>
            <div>
              <div
                style={{
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "white",
                  marginBottom: 8,
                }}
              >
                From
              </div>
              <div
                style={{ height: 1, background: "white", marginBottom: 8 }}
              />
              <div
                style={{
                  fontSize: 9,
                  color: "white",
                  letterSpacing: "0.1em",
                  marginTop: 14,
                }}
              >
                Patterns of Place · 2026
              </div>
            </div>
          </div>
          <div
            style={{
              width: "30%",
              padding: padRight,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              position: "relative",
              zIndex: 1,
              background: "rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 7,
                  color: "white",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                To
              </div>
              {[90, 74, 74, 55].map((w, i) => (
                <div
                  key={i}
                  style={{ height: 1, width: `${w}%`, background: "white" }}
                />
              ))}
            </div>
          </div>
        </div>
      </>

      {reverseRings.map((ring) => {
        const preset = library.find((p) => p.id === ring.presetId);
        const rs = ring.radius * sc;
        const tileSize = Math.max(5, tangentSize(rs, ring.count));
        const MC = MOTIFS[ring.motifId ?? 0] || MOTIFS[0];
        const ox = ring.x * W;
        const oy = ring.y * H;
        const isActive = ring.id === activeRingId;

        return (
          <div
            key={ring.id}
            style={{
              position: "absolute",
              left: ox,
              top: oy,
              width: 0,
              height: 0,
              zIndex: 2,
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  left: -(rs + 5),
                  top: -(rs + 5),
                  width: (rs + 5) * 2,
                  height: (rs + 5) * 2,
                  borderRadius: "50%",
                  border: "2.5px dashed #00e5ff",
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.4),0 0 14px #00e5ff,0 0 28px rgba(0,229,255,0.25)",
                  pointerEvents: "none",
                }}
              />
            )}

            {Array.from({ length: ring.count }).map((_, mi) => {
              const angle = (360 / ring.count) * mi;
              const pos = polar(rs, angle);
              return (
                <div
                  key={mi}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: tileSize,
                    height: tileSize,
                    transform: `translate(-50%,-50%) rotate(${angle}deg)`,
                    pointerEvents: "none",
                  }}
                >
                  {preset ? (
                    <PatternTile layers={preset.layers} size={tileSize} />
                  ) : (
                    <MC c={ring.colors ?? DEFAULT_COLORS} size={tileSize} />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
