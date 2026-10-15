import type { Point } from './model';
import { mulberry32 } from './random.ts';

/** Schematic map canvas in SVG user units. */
export const MAP = { width: 1000, height: 600 } as const;

/** River centerline, west to east. */
export const RIVER: Point[] = [
  { x: -40, y: 222 }, { x: 110, y: 240 }, { x: 240, y: 296 }, { x: 380, y: 318 },
  { x: 520, y: 292 }, { x: 650, y: 262 }, { x: 790, y: 296 }, { x: 905, y: 350 }, { x: 1040, y: 366 },
];
export const RIVER_HALF_WIDTH = 17;

export interface Block { x: number; y: number; w: number; h: number; park: boolean }
export interface Segment { from: Point; c1: Point; c2: Point; to: Point }
export interface SampledPath { points: Point[]; lengths: number[]; total: number }

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function distanceToRiver(p: Point): number {
  let best = Infinity;
  for (let index = 0; index < RIVER.length - 1; index += 1) {
    best = Math.min(best, distanceToSegment(p, RIVER[index], RIVER[index + 1]));
  }
  return best;
}

/** Catmull-Rom spline through the points, as cubic Bezier segments. */
export function spline(points: Point[], closed: boolean): Segment[] {
  const count = points.length;
  if (count < 2) return [];
  const at = (index: number): Point => {
    if (closed) return points[(index + count) % count];
    return points[Math.max(0, Math.min(count - 1, index))];
  };
  const segments: Segment[] = [];
  const last = closed ? count : count - 1;
  for (let index = 0; index < last; index += 1) {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);
    segments.push({
      from: p1,
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      to: p2,
    });
  }
  return segments;
}

const round = (value: number) => Math.round(value * 10) / 10;

export function pathData(segments: Segment[], closed: boolean): string {
  if (!segments.length) return '';
  const start = segments[0].from;
  const body = segments
    .map((segment) => `C${round(segment.c1.x)} ${round(segment.c1.y)} ${round(segment.c2.x)} ${round(segment.c2.y)} ${round(segment.to.x)} ${round(segment.to.y)}`)
    .join('');
  return `M${round(start.x)} ${round(start.y)}${body}${closed ? 'Z' : ''}`;
}

function bezierPoint(segment: Segment, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * segment.from.x + b * segment.c1.x + c * segment.c2.x + d * segment.to.x,
    y: a * segment.from.y + b * segment.c1.y + c * segment.c2.y + d * segment.to.y,
  };
}

/** Samples Bezier segments into a polyline with cumulative lengths, so markers sit exactly on the drawn curve. */
export function sample(segments: Segment[], steps = 14): SampledPath {
  const points: Point[] = [];
  segments.forEach((segment, index) => {
    for (let step = index === 0 ? 0 : 1; step <= steps; step += 1) points.push(bezierPoint(segment, step / steps));
  });
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) lengths.push(lengths[index - 1] + distance(points[index - 1], points[index]));
  return { points, lengths, total: lengths[lengths.length - 1] ?? 0 };
}

/** Position along a sampled path at arc length `s` (wraps around). */
export function pointAt(path: SampledPath, s: number): Point {
  if (!path.points.length) return { x: 0, y: 0 };
  if (path.total === 0) return path.points[0];
  const target = ((s % path.total) + path.total) % path.total;
  let low = 0;
  let high = path.lengths.length - 1;
  while (low < high - 1) {
    const middle = (low + high) >> 1;
    if (path.lengths[middle] <= target) low = middle;
    else high = middle;
  }
  const span = path.lengths[high] - path.lengths[low] || 1;
  const t = (target - path.lengths[low]) / span;
  const a = path.points[low];
  const b = path.points[high];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Orders stops as a closed loop that starts at the hub: nearest neighbour, then a 2-opt pass to remove crossings. */
export function orderLoop(hub: Point, stops: Point[]): Point[] {
  const remaining = [...stops];
  const tour: Point[] = [hub];
  let current = hub;
  while (remaining.length) {
    let bestIndex = 0;
    for (let index = 1; index < remaining.length; index += 1) {
      if (distance(current, remaining[index]) < distance(current, remaining[bestIndex])) bestIndex = index;
    }
    current = remaining.splice(bestIndex, 1)[0];
    tour.push(current);
  }
  const count = tour.length;
  let improved = true;
  let guard = 0;
  while (improved && guard < 30) {
    improved = false;
    guard += 1;
    for (let i = 1; i < count - 1; i += 1) {
      for (let k = i + 1; k < count; k += 1) {
        const a = tour[i - 1];
        const b = tour[i];
        const c = tour[k];
        const d = tour[(k + 1) % count];
        if (distance(a, c) + distance(b, d) + 0.01 < distance(a, b) + distance(c, d)) {
          const reversed = tour.slice(i, k + 1).reverse();
          tour.splice(i, reversed.length, ...reversed);
          improved = true;
        }
      }
    }
  }
  return tour;
}

/** Decorative city blocks on a jittered street grid, skipping the river corridor. */
export function cityBlocks(): Block[] {
  const rng = mulberry32(0x5eed);
  const columns: number[] = [];
  for (let x = -10; x < MAP.width + 10; x += 42 + Math.floor(rng() * 34)) columns.push(x);
  const rows: number[] = [];
  for (let y = -6; y < MAP.height + 10; y += 34 + Math.floor(rng() * 26)) rows.push(y);
  const blocks: Block[] = [];
  for (let r = 0; r < rows.length - 1; r += 1) {
    for (let c = 0; c < columns.length - 1; c += 1) {
      const avenueX = c % 5 === 2 ? 5 : 0;
      const avenueY = r % 4 === 1 ? 4 : 0;
      const inset = 4 + rng() * 2;
      const x = columns[c] + inset + avenueX;
      const y = rows[r] + inset + avenueY;
      const w = columns[c + 1] - columns[c] - inset * 2 - avenueX;
      const h = rows[r + 1] - rows[r] - inset * 2 - avenueY;
      if (w < 12 || h < 10) continue;
      const corners = [{ x, y }, { x: x + w, y }, { x, y: y + h }, { x: x + w, y: y + h }, { x: x + w / 2, y: y + h / 2 }];
      if (corners.some((corner) => distanceToRiver(corner) < RIVER_HALF_WIDTH + 9)) continue;
      blocks.push({ x: round(x), y: round(y), w: round(w), h: round(h), park: rng() < 0.06 });
    }
  }
  return blocks;
}
