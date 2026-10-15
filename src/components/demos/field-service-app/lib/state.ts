import { anchorOffset, resumeOffset } from './clock.ts';
import type { AppState, OrderInfo, OrderProgress, QueueEvent, SeedDefinition, View } from './types';

function emptyProgress(): OrderProgress {
  return {
    status: 'scheduled',
    startedAt: null,
    completedAt: null,
    checks: {},
    power: null,
    speed: null,
    photo: null,
    signature: null,
    waiver: null,
    notes: null,
  };
}

function atMinute(now: number, minutes: number): number {
  const date = new Date(now);
  date.setHours(0, minutes, 0, 0);
  return date.getTime();
}

function seedProgress(progress: OrderProgress, now: number): OrderProgress {
  const at = (minutes: number) => atMinute(now, minutes);
  const checks: OrderProgress['checks'] = {};
  for (const [id, minutes] of Object.entries(progress.checks)) checks[id as keyof typeof checks] = at(minutes as number);
  return {
    status: progress.status,
    startedAt: progress.startedAt === null ? null : at(progress.startedAt),
    completedAt: progress.completedAt === null ? null : at(progress.completedAt),
    checks,
    power: progress.power && { value: progress.power.value, at: at(progress.power.at) },
    speed: progress.speed && { value: progress.speed.value, at: at(progress.speed.at) },
    photo: progress.photo && { variant: progress.photo.variant, at: at(progress.photo.at) },
    signature: progress.signature && { strokes: progress.signature.strokes, at: at(progress.signature.at) },
    waiver: progress.waiver && { reason: progress.waiver.reason, at: at(progress.waiver.at) },
    notes: progress.notes && { text: progress.notes.text, at: at(progress.notes.at) },
  };
}

/**
 * Builds the starting day on the simulated clock: earlier work is already synced, the rest is scheduled.
 * The clock offset defaults to a fresh clock that reads WORKDAY_START; a wiped phone keeps its running clock.
 */
export function buildSeedState(orders: OrderInfo[], seed: SeedDefinition, realNow: number, clockOffset = anchorOffset(realNow)): AppState {
  const now = realNow + clockOffset;
  const progress: Record<string, OrderProgress> = {};
  for (const order of orders) {
    const seeded = seed.progress[order.id];
    progress[order.id] = seeded ? seedProgress(seeded, now) : emptyProgress();
  }
  const events: QueueEvent[] = seed.events.map((event, index) => {
    const at = atMinute(now, event.at);
    return {
      seq: index + 1,
      kind: event.kind,
      orderId: event.orderId,
      at,
      status: 'synced',
      attempts: 0,
      retryAt: null,
      syncedAt: at + 4000,
      reason: null,
      ...(event.item ? { item: event.item } : {}),
      ...(event.value !== undefined ? { value: event.value } : {}),
    };
  });
  return { v: 2, online: true, awaitingSchedule: false, clockOffset, savedAt: realNow, nextSeq: events.length + 1, orders: progress, events, view: { screen: 'today' } };
}

function isView(value: unknown, orders: OrderInfo[]): value is View {
  if (!value || typeof value !== 'object') return false;
  const view = value as { screen?: unknown; orderId?: unknown };
  if (view.screen === 'order') return orders.some((order) => order.id === view.orderId);
  return view.screen === 'today' || view.screen === 'queue' || view.screen === 'settings';
}

/** Accepts stored state only when it matches the current shape and order list; anything else falls back to the seed. */
export function restoreState(raw: unknown, orders: OrderInfo[], realNow: number): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const state = raw as Partial<AppState>;
  if (state.v !== 2 || typeof state.online !== 'boolean' || typeof state.nextSeq !== 'number') return null;
  if (typeof state.awaitingSchedule !== 'boolean' || typeof state.clockOffset !== 'number' || typeof state.savedAt !== 'number') return null;
  if (!Array.isArray(state.events) || !state.orders || typeof state.orders !== 'object') return null;
  // A workday saved on another calendar day starts over, so 'Today' never shows a past date.
  if (new Date(state.savedAt).toDateString() !== new Date(realNow).toDateString()) return null;
  if (!orders.every((order) => state.orders && typeof state.orders[order.id] === 'object')) return null;
  const view = isView(state.view, orders) ? state.view : { screen: 'today' as const };
  // A send interrupted by a reload never reached the server, so it goes back to the queue.
  const events = state.events.map((event) => (event.status === 'sending' ? { ...event, status: 'pending' as const } : event));
  return {
    v: 2,
    online: state.online,
    awaitingSchedule: state.awaitingSchedule,
    clockOffset: resumeOffset(state.clockOffset, state.savedAt, realNow),
    savedAt: realNow,
    nextSeq: state.nextSeq,
    orders: state.orders,
    events,
    view,
  };
}
