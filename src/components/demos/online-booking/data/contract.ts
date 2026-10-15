import type { ClientStrings } from './i18n';
import type { BarberItem, ServiceItem, WeeklyHours } from './model';

/** Everything the browser scripts need, serialized into the page as JSON. */
export interface ClientConfig {
  intl: string;
  services: ServiceItem[];
  barbers: BarberItem[];
  hours: WeeklyHours;
  /** IANA time zone of the shop. */
  timeZone: string;
  rules: { buffer: number; step: number; windowDays: number };
  t: ClientStrings;
  flow: { steps: string[]; helpers: string[] };
}

export const CONFIG_ID = 'cp-config';
