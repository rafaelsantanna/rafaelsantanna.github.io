import type { Locale } from '@/data/types';
import { BUFFER_MINUTES, SHOP_TIME_ZONE, SLOT_STEP, WINDOW_DAYS, localizedBarbers, localizedServices, weeklyHours } from './catalog';
import type { ClientConfig } from './contract';
import { strings } from './i18n';

export function buildClientConfig(locale: Locale): ClientConfig {
  const copy = strings[locale];
  return {
    intl: copy.intl,
    services: localizedServices(locale),
    barbers: localizedBarbers(locale),
    hours: weeklyHours,
    timeZone: SHOP_TIME_ZONE,
    rules: { buffer: BUFFER_MINUTES, step: SLOT_STEP, windowDays: WINDOW_DAYS },
    t: copy.client,
    flow: { steps: copy.flow.steps, helpers: copy.flow.helpers },
  };
}

/** JSON that is safe to place inside a script element. */
export function serializeConfig(config: ClientConfig): string {
  return JSON.stringify(config).replace(/</g, '\\u003c');
}
