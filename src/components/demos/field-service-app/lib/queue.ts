import type { EventStatus, FailureReason, QueueEvent } from './types';

const RETRY_BASE_MS = 2000;
const RETRY_CAP_MS = 30000;

/** Synced history kept on the device; older confirmed events are dropped. */
const HISTORY_LIMIT = 40;

function isUnsynced(event: QueueEvent): boolean {
  return event.status !== 'synced';
}

/** The queue is strictly ordered: the oldest unsynced event always goes first, so later events never overtake it. */
export function headOfQueue(events: QueueEvent[]): QueueEvent | undefined {
  let head: QueueEvent | undefined;
  for (const event of events) {
    if (isUnsynced(event) && (!head || event.seq < head.seq)) head = event;
  }
  return head;
}

/** Seconds until the head of the queue retries, or null when it is not waiting on a failed attempt. */
export function retryCountdown(events: QueueEvent[], now: number): number | null {
  const head = headOfQueue(events);
  if (!head || head.status !== 'failed' || head.retryAt === null || head.retryAt <= now) return null;
  return Math.max(1, Math.ceil((head.retryAt - now) / 1000));
}

export function unsyncedInOrder(events: QueueEvent[]): QueueEvent[] {
  return events.filter(isUnsynced).sort((a, b) => a.seq - b.seq);
}

export function syncedNewestFirst(events: QueueEvent[]): QueueEvent[] {
  return events.filter((event) => event.status === 'synced').sort((a, b) => b.seq - a.seq);
}

export function countByStatus(events: QueueEvent[]): Record<EventStatus, number> {
  const counts: Record<EventStatus, number> = { pending: 0, sending: 0, failed: 0, synced: 0 };
  for (const event of events) counts[event.status] += 1;
  return counts;
}

export function unsyncedCount(events: QueueEvent[]): number {
  return events.reduce((total, event) => total + (isUnsynced(event) ? 1 : 0), 0);
}

export function unsyncedForOrder(events: QueueEvent[], orderId: string): number {
  return events.reduce((total, event) => total + (event.orderId === orderId && isUnsynced(event) ? 1 : 0), 0);
}

/**
 * Deterministic failure plan so every visit shows the retry logic the same way: some events fail once,
 * a few fail twice, one in a while fails three times so the whole 2 s, 4 s, 8 s backoff shows up,
 * and the rest go through on the first attempt. The 8th change a visitor makes (seq 20) is the first triple.
 */
function plannedFailures(seq: number): number {
  if (seq % 13 === 7) return 3;
  if (seq % 11 === 5) return 2;
  if (seq % 5 === 4) return 1;
  return 0;
}

export function shouldFail(event: QueueEvent): boolean {
  return event.attempts < plannedFailures(event.seq);
}

export function failureReason(seq: number): FailureReason {
  return seq % 2 === 0 ? 'timeout' : 'server';
}

/** Exponential backoff after the given number of failed attempts: 2 s, 4 s, 8 s, capped at 30 s. */
export function backoffDelay(attempts: number): number {
  return Math.min(RETRY_BASE_MS * 2 ** Math.max(0, attempts - 1), RETRY_CAP_MS);
}

/** Simulated network latency; photos are heavier and take longer. */
export function latencyFor(event: QueueEvent): number {
  if (event.kind === 'photo') return 1600;
  return 550 + (event.seq % 3) * 220;
}

export function trimHistory(events: QueueEvent[]): QueueEvent[] {
  const synced = syncedNewestFirst(events);
  if (synced.length <= HISTORY_LIMIT) return events;
  const keep = new Set(synced.slice(0, HISTORY_LIMIT).map((event) => event.seq));
  return events.filter((event) => isUnsynced(event) || keep.has(event.seq));
}
