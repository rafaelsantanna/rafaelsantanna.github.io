import type { ServiceItem } from '../data/model';
import { phoneIssue } from './phone';

export const STEP_IDS = ['services', 'barber', 'day', 'time', 'details', 'review'] as const;
export type StepId = (typeof STEP_IDS)[number];

/** Choices in progress. Phone holds digits only. */
export interface Draft {
  serviceIds: string[];
  barber: string | null;
  day: string | null;
  start: number | null;
  name: string;
  phone: string;
  note: string;
}

/** Answers that depend on the live schedule, injected so the rules stay pure. */
export interface FlowContext {
  dayOpen(draft: Draft, day: string): boolean;
  slotFree(draft: Draft, day: string, start: number): boolean;
}

export const NOTE_MAX = 140;

export const emptyDraft = (): Draft => ({ serviceIds: [], barber: null, day: null, start: null, name: '', phone: '', note: '' });

const byCatalog = (ids: string[], services: readonly ServiceItem[]): string[] =>
  services.filter((service) => ids.includes(service.id)).map((service) => service.id);

/** The selected combo that already covers this service, if any. */
export function includedBy(selected: readonly string[], id: string, services: readonly ServiceItem[]): ServiceItem | undefined {
  return services.find((service) => selected.includes(service.id) && service.includes.includes(id));
}

export function toggleService(selected: readonly string[], id: string, services: readonly ServiceItem[]): string[] {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  if (includedBy(selected, id, services)) return [...selected];
  const service = services.find((item) => item.id === id);
  const kept = selected.filter((item) => !service?.includes.includes(item));
  return byCatalog([...kept, id], services);
}

/** A combo whose parts are all selected separately, which would be cheaper as the combo. */
export function comboFor(selected: readonly string[], services: readonly ServiceItem[]): ServiceItem | undefined {
  return services.find((service) => service.includes.length > 0 && !selected.includes(service.id) && service.includes.every((id) => selected.includes(id)));
}

export function applyCombo(selected: readonly string[], combo: ServiceItem, services: readonly ServiceItem[]): string[] {
  return byCatalog([...selected.filter((id) => !combo.includes.includes(id)), combo.id], services);
}

export function totals(selected: readonly string[], services: readonly ServiceItem[]): { duration: number; price: number } {
  return services
    .filter((service) => selected.includes(service.id))
    .reduce((sum, service) => ({ duration: sum.duration + service.duration, price: sum.price + service.price }), { duration: 0, price: 0 });
}

export type NameIssue = 'empty' | 'short';

export function nameIssue(name: string): NameIssue | null {
  const trimmed = name.trim();
  if (!trimmed) return 'empty';
  return trimmed.replace(/[^\p{L}]/gu, '').length < 2 ? 'short' : null;
}

export function stepDone(step: StepId, draft: Draft, context: FlowContext): boolean {
  switch (step) {
    case 'services':
      return draft.serviceIds.length > 0;
    case 'barber':
      return draft.barber !== null;
    case 'day':
      return draft.day !== null && context.dayOpen(draft, draft.day);
    case 'time':
      return draft.day !== null && draft.start !== null && context.slotFree(draft, draft.day, draft.start);
    case 'details':
      return nameIssue(draft.name) === null && phoneIssue(draft.phone) === null;
    case 'review':
      return false;
  }
}

/** A step can be visited when every step before it is complete. */
export function canVisit(index: number, draft: Draft, context: FlowContext): boolean {
  return STEP_IDS.slice(0, index).every((step) => stepDone(step, draft, context));
}

export function firstOpenStep(draft: Draft, context: FlowContext): number {
  const index = STEP_IDS.findIndex((step) => !stepDone(step, draft, context));
  return index === -1 ? STEP_IDS.length - 1 : index;
}

/**
 * After services or barber change, drops a day or a time that no longer fits,
 * so earlier choices survive whenever they still make sense.
 */
export function reconcile(draft: Draft, context: FlowContext): { draft: Draft; cleared: 'day' | 'time' | null } {
  if (!draft.serviceIds.length || draft.barber === null || draft.day === null) return { draft, cleared: null };
  if (!context.dayOpen(draft, draft.day)) return { draft: { ...draft, day: null, start: null }, cleared: 'day' };
  if (draft.start !== null && !context.slotFree(draft, draft.day, draft.start)) return { draft: { ...draft, start: null }, cleared: 'time' };
  return { draft, cleared: null };
}
