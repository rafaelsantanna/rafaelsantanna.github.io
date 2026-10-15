// Order rules shared by the legacy and the modern screen, and the parity between them. Run with:
// node --test src/components/demos/legacy-modernization/rules.test.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findProduct } from './catalog.ts';
import { addProduct, blankDraft, exampleDraft, setCustomer, setDiscount, setLineAt, setQuantity, toOrderInput, type Draft } from './draft.ts';
import { LEGACY_MIN_ROWS } from './render-legacy.ts';
import { parityHtml } from './render-parity.ts';
import {
  DISCOUNT_LIMIT, MINIMUM_ORDER, RULE_IDS, evaluateOrder, parseDiscount, parseQuantity, quoteShipping,
  type Evaluation, type OrderInput, type Role,
} from './rules.ts';
import { strings } from './strings.ts';

/** Empório Vila Serena: Southeast region, 28/42 days. */
const SOUTHEAST = 'C-0107';
const roles: Role[] = ['seller', 'manager'];

type Row = [sku: string, quantity: string | number];

function order(rows: Row[], options: { customerId?: string; discount?: string } = {}): OrderInput {
  return {
    customerId: options.customerId ?? SOUTHEAST,
    discount: options.discount ?? '',
    lines: rows.map(([sku, quantity], index) => ({ key: `l${index + 1}`, sku, quantity: String(quantity) })),
  };
}

const issueCodes = (evaluation: Evaluation) => evaluation.issues.map((issue) => `${issue.rule}:${issue.code}`);

/** The values a person compares between both screens. */
function money(evaluation: Evaluation) {
  const { subtotal, discountPercent, discountValue, goods, total, valid } = evaluation;
  return { subtotal, discountPercent, discountValue, goods, shipping: evaluation.shipping?.fee ?? null, total, valid, issues: issueCodes(evaluation) };
}

/** The order as the legacy screen reads it from its grid: at least LEGACY_MIN_ROWS rows, blank ones included. */
function legacyInput(draft: Draft): OrderInput {
  const rows = Math.max(LEGACY_MIN_ROWS, draft.lines.length);
  return {
    customerId: draft.customerId,
    discount: draft.discount,
    lines: Array.from({ length: rows }, (_, index) => ({
      key: draft.lines[index]?.key ?? `row${index}`,
      sku: draft.lines[index]?.sku ?? '',
      quantity: draft.lines[index]?.quantity ?? '',
    })),
  };
}

describe('parseQuantity', () => {
  it('accepts whole positive numbers, ignoring surrounding spaces', () => {
    assert.deepEqual(parseQuantity('1'), { value: 1, issue: null });
    assert.deepEqual(parseQuantity(' 12 '), { value: 12, issue: null });
    assert.deepEqual(parseQuantity('007'), { value: 7, issue: null });
  });

  it('reports an empty field as required', () => {
    for (const raw of ['', '   ']) assert.deepEqual(parseQuantity(raw), { value: null, issue: 'required' }, JSON.stringify(raw));
  });

  it('rejects zero and negative quantities as not positive', () => {
    for (const raw of ['0', '000', '-3']) assert.deepEqual(parseQuantity(raw), { value: null, issue: 'positive' }, raw);
  });

  it('rejects fractions, signs, exponents, text and unsafe integers as not an integer', () => {
    for (const raw of ['1.5', '1,5', '+3', '2e3', 'abc', '9007199254740993']) {
      assert.deepEqual(parseQuantity(raw), { value: null, issue: 'integer' }, raw);
    }
  });
});

describe('parseDiscount', () => {
  it('reads an empty field as no discount, and whole or decimal percents with a comma or a dot and an optional percent sign', () => {
    for (const raw of ['', '  ', '%']) assert.deepEqual(parseDiscount(raw), { value: 0, issue: null }, JSON.stringify(raw));
    assert.deepEqual(parseDiscount('5'), { value: 5, issue: null });
    assert.deepEqual(parseDiscount('5%'), { value: 5, issue: null });
    assert.deepEqual(parseDiscount(' 7,5 % '), { value: 7.5, issue: null });
    assert.deepEqual(parseDiscount('12.25'), { value: 12.25, issue: null });
  });

  it('rejects negative values and malformed numbers', () => {
    for (const raw of ['-1', '-0,5']) assert.deepEqual(parseDiscount(raw), { value: null, issue: 'negative' }, raw);
    for (const raw of ['1.234', '1000', '5.', 'abc', '1 2']) assert.deepEqual(parseDiscount(raw), { value: null, issue: 'format' }, raw);
  });
});

describe('quoteShipping', () => {
  it('charges the region fee one cent below the threshold, says what is missing, and is free exactly at it', () => {
    const thresholds = [['southeast', 3500, 120000], ['south', 4800, 180000], ['midwest', 6200, 250000]] as const;
    for (const [region, fee, freeFrom] of thresholds) {
      assert.deepEqual(quoteShipping(region, freeFrom - 1), { region, baseFee: fee, freeFrom, fee, missingForFree: 1 }, region);
      assert.deepEqual(quoteShipping(region, freeFrom), { region, baseFee: fee, freeFrom, fee: 0, missingForFree: null }, region);
    }
  });

  it('never makes shipping free in the Northeast and the North', () => {
    assert.deepEqual(quoteShipping('northeast', 10_000_000), { region: 'northeast', baseFee: 7400, freeFrom: null, fee: 7400, missingForFree: null });
    assert.deepEqual(quoteShipping('north', 10_000_000), { region: 'north', baseFee: 9600, freeFrom: null, fee: 9600, missingForFree: null });
  });
});

describe('evaluateOrder', () => {
  it('requires a known customer before shipping and payment terms can be worked out', () => {
    const result = evaluateOrder(order([['MER-1001', 1]], { customerId: 'C-9999' }), 'seller');
    assert.deepEqual(issueCodes(result), ['customer:required']);
    assert.equal(result.customer, null);
    assert.equal(result.shipping, null);
    assert.equal(result.total, result.goods);
    assert.deepEqual([result.rules.customer, result.rules.shipping, result.rules.payment], ['unmet', 'waiting', 'waiting']);
    assert.equal(result.valid, false);
  });

  it('requires at least one product, ignoring blank rows and unknown SKUs', () => {
    const result = evaluateOrder(order([['', ''], ['XYZ-0000', 3], ['', 2]]), 'seller');
    assert.equal(result.lines.length, 0);
    assert.deepEqual(issueCodes(result), ['items:required']);
    assert.deepEqual([result.rules.items, result.rules.quantity, result.rules.minimum], ['unmet', 'waiting', 'waiting']);
  });

  it('accepts a quantity equal to the stock and rejects one unit more, even with no stock at all', () => {
    assert.equal(findProduct('PAN-5019')?.stock, 10);
    assert.deepEqual(issueCodes(evaluateOrder(order([['PAN-5019', 10]]), 'seller')), []);
    const over = evaluateOrder(order([['PAN-5019', 11]]), 'seller');
    assert.deepEqual(over.issues, [{ rule: 'quantity', code: 'stock', lineKey: 'l1', position: 1, stock: 10, combined: false }]);
    assert.equal(over.rules.quantity, 'unmet');
    assert.equal(findProduct('MER-1017')?.stock, 0);
    const empty = evaluateOrder(order([['MER-1017', 1], ['MER-1001', 1]]), 'seller');
    assert.deepEqual(empty.issues, [{ rule: 'quantity', code: 'stock', lineKey: 'l1', position: 1, stock: 0, combined: false }]);
  });

  it('checks stock against the sum of every line with the same product and reports 1-based grid positions', () => {
    const result = evaluateOrder(order([['', ''], ['PAN-5019', 6], ['PAN-5019', 5], ['MER-1001', 1]]), 'seller');
    const quantity = result.issues.filter((issue) => issue.rule === 'quantity');
    assert.deepEqual(quantity, [
      { rule: 'quantity', code: 'stock', lineKey: 'l2', position: 2, stock: 10, combined: true },
      { rule: 'quantity', code: 'stock', lineKey: 'l3', position: 3, stock: 10, combined: true },
    ]);
    assert.equal(result.lines.find((line) => line.key === 'l4')?.issue, null);
  });

  it('leaves invalid quantities out of the subtotal, the units and the combined stock check', () => {
    const result = evaluateOrder(order([['PAN-5019', 10], ['PAN-5019', 'abc'], ['MER-1001', '0']]), 'seller');
    assert.deepEqual(result.lines.map((line) => [line.issue, line.quantity, line.total, line.combined]), [
      [null, 10, 89900, false],
      ['integer', null, 0, false],
      ['positive', null, 0, false],
    ]);
    assert.equal(result.subtotal, 89900);
    assert.equal(result.units, 10);
  });

  it('limits the discount by role: up to 5% for sellers and 12% for managers', () => {
    assert.deepEqual(DISCOUNT_LIMIT, { seller: 5, manager: 12 });
    const big: Row[] = [['MER-1001', 10]];
    for (const role of roles) {
      const limit = DISCOUNT_LIMIT[role];
      const atLimit = evaluateOrder(order(big, { discount: String(limit) }), role);
      assert.equal(atLimit.discountPercent, limit, role);
      assert.equal(atLimit.rules.discount, 'met', role);
      const above = evaluateOrder(order(big, { discount: `${limit},01` }), role);
      assert.deepEqual(above.issues, [{ rule: 'discount', code: 'limit', limit, requested: limit + 0.01 }], role);
      assert.equal(above.rules.discount, 'unmet', role);
    }
  });

  it('applies no discount when the requested one is over the limit or unreadable, instead of capping it', () => {
    const over = evaluateOrder(order([['MER-1001', 10]], { discount: '8' }), 'seller');
    assert.deepEqual([over.requestedDiscount, over.discountPercent, over.discountValue, over.goods], [8, 0, 0, over.subtotal]);
    const unreadable = evaluateOrder(order([['MER-1001', 10]], { discount: '8x' }), 'manager');
    assert.deepEqual(unreadable.issues, [{ rule: 'discount', code: 'format', limit: 12, requested: null }]);
    assert.deepEqual([unreadable.requestedDiscount, unreadable.discountPercent, unreadable.discountValue], [null, 0, 0]);
  });

  it('rounds the discount to the nearest cent', () => {
    // 11 x 14.90 = 163.90; 5% is 8.195 and 7.25% is 11.88275.
    const half = evaluateOrder(order([['BEB-2001', 11]], { discount: '5' }), 'seller');
    assert.deepEqual([half.subtotal, half.discountValue, half.goods], [16390, 820, 15570]);
    const fraction = evaluateOrder(order([['BEB-2001', 11]], { discount: '7,25' }), 'manager');
    assert.equal(fraction.discountValue, 1188);
    assert.ok(Number.isInteger(fraction.total));
  });

  it('measures the minimum order on goods after discount, inclusive', () => {
    assert.equal(MINIMUM_ORDER, 15000);
    const exact: Row[] = [['MER-1018', 1], ['PAN-5004', 1]];
    const met = evaluateOrder(order(exact), 'seller');
    assert.deepEqual([met.goods, met.rules.minimum, issueCodes(met)], [15000, 'met', []]);
    const below = evaluateOrder(order(exact, { discount: '1' }), 'seller');
    assert.equal(below.goods, 14850);
    assert.deepEqual(below.issues, [{ rule: 'minimum', code: 'below', missing: 150 }]);
    assert.equal(below.rules.minimum, 'unmet');
  });

  it('makes shipping free only when goods after discount reach the regional threshold', () => {
    const rows: Row[] = [['MER-1001', 8]];
    const full = evaluateOrder(order(rows), 'manager');
    assert.deepEqual([full.subtotal, full.shipping?.fee, full.total], [135120, 0, 135120]);
    const discounted = evaluateOrder(order(rows, { discount: '12' }), 'manager');
    assert.deepEqual([discounted.goods, discounted.shipping?.fee, discounted.shipping?.missingForFree], [118906, 3500, 1094]);
    assert.equal(discounted.total, 118906 + 3500);
  });

  it('takes the shipping region and the payment terms from the customer', () => {
    const expected = [
      ['C-0125', 'southeast', 3500, 'cash'],
      ['C-0204', 'south', 4800, 'd30-60-90'],
      ['C-0308', 'midwest', 6200, 'd28-42'],
      ['C-0405', 'northeast', 7400, 'd28'],
      ['C-0503', 'north', 9600, 'd30-60'],
    ] as const;
    for (const [customerId, region, fee, term] of expected) {
      const result = evaluateOrder(order([['MER-1001', 1]], { customerId }), 'seller');
      assert.equal(result.customer?.paymentTerm, term, customerId);
      assert.deepEqual([result.shipping?.region, result.shipping?.fee], [region, fee], customerId);
      assert.deepEqual([result.rules.shipping, result.rules.payment], ['met', 'met'], customerId);
      assert.equal(result.total, 16890 + fee, customerId);
    }
  });

  it('adds subtotal minus discount plus shipping into the total of the example order', () => {
    const manager = evaluateOrder(toOrderInput(exampleDraft()), 'manager');
    assert.deepEqual(money(manager), {
      subtotal: 105670, discountPercent: 8, discountValue: 8454, goods: 97216, shipping: 3500, total: 100716, valid: true, issues: [],
    });
    assert.equal(manager.units, 11);
    assert.ok(RULE_IDS.every((id) => manager.rules[id] === 'met'));
    // The same 8% is above the seller's limit, so the seller sees the full price and an error.
    const seller = evaluateOrder(toOrderInput(exampleDraft()), 'seller');
    assert.deepEqual(money(seller), {
      subtotal: 105670, discountPercent: 0, discountValue: 0, goods: 105670, shipping: 3500, total: 109170, valid: false, issues: ['discount:limit'],
    });
  });

  it('lists every problem at once, in a fixed rule order', () => {
    const result = evaluateOrder(order([['MER-1001', 'abc'], ['BEB-2001', 1]], { customerId: '', discount: 'x' }), 'seller');
    assert.deepEqual(issueCodes(result), ['customer:required', 'quantity:integer', 'discount:format', 'minimum:below']);
    assert.deepEqual(result.issues.at(-1), { rule: 'minimum', code: 'below', missing: MINIMUM_ORDER - 1490 });
    assert.equal(result.valid, false);
  });

  it('is deterministic and does not change its input', () => {
    const input = order([['', ''], ['PAN-5019', 6], ['PAN-5019', 5]], { discount: '3,5' });
    const snapshot = structuredClone(input);
    assert.deepEqual(evaluateOrder(input, 'manager'), evaluateOrder(input, 'manager'));
    assert.deepEqual(input, snapshot);
  });
});

describe('parity between the legacy and the modern screen', () => {
  const problemDraft: Draft = {
    customerId: 'C-0503',
    lines: [
      { key: 'a', sku: 'PAN-5019', quantity: '6' },
      { key: 'b', sku: '', quantity: '' },
      { key: 'c', sku: 'PAN-5019', quantity: '5' },
      { key: 'd', sku: 'BEB-2001', quantity: '1,5' },
    ],
    discount: '6',
  };

  it('evaluates the legacy grid and the modern draft of the same order identically', () => {
    for (const draft of [exampleDraft(), problemDraft, blankDraft()]) {
      for (const role of roles) {
        assert.deepEqual(evaluateOrder(legacyInput(draft), role), evaluateOrder(toOrderInput(draft), role), `${role} ${JSON.stringify(draft)}`);
      }
    }
  });

  it('reaches the same totals whether the order is typed into the grid or built with the modern actions', () => {
    let legacy = setCustomer(blankDraft(), 'C-0204');
    legacy = setLineAt(legacy, 0, { sku: 'MER-1001' });
    legacy = setLineAt(legacy, 0, { quantity: '3' });
    legacy = setLineAt(legacy, 2, { sku: 'BEB-2001', quantity: '2' });
    legacy = setDiscount(legacy, '4');

    let modern = setCustomer(blankDraft(), 'C-0204');
    for (let click = 0; click < 3; click += 1) modern = addProduct(modern, 'MER-1001');
    modern = addProduct(modern, 'BEB-2001');
    modern = setQuantity(modern, modern.lines[1].key, '2');
    modern = setDiscount(modern, '4');

    assert.equal(modern.lines[0].quantity, '3');
    for (const role of roles) {
      assert.deepEqual(money(evaluateOrder(legacyInput(legacy), role)), money(evaluateOrder(toOrderInput(modern), role)), role);
    }
  });

  it('lets the parity panel agree only when the legacy totals come from the current order', () => {
    const t = strings.pt;
    const draft = exampleDraft();
    const calculated = evaluateOrder(legacyInput(draft), 'seller');
    const modern = evaluateOrder(toOrderInput(draft), 'seller');
    assert.equal(parityHtml({ shown: calculated, live: calculated, stale: false }, modern, 'pt', t).agree, true);
    assert.equal(parityHtml({ shown: null, live: calculated, stale: true }, modern, 'pt', t).agree, false);

    const edited = setQuantity(draft, 'ex1', '5');
    const live = evaluateOrder(legacyInput(edited), 'seller');
    const modernEdited = evaluateOrder(toOrderInput(edited), 'seller');
    assert.equal(parityHtml({ shown: calculated, live, stale: true }, modernEdited, 'pt', t).agree, false);
    assert.equal(parityHtml({ shown: live, live, stale: false }, modernEdited, 'pt', t).agree, true);
  });
});
