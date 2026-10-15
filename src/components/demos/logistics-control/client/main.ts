/** Entry point: wires events to commands. All page state lives in the store created by createApp. */
import type { Strings } from '../i18n';
import { fill, formatNumber } from '../lib/format';
import { VIEWS, type ExceptionKind, type Role, type Status, type View } from '../lib/model';
import { SORT_KEYS, type SortDir, type SortKey } from '../lib/query';
import { driverName, zoneName } from '../render/context';
import { esc } from '../render/html';
import { attentionCounts } from '../render/map';
import { createApp, type App } from './app';
import * as commands from './commands';
import { isEditable } from './dom';
import { createPalette, type Command } from './palette';
import { renderApp, syncListLayout } from './render-app';

function paletteCommands(app: App): Command[] {
  const { t } = app;
  const role = app.store.get().ui.role;
  const nextRole: Role = role === 'operator' ? 'supervisor' : 'operator';
  const go = (view: View) => () => commands.goTo(app, view);
  return [
    { id: 'go-overview', label: t.palette.goOverview, keywords: t.palette.keywords.goOverview, iconName: 'overview', run: go('overview') },
    { id: 'go-deliveries', label: t.palette.goDeliveries, keywords: t.palette.keywords.goDeliveries, iconName: 'deliveries', run: go('deliveries') },
    { id: 'go-late', label: t.palette.goLate, keywords: t.palette.keywords.goLate, iconName: 'late', run: () => commands.showStatus(app, 'late') },
    { id: 'go-drivers', label: t.palette.goDrivers, keywords: t.palette.keywords.goDrivers, iconName: 'drivers', run: go('drivers') },
    { id: 'go-exceptions', label: t.palette.goExceptions, keywords: t.palette.keywords.goExceptions, iconName: 'exceptions', run: go('exceptions') },
    { id: 'theme', label: t.palette.toggleTheme, keywords: t.palette.keywords.toggleTheme, iconName: commands.currentTheme() === 'dark' ? 'sun' : 'moon', run: () => commands.toggleTheme(app) },
    { id: 'role', label: fill(t.palette.switchRole, { role: nextRole === 'supervisor' ? t.top.supervisor : t.top.operator }), keywords: t.palette.keywords.switchRole, iconName: 'swap', run: () => commands.setRole(app, nextRole) },
    { id: 'clear', label: t.palette.clearFilters, keywords: t.palette.keywords.clearFilters, iconName: 'clear', run: () => { commands.clearFilters(app); commands.goTo(app, 'deliveries'); } },
    { id: 'shortcuts', label: t.palette.shortcuts, keywords: t.palette.keywords.shortcuts, iconName: 'keyboard', hint: '?', run: () => app.dialogs.open('shortcuts') },
    { id: 'reset', label: t.palette.reset, keywords: t.palette.keywords.reset, iconName: 'reset', run: () => commands.resetDemo(app) },
  ];
}

function onClick(app: App, event: MouseEvent) {
  const target = event.target as Element;
  const control = target.closest<HTMLElement>('[data-action], [data-view-link]');

  // Map: pointer users click a vehicle or a route.
  const mapDriver = !control && target.closest('[data-lc-map-svg]') ? target.closest<SVGElement>('[data-driver]') : null;
  if (mapDriver?.dataset.driver) {
    commands.showDriver(app, mapDriver.dataset.driver);
    return;
  }

  // Rows and cards open the drawer when the click is not on a control.
  if (!control) {
    const row = target.closest<HTMLElement>('[data-row]');
    if (row?.dataset.row) commands.openDrawer(app, row.dataset.row, row.querySelector<HTMLElement>('[data-action="open"]'));
    return;
  }

  if (control.dataset.viewLink) {
    event.preventDefault();
    commands.goTo(app, control.dataset.viewLink as View);
    return;
  }
  if (control.hasAttribute('data-restricted')) {
    commands.explainRestriction(app);
    return;
  }
  if (control.getAttribute('aria-disabled') === 'true') return;

  const focused = document.activeElement === control;
  runAction(app, control);
  if (focused) recoverFocus(app, control);
}

/**
 * Some controls hide themselves when they act (the empty state's "Clear filters", for example).
 * When focus was on such a control and nothing else took it, it moves to the current view
 * instead of falling back to the top of the document.
 */
function recoverFocus(app: App, control: HTMLElement) {
  const current = document.activeElement;
  if (current && current !== control && current !== document.body) return;
  if (control.isConnected && control.getClientRects().length) return;
  app.activeSection()?.focus({ preventScroll: true });
}

function runAction(app: App, control: HTMLElement) {
  const { ui } = app.store.get();
  const id = control.dataset.id ?? '';
  switch (control.dataset.action) {
    case 'kpi': commands.showStatus(app, (control.dataset.status ?? '') as Status | ''); break;
    case 'driver': commands.showDriver(app, control.dataset.driver ?? ''); break;
    case 'open': commands.openDrawer(app, id, control); break;
    case 'sort': {
      const key = control.dataset.sort as SortKey;
      const dir: SortDir = ui.sort.key === key && ui.sort.dir === 'asc' ? 'desc' : 'asc';
      app.store.setUi({ sort: { key, dir }, page: 1 });
      break;
    }
    case 'page': app.store.setUi({ page: Number(control.dataset.page) }); break;
    case 'status-chip': {
      const status = control.dataset.status as Status;
      const statuses = ui.filters.statuses.includes(status) ? ui.filters.statuses.filter((item) => item !== status) : [...ui.filters.statuses, status];
      commands.setFilters(app, { statuses });
      break;
    }
    case 'clear-filters': commands.clearFilters(app); break;
    case 'queue-kind': app.store.setUi({ queueKind: (control.dataset.kind ?? '') as ExceptionKind | '' }); break;
    case 'reschedule': commands.runMutation(app, { type: 'reschedule', ids: [id] }, control); break;
    case 'resolve': commands.runMutation(app, { type: 'resolve', ids: [id] }, control); break;
    case 'contact': commands.runMutation(app, { type: 'contact', ids: [id] }, control); break;
    case 'priority': commands.runMutation(app, { type: 'priority', ids: [id], value: control.dataset.value === 'on' }, control); break;
    case 'issue-dialog': commands.openIssueDialog(app, id, control); break;
    case 'issue': commands.pickIssue(app, control.dataset.issue ?? '', control); break;
    case 'reassign-dialog': commands.openReassignDialog(app, [id], control); break;
    case 'reassign': commands.pickDriver(app, control.dataset.driver ?? '', control); break;
    case 'bulk-reassign': commands.openReassignDialog(app, ui.selection, control); break;
    case 'bulk-priority': commands.runMutation(app, { type: 'priority', ids: ui.selection, value: control.dataset.value === 'on' }, control); break;
    case 'bulk-export': commands.exportCsv(app); break;
    case 'bulk-clear': app.store.setUi({ selection: [] }); break;
    case 'bulk-select-all': app.store.setUi({ selection: app.derived.filtered.map((delivery) => delivery.id) }); break;
    case 'role': commands.setRole(app, control.dataset.role === 'supervisor' ? 'supervisor' : 'operator'); break;
    case 'theme': commands.toggleTheme(app); break;
    case 'shortcuts': commands.setMenu(app, false); app.dialogs.open('shortcuts', { opener: control }); break;
    case 'palette': openPalette(app, control); break;
    case 'menu': commands.setMenu(app, !commands.menuOpen(app)); break;
    case 'sim-note': commands.setSimNote(app, !commands.simNoteOpen(app)); break;
    case 'reset': commands.resetDemo(app); break;
    case 'motion':
      app.motionPaused = !app.motionPaused;
      app.motion.setPaused(app.motionPaused);
      app.syncMotionButton();
      break;
    case 'single-keys': commands.toggleSingleKeys(app); break;
    case 'close-dialog': {
      const dialog = control.closest('dialog');
      if (dialog) app.dialogs.close(dialog);
      break;
    }
    default: break;
  }
}

function onChange(app: App, event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const { ui } = app.store.get();
  if (target.matches('input[data-action="select"]')) {
    const id = target.dataset.id ?? '';
    const selection = (target as HTMLInputElement).checked ? [...new Set([...ui.selection, id])] : ui.selection.filter((item) => item !== id);
    app.store.setUi({ selection });
  } else if (target.matches('input[data-action="select-page"]')) {
    const ids = app.derived.slice.items.map((delivery) => delivery.id);
    const allSelected = ids.every((id) => ui.selection.includes(id));
    app.store.setUi({ selection: allSelected ? ui.selection.filter((id) => !ids.includes(id)) : [...new Set([...ui.selection, ...ids])] });
  } else if (target.matches('[data-lc-zone]')) {
    commands.setFilters(app, { zone: target.value });
  } else if (target.matches('[data-lc-driver]')) {
    commands.setFilters(app, { driver: target.value });
  } else if (target.matches('[data-lc-sort]')) {
    const [key, dir] = target.value.split(':');
    if (SORT_KEYS.includes(key as SortKey)) app.store.setUi({ sort: { key: key as SortKey, dir: dir === 'desc' ? 'desc' : 'asc' }, page: 1 });
  }
}

let palette: ReturnType<typeof createPalette> | null = null;

function openPalette(app: App, opener?: HTMLElement | null) {
  if (!palette || app.dialogs.isOpen('palette')) return;
  commands.setMenu(app, false);
  palette.reset();
  app.dialogs.open('palette', { opener, initialFocus: () => app.root.querySelector<HTMLElement>('[data-lc-palette-input]') });
}

function onKeydown(app: App, event: KeyboardEvent) {
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (app.dialogs.isOpen('palette')) app.dialogs.closeByName('palette');
    else if (!app.dialogs.anyOpen()) openPalette(app);
    return;
  }
  if (event.key === 'Escape' && commands.simNoteOpen(app) && !app.dialogs.anyOpen()) {
    commands.setSimNote(app, false);
    app.root.querySelector<HTMLElement>('[data-action="sim-note"]')?.focus();
    return;
  }
  if (event.key === 'Escape' && commands.menuOpen(app) && !app.dialogs.anyOpen()) {
    commands.setMenu(app, false);
    app.root.querySelector<HTMLElement>('[data-action="menu"]')?.focus();
    return;
  }
  if (isEditable(event.target)) return;
  if (mod && !event.shiftKey && event.key.toLowerCase() === 'z' && app.lastUndo && !app.dialogs.anyOpen()) {
    event.preventDefault();
    app.toasts.dismiss();
    app.lastUndo();
    return;
  }
  if (mod || event.altKey || app.dialogs.anyOpen() || !commands.singleKeysEnabled()) return;
  if (event.key === '?') {
    event.preventDefault();
    app.dialogs.open('shortcuts');
  } else if (event.key === '/') {
    event.preventDefault();
    commands.goTo(app, 'deliveries', false);
    app.root.querySelector<HTMLInputElement>('[data-lc-query]')?.focus();
  } else if (['1', '2', '3', '4'].includes(event.key)) {
    commands.goTo(app, VIEWS[Number(event.key) - 1]);
  }
}

/** Tooltip and route highlight while a pointer is over the map. */
function wireMapHover(app: App) {
  const map = app.root.querySelector<HTMLElement>('[data-lc-map]');
  const tip = app.root.querySelector<HTMLElement>('[data-lc-tip]');
  const svg = app.root.querySelector<SVGSVGElement>('[data-lc-map-svg]');
  if (!map || !tip || !svg) return;
  let hovered = '';
  const highlight = (driverId: string) => {
    if (hovered === driverId) return;
    hovered = driverId;
    svg.querySelectorAll('.is-hover').forEach((element) => element.classList.remove('is-hover'));
    if (driverId) svg.querySelectorAll(`[data-driver="${driverId}"]`).forEach((element) => element.classList.add('is-hover'));
  };
  svg.addEventListener('pointermove', (event) => {
    const element = (event.target as Element).closest<SVGElement>('[data-driver]');
    const driverId = element?.dataset.driver ?? '';
    highlight(driverId);
    if (!driverId) {
      tip.hidden = true;
      return;
    }
    const ctx = app.context();
    const stats = app.derived.stats.get(driverId);
    const driver = app.lookup.drivers.get(driverId);
    const attention = attentionCounts(stats, ctx);
    tip.innerHTML = `<strong>${esc(driverName(driverId, ctx))}</strong><span>${esc(driver ? `${app.t.vehicles[driver.vehicle]} · ${zoneName(driver.zoneId, ctx)}` : '')}</span><span>${esc(fill(app.t.map.open, { n: formatNumber(app.t.lang, stats?.open ?? 0) }))}</span>${attention.length ? `<span class="lc-map__tip-alert">${esc(attention.join(' · '))}</span>` : ''}`;
    tip.hidden = false;
    const box = map.getBoundingClientRect();
    const x = Math.min(event.clientX - box.left + 14, box.width - tip.offsetWidth - 8) + map.scrollLeft;
    const y = Math.max(8, event.clientY - box.top - tip.offsetHeight - 12);
    tip.style.transform = `translate(${Math.max(8, x)}px, ${y}px)`;
  });
  svg.addEventListener('pointerleave', () => {
    highlight('');
    tip.hidden = true;
  });
  // When the map pans (narrow screens), start centred on the city.
  map.scrollLeft = (map.scrollWidth - map.clientWidth) / 2;
}

function wireSearch(app: App) {
  const input = app.root.querySelector<HTMLInputElement>('[data-lc-query]');
  if (!input) return;
  let timer = 0;
  const apply = () => {
    window.clearTimeout(timer);
    if (input.value !== app.store.get().ui.filters.query) commands.setFilters(app, { query: input.value });
  };
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(apply, 220);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') apply();
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      input.value = '';
      apply();
    }
  });
}

export function boot() {
  const root = document.querySelector<HTMLElement>('[data-lc-root]');
  const config = root?.querySelector('[data-lc-config]');
  if (!root || !config) return;
  const { strings } = JSON.parse(config.textContent ?? '{}') as { strings: Strings };
  const app = createApp(root, strings);

  palette = createPalette(
    root.querySelector<HTMLInputElement>('[data-lc-palette-input]')!,
    root.querySelector<HTMLElement>('[data-region="palette-list"]')!,
    root.querySelector<HTMLElement>('[data-lc-palette-live]')!,
    strings,
    {
      commands: () => paletteCommands(app),
      deliveries: () => app.store.get().deliveries,
      describe: (delivery) => `${strings.status[delivery.status]} · ${zoneName(delivery.zoneId, app.context())}`,
      openDelivery: (id) => commands.openDrawer(app, id, app.activeSection()),
      close: () => app.dialogs.closeByName('palette', false),
    },
  );

  app.store.subscribe((_, kind) => {
    if (kind === 'data') app.persist();
    renderApp(app);
  });

  root.addEventListener('click', (event) => onClick(app, event));
  root.addEventListener('change', (event) => onChange(app, event));
  document.addEventListener('keydown', (event) => onKeydown(app, event));
  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (commands.menuOpen(app) && !target.closest('.lc-side')) commands.setMenu(app, false);
    if (commands.simNoteOpen(app) && !target.closest('.lc-sim')) commands.setSimNote(app, false);
  });
  wireMapHover(app);
  wireSearch(app);

  const platform = (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform ?? navigator.userAgent;
  if (/mac|iphone|ipad/i.test(platform)) {
    root.querySelectorAll('[data-lc-mod]').forEach((element) => { element.textContent = '⌘ K'; });
    root.querySelectorAll('[data-lc-undo]').forEach((element) => { element.textContent = '⌘ Z'; });
  }
  commands.syncThemeButton(app);
  commands.syncSingleKeys(app);
  app.syncMotionButton();
  renderApp(app);
  // Resizing can switch the deliveries list between the table and the cards.
  const main = root.querySelector('.lc-main');
  if (main) new ResizeObserver(() => syncListLayout(app)).observe(main);
  window.setInterval(() => {
    if (app.tickClock()) renderApp(app);
  }, 15000);
}
