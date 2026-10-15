import type { Lang } from '../lib/lang';
import { tokenize } from '../lib/text';

export type Child = Node | string | null | undefined | false;
type AttrValue = string | number | boolean | null | undefined;

/** Small element builder. Text always goes through text nodes, never through HTML parsing. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, AttrValue> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (name === 'class') element.className = String(value);
    else element.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child);
  }
  return element;
}

/** Wraps every word whose stem is in `stems` with <mark>. */
export function highlight(text: string, stems: ReadonlySet<string>, lang: Lang): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let cursor = 0;
  for (const token of tokenize(text, lang)) {
    if (token.stop || !stems.has(token.stem)) continue;
    if (token.start > cursor) fragment.append(text.slice(cursor, token.start));
    fragment.append(h('mark', { class: 'ka-mark-term' }, token.raw));
    cursor = token.end;
  }
  if (cursor < text.length) fragment.append(text.slice(cursor));
  return fragment;
}

/** Resolves after the browser has painted at least once, so a status change becomes visible. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
