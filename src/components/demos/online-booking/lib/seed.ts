import type { Appointment } from '../data/model';
import type { DayFrame, Schedule } from './availability';

const clients = [
  'Marcos A.', 'Thiago L.', 'Bruno S.', 'Felipe R.', 'Gustavo M.', 'Leandro C.', 'André P.', 'Vinícius T.',
  'Paulo H.', 'Renato D.', 'Eduardo F.', 'Igor B.', 'Henrique V.', 'Matheus O.', 'Samuel K.', 'Otávio N.',
  'Lucas G.', 'Diego J.', 'César Q.', 'Fábio E.', 'Rodrigo Z.', 'Wesley U.', 'Júlio I.', 'Murilo X.',
];

const visits: ReadonlyArray<{ serviceIds: string[]; weight: number }> = [
  { serviceIds: ['corte'], weight: 32 },
  { serviceIds: ['corte-barba'], weight: 22 },
  { serviceIds: ['barba'], weight: 13 },
  { serviceIds: ['pezinho'], weight: 9 },
  { serviceIds: ['barba', 'hidratacao'], weight: 8 },
  { serviceIds: ['corte', 'sobrancelha'], weight: 7 },
  { serviceIds: ['hidratacao'], weight: 5 },
  { serviceIds: ['sobrancelha'], weight: 4 },
];

/** Chance of booking the next slot back to back, by weekday: Saturdays fill up first. */
const busyness = [0, 0, 0.55, 0.6, 0.64, 0.7, 0.78];
const gaps = [60, 75, 90, 105, 120, 150];

function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

const ceilTo = (value: number, step: number): number => Math.ceil(value / step) * step;

/** The day's client list, shuffled once per day so names do not repeat across chairs. */
function clientsFor(day: string): string[] {
  const next = random(hash(day));
  const list = [...clients];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const other = Math.floor(next() * (index + 1));
    [list[index], list[other]] = [list[other], list[index]];
  }
  return list;
}

/**
 * Fictional appointments already on a barber's book for a day. Deterministic for a given
 * day and barber, so the booking flow and the shop schedule always agree. The chair is
 * the barber's position in the team, used to give each chair its own clients.
 */
export function seedAppointments(frame: DayFrame, barber: Schedule, chair: number, durationOf: (serviceId: string) => number, buffer: number, step: number): Appointment[] {
  const { hours } = frame;
  if (!hours || !barber.days.includes(frame.weekday)) return [];
  const next = random(hash(`${frame.day}:${barber.id}`));
  const names = clientsFor(frame.day);
  const totalWeight = visits.reduce((sum, visit) => sum + visit.weight, 0);
  const pickVisit = () => {
    let roll = next() * totalWeight;
    return visits.find((visit) => (roll -= visit.weight) < 0) ?? visits[0];
  };
  const appointments: Appointment[] = [];
  let start = hours.start;
  while (start < hours.end) {
    if (next() >= busyness[frame.weekday]) start = ceilTo(start + gaps[Math.floor(next() * gaps.length)], step);
    const visit = pickVisit();
    const duration = visit.serviceIds.reduce((sum, id) => sum + durationOf(id), 0);
    const end = start + duration;
    const pause = barber.breaks.find((item) => start < item.end && end > item.start);
    if (pause) {
      start = pause.end;
      continue;
    }
    if (end > hours.end) break;
    appointments.push({
      id: `seed-${frame.day}-${barber.id}-${start}`,
      barberId: barber.id,
      day: frame.day,
      start,
      end,
      serviceIds: visit.serviceIds,
      client: names[(chair * 8 + appointments.length) % names.length],
      own: false,
    });
    start = ceilTo(end + buffer, step);
  }
  return appointments;
}
