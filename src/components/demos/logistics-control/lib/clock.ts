/**
 * Operation clock. Data times are minutes relative to `anchor` (the current half hour),
 * and `now` is how many minutes have passed since the anchor.
 */
export interface OperationClock {
  anchor: number;
  now: number;
  /** True when the visitor's time is outside operating hours and the demo shows a fixed afternoon. */
  simulated: boolean;
}

export const SIMULATED_TIME = 14 * 60 + 20;
const OPEN_FROM = 10 * 60;
const OPEN_UNTIL = 17 * 60 + 29;

export function clockAt(minutesOfDay: number, simulated: boolean): OperationClock {
  const anchor = Math.floor(minutesOfDay / 30) * 30;
  return { anchor, now: minutesOfDay - anchor, simulated };
}

/** Clock used for server rendering and for visits outside operating hours. */
export function snapshotClock(): OperationClock {
  return clockAt(SIMULATED_TIME, true);
}

export function clockFromDate(date: Date): OperationClock {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < OPEN_FROM || minutes > OPEN_UNTIL) return snapshotClock();
  return clockAt(minutes, false);
}

/** "14:05" for a time relative to the anchor. */
export function timeOf(clock: OperationClock, relative: number): string {
  const total = (((clock.anchor + Math.round(relative)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function nowLabel(clock: OperationClock): string {
  return timeOf(clock, clock.now);
}
