import type { Lang } from './lang';
import { phraseAt } from './phrases.ts';
import { stem } from './stem.ts';
import { stopwords } from './stopwords.ts';

export interface Token {
  /** Offsets in the original text, used to highlight matches. */
  start: number;
  end: number;
  raw: string;
  /** Lowercased, accent-folded, punctuation-free form. */
  norm: string;
  stem: string;
  stop: boolean;
}

// Numbers keep their separators together ("R$ 1.000" is one token), everything else splits on punctuation.
const WORD = /\p{N}+(?:[.,]\p{N}+)+|[\p{L}\p{N}]+/gu;
// English clitics stay on their word ("year's", "don't") and only the word itself is indexed,
// so a lone "s" or "t" never shows up as a term or an ignored word.
const WORD_EN = /\p{N}+(?:[.,]\p{N}+)+|([\p{L}\p{N}]+)(?:['’](?:s|t|re|ve|ll|d|m)(?![\p{L}\p{N}]))?/giu;

export function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function tokenize(text: string, lang: Lang): Token[] {
  const tokens: Token[] = [];
  for (const match of text.matchAll(lang === 'en' ? WORD_EN : WORD)) {
    const norm = fold(match[1] ?? match[0]);
    if (!norm) continue;
    // Single characters ("o", "é", "a") never carry meaning, so they count as stop words.
    const stop = norm.length < 2 || stopwords[lang].has(norm);
    const start = match.index ?? 0;
    tokens.push({ start, end: start + match[0].length, raw: match[0], norm, stem: stop ? norm : stem(norm, lang), stop });
  }
  return tokens;
}

/** Stems that count for retrieval, in order and with repetitions. */
export function indexTerms(text: string, lang: Lang): string[] {
  return tokenize(text, lang).filter((token) => !token.stop).map((token) => token.stem);
}

export interface QueryTerm {
  stem: string;
  /** Distinct lowercased words (or question phrases, like "how long do i have") that produced this stem. */
  words: string[];
}

export interface QueryAnalysis {
  terms: QueryTerm[];
  /** Lowercased stop words removed from the question. */
  ignored: string[];
}

/** Question forms ("quanto tempo tenho") become the word the policies use ("prazo"); the rest is stemmed word by word. */
export function analyzeQuery(text: string, lang: Lang): QueryAnalysis {
  const byStem = new Map<string, QueryTerm>();
  const ignored = new Set<string>();
  const addTerm = (termStem: string, word: string) => {
    const term = byStem.get(termStem) ?? { stem: termStem, words: [] };
    if (!term.words.includes(word)) term.words.push(word);
    byStem.set(termStem, term);
  };
  const tokens = tokenize(text, lang);
  const norms = tokens.map((token) => token.norm);
  for (let at = 0; at < tokens.length; at += 1) {
    const phrase = phraseAt(norms, at, lang);
    if (phrase) {
      addTerm(stem(fold(phrase.means), lang), text.slice(tokens[at].start, tokens[phrase.end - 1].end).toLowerCase());
      at = phrase.end - 1;
      continue;
    }
    const token = tokens[at];
    if (token.stop) ignored.add(token.raw.toLowerCase());
    else addTerm(token.stem, token.raw.toLowerCase());
  }
  return { terms: [...byStem.values()], ignored: [...ignored] };
}
