import type { Booking } from '../data/model';
import type { Clock } from './time';

const codeAlphabet = 'ACDEFHJKMNPRTUVWXY3479';

function randomInts(count: number): number[] {
  const values = new Uint32Array(count);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(values);
  else values.forEach((_, index) => { values[index] = Math.floor(Math.random() * 2 ** 32); });
  return Array.from(values);
}

/** Short reference shown to the visitor, for example CP-7KXM. */
export function bookingCode(): string {
  return `CP-${randomInts(4).map((value) => codeAlphabet[value % codeAlphabet.length]).join('')}`;
}

export function bookingId(): string {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `cp-${Date.now().toString(36)}-${randomInts(1)[0].toString(36)}`;
}

/** True once the appointment is over: on an earlier day, or today with its end time already reached. */
export function bookingEnded(booking: Pick<Booking, 'day' | 'start' | 'duration'>, clock: Clock): boolean {
  return booking.day < clock.day || (booking.day === clock.day && booking.start + booking.duration <= clock.minutes);
}

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** Validates a stored booking, rejecting anything that does not match the current catalog. */
export function parseBooking(value: unknown, serviceIds: readonly string[], barberIds: readonly string[]): Booking | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  const services = Array.isArray(data.serviceIds) ? data.serviceIds.filter(isString) : [];
  const valid =
    isString(data.id) && isString(data.code) && isString(data.barberChoice) && isString(data.barberId) &&
    isString(data.day) && /^\d{4}-\d{2}-\d{2}$/.test(data.day) && isNumber(data.start) && isNumber(data.duration) &&
    isNumber(data.price) && isString(data.name) && isString(data.phone) && isString(data.note) && isString(data.createdAt) &&
    services.length > 0 && services.every((id) => serviceIds.includes(id)) && barberIds.includes(data.barberId as string);
  if (!valid) return null;
  return {
    id: data.id as string,
    code: data.code as string,
    serviceIds: services,
    barberChoice: data.barberChoice as string,
    barberId: data.barberId as string,
    day: data.day as string,
    start: data.start as number,
    duration: data.duration as number,
    price: data.price as number,
    name: data.name as string,
    phone: data.phone as string,
    note: data.note as string,
    createdAt: data.createdAt as string,
  };
}
