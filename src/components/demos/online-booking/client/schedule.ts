import type { ClientConfig } from '../data/contract';
import type { Appointment, BarberItem, Booking } from '../data/model';
import { clashes, dayState, dayStats, listSlots, type DayFrame } from '../lib/availability';
import { seedAppointments } from '../lib/seed';
import { addDays, daysFrom, weekdayOf, type Clock } from '../lib/time';
import type { BookingStore } from './store';

/**
 * Connects the pure scheduling rules to the catalog, the seeded book, and the visitor's booking.
 * `now` reads the shop's clock.
 */
export function createSchedule(config: ClientConfig, store: BookingStore, now: () => Clock) {
  const seeds = new Map<string, Appointment[]>();
  const durationOf = (id: string): number => config.services.find((service) => service.id === id)?.duration ?? 0;

  function frame(day: string): DayFrame {
    const weekday = weekdayOf(day);
    return { day, weekday, hours: config.hours[weekday] ?? null };
  }

  function seeded(day: string): Appointment[] {
    let list = seeds.get(day);
    if (!list) {
      const dayFrame = frame(day);
      list = config.barbers.flatMap((barber, chair) => seedAppointments(dayFrame, barber, chair, durationOf, config.rules.buffer, config.rules.step));
      seeds.set(day, list);
    }
    return list;
  }

  const ownAppointment = (booking: Booking): Appointment => ({
    id: booking.id,
    barberId: booking.barberId,
    day: booking.day,
    start: booking.start,
    end: booking.start + booking.duration,
    serviceIds: booking.serviceIds,
    client: booking.name,
    own: true,
  });

  /**
   * The day's book. Seeded appointments that would collide with the visitor's booking give way to it.
   * The booking flow leaves the visitor's own booking out, because confirming a new one replaces it.
   */
  function appointments(day: string, includeOwn: boolean): Appointment[] {
    const booking = store.get();
    const own = booking && booking.day === day ? ownAppointment(booking) : null;
    if (!own) return seeded(day);
    const kept = seeded(day).filter((item) => item.barberId !== own.barberId || !clashes(item, own, config.rules.buffer));
    return includeOwn ? [...kept, own].sort((a, b) => a.start - b.start) : kept;
  }

  const candidates = (choice: string | null): BarberItem[] =>
    choice && choice !== 'any' ? config.barbers.filter((barber) => barber.id === choice) : config.barbers;
  const rules = (duration: number) => ({ duration, buffer: config.rules.buffer, step: config.rules.step });

  return {
    now,
    frame,
    appointments,
    window: (clock: Clock = now()): string[] => daysFrom(clock.day, config.rules.windowDays),
    isTomorrow: (day: string, clock: Clock = now()): boolean => day === addDays(clock.day, 1),
    slots: (day: string, choice: string | null, duration: number, includeOwn: boolean, clock: Clock = now()) =>
      listSlots(frame(day), candidates(choice), appointments(day, includeOwn), rules(duration), clock),
    dayState: (day: string, choice: string | null, duration: number, includeOwn: boolean, clock: Clock = now()) =>
      dayState(frame(day), candidates(choice), appointments(day, includeOwn), rules(duration), clock),
    stats: (day: string) => dayStats(frame(day), config.barbers, appointments(day, true), config.rules.step),
    barber: (id: string): BarberItem | undefined => config.barbers.find((barber) => barber.id === id),
    serviceNames: (ids: readonly string[]): string =>
      config.services.filter((service) => ids.includes(service.id)).map((service) => service.name).join(', '),
  };
}

export type Schedule = ReturnType<typeof createSchedule>;
