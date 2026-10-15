import type { AskResult } from '../lib/pipeline';
import type { Feedback, StoredTurn } from './storage';

export interface Turn {
  id: number;
  result: AskResult;
  feedback: Feedback;
  forwarded: boolean;
}

export type ConfidenceLevel = 'high' | 'ok' | 'low';

const HIGH_CONFIDENCE = 0.8;
/** One or two words match a passage strongly almost by definition, so short questions top out at moderate. */
export const MIN_TERMS_FOR_HIGH = 3;

/** True when the score alone would be high but the question is too short to claim it. */
export function isShortQuestionCap(result: AskResult): boolean {
  const { value } = result.confidence;
  return value >= Math.max(HIGH_CONFIDENCE, result.settings.threshold) && result.analysis.terms.length < MIN_TERMS_FOR_HIGH;
}

export function confidenceLevel(result: AskResult): ConfidenceLevel {
  const { value } = result.confidence;
  if (value < result.settings.threshold) return 'low';
  return value >= Math.max(HIGH_CONFIDENCE, result.settings.threshold) && !isShortQuestionCap(result) ? 'high' : 'ok';
}

export function queryStems(result: AskResult): Set<string> {
  return new Set(result.analysis.terms.map((term) => term.stem));
}

export function toStoredTurn(turn: Turn): StoredTurn {
  const { question, settings } = turn.result;
  return { question, topK: settings.topK, threshold: settings.threshold, docs: settings.docs, feedback: turn.feedback, forwarded: turn.forwarded };
}
