import { dateOf, pad2 } from './time';

export interface FormatStrings {
  durationMinutes: string;
  durationHours: string;
  durationHoursMinutes: string;
  hourWhole: string;
  hourMinutes: string;
}

export interface Plural {
  zero?: string;
  one: string;
  other: string;
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

const stripDot = (value: string): string => value.replace(/\.$/, '');
const capitalize = (value: string): string => value.charAt(0).toLocaleUpperCase() + value.slice(1);

/** Locale-aware formatters; the wording comes from the localized templates. */
export function createFormat(intl: string, strings: FormatStrings) {
  const money = new Intl.NumberFormat(intl, { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const plural = new Intl.PluralRules(intl);
  const longDay = new Intl.DateTimeFormat(intl, { weekday: 'long', day: 'numeric', month: 'long' });
  const weekdayLong = new Intl.DateTimeFormat(intl, { weekday: 'long' });
  const weekdayShort = new Intl.DateTimeFormat(intl, { weekday: 'short' });
  const monthShort = new Intl.DateTimeFormat(intl, { month: 'short' });
  const shortDate = new Intl.DateTimeFormat(intl, { weekday: 'short', day: '2-digit', month: '2-digit' });

  return {
    price: (value: number): string => money.format(value),
    duration(minutes: number): string {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      if (!hours) return fill(strings.durationMinutes, { m: minutes });
      if (!rest) return fill(strings.durationHours, { h: hours });
      return fill(strings.durationHoursMinutes, { h: hours, m: rest, mm: pad2(rest) });
    },
    /** Always in minutes, so services compare at a glance (70 min, not 1h10). */
    minutes: (minutes: number): string => fill(strings.durationMinutes, { m: minutes }),
    /** Prose hour, such as 9h or 10h15 in Portuguese. */
    hour(minutes: number): string {
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      return fill(rest ? strings.hourMinutes : strings.hourWhole, { h: hours, hh: pad2(hours), mm: pad2(rest) });
    },
    count(forms: Plural, value: number): string {
      if (value === 0 && forms.zero) return fill(forms.zero, { n: value });
      return fill(plural.select(value) === 'one' ? forms.one : forms.other, { n: value });
    },
    dayLong: (day: string): string => longDay.format(dateOf(day)),
    weekdayLong: (day: string): string => weekdayLong.format(dateOf(day)),
    weekdayShort: (day: string): string => capitalize(stripDot(weekdayShort.format(dateOf(day)))),
    monthShort: (day: string): string => stripDot(monthShort.format(dateOf(day))),
    dayNumber: (day: string): string => String(dateOf(day).getDate()),
    dayShort: (day: string): string => capitalize(shortDate.format(dateOf(day)).replace(/\./g, '')),
  };
}

export type Format = ReturnType<typeof createFormat>;
