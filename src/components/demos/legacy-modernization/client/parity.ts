// Compares what each screen shows for the current order: the legacy one as of its last Calcular, the modern one live.
import { toOrderInput } from '../draft.ts';
import { parityHtml, rulesHtml } from '../render-parity.ts';
import { evaluateOrder } from '../rules.ts';
import { must, type Context } from './dom.ts';
import type { LegacyScreen } from './legacy.ts';
import type { Store } from './store.ts';

export function initParity(root: HTMLElement, store: Store, legacy: LegacyScreen, context: Context): void {
  const verdict = must(root, '[data-parity-verdict]');
  const rows = must(root, '[data-parity-rows]');
  const list = must(root, '[data-rules-list]');
  const total = must(root, '[data-rules-count]');
  let frame = 0;

  const render = () => {
    frame = 0;
    const { draft, role } = store.get();
    const modern = evaluateOrder(toOrderInput(draft), role);
    const parity = parityHtml(legacy.reading(), modern, context.locale, context.t);
    verdict.innerHTML = parity.verdict;
    verdict.classList.toggle('is-different', !parity.agree);
    rows.innerHTML = parity.rows;
    const rules = rulesHtml(modern, context.locale, context.t);
    list.innerHTML = rules.list;
    total.textContent = rules.count;
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  store.subscribe(schedule);
  legacy.onTotals(schedule);
  render();
}
