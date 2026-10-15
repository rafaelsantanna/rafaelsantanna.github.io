import type { Lang } from '../lib/lang';

const PREFIX = 'rs-demo-knowledge-assistant';
const MAX_TURNS = 30;
const MAX_QUESTION = 300;

export type Feedback = 'up' | 'down' | null;

export interface StoredTurn {
  question: string;
  topK: number;
  threshold: number;
  docs: string[] | null;
  feedback: Feedback;
  forwarded: boolean;
}

export interface StoredState {
  /** Unvalidated; callers run it through sanitizeSettings. */
  settings: unknown;
  turns: StoredTurn[];
}

function isStoredTurn(value: unknown): value is StoredTurn {
  if (typeof value !== 'object' || value === null) return false;
  const turn = value as Record<string, unknown>;
  return typeof turn.question === 'string'
    && turn.question.trim().length > 0
    && turn.question.length <= MAX_QUESTION
    && typeof turn.topK === 'number'
    && typeof turn.threshold === 'number'
    && (turn.docs === null || (Array.isArray(turn.docs) && turn.docs.every((id) => typeof id === 'string')))
    && (turn.feedback === null || turn.feedback === 'up' || turn.feedback === 'down')
    && typeof turn.forwarded === 'boolean';
}

/** Conversation and settings for one locale. Storage can be missing or blocked, so every access is guarded. */
export function createStore(lang: Lang) {
  const key = `${PREFIX}:${lang}`;
  return {
    load(): StoredState | null {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { settings?: unknown; turns?: unknown };
        const turns = Array.isArray(parsed.turns) ? parsed.turns.filter(isStoredTurn).slice(-MAX_TURNS) : [];
        return { settings: parsed.settings, turns };
      } catch {
        return null;
      }
    },
    save(state: StoredState): void {
      try {
        window.localStorage.setItem(key, JSON.stringify({ settings: state.settings, turns: state.turns.slice(-MAX_TURNS) }));
      } catch {
        // Private mode or full storage: the demo keeps working without persistence.
      }
    },
    clear(): void {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Nothing to clear when storage is unavailable.
      }
    },
  };
}
