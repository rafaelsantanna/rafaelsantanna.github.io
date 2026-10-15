/** Builds the client application object: data, store, services and the derived render. */
import type { Strings } from '../i18n';
import { clockFromDate, type OperationClock } from '../lib/clock';
import { derive, type Derived } from '../lib/derive';
import { generateDay } from '../lib/generate';
import { VIEWS, type View } from '../lib/model';
import { createLookup } from '../lib/query';
import { buildRoutes, type RouteGeometry } from '../lib/routes';
import { createStore, DEFAULT_UI } from '../lib/store';
import type { RenderContext } from '../render/context';
import { createDialogs } from './dialogs';
import { createRegions, focusables } from './dom';
import { createMotion } from './motion';
import { readRole, restoreChanges, saveChanges } from './persist';
import { createToasts } from './toast';

function viewFromHash(): View {
  const match = VIEWS.find((view) => window.location.hash === `#lc-${view}`);
  return match ?? DEFAULT_UI.view;
}

export function createApp(root: HTMLElement, t: Strings) {
  const day = generateDay();
  const lookup = createLookup(day);
  const base = day.deliveries;
  const baseJson = new Map(base.map((delivery) => [delivery.id, JSON.stringify(delivery)]));
  const startClock = clockFromDate(new Date());
  const bootedAt = Date.now();
  let clock: OperationClock = startClock;

  const store = createStore({
    deliveries: restoreChanges(base, new Set(day.drivers.map((driver) => driver.id))),
    ui: { ...DEFAULT_UI, role: readRole(), view: viewFromHash() },
  });

  const section = (view: View) => root.querySelector<HTMLElement>(`.lc-view[data-view="${view}"]`);
  const activeSection = () => section(store.get().ui.view);
  const svg = root.querySelector<SVGSVGElement>('[data-lc-map-svg]')!;

  const regions = createRegions(root);
  const dialogs = createDialogs(root, activeSection);
  const motionButton = root.querySelector<HTMLButtonElement>('[data-action="motion"]');
  const motion = createMotion(svg, () => app.syncMotionButton());
  const toasts = createToasts(root, { undo: t.toast.undo, dismiss: t.toast.dismiss }, () => dialogs.top(), () => activeSection()?.focus({ preventScroll: true }));

  let routes: RouteGeometry[] = buildRoutes(day.drivers, day.hubs, store.get().deliveries);
  let routesFor = store.get().deliveries;
  let derived: Derived = derive(store.get(), clock, day.drivers, lookup);

  const app = {
    root,
    t,
    day,
    lookup,
    base,
    store,
    regions,
    dialogs,
    toasts,
    motion,
    section,
    activeSection,
    /** ID of the delivery shown in the drawer, if any. */
    drawerId: null as string | null,
    /** Restores the state before the last mutation, while no newer one happened. */
    lastUndo: null as (() => void) | null,
    motionPaused: false,
    get clock() { return clock; },
    get derived() { return derived; },
    context(): RenderContext {
      return { t, lang: t.lang, clock, zones: day.zones, hubs: day.hubs, drivers: day.drivers, lookup, role: store.get().ui.role };
    },
    /** Recomputes derived data; route geometry only when the deliveries changed. */
    refresh() {
      const state = store.get();
      derived = derive(state, clock, day.drivers, lookup);
      if (state.deliveries !== routesFor) {
        routes = buildRoutes(day.drivers, day.hubs, state.deliveries);
        routesFor = state.deliveries;
      }
      return { state, derived, routes };
    },
    /** Advances the operation clock with real elapsed minutes, keeping the same anchor. */
    tickClock() {
      const now = startClock.now + Math.floor((Date.now() - bootedAt) / 60000);
      if (now === clock.now) return false;
      clock = { ...startClock, now };
      return true;
    },
    persist() {
      saveChanges(baseJson, store.get().deliveries);
    },
    firstFocusable(name: string) {
      const element = regions.get(name);
      return (element && focusables(element)[0]) ?? activeSection();
    },
    syncMotionButton() {
      if (!motionButton) return;
      const reduced = motion.reduced();
      const label = motionButton.querySelector('[data-motion-label]');
      if (reduced) motionButton.setAttribute('aria-disabled', 'true');
      else motionButton.removeAttribute('aria-disabled');
      motionButton.classList.toggle('is-paused', app.motionPaused || reduced);
      if (label) label.textContent = reduced ? motionButton.dataset.labelReduced ?? '' : app.motionPaused ? motionButton.dataset.labelResume ?? '' : motionButton.dataset.labelPause ?? '';
    },
  };
  return app;
}

export type App = ReturnType<typeof createApp>;
