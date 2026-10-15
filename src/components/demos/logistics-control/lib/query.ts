/** Pure derived views over the store: filtering, sorting, pagination, indicators and queues. */
import type { OperationClock } from './clock';
import { exceptionKind, STATUSES, URGENCY, type Delivery, type Driver, type ExceptionKind, type OperatingDay, type Status, type Zone } from './model.ts';
import { normalize } from './search.ts';

export const PAGE_SIZE = 25;

export type SortKey = 'id' | 'customer' | 'zone' | 'driver' | 'window' | 'eta' | 'volumes' | 'status';
export type SortDir = 'asc' | 'desc';
export const SORT_KEYS: SortKey[] = ['id', 'customer', 'zone', 'driver', 'window', 'eta', 'volumes', 'status'];

export interface Filters { query: string; statuses: Status[]; zone: string; driver: string }
export interface Sort { key: SortKey; dir: SortDir }

export const EMPTY_FILTERS: Filters = { query: '', statuses: [], zone: '', driver: '' };
export const DEFAULT_SORT: Sort = { key: 'status', dir: 'asc' };

export interface Lookup { drivers: Map<string, Driver>; zones: Map<string, Zone> }

export function createLookup(day: Pick<OperatingDay, 'drivers' | 'zones'>): Lookup {
  return {
    drivers: new Map(day.drivers.map((driver) => [driver.id, driver])),
    zones: new Map(day.zones.map((zone) => [zone.id, zone])),
  };
}

export function hasActiveFilters(filters: Filters): boolean {
  return Boolean(filters.query.trim() || filters.statuses.length || filters.zone || filters.driver);
}

export function filterDeliveries(list: Delivery[], filters: Filters, lookup: Lookup): Delivery[] {
  const tokens = normalize(filters.query).split(/\s+/).filter(Boolean);
  return list.filter((delivery) => {
    if (filters.statuses.length && !filters.statuses.includes(delivery.status)) return false;
    if (filters.zone && delivery.zoneId !== filters.zone) return false;
    if (filters.driver && delivery.driverId !== filters.driver) return false;
    if (!tokens.length) return true;
    const haystack = normalize(`${delivery.id} ${delivery.customer} ${lookup.zones.get(delivery.zoneId)?.name ?? ''} ${lookup.drivers.get(delivery.driverId)?.name ?? ''}`);
    return tokens.every((token) => haystack.includes(token));
  });
}

/**
 * ETA order works in groups that keep their place in both directions: open deliveries with a projected
 * arrival, then open ones without it (issues), then completed ones by delivery time.
 */
function etaGroup(delivery: Delivery): number {
  if (delivery.status === 'delivered') return 2;
  return delivery.eta === null ? 1 : 0;
}

/** Time compared inside an ETA group: projected arrival, or delivery time once completed. */
function etaTime(delivery: Delivery): number {
  return (delivery.status === 'delivered' ? delivery.deliveredAt : delivery.eta) ?? 0;
}

function byEta(a: Delivery, b: Delivery): number {
  return etaGroup(a) - etaGroup(b) || etaTime(a) - etaTime(b);
}

export function sortDeliveries(list: Delivery[], sort: Sort, lookup: Lookup): Delivery[] {
  const direction = sort.dir === 'asc' ? 1 : -1;
  const text = (a: string, b: string) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
  const compare = (a: Delivery, b: Delivery): number => {
    switch (sort.key) {
      case 'id': return text(a.id, b.id);
      case 'customer': return text(a.customer, b.customer);
      case 'zone': return text(lookup.zones.get(a.zoneId)?.name ?? '', lookup.zones.get(b.zoneId)?.name ?? '') || a.sector - b.sector;
      case 'driver': return text(lookup.drivers.get(a.driverId)?.name ?? '', lookup.drivers.get(b.driverId)?.name ?? '');
      case 'window': return a.windowStart - b.windowStart || a.windowEnd - b.windowEnd;
      case 'eta': return etaTime(a) - etaTime(b);
      case 'volumes': return a.volumes - b.volumes;
      default: return URGENCY[a.status] - URGENCY[b.status] || Number(b.priority) - Number(a.priority);
    }
  };
  const group = (a: Delivery, b: Delivery) => (sort.key === 'eta' ? etaGroup(a) - etaGroup(b) : 0);
  // Ties fall back to the ETA and then the ID, so the order is stable and predictable.
  return [...list].sort((a, b) => group(a, b) || compare(a, b) * direction || byEta(a, b) || text(a.id, b.id));
}

export interface PageSlice<T> { items: T[]; page: number; pages: number; from: number; to: number; total: number }

export function paginate<T>(list: T[], page: number, size = PAGE_SIZE): PageSlice<T> {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  const items = list.slice(start, start + size);
  return { items, page: current, pages, from: total ? start + 1 : 0, to: start + items.length, total };
}

/** Page numbers to show, with null for a gap. */
export function pageWindow(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const result: (number | null)[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) result.push(null);
  for (let index = start; index <= end; index += 1) result.push(index);
  if (end < pages - 1) result.push(null);
  result.push(pages);
  return result;
}

export function statusCounts(list: Delivery[]): Record<Status, number> {
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<Status, number>;
  list.forEach((delivery) => { counts[delivery.status] += 1; });
  return counts;
}

export interface Kpis {
  total: number;
  route: number;
  late: number;
  delivered: number;
  onTime: number;
  series: { total: number[]; route: number[]; late: number[]; delivered: number[]; onTime: number[] };
}

function onTimeRatio(onTime: number, delivered: number, late: number): number {
  return delivered + late ? onTime / (delivered + late) : 1;
}

/** Live values come from statuses; sparklines rebuild the day every 30 minutes from the recorded times. */
export function computeKpis(deliveries: Delivery[], clock: OperationClock): Kpis {
  const counts = statusCounts(deliveries);
  const deliveredOnTime = deliveries.filter((d) => d.status === 'delivered' && d.deliveredAt !== null && d.deliveredAt <= d.windowEnd).length;
  const live = {
    total: deliveries.length,
    route: counts.route,
    late: counts.late,
    delivered: counts.delivered,
    onTime: onTimeRatio(deliveredOnTime, counts.delivered, counts.late),
  };
  const series = { total: [] as number[], route: [] as number[], late: [] as number[], delivered: [] as number[], onTime: [] as number[] };
  for (let t = 7 * 60 - clock.anchor; t < clock.now; t += 30) {
    let created = 0;
    let route = 0;
    let late = 0;
    let delivered = 0;
    let onTime = 0;
    deliveries.forEach((d) => {
      if (d.createdAt <= t) created += 1;
      const done = d.deliveredAt !== null && d.deliveredAt <= t;
      if (done) {
        delivered += 1;
        if (d.deliveredAt! <= d.windowEnd) onTime += 1;
        return;
      }
      if (d.pickedUpAt !== null && d.pickedUpAt <= t && (d.issueAt === null || d.issueAt > t)) route += 1;
      if (d.windowEnd <= t) late += 1;
    });
    series.total.push(created);
    series.route.push(route);
    series.late.push(late);
    series.delivered.push(delivered);
    series.onTime.push(onTimeRatio(onTime, delivered, late));
  }
  (Object.keys(series) as (keyof typeof series)[]).forEach((key) => series[key].push(live[key]));
  return { ...live, series };
}

export interface ExceptionItem { delivery: Delivery; kind: ExceptionKind; openedAt: number; age: number }

export function exceptionQueue(deliveries: Delivery[], clock: OperationClock, kind: ExceptionKind | '' = ''): ExceptionItem[] {
  return deliveries
    .map((delivery) => {
      const itemKind = exceptionKind(delivery);
      if (!itemKind) return null;
      const openedAt = itemKind === 'late' ? delivery.windowEnd : delivery.issueAt ?? clock.now;
      return { delivery, kind: itemKind, openedAt, age: Math.max(1, clock.now - openedAt) };
    })
    .filter((item): item is ExceptionItem => item !== null && (!kind || item.kind === kind))
    .sort((a, b) => Number(b.delivery.priority) - Number(a.delivery.priority) || a.openedAt - b.openedAt || a.delivery.id.localeCompare(b.delivery.id));
}

export interface DriverStats { total: number; done: number; open: number; route: number; late: number; issues: number; awaiting: number }

export function driverStats(drivers: Driver[], deliveries: Delivery[]): Map<string, DriverStats> {
  const stats = new Map<string, DriverStats>(drivers.map((driver) => [driver.id, { total: 0, done: 0, open: 0, route: 0, late: 0, issues: 0, awaiting: 0 }]));
  deliveries.forEach((delivery) => {
    const entry = stats.get(delivery.driverId);
    if (!entry) return;
    entry.total += 1;
    if (delivery.status === 'delivered') entry.done += 1;
    else entry.open += 1;
    if (delivery.status === 'route') entry.route += 1;
    if (delivery.status === 'late') entry.late += 1;
    if (delivery.status === 'issue') entry.issues += 1;
    if (delivery.status === 'awaiting') entry.awaiting += 1;
  });
  return stats;
}

export type Attention = 'ok' | 'late' | 'issue';

export function attentionOf(stats: DriverStats | undefined): Attention {
  if (!stats) return 'ok';
  if (stats.issues) return 'issue';
  if (stats.late) return 'late';
  return 'ok';
}
