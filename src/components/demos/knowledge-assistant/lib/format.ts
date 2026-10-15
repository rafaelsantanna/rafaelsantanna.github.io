import type { Lang } from './lang';

const tag = (lang: Lang) => (lang === 'pt' ? 'pt-BR' : 'en');

/** "2026-07" -> "jul. de 2026" / "Jul 2026". */
export function formatMonth(value: string, lang: Lang): string {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(tag(lang), { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 15)));
}

export function formatDecimal(value: number, lang: Lang, digits = 2): string {
  return new Intl.NumberFormat(tag(lang), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** Browsers coarsen performance.now() (often to 0.1 ms), so durations show one decimal. */
export function formatMs(value: number, lang: Lang): string {
  if (value < 0.1) return `< ${formatDecimal(0.1, lang, 1)} ms`;
  return `${formatDecimal(value, lang, 1)} ms`;
}
