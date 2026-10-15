// Items table of the modern screen: full redraw when lines change, in-place patches while typing.
import type { Draft } from '../draft.ts';
import { errorHtml, itemRows, lineMessage, lineTotalHtml, type Visibility } from '../render-modern.ts';
import type { Evaluation } from '../rules.ts';
import type { Context } from './dom.ts';

type FocusRole = 'qty' | 'dec' | 'inc' | 'remove';
const selectors: Record<FocusRole, string> = { qty: '[data-qty]', dec: '[data-step="-1"]', inc: '[data-step="1"]', remove: '[data-remove]' };

interface FocusMemo {
  key: string;
  role: FocusRole;
  start: number | null;
  end: number | null;
}

export interface ItemsTable {
  render(evaluation: Evaluation, draft: Draft, visibility: Visibility): void;
}

export function createItemsTable(body: HTMLElement, context: Context): ItemsTable {
  let renderedKeys: string | null = null;

  const capture = (): FocusMemo | null => {
    const active = document.activeElement as HTMLElement | null;
    const row = active?.closest<HTMLElement>('[data-line]');
    if (!active || !row || !body.contains(row)) return null;
    const role = (Object.keys(selectors) as FocusRole[]).find((name) => active.matches(selectors[name]));
    if (!role) return null;
    const input = active instanceof HTMLInputElement ? active : null;
    return { key: row.dataset.line ?? '', role, start: input?.selectionStart ?? null, end: input?.selectionEnd ?? null };
  };

  const restore = (memo: FocusMemo | null) => {
    if (!memo) return;
    const target = body.querySelector<HTMLElement>(`[data-line="${memo.key}"] ${selectors[memo.role]}`);
    if (!target) return;
    target.focus({ preventScroll: true });
    if (target instanceof HTMLInputElement && memo.start !== null) target.setSelectionRange(memo.start, memo.end ?? memo.start);
  };

  const patch = (evaluation: Evaluation, draft: Draft, visibility: Visibility) => {
    const raw = new Map(draft.lines.map((line) => [line.key, line.quantity]));
    for (const line of evaluation.lines) {
      const row = body.querySelector<HTMLElement>(`[data-line="${line.key}"]`);
      const input = row?.querySelector<HTMLInputElement>('[data-qty]');
      const error = row?.querySelector<HTMLElement>('[data-line-error]');
      const total = row?.querySelector<HTMLElement>('[data-line-total]');
      if (!row || !input || !error || !total) continue;
      const value = raw.get(line.key) ?? '';
      // Typing already stores the box's own text, so only outside changes (arrow keys, steppers, a repeated search) rewrite it.
      if (input.value !== value) input.value = value;
      const message = lineMessage(line, visibility, context.t);
      error.innerHTML = errorHtml(message);
      error.hidden = !message;
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      row.classList.toggle('is-invalid', Boolean(message));
      total.innerHTML = lineTotalHtml(line, context.locale, context.t);
      const qty = line.quantity ?? 0;
      row.querySelector('[data-step="-1"]')?.setAttribute('aria-disabled', String(qty <= 1));
      row.querySelector('[data-step="1"]')?.setAttribute('aria-disabled', String(qty >= line.product.stock));
    }
  };

  return {
    render(evaluation, draft, visibility) {
      const keys = evaluation.lines.map((line) => line.key).join('|');
      if (keys === renderedKeys) {
        patch(evaluation, draft, visibility);
        return;
      }
      const memo = capture();
      body.innerHTML = itemRows(evaluation, draft, visibility, context.locale, context.t);
      renderedKeys = keys;
      restore(memo);
    },
  };
}
