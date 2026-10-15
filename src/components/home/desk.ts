import { ORIGIN, clampOffset, hasMoved, union, untranslate, type Box, type Offset } from './desk-geometry';

/** Drag is offered only where it is comfortable and expected. */
const DRAG_QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 64em)';
const RESET_DURATION = 700;
/** A click that lands this soon after a drag belongs to the drag, not to the link. */
const CLICK_GUARD = 350;

function boxOf(element: Element): Box {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return { left, top, right, bottom };
}

/**
 * Windows stay inside the desk column, so a drag can never cover the hero copy and its actions.
 * A window that starts slightly outside the column keeps that room instead of jumping.
 */
function limitsFor(root: HTMLElement, base: Box): Box {
  return union(boxOf(root), base);
}

export function initDesk(root: HTMLElement): void {
  const items = [...root.querySelectorAll<HTMLElement>('[data-desk-item]')];
  const controls = root.querySelector<HTMLElement>('[data-desk-controls]');
  const resetButton = root.querySelector<HTMLButtonElement>('[data-desk-reset]');
  const row = root.querySelector<HTMLElement>('[data-desk-row]');
  const query = window.matchMedia(DRAG_QUERY);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const offsets = new Map<HTMLElement, Offset>();
  let layer = items.length + 1;
  let lastDragEnd = 0;

  const offsetOf = (item: HTMLElement) => offsets.get(item) ?? ORIGIN;

  const place = (item: HTMLElement, offset: Offset) => {
    offsets.set(item, offset);
    item.style.setProperty('--dx', `${Math.round(offset.x)}px`);
    item.style.setProperty('--dy', `${Math.round(offset.y)}px`);
  };

  const setDirty = (dirty: boolean) => root.toggleAttribute('data-moved', dirty);

  const reset = (animate: boolean) => {
    if (animate) {
      root.setAttribute('data-resetting', '');
      window.setTimeout(() => root.removeAttribute('data-resetting'), RESET_DURATION);
    }
    items.forEach((item) => {
      place(item, ORIGIN);
      item.style.removeProperty('z-index');
    });
    layer = items.length + 1;
    setDirty(false);
  };

  const sync = () => {
    const enabled = query.matches;
    root.toggleAttribute('data-draggable', enabled);
    if (controls) controls.hidden = !enabled;
    if (!enabled) reset(false);
  };

  const reclamp = () => {
    items.forEach((item) => {
      const offset = offsetOf(item);
      const base = untranslate(boxOf(item), offset);
      place(item, clampOffset(offset, base, limitsFor(root, base)));
    });
  };

  items.forEach((item) => {
    const handle = item.querySelector<HTMLElement>('[data-desk-handle]');
    if (!handle) return;

    handle.addEventListener('pointerdown', (event) => {
      if (!query.matches || event.button !== 0 || !event.isPrimary) return;
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      item.style.zIndex = String(++layer);

      const start = { x: event.clientX, y: event.clientY };
      const origin = offsetOf(item);
      const base = untranslate(boxOf(item), origin);
      const limits = limitsFor(root, base);
      let dragging = false;

      const move = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - start.x;
        const dy = moveEvent.clientY - start.y;
        if (!dragging && !hasMoved(dx, dy)) return;
        if (!dragging) {
          dragging = true;
          item.setAttribute('data-dragging', '');
        }
        place(item, clampOffset({ x: origin.x + dx, y: origin.y + dy }, base, limits));
      };

      const end = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', end);
        handle.removeEventListener('pointercancel', end);
        item.removeAttribute('data-dragging');
        if (dragging) {
          lastDragEnd = performance.now();
          setDirty(true);
        }
      };

      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    });

    item.addEventListener('click', (event) => {
      if (performance.now() - lastDragEnd < CLICK_GUARD) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  });

  resetButton?.addEventListener('click', () => reset(true));

  // On phones the windows form a scrolling row; a window reached with Tab is brought fully into view.
  row?.addEventListener('focusin', (event) => {
    if (row.scrollWidth <= row.clientWidth || !(event.target instanceof Element)) return;
    event.target.closest('[data-desk-item]')?.scrollIntoView({
      block: 'nearest',
      inline: 'start',
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  });

  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (query.matches) reclamp();
    });
  });

  query.addEventListener('change', sync);
  sync();
}
