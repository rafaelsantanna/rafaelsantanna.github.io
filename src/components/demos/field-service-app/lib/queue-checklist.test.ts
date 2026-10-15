// Business rules of the offline sync queue and the work order checklist. Run with:
// node --test src/components/demos/field-service-app/lib/queue-checklist.test.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ordersFor, seedFor } from '../content/seed.ts';
import { checklistFor, checklistProgress, missingRequired, POWER_RANGE, speedBounds, validatePower, validateSpeed } from './checklist.ts';
import {
  backoffDelay,
  countByStatus,
  failureReason,
  headOfQueue,
  retryCountdown,
  shouldFail,
  syncedNewestFirst,
  trimHistory,
  unsyncedCount,
  unsyncedForOrder,
  unsyncedInOrder,
} from './queue.ts';
import { buildSeedState, restoreState } from './state.ts';
import type { EventStatus, OrderInfo, OrderProgress, OrderType, QueueEvent } from './types';

function event(seq: number, status: EventStatus = 'pending', extra: Partial<QueueEvent> = {}): QueueEvent {
  return { seq, kind: 'check', orderId: 'A', at: seq * 1000, status, attempts: 0, retryAt: null, syncedAt: null, reason: null, ...extra };
}

function order(type: OrderType, plan = 500): OrderInfo {
  return { id: 'A', type, start: '10:00', end: '11:00', customer: 'C', neighborhood: 'N', priority: 'normal', plan, planLabel: `${plan} Mbps`, note: '', distanceKm: 1, etaMin: 5 };
}

function progress(extra: Partial<OrderProgress> = {}): OrderProgress {
  return { status: 'in-progress', startedAt: 1, completedAt: null, checks: {}, power: null, speed: null, photo: null, signature: null, waiver: null, notes: null, ...extra };
}

/** Every required item of an install done; the optional Wi-Fi check is left open. */
function requiredDone(extra: Partial<OrderProgress> = {}): OrderProgress {
  return progress({
    checks: { cto: 1, splice: 2 },
    power: { value: -18.7, at: 3 },
    speed: { value: 486, at: 4 },
    photo: { at: 5, variant: 1 },
    signature: { at: 6, strokes: [[0, 0, 10, 10]] },
    ...extra,
  });
}

/** Delivers one event the way client/sync does, returning the retry delays until it goes through. */
function deliver(seq: number): number[] {
  const current = event(seq);
  const delays: number[] = [];
  while (shouldFail(current)) {
    current.attempts += 1;
    delays.push(backoffDelay(current.attempts));
    assert.ok(delays.length < 10, `seq ${seq} never stops failing`);
  }
  return delays;
}

describe('queue ordering', () => {
  it('sends the oldest unsynced event first, whatever the array order or its status', () => {
    const events = [event(5), event(2, 'synced'), event(4, 'failed'), event(3, 'synced'), event(6, 'sending')];
    assert.equal(headOfQueue(events)?.seq, 4);
  });

  it('keeps a failed head in front so later events never overtake it', () => {
    const events = [event(7, 'failed', { retryAt: 10_000 }), event(8), event(9)];
    assert.equal(headOfQueue(events)?.seq, 7);
    assert.deepEqual(unsyncedInOrder(events).map((item) => item.seq), [7, 8, 9]);
  });

  it('has no head when everything is synced or the queue is empty', () => {
    assert.equal(headOfQueue([]), undefined);
    assert.equal(headOfQueue([event(1, 'synced'), event(2, 'synced')]), undefined);
  });

  it('lists unsynced events oldest first and synced history newest first, without mutating the input', () => {
    const events = [event(3), event(1, 'synced'), event(2, 'failed'), event(4, 'synced')];
    const snapshot = events.map((item) => item.seq);
    assert.deepEqual(unsyncedInOrder(events).map((item) => item.seq), [2, 3]);
    assert.deepEqual(syncedNewestFirst(events).map((item) => item.seq), [4, 1]);
    assert.deepEqual(events.map((item) => item.seq), snapshot);
  });
});

describe('queue counts', () => {
  it('counts every status, with zero for the ones that are absent', () => {
    assert.deepEqual(countByStatus([]), { pending: 0, sending: 0, failed: 0, synced: 0 });
    const events = [event(1, 'synced'), event(2, 'synced'), event(3, 'failed'), event(4, 'sending'), event(5), event(6)];
    assert.deepEqual(countByStatus(events), { pending: 2, sending: 1, failed: 1, synced: 2 });
  });

  it('treats pending, sending and failed as unsynced, globally and per order', () => {
    const events = [event(1, 'synced'), event(2, 'failed'), event(3, 'sending', { orderId: 'B' }), event(4), event(5, 'synced', { orderId: 'B' })];
    assert.equal(unsyncedCount(events), 3);
    assert.equal(unsyncedForOrder(events, 'A'), 2);
    assert.equal(unsyncedForOrder(events, 'B'), 1);
    assert.equal(unsyncedForOrder(events, 'missing'), 0);
  });
});

describe('deterministic failures and backoff', () => {
  it('fails each event a fixed number of times, so every visit replays the same retries', () => {
    assert.deepEqual(deliver(13), []);
    assert.deepEqual(deliver(14), [2000]);
    assert.deepEqual(deliver(16), [2000, 4000]);
    assert.deepEqual(deliver(20), [2000, 4000, 8000]);
    assert.deepEqual(deliver(20), deliver(20));
    // The shown reason is fixed per event too: even sequence numbers time out, odd ones get a server error.
    assert.equal(failureReason(20), 'timeout');
    assert.equal(failureReason(21), 'server');
  });

  it('applies the strongest failure plan when several rules match a sequence number', () => {
    // 49 matches the twice rule (49 % 11 = 5) and the once rule (49 % 5 = 4).
    assert.equal(deliver(49).length, 2);
    // 59 matches all three rules.
    assert.equal(deliver(59).length, 3);
  });

  it('makes the 8th visitor change after the seeded history the first triple failure', () => {
    const seeded = seedFor('en').events.length;
    assert.equal(seedFor('pt').events.length, seeded);
    const firstVisitorSeq = seeded + 1;
    let firstTriple = firstVisitorSeq;
    while (deliver(firstTriple).length < 3) firstTriple += 1;
    assert.equal(firstTriple, 20);
    assert.equal(firstTriple - firstVisitorSeq + 1, 8);
  });

  it('doubles the retry delay from 2 s and caps it at 30 s', () => {
    assert.deepEqual([1, 2, 3, 4].map(backoffDelay), [2000, 4000, 8000, 16000]);
    assert.equal(backoffDelay(5), 30000);
    assert.equal(backoffDelay(50), 30000);
    assert.equal(backoffDelay(0), 2000);
  });
});

describe('retry countdown', () => {
  it('rounds the remaining time up to whole seconds and never shows zero', () => {
    const at = (retryAt: number) => [event(1, 'failed', { retryAt })];
    assert.equal(retryCountdown(at(12_000), 10_000), 2);
    assert.equal(retryCountdown(at(11_001), 10_000), 2);
    assert.equal(retryCountdown(at(10_001), 10_000), 1);
  });

  it('shows nothing once the retry time is reached or when the head is not waiting on a failure', () => {
    assert.equal(retryCountdown([event(1, 'failed', { retryAt: 10_000 })], 10_000), null);
    assert.equal(retryCountdown([event(1, 'failed', { retryAt: null })], 10_000), null);
    assert.equal(retryCountdown([event(1, 'sending')], 10_000), null);
    assert.equal(retryCountdown([], 10_000), null);
  });

  it('only follows the head of the queue, not a failed event behind it', () => {
    const events = [event(2, 'failed', { retryAt: 20_000 }), event(1)];
    assert.equal(retryCountdown(events, 10_000), null);
  });
});

describe('history trimming', () => {
  const synced = (count: number, first = 1) => Array.from({ length: count }, (_, index) => event(first + index, 'synced'));

  it('leaves the list untouched up to 40 synced events', () => {
    const events = [...synced(40), event(41)];
    assert.equal(trimHistory(events), events);
  });

  it('drops the oldest synced events beyond 40 and keeps every unsynced one in place', () => {
    // Seq 1 is an old event still failing; seq 2 to 46 are synced; seq 47 is waiting.
    const events = [event(1, 'failed'), ...synced(45, 2), event(47)];
    const trimmed = trimHistory(events);
    const kept = trimmed.filter((item) => item.status === 'synced').map((item) => item.seq);
    assert.equal(kept.length, 40);
    assert.equal(kept[0], 7);
    assert.equal(kept[kept.length - 1], 46);
    assert.equal(trimmed[0].seq, 1);
    assert.equal(trimmed[trimmed.length - 1].seq, 47);
    assert.equal(trimmed.length, 42);
  });
});

describe('checklist completion gate', () => {
  it('lists the missing required items in checklist order, skipping optional Wi-Fi', () => {
    assert.deepEqual(missingRequired(order('install'), progress()), ['cto', 'splice', 'power', 'speed', 'photo', 'signature']);
    assert.deepEqual(missingRequired(order('router'), progress()), ['cto', 'power', 'speed', 'photo', 'signature']);
  });

  it('allows completion with every required item done even if the optional one is open', () => {
    const done = requiredDone();
    assert.deepEqual(missingRequired(order('install'), done), []);
    assert.deepEqual(checklistProgress(order('install'), done), { done: 6, total: 7 });
    assert.deepEqual(checklistProgress(order('repair'), done), { done: 6, total: 6 });
  });

  it('accepts a recorded waiver in place of the customer signature', () => {
    const waived = requiredDone({ signature: null, waiver: { at: 7, reason: 'absent' } });
    assert.deepEqual(missingRequired(order('install'), waived), []);
    assert.deepEqual(missingRequired(order('install'), requiredDone({ signature: null })), ['signature']);
  });

  it('only asks for a splice on orders that touch the fiber', () => {
    const ids = (type: OrderType) => checklistFor(type).map((item) => item.id);
    for (const type of ['install', 'repair', 'move'] as const) assert.ok(ids(type).includes('splice'), type);
    assert.ok(!ids('router').includes('splice'));
    assert.ok(!ids('repair').includes('wifi'));
  });
});

describe('optical power reading', () => {
  it('accepts the range bounds inclusively and applies the negative sign itself', () => {
    assert.deepEqual(POWER_RANGE, { min: -27, max: -8 });
    assert.deepEqual(validatePower('27', ','), { ok: true, value: -27 });
    assert.deepEqual(validatePower('8', ','), { ok: true, value: -8 });
    assert.deepEqual(validatePower('-18.7', ','), { ok: true, value: -18.7 });
    assert.deepEqual(validatePower('−18,7', '.'), { ok: true, value: -18.7 });
  });

  it('checks the range against the value as typed, before rounding', () => {
    assert.deepEqual(validatePower('27.04', ','), { ok: false, error: 'power-range', value: -27.04 });
    assert.deepEqual(validatePower('7.96', ','), { ok: false, error: 'power-range', value: -7.96 });
    assert.deepEqual(validatePower('30', ','), { ok: false, error: 'power-range', value: -30 });
  });

  it('stores one decimal, rounding half away from zero for both signs', () => {
    assert.deepEqual(validatePower('20.25', ','), { ok: true, value: -20.3 });
    assert.deepEqual(validatePower('-20,25', '.'), { ok: true, value: -20.3 });
    assert.deepEqual(validatePower('26.96', ','), { ok: true, value: -27 });
  });

  it('reads both decimal marks and rejects empty or malformed text', () => {
    assert.deepEqual(validatePower('18.5', '.'), { ok: true, value: -18.5 });
    assert.deepEqual(validatePower('18,5', ','), { ok: true, value: -18.5 });
    assert.deepEqual(validatePower('   ', ','), { ok: false, error: 'empty' });
    for (const input of ['abc', '18..5', '18,5,1', '1e1', '--18']) assert.deepEqual(validatePower(input, ','), { ok: false, error: 'format' }, input);
    // A grouped thousand in pt-BR is a thousand, far outside the range, not 1.0 dBm.
    assert.deepEqual(validatePower('1.000', '.'), { ok: false, error: 'power-range', value: -1000 });
  });
});

describe('speed test reading', () => {
  it('accepts 80 to 125 percent of the contracted plan, bounds included', () => {
    assert.deepEqual(speedBounds(500), { min: 400, max: 625 });
    assert.deepEqual(speedBounds(333), { min: 266, max: 416 });
    assert.deepEqual(validateSpeed('400', 500, ','), { ok: true, value: 400 });
    assert.deepEqual(validateSpeed('625', 500, ','), { ok: true, value: 625 });
    assert.deepEqual(validateSpeed('399.96', 500, ','), { ok: false, error: 'speed-low', value: 399.96 });
    assert.deepEqual(validateSpeed('625.01', 500, ','), { ok: false, error: 'speed-high', value: 625.01 });
  });

  it('rejects negative speeds as a format error instead of flipping the sign', () => {
    assert.deepEqual(validateSpeed('-450', 500, ','), { ok: false, error: 'format' });
    assert.deepEqual(validateSpeed('', 500, ','), { ok: false, error: 'empty' });
    assert.deepEqual(validateSpeed('486,44', 500, '.'), { ok: true, value: 486.4 });
  });
});

describe('restoring a saved workday', () => {
  const orders = ordersFor('pt');
  const savedAt = new Date(2026, 9, 15, 10, 0).getTime();
  const saved = buildSeedState(orders, seedFor('pt'), savedAt);

  it('continues the same workday after a reload on the same date', () => {
    const restored = restoreState(JSON.parse(JSON.stringify(saved)), orders, savedAt + 60 * 60 * 1000);
    assert.ok(restored);
    assert.equal(restored.nextSeq, saved.nextSeq);
  });

  it('starts over when the visitor comes back on another day', () => {
    const nextDay = new Date(2026, 9, 16, 9, 0).getTime();
    assert.equal(restoreState(JSON.parse(JSON.stringify(saved)), orders, nextDay), null);
  });
});
