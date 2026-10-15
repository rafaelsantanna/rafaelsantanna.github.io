// Business rules for the generated operating day, the delivery list queries and the search scoring.
// Run with: node --test src/components/demos/logistics-control/lib/logic.test.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DAY_SEED, DELIVERY_COUNT, generateDay } from './generate.ts';
import { distanceToRiver, MAP, RIVER_HALF_WIDTH } from './geometry.ts';
import { ISSUE_TYPES, URGENCY, type Delivery, type Status } from './model.ts';
import { createLookup, EMPTY_FILTERS, filterDeliveries, hasActiveFilters, PAGE_SIZE, pageWindow, paginate, sortDeliveries, statusCounts, type Filters } from './query.ts';
import { int, mulberry32 } from './random.ts';
import { normalize, score } from './search.ts';

const day = generateDay();
const deliveries = day.deliveries;
const lookup = createLookup(day);
const ids = (list: Delivery[]) => list.map((delivery) => delivery.id);
const filter = (patch: Partial<Filters>) => filterDeliveries(deliveries, { ...EMPTY_FILTERS, ...patch }, lookup);
/** Search options used by the command palette for deliveries: literal, word prefixes only. */
const literal = { fuzzy: false, infix: false };
const label = (delivery: Delivery) => `${delivery.id} ${delivery.customer}`;

describe('generated operating day', () => {
  it('is identical for the same seed and the default seed is DAY_SEED', () => {
    assert.deepEqual(generateDay(), generateDay(DAY_SEED));
    assert.deepEqual(generateDay(42), generateDay(42));
  });

  it('changes with a different seed', () => {
    assert.notDeepEqual(ids(generateDay(1).deliveries), ids(deliveries));
  });

  it('has the realistic status mix: mostly delivered or on route, about 8% late and 4% with issues', () => {
    assert.equal(deliveries.length, DELIVERY_COUNT);
    assert.deepEqual(statusCounts(deliveries), { route: 72, late: 19, issue: 10, delivered: 113, awaiting: 26 });
    const share = (status: Status) => statusCounts(deliveries)[status] / deliveries.length;
    assert.ok(share('delivered') + share('route') > 0.75);
    assert.ok(Math.abs(share('late') - 0.08) < 0.01);
    assert.ok(Math.abs(share('issue') - 0.04) < 0.01);
  });

  it('uses unique TRJ IDs kept in ascending order', () => {
    assert.equal(new Set(ids(deliveries)).size, deliveries.length);
    for (const id of ids(deliveries)) assert.match(id, /^TRJ-\d{5}$/);
    assert.deepEqual(ids(deliveries), [...ids(deliveries)].sort());
  });

  it('assigns each delivery to a driver of its own zone and sector, with a balanced load', () => {
    const drivers = new Map(day.drivers.map((driver) => [driver.id, driver]));
    for (const zone of day.zones) assert.equal(day.drivers.filter((driver) => driver.zoneId === zone.id).length, zone.sectors, zone.id);
    for (const delivery of deliveries) {
      const driver = drivers.get(delivery.driverId);
      assert.ok(driver, `${delivery.id}: unknown driver`);
      assert.equal(driver.zoneId, delivery.zoneId, delivery.id);
      assert.equal(driver.sector, delivery.sector, delivery.id);
    }
    for (const driver of day.drivers) {
      const load = deliveries.filter((delivery) => delivery.driverId === driver.id).length;
      assert.ok(load >= 12 && load <= 22, `${driver.name} has ${load} deliveries`);
    }
  });

  it('keeps every status consistent with any "now" in the first half hour after the anchor', () => {
    for (const d of deliveries) {
      assert.ok(d.windowEnd > d.windowStart, `${d.id}: empty window`);
      assert.ok(d.pickedUpAt === null || d.createdAt < d.pickedUpAt, `${d.id}: picked up before creation`);
      assert.equal(d.issue !== null, d.status === 'issue', `${d.id}: issue type on status ${d.status}`);
      switch (d.status) {
        case 'delivered':
          assert.ok(d.deliveredAt !== null && d.deliveredAt <= -5 && d.eta === null, d.id);
          break;
        case 'late':
          assert.ok(d.windowEnd <= 0 && d.eta !== null && d.eta >= 30 && d.deliveredAt === null, d.id);
          break;
        case 'route':
          assert.ok(d.pickedUpAt !== null && d.eta !== null && d.eta >= 30 && d.eta <= d.windowEnd, d.id);
          break;
        case 'awaiting':
          assert.ok(d.pickedUpAt === null && d.windowStart >= 30 && d.attempts === 0, d.id);
          break;
        case 'issue':
          assert.ok(d.issue !== null && ISSUE_TYPES.includes(d.issue) && d.issueAt !== null && d.issueAt < 0 && d.eta === null, d.id);
          break;
      }
    }
  });

  it('writes a chronological history that starts with creation and ends with the outcome', () => {
    for (const d of deliveries) {
      assert.equal(d.log[0].kind, 'created', d.id);
      d.log.forEach((entry, index) => assert.ok(index === 0 || d.log[index - 1].at <= entry.at, `${d.id}: log out of order`));
      if (d.status === 'delivered') assert.deepEqual(d.log.at(-1), { kind: 'delivered', at: d.deliveredAt });
      if (d.status === 'late') assert.ok(d.log.some((entry) => entry.kind === 'windowClosed' && entry.at === d.windowEnd), d.id);
      if (d.status === 'issue') assert.ok(d.log.some((entry) => entry.kind === 'issue' && entry.issue === d.issue), d.id);
    }
  });

  it('places stops inside the map and off the river', () => {
    for (const { id, point } of deliveries) {
      assert.ok(point.x > 26 && point.x < MAP.width - 26 && point.y > 26 && point.y < MAP.height - 26, `${id}: outside the map`);
      assert.ok(distanceToRiver(point) > RIVER_HALF_WIDTH + 16, `${id}: on the river`);
    }
  });

  it('draws random integers within inclusive bounds', () => {
    const rng = mulberry32(7);
    const seen = new Set(Array.from({ length: 200 }, () => int(rng, 3, 5)));
    assert.deepEqual([...seen].sort(), [3, 4, 5]);
  });
});

describe('delivery filters', () => {
  it('returns everything without filters and treats a blank query as inactive', () => {
    assert.equal(filter({}).length, deliveries.length);
    assert.equal(filter({ query: '   ' }).length, deliveries.length);
    assert.equal(hasActiveFilters({ ...EMPTY_FILTERS, query: '   ' }), false);
    assert.equal(hasActiveFilters({ ...EMPTY_FILTERS, statuses: ['late'] }), true);
    assert.equal(hasActiveFilters({ ...EMPTY_FILTERS, driver: 'd01' }), true);
  });

  it('matches any of the selected statuses', () => {
    const result = filter({ statuses: ['late', 'issue'] });
    assert.equal(result.length, 29);
    assert.ok(result.every((d) => d.status === 'late' || d.status === 'issue'));
  });

  it('combines status, zone and driver filters as an intersection', () => {
    const byStatus = new Set(ids(filter({ statuses: ['route', 'late'] })));
    const byZone = new Set(ids(filter({ zone: 'centro' })));
    const combined = filter({ statuses: ['route', 'late'], zone: 'centro' });
    assert.ok(combined.length > 0);
    assert.deepEqual(ids(combined), ids(deliveries).filter((id) => byStatus.has(id) && byZone.has(id)));
    assert.equal(filter({ zone: 'centro', driver: 'd01' }).length, 0, 'd01 drives in Alto da Serra');
  });

  it('requires every query word, across ID, customer, zone and driver, ignoring accents and case', () => {
    const fabio = deliveries.filter((d) => d.driverId === 'd06');
    assert.deepEqual(ids(filter({ query: 'FÁBIO' })), ids(fabio));
    assert.deepEqual(ids(filter({ query: 'fabio vila nova' })), ids(fabio));
    assert.deepEqual(ids(filter({ query: 'fabio centro' })), []);
    assert.deepEqual(ids(filter({ query: 'trj-49000' })), ['TRJ-49000']);
  });
});

describe('delivery sorting', () => {
  it('defaults to urgency (issue, late, route, awaiting, delivered) with priority first in each status', () => {
    const sorted = sortDeliveries(deliveries, { key: 'status', dir: 'asc' }, lookup);
    sorted.forEach((d, index) => {
      if (index === 0) return;
      const previous = sorted[index - 1];
      assert.ok(URGENCY[previous.status] <= URGENCY[d.status], `${d.id} before ${previous.id}`);
      if (previous.status === d.status) assert.ok(previous.priority || !d.priority, `${d.id}: priority after a regular delivery`);
    });
  });

  it('is deterministic, does not mutate its input and falls back to the ID on ties', () => {
    const input = [...deliveries].reverse();
    const before = ids(input);
    const sorted = sortDeliveries(input, { key: 'volumes', dir: 'asc' }, lookup);
    assert.deepEqual(ids(input), before);
    assert.deepEqual(ids(sortDeliveries(deliveries, { key: 'volumes', dir: 'asc' }, lookup)), ids(sorted));
    const ones = sorted.filter((d) => d.volumes === 1 && d.status === 'delivered');
    assert.ok(ones.length > 1);
    // Same volumes: completed deliveries fall back to the delivery time, then to the ID.
    ones.forEach((d, index) => {
      if (index === 0) return;
      const previous = ones[index - 1];
      assert.ok(previous.deliveredAt! < d.deliveredAt! || (previous.deliveredAt === d.deliveredAt && previous.id < d.id), d.id);
    });
  });

  it('sorts accented driver names by their base letter (Fabio between Elisa and Gisele)', () => {
    const names = sortDeliveries(deliveries, { key: 'driver', dir: 'asc' }, lookup).map((d) => lookup.drivers.get(d.driverId)!.name);
    const order = [...new Set(names)];
    assert.deepEqual(order.slice(4, 7), ['Elisa R.', 'Fábio L.', 'Gisele N.']);
    const descending = [...new Set(sortDeliveries(deliveries, { key: 'driver', dir: 'desc' }, lookup).map((d) => lookup.drivers.get(d.driverId)!.name))];
    assert.deepEqual(descending, [...order].reverse());
  });

  it('keeps ETA groups in place in both directions: projected arrivals, then issues, then completed', () => {
    const group = (d: Delivery) => (d.status === 'delivered' ? 2 : d.eta === null ? 1 : 0);
    for (const dir of ['asc', 'desc'] as const) {
      const sorted = sortDeliveries(deliveries, { key: 'eta', dir }, lookup);
      const groups = sorted.map(group);
      assert.deepEqual(groups, [...groups].sort(), `${dir}: groups out of place`);
      const etas = sorted.filter((d) => group(d) === 0).map((d) => d.eta!);
      assert.deepEqual(etas, [...etas].sort((a, b) => (dir === 'asc' ? a - b : b - a)), `${dir}: ETA order`);
    }
  });
});

describe('pagination', () => {
  it('splits 240 deliveries into 10 pages with 1-based inclusive ranges', () => {
    const first = paginate(deliveries, 1);
    assert.deepEqual({ ...first, items: first.items.length }, { items: PAGE_SIZE, page: 1, pages: 10, from: 1, to: 25, total: 240 });
    const last = paginate(deliveries, 10);
    assert.deepEqual({ ...last, items: last.items.length }, { items: 15, page: 10, pages: 10, from: 226, to: 240, total: 240 });
    assert.deepEqual(ids(paginate(deliveries, 2).items), ids(deliveries.slice(25, 50)));
  });

  it('clamps out-of-range pages and reports an empty list as one page with no range', () => {
    assert.equal(paginate(deliveries, 0).page, 1);
    assert.equal(paginate(deliveries, -3).page, 1);
    assert.equal(paginate(deliveries, 99).page, 10);
    assert.deepEqual(paginate([], 4), { items: [], page: 1, pages: 1, from: 0, to: 0, total: 0 });
  });

  it('shows every page up to seven and gaps around the current page beyond that', () => {
    assert.deepEqual(pageWindow(1, 1), [1]);
    assert.deepEqual(pageWindow(4, 7), [1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(pageWindow(1, 10), [1, 2, null, 10]);
    assert.deepEqual(pageWindow(3, 10), [1, 2, 3, 4, null, 10]);
    assert.deepEqual(pageWindow(5, 10), [1, null, 4, 5, 6, null, 10]);
    assert.deepEqual(pageWindow(10, 10), [1, null, 9, 10]);
  });
});

describe('search scoring', () => {
  it('normalizes accents, case and surrounding spaces', () => {
    assert.equal(normalize('  Farmácia ÓTICA  '), 'farmacia otica');
  });

  it('matches customer words by prefix only, so "late" does not find "Pilates"', () => {
    assert.equal(score('late', 'TRJ-48733 Studio Eixo Pilates', [], literal), 0);
    assert.ok(score('pila', 'TRJ-48733 Studio Eixo Pilates', [], literal) > 0);
    assert.equal(deliveries.filter((d) => score('late', label(d), [], literal) > 0).length, 0);
    // Without the palette options, words may also match inside other words.
    assert.ok(score('late', 'Studio Eixo Pilates') > 0);
  });

  it('matches delivery numbers anywhere in the ID, also as typed with the prefix', () => {
    assert.ok(score('9008', 'TRJ-49008 Café Serrano', [], literal) > 0);
    assert.deepEqual(ids(deliveries.filter((d) => score('9000', label(d), [], literal) > 0)), ['TRJ-49000']);
    assert.ok(score('TRJ-49000', 'TRJ-49000 Colchões Sono Bom', [], literal) > score('49000', 'TRJ-49000 Colchões Sono Bom', [], literal));
  });

  it('requires every query word and ranks a prefix above a substring', () => {
    assert.equal(score('farmacia xyz', 'Farmácia Vida Plena'), 0);
    assert.ok(score('vida', 'Farmácia Vida Plena') > score('ida', 'Farmácia Vida Plena'));
    assert.equal(score('', 'anything'), 1);
    assert.equal(score('--', 'anything'), 0);
  });

  it('tolerates one typo in words only when fuzzy, never in numbers or a changed first letter', () => {
    assert.ok(score('farmcia', 'Farmácia Vida Plena') > 0);
    assert.equal(score('farmcia', 'Farmácia Vida Plena', [], { fuzzy: false }), 0);
    assert.equal(score('49009', 'TRJ-49008 Café Serrano'), 0);
    assert.equal(score('atra', 'Papelaria Traço Firme'), 0);
  });
});
