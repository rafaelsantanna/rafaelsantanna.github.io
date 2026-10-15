import type { ClientConfig } from '../data/contract';
import { fill, type Format } from '../lib/format';
import { addDays, type Clock } from '../lib/time';

/** Sentences built from the localized templates, shared by the hero, the flow, and the schedule. */
export function createWords(config: ClientConfig, fmt: Format) {
  const t = config.t;
  const relativeDay = (day: string, clock: Clock): string => {
    if (day === clock.day) return t.today;
    if (day === addDays(clock.day, 1)) return t.tomorrow;
    return fmt.dayLong(day);
  };
  return {
    relativeDay,
    when: (day: string, start: number, clock: Clock): string => fill(t.whenAt, { day: relativeDay(day, clock), time: fmt.hour(start) }),
    dayTag: (day: string, clock: Clock): string | null => {
      if (day === clock.day) return t.todayTag;
      if (day === addDays(clock.day, 1)) return t.tomorrowTag;
      return null;
    },
  };
}

export type Words = ReturnType<typeof createWords>;
