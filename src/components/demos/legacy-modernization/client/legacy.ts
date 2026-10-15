// The 2009 screen: every field at once, totals only after "Calcular", every error in one modal.
import { findCustomer } from '../catalog.ts';
import { blankDraft, isBlank, setCustomer, setDiscount, setLineAt } from '../draft.ts';
import { esc, plain, shortDate } from '../format.ts';
import {
  LEGACY_MIN_ROWS, customerFields, customerOptions, dialogIcons, gridRows, legacyMessages, productCells, roleText, totalsText,
} from '../render-legacy.ts';
import type { LegacyReading } from '../render-parity.ts';
import { evaluateOrder, type Evaluation, type OrderInput } from '../rules.ts';
import { must, type Context } from './dom.ts';
import type { Store } from './store.ts';

export interface LegacyScreen {
  /** What the screen shows right now: the totals of the last Calcular next to the fields as typed. */
  reading(): LegacyReading;
  /** Back to a fresh screen; `calculated` mirrors a clerk who already clicked Calcular. */
  reset(calculated: boolean): void;
  /** Calcular and resets change the totals on screen without touching the shared order. */
  onTotals(listener: () => void): void;
}

interface DialogButton {
  label: string;
  value: string;
  primary?: boolean;
}

export function initLegacy(root: HTMLElement, store: Store, context: Context): LegacyScreen {
  const { locale, t } = context;
  const l = t.legacy;
  const rowsBody = must(root, '[data-l-rows]');
  const customer = must<HTMLSelectElement>(root, '[data-l-customer]');
  const discount = must<HTMLInputElement>(root, '[data-l-discount]');
  const status = must(root, '[data-l-status]');
  const dialog = must<HTMLDialogElement>(root, '[data-l-dialog]');
  const field = (name: string) => must<HTMLInputElement>(root, `[data-l-${name}]`);

  let rows = Math.max(LEGACY_MIN_ROWS, store.get().draft.lines.length);
  let calc: Evaluation | null = null;
  let signature = '';
  const totalsListeners: Array<() => void> = [];

  const readInput = (): OrderInput => {
    const lines = store.get().draft.lines;
    return {
      customerId: customer.value,
      discount: discount.value,
      lines: Array.from(rowsBody.querySelectorAll<HTMLTableRowElement>('tr')).map((row, index) => ({
        key: lines[index]?.key ?? `row${index}`,
        sku: must<HTMLSelectElement>(row, '[data-l-product]').value,
        quantity: must<HTMLInputElement>(row, '[data-l-qty]').value,
      })),
    };
  };
  // Only rows with a product reach the rules, so an empty row from "Incluir linha" leaves nothing to recalculate.
  const currentSignature = () => {
    const input = readInput();
    const lines = input.lines.flatMap((line, index) => (line.sku ? [[index, line.sku, line.quantity]] : []));
    return JSON.stringify([input.customerId, input.discount, lines, store.get().role]);
  };
  // Totals match the fields only until something changes after Calcular; zeros on a blank screen are not out of date.
  const isStale = () => (calc ? signature !== currentSignature() : !isBlank(store.get().draft));
  const totalsChanged = () => totalsListeners.forEach((listener) => listener());

  const showTotals = () => {
    const totals = totalsText(calc, locale);
    field('subtotal').value = totals.subtotal;
    field('discount-value').value = totals.discount;
    field('freight').value = totals.freight;
    field('total').value = totals.total;
  };

  const showCustomer = () => {
    const values = customerFields(findCustomer(customer.value) ?? null, locale);
    field('city').value = values.city;
    field('region').value = values.region;
    field('terms').value = values.terms;
  };

  const showRole = () => {
    const text = roleText(store.get().role, t);
    field('role').value = text;
    must(root, '[data-l-status-role]').textContent = text;
  };

  const render = () => {
    const { draft } = store.get();
    rows = Math.max(rows, LEGACY_MIN_ROWS, draft.lines.length);
    customer.innerHTML = customerOptions(draft.customerId, t);
    rowsBody.innerHTML = gridRows(draft, calc, rows, locale, t);
    discount.value = draft.discount;
    showCustomer();
    showRole();
    showTotals();
  };

  const calculate = () => {
    calc = evaluateOrder(readInput(), store.get().role);
    signature = currentSignature();
    const byKey = new Map(calc.lines.map((line) => [line.key, line]));
    const keys = readInput().lines.map((line) => line.key);
    rowsBody.querySelectorAll<HTMLTableRowElement>('tr').forEach((row, index) => {
      const line = byKey.get(keys[index]);
      must(row, '[data-l-total]').textContent = line && line.quantity !== null ? plain(line.total, locale) : '';
    });
    showTotals();
    status.textContent = l.status.calculated;
    totalsChanged();
  };

  const openDialog = (icon: string, message: string, buttons: DialogButton[]): Promise<string> => {
    const opener = document.activeElement as HTMLElement | null;
    must(dialog, '[data-l-dialog-icon]').innerHTML = icon;
    must(dialog, '[data-l-dialog-message]').innerHTML = message;
    must(dialog, '[data-l-dialog-actions]').innerHTML = buttons
      .map((button) => `<button type="button" class="vt-l-btn${button.primary ? ' vt-l-btn--default' : ''}" value="${esc(button.value)}">${esc(button.label)}</button>`)
      .join('');
    dialog.returnValue = '';
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('.vt-l-btn--default')?.focus();
    return new Promise((resolve) => {
      dialog.addEventListener('close', () => {
        opener?.focus();
        resolve(dialog.returnValue);
      }, { once: true });
    });
  };

  const save = async () => {
    const evaluation = evaluateOrder(readInput(), store.get().role);
    const messages = legacyMessages(evaluation, isStale(), locale, t);
    if (messages.length) {
      status.textContent = l.status.notSaved;
      await openDialog(
        dialogIcons.warning,
        `<p>${esc(l.errorsIntro)}</p><ul>${messages.map((message) => `<li>${esc(message)}</li>`).join('')}</ul>`,
        [{ label: l.ok, value: 'ok', primary: true }],
      );
      return;
    }
    await openDialog(dialogIcons.info, `<p>${esc(l.savedMessage)}</p><p>${esc(l.savedNote)}</p>`, [{ label: l.ok, value: 'ok', primary: true }]);
    store.setDraft(blankDraft(), 'legacy');
    reset(false);
    status.textContent = l.status.saved;
    customer.focus();
  };

  const clear = async () => {
    const answer = await openDialog(dialogIcons.question, `<p>${esc(l.clearQuestion)}</p>`, [
      { label: l.yes, value: 'yes', primary: true },
      { label: l.no, value: 'no' },
    ]);
    if (answer !== 'yes') return;
    store.setDraft(blankDraft(), 'legacy');
    reset(false);
    status.textContent = l.status.cleared;
    customer.focus();
  };

  function reset(calculated: boolean) {
    rows = LEGACY_MIN_ROWS;
    calc = null;
    signature = '';
    render();
    if (calculated) calculate();
    else totalsChanged();
    status.textContent = l.status.ready;
  }

  const rowIndex = (element: Element) => Number(element.closest<HTMLElement>('tr')?.dataset.row ?? -1);

  root.addEventListener('change', (event) => {
    const target = event.target as HTMLElement;
    const { draft } = store.get();
    if (target === customer) {
      store.setDraft(setCustomer(draft, customer.value), 'legacy');
      showCustomer();
    } else if (target.matches('[data-l-product]')) {
      const select = target as HTMLSelectElement;
      store.setDraft(setLineAt(draft, rowIndex(select), { sku: select.value }), 'legacy');
      const row = select.closest('tr');
      if (!row) return;
      const cells = productCells(select.value, locale);
      must(row, '[data-l-unit]').textContent = cells.unit;
      must(row, '[data-l-price]').textContent = cells.price;
    }
  });

  root.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    const { draft } = store.get();
    if (target === discount) store.setDraft(setDiscount(draft, discount.value), 'legacy');
    else if (target.matches('[data-l-qty]')) store.setDraft(setLineAt(draft, rowIndex(target), { quantity: target.value }), 'legacy');
  });

  // Enter acts as the default button, as it did on the original form.
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.target as Element).matches('[data-l-qty], [data-l-discount]')) {
      event.preventDefault();
      calculate();
    }
  });

  root.addEventListener('click', (event) => {
    const target = (event.target as Element).closest('button');
    if (!target) return;
    if (target.matches('[data-l-calc]')) calculate();
    else if (target.matches('[data-l-save]')) void save();
    else if (target.matches('[data-l-clear]')) void clear();
    else if (target.matches('[data-l-dialog-close]')) dialog.close('cancel');
    else if (target.matches('[data-l-add]')) {
      rows += 1;
      rowsBody.innerHTML = gridRows(store.get().draft, calc, rows, locale, t);
      rowsBody.querySelector<HTMLSelectElement>('tr:last-child [data-l-product]')?.focus();
    } else if (target.closest('[data-l-dialog-actions]')) dialog.close(target.value);
  });

  store.subscribe((state, source, previous) => {
    if (source !== 'legacy') render();
    else if (state.role !== previous.role) showRole();
  });

  field('date').value = shortDate(new Date(), locale);
  return {
    reading: () => ({ shown: calc, live: evaluateOrder(readInput(), store.get().role), stale: isStale() }),
    reset,
    onTotals: (listener) => {
      totalsListeners.push(listener);
    },
  };
}
