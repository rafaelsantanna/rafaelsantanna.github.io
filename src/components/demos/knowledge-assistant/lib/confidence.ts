export const CONFIDENCE_WEIGHTS = { score: 0.6, coverage: 0.4 } as const;

export interface Confidence {
  /** Top BM25 score divided by the reference score, capped at 1. */
  score: number;
  /** Share of the question terms found in the best passages. */
  coverage: number;
  value: number;
}

export function computeConfidence(topScore: number, referenceScore: number, coverage: number): Confidence {
  const score = referenceScore > 0 ? Math.min(1, topScore / referenceScore) : 0;
  const value = CONFIDENCE_WEIGHTS.score * score + CONFIDENCE_WEIGHTS.coverage * coverage;
  return { score, coverage, value: Math.round(value * 1000) / 1000 };
}
