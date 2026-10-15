// Pure formatting and text helpers shared by server rendering and the browser.
import type { Locale } from '@/data/types';

const intlLocale = (locale: Locale) => (locale === 'pt' ? 'pt-BR' : 'en-US');
const moneyFormats = new Map<Locale, Intl.NumberFormat>();
const plainFormats = new Map<Locale, Intl.NumberFormat>();
const percentFormats = new Map<Locale, Intl.NumberFormat>();

function cached(store: Map<Locale, Intl.NumberFormat>, locale: Locale, options: Intl.NumberFormatOptions) {
  let format = store.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(intlLocale(locale), options);
    store.set(locale, format);
  }
  return format;
}

/** Cents of BRL as currency, e.g. "R$ 1.234,50". */
export function money(cents: number, locale: Locale): string {
  return cached(moneyFormats, locale, { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

/** Cents as a plain two-decimal number, the way the legacy screen shows values. */
export function plain(cents: number, locale: Locale): string {
  return cached(plainFormats, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

export function percent(value: number, locale: Locale): string {
  return `${cached(percentFormats, locale, { maximumFractionDigits: 2 }).format(value)}%`;
}

export function clock(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function shortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Replaces {name} placeholders in a template. */
export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** Picks the singular or plural template by count and fills {n}. */
export function count(n: number, forms: readonly [string, string], params: Record<string, string | number> = {}): string {
  return fill(n === 1 ? forms[0] : forms[1], { n, ...params });
}

export function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Lowercase text without diacritics, for accent-insensitive search. Keeps string length for NFC input. */
export function fold(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Uppercase without accents, as old systems stored names. */
export function legacyText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}

/** Wraps the parts of `text` that match any search term in <mark>, escaping everything. */
export function highlight(text: string, terms: string[]): string {
  const folded = fold(text.normalize('NFC'));
  const source = text.normalize('NFC');
  if (folded.length !== source.length || !terms.length) return esc(source);
  const marks = new Array<boolean>(source.length).fill(false);
  for (const term of terms) {
    let from = folded.indexOf(term);
    while (term && from !== -1) {
      marks.fill(true, from, from + term.length);
      from = folded.indexOf(term, from + term.length);
    }
  }
  let html = '';
  let open = false;
  for (let index = 0; index < source.length; index += 1) {
    if (marks[index] !== open) {
      html += marks[index] ? '<mark>' : '</mark>';
      open = marks[index];
    }
    html += esc(source[index]);
  }
  return open ? `${html}</mark>` : html;
}
