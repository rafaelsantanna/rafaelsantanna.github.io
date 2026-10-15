// Keeps the order draft in this browser only. Storage can be unavailable, so every access is guarded.
import { isBlank, sanitizeDraft, type Draft } from '../draft.ts';
import type { Store } from './store.ts';

const KEY = 'rs-demo-legacy-modernization:draft';
const DELAY = 600;

export type SaveStatus = 'example' | 'blank' | 'saving' | 'saved' | 'restored' | 'unavailable' | 'sent' | 'discarded';

export interface SavedDraft {
  draft: Draft;
  savedAt: Date;
}

export function loadDraft(): SavedDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { draft?: unknown; savedAt?: unknown };
    const draft = sanitizeDraft(parsed.draft);
    if (!draft || isBlank(draft)) return null;
    const savedAt = new Date(typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now());
    return { draft, savedAt };
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft): Date | null {
  try {
    const savedAt = new Date();
    window.localStorage.setItem(KEY, JSON.stringify({ draft, savedAt: savedAt.getTime() }));
    return savedAt;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear when storage is blocked.
  }
}

export interface Autosave {
  /** Stops pending work and shows a final state, e.g. after a discard or a simulated submission. */
  settle(status: SaveStatus): void;
}

export function createAutosave(store: Store, report: (status: SaveStatus, at?: Date) => void): Autosave {
  let timer = 0;
  store.subscribe((state, source, previous) => {
    if (source === 'page' || state.draft === previous.draft) return;
    window.clearTimeout(timer);
    if (isBlank(state.draft)) {
      clearDraft();
      report('blank');
      return;
    }
    report('saving');
    timer = window.setTimeout(() => {
      const savedAt = writeDraft(store.get().draft);
      report(savedAt ? 'saved' : 'unavailable', savedAt ?? undefined);
    }, DELAY);
  });
  return {
    settle(status) {
      window.clearTimeout(timer);
      clearDraft();
      report(status);
    },
  };
}
