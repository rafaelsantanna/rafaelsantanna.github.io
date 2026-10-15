// The new screen: sections, searchable fields, inline validation, live totals, review and a simulated submission.
import { findCustomer, findProduct, paymentTerms, regions } from '../catalog.ts';
import { addProduct, blankDraft, removeLine, setCustomer, setDiscount, setQuantity, toOrderInput } from '../draft.ts';
import { clock, count, esc, fill, money } from '../format.ts';
import { icons } from '../icons.ts';
import {
  customerCard, customerOptions, discountHint, discountMessage, discountPreview, doneHtml, errorHtml, issueLinks, itemsFooter,
  limitPosition, lineInputId, productOptions, reviewHtml, stepStates, stepsHtml, summaryBody, termsTiles, typedDiscount, type View, type Visibility,
} from '../render-modern.ts';
import { evaluateOrder, type Evaluation } from '../rules.ts';
import { searchCustomers, searchProducts } from '../search.ts';
import type { Autosave, SaveStatus } from './autosave.ts';
import { createCombobox } from './combobox.ts';
import { focusInView, must, type Context } from './dom.ts';
import { createItemsTable } from './modern-items.ts';
import type { Store } from './store.ts';

export interface ModernScreen {
  reset(): void;
  showSaveStatus(status: SaveStatus, at?: Date): void;
}

export function initModern(root: HTMLElement, store: Store, context: Context, autosave: Autosave): ModernScreen {
  const { locale, t, announce } = context;
  const m = t.modern;
  const q = <T extends HTMLElement = HTMLElement>(selector: string) => must<T>(root, selector);
  const el = {
    role: q('[data-m-role]'),
    saveText: q('[data-m-save-text]'),
    discard: q<HTMLButtonElement>('[data-m-discard]'),
    steps: q('[data-m-steps]'),
    errors: q('[data-m-errors]'),
    views: { edit: q('[data-m-view="edit"]'), review: q('[data-m-view="review"]'), done: q('[data-m-view="done"]') },
    customerError: q('[data-m-error="customer"]'),
    customerCard: q('[data-m-customer-card]'),
    itemsError: q('[data-m-error="items"]'),
    table: q('[data-m-table]'),
    empty: q('[data-m-empty]'),
    foot: q('[data-m-items-foot]'),
    discount: q<HTMLInputElement>('[data-m-discount]'),
    discountHint: q('[data-m-discount-hint]'),
    discountError: q('[data-m-error="discount"]'),
    discountPreview: q('[data-m-discount-preview]'),
    limit: q('[data-m-limit]'),
    tiles: q('[data-m-tiles]'),
    summary: q('[data-m-summary]'),
    summaryBody: q('[data-m-sum-body]'),
    toggle: q<HTMLButtonElement>('[data-m-sum-toggle]'),
    toggleLabel: q('[data-m-sum-toggle-label]'),
    cta: q<HTMLButtonElement>('[data-m-cta]'),
    ctaBar: q<HTMLButtonElement>('[data-m-cta-bar]'),
    barTotal: q('[data-m-bar-total]'),
    barIssues: q('[data-m-bar-issues]'),
  };
  const items = createItemsTable(q('[data-m-rows]'), context);
  const visibility: Visibility = { customer: false, items: false, typingKey: '', typingDiscount: false };
  let view: View = 'edit';
  let attempted = false;

  const evaluate = (): Evaluation => {
    const { draft, role } = store.get();
    return evaluateOrder({ ...toOrderInput(draft), discount: typedDiscount(draft.discount, visibility) }, role);
  };

  const setError = (element: HTMLElement, message: string, input?: HTMLInputElement) => {
    element.innerHTML = errorHtml(message);
    element.hidden = !message;
    if (!input) return;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  const customerCombo = createCombobox({
    root: q('[data-combo="customer"]'),
    status: q('[data-combo-status="customer"]'),
    search: (query) => {
      const selected = findCustomer(store.get().draft.customerId);
      const result = searchCustomers(selected && query.trim() === selected.name ? '' : query, locale);
      return { html: customerOptions(result.items, result.terms, locale), count: result.items.length };
    },
    noResults: (query) => fill(m.customer.noResults, { q: query }),
    resultsText: (n) => count(n, m.customer.results),
    onSelect: (id) => {
      const customer = findCustomer(id);
      if (!customer) return;
      store.setDraft(setCustomer(store.get().draft, id), 'modern');
      customerCombo.input.value = customer.name;
      announce(fill(m.customer.selected, { name: customer.name, region: regions[customer.region][locale], terms: paymentTerms[customer.paymentTerm].name[locale] }));
    },
    onDisabled: () => undefined,
    autoSelect: true,
  });

  const productCombo = createCombobox({
    root: q('[data-combo="product"]'),
    status: q('[data-combo-status="product"]'),
    search: (query) => {
      const result = searchProducts(query, locale);
      return { html: productOptions(result.items, result.terms, locale, t), count: result.items.length };
    },
    noResults: (query) => fill(m.items.noResults, { q: query }),
    resultsText: (n) => count(n, m.items.results),
    onSelect: (sku) => {
      const product = findProduct(sku);
      if (!product) return;
      const existed = store.get().draft.lines.some((line) => line.sku === sku);
      store.setDraft(addProduct(store.get().draft, sku), 'modern');
      productCombo.input.value = '';
      const evaluation = evaluate();
      const line = evaluation.lines.find((item) => item.product.sku === sku);
      const name = product.name[locale];
      const total = money(evaluation.total, locale);
      announce(existed ? fill(m.items.incremented, { name, qty: line?.quantity ?? '', total }) : fill(m.items.added, { name, total }));
    },
    onDisabled: (sku) => {
      const product = findProduct(sku);
      if (product) announce(fill(m.items.outOfStockLive, { name: product.name[locale] }));
    },
    autoSelect: true,
  });

  const renderErrorSummary = (evaluation: Evaluation) => {
    const show = attempted && view === 'edit' && !evaluation.valid;
    el.errors.hidden = !show;
    if (!show) return;
    const links = issueLinks(evaluation, locale, t);
    el.errors.innerHTML = `
      <h4 class="vt-m-alert__title">${icons.alert}<span>${esc(count(links.length, m.errorSummary))}</span></h4>
      <ul>${links.map((link) => `<li><button type="button" class="vt-link" data-focus-target="${esc(link.target)}">${esc(link.text)}</button></li>`).join('')}</ul>`;
  };

  const update = () => {
    const { draft, role } = store.get();
    const evaluation = evaluate();
    const active = document.activeElement;
    el.role.textContent = fill(m.roleChip, { role: t.roles[role] });

    if (active !== customerCombo.input) customerCombo.input.value = evaluation.customer?.name ?? '';
    el.customerCard.innerHTML = customerCard(evaluation, locale, t);
    setError(el.customerError, visibility.customer && !evaluation.customer ? m.customer.required : '', customerCombo.input);

    items.render(evaluation, draft, visibility);
    el.table.hidden = evaluation.lines.length === 0;
    el.empty.hidden = evaluation.lines.length > 0;
    el.foot.innerHTML = itemsFooter(evaluation, locale, t);
    el.foot.hidden = evaluation.lines.length === 0;
    setError(el.itemsError, visibility.items && !evaluation.lines.length ? m.items.required : '', productCombo.input);

    if (active !== el.discount) el.discount.value = draft.discount;
    setError(el.discountError, discountMessage(evaluation, locale, t), el.discount);
    el.discountHint.textContent = discountHint(evaluation, locale, t);
    el.discountPreview.textContent = discountPreview(evaluation, locale, t);
    el.limit.style.setProperty('--vt-value', limitPosition(evaluation.requestedDiscount ?? 0));
    el.tiles.innerHTML = termsTiles(evaluation, locale, t);

    el.summaryBody.innerHTML = summaryBody(evaluation, view, locale, t);
    el.barTotal.textContent = money(evaluation.total, locale);
    const settled = view === 'done' ? m.summary.sent : view === 'review' ? m.summary.reviewed : m.summary.ready;
    el.barIssues.textContent = evaluation.issues.length ? count(evaluation.issues.length, m.summary.issues) : settled;
    el.steps.innerHTML = stepsHtml(stepStates(evaluation, visibility, view), t, view !== 'done');
    renderErrorSummary(evaluation);
  };

  const setSummaryOpen = (open: boolean) => {
    el.summary.classList.toggle('is-open', open);
    el.toggle.setAttribute('aria-expanded', String(open));
    el.toggleLabel.textContent = open ? m.summary.collapse : m.summary.expand;
  };

  const setView = (next: View) => {
    view = next;
    el.views.edit.hidden = view !== 'edit';
    el.views.review.hidden = view !== 'review';
    el.views.done.hidden = view !== 'done';
    el.views.review.innerHTML = view === 'review' ? reviewHtml(evaluate(), locale, t) : '';
    el.views.done.innerHTML = view === 'done' ? doneHtml(evaluate(), locale, t) : '';
    el.discard.hidden = view === 'done';
    el.cta.hidden = view === 'done';
    el.ctaBar.hidden = view === 'done';
    el.cta.textContent = view === 'edit' ? m.summary.review : m.summary.send;
    el.ctaBar.textContent = view === 'edit' ? m.summary.reviewShort : m.summary.sendShort;
    el.ctaBar.setAttribute('aria-label', view === 'edit' ? m.summary.review : m.summary.send);
    setSummaryOpen(false);
    update();
  };

  const focusHeading = (selector: string) => {
    const heading = root.querySelector<HTMLElement>(selector);
    if (heading) focusInView(heading, context, 'start');
  };

  const resetVisibility = () => {
    visibility.customer = false;
    visibility.items = false;
    visibility.typingKey = '';
    attempted = false;
  };

  const review = () => {
    if (evaluate().valid) {
      setView('review');
      focusHeading('#vt-m-review-title');
      return;
    }
    attempted = true;
    visibility.customer = true;
    visibility.items = true;
    setSummaryOpen(false);
    update();
    focusInView(el.errors, context, 'start');
  };

  const send = () => {
    setView('done');
    autosave.settle('sent');
    focusHeading('#vt-m-done-title');
  };

  const startOver = (status: SaveStatus) => {
    resetVisibility();
    setView('edit');
    store.setDraft(blankDraft(), 'modern');
    autosave.settle(status);
  };

  const focusTarget = (target: string) => {
    setSummaryOpen(false);
    const fields: Record<string, HTMLElement> = { customer: customerCombo.input, product: productCombo.input, discount: el.discount };
    const element = target.startsWith('line:') ? root.querySelector<HTMLElement>(`#${lineInputId(target.slice(5))}`) : fields[target];
    if (element) focusInView(element, context);
  };

  const step = (row: HTMLElement, delta: number) => {
    const key = row.dataset.line ?? '';
    const line = store.get().draft.lines.find((item) => item.key === key);
    const product = line && findProduct(line.sku);
    if (!line || !product) return;
    const current = /^\d+$/.test(line.quantity.trim()) ? Number(line.quantity.trim()) : 0;
    const next = Math.min(Math.max(current + delta, 1), product.stock);
    if (next === current) return;
    store.setDraft(setQuantity(store.get().draft, key, String(next)), 'modern');
    announce(`${fill(m.items.qty, { name: product.name[locale] })}: ${next}`);
  };

  const remove = (row: HTMLElement) => {
    const key = row.dataset.line ?? '';
    const line = store.get().draft.lines.find((item) => item.key === key);
    const product = line && findProduct(line.sku);
    const neighbour = (row.nextElementSibling ?? row.previousElementSibling) as HTMLElement | null;
    const neighbourKey = neighbour?.dataset.line;
    store.setDraft(removeLine(store.get().draft, key), 'modern');
    const next = neighbourKey ? root.querySelector<HTMLElement>(`[data-line="${neighbourKey}"] [data-remove]`) : null;
    (next ?? productCombo.input).focus();
    if (product) announce(fill(m.items.removed, { name: product.name[locale], total: money(evaluate().total, locale) }));
  };

  root.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    const { draft } = store.get();
    if (target.matches('[data-qty]')) {
      const key = target.closest<HTMLElement>('[data-line]')?.dataset.line ?? '';
      store.setDraft(setQuantity(draft, key, target.value), 'modern');
    } else if (target === el.discount) {
      store.setDraft(setDiscount(draft, target.value), 'modern');
    } else if (target === customerCombo.input && !target.value.trim() && draft.customerId) {
      store.setDraft(setCustomer(draft, ''), 'modern');
    }
  });

  root.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    if (target.matches('[data-qty]')) visibility.typingKey = target.closest<HTMLElement>('[data-line]')?.dataset.line ?? '';
    else if (target === el.discount) visibility.typingDiscount = true;
  });

  root.addEventListener('focusout', (event) => {
    const target = event.target as HTMLElement;
    const leaving = (scope: string) => target.closest(scope) && !target.closest(scope)?.contains(event.relatedTarget as Node | null);
    if (target.matches('[data-qty]')) {
      visibility.typingKey = '';
      update();
    } else if (target === el.discount) {
      visibility.typingDiscount = false;
      update();
    } else if (leaving('[data-combo="customer"]')) {
      visibility.customer = true;
      update();
    }
  });

  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (target.matches('[data-qty]')) {
      const row = target.closest<HTMLElement>('[data-line]');
      if (!row) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        step(row, event.key === 'ArrowUp' ? 1 : -1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        productCombo.input.focus();
      }
    } else if (event.key === 'Escape' && el.summary.classList.contains('is-open') && el.summary.contains(target)) {
      setSummaryOpen(false);
      el.toggle.focus();
    }
  });

  root.addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLElement>('button, a');
    if (!target) return;
    const row = target.closest<HTMLElement>('[data-line]');
    if (target.matches('[data-step]') && row) {
      if (target.getAttribute('aria-disabled') !== 'true') step(row, Number(target.dataset.step));
    } else if (target.matches('[data-remove]') && row) remove(row);
    else if (target.dataset.focusTarget) focusTarget(target.dataset.focusTarget);
    else if (target === el.cta || target === el.ctaBar) {
      if (view === 'edit') review();
      else send();
    } else if (target.dataset.action === 'edit') {
      setView('edit');
      focusHeading('#vt-m-s-customer-title');
    } else if (target.dataset.action === 'send') send();
    else if (target.dataset.action === 'new') {
      startOver('blank');
      customerCombo.input.focus();
    } else if (target === el.discard) {
      startOver('discarded');
      announce(m.discarded);
    } else if (target === el.toggle) setSummaryOpen(!el.summary.classList.contains('is-open'));
    else if (target.matches('.vt-steps a')) {
      event.preventDefault();
      // From the review, a step link goes back to editing that section.
      if (view !== 'edit') setView('edit');
      focusHeading(`${target.getAttribute('href')}-title`);
    }
  });

  store.subscribe((state, source, previous) => {
    if (view !== 'edit' && (source !== 'modern' && state.draft !== previous.draft)) setView('edit');
    else if (view === 'review' && !evaluate().valid) setView('edit');
    else if (view === 'review') {
      el.views.review.innerHTML = reviewHtml(evaluate(), locale, t);
      update();
    } else update();
  });

  update();

  return {
    reset() {
      resetVisibility();
      setView('edit');
    },
    showSaveStatus(status, at) {
      const a = m.autosave;
      const time = clock(at ?? new Date(), locale);
      const text: Record<SaveStatus, string> = {
        example: a.example,
        blank: a.blank,
        saving: a.saving,
        saved: fill(a.saved, { time }),
        restored: fill(a.restored, { time }),
        unavailable: a.unavailable,
        sent: a.sent,
        discarded: m.discarded,
      };
      const icon = status === 'unavailable' ? icons.unsaved : status === 'saved' || status === 'restored' ? icons.saved : icons.cloud;
      el.saveText.innerHTML = `${icon}<span>${esc(text[status])}</span>`;
      el.saveText.classList.toggle('is-warning', status === 'unavailable');
    },
  };
}
