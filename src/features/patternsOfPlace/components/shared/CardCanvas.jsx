import { memo } from "react";
import { MOTIFS } from "../../data/motifs/motifRegistry.js";
import { PatternTile } from "./PatternTile.jsx";
import { tangentSize, polar } from "../../domain/geometry.js";
import { DEFAULT_COLORS } from "../../data/constants/defaults.js";
import { renderNewMotifMarkup } from "../../data/motifs/newMotifs.jsx";
import { STATIC_PATTERN_PRESETS } from "../../data/constants/patternPresets.js";

function sanitizeScopeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function scopeMotifMarkup(markup, scopeId) {
  if (!markup) return markup;
  const prefix = `sc_${sanitizeScopeId(scopeId)}_`;

  // Scope style selectors such as `.cls-1, .cls-2` to avoid global class collisions.
  let scoped = markup.replace(/\.cls-([a-zA-Z0-9_-]+)/g, `.${prefix}cls-$1`);

  // Scope class attributes on SVG nodes to match rewritten selectors.
  scoped = scoped.replace(/class="([^"]+)"/g, (_, classValue) => {
    const nextClassValue = classValue
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => (name.startsWith("cls-") ? `${prefix}${name}` : name))
      .join(" ");

    return `class="${nextClassValue}"`;
  });

  return scoped;
}

function getPresetPreviewSrc(preset) {
  const source = preset?.svgSrc;
  if (!source) return null;
  return typeof source === "string" ? source : source.src;
}

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
  const presetLibrary = [...STATIC_PATTERN_PRESETS, ...library];

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
              const ringPatternLayers = Array.isArray(r.patternLayers)
                ? r.patternLayers
                : null;
              const preset = ringPatternLayers
                ? null
                : presetLibrary.find((p) => p.id === r.presetId);
              const presetPreviewSrc = getPresetPreviewSrc(preset);
              const rs = r.radius * s;
              const tileSize = Math.max(5, tangentSize(rs, r.count));
              const isActiveR = isActiveCl && r.id === activeRingId;
              const MC = MOTIFS[r.motifId ?? 0] || MOTIFS[0];
              const motifMarkup = renderNewMotifMarkup(
                r.motifId ?? 0,
                r.colors ?? DEFAULT_COLORS,
              );
              const scopedMotifMarkup = motifMarkup
                ? scopeMotifMarkup(motifMarkup, `${cl.id}_${r.id}`)
                : null;

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
                        {ringPatternLayers ? (
                          <PatternTile
                            layers={ringPatternLayers}
                            size={tileSize}
                          />
                        ) : preset?.layers ? (
                          <PatternTile layers={preset.layers} size={tileSize} />
                        ) : presetPreviewSrc ? (
                          <img
                            src={presetPreviewSrc}
                            alt={preset.name}
                            width={tileSize}
                            height={tileSize}
                            style={{ display: "block", objectFit: "contain" }}
                          />
                        ) : motifMarkup ? (
                          <div
                            style={{ width: tileSize, height: tileSize }}
                            dangerouslySetInnerHTML={{
                              __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${tileSize}" height="${tileSize}" style="display:block">${scopedMotifMarkup}</svg>`,
                            }}
                          />
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
                  background: "#FE28C9",
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.6),0 0 10px #FE28C9",
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
