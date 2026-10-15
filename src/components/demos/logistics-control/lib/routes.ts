import { orderLoop, pathData, sample, spline, type SampledPath } from './geometry';
import type { Delivery, Driver, Hub, Point, Status } from './model';

export interface RouteStop { id: string; point: Point; status: Status }

export interface RouteGeometry {
  driverId: string;
  hub: Point;
  d: string;
  path: SampledPath;
  stops: RouteStop[];
  /** Arc length where the vehicle starts, proportional to the work already done. */
  start: number;
}

/** One closed loop per driver: leaves the hub, visits every stop already dispatched, returns to the hub. */
export function buildRoutes(drivers: Driver[], hubs: Hub[], deliveries: Delivery[]): RouteGeometry[] {
  const hubPoint = new Map(hubs.map((hub) => [hub.id, hub.point]));
  return drivers.map((driver) => {
    const hub = hubPoint.get(driver.hubId) ?? { x: 0, y: 0 };
    const stops: RouteStop[] = deliveries
      .filter((delivery) => delivery.driverId === driver.id && delivery.status !== 'awaiting')
      .map((delivery) => ({ id: delivery.id, point: delivery.point, status: delivery.status }));
    if (!stops.length) return { driverId: driver.id, hub, d: '', path: { points: [hub], lengths: [0], total: 0 }, stops, start: 0 };
    const segments = spline(orderLoop(hub, stops.map((stop) => stop.point)), true);
    const path = sample(segments);
    const done = stops.filter((stop) => stop.status === 'delivered').length / stops.length;
    return { driverId: driver.id, hub, d: pathData(segments, true), path, stops, start: path.total * done };
  });
}
