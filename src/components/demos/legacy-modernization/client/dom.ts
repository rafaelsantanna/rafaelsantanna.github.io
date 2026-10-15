import type { Locale } from '@/data/types';
import type { Strings } from '../strings.ts';

export interface Context {
  locale: Locale;
  t: Strings;
  announce(message: string): void;
  reducedMotion(): boolean;
}

/** Finds a required element or fails loudly: a missing hook is a markup bug, not a runtime state. */
export function must<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Ventura demo: missing ${selector}`);
  return element;
}

export function createAnnouncer(region: HTMLElement): (message: string) => void {
  let timer = 0;
  return (message) => {
    window.clearTimeout(timer);
    region.textContent = '';
    // A short gap makes screen readers announce a message even when it repeats.
    timer = window.setTimeout(() => {
      region.textContent = message;
    }, 60);
  };
}

/** Scrolls an element into view (respecting reduced motion) and focuses it without a second jump. */
export function focusInView(element: HTMLElement, context: Context, block: ScrollLogicalPosition = 'center'): void {
  element.scrollIntoView({ block, behavior: context.reducedMotion() ? 'auto' : 'smooth' });
  element.focus({ preventScroll: true });
}
