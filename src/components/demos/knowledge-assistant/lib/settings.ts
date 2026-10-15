export interface SearchSettings {
  topK: number;
  threshold: number;
  /** Document ids the search is restricted to; null searches everything. */
  docs: string[] | null;
}

export const TOP_K = { min: 3, max: 8, step: 1, initial: 5 } as const;
export const THRESHOLD = { min: 0.2, max: 0.8, step: 0.05, initial: 0.5 } as const;

export const DEFAULT_SETTINGS: SearchSettings = { topK: TOP_K.initial, threshold: THRESHOLD.initial, docs: null };

function clampStep(value: unknown, range: { min: number; max: number; step: number }, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const stepped = Math.round((value - range.min) / range.step) * range.step + range.min;
  return Math.round(Math.min(range.max, Math.max(range.min, stepped)) * 100) / 100;
}

/** Accepts anything (for example parsed storage) and returns valid settings. */
export function sanitizeSettings(value: unknown, knownDocs: readonly string[]): SearchSettings {
  const input = (typeof value === 'object' && value !== null ? value : {}) as Partial<Record<keyof SearchSettings, unknown>>;
  const docs = Array.isArray(input.docs)
    ? input.docs.filter((id): id is string => typeof id === 'string' && knownDocs.includes(id))
    : [];
  return {
    topK: clampStep(input.topK, TOP_K, TOP_K.initial),
    threshold: clampStep(input.threshold, THRESHOLD, THRESHOLD.initial),
    docs: docs.length > 0 && docs.length < knownDocs.length ? docs : null,
  };
}
