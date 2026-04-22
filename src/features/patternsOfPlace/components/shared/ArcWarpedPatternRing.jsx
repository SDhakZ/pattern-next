import { memo, useEffect, useRef, useState } from "react";
import {
  loadImage,
  motifMarkupToDataUrl,
  buildLayerTileSource,
  buildImageTileSource,
  drawArcWarpedTile,
} from "../../utils/arcWarpCanvas.js";

export const ArcWarpedPatternRing = memo(function ArcWarpedPatternRing({
  layers,
  imageSrc,
  tileSize,
  ringRadius,
  count,
}) {
  const canvasRef = useRef(null);
  const [sourceCanvas, setSourceCanvas] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      const safeTileSize = Math.max(6, Math.round(tileSize));
      try {
        const source = Array.isArray(layers)
          ? await buildLayerTileSource(layers, safeTileSize)
          : imageSrc
            ? await buildImageTileSource(imageSrc, safeTileSize)
            : null;

        if (!cancelled) setSourceCanvas(source);
      } catch {
        if (!cancelled) setSourceCanvas(null);
      }
    }

    prepare();
    return () => {
      cancelled = true;
    };
  }, [layers, imageSrc, tileSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceCanvas || !count || count < 2) return;

    const outerR = ringRadius + tileSize / 2;
    const innerR = Math.max(2, ringRadius - tileSize / 2);
    const extent = Math.ceil(outerR + 4);
    const logicalSize = extent * 2;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(logicalSize * dpr));
    canvas.height = Math.max(1, Math.floor(logicalSize * dpr));
    canvas.style.width = `${logicalSize}px`;
    canvas.style.height = `${logicalSize}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalSize, logicalSize);

    const angleSpan = (Math.PI * 2) / count;
    const slices = Math.max(24, Math.round(tileSize / 2));

    for (let i = 0; i < count; i += 1) {
      const angleDeg = (360 / count) * i;
      const centerAngle = ((angleDeg - 90) * Math.PI) / 180;
      const startAngle = centerAngle - angleSpan / 2;
      const endAngle = centerAngle + angleSpan / 2;

      drawArcWarpedTile(
        ctx,
        sourceCanvas,
        extent,
        extent,
        innerR,
        outerR,
        startAngle,
        endAngle,
        slices,
      );
    }
  }, [sourceCanvas, tileSize, ringRadius, count]);

  const outerR = ringRadius + tileSize / 2;
  const extent = Math.ceil(outerR + 4);
  const logicalSize = extent * 2;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: -extent,
        top: -extent,
        width: logicalSize,
        height: logicalSize,
        pointerEvents: "none",
      }}
    />
  );
});
