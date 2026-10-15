type Child = Node | string | null | undefined | false;
type AttrValue = string | number | boolean | null | undefined;

/** Creates an element; null, undefined, and false attributes are skipped, true becomes an empty attribute. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, AttrValue> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    element.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) element.append(child);
  return element;
}

/** Trusted static markup, such as the shared SVG icons. Never pass user input here. */
export function markup(source: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = source;
  return template.content;
}

export function qs<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Corte & Prosa demo: missing ${selector}`);
  return element;
}

export const qsa = <T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] => Array.from(root.querySelectorAll<T>(selector));

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const capitalize = (value: string): string => value.charAt(0).toLocaleUpperCase() + value.slice(1);
