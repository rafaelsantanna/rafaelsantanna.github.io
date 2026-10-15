export type OrderType = 'install' | 'repair' | 'router' | 'move';
export type Priority = 'high' | 'normal' | 'low';
export type OrderStatus = 'scheduled' | 'in-progress' | 'done';
export type CheckItemId = 'cto' | 'splice' | 'wifi';
export type MeasureId = 'power' | 'speed';
export type ItemId = CheckItemId | MeasureId | 'photo' | 'signature';
export type WaiverReason = 'absent' | 'unable' | 'refused';
export type EventStatus = 'pending' | 'sending' | 'synced' | 'failed';
export type EventKind =
  | 'start'
  | 'check'
  | 'uncheck'
  | 'power'
  | 'speed'
  | 'photo'
  | 'signature'
  | 'signature-removed'
  | 'waiver'
  | 'waiver-removed'
  | 'notes'
  | 'complete';
export type FailureReason = 'timeout' | 'server';

/** Static, localized information about a work order (comes from the dispatch system). */
export interface OrderInfo {
  id: string;
  type: OrderType;
  start: string;
  end: string;
  customer: string;
  neighborhood: string;
  priority: Priority;
  /** Contracted plan in Mbps. */
  plan: number;
  planLabel: string;
  note: string;
  distanceKm: number;
  etaMin: number;
}

/** Signature strokes as flat [x, y, x, y, ...] lists normalized to 0..1000. */
export type Stroke = number[];

export interface OrderProgress {
  status: OrderStatus;
  startedAt: number | null;
  completedAt: number | null;
  checks: Partial<Record<CheckItemId, number>>;
  power: { value: number; at: number } | null;
  speed: { value: number; at: number } | null;
  photo: { at: number; variant: number } | null;
  signature: { at: number; strokes: Stroke[] } | null;
  waiver: { at: number; reason: WaiverReason } | null;
  notes: { text: string; at: number } | null;
}

export interface QueueEvent {
  seq: number;
  kind: EventKind;
  orderId: string;
  at: number;
  status: EventStatus;
  /** Failed delivery attempts so far. */
  attempts: number;
  retryAt: number | null;
  syncedAt: number | null;
  reason: FailureReason | null;
  item?: ItemId;
  value?: number;
  waiver?: WaiverReason;
}

export type View = { screen: 'today' | 'queue' | 'settings' } | { screen: 'order'; orderId: string };

export interface AppState {
  v: 2;
  online: boolean;
  /** True after a reset or a wipe until the schedule is downloaded again, which needs a connection. */
  awaitingSchedule: boolean;
  /** Milliseconds between the real clock and the simulated workday clock (see lib/clock). */
  clockOffset: number;
  /** Real time of the last save, used to resume the simulated clock after a break. */
  savedAt: number;
  nextSeq: number;
  orders: Record<string, OrderProgress>;
  events: QueueEvent[];
  view: View;
}

/**
 * Seed data uses the same shapes, but every time field holds minutes after midnight,
 * so the client can place the history on the simulated workday.
 */
export type SeedProgress = OrderProgress;

export interface SeedEvent {
  kind: EventKind;
  orderId: string;
  at: number;
  item?: ItemId;
  value?: number;
}

export interface SeedDefinition {
  progress: Record<string, SeedProgress>;
  events: SeedEvent[];
}
