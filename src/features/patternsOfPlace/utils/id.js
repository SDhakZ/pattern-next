/**
 * Generates a stable unique ID using timestamp + random suffix.
 * Used for layers, rings, clusters, and presets.
 */
export const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
