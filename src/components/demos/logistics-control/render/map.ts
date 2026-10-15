import { cityBlocks, MAP, pathData, pointAt, RIVER, spline } from '../lib/geometry';
import { fill, formatNumber, plural } from '../lib/format';
import { attentionOf, type DriverStats } from '../lib/query';
import type { RouteGeometry } from '../lib/routes';
import type { RenderContext } from './context';
import { esc } from './html';

const BRIDGES = [{ x: 186, angle: 22 }, { x: 452, angle: -8 }, { x: 724, angle: 12 }];

function riverY(x: number): number {
  for (let index = 0; index < RIVER.length - 1; index += 1) {
    const a = RIVER[index];
    const b = RIVER[index + 1];
    if (x >= a.x && x <= b.x) return a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
  }
  return RIVER[0].y;
}

/** Static city layer: blocks, river, bridges, zone names and hubs. Rendered once. */
export function renderMapBase(ctx: RenderContext): string {
  const blocks = cityBlocks()
    .map((block) => `<rect class="${block.park ? 'lc-map__park' : 'lc-map__block'}" x="${block.x}" y="${block.y}" width="${block.w}" height="${block.h}" rx="3"/>`)
    .join('');
  const river = pathData(spline(RIVER, false), false);
  const bridges = BRIDGES.map((bridge) => {
    const y = riverY(bridge.x);
    return `<rect class="lc-map__bridge" x="${bridge.x - 5}" y="${(y - 30).toFixed(1)}" width="10" height="60" rx="2" transform="rotate(${bridge.angle} ${bridge.x} ${y.toFixed(1)})"/>`;
  }).join('');
  const zones = ctx.zones
    .map((zone) => `<text class="lc-map__zone" x="${zone.center.x}" y="${zone.center.y}" text-anchor="middle">${esc(zone.name.toUpperCase())}</text>`)
    .join('');
  const hubs = ctx.hubs
    .map((hub) => {
      const label = ctx.t.hubs[hub.id];
      const below = hub.point.y < 300;
      return `<g class="lc-map__hub" transform="translate(${hub.point.x} ${hub.point.y})"><rect x="-11" y="-11" width="22" height="22" rx="5"/><path d="M-5 4V-1.5L0-5l5 3.5V4M-2 4V0.5h4V4"/><text y="${below ? -18 : 27}" text-anchor="middle">${esc(label)}</text></g>`;
    })
    .join('');
  return `<rect class="lc-map__ground" width="${MAP.width}" height="${MAP.height}"/><g>${blocks}</g><path class="lc-map__bank" d="${river}"/><path class="lc-map__river" d="${river}"/>${bridges}<g class="lc-map__zones">${zones}</g><g class="lc-map__hubs">${hubs}</g>`;
}

function stopMark(stop: RouteGeometry['stops'][number]): string {
  const { x, y } = stop.point;
  if (stop.status === 'issue') return `<path class="lc-stop lc-stop--issue" d="M${x} ${y - 5.5}L${x + 5} ${y + 3.5}H${x - 5}Z"/>`;
  if (stop.status === 'late') return `<circle class="lc-stop lc-stop--late" cx="${x}" cy="${y}" r="4"/>`;
  return `<circle class="lc-stop${stop.status === 'delivered' ? ' lc-stop--done' : ''}" cx="${x}" cy="${y}" r="2.6"/>`;
}

/** Route loops with their stops. Pointer users click a route; keyboard users use the driver list. */
export function renderRoutes(routes: RouteGeometry[], stats: Map<string, DriverStats>, selected: string): string {
  return routes
    .map((route) => {
      const attention = attentionOf(stats.get(route.driverId));
      const classes = `lc-route lc-route--${attention}${selected === route.driverId ? ' is-selected' : ''}`;
      const lines = route.d ? `<path class="lc-route__hit" d="${route.d}"/><path class="lc-route__line" d="${route.d}"/>` : '';
      return `<g class="${classes}" data-driver="${route.driverId}">${lines}${route.stops.map(stopMark).join('')}</g>`;
    })
    .join('');
}

export function vehicleTransform(route: RouteGeometry, s: number): string {
  const point = route.path.total ? pointAt(route.path, s) : route.hub;
  return `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`;
}

export function renderVehicles(routes: RouteGeometry[], stats: Map<string, DriverStats>, ctx: RenderContext, selected: string): string {
  return routes
    .map((route) => {
      const driver = ctx.lookup.drivers.get(route.driverId);
      if (!driver) return '';
      const attention = attentionOf(stats.get(route.driverId));
      const badge = attention === 'issue'
        ? '<path class="lc-vehicle__badge" d="M12 -20L18.5 -8.5H5.5Z"/>'
        : attention === 'late'
          ? '<circle class="lc-vehicle__badge" cx="11.5" cy="-11.5" r="5.6"/>'
          : '';
      return `<g class="lc-vehicle lc-vehicle--${attention}${selected === route.driverId ? ' is-selected' : ''}" data-driver="${route.driverId}" transform="${vehicleTransform(route, route.start)}"><circle class="lc-vehicle__halo" r="19"/><circle class="lc-vehicle__body" r="14.5"/><text class="lc-vehicle__label" y="4.2" text-anchor="middle">${esc(driver.initials)}</text>${badge}</g>`;
    })
    .join('');
}

/** "1 atrasada", "2 ocorrências": only the counts that need attention, with the right plural. */
export function attentionCounts(entry: DriverStats | undefined, ctx: RenderContext): string[] {
  if (!entry) return [];
  const { t, lang } = ctx;
  return [entry.late ? plural(lang, entry.late, t.map.late) : '', entry.issues ? plural(lang, entry.issues, t.map.issues) : ''].filter(Boolean);
}

/** Keyboard and screen reader alternative to clicking the map. */
export function renderDriverChips(stats: Map<string, DriverStats>, ctx: RenderContext, selected: string): string {
  return ctx.drivers
    .map((driver) => {
      const entry = stats.get(driver.id);
      const attention = attentionOf(entry);
      const counts = [fill(ctx.t.map.open, { n: formatNumber(ctx.lang, entry?.open ?? 0) }), ...attentionCounts(entry, ctx)].join(', ');
      const label = fill(ctx.t.map.driverChip, { name: driver.name, counts });
      const mark = attention === 'issue'
        ? '<svg class="lc-chip-driver__mark" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0.8 9.4 8.8H0.6Z"/></svg>'
        : attention === 'late'
          ? '<svg class="lc-chip-driver__mark" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="3.8"/></svg>'
          : '';
      return `<li><button type="button" class="lc-chip-driver lc-chip-driver--${attention}${selected === driver.id ? ' is-selected' : ''}" data-action="driver" data-driver="${driver.id}" data-key="chip-${driver.id}" aria-label="${esc(label)}"><span class="lc-avatar" aria-hidden="true">${esc(driver.initials)}</span><span class="lc-chip-driver__name" aria-hidden="true">${esc(driver.name)}</span><span class="lc-chip-driver__count" aria-hidden="true">${entry?.open ?? 0}</span>${mark}</button></li>`;
    })
    .join('');
}
