import type { Locale } from '@/data/types';
import { trimHistory } from '../lib/queue';
import { buildSeedState, restoreState } from '../lib/state';
import type { AppState, CheckItemId, EventKind, FailureReason, MeasureId, OrderInfo, OrderProgress, QueueEvent, SeedDefinition, Stroke, View, WaiverReason } from '../lib/types';

export interface Change {
  orders?: boolean;
  queue?: boolean;
  view?: boolean;
  connection?: boolean;
  reset?: boolean;
}

type Listener = (change: Change) => void;

/** Each language is its own device, so seeded text never crosses locales. */
function storageKey(locale: Locale): string {
  return `rs-demo-field-service-app:${locale}:state`;
}

/** Local-first state: every change is applied on the device, persisted, and recorded as a queued event. */
export class Store {
  state: AppState;
  private listeners = new Set<Listener>();
  private readonly key: string;

  constructor(
    private readonly orders: OrderInfo[],
    private readonly seed: SeedDefinition,
    locale: Locale,
  ) {
    this.key = storageKey(locale);
    const realNow = Date.now();
    this.state = restoreState(this.readStored(), orders, realNow) ?? buildSeedState(orders, seed, realNow);
  }

  subscribe(listener: Listener): void {
    this.listeners.add(listener);
  }

  /** Current time on the simulated workday clock. Every timestamp the app shows or stores comes from here. */
  now(): number {
    return Date.now() + this.state.clockOffset;
  }

  /** Size of the saved state in bytes, or null when storage is unavailable. */
  storedBytes(): number | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? new TextEncoder().encode(raw).length : 0;
    } catch {
      return null;
    }
  }

  progress(orderId: string): OrderProgress {
    return this.state.orders[orderId];
  }

  setView(view: View): void {
    this.state.view = view;
    this.commit({ view: true });
  }

  start(orderId: string): void {
    const progress = this.progress(orderId);
    if (progress.status !== 'scheduled') return;
    progress.status = 'in-progress';
    progress.startedAt = this.now();
    this.enqueue('start', orderId);
  }

  toggleCheck(orderId: string, item: CheckItemId): boolean {
    const progress = this.progress(orderId);
    const checked = !progress.checks[item];
    if (checked) progress.checks[item] = this.now();
    else delete progress.checks[item];
    this.enqueue(checked ? 'check' : 'uncheck', orderId, { item });
    return checked;
  }

  /** Saves a validated reading. Returns false when the value did not change, so no event is queued. */
  setMeasure(orderId: string, item: MeasureId, value: number): boolean {
    const progress = this.progress(orderId);
    if (progress[item]?.value === value) return false;
    progress[item] = { value, at: this.now() };
    this.enqueue(item, orderId, { value });
    return true;
  }

  takePhoto(orderId: string): void {
    const progress = this.progress(orderId);
    progress.photo = { at: this.now(), variant: this.state.nextSeq };
    this.enqueue('photo', orderId);
  }

  sign(orderId: string, strokes: Stroke[]): void {
    const progress = this.progress(orderId);
    progress.signature = { at: this.now(), strokes };
    progress.waiver = null;
    this.enqueue('signature', orderId);
  }

  removeSignature(orderId: string): void {
    this.progress(orderId).signature = null;
    this.enqueue('signature-removed', orderId);
  }

  waive(orderId: string, reason: WaiverReason): void {
    const progress = this.progress(orderId);
    progress.waiver = { at: this.now(), reason };
    progress.signature = null;
    this.enqueue('waiver', orderId, { waiver: reason });
  }

  removeWaiver(orderId: string): void {
    this.progress(orderId).waiver = null;
    this.enqueue('waiver-removed', orderId);
  }

  /** Returns false when the text did not change. */
  setNotes(orderId: string, text: string): boolean {
    const progress = this.progress(orderId);
    const clean = text.trim();
    if ((progress.notes?.text ?? '') === clean) return false;
    progress.notes = clean ? { text: clean, at: this.now() } : null;
    this.enqueue('notes', orderId);
    return true;
  }

  complete(orderId: string): void {
    const progress = this.progress(orderId);
    progress.status = 'done';
    progress.completedAt = this.now();
    this.enqueue('complete', orderId);
  }

  setOnline(online: boolean): void {
    this.state.online = online;
    if (online) this.retryAllNow(false);
    this.commit({ connection: true, queue: true });
  }

  /** Failed events retry immediately, as a real app does when the network comes back or the user asks. */
  retryAllNow(notify = true): void {
    const now = this.now();
    for (const event of this.state.events) if (event.status === 'failed') event.retryAt = now;
    if (notify) this.commit({ queue: true });
  }

  markSending(seq: number): void {
    this.updateEvent(seq, (event) => {
      event.status = 'sending';
    });
  }

  markPending(seq: number): void {
    this.updateEvent(seq, (event) => {
      event.status = 'pending';
    });
  }

  markSynced(seq: number): void {
    this.updateEvent(seq, (event) => {
      event.status = 'synced';
      event.syncedAt = this.now();
      event.retryAt = null;
      event.reason = null;
    });
  }

  markFailed(seq: number, retryAt: number, reason: FailureReason): void {
    this.updateEvent(seq, (event) => {
      event.status = 'failed';
      event.attempts += 1;
      event.retryAt = retryAt;
      event.reason = reason;
    });
  }

  findEvent(seq: number): QueueEvent | undefined {
    return this.state.events.find((event) => event.seq === seq);
  }

  /**
   * 'reset' brings back the starting day on a fresh clock. 'wipe' mimics clearing the phone: the local log of
   * synced events is gone, the clock and the connection stay as they were, and either way the schedule has to
   * be downloaded again before it shows up.
   */
  reset(kind: 'reset' | 'wipe'): void {
    const previous = this.state;
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Storage can be blocked; the in-memory reset still applies.
    }
    const realNow = Date.now();
    this.state = kind === 'wipe' ? buildSeedState(this.orders, this.seed, realNow, previous.clockOffset) : buildSeedState(this.orders, this.seed, realNow);
    this.state.awaitingSchedule = true;
    if (kind === 'wipe') {
      this.state.online = previous.online;
      this.state.events = [];
    }
    this.commit({ reset: true, orders: true, queue: true, view: true, connection: true });
  }

  /** The schedule finished downloading after a reset or a wipe. */
  scheduleLoaded(): void {
    this.state.awaitingSchedule = false;
    this.commit({ orders: true });
  }

  /** Writes the state without notifying anyone, for example right before the page is hidden. */
  persist(): void {
    this.state.savedAt = Date.now();
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
    } catch {
      // Private windows or blocked storage: the demo keeps working in memory.
    }
  }

  private readStored(): unknown {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private updateEvent(seq: number, update: (event: QueueEvent) => void): void {
    const event = this.findEvent(seq);
    if (!event) return;
    update(event);
    this.state.events = trimHistory(this.state.events);
    this.commit({ queue: true });
  }

  private enqueue(kind: EventKind, orderId: string, extra: Partial<QueueEvent> = {}): void {
    this.state.events.push({
      seq: this.state.nextSeq,
      kind,
      orderId,
      at: this.now(),
      status: 'pending',
      attempts: 0,
      retryAt: null,
      syncedAt: null,
      reason: null,
      ...extra,
    });
    this.state.nextSeq += 1;
    this.commit({ orders: true, queue: true });
  }

  private commit(change: Change): void {
    this.persist();
    for (const listener of this.listeners) listener(change);
  }
}
