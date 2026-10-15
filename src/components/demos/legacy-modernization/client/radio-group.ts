// WAI-ARIA radio group made of buttons: roving tabindex, arrows move and select, Home and End jump.
export interface RadioGroup {
  set(value: string): void;
}

export function initRadioGroup(group: HTMLElement, onChange: (value: string) => void): RadioGroup {
  const options = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]'));

  const set = (value: string) => {
    for (const option of options) {
      const checked = option.dataset.value === value;
      option.setAttribute('aria-checked', String(checked));
      option.tabIndex = checked ? 0 : -1;
    }
  };

  const choose = (option: HTMLButtonElement, focus: boolean) => {
    const value = option.dataset.value ?? '';
    const changed = option.getAttribute('aria-checked') !== 'true';
    set(value);
    if (focus) option.focus();
    if (changed) onChange(value);
  };

  group.addEventListener('click', (event) => {
    const option = (event.target as Element).closest<HTMLButtonElement>('[role="radio"]');
    if (option) choose(option, false);
  });

  group.addEventListener('keydown', (event) => {
    // Options hidden by the layout (Compare on narrow screens) are skipped.
    const shown = options.filter((option) => option.getClientRects().length > 0);
    const current = shown.indexOf(event.target as HTMLButtonElement);
    if (current === -1) return;
    const last = shown.length - 1;
    const next: Record<string, number> = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowDown: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      ArrowUp: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    choose(shown[next[event.key]], true);
  });

  return { set };
}
