/** Minutes after midnight, as a half-open interval [start, end). */
export interface Interval {
  start: number;
  end: number;
}

/** Opening hours indexed by weekday (0 is Sunday); null means the shop is closed. */
export type WeeklyHours = ReadonlyArray<Interval | null>;

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  /** Services already covered when this one is chosen (a combo). */
  includes: string[];
}

export interface BarberItem {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  specialty: string;
  bio: string;
  /** Weekdays worked (0 is Sunday). */
  days: number[];
  breaks: Interval[];
  daysLabel: string;
}

export interface Appointment {
  id: string;
  barberId: string;
  day: string;
  start: number;
  end: number;
  serviceIds: string[];
  client: string;
  own: boolean;
}

/** The visitor's confirmed booking, persisted in this browser only. */
export interface Booking {
  id: string;
  code: string;
  serviceIds: string[];
  /** 'any' or a barber id, as chosen by the visitor. */
  barberChoice: string;
  /** The barber who actually takes the appointment. */
  barberId: string;
  day: string;
  start: number;
  duration: number;
  price: number;
  name: string;
  phone: string;
  note: string;
  createdAt: string;
}
