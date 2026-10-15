// HTML and text for the dynamic parts of the legacy interface. Shared by server rendering and the browser.
import type { Locale } from '@/data/types';
import { customers, findProduct, paymentTerms, products, regions, units, type Customer } from './catalog.ts';
import type { Draft } from './draft.ts';
import { esc, fill, legacyText, percent, plain } from './format.ts';
import { MINIMUM_ORDER, type Evaluation, type Role } from './rules.ts';
import type { Strings } from './strings.ts';

/** The grid always shows at least this many rows, like the original screen. */
export const LEGACY_MIN_ROWS = 6;

const pad = (value: number, size: number) => String(value).padStart(size, '0');
const legacyName = (value: string) => legacyText(value).replace(/ × /g, ' X ');

export function customerOptions(selectedId: string, t: Strings): string {
  const options = customers.map((customer) => (
    `<option value="${esc(customer.id)}"${customer.id === selectedId ? ' selected' : ''}>${esc(`${pad(Number(customer.id.slice(2)), 6)} - ${legacyText(customer.name)}`)}</option>`
  ));
  return `<option value=""${selectedId ? '' : ' selected'}>${esc(t.legacy.select)}</option>${options.join('')}`;
}

const productOptionCache = new Map<Locale, string>();
function productOptionList(locale: Locale): string {
  let html = productOptionCache.get(locale);
  if (!html) {
    html = [...products]
      .sort((a, b) => a.sku.localeCompare(b.sku))
      .map((product) => `<option value="${esc(product.sku)}">${esc(`${product.sku.replace('-', '')} - ${legacyName(product.name[locale])}`)}</option>`)
      .join('');
    productOptionCache.set(locale, html);
  }
  return html;
}

export function productOptions(selectedSku: string, locale: Locale, t: Strings): string {
  const list = productOptionList(locale);
  const blank = `<option value=""${selectedSku ? '' : ' selected'}>${esc(t.legacy.select)}</option>`;
  return blank + (selectedSku ? list.replace(`value="${esc(selectedSku)}"`, `value="${esc(selectedSku)}" selected`) : list);
}

export function customerFields(customer: Customer | null, locale: Locale) {
  return {
    region: customer ? legacyText(regions[customer.region][locale]) : '',
    city: customer ? legacyText(`${customer.city}/${customer.state}`) : '',
    terms: customer ? paymentTerms[customer.paymentTerm].code : '',
  };
}

export function roleText(role: Role, t: Strings): string {
  return legacyText(t.roles[role]);
}

/** Product, unit and price cells of one row, as filled by the lookup when the product changes. */
export function productCells(sku: string, locale: Locale) {
  const product = findProduct(sku);
  return { unit: product ? units[product.unit].code[locale] : '', price: product ? plain(product.price, locale) : '' };
}

export function gridRows(draft: Draft, calc: Evaluation | null, rows: number, locale: Locale, t: Strings): string {
  const totals = new Map((calc?.lines ?? []).map((line) => [line.key, line]));
  let html = '';
  for (let index = 0; index < rows; index += 1) {
    const line = draft.lines[index];
    const sku = line?.sku ?? '';
    const n = pad(index + 1, 3);
    const cells = productCells(sku, locale);
    const calculated = line ? totals.get(line.key) : undefined;
    const total = calculated && calculated.product.sku === sku && calculated.quantity !== null ? plain(calculated.total, locale) : '';
    html += `
      <tr data-row="${index}">
        <td class="vt-l-seq">${n}</td>
        <td class="vt-l-cell-product"><select class="vt-l-select" data-l-product aria-label="${esc(fill(t.legacy.productLabel, { n }))}">${productOptions(sku, locale, t)}</select></td>
        <td class="vt-l-center" data-l-unit>${esc(cells.unit)}</td>
        <td><input class="vt-l-input vt-l-qty" data-l-qty type="text" value="${esc(line?.quantity ?? '')}" maxlength="8" autocomplete="off" aria-label="${esc(fill(t.legacy.qtyLabel, { n }))}" /></td>
        <td class="vt-l-num" data-l-price>${esc(cells.price)}</td>
        <td class="vt-l-num" data-l-total>${esc(total)}</td>
      </tr>`;
  }
  return html;
}

export function totalsText(calc: Evaluation | null, locale: Locale) {
  const zero = plain(0, locale);
  if (!calc) return { subtotal: zero, discount: zero, freight: zero, total: zero };
  return {
    subtotal: plain(calc.subtotal, locale),
    discount: plain(calc.discountValue, locale),
    freight: plain(calc.shipping?.fee ?? 0, locale),
    total: plain(calc.total, locale),
  };
}

/** 32px message box icons in the style of the period. */
export const dialogIcons = {
  warning: '<svg viewBox="0 0 32 32" width="32" height="32" focusable="false"><path d="M16 3 30 28H2Z" fill="#FFE34D" stroke="#000"/><path d="M14.6 11h2.8l-.6 9h-1.6z"/><rect x="14.6" y="22" width="2.8" height="2.8"/></svg>',
  info: '<svg viewBox="0 0 32 32" width="32" height="32" focusable="false"><circle cx="16" cy="16" r="13.5" fill="#FFF" stroke="#000"/><rect x="14.5" y="13" width="3" height="10" fill="#0000C0"/><rect x="14.5" y="8" width="3" height="3" fill="#0000C0"/></svg>',
  question: '<svg viewBox="0 0 32 32" width="32" height="32" focusable="false"><circle cx="16" cy="16" r="13.5" fill="#FFF" stroke="#000"/><path d="M12 12.5a4 4 0 1 1 5.6 3.7c-1 .5-1.6 1.2-1.6 2.3v1" fill="none" stroke="#0000C0" stroke-width="2.6"/><rect x="14.7" y="21.5" width="2.6" height="2.6" fill="#0000C0"/></svg>',
};

/** Every problem at once, worded the way the old system did. */
export function legacyMessages(evaluation: Evaluation, stale: boolean, locale: Locale, t: Strings): string[] {
  const m = t.legacy.issues;
  const messages = evaluation.issues.map((issue) => {
    switch (issue.rule) {
      case 'customer': return m.customer;
      case 'items': return m.items;
      case 'quantity': {
        const template = issue.code === 'stock' ? (issue.combined ? m.stockCombined : m.stock) : m[issue.code];
        return fill(template, { n: pad(issue.position, 3), stock: issue.stock });
      }
      case 'discount': return issue.code === 'limit' ? fill(m.limit, { limit: percent(issue.limit, locale) }) : m.discount;
      case 'minimum': return fill(m.minimum, { min: plain(MINIMUM_ORDER, locale) });
    }
  });
  if (stale) messages.push(m.stale);
  return messages;
}
