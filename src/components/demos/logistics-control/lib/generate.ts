import { distanceToRiver, MAP, RIVER_HALF_WIDTH } from './geometry.ts';
import type { Delivery, Driver, Hub, HubId, IssueType, LogEntry, OperatingDay, Point, Status, VehicleType, Zone } from './model';
import { int, mulberry32, pick, shuffle, weighted, type Rng } from './random.ts';

/** Fixed seed: every visit sees the same operating day. */
export const DAY_SEED = 0x7a3c2026;
export const DELIVERY_COUNT = 240;

const ZONE_SPECS: { id: string; name: string; center: Point; hubId: HubId; drivers: number }[] = [
  { id: 'serra', name: 'Alto da Serra', center: { x: 150, y: 112 }, hubId: 'north', drivers: 2 },
  { id: 'jardins', name: 'Jardins', center: { x: 478, y: 130 }, hubId: 'north', drivers: 3 },
  { id: 'vila-nova', name: 'Vila Nova', center: { x: 832, y: 142 }, hubId: 'east', drivers: 2 },
  { id: 'ribeira', name: 'Ribeira', center: { x: 176, y: 456 }, hubId: 'west', drivers: 2 },
  { id: 'centro', name: 'Centro', center: { x: 486, y: 462 }, hubId: 'south', drivers: 3 },
  { id: 'lagoa', name: 'Lagoa', center: { x: 836, y: 486 }, hubId: 'south', drivers: 2 },
];

const HUBS: Hub[] = [
  { id: 'north', point: { x: 318, y: 186 } },
  { id: 'east', point: { x: 666, y: 150 } },
  { id: 'west', point: { x: 62, y: 352 } },
  { id: 'south', point: { x: 664, y: 408 } },
];

const DRIVER_SPECS: [string, VehicleType][] = [
  ['Ana P.', 'van'], ['Bruno T.', 'van'], ['Carla M.', 'motorcycle'], ['Diego S.', 'van'], ['Elisa R.', 'truck'],
  ['Fábio L.', 'van'], ['Gisele N.', 'motorcycle'], ['Heitor B.', 'van'], ['Iara C.', 'van'], ['Jonas F.', 'truck'],
  ['Karina D.', 'van'], ['Lucas V.', 'motorcycle'], ['Marta G.', 'van'], ['Nilo A.', 'van'],
];

/** Invented company names. Any resemblance to a real business is unintended. */
const CUSTOMERS = [
  'Mercearia Bom Grão', 'Farmácia Vida Plena', 'Ateliê Linha Fina', 'Papelaria Traço Firme', 'Café Serrano',
  'Empório Ramos & Filhos', 'Clínica Sorriso Leve', 'Livraria Capítulo Nove', 'Oficina Engrenagem', 'Floricultura Lírio Azul',
  'Studio Eixo Pilates', 'Padaria Trigo Dourado', 'Ótica Foco Certo', 'Bicicletaria Pedal Leve', 'Pet Shop Focinho',
  'Distribuidora Ponto Azul', 'Laticínios Serra Verde', 'Armazém Dona Cida', 'Tecidos Fio de Ouro', 'Gráfica Prova Final',
  'Restaurante Panela de Barro', 'Açougue Corte Nobre', 'Hortifrúti Colheita', 'Casa & Cia Utilidades', 'Brinquedos Pião',
  'Barbearia Navalha', 'Contábil Balanço', 'Vidraçaria Cristal', 'Materiais Alicerce', 'Doceria Açúcar Mascavo',
  'Sorveteria Polo Sul', 'Eletrônica Circuito', 'Calçados Passo Firme', 'Perfumaria Essência', 'Lavanderia Bolha',
  'Academia Ritmo', 'Cervejaria Lúpulo Bravo', 'Copiadora Duplex', 'Agropecuária Campo Bom', 'Moda Infantil Ciranda',
  'Instrumentos Sol Maior', 'Cozinha Fogão a Lenha', 'Laboratório Gota', 'Colchões Sono Bom', 'Tapeçaria Trama',
  'Marmoraria Veio', 'Bazar Miudezas', 'Quitanda da Vila',
];

/** Target share per status: most on route or delivered, about 8% late and 4% with issues. */
const STATUS_COUNTS: Record<Status, number> = { delivered: 113, route: 72, awaiting: 26, late: 19, issue: 10 };
const ISSUE_WEIGHTS: Record<IssueType, number> = { absent: 40, access: 20, refused: 15, damaged: 15, address: 10 };

function initials(name: string): string {
  const [first, last] = name.split(' ');
  return `${first[0]}${(last ?? '')[0] ?? ''}`.toUpperCase();
}

/** Outline of a driver's sector (a ring segment around the zone centre) that stops are spread along. */
function sectorOutline(zone: Zone, sector: number): Point[] {
  const span = (Math.PI * 2) / zone.sectors;
  const from = zone.rotation + (sector - 1) * span + 0.16;
  const to = from + span - 0.32;
  const at = (angle: number, radius: number) => ({ x: zone.center.x + Math.cos(angle) * radius, y: zone.center.y + Math.sin(angle) * radius * 0.8 });
  const steps = 10;
  const outer = Array.from({ length: steps + 1 }, (_, index) => at(from + ((to - from) * index) / steps, 112));
  const inner = Array.from({ length: steps + 1 }, (_, index) => at(to - ((to - from) * index) / steps, 50));
  return [...outer, ...inner];
}

function placeInSector(rng: Rng, outline: Point[]): Point {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const index = Math.floor(rng() * outline.length);
    const a = outline[index];
    const b = outline[(index + 1) % outline.length];
    const t = rng();
    const point = { x: a.x + (b.x - a.x) * t + (rng() - 0.5) * 14, y: a.y + (b.y - a.y) * t + (rng() - 0.5) * 14 };
    const inside = point.x > 26 && point.x < MAP.width - 26 && point.y > 26 && point.y < MAP.height - 26;
    if (inside && distanceToRiver(point) > RIVER_HALF_WIDTH + 16) return { x: Math.round(point.x), y: Math.round(point.y) };
  }
  return { x: Math.round(outline[0].x), y: Math.round(outline[0].y) };
}

function driverCounts(rng: Rng, drivers: number): number[] {
  const counts = Array.from({ length: drivers }, () => int(rng, 14, 20));
  let total = counts.reduce((sum, count) => sum + count, 0);
  while (total !== DELIVERY_COUNT) {
    const index = int(rng, 0, drivers - 1);
    const step = total < DELIVERY_COUNT ? 1 : -1;
    if (counts[index] + step < 12 || counts[index] + step > 22) continue;
    counts[index] += step;
    total += step;
  }
  return counts;
}

type Timing = Pick<Delivery, 'windowStart' | 'windowEnd' | 'eta' | 'deliveredAt' | 'issueAt' | 'pickedUpAt' | 'createdAt' | 'attempts' | 'issue'>;

/** Operation events that happened before the visitor arrived. */
function history(time: Timing, status: Status, hub: HubId): LogEntry[] {
  const log: LogEntry[] = [{ kind: 'created', at: time.createdAt }];
  if (time.pickedUpAt !== null) log.push({ kind: 'pickedUp', at: time.pickedUpAt, hub });
  const failed = status === 'delivered' ? time.attempts - 1 : status === 'issue' ? time.attempts - 1 : time.attempts;
  const start = time.pickedUpAt ?? 0;
  const end = time.deliveredAt ?? time.issueAt ?? 0;
  for (let attempt = 1; attempt <= failed; attempt += 1) log.push({ kind: 'attemptFailed', at: Math.round(start + ((end - start) * attempt) / (failed + 1)) });
  if (status === 'late') log.push({ kind: 'windowClosed', at: time.windowEnd });
  if (status === 'issue' && time.issueAt !== null && time.issue) log.push({ kind: 'issue', at: time.issueAt, issue: time.issue });
  if (time.deliveredAt !== null) log.push({ kind: 'delivered', at: time.deliveredAt });
  return log.sort((a, b) => a.at - b.at);
}

/** Times relative to the anchor. "Now" is somewhere in [0, 30), so every rule keeps a margin of half an hour. */
function timing(rng: Rng, status: Status): Timing {
  const length = pick(rng, [120, 180]);
  switch (status) {
    case 'delivered': {
      const windowStart = -30 * int(rng, 3, 8);
      const windowEnd = windowStart + length;
      const lateDelivery = windowEnd <= -10 && rng() < 0.08;
      const deliveredAt = lateDelivery ? Math.min(-5, windowEnd + int(rng, 5, 35)) : int(rng, windowStart + 10, Math.min(windowEnd - 5, -5));
      const pickedUpAt = Math.max(-280, deliveredAt - int(rng, 20, 110));
      return { windowStart, windowEnd, eta: null, deliveredAt, issueAt: null, pickedUpAt, createdAt: pickedUpAt - int(rng, 40, 120), attempts: rng() < 0.1 ? 2 : 1, issue: null };
    }
    case 'route': {
      const windowStart = 30 * int(rng, -1, 1);
      const windowEnd = windowStart + length;
      const pickedUpAt = -int(rng, 20, 140);
      return { windowStart, windowEnd, eta: int(rng, 32, windowEnd - 8), deliveredAt: null, issueAt: null, pickedUpAt, createdAt: pickedUpAt - int(rng, 40, 150), attempts: rng() < 0.08 ? 1 : 0, issue: null };
    }
    case 'late': {
      const windowEnd = -30 * int(rng, 0, 3);
      const windowStart = windowEnd - length;
      const pickedUpAt = Math.max(-280, windowStart - int(rng, 10, 60));
      return { windowStart, windowEnd, eta: int(rng, 34, 80), deliveredAt: null, issueAt: null, pickedUpAt, createdAt: pickedUpAt - int(rng, 40, 120), attempts: rng() < 0.3 ? 1 : 0, issue: null };
    }
    case 'issue': {
      const windowStart = 30 * int(rng, -4, 0);
      const issue = weighted(rng, ISSUE_WEIGHTS);
      const issueAt = -int(rng, 6, 110);
      const pickedUpAt = issueAt - int(rng, 15, 90);
      const attempts = issue === 'absent' || issue === 'access' ? int(rng, 1, 2) : 1;
      return { windowStart, windowEnd: windowStart + length, eta: null, deliveredAt: null, issueAt, pickedUpAt, createdAt: pickedUpAt - int(rng, 40, 120), attempts, issue };
    }
    default: {
      const windowStart = 30 * int(rng, 2, 5);
      return { windowStart, windowEnd: windowStart + 120, eta: windowStart + int(rng, 15, 80), deliveredAt: null, issueAt: null, pickedUpAt: null, createdAt: -int(rng, 20, 240), attempts: 0, issue: null };
    }
  }
}

export function generateDay(seed = DAY_SEED): OperatingDay {
  const rng = mulberry32(seed);
  const zones: Zone[] = ZONE_SPECS.map((spec) => ({
    id: spec.id, name: spec.name, center: spec.center, hubId: spec.hubId, sectors: spec.drivers, rotation: rng() * Math.PI * 2,
  }));
  const drivers: Driver[] = [];
  let specIndex = 0;
  zones.forEach((zone) => {
    for (let sector = 1; sector <= zone.sectors; sector += 1) {
      const [name, vehicle] = DRIVER_SPECS[specIndex];
      specIndex += 1;
      drivers.push({ id: `d${String(specIndex).padStart(2, '0')}`, name, initials: initials(name), zoneId: zone.id, sector, hubId: zone.hubId, vehicle });
    }
  });

  const statuses = shuffle(rng, (Object.entries(STATUS_COUNTS) as [Status, number][]).flatMap(([status, count]) => Array<Status>(count).fill(status)));
  const counts = driverCounts(rng, drivers.length);
  const deliveries: Delivery[] = [];
  let serial = 48120;
  drivers.forEach((driver, driverIndex) => {
    const zone = zones.find((candidate) => candidate.id === driver.zoneId)!;
    const outline = sectorOutline(zone, driver.sector);
    for (let count = 0; count < counts[driverIndex]; count += 1) {
      const status = statuses[deliveries.length];
      const volumes = 1 + Math.floor(rng() * rng() * 11);
      serial += int(rng, 1, 7);
      const time = timing(rng, status);
      deliveries.push({
        id: `TRJ-${serial}`,
        customer: pick(rng, CUSTOMERS),
        zoneId: zone.id,
        sector: driver.sector,
        driverId: driver.id,
        status,
        priority: rng() < 0.05,
        volumes,
        weightKg: Math.round(volumes * (0.8 + rng() * 5.2) * 10) / 10,
        point: placeInSector(rng, outline),
        log: history(time, status, driver.hubId),
        ...time,
      });
    }
  });
  // Shuffle serials so IDs do not cluster by driver, then keep the list in ID order.
  const serials = shuffle(rng, deliveries.map((delivery) => delivery.id));
  deliveries.forEach((delivery, index) => { delivery.id = serials[index]; });
  deliveries.sort((a, b) => a.id.localeCompare(b.id));
  return { zones, hubs: HUBS, drivers, deliveries };
}
