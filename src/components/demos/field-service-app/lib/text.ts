/** Plural forms keyed by count; `zero` is optional and wins for 0 when present. */
export interface Plural {
  zero?: string;
  one: string;
  other: string;
}

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
}

export function fill(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

export function plural(forms: Plural, count: number, params: Record<string, string | number> = {}): string {
  const template = count === 0 && forms.zero ? forms.zero : count === 1 ? forms.one : forms.other;
  return fill(template, { n: count, ...params });
}

export interface Formatters {
  /** 24-hour clock, e.g. 14:32. */
  time(ms: number): string;
  /** 24-hour clock with seconds, e.g. 14:32:05. */
  timeSeconds(ms: number): string;
  /** Weekday, day and month, e.g. "terça-feira, 14 de outubro". */
  day(ms: number): string;
  /** Date and time stamped on simulated photos. */
  stamp(ms: number): string;
  /** Optical power with one decimal and a typographic minus sign. */
  dbm(value: number): string;
  /** Speed in Mbps without unnecessary decimals. */
  mbps(value: number): string;
  decimal(value: number): string;
  /** A typed reading as entered, with up to three decimals, so an error never shows a rounded value. */
  reading(value: number): string;
  /** Plain number for an input field: no grouping, so it parses back unchanged. */
  input(value: number): string;
  bytes(size: number): string;
  list(items: string[]): string;
  /** Thousands separator of the locale ("." in pt-BR, "," in English), used to read typed numbers. */
  groupSeparator: string;
}

export function createFormatters(locale: string): Formatters {
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const seconds = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const day = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const stamp = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const oneDecimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const upToOne = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const upToThree = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, useGrouping: false });
  const list = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
  const minus = (text: string) => text.replace('-', '−');
  return {
    time: (ms) => time.format(ms),
    timeSeconds: (ms) => seconds.format(ms),
    day: (ms) => day.format(ms),
    stamp: (ms) => stamp.format(ms),
    dbm: (value) => minus(oneDecimal.format(value)),
    mbps: (value) => upToOne.format(value),
    decimal: (value) => minus(upToOne.format(value)),
    reading: (value) => minus(upToThree.format(value)),
    input: (value) => plain.format(value),
    bytes: (size) => (size < 1024 ? `${size} B` : `${upToOne.format(size / 1024)} KB`),
    list: (items) => list.format(items),
    groupSeparator: upToThree.formatToParts(10000).find((part) => part.type === 'group')?.value ?? ',',
  };
}

/**
 * Parses a typed number. Grouped thousands are read with the locale's separator, so "1.000" is a thousand in
 * pt-BR and "1,000" is a thousand in English. Otherwise a single comma or dot is the decimal point.
 * Returns null when the text is not a plain number.
 */
export function parseDecimal(input: string, groupSeparator: string): number | null {
  const text = input.trim().replace(/\s+/g, '').replace(/^−/, '-');
  const group = groupSeparator === '.' ? '\\.' : ',';
  const decimal = groupSeparator === '.' ? ',' : '\\.';
  const grouped = new RegExp(`^-?\\d{1,3}(${group}\\d{3})+(${decimal}\\d+)?$`);
  if (grouped.test(text)) return Number(text.split(groupSeparator).join('').replace(',', '.'));
  if (!/^-?\d+([.,]\d+)?$/.test(text)) return null;
  return Number(text.replace(',', '.'));
}
