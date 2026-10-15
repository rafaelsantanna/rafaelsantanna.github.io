import type { KbCorpus } from '../corpus/types';
import { assembleAnswer, type Answer } from './answer.ts';
import { BM25_DEFAULTS, buildIndex, idf, referenceScore, search, type Bm25Hit, type Bm25Index } from './bm25.ts';
import { computeConfidence, type Confidence } from './confidence.ts';
import type { Lang } from './lang';
import { chunkCorpus, searchableText, type Passage } from './passages.ts';
import type { SearchSettings } from './settings';
import { analyzeQuery, indexTerms, type QueryAnalysis, type QueryTerm } from './text.ts';

export type Clock = () => number;

/** How many of the best passages are checked for question term coverage. */
const COVERAGE_DEPTH = 3;

export interface Engine {
  lang: Lang;
  corpus: KbCorpus;
  passages: Passage[];
  index: Bm25Index;
  vocabulary: number;
  buildMs: number;
}

export function createEngine(corpus: KbCorpus, lang: Lang, now: Clock): Engine {
  const started = now();
  const passages = chunkCorpus(corpus);
  const index = buildIndex(passages.map((passage) => indexTerms(searchableText(passage), lang)), BM25_DEFAULTS);
  return { lang, corpus, passages, index, vocabulary: index.postings.size, buildMs: now() - started };
}

export type Outcome = 'answer' | 'handoff' | 'empty';

export interface Timings {
  normalize: number;
  retrieve: number;
  confidence: number;
  assemble: number;
  total: number;
}

export interface AskResult {
  question: string;
  settings: SearchSettings;
  outcome: Outcome;
  analysis: QueryAnalysis;
  /** Top-k passages, best first. */
  hits: Bm25Hit[];
  reference: number;
  confidence: Confidence;
  /** Question terms that do not appear anywhere in the searched passages. */
  unmatched: QueryTerm[];
  answer: Answer | null;
  searched: { passages: number; documents: number };
  timings: Timings;
}

export function ask(engine: Engine, question: string, settings: SearchSettings, now: Clock): AskResult {
  const t0 = now();
  const analysis = analyzeQuery(question, engine.lang);
  const stems = analysis.terms.map((term) => term.stem);
  const t1 = now();

  const allowed = settings.docs ? new Set(settings.docs) : null;
  const allow = (unit: number) => !allowed || allowed.has(engine.passages[unit].docId);
  const ranked = stems.length > 0 ? search(engine.index, stems, allow) : [];
  const hits = ranked.slice(0, settings.topK);
  const t2 = now();

  const reference = referenceScore(engine.index, stems);
  const found = new Set(ranked.flatMap((hit) => hit.matched));
  const covered = new Set(hits.slice(0, COVERAGE_DEPTH).flatMap((hit) => hit.matched));
  const confidence = computeConfidence(hits[0]?.score ?? 0, reference, stems.length > 0 ? covered.size / stems.length : 0);
  const outcome: Outcome = stems.length === 0 ? 'empty' : confidence.value >= settings.threshold ? 'answer' : 'handoff';
  const t3 = now();

  const weights = new Map(stems.filter((stem) => found.has(stem)).map((stem) => [stem, idf(engine.index, stem)] as const));
  const answer = outcome === 'answer' ? assembleAnswer(hits, engine.passages, weights, engine.lang) : null;
  const t4 = now();

  const searchedPassages = engine.passages.filter((_, unit) => allow(unit));
  return {
    question,
    settings,
    outcome,
    analysis,
    hits,
    reference,
    confidence,
    unmatched: analysis.terms.filter((term) => !found.has(term.stem)),
    answer,
    searched: { passages: searchedPassages.length, documents: new Set(searchedPassages.map((passage) => passage.docId)).size },
    timings: { normalize: t1 - t0, retrieve: t2 - t1, confidence: t3 - t2, assemble: t4 - t3, total: t4 - t0 },
  };
}
