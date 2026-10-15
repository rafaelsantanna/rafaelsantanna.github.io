/** Computes every derived view from the single state. Used by the server render and by the client. */
import type { OperationClock } from './clock';
import { computeKpis, driverStats, exceptionQueue, filterDeliveries, paginate, sortDeliveries, statusCounts, type Lookup } from './query';
import type { Driver } from './model';
import type { State } from './store';

export function derive(state: State, clock: OperationClock, drivers: Driver[], lookup: Lookup) {
  const { deliveries, ui } = state;
  const filtered = sortDeliveries(filterDeliveries(deliveries, ui.filters, lookup), ui.sort, lookup);
  return {
    filtered,
    slice: paginate(filtered, ui.page),
    facets: statusCounts(filterDeliveries(deliveries, { ...ui.filters, statuses: [] }, lookup)),
    kpis: computeKpis(deliveries, clock),
    queue: exceptionQueue(deliveries, clock),
    queueFiltered: exceptionQueue(deliveries, clock, ui.queueKind),
    stats: driverStats(drivers, deliveries),
  };
}

export type Derived = ReturnType<typeof derive>;
