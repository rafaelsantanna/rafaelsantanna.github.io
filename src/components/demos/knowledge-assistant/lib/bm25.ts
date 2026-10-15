export interface Bm25Params {
  k1: number;
  b: number;
}

export const BM25_DEFAULTS: Bm25Params = { k1: 1.2, b: 0.75 };

export interface Bm25Index {
  params: Bm25Params;
  size: number;
  avgLength: number;
  lengths: number[];
  /** term -> (unit index -> term frequency) */
  postings: Map<string, Map<number, number>>;
}

export interface Bm25Hit {
  index: number;
  score: number;
  /** Query terms found in the unit. */
  matched: string[];
}

export function buildIndex(units: string[][], params: Bm25Params = BM25_DEFAULTS): Bm25Index {
  const postings = new Map<string, Map<number, number>>();
  units.forEach((terms, index) => {
    for (const term of terms) {
      const list = postings.get(term) ?? new Map<number, number>();
      list.set(index, (list.get(index) ?? 0) + 1);
      postings.set(term, list);
    }
  });
  const lengths = units.map((terms) => terms.length);
  const avgLength = lengths.reduce((sum, length) => sum + length, 0) / Math.max(1, units.length);
  return { params, size: units.length, avgLength, lengths, postings };
}

/** BM25 inverse document frequency. Unseen terms get the highest possible value. */
export function idf(index: Bm25Index, term: string): number {
  const df = index.postings.get(term)?.size ?? 0;
  return Math.log(1 + (index.size - df + 0.5) / (df + 0.5));
}

/** Scores every unit that contains at least one term, best first. */
export function search(index: Bm25Index, terms: string[], allow: (unit: number) => boolean = () => true): Bm25Hit[] {
  const { k1, b } = index.params;
  const hits = new Map<number, Bm25Hit>();
  for (const term of new Set(terms)) {
    const list = index.postings.get(term);
    if (!list) continue;
    const weight = idf(index, term);
    for (const [unit, tf] of list) {
      if (!allow(unit)) continue;
      const norm = 1 - b + (b * index.lengths[unit]) / index.avgLength;
      const hit = hits.get(unit) ?? { index: unit, score: 0, matched: [] };
      hit.score += (weight * tf * (k1 + 1)) / (tf + k1 * norm);
      hit.matched.push(term);
      hits.set(unit, hit);
    }
  }
  return [...hits.values()].sort((left, right) => right.score - left.score || left.index - right.index);
}

/** Term frequency assumed by the reference score: a passage that clearly discusses each term. */
const REFERENCE_TF = 2;

/**
 * Score of a passage of average length that mentions every question term REFERENCE_TF times.
 * Used to normalize the top score; terms missing from the corpus still count, so questions
 * about unknown topics stay low.
 */
export function referenceScore(index: Bm25Index, terms: string[]): number {
  const { k1 } = index.params;
  const saturation = (REFERENCE_TF * (k1 + 1)) / (REFERENCE_TF + k1);
  return [...new Set(terms)].reduce((sum, term) => sum + idf(index, term) * saturation, 0);
}
