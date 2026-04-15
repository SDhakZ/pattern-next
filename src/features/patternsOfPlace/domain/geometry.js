/**
 * Returns the chord length between tangent circles arranged in a ring.
 * Used to size motif tiles so they fit without overlapping.
 */
export const tangentSize = (r, n) =>
  n < 2 ? r * 1.4 : n === 2 ? r * 1.84 : 2 * r * Math.sin(Math.PI / n);

/**
 * Returns a scale factor that keeps a layered preset composition inside its tile.
 */
export const presetFitScale = (layers, padding = 0.08) => {
  if (!layers?.length) return 1;

  const maxExtent = layers.reduce((max, layer) => {
    const scale = layer.scale ?? 1;
    const xExtent = Math.abs(layer.x ?? 0) + scale / 2;
    const yExtent = Math.abs(layer.y ?? 0) + scale / 2;
    return Math.max(max, xExtent, yExtent);
  }, 0);

  const allowed = 1 - padding;
  return maxExtent > allowed ? allowed / maxExtent : 1;
};

/**
 * Converts polar coordinates (radius, degree angle) to Cartesian {x, y}.
 * 0° is at the top (12 o'clock), increasing clockwise.
 */
export const polar = (r, deg) => ({
  x: r * Math.cos(((deg - 90) * Math.PI) / 180),
  y: r * Math.sin(((deg - 90) * Math.PI) / 180),
});

/**
 * Clamps a value within [min, max].
 */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
