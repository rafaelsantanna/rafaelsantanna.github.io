import type { Booking } from '../data/model';
import { bookingEnded, parseBooking } from '../lib/booking';
import type { Clock } from '../lib/time';

const STORAGE_KEY = 'rs-demo-online-booking:booking';

type Listener = (booking: Booking | null) => void;

export interface BookingStore {
  get(): Booking | null;
  set(booking: Booking | null): void;
  /** Drops the booking once its appointment has ended. */
  expire(clock: Clock): void;
  subscribe(listener: Listener): void;
}

function read(serviceIds: readonly string[], barberIds: readonly string[]): Booking | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseBooking(JSON.parse(raw), serviceIds, barberIds) : null;
  } catch {
    return null;
  }
}

function write(booking: Booking | null): void {
  try {
    if (booking) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private windows, strict settings); the booking then lives only in memory.
  }
}

/** The visitor's single booking, kept in this browser. A booking that has already ended is dropped on load. */
export function createBookingStore(serviceIds: readonly string[], barberIds: readonly string[], clock: Clock): BookingStore {
  let current = read(serviceIds, barberIds);
  if (current && bookingEnded(current, clock)) {
    current = null;
    write(null);
  }
  const listeners = new Set<Listener>();
  const store: BookingStore = {
    get: () => current,
    set(booking) {
      current = booking;
      write(booking);
      listeners.forEach((listener) => listener(booking));
    },
    expire(now) {
      if (current && bookingEnded(current, now)) store.set(null);
    },
    subscribe(listener) {
      listeners.add(listener);
    },
  };
  return store;
}
