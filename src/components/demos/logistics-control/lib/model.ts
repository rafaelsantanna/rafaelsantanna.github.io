/** Domain model for the Trajeto demo. Times are minutes relative to the operation anchor (see clock.ts). */

export type Status = 'route' | 'late' | 'issue' | 'delivered' | 'awaiting';
export type IssueType = 'absent' | 'access' | 'refused' | 'damaged' | 'address';
export type ExceptionKind = 'late' | IssueType;
export type Role = 'operator' | 'supervisor';
export type View = 'overview' | 'deliveries' | 'drivers' | 'exceptions';
export type VehicleType = 'van' | 'motorcycle' | 'truck';
export type HubId = 'north' | 'south' | 'east' | 'west';

/** Order used by chips, legends and counts. */
export const STATUSES: Status[] = ['route', 'late', 'issue', 'delivered', 'awaiting'];
/** Lower is more urgent. Used by the default sort. */
export const URGENCY: Record<Status, number> = { issue: 0, late: 1, route: 2, awaiting: 3, delivered: 4 };
export const ISSUE_TYPES: IssueType[] = ['absent', 'access', 'refused', 'damaged', 'address'];
export const VIEWS: View[] = ['overview', 'deliveries', 'drivers', 'exceptions'];

export interface Point { x: number; y: number }

export interface Zone {
  id: string;
  name: string;
  center: Point;
  hubId: HubId;
  /** Angle in radians where sector 1 starts. */
  rotation: number;
  sectors: number;
}

export interface Hub { id: HubId; point: Point }

export interface Driver {
  id: string;
  name: string;
  initials: string;
  zoneId: string;
  sector: number;
  hubId: HubId;
  vehicle: VehicleType;
}

export type SystemLogKind = 'created' | 'pickedUp' | 'attemptFailed' | 'delivered' | 'windowClosed';
export type ActionLogKind = 'reassigned' | 'prioritized' | 'unprioritized' | 'issue' | 'resolved' | 'rescheduled' | 'contacted';
export type LogKind = SystemLogKind | ActionLogKind;

/** A timeline event. Entries with a role were made by the person using the console; the rest come from the operation. */
export interface LogEntry {
  kind: LogKind;
  at: number;
  role?: Role;
  hub?: HubId;
  from?: string;
  to?: string;
  issue?: IssueType;
  windowStart?: number;
  windowEnd?: number;
  eta?: number;
}

export interface Delivery {
  id: string;
  customer: string;
  zoneId: string;
  sector: number;
  driverId: string;
  status: Status;
  issue: IssueType | null;
  priority: boolean;
  volumes: number;
  weightKg: number;
  attempts: number;
  createdAt: number;
  pickedUpAt: number | null;
  windowStart: number;
  windowEnd: number;
  /** Projected arrival for open deliveries. */
  eta: number | null;
  deliveredAt: number | null;
  issueAt: number | null;
  point: Point;
  log: LogEntry[];
}

export interface OperatingDay {
  zones: Zone[];
  hubs: Hub[];
  drivers: Driver[];
  deliveries: Delivery[];
}

export function exceptionKind(delivery: Delivery): ExceptionKind | null {
  if (delivery.status === 'late') return 'late';
  if (delivery.status === 'issue') return delivery.issue ?? 'absent';
  return null;
}
