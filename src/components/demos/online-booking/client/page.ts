import type { ClientConfig } from '../data/contract';
import { fill, type Format } from '../lib/format';
import { addDays, weekdayOf, type Clock } from '../lib/time';
import { capitalize, qs, qsa } from './dom';
import type { OpenOptions } from './flow';
import type { Schedule } from './schedule';
import type { BookingStore } from './store';
import type { Words } from './words';

interface PageEnv {
  config: ClientConfig;
  fmt: Format;
  words: Words;
  schedule: Schedule;
  store: BookingStore;
}

interface PageActions {
  open(options?: OpenOptions): void;
  showOnAgenda(): void;
}

/** Live bits of the customer page: open status, next free time, today's hours, and the booking banner. */
export function createPage(root: HTMLElement, env: PageEnv, actions: PageActions) {
  const { config, fmt, words, schedule, store } = env;
  const t = config.t;
  const el = {
    status: qs(root, '[data-open-status]'),
    when: qs(root, '[data-next-when]'),
    who: qs(root, '[data-next-who]'),
    take: qs<HTMLButtonElement>(root, '[data-next-take]'),
    banner: qs(root, '[data-booked]'),
    bannerText: qs(root, '[data-booked-text]'),
    rows: qsa(root, '.hours__row[data-weekdays]'),
  };
  const featured = config.services[0];
  let next: { day: string; start: number } | null = null;

  function openStatus(clock: Clock): { open: boolean; text: string } {
    const hours = config.hours[weekdayOf(clock.day)];
    if (hours && clock.minutes >= hours.start && clock.minutes < hours.end) {
      return { open: true, text: fill(t.openNow, { time: fmt.hour(hours.end) }) };
    }
    for (let offset = 0; offset < 8; offset += 1) {
      const day = addDays(clock.day, offset);
      const opening = config.hours[weekdayOf(day)];
      if (!opening || (offset === 0 && clock.minutes >= opening.start)) continue;
      const when = offset === 0 ? t.today : offset === 1 ? t.tomorrow : fmt.weekdayLong(day);
      return { open: false, text: fill(t.closedNow, { when, time: fmt.hour(opening.start) }) };
    }
    return { open: false, text: '' };
  }

  function renderNext(clock: Clock): void {
    next = null;
    let barber = '';
    for (const day of schedule.window(clock)) {
      const slot = schedule.slots(day, 'any', featured.duration, true, clock).find((item) => item.status === 'free');
      if (slot) {
        next = { day, start: slot.start };
        barber = schedule.barber(slot.freeBarbers[0])?.firstName ?? '';
        break;
      }
    }
    el.when.textContent = next ? capitalize(words.when(next.day, next.start, clock)) : t.nextNone;
    el.when.classList.toggle('is-set', Boolean(next));
    el.who.hidden = !next;
    el.who.textContent = next ? fill(t.nextWith, { name: barber }) : '';
    el.take.hidden = !next;
  }

  function render(): void {
    const clock = schedule.now();
    const status = openStatus(clock);
    el.status.hidden = !status.text;
    el.status.textContent = status.text;
    el.status.dataset.state = status.open ? 'open' : 'closed';
    renderNext(clock);
    const weekday = String(weekdayOf(clock.day));
    el.rows.forEach((row) => {
      const today = (row.dataset.weekdays ?? '').split(',').includes(weekday);
      row.classList.toggle('is-today', today);
      const tag = row.querySelector<HTMLElement>('[data-today-tag]');
      if (tag) tag.hidden = !today;
    });
    const booking = store.get();
    el.banner.hidden = !booking;
    el.bannerText.textContent = booking
      ? fill(t.banner, { when: capitalize(words.when(booking.day, booking.start, clock)), barber: schedule.barber(booking.barberId)?.name ?? '' })
      : '';
  }

  el.take.addEventListener('click', () => {
    if (!next) return;
    actions.open({ preset: { serviceIds: [featured.id], barber: 'any', day: next.day, start: next.start }, startAt: 'details' });
  });
  qs(root, '[data-booked-details]').addEventListener('click', () => actions.open({ showBooking: true }));
  qs(root, '[data-booked-agenda]').addEventListener('click', actions.showOnAgenda);

  return { render };
}
