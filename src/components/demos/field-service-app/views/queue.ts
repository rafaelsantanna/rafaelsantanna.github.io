import { retryCountdown, syncedNewestFirst, unsyncedCount, unsyncedInOrder } from '../lib/queue';
import { esc, fill, plural } from '../lib/text';
import type { QueueEvent } from '../lib/types';
import { eventStatusChip, eventStatusIcons, type ViewContext } from './common';
import { icon } from './icons';

const SENT_VISIBLE = 20;

function eventTitle(ctx: ViewContext, event: QueueEvent): string {
  const template = ctx.s.events[event.kind];
  switch (event.kind) {
    case 'check':
    case 'uncheck':
      return fill(template, { item: event.item ? ctx.s.items[event.item].short : '' });
    case 'power':
      return fill(template, { value: ctx.f.dbm(event.value ?? 0) });
    case 'speed':
      return fill(template, { value: ctx.f.mbps(event.value ?? 0) });
    case 'waiver':
      return fill(template, { reason: event.waiver ? ctx.s.signature.reasons[event.waiver] : '' });
    default:
      return template;
  }
}

function eventNote(ctx: ViewContext, event: QueueEvent): string {
  if (event.status === 'failed') {
    const reason = ctx.s.queue.reasons[event.reason ?? 'timeout'];
    if (!ctx.state.online || ctx.now === null || event.retryAt === null) return fill(ctx.s.queue.retryOffline, { reason });
    const seconds = Math.max(1, Math.ceil((event.retryAt - ctx.now) / 1000));
    return fill(ctx.s.queue.retryIn, { reason, s: seconds, n: event.attempts + 1 });
  }
  if (event.status === 'pending') return ctx.state.online ? ctx.s.queue.waiting : ctx.s.queue.waitingOffline;
  if (event.status === 'sending') return ctx.s.queue.sendingNow;
  return event.syncedAt ? fill(ctx.s.queue.sentAt, { time: ctx.f.time(event.syncedAt) }) : '';
}

function eventRow(ctx: ViewContext, event: QueueEvent): string {
  return `<li class="t-event" data-status="${event.status}">
    <span class="t-event__icon" aria-hidden="true">${icon(eventStatusIcons[event.status], event.status === 'sending' ? 't-spin' : '')}</span>
    <span class="t-event__body">
      <span class="t-event__title">${esc(eventTitle(ctx, event))}</span>
      <span class="t-event__meta">${esc(fill(ctx.s.queue.meta, { id: event.orderId, time: ctx.f.timeSeconds(event.at) }))}</span>
      <span class="t-event__note">${esc(eventNote(ctx, event))}</span>
    </span>
    ${eventStatusChip(ctx, event.status)}
  </li>`;
}

export function lastSyncedAt(events: QueueEvent[]): number | null {
  return events.reduce<number | null>((latest, event) => (event.syncedAt && (latest === null || event.syncedAt > latest) ? event.syncedAt : latest), null);
}

/** Status card at the top of the queue screen. Patched in place while the queue moves. */
export function syncCard(ctx: ViewContext): string {
  const pending = unsyncedCount(ctx.state.events);
  const sending = ctx.state.online && pending > 0 && ctx.drain.total > 0;
  const retryIn = ctx.state.online && ctx.now !== null ? retryCountdown(ctx.state.events, ctx.now) : null;
  let tone: string;
  let text: string;
  if (!ctx.state.online) {
    tone = 'offline';
    text = plural(ctx.s.queue.stateOffline, pending);
  } else if (retryIn !== null) {
    tone = 'retry';
    text = fill(ctx.s.queue.stateRetry, { s: retryIn });
  } else if (sending) {
    tone = 'sending';
    text = fill(ctx.s.queue.stateSending, { done: Math.min(ctx.drain.done + 1, ctx.drain.total), total: ctx.drain.total });
  } else if (pending) {
    tone = 'pending';
    text = plural(ctx.s.queue.statePending, pending);
  } else {
    tone = 'synced';
    text = ctx.s.queue.stateSynced;
  }
  const icons = { offline: 'cloudOff', retry: 'alert', sending: 'sync', pending: 'clock', synced: 'cloudCheck' } as const;
  const iconName = icons[tone as keyof typeof icons];
  const ratio = ctx.drain.total ? ctx.drain.done / ctx.drain.total : pending ? 0 : 1;
  const last = lastSyncedAt(ctx.state.events);
  return `<div class="t-syncard" data-tone="${tone}">
    <p class="t-syncard__state">${icon(iconName, tone === 'sending' ? 't-spin' : '')}<span>${esc(text)}</span></p>
    <div class="t-syncard__bar" aria-hidden="true"><span style="inline-size: ${Math.round(ratio * 100)}%"></span></div>
    ${last ? `<p class="t-syncard__meta">${esc(fill(ctx.s.queue.lastSync, { time: ctx.f.time(last) }))}</p>` : ''}
  </div>`;
}

/** Both event lists. They hold no controls, so they can be replaced freely as the queue moves. */
export function queueLists(ctx: ViewContext): string {
  const queued = unsyncedInOrder(ctx.state.events);
  const synced = syncedNewestFirst(ctx.state.events);
  const sent = synced.slice(0, SENT_VISIBLE);
  if (!queued.length && !sent.length) {
    return `<div class="t-empty">${icon('cloudCheck')}<p>${esc(ctx.s.queue.empty)}</p></div>`;
  }
  const queuedList = queued.length
    ? `<ol class="t-events">${queued.map((event) => eventRow(ctx, event)).join('')}</ol>`
    : `<p class="t-events__empty">${esc(ctx.s.queue.emptyQueued)}</p>`;
  // The header counts every synced event kept on the device, like the live legend; the list shows the newest ones.
  const capped = synced.length > sent.length ? `<p class="t-events__more">${esc(fill(ctx.s.queue.sentShowing, { n: sent.length }))}</p>` : '';
  const sentList = sent.length ? `<h3 class="t-subhead">${esc(ctx.s.queue.sentTitle)} <span>${synced.length}</span></h3>${capped}<ol class="t-events t-events--sent">${sent.map((event) => eventRow(ctx, event)).join('')}</ol>` : '';
  return `<h3 class="t-subhead">${esc(ctx.s.queue.queuedTitle)} <span>${queued.length}</span></h3>${queuedList}${sentList}`;
}

export function renderQueue(ctx: ViewContext): string {
  return `<section class="t-screen t-screen--queue" data-screen="queue" aria-labelledby="t-screen-title">
    <header class="t-head">
      <div class="t-head__text"><h2 class="t-title" id="t-screen-title" tabindex="-1">${esc(ctx.s.queue.title)}</h2></div>
    </header>
    <div class="t-screen__body">
      <div data-syncard>${syncCard(ctx)}</div>
      <button type="button" class="t-btn t-btn--secondary t-btn--block" data-action="sync-now" data-key="queue-sync">${icon('sync')}${esc(ctx.s.queue.syncNow)}</button>
      <p class="t-explain">${esc(ctx.s.queue.explain)}</p>
      <div class="t-queue-lists" data-queue-lists>${queueLists(ctx)}</div>
      <p class="t-fine">${icon('info')}<span>${esc(ctx.s.queue.simulated)}</span></p>
    </div>
  </section>`;
}
