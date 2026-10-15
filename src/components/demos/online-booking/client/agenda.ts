import type { ClientConfig } from '../data/contract';
import { fill, type Format } from '../lib/format';
import { addDays } from '../lib/time';
import { buildTimeline } from './agenda-grid';
import { capitalize, h, qs, reducedMotion } from './dom';
import type { Schedule } from './schedule';
import type { BookingStore } from './store';
import type { Words } from './words';

interface AgendaEnv {
  config: ClientConfig;
  fmt: Format;
  words: Words;
  schedule: Schedule;
  store: BookingStore;
}

/** The shop-side view: the selected day per barber, with stats from the same data the booking uses. */
export function createAgenda(board: HTMLElement, env: AgendaEnv) {
  const { config, fmt, words, schedule, store } = env;
  const t = config.t.agenda;
  const el = {
    date: qs(board, '[data-agenda-date]'),
    prev: qs<HTMLButtonElement>(board, '[data-agenda-prev]'),
    next: qs<HTMLButtonElement>(board, '[data-agenda-next]'),
    today: qs<HTMLButtonElement>(board, '[data-agenda-today]'),
    mine: qs<HTMLButtonElement>(board, '[data-agenda-mine]'),
    stats: qs(board, '[data-agenda-stats]'),
    grid: qs(board, '[data-agenda-grid]'),
  };
  let day = schedule.now().day;

  const setDisabled = (button: HTMLButtonElement, disabled: boolean) => button.setAttribute('aria-disabled', String(disabled));

  function stat(label: string, value: string, note: string | null, extra: Node | null = null): HTMLElement {
    return h('div', { class: 'stat' }, h('dt', {}, label), h('dd', {}, h('strong', {}, value), extra, note ? h('span', { class: 'stat__note' }, note) : null));
  }

  function renderStats(open: boolean): void {
    el.stats.hidden = !open;
    if (!open) {
      el.stats.replaceChildren();
      return;
    }
    const stats = schedule.stats(day);
    const meter = h('span', { class: 'meter', 'aria-hidden': 'true' }, h('span', { style: `inline-size: ${stats.occupancy}%` }));
    el.stats.replaceChildren(
      stat(t.appointments, String(stats.appointments), stats.own ? t.ownIncluded : null),
      stat(t.occupancy, `${stats.occupancy}%`, null, meter),
      stat(t.occupied, String(stats.occupied), t.unit),
      stat(t.free, String(stats.free), t.unit),
    );
  }

  function render(): void {
    const clock = schedule.now();
    const days = schedule.window(clock);
    if (!days.includes(day)) day = clock.day;
    const frame = schedule.frame(day);
    const tag = words.dayTag(day, clock);
    const dayName = capitalize(fmt.dayLong(day));
    el.date.textContent = tag ? `${dayName} · ${tag}` : dayName;
    setDisabled(el.prev, day === days[0]);
    setDisabled(el.next, day === days[days.length - 1]);
    setDisabled(el.today, day === clock.day);
    const booking = store.get();
    el.mine.hidden = !booking || !days.includes(booking.day);
    el.grid.setAttribute('aria-label', fill(t.gridLabel, { day: dayName }));
    renderStats(Boolean(frame.hours));
    if (!frame.hours) {
      const nextOpen = days.find((candidate) => candidate > day && schedule.frame(candidate).hours);
      el.grid.replaceChildren(
        h(
          'div',
          { class: 'board__closed' },
          h('p', { class: 'board__closed-title' }, t.closed),
          h('p', {}, `${capitalize(config.t.closedReasons[frame.weekday])}.`),
          nextOpen ? h('button', { type: 'button', class: 'btn btn--dark btn--small', 'data-next-open': nextOpen }, t.nextOpen) : null,
        ),
      );
      return;
    }
    el.grid.replaceChildren(
      buildTimeline(frame, schedule.appointments(day, true), clock, { barbers: config.barbers, t, fmt, serviceNames: schedule.serviceNames }),
    );
  }

  function move(target: string): void {
    day = target;
    render();
  }

  function showBooking(): void {
    const booking = store.get();
    if (!booking) return;
    move(booking.day);
    const own = el.grid.querySelector<HTMLElement>('[data-own]');
    if (!own) return;
    own.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center', inline: 'center' });
    own.focus({ preventScroll: true });
    own.classList.remove('is-flash');
    void own.offsetWidth;
    own.classList.add('is-flash');
  }

  const step = (button: HTMLButtonElement, amount: number) =>
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') !== 'true') move(addDays(day, amount));
    });
  step(el.prev, -1);
  step(el.next, 1);
  el.today.addEventListener('click', () => move(schedule.now().day));
  el.mine.addEventListener('click', showBooking);
  el.grid.addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLElement>('[data-next-open]');
    if (target?.dataset.nextOpen) {
      move(target.dataset.nextOpen);
      el.grid.focus();
    }
  });

  return {
    render,
    showBooking,
    goToday: () => move(schedule.now().day),
    /** Minute refresh, skipped while the visitor is working inside the board. */
    tick(): void {
      if (!board.contains(document.activeElement)) render();
    },
  };
}
