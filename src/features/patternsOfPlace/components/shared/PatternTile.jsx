import { memo } from "react";
import { MOTIFS } from "../../data/motifs/motifRegistry.js";
import { presetFitScale } from "../../domain/geometry.js";

/**
 * Renders a layered motif composition at a given size.
 * Used in Pattern Lab preview and as preset tiles.
 */
export const PatternTile = memo(function PatternTile({
  layers,
  size,
  activeLayerId = null,
}) {
  const half = size / 2;
  const fit = presetFitScale(layers);
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        overflow: "visible",
      }}
    >
      {layers.map((layer) => {
        const MC = MOTIFS[layer.motifId] || MOTIFS[0];
        const sz = Math.max(4, Math.round(size * 0.5 * layer.scale * fit));
        const cx = half + layer.x * half * fit;
        const cy = half + layer.y * half * fit;
        const isActive = activeLayerId === layer.id;
        return (
          <div
            key={layer.id}
            style={{
              position: "absolute",
              left: cx - sz / 2,
              top: cy - sz / 2,
              width: sz,
              height: sz,
              transform: `rotate(${layer.rotation}deg)`,
              transformOrigin: "center",
              boxShadow: isActive
                ? "0 0 0 2px rgba(0,229,255,0.9), 0 0 18px rgba(0,229,255,0.45)"
                : "none",
              borderRadius: 6,
              zIndex: isActive ? 2 : 1,
            }}
          >
            <MC c={layer.colors} size={sz} />
          </div>
        );
      })}
    </div>
  );
});
