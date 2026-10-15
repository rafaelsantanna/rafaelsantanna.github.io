export interface Plural { zero?: string; one: string; other: string }

/** Replaces {name} placeholders. */
export function fill(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Zero uses its own form when given, otherwise the plural one ("0 entregas", not "0 entrega"). */
export function plural(lang: string, n: number, forms: Plural, values: Record<string, string | number> = {}): string {
  const template = n === 0 ? forms.zero ?? forms.other : new Intl.PluralRules(lang).select(n) === 'one' ? forms.one : forms.other;
  return fill(template, { n: formatNumber(lang, n), ...values });
}

export function formatNumber(lang: string, value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(lang, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(value);
}

export function formatPercent(lang: string, ratio: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(ratio);
}

export function formatDuration(minutes: number, forms: { minutes: string; hours: string; hoursMinutes: string }): string {
  const total = Math.max(1, Math.round(minutes));
  if (total < 60) return fill(forms.minutes, { m: total });
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest ? fill(forms.hoursMinutes, { h: hours, m: String(rest).padStart(2, '0') }) : fill(forms.hours, { h: hours });
}

export function formatDate(lang: string, date: Date): string {
  return new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
}
