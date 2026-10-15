/**
 * The demo runs on a simulated workday clock instead of the visitor's real time, so the seeded morning
 * (one order done, one in progress, the rest scheduled) makes sense at any hour. The clock starts at
 * WORKDAY_START on the visitor's date and then advances in real time.
 */
export const WORKDAY_START = '09:41';

/** After a longer absence the clock resumes this long after it stopped, instead of jumping hours or days ahead. */
const MAX_IDLE_MS = 10 * 60 * 1000;

/** Milliseconds to add to the real clock so that it reads WORKDAY_START on the date of `realNow`. */
export function anchorOffset(realNow: number): number {
  const [hours, minutes] = WORKDAY_START.split(':').map(Number);
  const start = new Date(realNow);
  start.setHours(hours, minutes, 0, 0);
  return start.getTime() - realNow;
}

/** Offset for a reopened demo: a reload continues where it was, and a long break only counts as MAX_IDLE_MS. */
export function resumeOffset(offset: number, savedAt: number, realNow: number): number {
  const idle = realNow - savedAt;
  return idle > MAX_IDLE_MS ? offset - (idle - MAX_IDLE_MS) : offset;
}
