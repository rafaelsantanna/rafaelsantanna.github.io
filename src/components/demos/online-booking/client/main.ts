import { CONFIG_ID, type ClientConfig } from '../data/contract';
import { createFormat } from '../lib/format';
import { zonedClock } from '../lib/time';
import { createAgenda } from './agenda';
import { BOOKING_HASH } from './dialog';
import { qs } from './dom';
import { createFlow } from './flow';
import { bindNav } from './nav';
import { createPage } from './page';
import { createSchedule } from './schedule';
import { createBookingStore } from './store';
import { createWords } from './words';

function readConfig(): ClientConfig | null {
  const source = document.getElementById(CONFIG_ID)?.textContent;
  if (!source) return null;
  try {
    return JSON.parse(source) as ClientConfig;
  } catch {
    return null;
  }
}

export function start(): void {
  const root = document.querySelector<HTMLElement>('[data-cp-root]');
  const config = readConfig();
  if (!root || !config) return;

  const fmt = createFormat(config.intl, config.t.format);
  const words = createWords(config, fmt);
  const now = zonedClock(config.timeZone);
  const store = createBookingStore(
    config.services.map((service) => service.id),
    config.barbers.map((barber) => barber.id),
    now(),
  );
  const schedule = createSchedule(config, store, now);
  const env = { config, fmt, words, schedule, store };
  const agenda = createAgenda(qs(root, '[data-agenda]'), env);
  const flow = createFlow(qs<HTMLDialogElement>(root, '[data-flow]'), env, () => agenda.showBooking());
  const page = createPage(root, env, { open: (options) => flow.open(options), showOnAgenda: () => agenda.showBooking() });
  const closeNav = bindNav(root);
  const live = qs(root, '[data-live]');

  const announce = (message: string) => {
    if (flow.isOpen) {
      flow.announce(message);
      return;
    }
    live.textContent = '';
    window.setTimeout(() => { live.textContent = message; }, 80);
  };

  store.subscribe(() => {
    agenda.render();
    page.render();
  });

  root.addEventListener('click', (event) => {
    const target = event.target as Element;
    const trigger = target.closest<HTMLElement>('[data-book]');
    if (trigger) {
      event.preventDefault();
      closeNav(trigger);
      const service = trigger.dataset.bookService;
      flow.open(service ? { preset: { serviceIds: [service] }, startAt: 'barber' } : {});
      return;
    }
    if (target.closest('[data-reset-demo]')) {
      store.set(null);
      flow.reset();
      agenda.goToday();
      announce(config.t.resetDone);
    }
  });

  page.render();
  agenda.render();
  window.setInterval(() => {
    // A booking whose appointment ended while the page was open is dropped, once the dialog that may show it is closed.
    if (!flow.isOpen) store.expire(now());
    page.render();
    agenda.tick();
  }, 60_000);
  if (location.hash === BOOKING_HASH) flow.open();
}
