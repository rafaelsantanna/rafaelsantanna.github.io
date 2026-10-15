/** localStorage access for per-visitor preferences and demo changes. Every call tolerates blocked storage. */
import { STATUSES, type Delivery, type Role } from '../lib/model';

const PREFIX = 'rs-demo-logistics-control';
export const STORAGE_KEYS = {
  theme: `${PREFIX}:theme`,
  role: `${PREFIX}:role`,
  changes: `${PREFIX}:changes`,
  singleKeys: `${PREFIX}:single-keys`,
} as const;

export function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be full or blocked; the demo keeps working for this visit.
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to clean when storage is unavailable.
  }
}

export function readRole(): Role {
  return read(STORAGE_KEYS.role) === 'supervisor' ? 'supervisor' : 'operator';
}

function isDelivery(value: unknown): value is Delivery {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<Delivery>;
  return typeof record.id === 'string'
    && typeof record.driverId === 'string'
    && typeof record.status === 'string'
    && STATUSES.includes(record.status)
    && Array.isArray(record.log)
    && typeof record.windowStart === 'number'
    && typeof record.windowEnd === 'number';
}

/** Applies saved changes on top of the generated day, ignoring anything malformed or unknown. */
export function restoreChanges(base: Delivery[], driverIds: Set<string>): Delivery[] {
  const raw = read(STORAGE_KEYS.changes);
  if (!raw) return base;
  try {
    const saved = JSON.parse(raw) as unknown;
    if (!Array.isArray(saved)) return base;
    const byId = new Map(saved.filter(isDelivery).filter((record) => driverIds.has(record.driverId)).map((record) => [record.id, record]));
    return base.map((delivery) => {
      const record = byId.get(delivery.id);
      return record ? { ...delivery, ...record, point: delivery.point, zoneId: delivery.zoneId, sector: delivery.sector } : delivery;
    });
  } catch {
    return base;
  }
}

/** Saves only the records that differ from the generated day. */
export function saveChanges(baseJson: Map<string, string>, current: Delivery[]): void {
  const changed = current.filter((delivery) => baseJson.get(delivery.id) !== JSON.stringify(delivery));
  if (changed.length) write(STORAGE_KEYS.changes, JSON.stringify(changed));
  else remove(STORAGE_KEYS.changes);
}
