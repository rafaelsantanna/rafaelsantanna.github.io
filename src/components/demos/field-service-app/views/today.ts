import { unsyncedCount, unsyncedForOrder } from '../lib/queue';
import { esc, fill, plural } from '../lib/text';
import type { OrderInfo, OrderStatus } from '../lib/types';
import { orderLabel, orderStatusChip, priorityChip, typeIcons, windowLabel, type ViewContext } from './common';
import { icon } from './icons';

function greeting(ctx: ViewContext): string {
  const name = ctx.s.technician.firstName;
  if (ctx.now === null) return fill(ctx.s.today.greeting, { name });
  const hour = new Date(ctx.now).getHours();
  const template = hour >= 5 && hour < 12 ? ctx.s.today.greetingMorning : hour >= 12 && hour < 18 ? ctx.s.today.greetingAfternoon : ctx.s.today.greetingEvening;
  return fill(template, { name });
}

/**
 * Inner content of the sync pill in the Today header; patched in place as the queue moves.
 * The accessible name starts with the visible status and ends with what the pill does.
 */
export function pillContent(ctx: ViewContext): { html: string; tone: string } {
  const events = ctx.state.events;
  const pending = unsyncedCount(events);
  const action = `<span class="t-sr">, ${esc(ctx.s.common.pill.action)}</span>`;
  if (!ctx.state.online) {
    const count = pending ? `<span class="t-pill__count" aria-hidden="true">${pending}</span><span class="t-sr">, ${esc(plural(ctx.s.common.pill.pending, pending))}</span>` : '';
    return { html: `${icon('cloudOff')}<span>${esc(ctx.s.common.pill.offline)}</span>${count}${action}`, tone: 'offline' };
  }
  if (events.some((event) => event.status === 'sending')) {
    return { html: `${icon('sync', 't-spin')}<span>${esc(ctx.s.common.pill.sending)}</span>${action}`, tone: 'sending' };
  }
  if (pending) return { html: `${icon('clock')}<span>${esc(plural(ctx.s.common.pill.pending, pending))}</span>${action}`, tone: 'pending' };
  return { html: `${icon('cloudCheck')}<span>${esc(ctx.s.common.pill.synced)}</span>${action}`, tone: 'synced' };
}

export function orderPendingText(ctx: ViewContext, orderId: string): string {
  const count = unsyncedForOrder(ctx.state.events, orderId);
  return count ? plural(ctx.s.today.pendingOrder, count) : '';
}

function summary(ctx: ViewContext): string {
  const statuses = ctx.orders.map((order) => ctx.state.orders[order.id].status);
  const count = (status: OrderStatus) => statuses.filter((value) => value === status).length;
  const done = count('done');
  const segments = statuses.map((status) => `<span class="t-summary__seg t-summary__seg--${status}"></span>`).join('');
  const legend = (['done', 'in-progress', 'scheduled'] as const)
    .map((status) => `<li><span class="t-summary__key t-summary__key--${status}" aria-hidden="true"></span>${esc(ctx.s.today.summaryLegend[status])} <b>${count(status)}</b></li>`)
    .join('');
  const active = ctx.orders.find((order) => ctx.state.orders[order.id].status === 'in-progress');
  const upcoming = ctx.orders.find((order) => ctx.state.orders[order.id].status === 'scheduled');
  const nextText = active
    ? fill(ctx.s.today.nextInProgress, { customer: active.customer, place: active.neighborhood })
    : upcoming
      ? fill(ctx.s.today.next, { time: upcoming.start, customer: upcoming.customer, place: upcoming.neighborhood })
      : ctx.s.today.allDone;
  return `<div class="t-summary">
    <p class="t-summary__count"><span class="t-summary__big">${esc(fill(ctx.s.today.summaryCount, { done, total: statuses.length }))}</span> <span class="t-summary__label">${esc(ctx.s.today.summaryLabel)}</span></p>
    <div class="t-summary__bar" aria-hidden="true">${segments}</div>
    <ul class="t-summary__legend">${legend}</ul>
    <p class="t-summary__next">${icon(active ? 'activity' : upcoming ? 'pin' : 'check')}<span>${esc(nextText)}</span></p>
  </div>`;
}

function orderCard(ctx: ViewContext, order: OrderInfo): string {
  const status = ctx.state.orders[order.id].status;
  const pending = orderPendingText(ctx, order.id);
  return `<li><button type="button" class="t-order t-order--${status}" data-action="open-order" data-order="${order.id}" data-key="order-${order.id}">
    <span class="t-order__time" aria-hidden="true"><span class="t-order__start">${order.start}</span><span class="t-order__end">${order.end}</span></span>
    <span class="t-order__body">
      <span class="t-sr">${esc(windowLabel(ctx, order))}, </span>
      <span class="t-order__type">${icon(typeIcons[order.type])}${esc(ctx.s.common.types[order.type])}</span>
      <span class="t-order__customer">${esc(order.customer)}</span>
      <span class="t-order__place">${esc(order.neighborhood)} · ${esc(orderLabel(ctx, order.id))}</span>
      <span class="t-order__chips">${orderStatusChip(ctx, status)}${priorityChip(ctx, order.priority)}</span>
      <span class="t-order__pending" data-order-pending="${order.id}"${pending ? '' : ' hidden'}>${icon('queue')}<span data-order-pending-text>${esc(pending)}</span></span>
    </span>
    <span class="t-order__chev">${icon('chevronRight')}</span>
  </button></li>`;
}

function header(ctx: ViewContext): string {
  const pill = pillContent(ctx);
  const day = ctx.now === null ? '' : ctx.f.day(ctx.now);
  const overline = day ? day.charAt(0).toLocaleUpperCase(ctx.s.intl) + day.slice(1) : ctx.s.today.dayLabel;
  return `<header class="t-head t-head--today">
    <div class="t-head__top">
      <p class="t-overline">${esc(overline)}</p>
      <button type="button" class="t-pill t-pill--${pill.tone}" data-action="tab" data-tab="queue" data-pill data-key="pill">${pill.html}</button>
    </div>
    <h2 class="t-title" id="t-screen-title" tabindex="-1">${esc(greeting(ctx))}</h2>
  </header>`;
}

export function renderToday(ctx: ViewContext): string {
  if (ctx.state.awaitingSchedule) return ctx.state.online ? renderTodaySkeleton(ctx) : renderTodayWaiting(ctx);
  const cards = ctx.orders.map((order) => orderCard(ctx, order)).join('');
  return `<section class="t-screen t-screen--today" data-screen="today" aria-labelledby="t-screen-title">
    ${header(ctx)}
    <div class="t-screen__body">
      ${summary(ctx)}
      <div class="t-section-head"><h3>${esc(ctx.s.today.listTitle)}</h3><span>${esc(fill(ctx.s.today.listCount, { n: ctx.orders.length }))}</span></div>
      <ol class="t-orders">${cards}</ol>
    </div>
  </section>`;
}

/** Shown after a wipe without a connection: the phone has no schedule until it can download one. */
function renderTodayWaiting(ctx: ViewContext): string {
  return `<section class="t-screen t-screen--today" data-screen="today" aria-labelledby="t-screen-title">
    ${header(ctx)}
    <div class="t-screen__body">
      <div class="t-empty t-empty--offline">${icon('cloudOff')}<p class="t-empty__title">${esc(ctx.s.today.waitingTitle)}</p><p>${esc(ctx.s.today.waitingText)}</p></div>
    </div>
  </section>`;
}

/** Placeholder shown briefly while the schedule is "downloaded" again after a reset or a wipe. */
function renderTodaySkeleton(ctx: ViewContext): string {
  const card = '<li class="t-skel-card"><span class="t-skel t-skel--time"></span><span class="t-skel-card__lines"><span class="t-skel t-skel--sm"></span><span class="t-skel t-skel--lg"></span><span class="t-skel t-skel--md"></span></span></li>';
  return `<section class="t-screen t-screen--today" data-screen="today" aria-labelledby="t-screen-title" aria-busy="true">
    <header class="t-head t-head--today">
      <div class="t-head__top"><p class="t-overline">${esc(ctx.s.today.dayLabel)}</p></div>
      <h2 class="t-title" id="t-screen-title" tabindex="-1">${esc(greeting(ctx))}</h2>
    </header>
    <div class="t-screen__body">
      <p class="t-sr">${esc(ctx.s.today.loading)}</p>
      <div class="t-skel t-skel--summary" aria-hidden="true"></div>
      <div class="t-section-head" aria-hidden="true"><span class="t-skel t-skel--sm"></span></div>
      <ol class="t-orders" aria-hidden="true">${card.repeat(4)}</ol>
    </div>
  </section>`;
}
