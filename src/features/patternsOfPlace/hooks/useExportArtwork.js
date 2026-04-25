import { useCallback } from "react";
import { tangentSize, polar, presetFitScale } from "../domain/geometry.js";
import { DEFAULT_COLORS } from "../data/constants/defaults.js";
import { triggerDownload, svgStringToCanvas } from "../utils/download.js";
import { renderNewMotifMarkup } from "../data/motifs/newMotifs.jsx";
import { STATIC_PATTERN_PRESETS } from "../data/constants/patternPresets.js";
import { getAdaptiveColors } from "../utils/colorUtils.js";
import {
  loadImage,
  motifMarkupToDataUrl,
  buildLayerTileSource,
  buildImageTileSource,
  drawArcWarpedTile,
} from "../utils/arcWarpCanvas.js";

// ─── Inline SVG helpers ───────────────────────────────────────────────────────

function sanitizeScopeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function scopeMotifMarkup(markup, scopeId) {
  if (!markup) return markup;
  const prefix = `sc_${sanitizeScopeId(scopeId)}_`;

  let scoped = markup.replace(/\.cls-([a-zA-Z0-9_-]+)/g, `.${prefix}cls-$1`);
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

function getInlineSVG(id, a, b, c, d, e) {
  const rendered = renderNewMotifMarkup(id, [a, b, c, d, e]);
  if (rendered) return rendered;

  // Fallback: empty SVG placeholder for unknown ids
  return `<rect width="1000" height="1000" fill="${a}"/>`;
}

function getStaticPresetSrc(preset) {
  if (!preset?.svgSrc) return null;
  return typeof preset.svgSrc === "string"
    ? preset.svgSrc
    : (preset.svgSrc?.src ?? null);
}

async function fetchSvgDataUrl(src) {
  try {
    const res = await fetch(src);
    const text = await res.text();
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}`;
  } catch {
    return null;
  }
}

// ─── Canvas front builder (arc-warped, matches preview) ───────────────────────

async function buildFrontCanvas(clusters, bgColor, library, W, H) {
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // Subtle inner border
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const bx = 10,
    by = 10,
    bw = W - 20,
    bh = H - 20,
    br = 4;
  ctx.moveTo(bx + br, by);
  ctx.lineTo(bx + bw - br, by);
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
  ctx.lineTo(bx + bw, by + bh - br);
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
  ctx.lineTo(bx + br, by + bh);
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
  ctx.lineTo(bx, by + br);
  ctx.quadraticCurveTo(bx, by, bx + br, by);
  ctx.closePath();
  ctx.stroke();

  const sc = H / 480;
  const allPresets = [...STATIC_PATTERN_PRESETS, ...library];

  // Pre-fetch all unique SVG src URLs needed for static presets
  const svgSrcCache = new Map();
  clusters.forEach((cl) => {
    cl.rings.forEach((r) => {
      if (!Array.isArray(r.patternLayers)) {
        const preset = allPresets.find((p) => p.id === r.presetId);
        if (preset && !preset.layers) {
          const src = getStaticPresetSrc(preset);
          if (src && !svgSrcCache.has(src)) svgSrcCache.set(src, null);
        }
      }
    });
  });
  await Promise.all(
    [...svgSrcCache.keys()].map(async (src) => {
      svgSrcCache.set(src, await fetchSvgDataUrl(src));
    }),
  );

  for (const cl of clusters) {
    const s = sc * cl.scale;
    const ox = cl.x * W;
    const oy = cl.y * H;

    for (const r of cl.rings) {
      const ringPatternLayers = Array.isArray(r.patternLayers)
        ? r.patternLayers
        : null;
      const preset = ringPatternLayers
        ? null
        : allPresets.find((p) => p.id === r.presetId);
      const tileLayers = ringPatternLayers ?? preset?.layers ?? null;
      const presetSrc = !tileLayers ? getStaticPresetSrc(preset) : null;
      const presetDataUrl = presetSrc ? svgSrcCache.get(presetSrc) : null;
      const shouldArcWarp = Boolean(tileLayers || presetDataUrl);

      const rs = r.radius * s;
      const tileSize = Math.max(5, tangentSize(rs, r.count));
      const safeTileSize = Math.max(6, Math.round(tileSize));

      if (shouldArcWarp && r.count >= 2) {
        let source = null;
        try {
          source = tileLayers
            ? await buildLayerTileSource(tileLayers, safeTileSize)
            : await buildImageTileSource(presetDataUrl, safeTileSize);
        } catch {
          source = null;
        }

        if (source) {
          const angleSpan = (Math.PI * 2) / r.count;
          const outerR = rs + tileSize / 2;
          const innerR = Math.max(2, rs - tileSize / 2);
          const slices = Math.max(48, Math.round(tileSize * 1.25));

          for (let i = 0; i < r.count; i++) {
            const angleDeg = (360 / r.count) * i;
            const centerAngle = ((angleDeg - 90) * Math.PI) / 180;
            const startAngle = centerAngle - angleSpan / 2;
            const endAngle = centerAngle + angleSpan / 2;

            ctx.save();
            ctx.translate(ox, oy);
            drawArcWarpedTile(
              ctx,
              source,
              0,
              0,
              innerR,
              outerR,
              startAngle,
              endAngle,
              slices,
            );
            ctx.restore();
          }
        }
      } else {
        // Single motif — place at each position without arc warp (matches preview)
        const motifUrl = motifMarkupToDataUrl(
          r.motifId ?? 0,
          r.colors ?? DEFAULT_COLORS,
          safeTileSize,
        );
        let motifImg = null;
        try {
          motifImg = await loadImage(motifUrl);
        } catch {
          motifImg = null;
        }
        if (!motifImg) continue;

        for (let mi = 0; mi < r.count; mi++) {
          const angle = (360 / r.count) * mi;
          const { x, y } = polar(rs, angle);
          ctx.save();
          ctx.translate(ox + x, oy + y);
          ctx.rotate((angle * Math.PI) / 180);
          ctx.drawImage(
            motifImg,
            -safeTileSize / 2,
            -safeTileSize / 2,
            safeTileSize,
            safeTileSize,
          );
          ctx.restore();
        }
      }
    }
  }

  return canvas;
}

// ─── SVG front builder (used for QR code / SVG download) ─────────────────────

async function buildFrontSVG(clusters, bgColor, library, W, H) {
  const sc = H / 480;
  const allPresets = [...STATIC_PATTERN_PRESETS, ...library];

  // Collect unique SVG src URLs needed for static presets
  const svgSrcMap = new Map();
  clusters.forEach((cl) => {
    cl.rings.forEach((r) => {
      if (!Array.isArray(r.patternLayers)) {
        const preset = allPresets.find((p) => p.id === r.presetId);
        if (preset && !preset.layers) {
          const src = getStaticPresetSrc(preset);
          if (src && !svgSrcMap.has(src)) svgSrcMap.set(src, null);
        }
      }
    });
  });

  await Promise.all(
    [...svgSrcMap.keys()].map(async (src) => {
      svgSrcMap.set(src, await fetchSvgDataUrl(src));
    }),
  );

  const parts = [];

  clusters.forEach((cl) => {
    const s = sc * cl.scale;
    const ox = cl.x * W;
    const oy = cl.y * H;
    cl.rings.forEach((r) => {
      const ringPatternLayers = Array.isArray(r.patternLayers)
        ? r.patternLayers
        : null;
      const preset = ringPatternLayers
        ? null
        : allPresets.find((p) => p.id === r.presetId);
      const tileLayers = ringPatternLayers ?? preset?.layers ?? null;
      const presetSrc = !tileLayers ? getStaticPresetSrc(preset) : null;
      const presetDataUrl = presetSrc ? svgSrcMap.get(presetSrc) : null;
      const rs = r.radius * s;
      const tileSize = Math.max(5, tangentSize(rs, r.count));
      const presetFit = tileLayers ? presetFitScale(tileLayers) : 1;
      for (let mi = 0; mi < r.count; mi++) {
        const angle = (360 / r.count) * mi;
        const { x, y } = polar(rs, angle);
        const cx = ox + x,
          cy = oy + y;
        if (tileLayers) {
          const tileX = cx - tileSize / 2;
          const tileY = cy - tileSize / 2;
          const half = tileSize / 2;
          tileLayers.forEach((layer) => {
            const sz = Math.max(
              4,
              Math.round(tileSize * 0.5 * layer.scale * presetFit),
            );
            const lx = half + layer.x * half * presetFit - sz / 2;
            const ly = half + layer.y * half * presetFit - sz / 2;
            const [la, lb, lc, ld, le] = layer.colors;
            const sc1000 = (sz / 1000).toFixed(6);
            const scopedMarkup = scopeMotifMarkup(
              getInlineSVG(layer.motifId, la, lb, lc, ld, le),
              `front_${cl.id}_${r.id}_${mi}_${layer.id}`,
            );
            parts.push(
              `<g transform="translate(${tileX.toFixed(2)},${tileY.toFixed(2)}) rotate(${angle.toFixed(2)},${half.toFixed(2)},${half.toFixed(2)})"><g transform="translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${layer.rotation.toFixed(2)},${(sz / 2).toFixed(2)},${(sz / 2).toFixed(2)}) scale(${sc1000})">${scopedMarkup}</g></g>`,
            );
          });
        } else if (presetDataUrl) {
          parts.push(
            `<image href="${presetDataUrl}" x="0" y="0" width="${tileSize.toFixed(2)}" height="${tileSize.toFixed(2)}" transform="translate(${(cx - tileSize / 2).toFixed(2)},${(cy - tileSize / 2).toFixed(2)}) rotate(${angle.toFixed(2)},${(tileSize / 2).toFixed(2)},${(tileSize / 2).toFixed(2)})"/>`,
          );
        } else if (r.motifId !== undefined) {
          const [ra, rb, rc, rd, re] = r.colors ?? DEFAULT_COLORS;
          const sc1000 = (tileSize / 1000).toFixed(6);
          const scopedMarkup = scopeMotifMarkup(
            getInlineSVG(r.motifId, ra, rb, rc, rd, re),
            `front_${cl.id}_${r.id}_${mi}`,
          );
          parts.push(
            `<g transform="translate(${(cx - tileSize / 2).toFixed(2)},${(cy - tileSize / 2).toFixed(2)}) rotate(${angle.toFixed(2)},${(tileSize / 2).toFixed(2)},${(tileSize / 2).toFixed(2)}) scale(${sc1000})">${scopedMarkup}</g>`,
          );
        }
      }
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bgColor}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="4" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>${parts.join("")}</svg>`;
}

// ─── Reverse SVG builder ──────────────────────────────────────────────────────

function buildReverseSVG(
  _reverseRings,
  bgColor,
  library,
  T,
  W,
  H,
  template = "default",
  clusters = [],
) {
  const sc = H / 480; // ring scale — same reference as preview
  const layoutSc = H / 440; // layout scale — matches preview canvas height
  const pad = Math.round(H * 0.08);
  const padRight = Math.round(H * 0.07);
  const leftW = Math.round(W * 0.7); // note area
  const rightX = leftW; // right area starts here
  const rightW = W - leftW;

  const font = "DM Sans,Helvetica Neue,system-ui,sans-serif";
  const fsLabel = Math.round(8 * layoutSc); // small uppercase labels
  const fsBody = Math.round(9 * layoutSc); // branding line
  const fsTiny = Math.round(7 * layoutSc); // "To" label

  // Get adaptive colors based on background luminance
  const colors = getAdaptiveColors(bgColor, T);
  const brd = colors.brd;
  const mut = colors.brd;
  const dim = colors.brd;

  const parts = [];

  // Background
  parts.push(`<rect width="${W}" height="${H}" fill="${bgColor}"/>`);

  // Vertical separator between note and address areas
  parts.push(
    `<line x1="${leftW}" y1="0" x2="${leftW}" y2="${H}" stroke="${brd}" stroke-width="1.5"/>`,
  );

  // ── Note area ──
  const noteLabelY = pad + fsLabel;
  parts.push(
    `<text x="${pad}" y="${noteLabelY}" font-family="${font}" font-size="${fsLabel}" letter-spacing="${Math.round(fsLabel * 0.25)}" fill="${mut}">NOTE</text>`,
  );

  const noteLineStartY = noteLabelY + Math.round(16 * layoutSc);
  const noteLineGap = Math.round(18 * layoutSc) + 1;
  for (let i = 0; i < 5; i++) {
    const ly = noteLineStartY + i * noteLineGap;
    parts.push(
      `<line x1="${pad}" y1="${ly}" x2="${leftW - pad}" y2="${ly}" stroke="${brd}" stroke-width="1.5"/>`,
    );
  }

  // From label + line
  const fromLabelY = H - pad - Math.round(40 * layoutSc);
  parts.push(
    `<text x="${pad}" y="${fromLabelY}" font-family="${font}" font-size="${fsLabel}" letter-spacing="${Math.round(fsLabel * 0.2)}" fill="${mut}">FROM</text>`,
  );
  parts.push(
    `<line x1="${pad}" y1="${fromLabelY + Math.round(8 * layoutSc)}" x2="${leftW - pad}" y2="${fromLabelY + Math.round(8 * layoutSc)}" stroke="${brd}" stroke-width="1.5"/>`,
  );

  // Branding
  parts.push(
    `<text x="${pad}" y="${H - pad}" font-family="${font}" font-size="${fsBody}" letter-spacing="${Math.round(fsBody * 0.1)}" fill="${dim}">Patterns of Place · 2026</text>`,
  );

  // ── Address area ──
  // Stamp box
  const stampW = Math.round(44 * layoutSc);
  const stampH = Math.round(54 * layoutSc);
  const stampX = rightX + rightW - padRight - stampW;
  const stampY = padRight;
  parts.push(
    `<rect x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}" fill="none" stroke="${brd}" stroke-width="2" rx="4"/>`,
  );
  const innerSW = Math.round(28 * layoutSc),
    innerSH = Math.round(38 * layoutSc);
  parts.push(
    `<rect x="${stampX + (stampW - innerSW) / 2}" y="${stampY + (stampH - innerSH) / 2}" width="${innerSW}" height="${innerSH}" fill="${brd}" rx="2" opacity="0.6"/>`,
  );

  // To label
  const toLabelY = H - padRight - Math.round(100 * layoutSc);
  parts.push(
    `<text x="${rightX + padRight}" y="${toLabelY}" font-family="${font}" font-size="${fsTiny}" letter-spacing="${Math.round(fsTiny * 0.15)}" fill="${dim}">TO</text>`,
  );

  // Address lines
  const addrWidths = [0.9, 0.74, 0.74, 0.55];
  const addrAreaW = rightW - 2 * padRight;
  const addrGap = Math.round(18 * layoutSc);
  addrWidths.forEach((w, i) => {
    const ly = toLabelY + Math.round(addrGap * (i + 1));
    parts.push(
      `<line x1="${rightX + padRight}" y1="${ly}" x2="${rightX + padRight + addrAreaW * w}" y2="${ly}" stroke="${brd}" stroke-width="1.5"/>`,
    );
  });

  // Reverse export intentionally omits reverse rings and keeps only base format.

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join("")}</svg>`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const EXPORT_W = 1800;
const EXPORT_H = 1200;

/**
 * Returns download actions that always export both front and reverse.
 * Requires clusters/library for the front and reverseRings/T for the reverse.
 */
export function useExportArtwork({
  clusters,
  bgColor,
  library,
  reverseRings = [],
  T,
  template = "default",
}) {
  // getSvgPair is used by the QR code flow (sends SVG strings to the API).
  // Kept for direct SVG downloads.
  const getSvgPair = useCallback(async () => {
    const frontSvg = await buildFrontSVG(
      clusters,
      bgColor,
      library,
      EXPORT_W,
      EXPORT_H,
    );
    const reverseSvg = buildReverseSVG(
      reverseRings,
      bgColor,
      library,
      T,
      EXPORT_W,
      EXPORT_H,
      template,
      clusters,
    );
    return { frontSvg, reverseSvg };
  }, [clusters, bgColor, library, reverseRings, T, template]);

  // QR flow should match PNG export exactly for static presets and arc-warp rendering.
  const getQrPayload = useCallback(async () => {
    const frontCanvas = await buildFrontCanvas(
      clusters,
      bgColor,
      library,
      EXPORT_W,
      EXPORT_H,
    );

    let frontPng = "";
    if (frontCanvas) {
      frontPng = frontCanvas.toDataURL("image/png", 0.95);
    }

    const reverseSvg = buildReverseSVG(
      reverseRings,
      bgColor,
      library,
      T,
      EXPORT_W,
      EXPORT_H,
      template,
      clusters,
    );

    return { frontPng, reverseSvg };
  }, [clusters, bgColor, library, reverseRings, T, template]);

  const downloadSVG = useCallback(async () => {
    const { frontSvg, reverseSvg } = await getSvgPair();
    const frontBlob = new Blob([frontSvg], { type: "image/svg+xml" });
    const frontUrl = URL.createObjectURL(frontBlob);
    triggerDownload(frontUrl, "patterns-of-place-front.svg");
    URL.revokeObjectURL(frontUrl);

    setTimeout(() => {
      const reverseBlob = new Blob([reverseSvg], { type: "image/svg+xml" });
      const reverseUrl = URL.createObjectURL(reverseBlob);
      triggerDownload(reverseUrl, "patterns-of-place-reverse.svg");
      URL.revokeObjectURL(reverseUrl);
    }, 400);
  }, [getSvgPair]);

  const downloadJPEG = useCallback(async () => {
    // Front: render directly to canvas using the same arc-warp technique as the preview
    const frontCanvas = await buildFrontCanvas(
      clusters,
      bgColor,
      library,
      EXPORT_W,
      EXPORT_H,
    );
    if (!frontCanvas) throw new Error("Front canvas render failed");
    triggerDownload(
      frontCanvas.toDataURL("image/png", 0.95),
      "patterns-of-place-front.png",
    );

    await new Promise((r) => setTimeout(r, 400));

    // Reverse: still SVG → canvas
    const reverseSvg = buildReverseSVG(
      reverseRings,
      bgColor,
      library,
      T,
      EXPORT_W,
      EXPORT_H,
      template,
      clusters,
    );
    const reverseCanvas = await svgStringToCanvas(
      reverseSvg,
      EXPORT_W,
      EXPORT_H,
      bgColor,
    );
    if (!reverseCanvas) throw new Error("Reverse canvas render failed");
    triggerDownload(
      reverseCanvas.toDataURL("image/png", 0.95),
      "patterns-of-place-reverse.png",
    );
  }, [clusters, bgColor, library, reverseRings, T, template]);

  return { downloadJPEG, downloadSVG, getSvgPair, getQrPayload };
}
