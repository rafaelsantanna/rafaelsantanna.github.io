import type { Appointment, Interval } from '../data/model';
import type { Clock } from './time';

/** The part of a barber that scheduling depends on. */
export interface Schedule {
  id: string;
  days: readonly number[];
  breaks: readonly Interval[];
}

export interface DayFrame {
  day: string;
  weekday: number;
  hours: Interval | null;
}

export interface SlotRules {
  duration: number;
  buffer: number;
  step: number;
}

export type SlotStatus = 'free' | 'busy' | 'past';

export interface Slot {
  start: number;
  status: SlotStatus;
  /** Barbers who can take this slot, in team order. */
  freeBarbers: string[];
}

export type DayState =
  | { kind: 'closed' }
  | { kind: 'off' }
  | { kind: 'over' }
  | { kind: 'full' }
  | { kind: 'open'; free: number };

export interface DayStats {
  appointments: number;
  own: number;
  total: number;
  occupied: number;
  free: number;
  occupancy: number;
}

const overlaps = (start: number, end: number, other: Interval): boolean => start < other.end && end > other.start;

export const worksOn = (barber: Schedule, weekday: number): boolean => barber.days.includes(weekday);

/** True when two appointments of the same barber would not keep the buffer between them. */
export function clashes(a: Interval, b: Interval, buffer: number): boolean {
  return a.start < b.end + buffer && b.start < a.end + buffer;
}

/** Whether a barber can take [start, start + duration) given hours, breaks, and existing appointments. */
export function fitsBarber(barber: Schedule, hours: Interval, appointments: readonly Appointment[], start: number, rules: SlotRules): boolean {
  const end = start + rules.duration;
  if (start < hours.start || end > hours.end) return false;
  if (barber.breaks.some((pause) => overlaps(start, end, pause))) return false;
  return appointments.every((appointment) => appointment.barberId !== barber.id || !clashes({ start, end }, appointment, rules.buffer));
}

/**
 * Every possible start on the step grid that leaves room for the service before closing,
 * marked free, busy, or past. Pure: the same inputs always give the same slots.
 */
export function listSlots(frame: DayFrame, candidates: readonly Schedule[], appointments: readonly Appointment[], rules: SlotRules, now: Clock): Slot[] {
  const { hours } = frame;
  if (!hours || rules.duration <= 0) return [];
  const working = candidates.filter((barber) => worksOn(barber, frame.weekday));
  if (!working.length) return [];
  const slots: Slot[] = [];
  for (let start = hours.start; start + rules.duration <= hours.end; start += rules.step) {
    const past = frame.day < now.day || (frame.day === now.day && start < now.minutes);
    const freeBarbers = past ? [] : working.filter((barber) => fitsBarber(barber, hours, appointments, start, rules)).map((barber) => barber.id);
    slots.push({ start, status: past ? 'past' : freeBarbers.length ? 'free' : 'busy', freeBarbers });
  }
  return slots;
}

export function dayState(frame: DayFrame, candidates: readonly Schedule[], appointments: readonly Appointment[], rules: SlotRules, now: Clock): DayState {
  if (!frame.hours) return { kind: 'closed' };
  if (!candidates.some((barber) => worksOn(barber, frame.weekday))) return { kind: 'off' };
  const slots = listSlots(frame, candidates, appointments, rules, now);
  const free = slots.filter((slot) => slot.status === 'free').length;
  if (free > 0) return { kind: 'open', free };
  if (slots.length > 0 && slots.every((slot) => slot.status === 'past')) return { kind: 'over' };
  return { kind: 'full' };
}

/** Occupancy of the day on the step grid, counted per working barber and excluding breaks. */
export function dayStats(frame: DayFrame, barbers: readonly Schedule[], appointments: readonly Appointment[], step: number): DayStats {
  const own = appointments.filter((appointment) => appointment.own).length;
  const { hours } = frame;
  if (!hours) return { appointments: 0, own: 0, total: 0, occupied: 0, free: 0, occupancy: 0 };
  let total = 0;
  let occupied = 0;
  for (const barber of barbers) {
    if (!worksOn(barber, frame.weekday)) continue;
    for (let start = hours.start; start < hours.end; start += step) {
      const end = Math.min(start + step, hours.end);
      if (barber.breaks.some((pause) => overlaps(start, end, pause))) continue;
      total += 1;
      if (appointments.some((appointment) => appointment.barberId === barber.id && overlaps(start, end, appointment))) occupied += 1;
    }
  }
  return {
    appointments: appointments.length,
    own,
    total,
    occupied,
    free: total - occupied,
    occupancy: total ? Math.round((occupied / total) * 100) : 0,
  };
}
