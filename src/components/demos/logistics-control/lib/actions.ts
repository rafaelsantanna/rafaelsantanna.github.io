/** Pure mutations. Each returns new delivery objects and never touches the input. */
import type { Delivery, IssueType, LogEntry, Role, Status } from './model';

export type Mutation =
  | { type: 'reassign'; ids: string[]; driverId: string }
  | { type: 'priority'; ids: string[]; value: boolean }
  | { type: 'issue'; ids: string[]; issue: IssueType }
  | { type: 'resolve'; ids: string[] }
  | { type: 'reschedule'; ids: string[] }
  | { type: 'contact'; ids: string[] };

export interface ActionContext { now: number; role: Role }

/** Actions only a Supervisor may run. */
export const SUPERVISOR_ONLY: Mutation['type'][] = ['reassign', 'priority'];

export function canRun(role: Role, type: Mutation['type']): boolean {
  return role === 'supervisor' || !SUPERVISOR_ONLY.includes(type);
}

/** An issue happens at the address, so only parcels already out for delivery can have one. */
export function canReportIssue(status: Status): boolean {
  return status === 'route' || status === 'late';
}

/** A delivery that leaves the exceptions queue goes back on route, or back to the hub if it was never picked up. */
function reopenedStatus(delivery: Delivery): Status {
  return delivery.pickedUpAt === null ? 'awaiting' : 'route';
}

const ceilToSlot = (minutes: number) => Math.ceil(minutes / 30) * 30;

function withLog(delivery: Delivery, patch: Partial<Delivery>, entry: Omit<LogEntry, 'at' | 'role'>, context: ActionContext): Delivery {
  return { ...delivery, ...patch, log: [...delivery.log, { ...entry, at: Math.round(context.now), role: context.role }] };
}

/** Returns the updated record, or null when the mutation does not apply to it. */
function applyOne(delivery: Delivery, mutation: Mutation, context: ActionContext): Delivery | null {
  const now = Math.round(context.now);
  switch (mutation.type) {
    case 'reassign':
      if (delivery.status === 'delivered' || delivery.driverId === mutation.driverId) return null;
      return withLog(delivery, { driverId: mutation.driverId }, { kind: 'reassigned', from: delivery.driverId, to: mutation.driverId }, context);
    case 'priority':
      if (delivery.status === 'delivered' || delivery.priority === mutation.value) return null;
      return withLog(delivery, { priority: mutation.value }, { kind: mutation.value ? 'prioritized' : 'unprioritized' }, context);
    case 'issue': {
      if (!canReportIssue(delivery.status)) return null;
      // Absent recipient and restricted access are failed attempts at the door.
      const counted = mutation.issue === 'absent' || mutation.issue === 'access';
      return withLog(
        delivery,
        { status: 'issue', issue: mutation.issue, issueAt: now, eta: null, attempts: Math.min(3, delivery.attempts + (counted ? 1 : 0)) },
        { kind: 'issue', issue: mutation.issue },
        context,
      );
    }
    case 'resolve': {
      if (delivery.status !== 'issue') return null;
      const eta = now + 35;
      const windowEnd = Math.max(delivery.windowEnd, ceilToSlot(eta + 30));
      const windowStart = windowEnd === delivery.windowEnd ? delivery.windowStart : windowEnd - 120;
      return withLog(delivery, { status: reopenedStatus(delivery), issue: null, issueAt: null, eta, windowStart, windowEnd }, { kind: 'resolved', eta, windowStart, windowEnd }, context);
    }
    case 'reschedule': {
      if (delivery.status !== 'late' && delivery.status !== 'issue') return null;
      const windowStart = ceilToSlot(now + 30);
      const windowEnd = windowStart + 120;
      const eta = windowStart + 20;
      return withLog(delivery, { status: reopenedStatus(delivery), issue: null, issueAt: null, eta, windowStart, windowEnd }, { kind: 'rescheduled', windowStart, windowEnd, eta }, context);
    }
    default:
      return withLog(delivery, {}, { kind: 'contacted' }, context);
  }
}

export interface MutationResult { next: Delivery[]; before: Delivery[]; after: Delivery[]; skipped: number }

export function applyMutation(deliveries: Delivery[], mutation: Mutation, context: ActionContext): MutationResult {
  const targets = new Set(mutation.ids);
  const before: Delivery[] = [];
  const after: Delivery[] = [];
  let skipped = 0;
  const next = deliveries.map((delivery) => {
    if (!targets.has(delivery.id)) return delivery;
    const updated = applyOne(delivery, mutation, context);
    if (!updated) {
      skipped += 1;
      return delivery;
    }
    before.push(delivery);
    after.push(updated);
    return updated;
  });
  return { next, before, after, skipped };
}
