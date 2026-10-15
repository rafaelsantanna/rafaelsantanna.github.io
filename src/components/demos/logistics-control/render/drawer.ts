import { canReportIssue, canRun } from '../lib/actions';
import { timeOf } from '../lib/clock';
import { fill, formatNumber } from '../lib/format';
import type { Delivery, LogEntry } from '../lib/model';
import { actionButton, driverName, statusBadge, windowLabel, zoneName, type RenderContext } from './context';
import { cx, esc, icon } from './html';

const EVENT_ICONS: Record<LogEntry['kind'], string> = {
  created: 'deliveries', pickedUp: 'hub', attemptFailed: 'clear', delivered: 'delivered', windowClosed: 'late',
  issue: 'issue', reassigned: 'swap', prioritized: 'flag', unprioritized: 'flag', resolved: 'check', rescheduled: 'calendar', contacted: 'phone',
};

function eventText(entry: LogEntry, delivery: Delivery, ctx: RenderContext): string {
  const { t, clock } = ctx;
  switch (entry.kind) {
    case 'created': return t.events.created;
    case 'pickedUp': return fill(t.events.pickedUp, { hub: entry.hub ? t.hubs[entry.hub] : '' });
    case 'attemptFailed': return t.events.attemptFailed;
    case 'delivered': return entry.at > delivery.windowEnd ? t.events.deliveredLate : t.events.delivered;
    case 'windowClosed': return t.events.windowClosed;
    case 'issue': return fill(t.events.issue, { type: entry.issue ? t.exceptionKind[entry.issue] : '' });
    case 'reassigned': return fill(t.events.reassigned, { from: driverName(entry.from ?? '', ctx), to: driverName(entry.to ?? '', ctx) });
    case 'prioritized': return t.events.prioritized;
    case 'unprioritized': return t.events.unprioritized;
    case 'resolved': return fill(t.events.resolved, { time: timeOf(clock, entry.eta ?? 0) });
    case 'rescheduled': return fill(t.events.rescheduled, { window: windowLabel({ windowStart: entry.windowStart ?? 0, windowEnd: entry.windowEnd ?? 0 }, clock) });
    default: return t.events.contacted;
  }
}

interface TimelineItem { at: number; text: string; iconName: string; tone: string; by?: string; upcoming: boolean }

function timeline(delivery: Delivery, ctx: RenderContext): TimelineItem[] {
  const { t } = ctx;
  const roleName = (entry: LogEntry) => (entry.role ? fill(t.events.by, { role: entry.role === 'supervisor' ? t.top.supervisor : t.top.operator }) : undefined);
  const items: TimelineItem[] = delivery.log.map((entry) => ({
    at: entry.at,
    text: eventText(entry, delivery, ctx),
    iconName: EVENT_ICONS[entry.kind],
    tone: entry.kind === 'issue' || entry.kind === 'attemptFailed' ? 'issue' : entry.kind === 'windowClosed' ? 'late' : entry.kind === 'delivered' ? 'delivered' : entry.role ? 'action' : 'neutral',
    by: roleName(entry),
    upcoming: false,
  }));
  if (delivery.status === 'awaiting') items.push({ at: delivery.windowStart, text: t.events.windowOpens, iconName: 'calendar', tone: 'neutral', upcoming: true });
  if (delivery.eta !== null && delivery.status !== 'delivered') items.push({ at: delivery.eta, text: t.events.eta, iconName: 'pin', tone: 'neutral', upcoming: true });
  return items.sort((a, b) => a.at - b.at);
}

function fact(term: string, value: string): string {
  return `<div class="lc-fact"><dt>${esc(term)}</dt><dd>${value}</dd></div>`;
}

export function renderDrawer(delivery: Delivery, ctx: RenderContext): string {
  const { t, clock, lang } = ctx;
  const driver = ctx.lookup.drivers.get(delivery.driverId);
  const open = delivery.status !== 'delivered';
  const restrictedReassign = !canRun(ctx.role, 'reassign');
  const restrictedPriority = !canRun(ctx.role, 'priority');
  const facts = [
    fact(t.drawer.zone, `${esc(zoneName(delivery.zoneId, ctx))} · ${esc(fill(t.sector, { n: delivery.sector }))}`),
    fact(t.drawer.hub, esc(driver ? t.hubs[driver.hubId] : '')),
    fact(t.drawer.driver, driver ? `<span class="lc-inline-driver"><span class="lc-avatar" aria-hidden="true">${esc(driver.initials)}</span>${esc(driver.name)} <span class="lc-muted">· ${esc(t.vehicles[driver.vehicle])}</span></span>` : ''),
    fact(t.drawer.window, esc(windowLabel(delivery, clock))),
    delivery.deliveredAt !== null
      ? fact(t.drawer.deliveredAt, esc(timeOf(clock, delivery.deliveredAt)))
      : fact(t.drawer.eta, delivery.eta !== null ? `<span class="${cx(delivery.eta > delivery.windowEnd && 'lc-overdue')}">${esc(timeOf(clock, delivery.eta))}</span>` : `<span class="lc-muted">${esc(t.list.noEta)}</span>`),
    fact(t.drawer.volumes, esc(fill(t.drawer.volumesValue, { n: formatNumber(lang, delivery.volumes), kg: formatNumber(lang, delivery.weightKg, 1) }))),
    fact(t.drawer.attempts, esc(fill(t.drawer.attemptsValue, { n: delivery.attempts }))),
    fact(t.drawer.priority, delivery.priority ? `<span class="lc-flag-text">${icon('flag')}${esc(t.drawer.yes)}</span>` : esc(t.drawer.no)),
  ].join('');

  const id = delivery.id;
  const actions: string[] = [];
  if (delivery.status === 'issue') actions.push(actionButton({ label: t.drawer.resolve, iconName: 'check', variant: 'primary', attrs: `data-action="resolve" data-id="${id}" data-key="dr-resolve"` }));
  if (delivery.status === 'late' || delivery.status === 'issue') actions.push(actionButton({ label: t.drawer.reschedule, iconName: 'calendar', variant: delivery.status === 'late' ? 'primary' : undefined, attrs: `data-action="reschedule" data-id="${id}" data-key="dr-reschedule"` }));
  if (canReportIssue(delivery.status)) actions.push(actionButton({ label: t.drawer.registerIssue, iconName: 'issue', attrs: `data-action="issue-dialog" data-id="${id}" data-key="dr-issue"` }));
  if (open) {
    actions.push(actionButton({ label: t.drawer.reassign, iconName: 'swap', restricted: restrictedReassign ? t.permissions.supervisorOnly : undefined, attrs: `data-action="reassign-dialog" data-id="${id}" data-key="dr-reassign"` }));
    actions.push(actionButton({ label: delivery.priority ? t.drawer.unprioritize : t.drawer.prioritize, iconName: 'flag', restricted: restrictedPriority ? t.permissions.supervisorOnly : undefined, attrs: `data-action="priority" data-value="${delivery.priority ? 'off' : 'on'}" data-id="${id}" data-key="dr-priority"` }));
  }
  actions.push(actionButton({ label: t.drawer.contact, iconName: 'phone', variant: 'ghost', attrs: `data-action="contact" data-id="${id}" data-key="dr-contact" aria-describedby="lc-contact-note"` }));

  const notes = [
    open ? '' : `<p class="lc-drawer__note">${esc(t.drawer.closedNote)}</p>`,
    open && (restrictedReassign || restrictedPriority) ? `<p class="lc-drawer__note">${icon('lock')}<span>${esc(t.permissions.operatorNote)}</span></p>` : '',
    `<p class="lc-drawer__note" id="lc-contact-note">${esc(t.drawer.contactNote)}</p>`,
  ].join('');

  const events = timeline(delivery, ctx)
    .map((item) => `<li class="${cx('lc-event', `lc-event--${item.tone}`, item.upcoming && 'is-upcoming')}"><span class="lc-event__dot">${icon(item.iconName)}</span><div class="lc-event__body"><p class="lc-event__text">${esc(item.text)}</p><p class="lc-event__meta"><time>${esc(timeOf(clock, item.at))}</time>${item.upcoming ? ` · ${esc(t.drawer.upcoming)}` : ''}${item.by ? ` · ${esc(item.by)}` : ''}</p></div></li>`)
    .join('');

  return `<header class="lc-drawer__head">
      <div class="lc-drawer__title"><h2 class="lc-drawer__id" id="lc-drawer-title" tabindex="-1">${esc(id)}</h2>${statusBadge(delivery.status, ctx)}</div>
      <p class="lc-drawer__customer">${esc(delivery.customer)}</p>
      <button type="button" class="lc-iconbtn lc-drawer__close" data-action="close-dialog" aria-label="${esc(t.drawer.close)}">${icon('close')}</button>
    </header>
    <div class="lc-drawer__body">
      <section aria-labelledby="lc-drawer-summary"><h3 class="lc-drawer__section" id="lc-drawer-summary">${esc(t.drawer.summary)}</h3><dl class="lc-facts">${facts}</dl></section>
      <section aria-labelledby="lc-drawer-actions"><h3 class="lc-drawer__section" id="lc-drawer-actions">${esc(t.drawer.actions)}</h3><div class="lc-drawer__actions">${actions.join('')}</div>${notes}</section>
      <section aria-labelledby="lc-drawer-timeline"><h3 class="lc-drawer__section" id="lc-drawer-timeline">${esc(t.drawer.timeline)}</h3><ol class="lc-timeline">${events}</ol></section>
    </div>`;
}
