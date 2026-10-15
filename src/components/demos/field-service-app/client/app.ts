import type { Locale } from '@/data/types';
import type { Strings } from '../content/strings';
import { unsyncedCount } from '../lib/queue';
import { createFormatters, esc, fill, plural } from '../lib/text';
import type { OrderInfo, SeedDefinition, View } from '../lib/types';
import type { ViewContext } from '../views/common';
import { renderOrder } from '../views/order';
import { queueLists, renderQueue, syncCard } from '../views/queue';
import { renderSettings, settingsRows } from '../views/settings';
import { orderPendingText, pillContent, renderToday } from '../views/today';
import { createChrome } from './chrome';
import { createNavigator, focusByKey, type Direction } from './navigator';
import { createOrderController } from './order-controller';
import { confirmInApp, createControlsSheet } from './overlays';
import { drawPhoto } from './photo';
import { Store } from './store';
import { createSync } from './sync';

interface Config {
  locale: Locale;
  strings: Strings;
  orders: OrderInfo[];
  seed: SeedDefinition;
}

const SKELETON_MS = 900;
const TOAST_MS = 3400;
const STATUS_MS = 6000;

export function mountTurno(root: HTMLElement): void {
  const configElement = root.querySelector('[data-turno-config]');
  const app = root.querySelector<HTMLElement>('[data-app]');
  const host = app?.querySelector<HTMLElement>('[data-host]');
  const modalHost = app?.querySelector<HTMLElement>('[data-modal-host]');
  const live = root.querySelector<HTMLElement>('[data-live]');
  const toastElement = app?.querySelector<HTMLElement>('[data-toast]');
  const controlStatus = root.querySelector<HTMLElement>('[data-control-status]');
  if (!configElement?.textContent || !app || !host || !modalHost || !live || !toastElement) return;

  const config = JSON.parse(configElement.textContent) as Config;
  const s = config.strings;
  const f = createFormatters(s.intl);
  const store = new Store(config.orders, config.seed, config.locale);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => motion.matches;
  const nav = createNavigator(host, reducedMotion);
  const chrome = createChrome(root, s, f);
  let toastTimer: number | undefined;
  let announceTimer: number | undefined;
  let statusTimer: number | undefined;
  let downloadTimer: number | undefined;

  const sync = createSync(store, {
    failed(_event, delay) {
      announce(fill(s.announce.failed, { s: Math.round(delay / 1000) }));
    },
    drained(sent) {
      if (sent < 2) return;
      chrome.flashSynced();
      announce(s.announce.allSynced);
      refreshChrome();
    },
  });

  const ctx = (): ViewContext => ({ s, f, orders: config.orders, state: store.state, now: store.now(), drain: sync.progress() });

  function announce(text: string) {
    window.clearTimeout(announceTimer);
    live!.textContent = '';
    announceTimer = window.setTimeout(() => {
      live!.textContent = text;
    }, 60);
  }

  function toast(text: string) {
    window.clearTimeout(toastTimer);
    toastElement!.textContent = text;
    toastElement!.hidden = false;
    toastTimer = window.setTimeout(() => {
      toastElement!.hidden = true;
    }, TOAST_MS);
  }

  /** Visible confirmation under the demo controls; it clears itself so it never describes a stale queue. */
  function controlFeedback(text: string) {
    window.clearTimeout(statusTimer);
    if (controlStatus) controlStatus.textContent = text;
    announce(text);
    statusTimer = window.setTimeout(() => {
      if (controlStatus) controlStatus.textContent = '';
    }, STATUS_MS);
  }

  /** Feedback for a control inside the phone, which stays visible even when the demo controls sheet is closed. */
  function appFeedback(text: string) {
    toast(text);
    announce(text);
  }

  const order = createOrderController({
    store,
    ctx,
    screen: () => nav.current,
    rerender,
    announce,
    toast,
    reducedMotion,
  });

  function screenHtml(view: View): string {
    const context = ctx();
    switch (view.screen) {
      case 'today':
        return renderToday(context);
      case 'order':
        return renderOrder(context, view.orderId, order.ui(view.orderId));
      case 'queue':
        return renderQueue(context);
      case 'settings':
        return renderSettings(context, store.storedBytes());
    }
  }

  function mountScreen(screen: HTMLElement) {
    screen.querySelectorAll<HTMLCanvasElement>('[data-photo]').forEach((canvas) => {
      drawPhoto(canvas, { variant: Number(canvas.dataset.variant), stamp: f.stamp(Number(canvas.dataset.at)), label: fill(s.common.os, { id: canvas.dataset.order ?? '' }) });
    });
    const view = store.state.view;
    if (view.screen === 'order') order.mount(screen, view.orderId);
    else order.unmount();
  }

  function refreshChrome() {
    chrome.update(ctx(), store.state.view);
  }

  function navigate(view: View, direction: Direction, focus: string | null) {
    store.setView(view);
    const screen = nav.show(screenHtml(view), direction, view.screen === 'order' ? `order-${view.orderId}` : view.screen);
    mountScreen(screen);
    refreshChrome();
    if (focus === 'title') screen.querySelector<HTMLElement>('#t-screen-title')?.focus({ preventScroll: true });
    else if (focus) focusByKey(screen, focus);
  }

  function rerender(focusKey?: string) {
    const screen = nav.refresh(screenHtml(store.state.view), focusKey);
    mountScreen(screen);
  }

  /** Live updates while the queue moves. Only text and attributes change, never the controls a visitor may be using. */
  function patchCurrent() {
    const screen = nav.current;
    if (!screen) return;
    const view = store.state.view;
    const context = ctx();
    if (view.screen === 'today') {
      const pill = screen.querySelector<HTMLElement>('[data-pill]');
      if (pill) {
        const content = pillContent(context);
        pill.className = `t-pill t-pill--${content.tone}`;
        if (pill.innerHTML !== content.html) pill.innerHTML = content.html;
      }
      screen.querySelectorAll<HTMLElement>('[data-order-pending]').forEach((element) => {
        const text = orderPendingText(context, element.dataset.orderPending ?? '');
        element.hidden = !text;
        const label = element.querySelector('[data-order-pending-text]');
        if (label) label.textContent = text;
      });
    } else if (view.screen === 'order') {
      order.patch(screen, view.orderId);
    } else if (view.screen === 'queue') {
      const card = screen.querySelector<HTMLElement>('[data-syncard]');
      const lists = screen.querySelector<HTMLElement>('[data-queue-lists]');
      if (card) card.innerHTML = syncCard(context);
      if (lists) lists.innerHTML = queueLists(context);
    } else {
      const rows = screen.querySelector<HTMLElement>('[data-settings-rows]');
      if (rows) rows.innerHTML = settingsRows(context, store.storedBytes());
    }
  }

  /**
   * After a reset or a wipe the schedule "downloads" for a moment while Today shows a skeleton.
   * Without a connection nothing can download, so it waits until the connection comes back.
   */
  function downloadSchedule(announceWhenDone: boolean) {
    window.clearTimeout(downloadTimer);
    if (!store.state.awaitingSchedule || !store.state.online) return;
    downloadTimer = window.setTimeout(() => {
      store.scheduleLoaded();
      if (announceWhenDone) announce(s.announce.loaded);
      if (store.state.view.screen !== 'today') return;
      const focusTitle = nav.current?.contains(document.activeElement) ?? false;
      const screen = nav.show(renderToday(ctx()), reducedMotion() ? 'none' : 'fade', 'today');
      mountScreen(screen);
      refreshChrome();
      if (focusTitle) screen.querySelector<HTMLElement>('#t-screen-title')?.focus({ preventScroll: true });
    }, SKELETON_MS);
  }

  function setConnection(online: boolean) {
    store.setOnline(online);
    if (!online) {
      sync.pause();
      chrome.clearFlash();
      controlFeedback(s.announce.offline);
    } else {
      controlFeedback(plural(s.announce.online, unsyncedCount(store.state.events)));
      sync.kick();
    }
    if (store.state.awaitingSchedule) {
      // Today switches between "waiting for a connection" and the loading skeleton.
      if (store.state.view.screen === 'today') rerender();
      downloadSchedule(online);
    }
    refreshChrome();
    patchCurrent();
  }

  function syncNow(feedback: (text: string) => void) {
    if (!store.state.online) {
      feedback(s.announce.syncOffline);
      return;
    }
    const pending = unsyncedCount(store.state.events);
    if (!pending) {
      feedback(s.announce.syncNothing);
      return;
    }
    store.retryAllNow();
    sync.kick();
    feedback(plural(s.announce.syncStarted, pending));
  }

  function resetDemo(kind: 'reset' | 'wipe') {
    sync.pause();
    order.reset();
    nav.clearMemory();
    chrome.clearFlash();
    store.reset(kind);
    const screen = nav.show(renderToday(ctx()), 'none', 'today');
    mountScreen(screen);
    refreshChrome();
    downloadSchedule(false);
    if (kind === 'reset') {
      controlFeedback(s.announce.reset);
      return;
    }
    appFeedback(store.state.online ? s.announce.wiped : s.announce.wipedOffline);
    screen.querySelector<HTMLElement>('#t-screen-title')?.focus({ preventScroll: true });
  }

  async function wipe() {
    const pending = plural(s.dialog.pending, unsyncedCount(store.state.events));
    const body = store.state.online ? pending : `${pending} ${s.dialog.offline}`;
    const confirmed = await confirmInApp(app!, modalHost!, { title: s.dialog.title, body, cancel: s.dialog.cancel, confirm: s.dialog.confirm }, esc);
    if (confirmed) resetDemo('wipe');
  }

  function handleAction(action: string, target: HTMLElement) {
    const view = store.state.view;
    switch (action) {
      case 'tab': {
        const tab = target.dataset.tab as 'today' | 'queue' | 'settings';
        const fromTabBar = Boolean(target.closest('[data-tabs]'));
        if (view.screen === tab) {
          nav.current?.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
          return;
        }
        navigate({ screen: tab }, 'fade', fromTabBar ? null : 'title');
        return;
      }
      case 'open-order':
        navigate({ screen: 'order', orderId: target.dataset.order ?? '' }, 'forward', 'title');
        return;
      case 'back': {
        const from = view.screen === 'order' ? view.orderId : null;
        navigate({ screen: 'today' }, 'back', from ? `order-${from}` : 'title');
        return;
      }
      case 'sync-now':
        syncNow(appFeedback);
        return;
      case 'wipe':
        void wipe();
        return;
      default:
        if (view.screen === 'order' && nav.current) order.handle(action, target, nav.current, view.orderId);
    }
  }

  root.addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLElement>('[data-action], [data-control]');
    if (!target || !root.contains(target)) return;
    // These actions stay clickable while marked disabled so they can explain what is missing.
    const explains = ['complete', 'sig-confirm', 'waiver-confirm'].includes(target.dataset.action ?? '');
    if (target.getAttribute('aria-disabled') === 'true' && !explains) return;
    const control = target.dataset.control;
    if (control === 'connection') setConnection(!store.state.online);
    else if (control === 'sync') syncNow(controlFeedback);
    else if (control === 'reset') resetDemo('reset');
    else if (target.dataset.action) handleAction(target.dataset.action, target);
  });

  app.addEventListener('keydown', (event) => {
    const view = store.state.view;
    if (view.screen === 'order' && nav.current) order.onKeydown(event, nav.current, view.orderId);
  });
  app.addEventListener('change', (event) => {
    const view = store.state.view;
    if (view.screen === 'order' && nav.current) order.onChange(event.target as HTMLElement, nav.current, view.orderId);
  });
  app.addEventListener('input', (event) => {
    const view = store.state.view;
    if (view.screen === 'order' && nav.current) order.onInput(event.target as HTMLElement, nav.current, view.orderId);
  });

  store.subscribe((change) => {
    refreshChrome();
    if (change.queue || change.connection) patchCurrent();
    if (store.state.online) sync.kick();
  });

  // Saving on the way out keeps the simulated clock continuous across reloads.
  window.addEventListener('pagehide', () => store.persist());

  createControlsSheet(root);

  const view = store.state.view;
  const first = nav.show(screenHtml(view), 'none', view.screen === 'order' ? `order-${view.orderId}` : view.screen);
  mountScreen(first);
  refreshChrome();
  chrome.tick(store.now());
  root.dataset.ready = '';
  downloadSchedule(false);
  if (store.state.online) sync.kick();

  window.setInterval(() => {
    const now = store.now();
    chrome.tick(now);
    const waiting = store.state.online && store.state.events.some((event) => event.status === 'failed' && event.retryAt !== null && event.retryAt > now - 1000);
    if (!waiting) return;
    refreshChrome();
    if (store.state.view.screen === 'queue') patchCurrent();
  }, 1000);
}
