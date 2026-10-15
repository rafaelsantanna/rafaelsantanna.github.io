/**
 * One toast at a time, written into a polite live region. While a modal is open the toast goes into
 * that modal's slot, so its Undo button stays reachable. Hover or focus pauses the timer.
 */
import { esc, icon } from '../render/html';

export interface ToastOptions {
  message: string;
  tone?: 'success' | 'info' | 'warning';
  undo?: () => void;
}

interface Labels { undo: string; dismiss: string }

const DURATION = 7000;
const SHORT_DURATION = 4500;

export function createToasts(root: HTMLElement, labels: Labels, topDialog: () => HTMLDialogElement | null, focusFallback: () => void) {
  let current: { element: HTMLElement; options: ToastOptions; remaining: number; started: number; timer: number } | null = null;

  const slot = () => topDialog()?.querySelector<HTMLElement>('[data-toast-slot]') ?? root.querySelector<HTMLElement>('.lc-toast-slot--global');

  function dismiss() {
    if (!current) return;
    const { element, timer } = current;
    const hadFocus = element.contains(document.activeElement);
    window.clearTimeout(timer);
    current = null;
    element.remove();
    if (hadFocus) focusFallback();
  }

  /** Moves the visible toast to the slot that is reachable now, e.g. after a modal closes. */
  function relocate() {
    const target = slot();
    if (current && target && current.element.parentElement !== target) target.append(current.element);
  }

  function schedule() {
    if (!current) return;
    current.started = Date.now();
    current.timer = window.setTimeout(dismiss, current.remaining);
  }

  function pause() {
    if (!current) return;
    window.clearTimeout(current.timer);
    current.remaining = Math.max(1500, current.remaining - (Date.now() - current.started));
  }

  function show(options: ToastOptions) {
    dismiss();
    const target = slot();
    if (!target) return;
    const element = document.createElement('div');
    element.className = `lc-toast lc-toast--${options.tone ?? 'success'}`;
    const iconName = options.tone === 'warning' ? 'lock' : options.tone === 'info' ? 'check' : 'delivered';
    element.innerHTML = `${icon(iconName, 'lc-icon lc-toast__icon')}<p class="lc-toast__text">${esc(options.message)}</p>${options.undo ? `<button type="button" class="lc-toast__undo" data-toast-undo>${esc(labels.undo)}</button>` : ''}<button type="button" class="lc-iconbtn lc-iconbtn--sm lc-toast__close" data-toast-close aria-label="${esc(labels.dismiss)}">${icon('close')}</button>`;
    element.addEventListener('pointerenter', pause);
    element.addEventListener('pointerleave', schedule);
    element.addEventListener('focusin', pause);
    element.addEventListener('focusout', (event) => {
      if (!element.contains(event.relatedTarget as Node | null)) schedule();
    });
    element.querySelector('[data-toast-close]')?.addEventListener('click', dismiss);
    element.querySelector('[data-toast-undo]')?.addEventListener('click', () => {
      const undo = options.undo;
      dismiss();
      undo?.();
    });
    target.append(element);
    current = { element, options, remaining: options.undo ? DURATION : SHORT_DURATION, started: Date.now(), timer: 0 };
    schedule();
  }

  return { show, dismiss, relocate };
}
