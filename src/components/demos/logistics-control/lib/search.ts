/** Lowercase, accent-free text for forgiving comparisons. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

function isSubsequence(needle: string, haystack: string): boolean {
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return needle.length === 0;
}

/** True when the words differ by at most one edit (insert, delete, replace or swap). */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i += 1; j += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (a[i + 1] === b[j] && a[i] === b[j + 1]) { i += 2; j += 2; continue; }
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else { i += 1; j += 1; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const WORD_SEPARATOR = /[^a-z0-9]+/;

export interface MatchOptions {
  /** Allows one-typo and loose subsequence matches for words. */
  fuzzy?: boolean;
  /** Lets a word match inside another word ("heme" finds "theme"). Numbers always may, so "9008" finds "49008". */
  infix?: boolean;
}

/**
 * Scores how well a query matches a label plus optional keywords.
 * Every query word must match something: exact prefix scores highest, then substring,
 * then one-typo matches, then loose subsequences. Returns 0 for no match.
 * With `fuzzy` off, only prefixes and substrings count; with `infix` off, words only match by prefix.
 */
export function score(query: string, label: string, keywords: string[] = [], { fuzzy = true, infix = true }: MatchOptions = {}): number {
  const q = normalize(query);
  if (!q) return 1;
  const target = normalize([label, ...keywords].join(' '));
  const words = target.split(WORD_SEPARATOR).filter(Boolean);
  // Query words split like the target, so "TRJ-49008" matches the ID as typed.
  const tokens = q.split(WORD_SEPARATOR).filter(Boolean);
  if (!tokens.length) return 0;
  let total = 0;
  for (const token of tokens) {
    // Numbers (delivery IDs) get no typo tolerance. It only applies to words, keeps the first
    // letter and stays close to the start of the word, so a short query such as "atra" cannot match
    // "traço" (first letter dropped), "atalhos" (shorter prefix) or "alternar" (letters spread out).
    const numeric = /^\d+$/.test(token);
    const typos = fuzzy && !numeric;
    const inside = infix || numeric;
    const deltas = token.length >= 5 ? [-1, 0, 1] : [0, 1];
    let best = 0;
    for (const word of words) {
      const sameStart = word[0] === token[0];
      if (word.startsWith(token)) best = Math.max(best, 10 + token.length);
      else if (inside && word.includes(token)) best = Math.max(best, 6 + token.length);
      else if (typos && sameStart && token.length >= 4 && deltas.some((delta) => withinOneEdit(token, word.slice(0, token.length + delta)))) best = Math.max(best, 4);
      else if (typos && sameStart && token.length >= 3 && isSubsequence(token, word.slice(0, token.length + 2))) best = Math.max(best, 1);
    }
    if (!best) return 0;
    total += best;
  }
  if (normalize(label).startsWith(q)) total += 8;
  return total;
}
