// Order rules shared by the legacy and the modern interface. Pure functions only: no DOM, no storage.
import { findCustomer, findProduct, type Customer, type Product, type RegionId } from './catalog.ts';

export type Role = 'seller' | 'manager';

/** Highest discount, in percent, that each role may grant. */
export const DISCOUNT_LIMIT: Record<Role, number> = { seller: 5, manager: 12 };

/** Minimum value of goods per order, after discount, in cents. */
export const MINIMUM_ORDER = 15000;

/** Shipping fee by region, in cents, and the goods value (after discount) from which shipping is free. */
export const SHIPPING: Record<RegionId, { fee: number; freeFrom: number | null }> = {
  southeast: { fee: 3500, freeFrom: 120000 },
  south: { fee: 4800, freeFrom: 180000 },
  midwest: { fee: 6200, freeFrom: 250000 },
  northeast: { fee: 7400, freeFrom: null },
  north: { fee: 9600, freeFrom: null },
};

export interface OrderLineInput {
  key: string;
  /** Empty when the line has no product yet (blank rows in the legacy grid). Such lines are ignored. */
  sku: string;
  /** Raw text typed by the person; parsing is part of the rules. */
  quantity: string;
}

export interface OrderInput {
  customerId: string;
  lines: OrderLineInput[];
  discount: string;
}

export type QuantityIssue = 'required' | 'integer' | 'positive' | 'stock';
export type DiscountIssue = 'format' | 'negative' | 'limit';

export type Issue =
  | { rule: 'customer'; code: 'required' }
  | { rule: 'items'; code: 'required' }
  | { rule: 'quantity'; code: QuantityIssue; lineKey: string; position: number; stock: number; combined: boolean }
  | { rule: 'discount'; code: DiscountIssue; limit: number; requested: number | null }
  | { rule: 'minimum'; code: 'below'; missing: number };

export interface LineResult {
  key: string;
  /** 1-based position of the line in the input, blank lines included. */
  position: number;
  product: Product;
  quantity: number | null;
  total: number;
  issue: QuantityIssue | null;
  /** True when the stock problem comes from the same product on more than one line. */
  combined: boolean;
}

export interface ShippingResult {
  region: RegionId;
  baseFee: number;
  freeFrom: number | null;
  fee: number;
  /** How much more goods value would make shipping free; null when the region has no free shipping or it already applies. */
  missingForFree: number | null;
}

export type RuleId = 'customer' | 'items' | 'quantity' | 'discount' | 'minimum' | 'shipping' | 'payment' | 'total';
export type RuleStatus = 'met' | 'unmet' | 'waiting';
export const RULE_IDS: RuleId[] = ['customer', 'items', 'quantity', 'discount', 'minimum', 'shipping', 'payment', 'total'];

export interface Evaluation {
  role: Role;
  limit: number;
  customer: Customer | null;
  lines: LineResult[];
  units: number;
  subtotal: number;
  /** Discount percent the person asked for, when it can be read. */
  requestedDiscount: number | null;
  /** Discount percent actually applied: the requested one when valid for the role, otherwise zero. */
  discountPercent: number;
  discountValue: number;
  /** Goods value after discount; drives the minimum order and free shipping. */
  goods: number;
  shipping: ShippingResult | null;
  total: number;
  issues: Issue[];
  rules: Record<RuleId, RuleStatus>;
  valid: boolean;
}

export function parseQuantity(raw: string): { value: number | null; issue: Exclude<QuantityIssue, 'stock'> | null } {
  const text = raw.trim();
  if (!text) return { value: null, issue: 'required' };
  if (/^-\d+$/.test(text)) return { value: null, issue: 'positive' };
  if (!/^\d+$/.test(text)) return { value: null, issue: 'integer' };
  const value = Number(text);
  if (!Number.isSafeInteger(value)) return { value: null, issue: 'integer' };
  if (value <= 0) return { value: null, issue: 'positive' };
  return { value, issue: null };
}

export function parseDiscount(raw: string): { value: number | null; issue: Exclude<DiscountIssue, 'limit'> | null } {
  const text = raw.trim().replace('%', '').trim();
  if (!text) return { value: 0, issue: null };
  if (/^-/.test(text)) return { value: null, issue: 'negative' };
  if (!/^\d{1,3}([.,]\d{1,2})?$/.test(text)) return { value: null, issue: 'format' };
  return { value: Number(text.replace(',', '.')), issue: null };
}

export function quoteShipping(region: RegionId, goods: number): ShippingResult {
  const { fee, freeFrom } = SHIPPING[region];
  const isFree = freeFrom !== null && goods >= freeFrom;
  return {
    region,
    baseFee: fee,
    freeFrom,
    fee: isFree ? 0 : fee,
    missingForFree: freeFrom !== null && !isFree ? freeFrom - goods : null,
  };
}

function evaluateLines(input: OrderInput): LineResult[] {
  const parsed = input.lines
    .map((line, index) => ({ line, position: index + 1, product: findProduct(line.sku) }))
    .filter((entry): entry is { line: OrderLineInput; position: number; product: Product } => Boolean(entry.product))
    .map((entry) => ({ ...entry, ...parseQuantity(entry.line.quantity) }));

  const unitsBySku = new Map<string, number>();
  const linesBySku = new Map<string, number>();
  for (const entry of parsed) {
    linesBySku.set(entry.product.sku, (linesBySku.get(entry.product.sku) ?? 0) + 1);
    if (entry.value !== null) unitsBySku.set(entry.product.sku, (unitsBySku.get(entry.product.sku) ?? 0) + entry.value);
  }

  return parsed.map(({ line, position, product, value, issue }) => {
    const overStock = value !== null && (unitsBySku.get(product.sku) ?? 0) > product.stock;
    return {
      key: line.key,
      position,
      product,
      quantity: value,
      total: value === null ? 0 : value * product.price,
      issue: issue ?? (overStock ? 'stock' : null),
      combined: overStock && (linesBySku.get(product.sku) ?? 0) > 1,
    };
  });
}

export function evaluateOrder(input: OrderInput, role: Role): Evaluation {
  const limit = DISCOUNT_LIMIT[role];
  const customer = findCustomer(input.customerId) ?? null;
  const lines = evaluateLines(input);
  const issues: Issue[] = [];

  if (!customer) issues.push({ rule: 'customer', code: 'required' });
  if (!lines.length) issues.push({ rule: 'items', code: 'required' });
  for (const line of lines) {
    if (line.issue) {
      issues.push({ rule: 'quantity', code: line.issue, lineKey: line.key, position: line.position, stock: line.product.stock, combined: line.combined });
    }
  }

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const units = lines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);

  const discount = parseDiscount(input.discount);
  let discountPercent = 0;
  if (discount.issue) {
    issues.push({ rule: 'discount', code: discount.issue, limit, requested: null });
  } else if (discount.value !== null && discount.value > limit) {
    issues.push({ rule: 'discount', code: 'limit', limit, requested: discount.value });
  } else {
    discountPercent = discount.value ?? 0;
  }
  const discountValue = Math.round((subtotal * discountPercent) / 100);
  const goods = subtotal - discountValue;

  if (lines.length && goods < MINIMUM_ORDER) issues.push({ rule: 'minimum', code: 'below', missing: MINIMUM_ORDER - goods });

  const shipping = customer ? quoteShipping(customer.region, goods) : null;
  const total = goods + (shipping?.fee ?? 0);
  const has = (rule: Issue['rule']) => issues.some((issue) => issue.rule === rule);

  const rules: Record<RuleId, RuleStatus> = {
    customer: customer ? 'met' : 'unmet',
    items: lines.length ? 'met' : 'unmet',
    quantity: !lines.length ? 'waiting' : has('quantity') ? 'unmet' : 'met',
    discount: has('discount') ? 'unmet' : 'met',
    minimum: !lines.length ? 'waiting' : has('minimum') ? 'unmet' : 'met',
    shipping: customer ? 'met' : 'waiting',
    payment: customer ? 'met' : 'waiting',
    total: 'met',
  };

  return {
    role,
    limit,
    customer,
    lines,
    units,
    subtotal,
    requestedDiscount: discount.value,
    discountPercent,
    discountValue,
    goods,
    shipping,
    total,
    issues,
    rules,
    valid: issues.length === 0,
  };
}
