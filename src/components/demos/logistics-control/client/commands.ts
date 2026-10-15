/** User-level operations. Each one changes the store (or a preference) and gives feedback. */
import { canRun, type Mutation, type MutationResult } from '../lib/actions';
import { timeOf } from '../lib/clock';
import { toCsv } from '../lib/csv';
import { fill, formatNumber, plural } from '../lib/format';
import { ISSUE_TYPES, type Role, type Status, type View } from '../lib/model';
import { EMPTY_FILTERS, filterDeliveries, type Filters } from '../lib/query';
import { DEFAULT_UI } from '../lib/store';
import { driverName, windowLabel, zoneName } from '../render/context';
import { renderDrawer } from '../render/drawer';
import { esc } from '../render/html';
import { renderDriverPicker, renderIssuePicker } from '../render/pickers';
import type { App } from './app';
import { byKey } from './dom';
import { read, remove, STORAGE_KEYS, write } from './persist';

export function announce(app: App, message: string) {
  const region = app.root.querySelector('[data-lc-announcer]');
  if (!region) return;
  region.textContent = '';
  window.setTimeout(() => { region.textContent = message; }, 60);
}

let resultsTimer = 0;
function announceResults(app: App) {
  window.clearTimeout(resultsTimer);
  resultsTimer = window.setTimeout(() => {
    const live = app.root.querySelector('[data-lc-results-live]');
    if (live) live.textContent = plural(app.t.lang, app.derived.filtered.length, app.t.list.found);
  }, 450);
}

export function goTo(app: App, view: View, moveFocus = true) {
  app.store.setUi({ view });
  window.history.replaceState(null, '', `#lc-${view}`);
  setMenu(app, false);
  if (!moveFocus) return;
  const section = app.section(view);
  section?.focus({ preventScroll: true });
  const top = app.root.getBoundingClientRect().top + window.scrollY;
  if (window.scrollY > top) window.scrollTo({ top });
}

/** Changes filters, returns to page 1 and drops selected rows that no longer match. */
export function setFilters(app: App, patch: Partial<Filters>) {
  const { deliveries, ui } = app.store.get();
  const filters = { ...ui.filters, ...patch };
  const visible = new Set(filterDeliveries(deliveries, filters, app.lookup).map((delivery) => delivery.id));
  app.store.setUi({ filters, page: 1, selection: ui.selection.filter((id) => visible.has(id)) });
  announceResults(app);
}

export function showStatus(app: App, status: Status | '') {
  setFilters(app, { ...EMPTY_FILTERS, statuses: status ? [status] : [] });
  goTo(app, 'deliveries');
}

export function showDriver(app: App, driverId: string) {
  setFilters(app, { ...EMPTY_FILTERS, driver: driverId });
  goTo(app, 'deliveries');
  announce(app, fill(app.t.toast.driverFilter, { driver: driverName(driverId, app.context()) }));
}

export function clearFilters(app: App) {
  setFilters(app, EMPTY_FILTERS);
  announce(app, app.t.toast.filtersCleared);
}

export function explainRestriction(app: App) {
  app.toasts.show({ message: app.t.permissions.supervisorOnly, tone: 'warning' });
}

function refocus(app: App, key: string | undefined) {
  (byKey(app.root, key) ?? app.activeSection())?.focus({ preventScroll: true });
}

/** Bulk actions that leave completed deliveries untouched and say how many were left out. */
const SKIPS_DELIVERED: Mutation['type'][] = ['reassign', 'priority'];

function message(app: App, mutation: Mutation, result: MutationResult, delivered: number): string {
  const { t, clock } = app;
  const ctx = app.context();
  const first = result.after[0];
  const skipped = delivered ? ` ${plural(t.lang, delivered, t.toast.skipped)}` : '';
  switch (mutation.type) {
    case 'reassign': return `${plural(t.lang, result.after.length, t.toast.reassigned, { driver: driverName(mutation.driverId, ctx) })}${skipped}`;
    case 'priority': return `${plural(t.lang, result.after.length, mutation.value ? t.toast.prioritized : t.toast.unprioritized)}${skipped}`;
    case 'issue': return fill(t.toast.issue, { id: first.id });
    case 'resolve': return fill(first.status === 'awaiting' ? t.toast.resolvedAwaiting : t.toast.resolved, { id: first.id, time: timeOf(clock, first.eta ?? 0) });
    case 'reschedule': return fill(t.toast.rescheduled, { id: first.id, window: windowLabel(first, clock) });
    default: return fill(t.toast.contacted, { id: first.id });
  }
}

/** Applies a change optimistically and offers an undo that restores the exact previous records. */
export function runMutation(app: App, mutation: Mutation, trigger?: HTMLElement | null) {
  const { ui, deliveries } = app.store.get();
  if (!canRun(ui.role, mutation.type)) {
    explainRestriction(app);
    return;
  }
  const triggerKey = trigger?.closest<HTMLElement>('[data-key]')?.dataset.key;
  const ids = new Set(mutation.ids);
  const delivered = SKIPS_DELIVERED.includes(mutation.type) ? deliveries.filter((delivery) => ids.has(delivery.id) && delivery.status === 'delivered').length : 0;
  const result = app.store.commit(mutation, { now: app.clock.now, role: ui.role });
  if (!result.after.length) {
    if (delivered) app.toasts.show({ message: mutation.type === 'reassign' ? app.t.toast.nothingToReassign : app.t.toast.nothingToPrioritize, tone: 'info' });
    return;
  }
  const undo = () => {
    result.undo();
    app.lastUndo = null;
    app.toasts.show({ message: app.t.toast.undone, tone: 'info' });
    refocus(app, triggerKey);
  };
  app.lastUndo = undo;
  app.toasts.show({ message: message(app, mutation, result, delivered), undo });
}

export function openDrawer(app: App, id: string, opener?: HTMLElement | null) {
  const delivery = app.store.get().deliveries.find((item) => item.id === id);
  if (!delivery) return;
  app.drawerId = id;
  app.regions.forget('drawer');
  app.regions.set('drawer', renderDrawer(delivery, app.context()));
  app.dialogs.open('drawer', {
    opener,
    initialFocus: () => app.root.querySelector<HTMLElement>('#lc-drawer-title'),
    onClose: () => {
      app.drawerId = null;
      app.toasts.relocate();
    },
  });
}

let issueTarget = '';
export function openIssueDialog(app: App, id: string, opener: HTMLElement) {
  issueTarget = id;
  const lead = app.regions.get('issue-lead');
  if (lead) lead.textContent = fill(app.t.issueDialog.lead, { id });
  app.regions.set('issue-list', renderIssuePicker(app.context()));
  app.dialogs.open('issue', { opener, onClose: () => app.toasts.relocate() });
}

export function pickIssue(app: App, issue: string, trigger: HTMLElement) {
  const type = ISSUE_TYPES.find((candidate) => candidate === issue);
  if (!type) return;
  app.dialogs.closeByName('issue');
  runMutation(app, { type: 'issue', ids: [issueTarget], issue: type }, trigger);
}

let reassignTargets: string[] = [];
export function openReassignDialog(app: App, ids: string[], opener: HTMLElement) {
  if (!canRun(app.store.get().ui.role, 'reassign')) {
    explainRestriction(app);
    return;
  }
  reassignTargets = ids;
  const { deliveries } = app.store.get();
  const set = new Set(ids);
  const current = new Set(deliveries.filter((delivery) => set.has(delivery.id)).map((delivery) => delivery.driverId));
  app.regions.set('reassign-title', esc(plural(app.t.lang, ids.length, app.t.reassignDialog.title)));
  app.regions.set('reassign-list', renderDriverPicker(app.derived.stats, current, app.context()));
  app.dialogs.open('reassign', {
    opener,
    initialFocus: () => app.root.querySelector<HTMLElement>('[data-dialog="reassign"] .lc-pick:not([aria-disabled])'),
    onClose: () => app.toasts.relocate(),
  });
}

export function pickDriver(app: App, driverId: string, trigger: HTMLElement) {
  app.dialogs.closeByName('reassign');
  runMutation(app, { type: 'reassign', ids: reassignTargets, driverId }, trigger);
}

export function exportCsv(app: App) {
  const { t, clock } = app;
  const ctx = app.context();
  const selection = new Set(app.store.get().ui.selection);
  const rows = app.derived.filtered.filter((delivery) => selection.has(delivery.id));
  if (!rows.length) return;
  const data = rows.map((d) => [
    d.id, d.customer, zoneName(d.zoneId, ctx), d.sector, driverName(d.driverId, ctx), t.status[d.status],
    timeOf(clock, d.windowStart), timeOf(clock, d.windowEnd),
    d.eta !== null && d.status !== 'delivered' ? timeOf(clock, d.eta) : '',
    d.deliveredAt !== null ? timeOf(clock, d.deliveredAt) : '',
    d.volumes, formatNumber(t.lang, d.weightKg, 1), d.priority ? t.csv.yes : t.csv.no, d.attempts,
  ]);
  const blob = new Blob([toCsv([t.csv.headers, ...data], t.csv.separator)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date();
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  link.href = url;
  link.download = `${t.csv.filename}-${stamp}.csv`;
  link.hidden = true;
  app.root.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  app.toasts.show({ message: plural(t.lang, rows.length, t.toast.exported), tone: 'info' });
}

export function setRole(app: App, role: Role) {
  if (app.store.get().ui.role === role) return;
  app.store.setUi({ role });
  write(STORAGE_KEYS.role, role);
  app.toasts.show({ message: fill(app.t.toast.role, { role: role === 'supervisor' ? app.t.top.supervisor : app.t.top.operator }), tone: 'info' });
}

export function currentTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-lc-theme') === 'dark' ? 'dark' : 'light';
}

export function syncThemeButton(app: App) {
  const dark = currentTheme() === 'dark';
  app.root.querySelectorAll<HTMLButtonElement>('[data-action="theme"]').forEach((button) => {
    button.setAttribute('aria-label', (dark ? button.dataset.labelLight : button.dataset.labelDark) ?? '');
  });
}

export function toggleTheme(app: App) {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-lc-theme', next);
  write(STORAGE_KEYS.theme, next);
  syncThemeButton(app);
  announce(app, next === 'dark' ? app.t.toast.themeDark : app.t.toast.themeLight);
}

export function singleKeysEnabled(): boolean {
  return read(STORAGE_KEYS.singleKeys) !== 'off';
}

export function syncSingleKeys(app: App) {
  const enabled = singleKeysEnabled();
  const toggle = app.root.querySelector<HTMLButtonElement>('[data-action="single-keys"]');
  if (!toggle) return;
  toggle.setAttribute('aria-checked', String(enabled));
  const text = toggle.querySelector('[data-switch-text]');
  if (text) text.textContent = (enabled ? toggle.dataset.labelOn : toggle.dataset.labelOff) ?? '';
}

export function toggleSingleKeys(app: App) {
  const enabled = !singleKeysEnabled();
  write(STORAGE_KEYS.singleKeys, enabled ? 'on' : 'off');
  syncSingleKeys(app);
  announce(app, enabled ? app.t.toast.keysOn : app.t.toast.keysOff);
}

/** Back to the generated day and the Operator role. The previous state can be restored once. */
export function resetDemo(app: App) {
  const snapshot = app.store.get();
  app.store.replace({ deliveries: app.base, ui: { ...DEFAULT_UI, view: snapshot.ui.view } });
  remove(STORAGE_KEYS.changes);
  remove(STORAGE_KEYS.role);
  const undo = () => {
    app.store.replace(snapshot);
    write(STORAGE_KEYS.role, snapshot.ui.role);
    app.lastUndo = null;
    app.toasts.show({ message: app.t.toast.undone, tone: 'info' });
  };
  app.lastUndo = undo;
  app.toasts.show({ message: app.t.toast.reset, undo });
}

export function setMenu(app: App, open: boolean) {
  const side = app.root.querySelector<HTMLElement>('.lc-side');
  const toggle = app.root.querySelector<HTMLButtonElement>('[data-action="menu"]');
  if (!side || !toggle) return;
  side.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '');
}

export function menuOpen(app: App): boolean {
  return app.root.querySelector('.lc-side')?.classList.contains('is-open') ?? false;
}

/** Shows or hides the note that explains the simulated clock. */
export function setSimNote(app: App, open: boolean) {
  const toggle = app.root.querySelector<HTMLButtonElement>('[data-action="sim-note"]');
  const note = app.root.querySelector<HTMLElement>('[data-lc-sim-note]');
  if (!toggle || !note) return;
  toggle.setAttribute('aria-expanded', String(open));
  note.hidden = !open;
}

export function simNoteOpen(app: App): boolean {
  return app.root.querySelector('[data-action="sim-note"]')?.getAttribute('aria-expanded') === 'true';
}
