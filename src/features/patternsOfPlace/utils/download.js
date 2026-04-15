/**
 * Triggers a browser file download from a Blob or data URL.
 */
export function triggerDownload(href, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

/**
 * Converts an SVG string to a Canvas element at the given dimensions.
 * Resolves with the canvas, or null on failure.
 */
export function svgStringToCanvas(svgStr, W, H, bgColor) {
  return new Promise((resolve) => {
    const img = new Image();

    // Use data URI with proper dimensions to ensure consistent rendering
    const dataUri =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));

    img.onload = () => {
      // Create canvas at intrinsic size to avoid quality loss
      const dpr = window.devicePixelRatio || 1;
      const cv = document.createElement("canvas");
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = W + "px";
      cv.style.height = H + "px";

      const ctx = cv.getContext("2d");
      // Scale context for high DPI rendering
      ctx.scale(dpr, dpr);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      resolve(cv);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = dataUri;
  });
}
