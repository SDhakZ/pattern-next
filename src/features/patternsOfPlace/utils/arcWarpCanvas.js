import { presetFitScale } from "../domain/geometry.js";
import { renderNewMotifMarkup } from "../data/motifs/newMotifs.jsx";
import { DEFAULT_COLORS } from "../data/constants/defaults.js";

const TILE_SUPERSAMPLE_FACTOR = 3;

function getRenderTileSize(tileSize) {
  const safeTile = Math.max(1, Math.round(tileSize));
  return safeTile * TILE_SUPERSAMPLE_FACTOR;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function motifMarkupToDataUrl(motifId, colors, size) {
  const palette = Array.isArray(colors) ? colors : DEFAULT_COLORS;
  const [a, b, c, d, e] = palette;
  const markup = renderNewMotifMarkup(motifId, [a, b, c, d, e]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${size}" height="${size}">${markup ?? ""}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function buildLayerTileSource(layers, tileSize) {
  const renderTileSize = getRenderTileSize(tileSize);
  const source = document.createElement("canvas");
  source.width = renderTileSize;
  source.height = renderTileSize;
  const ctx = source.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const half = renderTileSize / 2;
  const fit = presetFitScale(layers);

  for (const layer of layers) {
    const layerScale = Number.isFinite(layer?.scale) ? layer.scale : 1;
    const layerX = Number.isFinite(layer?.x) ? layer.x : 0;
    const layerY = Number.isFinite(layer?.y) ? layer.y : 0;
    const layerRotation = Number.isFinite(layer?.rotation) ? layer.rotation : 0;

    const motifSize = Math.max(
      4,
      Math.round(renderTileSize * 0.5 * layerScale * fit),
    );
    const cx = half + layerX * half * fit;
    const cy = half + layerY * half * fit;

    const motifUrl = motifMarkupToDataUrl(
      layer?.motifId ?? 0,
      layer?.colors,
      motifSize,
    );
    const motifImage = await loadImage(motifUrl);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((layerRotation * Math.PI) / 180);
    ctx.drawImage(
      motifImage,
      -motifSize / 2,
      -motifSize / 2,
      motifSize,
      motifSize,
    );
    ctx.restore();
  }

  return source;
}

export async function buildImageTileSource(imageSrc, tileSize) {
  const renderTileSize = getRenderTileSize(tileSize);
  const source = document.createElement("canvas");
  source.width = renderTileSize;
  source.height = renderTileSize;
  const ctx = source.getContext("2d");
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const img = await loadImage(imageSrc);
  const scale = Math.min(renderTileSize / img.width, renderTileSize / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (renderTileSize - w) / 2;
  const y = (renderTileSize - h) / 2;
  ctx.clearRect(0, 0, renderTileSize, renderTileSize);
  ctx.drawImage(img, x, y, w, h);
  return source;
}

export function drawArcWarpedTile(
  ctx,
  source,
  centerX,
  centerY,
  innerR,
  outerR,
  startAngle,
  endAngle,
  slices,
) {
  const midR = (innerR + outerR) / 2;
  const radialThickness = Math.max(1, outerR - innerR);

  for (let i = 0; i < slices; i += 1) {
    const t0 = i / slices;
    const t1 = (i + 1) / slices;
    const a0 = startAngle + (endAngle - startAngle) * t0;
    const a1 = startAngle + (endAngle - startAngle) * t1;
    const am = (a0 + a1) / 2;

    const segWidth = Math.max(1, Math.abs(a1 - a0) * midR);
    const srcX0 = Math.floor((i * source.width) / slices);
    const srcX1 = Math.ceil(((i + 1) * source.width) / slices);
    const srcSliceWidth = Math.max(1, srcX1 - srcX0);

    // Adaptive overlap prevents anti-aliased seam lines between adjacent slices.
    const seamOverlap = Math.min(3, Math.max(1.5, segWidth * 0.08));
    const px = centerX + Math.cos(am) * midR;
    const py = centerY + Math.sin(am) * midR;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(am + Math.PI / 2);
    ctx.drawImage(
      source,
      srcX0,
      0,
      srcSliceWidth,
      source.height,
      -(segWidth + seamOverlap) / 2,
      -radialThickness / 2,
      segWidth + seamOverlap,
      radialThickness,
    );
    ctx.restore();
  }
}
