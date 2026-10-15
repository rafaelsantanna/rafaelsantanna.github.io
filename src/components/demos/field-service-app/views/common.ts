import type { Strings } from '../content/strings';
import type { Formatters } from '../lib/text';
import { esc, fill } from '../lib/text';
import type { AppState, EventStatus, OrderInfo, OrderStatus, OrderType, Priority } from '../lib/types';
import { icon, type IconName } from './icons';

export interface ViewContext {
  s: Strings;
  f: Formatters;
  orders: OrderInfo[];
  state: AppState;
  /** Null while rendering on the server, so time-dependent text stays neutral. */
  now: number | null;
  /** Progress of the current sync run: events confirmed since it started and the run total. */
  drain: { done: number; total: number };
}

export function findOrder(ctx: ViewContext, id: string): OrderInfo {
  const order = ctx.orders.find((item) => item.id === id);
  if (!order) throw new Error(`Unknown order ${id}`);
  return order;
}

export const typeIcons: Record<OrderType, IconName> = { install: 'install', repair: 'repair', router: 'router', move: 'move' };

const orderStatusIcons: Record<OrderStatus, IconName> = { scheduled: 'clock', 'in-progress': 'activity', done: 'check' };

export const eventStatusIcons: Record<EventStatus, IconName> = { pending: 'clock', sending: 'sync', failed: 'alert', synced: 'check' };

export function orderStatusChip(ctx: ViewContext, status: OrderStatus): string {
  return `<span class="t-chip t-chip--${status}">${icon(orderStatusIcons[status])}${esc(ctx.s.common.status[status])}</span>`;
}

export function priorityChip(ctx: ViewContext, priority: Priority): string {
  return `<span class="t-chip t-chip--priority-${priority}">${icon('flag')}<span class="t-sr">${esc(ctx.s.common.priorityPrefix)} </span>${esc(ctx.s.common.priority[priority])}</span>`;
}

export function eventStatusChip(ctx: ViewContext, status: EventStatus): string {
  return `<span class="t-chip t-chip--event-${status}">${icon(eventStatusIcons[status], status === 'sending' ? 't-spin' : '')}${esc(ctx.s.queue.status[status])}</span>`;
}

export function orderLabel(ctx: ViewContext, id: string): string {
  return fill(ctx.s.common.os, { id });
}

export function windowLabel(ctx: ViewContext, order: OrderInfo): string {
  return fill(ctx.s.common.window, { start: order.start, end: order.end });
}
