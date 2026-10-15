// HTML for the dynamic parts of the modern interface. Shared by server rendering and the browser.
import type { Locale } from '@/data/types';
import { categories, paymentTerms, regions, units, type Customer, type Product } from './catalog.ts';
import type { Draft } from './draft.ts';
import { count, esc, fill, highlight, money, percent } from './format.ts';
import { icons } from './icons.ts';
import { DISCOUNT_LIMIT, MINIMUM_ORDER, type Evaluation, type Issue, type LineResult, type QuantityIssue } from './rules.ts';
import type { Strings } from './strings.ts';

export type View = 'edit' | 'review' | 'done';
export type StepState = 'done' | 'todo' | 'error' | 'current';

/** Which order-level errors are shown inline; line and discount errors always show because they describe typed values. */
export interface Visibility {
  customer: boolean;
  items: boolean;
  /** Line whose quantity box is focused and empty: "required" waits until the person leaves the field. */
  typingKey: string;
  /** The discount box has focus, so a number that ends in a separator ("4,") is still being typed. */
  typingDiscount: boolean;
}

/** Discount as the modern screen reads it: while typing, "4," counts as 4 instead of a format error, which waits for blur. */
export function typedDiscount(raw: string, visibility: Visibility): string {
  return visibility.typingDiscount ? raw.replace(/^(\s*\d{1,3})[.,](\s*%?\s*)$/, '$1$2') : raw;
}

const lineErrorId = (key: string) => `vt-m-e-${key}`;
export const lineInputId = (key: string) => `vt-m-q-${key}`;

function quantityMessage(code: QuantityIssue, line: Pick<LineResult, 'combined' | 'product'>, t: Strings): string {
  const errors = t.modern.items.errors;
  if (code !== 'stock') return errors[code];
  if (!line.product.stock) return errors.noStock;
  return fill(line.combined ? errors.stockCombined : errors.stock, { stock: line.product.stock });
}

export function discountMessage(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const issue = evaluation.issues.find((item) => item.rule === 'discount');
  if (!issue) return '';
  const errors = t.modern.terms.errors;
  if (issue.code === 'limit') {
    const template = evaluation.role === 'seller' ? errors.limitSeller : errors.limitManager;
    return fill(template, { limit: percent(issue.limit, locale), managerLimit: percent(DISCOUNT_LIMIT.manager, locale) });
  }
  return errors[issue.code];
}

export function discountHint(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const template = evaluation.role === 'seller' ? t.modern.terms.hintSeller : t.modern.terms.hintManager;
  return fill(template, { limit: percent(evaluation.limit, locale), managerLimit: percent(DISCOUNT_LIMIT.manager, locale) });
}

export function discountPreview(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const requested = evaluation.requestedDiscount;
  if (requested === null || requested === 0) return '';
  const blocked = evaluation.issues.some((issue) => issue.rule === 'discount');
  const value = Math.round((evaluation.subtotal * requested) / 100);
  const text = fill(t.modern.terms.preview, { value: money(value, locale) });
  return blocked ? `${text} ${t.modern.terms.notApplied}` : text;
}

export function errorHtml(message: string): string {
  return message ? `${icons.alertCircle}<span>${esc(message)}</span>` : '';
}

export function customerOptions(list: Customer[], terms: string[], locale: Locale): string {
  return list.map((customer) => `
    <li class="vt-opt" role="option" id="vt-m-co-${esc(customer.id)}" data-value="${esc(customer.id)}" aria-selected="false">
      <span class="vt-opt__main">
        <span class="vt-opt__name">${highlight(customer.name, terms)}</span>
        <span class="vt-opt__meta"><span class="vt-mono">${highlight(customer.id, terms)}</span> · ${highlight(`${customer.city}/${customer.state}`, terms)} · ${esc(regions[customer.region][locale])}</span>
      </span>
      <span class="vt-opt__side"><span class="vt-opt__terms">${esc(paymentTerms[customer.paymentTerm].name[locale])}</span></span>
    </li>`).join('');
}

export function productOptions(list: Product[], terms: string[], locale: Locale, t: Strings): string {
  return list.map((product) => {
    const out = product.stock === 0;
    return `
    <li class="vt-opt${out ? ' is-out' : ''}" role="option" id="vt-m-po-${esc(product.sku)}" data-value="${esc(product.sku)}" aria-selected="false"${out ? ' aria-disabled="true"' : ''}>
      <span class="vt-opt__main">
        <span class="vt-opt__name">${highlight(product.name[locale], terms)}</span>
        <span class="vt-opt__meta"><span class="vt-mono">${highlight(product.sku, terms)}</span> · ${esc(units[product.unit].name[locale])} · ${highlight(categories[product.category].name[locale], terms)}</span>
      </span>
      <span class="vt-opt__side">
        <span class="vt-opt__price">${money(product.price, locale)}</span>
        <span class="vt-opt__stock">${out ? `${icons.alertCircle}${esc(t.modern.items.outOfStock)}` : esc(fill(t.modern.items.stock, { n: product.stock }))}</span>
      </span>
    </li>`;
  }).join('');
}

export function customerCard(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const customer = evaluation.customer;
  const c = t.modern.customer;
  if (!customer) return `<p class="vt-m-customer__empty">${icons.user}<span>${esc(c.empty)}</span></p>`;
  const facts: Array<[string, string, boolean?]> = [
    [c.code, customer.id, true],
    [c.city, `${customer.city}/${customer.state}`],
    [c.region, regions[customer.region][locale]],
    [c.terms, paymentTerms[customer.paymentTerm].name[locale]],
  ];
  return `
    <div class="vt-m-customer__card">
      <span class="vt-m-customer__avatar" aria-hidden="true">${esc(customer.name.split(' ').slice(0, 2).map((word) => word[0]).join(''))}</span>
      <div class="vt-m-customer__body">
        <p class="vt-m-customer__name">${esc(customer.name)}</p>
        <dl class="vt-m-customer__facts">${facts.map(([label, value, mono]) => `<div><dt>${esc(label)}</dt><dd${mono ? ' class="vt-mono"' : ''}>${esc(value)}</dd></div>`).join('')}</dl>
      </div>
    </div>`;
}

/** Inline message for a line, if any: an empty box being typed in is not an error yet. */
export function lineMessage(line: LineResult, visibility: Visibility, t: Strings): string {
  if (!line.issue || (line.issue === 'required' && visibility.typingKey === line.key)) return '';
  return quantityMessage(line.issue, line, t);
}

export function lineTotalHtml(line: LineResult, locale: Locale, t: Strings): string {
  return `<span class="vt-line__label">${esc(t.modern.items.columns.total)}</span>${money(line.total, locale)}`;
}

/** Position on the discount meter, which runs a little past the manager's limit. */
export function limitPosition(value: number): string {
  const scale = DISCOUNT_LIMIT.manager + 3;
  return `${((Math.min(Math.max(value, 0), scale) / scale) * 100).toFixed(2)}%`;
}

function itemRow(line: LineResult, raw: string, visibility: Visibility, locale: Locale, t: Strings): string {
  const name = line.product.name[locale];
  const message = lineMessage(line, visibility, t);
  const qty = line.quantity ?? 0;
  const i = t.modern.items;
  return `
    <tr class="vt-line${message ? ' is-invalid' : ''}" role="row" data-line="${esc(line.key)}">
      <th class="vt-line__product" role="rowheader" scope="row">
        <span class="vt-line__name">${esc(name)}</span>
        <span class="vt-line__meta"><span class="vt-mono">${esc(line.product.sku)}</span> · ${esc(units[line.product.unit].name[locale])} · ${esc(line.product.stock ? fill(i.stock, { n: line.product.stock }) : i.outOfStock)}</span>
        <span class="vt-field-error vt-line__error" id="${lineErrorId(line.key)}" data-line-error${message ? '' : ' hidden'}>${errorHtml(message)}</span>
      </th>
      <td class="vt-line__price" role="cell"><span class="vt-line__label">${esc(i.columns.price)}</span>${money(line.product.price, locale)}</td>
      <td class="vt-line__qty" role="cell">
        <div class="vt-step">
          <button type="button" class="vt-step__btn" data-step="-1" aria-label="${esc(fill(i.decrease, { name }))}"${qty <= 1 ? ' aria-disabled="true"' : ''}>${icons.minus}</button>
          <input class="vt-step__input" id="${lineInputId(line.key)}" data-qty type="text" inputmode="numeric" autocomplete="off" value="${esc(raw)}" aria-label="${esc(fill(i.qty, { name }))}" aria-describedby="${lineErrorId(line.key)}"${message ? ' aria-invalid="true"' : ''} />
          <button type="button" class="vt-step__btn" data-step="1" aria-label="${esc(fill(i.increase, { name }))}"${qty >= line.product.stock ? ' aria-disabled="true"' : ''}>${icons.plus}</button>
        </div>
      </td>
      <td class="vt-line__total" role="cell" data-line-total>${lineTotalHtml(line, locale, t)}</td>
      <td class="vt-line__remove" role="cell"><button type="button" class="vt-icon-btn" data-remove aria-label="${esc(fill(i.remove, { name }))}">${icons.trash}</button></td>
    </tr>`;
}

export function itemRows(evaluation: Evaluation, draft: Draft, visibility: Visibility, locale: Locale, t: Strings): string {
  const raw = new Map(draft.lines.map((line) => [line.key, line.quantity]));
  return evaluation.lines.map((line) => itemRow(line, raw.get(line.key) ?? '', visibility, locale, t)).join('');
}

export function itemsFooter(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const i = t.modern.items;
  return `<span>${esc(count(evaluation.lines.length, i.products))} · ${esc(count(evaluation.units, i.units))}</span><span>${esc(i.subtotal)} <strong>${money(evaluation.subtotal, locale)}</strong></span>`;
}

export function termsTiles(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const terms = t.modern.terms;
  const shipping = evaluation.shipping;
  let shippingValue = '';
  let shippingText = esc(terms.shippingWaiting);
  let progress = '';
  if (shipping && evaluation.customer) {
    const region = regions[shipping.region][locale];
    shippingValue = shipping.fee === 0 ? `${esc(region)}: ${esc(t.modern.summary.free)}` : `${esc(region)}: ${money(shipping.fee, locale)}`;
    if (shipping.freeFrom === null) shippingText = esc(terms.noFree);
    else {
      const lines = [fill(terms.freeFrom, { threshold: money(shipping.freeFrom, locale) })];
      lines.push(shipping.missingForFree === null ? terms.freeApplied : fill(terms.missingFree, { missing: money(shipping.missingForFree, locale) }));
      shippingText = lines.map(esc).join(' ');
      const ratio = Math.max(0, Math.min(1, evaluation.goods / shipping.freeFrom));
      progress = `<span class="vt-meter" aria-hidden="true"><span style="inline-size:${(ratio * 100).toFixed(1)}%"></span></span>`;
    }
  }
  const customer = evaluation.customer;
  const paymentValue = customer ? esc(paymentTerms[customer.paymentTerm].name[locale]) : '';
  const paymentText = customer ? esc(terms.paymentNote) : esc(terms.waiting);
  const minimumState = evaluation.rules.minimum;
  const minimumIssue = evaluation.issues.find((issue): issue is Extract<Issue, { rule: 'minimum' }> => issue.rule === 'minimum');
  const minimumValue = minimumState === 'met' ? `${icons.check}${esc(terms.minimumMet)}`
    : minimumIssue ? esc(fill(terms.minimumMissing, { missing: money(minimumIssue.missing, locale) }))
      : esc(terms.minimumWaiting);
  const minimumRatio = Math.max(0, Math.min(1, evaluation.goods / MINIMUM_ORDER));
  const tile = (icon: string, title: string, value: string, text: string, extra = '', state = '') => `
    <div class="vt-tile${state ? ` is-${state}` : ''}">
      <p class="vt-tile__title">${icon}<span>${esc(title)}</span></p>
      ${value ? `<p class="vt-tile__value">${value}</p>` : ''}
      <p class="vt-tile__text">${text}</p>
      ${extra}
    </div>`;
  return [
    tile(icons.truck, terms.shipping, shippingValue, shippingText, progress),
    tile(icons.wallet, terms.payment, paymentValue, paymentText),
    tile(icons.target, terms.minimum, minimumValue, esc(fill(terms.minimumRule, { min: money(MINIMUM_ORDER, locale) })),
      `<span class="vt-meter" aria-hidden="true"><span style="inline-size:${(minimumRatio * 100).toFixed(1)}%"></span></span>`, minimumState === 'met' ? 'ok' : ''),
  ].join('');
}

/** Short, actionable text for an issue in the summary list, with the field it points to. */
export function issueLinks(evaluation: Evaluation, locale: Locale, t: Strings): Array<{ target: string; text: string }> {
  const s = t.modern.summary.issue;
  return evaluation.issues.map((issue) => {
    switch (issue.rule) {
      case 'customer': return { target: 'customer', text: s.customer };
      case 'items': return { target: 'product', text: s.items };
      case 'quantity': {
        const line = evaluation.lines.find((item) => item.key === issue.lineKey);
        const problem = line ? quantityMessage(issue.code, line, t) : '';
        return { target: `line:${issue.lineKey}`, text: fill(s.quantity, { name: line?.product.name[locale] ?? '', problem }) };
      }
      case 'discount': return { target: 'discount', text: issue.code === 'limit' ? fill(s.limit, { limit: percent(issue.limit, locale) }) : s.discount };
      case 'minimum': return { target: 'product', text: fill(s.minimum, { missing: money(issue.missing, locale) }) };
    }
  });
}

export function summaryBody(evaluation: Evaluation, view: View, locale: Locale, t: Strings): string {
  const s = t.modern.summary;
  const i = t.modern.items;
  const customer = evaluation.customer;
  const blocked = evaluation.issues.some((issue) => issue.rule === 'discount');
  const discountLabel = blocked ? s.discountBlocked : fill(s.discount, { percent: percent(evaluation.discountPercent, locale) });
  const shipping = evaluation.shipping;
  const shippingLabel = shipping ? fill(s.shippingRegion, { region: regions[shipping.region][locale] }) : s.shipping;
  const shippingValue = !shipping ? esc(s.pending) : shipping.fee === 0 ? esc(s.free) : money(shipping.fee, locale);
  const links = issueLinks(evaluation, locale, t);
  const status = links.length
    ? `<div class="vt-sum__issues">
        <p class="vt-sum__status is-todo">${icons.alertCircle}<span>${esc(count(links.length, s.issues))}</span></p>
        <ul>${links.map((link) => `<li><button type="button" class="vt-link" data-focus-target="${esc(link.target)}">${esc(link.text)}</button></li>`).join('')}</ul>
      </div>`
    : `<p class="vt-sum__status is-ready">${icons.checkCircle}<span>${esc(view === 'done' ? s.sent : view === 'review' ? s.reviewed : s.ready)}</span></p>`;
  return `
    <div class="vt-sum__customer">
      ${customer
        ? `<p class="vt-sum__customer-name">${esc(customer.name)}</p><p class="vt-sum__customer-meta">${esc(`${customer.city}/${customer.state}`)} · ${esc(regions[customer.region][locale])}</p>`
        : `<p class="vt-sum__customer-name is-empty">${esc(s.noCustomer)}</p>`}
    </div>
    <dl class="vt-sum__lines">
      <div><dt>${esc(s.products)}<span>${esc(count(evaluation.lines.length, i.products))} · ${esc(count(evaluation.units, i.units))}</span></dt><dd>${money(evaluation.subtotal, locale)}</dd></div>
      <div${blocked ? ' class="is-blocked"' : ''}><dt>${esc(discountLabel)}</dt><dd>${evaluation.discountValue ? `−${money(evaluation.discountValue, locale)}` : money(0, locale)}</dd></div>
      <div><dt>${esc(shippingLabel)}</dt><dd>${shippingValue}</dd></div>
      <div class="vt-sum__total"><dt>${esc(s.total)}</dt><dd>${money(evaluation.total, locale)}</dd></div>
    </dl>
    <p class="vt-sum__payment"><span>${esc(s.payment)}</span><strong>${customer ? esc(paymentTerms[customer.paymentTerm].name[locale]) : esc(s.pending)}</strong></p>
    ${status}`;
}

export function stepStates(evaluation: Evaluation, visibility: Visibility, view: View): StepState[] {
  if (view === 'done') return ['done', 'done', 'done', 'done'];
  const has = (rule: Issue['rule']) => evaluation.issues.some((issue) => issue.rule === rule);
  const customer: StepState = evaluation.customer ? 'done' : visibility.customer ? 'error' : 'todo';
  const items: StepState = has('quantity') ? 'error' : evaluation.lines.length ? 'done' : visibility.items ? 'error' : 'todo';
  const terms: StepState = has('discount') || (visibility.items && has('minimum')) ? 'error'
    : evaluation.customer && evaluation.lines.length && !has('minimum') ? 'done' : 'todo';
  return [customer, items, terms, view === 'review' ? 'current' : 'todo'];
}

/** Step list; `linked` turns the first three steps into links back to their sections, which a sent order no longer has. */
export function stepsHtml(states: StepState[], t: Strings, linked: boolean): string {
  const ids = ['vt-m-s-customer', 'vt-m-s-items', 'vt-m-s-terms', 'vt-m-s-review'];
  const glyph: Record<StepState, string> = { done: icons.check, error: icons.alert, todo: '', current: '' };
  return t.modern.steps.map((label, index) => {
    const state = states[index];
    const number = `<span class="vt-steps__dot">${glyph[state] || index + 1}</span>`;
    const text = `<span class="vt-steps__label">${esc(label)}<span class="vt-sr-only">, ${esc(t.modern.stepStatus[state])}</span></span>`;
    const inner = linked && index < 3 ? `<a href="#${ids[index]}">${number}${text}</a>` : `<span class="vt-steps__static">${number}${text}</span>`;
    return `<li class="vt-steps__item is-${state}"${state === 'current' ? ' aria-current="step"' : ''}>${inner}</li>`;
  }).join('');
}

export function reviewHtml(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const r = t.modern.review;
  const i = t.modern.items;
  const customer = evaluation.customer;
  const rows = evaluation.lines.map((line) => `
    <tr><th scope="row">${esc(line.product.name[locale])}<span class="vt-mono">${esc(line.product.sku)}</span></th><td>${line.quantity ?? ''}</td><td>${money(line.product.price, locale)}</td><td>${money(line.total, locale)}</td></tr>`).join('');
  return `
    <section class="vt-m-card vt-m-review" id="vt-m-s-review" aria-labelledby="vt-m-review-title">
      <header class="vt-m-card__head">
        <span class="vt-m-card__index" aria-hidden="true">4</span>
        <div><h4 id="vt-m-review-title" tabindex="-1">${esc(r.title)}</h4><p class="vt-m-card__lead">${esc(r.lead)}</p></div>
      </header>
      <div class="vt-m-review__grid">
        <div class="vt-m-review__block">
          <h5>${esc(r.customer)}</h5>
          <p><strong>${esc(customer?.name ?? '')}</strong></p>
          <p>${customer ? `<span class="vt-mono">${esc(customer.id)}</span> · ${esc(`${customer.city}/${customer.state}`)} · ${esc(regions[customer.region][locale])}` : ''}</p>
        </div>
        <div class="vt-m-review__block">
          <h5>${esc(r.terms)}</h5>
          <p>${esc(t.modern.summary.payment)}: <strong>${customer ? esc(paymentTerms[customer.paymentTerm].name[locale]) : ''}</strong></p>
          <p>${esc(t.modern.terms.discount)}: <strong>${percent(evaluation.discountPercent, locale)}</strong></p>
        </div>
      </div>
      <div class="vt-table-wrap">
        <table class="vt-m-review__table">
          <caption class="vt-sr-only">${esc(r.items)}</caption>
          <thead><tr><th scope="col">${esc(i.columns.product)}</th><th scope="col">${esc(i.columns.qty)}</th><th scope="col">${esc(i.columns.price)}</th><th scope="col">${esc(i.columns.total)}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="vt-m-review__actions">
        <button type="button" class="vt-btn vt-btn--ghost" data-action="edit">${icons.arrowLeft}<span>${esc(r.edit)}</span></button>
        <button type="button" class="vt-btn vt-btn--primary" data-action="send">${icons.send}<span>${esc(t.modern.summary.send)}</span></button>
      </div>
      <p class="vt-m-note">${esc(r.note)}</p>
    </section>`;
}

export function doneHtml(evaluation: Evaluation, locale: Locale, t: Strings): string {
  const d = t.modern.done;
  const customer = evaluation.customer;
  return `
    <section class="vt-m-card vt-m-done" aria-labelledby="vt-m-done-title">
      <span class="vt-m-done__mark" aria-hidden="true">${icons.check}</span>
      <h4 id="vt-m-done-title" tabindex="-1">${esc(d.title)}</h4>
      <p class="vt-m-done__text">${esc(d.text)}</p>
      <dl class="vt-m-done__facts">
        <div><dt>${esc(t.modern.review.customer)}</dt><dd>${esc(customer?.name ?? '')}</dd></div>
        <div><dt>${esc(t.modern.summary.products)}</dt><dd>${esc(count(evaluation.lines.length, t.modern.items.products))}</dd></div>
        <div><dt>${esc(t.modern.summary.payment)}</dt><dd>${customer ? esc(paymentTerms[customer.paymentTerm].name[locale]) : ''}</dd></div>
        <div><dt>${esc(t.modern.summary.total)}</dt><dd>${money(evaluation.total, locale)}</dd></div>
      </dl>
      <button type="button" class="vt-btn vt-btn--primary" data-action="new">${icons.plus}<span>${esc(d.newOrder)}</span></button>
    </section>`;
}
