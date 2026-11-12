import type { Strings } from '../i18n';
import { timeOf, type OperationClock } from '../lib/clock';
import { fill } from '../lib/format';
import type { Delivery, Driver, Hub, Role, Status, Zone } from '../lib/model';
import type { Lookup } from '../lib/query';
import { cx, esc, icon } from './html';

/** Everything a renderer needs besides the data it draws. */
export interface RenderContext {
  t: Strings;
  lang: string;
  clock: OperationClock;
  zones: Zone[];
  hubs: Hub[];
  drivers: Driver[];
  lookup: Lookup;
  role: Role;
}

export const SUPERVISOR_HINT_ID = 'lc-supervisor-hint';

export function statusBadge(status: Status, ctx: RenderContext): string {
  return `<span class="lc-status lc-status--${status}">${icon(status, 'lc-icon lc-status__icon')}<span>${esc(ctx.t.status[status])}</span></span>`;
}

export function driverName(id: string, ctx: RenderContext): string {
  return ctx.lookup.drivers.get(id)?.name ?? id;
}

export function zoneName(id: string, ctx: RenderContext): string {
  return ctx.lookup.zones.get(id)?.name ?? id;
}

/** "Centro · S2" with the full sector name available to assistive tech. */
export function zoneCell(delivery: Delivery, ctx: RenderContext): string {
  return `${esc(zoneName(delivery.zoneId, ctx))} <span class="lc-muted" aria-hidden="true">· ${esc(fill(ctx.t.sectorShort, { n: delivery.sector }))}</span><span class="lc-sr">, ${esc(fill(ctx.t.sector, { n: delivery.sector }))}</span>`;
}

export function windowLabel(delivery: Pick<Delivery, 'windowStart' | 'windowEnd'>, clock: OperationClock): string {
  return `${timeOf(clock, delivery.windowStart)}–${timeOf(clock, delivery.windowEnd)}`;
}

/** Hours drawn by the window strip, as minutes of the day. */
const STRIP_FROM = 8 * 60 + 30;
const STRIP_TO = 19 * 60 + 30;
const STRIP_TICKS = [10, 12, 14, 16, 18];

function stripPct(clock: OperationClock, relative: number): string {
  const minute = clock.anchor + relative;
  const share = (minute - STRIP_FROM) / (STRIP_TO - STRIP_FROM);
  return `${(Math.min(1, Math.max(0, share)) * 100).toFixed(2)}%`;
}

/**
 * The delivery window on the day's axis, with the operation clock and the projected or actual arrival.
 * Decorative: the same facts are always written next to it.
 */
export function windowStrip(delivery: Delivery, clock: OperationClock, large = false): string {
  const arrival = delivery.deliveredAt ?? delivery.eta;
  const over = arrival !== null && arrival > delivery.windowEnd;
  const mark = arrival === null
    ? ''
    : `<span class="${cx('lc-wstrip__eta', delivery.deliveredAt !== null && 'is-done', over && 'is-over')}" style="--x:${stripPct(clock, arrival)}"></span>`;
  const ticks = large
    ? `<span class="lc-wstrip__ticks">${STRIP_TICKS.map((hour) => `<span style="--x:${stripPct(clock, hour * 60 - clock.anchor)}">${String(hour).padStart(2, '0')}</span>`).join('')}</span>`
    : '';
  return `<span class="${cx('lc-wstrip', `lc-wstrip--${delivery.status}`, large && 'lc-wstrip--lg')}" aria-hidden="true"><span class="lc-wstrip__track"><span class="lc-wstrip__win" style="--a:${stripPct(clock, delivery.windowStart)};--b:${stripPct(clock, delivery.windowEnd)}"></span><span class="lc-wstrip__now" style="--x:${stripPct(clock, clock.now)}"></span>${mark}</span>${ticks}</span>`;
}

/** Projected time for open deliveries, delivery time for completed ones. */
export function etaCell(delivery: Delivery, ctx: RenderContext): string {
  if (delivery.deliveredAt !== null) return `<span class="lc-muted">${esc(fill(ctx.t.list.deliveredAt, { time: timeOf(ctx.clock, delivery.deliveredAt) }))}</span>`;
  if (delivery.eta === null) return `<span class="lc-muted">${esc(ctx.t.list.noEta)}</span>`;
  const overdue = delivery.eta > delivery.windowEnd;
  return `<span class="${cx(overdue && 'lc-overdue')}">${esc(timeOf(ctx.clock, delivery.eta))}</span>`;
}

export function priorityFlag(ctx: RenderContext): string {
  return `<span class="lc-flag" title="${esc(ctx.t.list.priority)}">${icon('flag', 'lc-icon lc-flag__icon')}<span class="lc-sr">${esc(ctx.t.list.priority)}</span></span>`;
}

interface ActionButton {
  label: string;
  iconName?: string;
  attrs: string;
  variant?: 'primary' | 'ghost' | 'quiet';
  /** Explanation shown when the current role cannot run the action. */
  restricted?: string;
  className?: string;
  /** Keeps the action icon next to the lock, for layouts that can hide the label. */
  keepIcon?: boolean;
}

/** Button for a mutating action. Restricted actions stay focusable and explain why they are unavailable. */
export function actionButton(button: ActionButton): string {
  const classes = cx('lc-btn', button.variant && `lc-btn--${button.variant}`, button.restricted && 'is-restricted', button.className);
  const actionIcon = button.iconName ? icon(button.iconName) : '';
  const lead = button.restricted
    ? `${icon('lock', 'lc-icon lc-btn__lock')}${button.keepIcon && button.iconName ? icon(button.iconName, 'lc-icon lc-btn__alt') : ''}`
    : actionIcon;
  const restrictedAttrs = button.restricted ? ` aria-disabled="true" aria-describedby="${SUPERVISOR_HINT_ID}" title="${esc(button.restricted)}" data-restricted` : '';
  return `<button type="button" class="${classes}" ${button.attrs}${restrictedAttrs}>${lead}<span>${esc(button.label)}</span></button>`;
}
