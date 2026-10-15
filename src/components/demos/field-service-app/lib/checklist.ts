import type { ItemId, OrderInfo, OrderProgress, OrderType } from './types';
import { parseDecimal } from './text.ts';

export interface ChecklistItem {
  id: ItemId;
  required: boolean;
}

const templates: Record<OrderType, ChecklistItem[]> = {
  install: [
    { id: 'cto', required: true },
    { id: 'splice', required: true },
    { id: 'power', required: true },
    { id: 'speed', required: true },
    { id: 'wifi', required: false },
    { id: 'photo', required: true },
    { id: 'signature', required: true },
  ],
  repair: [
    { id: 'cto', required: true },
    { id: 'splice', required: true },
    { id: 'power', required: true },
    { id: 'speed', required: true },
    { id: 'photo', required: true },
    { id: 'signature', required: true },
  ],
  router: [
    { id: 'cto', required: true },
    { id: 'power', required: true },
    { id: 'speed', required: true },
    { id: 'wifi', required: false },
    { id: 'photo', required: true },
    { id: 'signature', required: true },
  ],
  move: [
    { id: 'cto', required: true },
    { id: 'splice', required: true },
    { id: 'power', required: true },
    { id: 'speed', required: true },
    { id: 'wifi', required: false },
    { id: 'photo', required: true },
    { id: 'signature', required: true },
  ],
};

/** Accepted received optical power for a GPON drop, in dBm. */
export const POWER_RANGE = { min: -27, max: -8 } as const;
/** Minimum share of the contracted plan accepted in the wired speed test. */
const SPEED_MIN_RATIO = 0.8;
const SPEED_MAX_RATIO = 1.25;

export function checklistFor(type: OrderType): ChecklistItem[] {
  return templates[type];
}

export function isItemDone(progress: OrderProgress, id: ItemId): boolean {
  switch (id) {
    case 'cto':
    case 'splice':
    case 'wifi':
      return Boolean(progress.checks[id]);
    case 'power':
      return progress.power !== null;
    case 'speed':
      return progress.speed !== null;
    case 'photo':
      return progress.photo !== null;
    case 'signature':
      return progress.signature !== null || progress.waiver !== null;
  }
}

export function missingRequired(info: OrderInfo, progress: OrderProgress): ItemId[] {
  return checklistFor(info.type).filter((item) => item.required && !isItemDone(progress, item.id)).map((item) => item.id);
}

export function checklistProgress(info: OrderInfo, progress: OrderProgress): { done: number; total: number } {
  const items = checklistFor(info.type);
  return { done: items.filter((item) => isItemDone(progress, item.id)).length, total: items.length };
}

export function speedBounds(plan: number): { min: number; max: number } {
  return { min: Math.round(plan * SPEED_MIN_RATIO), max: Math.round(plan * SPEED_MAX_RATIO) };
}

export type MeasureResult =
  | { ok: true; value: number }
  | { ok: false; error: 'empty' | 'format' | 'power-range' | 'speed-low' | 'speed-high'; value?: number };

/** Readings are stored with one decimal; the range checks always use the value as typed. */
function oneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Power is always negative, so the field takes the magnitude and applies the sign itself. */
export function validatePower(input: string, groupSeparator: string): MeasureResult {
  if (!input.trim()) return { ok: false, error: 'empty' };
  const parsed = parseDecimal(input, groupSeparator);
  if (parsed === null) return { ok: false, error: 'format' };
  const value = -Math.abs(parsed);
  if (value < POWER_RANGE.min || value > POWER_RANGE.max) return { ok: false, error: 'power-range', value };
  return { ok: true, value: -oneDecimal(Math.abs(parsed)) };
}

export function validateSpeed(input: string, plan: number, groupSeparator: string): MeasureResult {
  if (!input.trim()) return { ok: false, error: 'empty' };
  const parsed = parseDecimal(input, groupSeparator);
  if (parsed === null || parsed < 0) return { ok: false, error: 'format' };
  const bounds = speedBounds(plan);
  if (parsed < bounds.min) return { ok: false, error: 'speed-low', value: parsed };
  if (parsed > bounds.max) return { ok: false, error: 'speed-high', value: parsed };
  return { ok: true, value: oneDecimal(parsed) };
}
