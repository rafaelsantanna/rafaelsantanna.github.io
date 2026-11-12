/**
 * List transitions for regions that re-render as markup: items that stay glide to their new place,
 * new items fade in and removed items leave as detached ghosts. Transform and opacity only; with
 * reduced motion, items only fade.
 */

interface Entry { node: HTMLElement; rect: DOMRect }
export interface Snapshot { box: DOMRect; scroll: { top: number; left: number }; items: Map<string, Entry> }

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';

/** Items being settled by the current action: they leave marked as done instead of just fading. */
const settling = new Set<string>();

export function whileSettling(ids: string[], run: () => void) {
  ids.forEach((id) => settling.add(id));
  try {
    run();
  } finally {
    settling.clear();
  }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const flipItems = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(':scope > [data-flip-id]:not(.is-leaving)')];

export function snapshot(container: HTMLElement): Snapshot {
  const items = new Map<string, Entry>();
  flipItems(container).forEach((node) => items.set(node.dataset.flipId ?? '', { node, rect: node.getBoundingClientRect() }));
  return { box: container.getBoundingClientRect(), scroll: { top: container.scrollTop, left: container.scrollLeft }, items };
}

/** Animates from the snapshot to the current markup. Skips containers that were not on screen. */
export function play(container: HTMLElement, before: Snapshot) {
  if (!before.items.size || !before.box.width) return;
  const reduced = prefersReducedMotion();
  const kept = new Set<string>();
  let entering = 0;
  flipItems(container).forEach((node) => {
    const id = node.dataset.flipId ?? '';
    const old = before.items.get(id);
    if (!old) {
      node.animate([{ opacity: 0, transform: reduced ? 'none' : 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 280, delay: Math.min(entering++ * 30, 150) + 80, easing: EASE, fill: 'backwards' });
      return;
    }
    kept.add(id);
    if (reduced) return;
    const rect = node.getBoundingClientRect();
    const dx = old.rect.left - rect.left;
    const dy = old.rect.top - rect.top;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 420, easing: EASE });
  });
  before.items.forEach((old, id) => {
    if (kept.has(id)) return;
    const ghost = old.node;
    ghost.classList.add('is-leaving');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    ghost.querySelectorAll('[data-key], [id]').forEach((element) => { element.removeAttribute('data-key'); element.removeAttribute('id'); });
    Object.assign(ghost.style, {
      position: 'absolute',
      top: `${old.rect.top - before.box.top + before.scroll.top}px`,
      left: `${old.rect.left - before.box.left + before.scroll.left}px`,
      width: `${old.rect.width}px`,
      height: `${old.rect.height}px`,
      margin: '0',
      pointerEvents: 'none',
      zIndex: '2',
    });
    container.append(ghost);
    const done = settling.has(id);
    if (done) {
      ghost.classList.add('is-done');
      ghost.querySelector('.lc-xcard__glyph use')?.setAttribute('href', '#lc-i-check');
    }
    const away = reduced ? 'none' : 'translateX(28px) scale(0.97)';
    const frames: Keyframe[] = done
      ? [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: 'none', offset: 0.4 }, { opacity: 0, transform: away }]
      : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: away }];
    const out = ghost.animate(frames, { duration: done ? 560 : 300, easing: EASE_IN, fill: 'forwards' });
    out.finished.then(() => ghost.remove(), () => ghost.remove());
  });
}

/** Short staggered entrance for rows that replaced a different set of rows (filter, sort or page). */
export function enter(elements: Iterable<Element>) {
  const reduced = prefersReducedMotion();
  [...elements].slice(0, 30).forEach((element, index) => {
    element.animate([{ opacity: 0, transform: reduced ? 'none' : 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: reduced ? 0 : Math.min(index * 14, 200), easing: EASE, fill: 'backwards' });
  });
}

/** A changed number rolls in from below, so the eye catches what moved. */
export function bump(element: Element) {
  if (prefersReducedMotion()) {
    element.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 300 });
    return;
  }
  element.animate([{ opacity: 0, transform: 'translateY(45%)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE });
}
