import { memo } from "react";
import { MOTIFS } from "../../data/motifs/motifRegistry.js";
import { PatternTile } from "./PatternTile.jsx";
import { tangentSize, polar } from "../../domain/geometry.js";
import { DEFAULT_COLORS } from "../../data/constants/defaults.js";

/**
 * Renders the postcard canvas: clusters of rings of motifs on a background.
 * activeClId / activeRingId drive the highlight overlays (cyan ring, orange dot).
 */
export const CardCanvas = memo(function CardCanvas({
  clusters,
  bgColor,
  W,
  H,
  library,
  activeClId = null,
  activeRingId = null,
}) {
  const sc = H / 480;

  return (
    <div
      style={{
        width: W,
        height: H,
        background: bgColor,
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
        flexShrink: 0,
      }}
    >
      {/* subtle inner border */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 4,
          pointerEvents: "none",
        }}
      />

      {clusters.map((cl) => {
        const s = sc * cl.scale;
        const ox = cl.x * W;
        const oy = cl.y * H;
        const isActiveCl = cl.id === activeClId;

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
              const rs = r.radius * s;
              const tileSize = Math.max(5, tangentSize(rs, r.count));
              const isActiveR = isActiveCl && r.id === activeRingId;
              const MC = MOTIFS[r.motifId ?? 0] || MOTIFS[0];

              return (
                <div key={r.id}>
                  {isActiveR && (
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
                          "0 0 0 1px rgba(0,0,0,0.5),0 0 16px #00e5ff,0 0 32px rgba(0,229,255,0.3)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
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
                          width: tileSize,
                          height: tileSize,
                          transform: `translate(-50%,-50%) rotate(${angle}deg)`,
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

            {isActiveCl && (
              <div
                style={{
                  position: "absolute",
                  left: -9,
                  top: -9,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ff6b35",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.6),0 0 10px #ff6b35",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
