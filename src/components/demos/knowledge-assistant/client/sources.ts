import { plural } from '../strings';
import type { Ctx } from './context';

/** Document filter in the sources library, mirrored by a chip next to the composer. */
export function setupSources(root: HTMLElement, ctx: Ctx, onChange: (docs: string[] | null) => void) {
  const { t } = ctx;
  const toggles = [...root.querySelectorAll<HTMLButtonElement>('[data-ka-doc]')];
  const text = root.querySelector<HTMLElement>('[data-ka-filter-text]');
  const clear = root.querySelector<HTMLButtonElement>('[data-ka-filter-clear]');
  const chip = root.querySelector<HTMLElement>('[data-ka-filter-chip]');
  const chipText = root.querySelector<HTMLElement>('[data-ka-filter-chip-text]');
  const chipClear = root.querySelector<HTMLButtonElement>('[data-ka-filter-chip-clear]');
  const total = toggles.length;
  let selected = new Set<string>();

  function current(): string[] | null {
    return selected.size > 0 && selected.size < total ? [...selected] : null;
  }

  function label(): string {
    return selected.size > 0 ? plural(t.filterSome, selected.size, { total }) : t.filterAll;
  }

  function render(): void {
    for (const toggle of toggles) toggle.setAttribute('aria-pressed', String(selected.has(toggle.dataset.kaDoc ?? '')));
    if (text) text.textContent = label();
    if (clear) clear.hidden = selected.size === 0;
    if (chip) chip.hidden = current() === null;
    if (chipText) chipText.textContent = selected.size > 0 ? plural(t.filterChip, selected.size) : '';
  }

  function reset(): void {
    selected.clear();
    render();
    onChange(null);
  }

  toggles.forEach((toggle) => toggle.addEventListener('click', () => {
    const id = toggle.dataset.kaDoc ?? '';
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    render();
    onChange(current());
  }));
  clear?.addEventListener('click', reset);
  chipClear?.addEventListener('click', reset);

  return {
    set(docs: string[] | null): void {
      selected = new Set(docs ?? []);
      render();
    },
    label,
    count: () => selected.size,
    total,
  };
}
