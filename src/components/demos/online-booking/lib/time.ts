/** Calendar helpers on local dates, keyed as YYYY-MM-DD so they compare as strings. */
export interface Clock {
  day: string;
  minutes: number;
}

export const pad2 = (value: number): string => String(value).padStart(2, '0');

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function dateOf(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: string, amount: number): string {
  const date = dateOf(key);
  date.setDate(date.getDate() + amount);
  return dayKey(date);
}

export const weekdayOf = (key: string): number => dateOf(key).getDay();

export function daysFrom(key: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(key, index));
}

/**
 * Reads the wall clock of a fixed IANA time zone, so today, open status, and past times follow the
 * shop's clock wherever the page is opened.
 */
export function zonedClock(timeZone: string): (date?: Date) => Clock {
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return (date = new Date()) => {
    const parts = Object.fromEntries(format.formatToParts(date).map((part) => [part.type, part.value]));
    return { day: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  };
}

/**
 * The instant at which the clock of `timeZone` shows `minutes` past midnight on `day`. The offset is read
 * at that wall time, which is exact for zones without a daylight saving change, such as the shop's.
 */
export function zonedInstant(day: string, minutes: number, timeZone: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  const asUtc = Date.UTC(year, month - 1, date, 0, minutes);
  const shown = zonedClock(timeZone)(new Date(asUtc));
  const [shownYear, shownMonth, shownDate] = shown.day.split('-').map(Number);
  const offset = Date.UTC(shownYear, shownMonth - 1, shownDate, 0, shown.minutes) - asUtc;
  return new Date(asUtc - offset);
}

/** 24-hour label such as 09:15. */
export const clockLabel = (minutes: number): string => `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
