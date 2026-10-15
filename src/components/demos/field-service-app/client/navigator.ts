export type Direction = 'forward' | 'back' | 'fade' | 'none';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DURATION = 320;

function parse(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild as HTMLElement;
}

function focusKey(container: HTMLElement): string | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || !container.contains(active)) return null;
  return active.closest<HTMLElement>('[data-key]')?.dataset.key ?? null;
}

export function focusByKey(container: HTMLElement, key: string): boolean {
  const target = container.querySelector<HTMLElement>(`[data-key="${key}"]`);
  if (!target) return false;
  target.focus({ preventScroll: true });
  return true;
}

/** Scrolls only the screen, never the page, so the element sits just below the screen's sticky header. */
export function revealInScreen(screen: HTMLElement, element: HTMLElement, smooth: boolean): void {
  const header = screen.querySelector<HTMLElement>('.t-head')?.offsetHeight ?? 0;
  const top = element.getBoundingClientRect().top - screen.getBoundingClientRect().top + screen.scrollTop - header - 12;
  screen.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
}

/**
 * Owns the single visible screen inside the app viewport. Screens are their own scroll containers,
 * so pushing a screen can slide the new one over the old one like a native stack.
 */
export function createNavigator(host: HTMLElement, reducedMotion: () => boolean) {
  let current = host.querySelector<HTMLElement>('.t-screen');
  const scrollMemory = new Map<string, number>();

  function retire(previous: HTMLElement) {
    previous.inert = true;
    previous.setAttribute('aria-hidden', 'true');
    previous.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  }

  function animate(previous: HTMLElement, next: HTMLElement, direction: Direction) {
    const options = { duration: DURATION, easing: EASE };
    if (direction === 'fade') {
      previous.remove();
      next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
      return;
    }
    const forward = direction === 'forward';
    next.classList.add(forward ? 't-screen--over' : 't-screen--under');
    previous.classList.add(forward ? 't-screen--under' : 't-screen--over');
    next.animate(forward ? [{ transform: 'translateX(100%)' }, { transform: 'none' }] : [{ transform: 'translateX(-28%)', opacity: 0.7 }, { transform: 'none', opacity: 1 }], options);
    const exit = previous.animate(forward ? [{ transform: 'none', opacity: 1 }, { transform: 'translateX(-28%)', opacity: 0.7 }] : [{ transform: 'none' }, { transform: 'translateX(100%)' }], options);
    exit.onfinish = () => {
      previous.remove();
      next.classList.remove('t-screen--over', 't-screen--under');
    };
  }

  return {
    get current() {
      return current;
    },

    /** Shows a new screen. `memoryKey` restores the scroll position the screen had when the visitor left it. */
    show(html: string, direction: Direction, memoryKey: string): HTMLElement {
      const previous = current;
      if (previous?.dataset.memory) scrollMemory.set(previous.dataset.memory, previous.scrollTop);
      host.querySelectorAll('.t-screen[aria-hidden="true"]').forEach((element) => element.remove());
      const next = parse(html);
      next.dataset.memory = memoryKey;
      host.append(next);
      next.scrollTop = scrollMemory.get(memoryKey) ?? 0;
      current = next;
      if (previous) {
        retire(previous);
        if (direction === 'none' || reducedMotion()) previous.remove();
        else animate(previous, next, direction);
      }
      return next;
    },

    /** Re-renders the current screen in place, keeping its scroll position and the focused control. */
    refresh(html: string, preferredFocus?: string): HTMLElement {
      const previous = current;
      const next = parse(html);
      if (!previous) {
        host.append(next);
        current = next;
        return next;
      }
      const key = preferredFocus ?? focusKey(previous);
      const scroll = previous.scrollTop;
      next.dataset.memory = previous.dataset.memory ?? '';
      previous.replaceWith(next);
      current = next;
      next.scrollTop = scroll;
      if (key) focusByKey(next, key);
      return next;
    },

    clearMemory() {
      scrollMemory.clear();
    },
  };
}
