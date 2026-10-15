/** Small DOM helpers: region updates that keep keyboard focus, and focus utilities. */

export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusables(container: Element): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.offsetParent !== null || element === document.activeElement);
}

/** Finds the element that carries the same data-key, so focus survives a re-render. */
export function byKey(container: ParentNode, key: string | undefined): HTMLElement | null {
  if (!key) return null;
  return container.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`);
}

export function activeKey(): string | undefined {
  return (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[data-key]')?.dataset.key;
}

/**
 * Updates a region's markup only when it changed. If focus was inside, it returns to the element
 * with the same data-key, or to `fallback` when that element no longer exists.
 */
export function createRegions(root: HTMLElement) {
  const cache = new Map<string, string>();
  const elements = new Map<string, Element>();
  const get = (name: string) => {
    if (!elements.has(name)) {
      const element = root.querySelector(`[data-region="${name}"]`);
      if (element) elements.set(name, element);
    }
    return elements.get(name) ?? null;
  };
  return {
    get,
    set(name: string, html: string, fallback?: () => HTMLElement | null): boolean {
      const element = get(name);
      if (!element || cache.get(name) === html) return false;
      const hadFocus = element.contains(document.activeElement);
      const key = hadFocus ? activeKey() : undefined;
      element.innerHTML = html;
      cache.set(name, html);
      if (hadFocus) (byKey(element, key) ?? fallback?.())?.focus({ preventScroll: true });
      return true;
    },
    forget(name: string) {
      cache.delete(name);
    },
  };
}

export function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
