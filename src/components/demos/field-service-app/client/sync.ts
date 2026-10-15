import { backoffDelay, failureReason, headOfQueue, latencyFor, shouldFail, unsyncedCount } from '../lib/queue';
import type { QueueEvent } from '../lib/types';
import type { Store } from './store';

export interface SyncHooks {
  /** A send failed and will be retried after `delay` milliseconds. */
  failed(event: QueueEvent, delay: number): void;
  /** The queue emptied after a run that confirmed `sent` events. */
  drained(sent: number): void;
}

export interface SyncEngine {
  /** Starts sending if the device is online and nothing is in flight. */
  kick(): void;
  /** Stops timers and returns an in-flight event to the queue. */
  pause(): void;
  progress(): { done: number; total: number };
}

/**
 * Simulated transport. One event at a time, oldest first; a failed head blocks the events behind it
 * until its retry, so the server never sees "order completed" before "job started".
 */
export function createSync(store: Store, hooks: SyncHooks): SyncEngine {
  let timer: number | undefined;
  let inFlight: number | null = null;
  let done = 0;

  function clearTimer() {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
  }

  function schedule(delay: number, task: () => void) {
    clearTimer();
    timer = window.setTimeout(() => {
      timer = undefined;
      task();
    }, delay);
  }

  function finishRun() {
    if (done > 0) hooks.drained(done);
    done = 0;
  }

  function step() {
    if (!store.state.online || inFlight !== null) return;
    const head = headOfQueue(store.state.events);
    if (!head) {
      finishRun();
      return;
    }
    const now = store.now();
    if (head.status === 'failed' && head.retryAt !== null && head.retryAt > now) {
      schedule(head.retryAt - now, step);
      return;
    }
    inFlight = head.seq;
    store.markSending(head.seq);
    schedule(latencyFor(head), () => settle(head.seq));
  }

  function settle(seq: number) {
    inFlight = null;
    const event = store.findEvent(seq);
    if (event && event.status === 'sending') {
      if (shouldFail(event)) {
        const delay = backoffDelay(event.attempts + 1);
        store.markFailed(seq, store.now() + delay, failureReason(seq));
        hooks.failed(event, delay);
      } else {
        done += 1;
        store.markSynced(seq);
      }
    }
    step();
  }

  return {
    kick() {
      if (inFlight !== null) return;
      clearTimer();
      step();
    },
    pause() {
      clearTimer();
      if (inFlight !== null) {
        const seq = inFlight;
        inFlight = null;
        store.markPending(seq);
      }
      done = 0;
    },
    progress() {
      const remaining = unsyncedCount(store.state.events);
      return remaining ? { done, total: done + remaining } : { done: 0, total: 0 };
    },
  };
}
