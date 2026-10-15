import type { Bm25Hit } from './bm25';
import type { Lang } from './lang';
import type { Passage } from './passages';
import { indexTerms } from './text.ts';

export interface AnswerPart {
  /** 1-based citation number shown in the answer. */
  citation: number;
  passageIndex: number;
  sentences: string[];
}

export interface Answer {
  /** Parts in display order; part n carries citation n. */
  parts: AnswerPart[];
}

export interface AnswerOptions {
  maxPassages: number;
  /** Passages scoring below this share of the top score are not quoted. */
  minRelativeScore: number;
  /** The answer starts from the sentence with the most question terms among top document passages within this share of the top score. */
  leadScore: number;
  /** Passages of the lead document within this share of the top score that match the same terms count as a tie. */
  tieScore: number;
  /** Any other passage joins only when the question terms it adds weigh as much as this many average terms (by idf). */
  minNewTerms: number;
  maxSentences: number;
  maxChars: number;
}

export const ANSWER_DEFAULTS: AnswerOptions = {
  maxPassages: 3,
  minRelativeScore: 0.35,
  leadScore: 0.85,
  tieScore: 0.9,
  minNewTerms: 2,
  maxSentences: 3,
  maxChars: 540,
};

const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[\p{Lu}\p{N}"(])/u;

export function splitSentences(text: string): string[] {
  return text.split(SENTENCE_BREAK).map((sentence) => sentence.trim()).filter(Boolean);
}

interface Candidate {
  rank: number;
  passageIndex: number;
  /** Passage score divided by the top score. */
  relative: number;
  position: number;
  text: string;
  terms: Set<string>;
  /** Question terms present in the sentence. */
  covers: string[];
  overlap: number;
  score: number;
}

function similarity(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const term of a) if (b.has(term)) shared += 1;
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : shared / union;
}

function sentencesOf(passage: Passage, weights: Map<string, number>, total: number, lang: Lang) {
  return splitSentences(passage.text).map((text) => {
    const terms = new Set(indexTerms(text, lang));
    const covers = [...weights.keys()].filter((term) => terms.has(term));
    const weight = covers.reduce((sum, term) => sum + (weights.get(term) ?? 0), 0);
    return { text, terms, covers, overlap: total > 0 ? weight / total : 0 };
  });
}

function candidatesFor(hit: Bm25Hit, rank: number, top: number, passages: Passage[], weights: Map<string, number>, total: number, lang: Lang, options: AnswerOptions): Candidate[] {
  const relative = hit.score / top;
  if (relative < options.minRelativeScore) return [];
  const sentences = sentencesOf(passages[hit.index], weights, total, lang);
  return sentences.flatMap((sentence, position) => {
    const previous = sentences[position - 1]?.overlap ?? 0;
    // In the best passage, a sentence right after a matching one usually completes it ("Then file a report...").
    const isFollowUp = sentence.overlap === 0 && rank === 0 && previous > 0;
    if (sentence.overlap === 0 && !isFollowUp) return [];
    const score = sentence.overlap + 0.35 * previous + 0.15 * relative;
    return [{ rank, passageIndex: hit.index, relative, position, text: sentence.text, terms: sentence.terms, covers: sentence.covers, overlap: sentence.overlap, score }];
  });
}

/**
 * Extractive answer: starts from the best sentence of the best passage and adds what completes it.
 * Passages of the same document that BM25 cannot tell apart from the best one (a tie: almost the
 * same score, and one sentence that has every question term the best passage's text has) join
 * with that sentence. Any other passage joins only when it answers about two question terms' worth
 * (by idf) that the answer does not cover yet, so a shared common word ("week", "year") never
 * pulls in an unrelated rule. Tied passages come first: the ones whose section heading names more
 * question terms, then document order. The others follow by rank, and each source passage gets the
 * next citation number.
 */
export function assembleAnswer(hits: Bm25Hit[], passages: Passage[], weights: Map<string, number>, lang: Lang, options: AnswerOptions = ANSWER_DEFAULTS): Answer {
  const top = hits[0];
  if (!top) return { parts: [] };
  const total = [...weights.values()].reduce((sum, value) => sum + value, 0);
  const minAdded = options.minNewTerms * (total / Math.max(1, weights.size));
  const candidates = hits
    .slice(0, options.maxPassages)
    .flatMap((hit, rank) => candidatesFor(hit, rank, top.score, passages, weights, total, lang, options))
    .sort((a, b) => b.score - a.score || a.rank - b.rank || a.position - b.position);

  // When no sentence repeats a question term, the match came from a title or heading: the section opens with the answer.
  const opening = (): Candidate => {
    const [first] = sentencesOf(passages[top.index], weights, total, lang);
    return { rank: 0, passageIndex: top.index, relative: 1, position: 0, ...first, score: 0 };
  };
  // BM25 cannot tell passages of one document within a few percent apart, so among them the sentence
  // that has more of the question wins ("45 days in advance" over a salary "advance" in a longer passage).
  const near = candidates.filter((candidate) => candidate.relative >= options.leadScore && candidate.overlap > 0
    && passages[candidate.passageIndex].docId === passages[top.index].docId);
  const lead = near.reduce<Candidate | undefined>((best, candidate) => (!best || candidate.overlap > best.overlap ? candidate : best), undefined)
    ?? candidates.find((candidate) => candidate.overlap > 0)
    ?? opening();
  const leadDoc = passages[lead.passageIndex].docId;
  // A tied sentence must say on its own what the whole best passage says: "mileage is paid at
  // R$ 1.20" shares "paid" with an answer about when reimbursements are paid, but not "reimbursement".
  const leadCovers = new Set(sentencesOf(passages[lead.passageIndex], weights, total, lang).flatMap((sentence) => sentence.covers));
  const isTie = (candidate: Candidate) => candidate.relative >= options.tieScore
    && passages[candidate.passageIndex].docId === leadDoc
    && [...leadCovers].every((term) => candidate.covers.includes(term));

  const chosen = [lead];
  const ties = new Set([lead.passageIndex]);
  const covered = new Set(lead.covers);
  let length = lead.text.length;
  for (const candidate of candidates) {
    if (chosen.length >= options.maxSentences) break;
    if (candidate === lead || length + candidate.text.length > options.maxChars) continue;
    if (chosen.some((item) => similarity(item.terms, candidate.terms) >= 0.6)) continue;
    const needsPrevious = candidate.overlap === 0;
    if (needsPrevious && !chosen.some((item) => item.passageIndex === candidate.passageIndex && item.position === candidate.position - 1)) continue;
    if (candidate.passageIndex !== lead.passageIndex) {
      // A tie joins with its best sentence; anything else must answer a part of the question still open.
      const tie = isTie(candidate) && !chosen.some((item) => item.passageIndex === candidate.passageIndex);
      const added = candidate.covers.filter((term) => !covered.has(term)).reduce((sum, term) => sum + (weights.get(term) ?? 0), 0);
      if (!tie && added < minAdded) continue;
      if (tie) ties.add(candidate.passageIndex);
    }
    chosen.push(candidate);
    candidate.covers.forEach((term) => covered.add(term));
    length += candidate.text.length;
  }

  const groups = new Map<number, Candidate[]>();
  for (const sentence of chosen) groups.set(sentence.passageIndex, [...(groups.get(sentence.passageIndex) ?? []), sentence]);
  const headingMatches = (index: number) => new Set(indexTerms(passages[index].sectionHeading, lang).filter((term) => weights.has(term))).size;
  // Passage indexes follow the corpus, so among tied passages a lower index means earlier in the document.
  const ordered = [...groups.values()].sort(([a], [b]) => {
    const tiedA = ties.has(a.passageIndex);
    const tiedB = ties.has(b.passageIndex);
    if (tiedA !== tiedB) return tiedA ? -1 : 1;
    if (!tiedA) return a.rank - b.rank;
    return headingMatches(b.passageIndex) - headingMatches(a.passageIndex) || a.passageIndex - b.passageIndex;
  });

  const parts = ordered.map((group, index) => ({
    citation: index + 1,
    passageIndex: group[0].passageIndex,
    sentences: group.sort((a, b) => a.position - b.position).map((sentence) => sentence.text),
  }));
  return { parts };
}
