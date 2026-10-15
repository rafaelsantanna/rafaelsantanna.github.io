// Compare stage: view modes and the before/after divider. Narrow screens switch between the two versions instead.
import { fill } from '../format.ts';
import { must, type Context } from './dom.ts';
import { initRadioGroup } from './radio-group.ts';

export type Mode = 'legacy' | 'compare' | 'modern';

export interface Stage {
  reset(): void;
}

const WIDE = '(min-width: 56.25rem)';
const STEP = 5;
const PAGE_STEP = 10;

export function initStage(root: HTMLElement, context: Context): Stage {
  const p = context.t.page;
  const stage = must(root, '[data-stage]');
  const panes = { legacy: must(root, '[data-pane="legacy"]'), modern: must(root, '[data-pane="modern"]') };
  const knob = must(root, '[data-slider]');
  const scrub = must(root, '[data-scrub]');
  const divider = must(root, '[data-divider]');
  const caption = must(root, '[data-stage-caption]');
  const frame = must(root, '[data-legacy-frame]');
  const controls = must(root, '[data-controls]');
  const wide = window.matchMedia(WIDE);
  let mode: Mode = 'compare';
  let split = 50;

  const apply = () => {
    // Side by side needs room: narrow screens hide Compare and open the version people can fill in.
    if (mode === 'compare' && !wide.matches) {
      mode = 'modern';
      modeGroup.set(mode);
    }
    root.dataset.mode = mode;
    // Side by side is for looking; each version is filled in on its own.
    panes.legacy.inert = mode === 'compare';
    panes.modern.inert = mode === 'compare';
    caption.textContent = p.captions[mode];
  };

  const setSplit = (value: number) => {
    split = Math.round(Math.min(100, Math.max(0, value)));
    stage.style.setProperty('--vt-split', `${split}%`);
    knob.setAttribute('aria-valuenow', String(split));
    knob.setAttribute('aria-valuetext', fill(p.dividerValue, { legacy: split, modern: 100 - split }));
    divider.classList.toggle('is-near-start', split < 16);
    divider.classList.toggle('is-near-end', split > 84);
  };

  const modeGroup = initRadioGroup(must(root, '[data-radio="mode"]'), (value) => {
    mode = value as Mode;
    apply();
    context.announce(fill(p.liveMode, { mode: p.modes[mode] }));
  });

  knob.addEventListener('keydown', (event) => {
    const moves: Record<string, number> = {
      ArrowLeft: split - STEP,
      ArrowDown: split - STEP,
      ArrowRight: split + STEP,
      ArrowUp: split + STEP,
      PageDown: split - PAGE_STEP,
      PageUp: split + PAGE_STEP,
      Home: 0,
      End: 100,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setSplit(moves[event.key]);
  });

  const fromPointer = (event: PointerEvent) => {
    const box = stage.getBoundingClientRect();
    setSplit(((event.clientX - box.left) / box.width) * 100);
  };
  for (const handle of [knob, scrub]) {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      // Keeps the browser from moving focus away from the knob on mousedown.
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      fromPointer(event);
      knob.focus({ preventScroll: true });
    });
    handle.addEventListener('pointermove', (event) => {
      if (handle.hasPointerCapture(event.pointerId)) fromPointer(event);
    });
    handle.addEventListener('dblclick', () => setSplit(50));
  }

  // The legacy frame only becomes a focusable scroll region when it actually scrolls.
  const syncFrame = () => {
    if (frame.scrollWidth > frame.clientWidth + 1) {
      frame.tabIndex = 0;
      frame.setAttribute('role', 'region');
      frame.setAttribute('aria-label', frame.dataset.regionLabel ?? '');
    } else {
      frame.removeAttribute('tabindex');
      frame.removeAttribute('role');
      frame.removeAttribute('aria-label');
    }
  };
  // Sticky elements below the control bar need its real height, which changes when it wraps.
  const syncSticky = () => {
    const sticky = getComputedStyle(controls).position === 'sticky';
    root.style.setProperty('--vt-sticky', sticky ? `${controls.offsetHeight}px` : '0px');
  };
  const observer = new ResizeObserver(() => {
    syncFrame();
    syncSticky();
  });
  observer.observe(frame);
  observer.observe(controls);
  wide.addEventListener('change', apply);

  apply();
  setSplit(split);

  return {
    reset() {
      mode = 'compare';
      modeGroup.set(mode);
      apply();
      setSplit(50);
    },
  };
}
