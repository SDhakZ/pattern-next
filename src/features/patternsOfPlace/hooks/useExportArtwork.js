import { useCallback } from "react";
import { tangentSize, polar, presetFitScale } from "../domain/geometry.js";
import { DEFAULT_COLORS } from "../data/constants/defaults.js";
import { triggerDownload, svgStringToCanvas } from "../utils/download.js";
import { renderNewMotifMarkup } from "../data/motifs/newMotifs.jsx";

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

// ─── Front SVG builder ────────────────────────────────────────────────────────

function buildFrontSVG(clusters, bgColor, library, W, H) {
  const sc = H / 480;
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
        : library.find((p) => p.id === r.presetId);
      const tileLayers = ringPatternLayers ?? preset?.layers ?? null;
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

function buildClusterPatternParts(clusters, library, W, H) {
  const sc = H / 480;
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
        : library.find((p) => p.id === r.presetId);
      const tileLayers = ringPatternLayers ?? preset?.layers ?? null;
      const rs = r.radius * s;
      const tileSize = Math.max(5, tangentSize(rs, r.count));
      const presetFit = tileLayers ? presetFitScale(tileLayers) : 1;

      for (let mi = 0; mi < r.count; mi++) {
        const angle = (360 / r.count) * mi;
        const { x, y } = polar(rs, angle);
        const cx = ox + x;
        const cy = oy + y;

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
              `reverse_bg_${cl.id}_${r.id}_${mi}_${layer.id}`,
            );
            parts.push(
              `<g transform="translate(${tileX.toFixed(2)},${tileY.toFixed(2)}) rotate(${angle.toFixed(2)},${half.toFixed(2)},${half.toFixed(2)})"><g transform="translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${layer.rotation.toFixed(2)},${(sz / 2).toFixed(2)},${(sz / 2).toFixed(2)}) scale(${sc1000})">${scopedMarkup}</g></g>`,
            );
          });
        } else if (r.motifId !== undefined) {
          const [ra, rb, rc, rd, re] = r.colors ?? DEFAULT_COLORS;
          const sc1000 = (tileSize / 1000).toFixed(6);
          const scopedMarkup = scopeMotifMarkup(
            getInlineSVG(r.motifId, ra, rb, rc, rd, re),
            `reverse_bg_${cl.id}_${r.id}_${mi}`,
          );
          parts.push(
            `<g transform="translate(${(cx - tileSize / 2).toFixed(2)},${(cy - tileSize / 2).toFixed(2)}) rotate(${angle.toFixed(2)},${(tileSize / 2).toFixed(2)},${(tileSize / 2).toFixed(2)}) scale(${sc1000})">${scopedMarkup}</g>`,
          );
        }
      }
    });
  });

  return parts;
}

// ─── Reverse SVG builder ──────────────────────────────────────────────────────

function buildReverseSVG(
  reverseRings,
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

  const brd = T.brd;
  const mut = T.mut;
  const dim = T.dim;
  const txt = T.txt;
  const gold = T.gold;

  const parts = [];

  // Background
  parts.push(`<rect width="${W}" height="${H}" fill="${bgColor}"/>`);
  parts.push(...buildClusterPatternParts(clusters, library, W, H));

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

  // ── Reverse rings ──
  reverseRings.forEach((ring) => {
    const preset = library.find((p) => p.id === ring.presetId);
    const rs = ring.radius * sc;
    const tileSize = Math.max(5, tangentSize(rs, ring.count));
    const presetFit = preset ? presetFitScale(preset.layers) : 1;
    const ox = ring.x * W;
    const oy = ring.y * H;

    for (let mi = 0; mi < ring.count; mi++) {
      const angle = (360 / ring.count) * mi;
      const { x, y } = polar(rs, angle);
      const cx = ox + x,
        cy = oy + y;

      if (preset) {
        const tileX = cx - tileSize / 2;
        const tileY = cy - tileSize / 2;
        const half = tileSize / 2;
        preset.layers.forEach((layer) => {
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
            `reverse_${ring.id}_${mi}_${layer.id}`,
          );
          parts.push(
            `<g transform="translate(${tileX.toFixed(2)},${tileY.toFixed(2)}) rotate(${angle.toFixed(2)},${half.toFixed(2)},${half.toFixed(2)})"><g transform="translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${layer.rotation.toFixed(2)},${(sz / 2).toFixed(2)},${(sz / 2).toFixed(2)}) scale(${sc1000})">${scopedMarkup}</g></g>`,
          );
        });
      } else if (ring.motifId !== undefined) {
        const [ra, rb, rc, rd, re] = ring.colors ?? DEFAULT_COLORS;
        const sc1000 = (tileSize / 1000).toFixed(6);
        const scopedMarkup = scopeMotifMarkup(
          getInlineSVG(ring.motifId, ra, rb, rc, rd, re),
          `reverse_${ring.id}_${mi}`,
        );
        parts.push(
          `<g transform="translate(${(cx - tileSize / 2).toFixed(2)},${(cy - tileSize / 2).toFixed(2)}) rotate(${angle.toFixed(2)},${(tileSize / 2).toFixed(2)},${(tileSize / 2).toFixed(2)}) scale(${sc1000})">${scopedMarkup}</g>`,
        );
      }
    }
  });

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
  const getSvgPair = useCallback(() => {
    const frontSvg = buildFrontSVG(
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

  const downloadSVG = useCallback(() => {
    const { frontSvg, reverseSvg } = getSvgPair();
    const frontBlob = new Blob([frontSvg], { type: "image/svg+xml" });
    const frontUrl = URL.createObjectURL(frontBlob);
    triggerDownload(frontUrl, "patterns-of-place-front.svg");
    URL.revokeObjectURL(frontUrl);

    // Small delay so the browser doesn't block the second download
    setTimeout(() => {
      const reverseBlob = new Blob([reverseSvg], { type: "image/svg+xml" });
      const reverseUrl = URL.createObjectURL(reverseBlob);
      triggerDownload(reverseUrl, "patterns-of-place-reverse.svg");
      URL.revokeObjectURL(reverseUrl);
    }, 400);
  }, [getSvgPair]);

  const downloadJPEG = useCallback(async () => {
    const { frontSvg, reverseSvg } = getSvgPair();
    // Front
    const frontCanvas = await svgStringToCanvas(
      frontSvg,
      EXPORT_W,
      EXPORT_H,
      bgColor,
    );
    if (!frontCanvas) throw new Error("Front canvas render failed");
    triggerDownload(
      frontCanvas.toDataURL("image/png", 0.95),
      "patterns-of-place-front.png",
    );

    // Give the browser a moment before triggering the second download
    await new Promise((r) => setTimeout(r, 400));

    // Reverse
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
  }, [getSvgPair, bgColor]);

  return { downloadJPEG, downloadSVG, getSvgPair };
}
