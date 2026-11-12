// Compares what each screen shows for the current order: the legacy one as of its last Calcular, the modern one live.
import { toOrderInput } from '../draft.ts';
import { count, fill } from '../format.ts';
import { parityHtml, rulesHtml } from '../render-parity.ts';
import { RULE_IDS, evaluateOrder } from '../rules.ts';
import { must, type Context } from './dom.ts';
import type { LegacyScreen } from './legacy.ts';
import type { Store } from './store.ts';

/** Restarts a CSS animation class on an element. */
function replay(element: Element, className: string): void {
  element.classList.remove(className);
  void (element as HTMLElement).offsetWidth;
  element.classList.add(className);
}

export function initParity(root: HTMLElement, chip: HTMLElement, store: Store, legacy: LegacyScreen, context: Context): void {
  const verdict = must(root, '[data-parity-verdict]');
  const rows = must(root, '[data-parity-rows]');
  const list = must(root, '[data-rules-list]');
  const total = must(root, '[data-rules-count]');
  const bar = must(root, '[data-rules-bar]');
  const flow = must(root, '[data-flow]');
  const chipText = must(chip, '[data-parity-chip-text]');
  const chipRules = must(chip, '[data-parity-chip-rules]');
  const c = context.t.page.parityChip;
  let frame = 0;
  let first = true;

  const render = () => {
    frame = 0;
    const { draft, role } = store.get();
    const modern = evaluateOrder(toOrderInput(draft), role);
    const parity = parityHtml(legacy.reading(), modern, context.locale, context.t);
    const rules = rulesHtml(modern, context.locale, context.t);

    // Rows and rules whose content changed light up again, so a re-check is visible at a glance.
    const before = Array.from(rows.children, (row) => row.textContent);
    const ruleBefore = new Map(Array.from(list.children, (item) => [(item as HTMLElement).dataset.rule, item.textContent]));
    verdict.innerHTML = parity.verdict;
    verdict.classList.toggle('is-different', !parity.agree);
    rows.innerHTML = parity.rows;
    list.innerHTML = rules.list;
    total.textContent = rules.count;
    bar.innerHTML = rules.bar;
    chipText.textContent = parity.agree ? c.agree : count(parity.differences, c.differ);
    chipRules.textContent = fill(c.rules, { met: rules.met, total: RULE_IDS.length });
    chip.classList.toggle('is-different', !parity.agree);
    if (first) {
      first = false;
      return;
    }
    let changed = false;
    Array.from(rows.children).forEach((row, index) => {
      if (row.textContent !== before[index]) {
        row.classList.add('is-changed');
        changed = true;
      }
    });
    Array.from(list.children).forEach((item) => {
      if (ruleBefore.get((item as HTMLElement).dataset.rule) !== item.textContent) item.classList.add('is-changed');
    });
    if (changed) {
      replay(flow, 'is-pulse');
      replay(chip, 'is-checked');
    }
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };
  store.subscribe(schedule);
  legacy.onTotals(schedule);
  render();
}
