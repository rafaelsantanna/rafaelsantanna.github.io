// The order draft both interfaces edit. Pure, immutable helpers.
import { findCustomer, findProduct } from './catalog.ts';
import type { OrderInput, OrderLineInput } from './rules.ts';

export interface Draft {
  customerId: string;
  lines: OrderLineInput[];
  discount: string;
}

let keySeed = 0;
function newLineKey(): string {
  keySeed += 1;
  return `l${Date.now().toString(36)}${keySeed.toString(36)}`;
}

export function blankDraft(): Draft {
  return { customerId: '', lines: [], discount: '' };
}

/** A realistic order to start from: one discount above the seller's limit shows the role rule at work. */
export function exampleDraft(): Draft {
  return {
    customerId: 'C-0107',
    lines: [
      { key: 'ex1', sku: 'MER-1001', quantity: '2' },
      { key: 'ex2', sku: 'MER-1004', quantity: '3' },
      { key: 'ex3', sku: 'MER-1009', quantity: '2' },
      { key: 'ex4', sku: 'BEB-2005', quantity: '4' },
    ],
    discount: '8',
  };
}

export function isBlank(draft: Draft): boolean {
  return !draft.customerId && !draft.discount.trim() && draft.lines.every((line) => !line.sku && !line.quantity.trim());
}

export function toOrderInput(draft: Draft): OrderInput {
  return { customerId: draft.customerId, lines: draft.lines.map((line) => ({ ...line })), discount: draft.discount };
}

export function setCustomer(draft: Draft, customerId: string): Draft {
  return { ...draft, customerId };
}

export function setDiscount(draft: Draft, discount: string): Draft {
  return { ...draft, discount };
}

/** Adds one unit of a product, or one more unit when the product is already on a line with a valid quantity. */
export function addProduct(draft: Draft, sku: string): Draft {
  const existing = draft.lines.find((line) => line.sku === sku);
  if (existing) {
    const current = /^\d+$/.test(existing.quantity.trim()) ? Number(existing.quantity.trim()) : 0;
    return setQuantity(draft, existing.key, String(current + 1));
  }
  return { ...draft, lines: [...draft.lines, { key: newLineKey(), sku, quantity: '1' }] };
}

export function setQuantity(draft: Draft, key: string, quantity: string): Draft {
  return { ...draft, lines: draft.lines.map((line) => (line.key === key ? { ...line, quantity } : line)) };
}

export function removeLine(draft: Draft, key: string): Draft {
  return { ...draft, lines: draft.lines.filter((line) => line.key !== key) };
}

/** Writes one cell of a positional grid, creating blank lines up to that row when needed. */
export function setLineAt(draft: Draft, index: number, patch: Partial<Pick<OrderLineInput, 'sku' | 'quantity'>>): Draft {
  const lines = [...draft.lines];
  while (lines.length <= index) lines.push({ key: newLineKey(), sku: '', quantity: '' });
  lines[index] = { ...lines[index], ...patch };
  return { ...draft, lines };
}

/** Accepts only well-formed drafts that reference known customers and products. */
export function sanitizeDraft(value: unknown): Draft | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<Draft>;
  if (typeof candidate.customerId !== 'string' || typeof candidate.discount !== 'string' || !Array.isArray(candidate.lines)) return null;
  if (candidate.customerId && !findCustomer(candidate.customerId)) return null;
  const lines = candidate.lines.slice(0, 60).filter((line): line is OrderLineInput => (
    Boolean(line) && typeof line.key === 'string' && typeof line.sku === 'string' && typeof line.quantity === 'string'
    && (!line.sku || Boolean(findProduct(line.sku)))
  ));
  const seen = new Set<string>();
  return {
    customerId: candidate.customerId,
    discount: candidate.discount.slice(0, 12),
    lines: lines.map((line) => {
      // Keys end up in element ids, so only short alphanumeric, unique keys are kept.
      const key = /^[a-z0-9]{1,40}$/i.test(line.key) && !seen.has(line.key) ? line.key : newLineKey();
      seen.add(key);
      return { key, sku: line.sku, quantity: line.quantity.slice(0, 12) };
    }),
  };
}
