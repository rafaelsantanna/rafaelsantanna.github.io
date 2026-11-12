import { fill } from '../lib/text';

export type TourStep = 'offline' | 'order' | 'error' | 'online' | 'reload';

const STORAGE_KEY = 'rs-demo-field-service-app:tour';

function readDone(): Set<TourStep> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as TourStep[]) : null;
  } catch {
    return null;
  }
}

/**
 * Ticks off the "what to try" notes beside the phone as the visitor does each thing.
 * Progress lives in this tab's session, so coming back after a reload completes the last step.
 */
export function createTour(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>('[data-tour]');
  const steps = section ? [...section.querySelectorAll<HTMLElement>('[data-tour-step]')] : [];
  const count = section?.querySelector<HTMLElement>('[data-tour-count]');
  const template = section?.dataset.tourTemplate ?? '';
  const doneLabel = section?.dataset.tourDone ?? '';
  const stored = readDone();
  const done = stored ?? new Set<TourStep>();
  if (stored) done.add('reload');

  function render() {
    for (const step of steps) {
      const isDone = done.has(step.dataset.tourStep as TourStep);
      step.toggleAttribute('data-done', isDone);
      const label = step.querySelector('[data-tour-sr]');
      if (label) label.textContent = isDone ? ` (${doneLabel})` : '';
    }
    if (count) count.textContent = fill(template, { done: steps.filter((step) => step.hasAttribute('data-done')).length, total: steps.length });
  }

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    } catch {
      // Blocked storage only loses the reload step.
    }
  }

  save();
  render();

  return {
    mark(step: TourStep) {
      if (done.has(step)) return;
      done.add(step);
      save();
      render();
    },
    has(step: TourStep) {
      return done.has(step);
    },
  };
}
