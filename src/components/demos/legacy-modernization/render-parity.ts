// HTML for the parity panel: what each interface shows for the same order, and the rule checklist.
import type { Locale } from '@/data/types';
import { paymentTerms, regions } from './catalog.ts';
import { count, esc, fill, money, percent } from './format.ts';
import { icons } from './icons.ts';
import { MINIMUM_ORDER, RULE_IDS, evaluateOrder, type Evaluation, type Issue, type RuleId, type RuleStatus } from './rules.ts';
import type { Strings } from './strings.ts';

/** The legacy screen as a person sees it: totals from the last Calcular, the rest of the fields live. */
export interface LegacyReading {
  /** Result of the last Calcular, which the totals fields show; null until the first one, when they show zeros. */
  shown: Evaluation | null;
  /** The order as the legacy fields hold it right now. */
  live: Evaluation;
  /** Fields changed after the last Calcular: the totals are out of date and Gravar lists that as an error. */
  stale: boolean;
}

interface Row {
  label: string;
  legacy: string;
  modern: string;
  equal: boolean;
}

const issueSignature = (evaluation: Evaluation) => evaluation.issues.map((issue) => `${issue.rule}:${issue.code}`).join('|');

function rows(legacy: LegacyReading, modern: Evaluation, locale: Locale, t: Strings): Row[] {
  const p = t.parity;
  const discount = (e: Evaluation) => `${money(e.discountValue, locale)} (${percent(e.discountPercent, locale)})`;
  const shipping = (fee: number | undefined) => (fee === undefined ? p.noCustomer : money(fee, locale));
  const payment = (e: Evaluation) => (e.customer ? paymentTerms[e.customer.paymentTerm].name[locale] : p.noCustomer);
  const issues = (e: Evaluation) => (e.issues.length ? String(e.issues.length) : p.noIssues);
  // Before the first Calcular the totals fields read zero, as for an order with nothing in it.
  const shown = legacy.shown ?? evaluateOrder({ customerId: '', lines: [], discount: '' }, legacy.live.role);
  // The payment terms field follows the customer as soon as it changes, without Calcular.
  const live = legacy.live;
  // The freight field reads zero until a Calcular with a customer fills it, so "no customer" only fits
  // when neither the screen nor its last Calcular has one; otherwise the row shows the field's value.
  const legacyFee = live.customer || legacy.shown?.shipping ? (legacy.shown?.shipping?.fee ?? 0) : undefined;
  const modernFee = modern.shipping?.fee;
  return [
    { label: p.rows.subtotal, legacy: money(shown.subtotal, locale), modern: money(modern.subtotal, locale), equal: shown.subtotal === modern.subtotal },
    { label: p.rows.discount, legacy: discount(shown), modern: discount(modern), equal: shown.discountValue === modern.discountValue && shown.discountPercent === modern.discountPercent },
    { label: p.rows.shipping, legacy: shipping(legacyFee), modern: shipping(modernFee), equal: legacyFee === modernFee },
    { label: p.rows.total, legacy: money(shown.total, locale), modern: money(modern.total, locale), equal: shown.total === modern.total },
    { label: p.rows.payment, legacy: payment(live), modern: payment(modern), equal: live.customer?.paymentTerm === modern.customer?.paymentTerm },
    { label: p.rows.issues, legacy: issues(live), modern: issues(modern), equal: issueSignature(live) === issueSignature(modern) },
    { label: p.rows.current, legacy: legacy.stale ? p.notCurrent : p.current, modern: p.current, equal: !legacy.stale },
  ];
}

export function parityHtml(legacy: LegacyReading, modern: Evaluation, locale: Locale, t: Strings): { rows: string; verdict: string; agree: boolean } {
  const p = t.parity;
  const list = rows(legacy, modern, locale, t);
  const differences = list.filter((row) => !row.equal).length;
  // Explicit roles keep the table semantics when narrow screens restyle rows as stacked cards.
  const body = list.map((row) => `
    <tr class="${row.equal ? 'is-equal' : 'is-different'}" role="row">
      <th scope="row" role="rowheader">${esc(row.label)}</th>
      <td role="cell" data-label="${esc(p.columns.legacy)}">${esc(row.legacy)}</td>
      <td role="cell" data-label="${esc(p.columns.modern)}">${esc(row.modern)}</td>
      <td role="cell" class="vt-parity__check"><span class="vt-parity__mark">${row.equal ? icons.check : icons.cross}<span>${esc(row.equal ? p.equal : p.different)}</span></span></td>
    </tr>`).join('');
  const issueText = modern.issues.length ? count(modern.issues.length, p.agreeIssues) : p.agreeClean;
  const verdict = !differences
    ? `${icons.checkCircle}<span>${esc(fill(p.agree, { total: money(modern.total, locale), issues: issueText }))}</span>`
    : `${icons.alert}<span>${esc(legacy.stale ? p.stale : count(differences, p.disagree))}</span>`;
  return { rows: body, verdict, agree: differences === 0 };
}

function ruleDetail(id: RuleId, evaluation: Evaluation, locale: Locale, t: Strings): string {
  const d = t.parity.details;
  const role = t.roles[evaluation.role];
  switch (id) {
    case 'customer': return evaluation.customer ? evaluation.customer.name : d.noCustomer;
    case 'items': return evaluation.lines.length ? count(evaluation.lines.length, t.modern.items.products) : d.noItems;
    case 'quantity': {
      if (!evaluation.lines.length) return d.noItems;
      const problems = evaluation.issues.filter((issue) => issue.rule === 'quantity').length;
      return problems ? count(problems, d.quantityUnmet) : fill(d.quantityMet, { units: count(evaluation.units, t.modern.items.units) });
    }
    case 'discount': {
      const issue = evaluation.issues.find((item): item is Extract<Issue, { rule: 'discount' }> => item.rule === 'discount');
      if (issue?.code === 'limit') return fill(d.discountLimit, { percent: percent(issue.requested ?? 0, locale), limit: percent(issue.limit, locale), role });
      if (issue) return d.discountFormat;
      return fill(d.discountMet, { percent: percent(evaluation.discountPercent, locale), limit: percent(evaluation.limit, locale), role });
    }
    case 'minimum': {
      if (!evaluation.lines.length) return d.noItems;
      const issue = evaluation.issues.find((item): item is Extract<Issue, { rule: 'minimum' }> => item.rule === 'minimum');
      return issue ? fill(d.minimumMissing, { missing: money(issue.missing, locale) }) : fill(d.minimumMet, { goods: money(evaluation.goods, locale) });
    }
    case 'shipping': {
      const shipping = evaluation.shipping;
      if (!shipping) return d.dependsOnCustomer;
      const region = regions[shipping.region][locale];
      return shipping.fee === 0 && shipping.freeFrom !== null
        ? fill(d.shippingFree, { region, threshold: money(shipping.freeFrom, locale) })
        : fill(d.shippingFee, { region, fee: money(shipping.fee, locale) });
    }
    case 'payment': return evaluation.customer ? `${paymentTerms[evaluation.customer.paymentTerm].name[locale]}.` : d.dependsOnCustomer;
    case 'total': {
      const shipping = evaluation.shipping?.fee ?? 0;
      return `${money(evaluation.subtotal, locale)} − ${money(evaluation.discountValue, locale)} + ${money(shipping, locale)} = ${money(evaluation.total, locale)}`;
    }
  }
}

export function rulesHtml(evaluation: Evaluation, locale: Locale, t: Strings): { list: string; count: string } {
  const p = t.parity;
  const glyph: Record<RuleStatus, string> = { met: icons.check, unmet: icons.cross, waiting: icons.waiting };
  const list = RULE_IDS.map((id) => {
    const status = evaluation.rules[id];
    const name = fill(p.rules[id], { min: money(MINIMUM_ORDER, locale) });
    return `
      <li class="vt-rule is-${status}">
        <span class="vt-rule__status">${glyph[status]}<span>${esc(p.status[status])}</span></span>
        <span class="vt-rule__body"><span class="vt-rule__name">${esc(name)}</span><span class="vt-rule__detail">${esc(ruleDetail(id, evaluation, locale, t))}</span></span>
      </li>`;
  }).join('');
  const met = RULE_IDS.filter((id) => evaluation.rules[id] === 'met').length;
  return { list, count: fill(p.rulesCount, { met, total: RULE_IDS.length }) };
}
