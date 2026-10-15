/** Projects the current state onto the page. Regions only change when their markup changes. */
import { nowLabel } from '../lib/clock';
import { fill, formatDate, formatNumber, plural } from '../lib/format';
import { VIEWS, type Delivery } from '../lib/model';
import { hasActiveFilters } from '../lib/query';
import type { RouteGeometry } from '../lib/routes';
import { renderBulk } from '../render/bulk';
import type { RenderContext } from '../render/context';
import { renderDrawer } from '../render/drawer';
import { esc } from '../render/html';
import { renderDriverCards } from '../render/drivers';
import { renderKpis } from '../render/kpis';
import { renderDriverChips, renderRoutes, renderVehicles } from '../render/map';
import { OVERVIEW_QUEUE_LIMIT, renderKindChips, renderQueue } from '../render/queue';
import { pageCheckState, renderCards, renderHead, renderPagination, renderRange, renderRows, renderStatusChips } from '../render/table';
import type { App } from './app';

type SetRegion = (name: string, html: string) => boolean;

/**
 * Renders the shell, the visible view and the open drawer. Hidden views keep their last markup and
 * catch up when they are shown, since switching views goes through the store as well.
 */
export function renderApp(app: App) {
  const { root, t, regions } = app;
  const { state, derived, routes } = app.refresh();
  const { ui } = state;
  const set: SetRegion = (name, html) => regions.set(name, html, () => app.firstFocusable(name));

  // Shell: views, navigation, clock, role.
  root.dataset.view = ui.view;
  VIEWS.forEach((view) => {
    app.section(view)?.classList.toggle('is-active', view === ui.view);
    root.querySelectorAll(`[data-view-link="${view}"].lc-nav__link`).forEach((link) => {
      if (view === ui.view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
  app.motion.setActive(ui.view === 'overview');
  root.querySelectorAll<HTMLButtonElement>('[data-action="role"]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.role === ui.role)));
  const clockElement = root.querySelector('[data-lc-clock]');
  if (clockElement) clockElement.textContent = nowLabel(app.clock);
  root.querySelector<HTMLElement>('[data-lc-sim]')?.toggleAttribute('hidden', !app.clock.simulated);
  const dateElement = root.querySelector('[data-lc-date]');
  if (dateElement) {
    const date = formatDate(t.lang, new Date());
    dateElement.textContent = date.charAt(0).toUpperCase() + date.slice(1);
  }
  const navCount = root.querySelector('[data-nav-count="exceptions"]');
  if (navCount) navCount.textContent = formatNumber(t.lang, derived.queue.length);

  const ctx = app.context();
  switch (ui.view) {
    case 'overview': renderOverview(app, set, ctx, routes); break;
    case 'deliveries': renderDeliveries(app, set, ctx); break;
    case 'drivers': set('drivers', renderDriverCards(derived.stats, ctx)); break;
    default:
      set('kind-chips', renderKindChips(derived.queue, ui.queueKind, ctx));
      set('queue-full', renderQueue(derived.queueFiltered, ctx, 'ex', ui.queueKind ? t.queue.emptyFiltered : t.queue.empty));
  }

  // Drawer follows the same state while it is open.
  const open: Delivery | undefined = app.drawerId ? state.deliveries.find((delivery) => delivery.id === app.drawerId) : undefined;
  if (open && app.dialogs.isOpen('drawer')) {
    regions.set('drawer', renderDrawer(open, ctx), () => root.querySelector<HTMLElement>('#lc-drawer-title'));
  }
}

function renderOverview(app: App, set: SetRegion, ctx: RenderContext, routes: RouteGeometry[]) {
  const { t, derived } = app;
  const { filters } = app.store.get().ui;
  set('kpis', renderKpis(derived.kpis, ctx));
  set('routes', renderRoutes(routes, derived.stats, filters.driver));
  if (set('vehicles', renderVehicles(routes, derived.stats, ctx, filters.driver))) app.motion.setRoutes(routes);
  set('driver-chips', renderDriverChips(derived.stats, ctx, filters.driver));
  set('queue-count', esc(plural(t.lang, derived.queue.length, t.queue.count)));
  set('queue-all', esc(fill(t.queue.seeAll, { n: derived.queue.length })));
  set('queue-overview', renderQueue(derived.queue.slice(0, OVERVIEW_QUEUE_LIMIT), ctx, 'ov', t.queue.empty));
}

type ListLayout = 'table' | 'cards';

let renderedLayout: ListLayout | null = null;

/** The deliveries layout on screen, as chosen by the container query in list.css (--lc-list). */
function listLayout(app: App): ListLayout {
  const cards = app.regions.get('cards');
  return cards && getComputedStyle(cards).getPropertyValue('--lc-list').trim() === 'cards' ? 'cards' : 'table';
}

/** Redraws the deliveries view when a resize switched it between the table and the cards. */
export function syncListLayout(app: App) {
  if (app.store.get().ui.view === 'deliveries' && listLayout(app) !== renderedLayout) renderApp(app);
}

function renderDeliveries(app: App, set: SetRegion, ctx: RenderContext) {
  const { root, t, regions, derived } = app;
  const { ui } = app.store.get();
  const { slice, filtered } = derived;
  const selection = new Set(ui.selection);
  const hasResults = filtered.length > 0;
  set('status-chips', renderStatusChips(ui.filters.statuses, derived.facets, ctx));
  set('range', renderRange(slice, ctx));
  const selected = filtered.filter((delivery) => selection.has(delivery.id));
  // Priority only applies to open deliveries, so completed ones do not decide the bulk label.
  const openSelected = selected.filter((delivery) => delivery.status !== 'delivered');
  set('bulk', renderBulk({
    selected: selected.length,
    total: filtered.length,
    filtered: hasActiveFilters(ui.filters),
    allPriority: openSelected.length > 0 && openSelected.every((delivery) => delivery.priority),
  }, ctx));
  regions.get('bulk')?.toggleAttribute('hidden', !selected.length);
  app.section('deliveries')?.classList.toggle('has-selection', selected.length > 0);
  // Only the layout on screen is drawn; the other one catches up when the container query switches.
  renderedLayout = listLayout(app);
  if (renderedLayout === 'table') {
    const column = t.list.columns[ui.sort.key];
    set('caption', esc(fill(t.list.caption, { sort: fill(t.list.sortedBy, { col: column, dir: ui.sort.dir === 'asc' ? t.list.asc : t.list.desc }) })));
    set('thead', renderHead(ui.sort, pageCheckState(slice.items, selection), ctx));
    set('rows', renderRows(slice.items, selection, ctx));
  } else {
    set('cards', renderCards(slice.items, selection, ctx));
  }
  set('pagination', renderPagination(slice, ctx));
  root.querySelectorAll<HTMLInputElement>('input[data-action="select-page"]').forEach((input) => { input.indeterminate = input.dataset.state === 'mixed'; });
  root.querySelector<HTMLElement>('[data-lc-table]')?.toggleAttribute('hidden', !hasResults);
  regions.get('cards')?.toggleAttribute('hidden', !hasResults);
  regions.get('empty')?.toggleAttribute('hidden', hasResults);
  syncControls(app);
}

/** Keeps the native filter controls in step with the state when it changes from elsewhere. */
function syncControls(app: App) {
  const { root } = app;
  const { filters, sort } = app.store.get().ui;
  const query = root.querySelector<HTMLInputElement>('[data-lc-query]');
  if (query && document.activeElement !== query && query.value !== filters.query) query.value = filters.query;
  const zone = root.querySelector<HTMLSelectElement>('[data-lc-zone]');
  if (zone) zone.value = filters.zone;
  const driver = root.querySelector<HTMLSelectElement>('[data-lc-driver]');
  if (driver) driver.value = filters.driver;
  const sortSelect = root.querySelector<HTMLSelectElement>('[data-lc-sort]');
  if (sortSelect) sortSelect.value = `${sort.key}:${sort.dir}`;
  root.querySelectorAll<HTMLButtonElement>('[data-action="clear-filters"]').forEach((button) => {
    if (button.dataset.key === 'empty-clear') return;
    if (hasActiveFilters(filters)) button.removeAttribute('aria-disabled');
    else button.setAttribute('aria-disabled', 'true');
  });
}
