import type { Ctx } from './context';

/** Question box: Enter sends, Shift+Enter adds a line, empty questions get a gentle hint. */
export function createComposer(root: HTMLElement, ctx: Ctx, onSubmit: (question: string) => void, announce: (message: string) => void) {
  const { t } = ctx;
  const input = root.querySelector<HTMLTextAreaElement>('[data-ka-input]');
  const send = root.querySelector<HTMLButtonElement>('[data-ka-send]');
  const hint = root.querySelector<HTMLElement>('[data-ka-hint]');
  const count = root.querySelector<HTMLElement>('[data-ka-count]');
  const max = Number(count?.dataset.max ?? input?.maxLength ?? 300);

  function updateCount(): void {
    if (!input || !count) return;
    const length = input.value.length;
    count.textContent = `${length}/${max}`;
    count.classList.toggle('is-near', length >= max - 30);
  }

  function setWarning(on: boolean): void {
    if (!hint) return;
    hint.textContent = on ? t.hintEmpty : t.hint;
    hint.parentElement?.classList.toggle('is-warning', on);
  }

  function trySubmit(): void {
    if (!input || input.disabled) return;
    const value = input.value;
    if (!value.trim()) {
      setWarning(true);
      announce(t.hintEmpty);
      input.focus();
      return;
    }
    input.value = '';
    updateCount();
    onSubmit(value);
  }

  input?.addEventListener('input', () => {
    updateCount();
    setWarning(false);
  });
  input?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    trySubmit();
  });
  send?.addEventListener('click', trySubmit);
  updateCount();

  return {
    setBusy(busy: boolean): void {
      if (input) input.disabled = busy;
      if (send) send.disabled = busy;
      root.toggleAttribute('data-busy', busy);
    },
    focus(): void {
      input?.focus();
    },
    clear(): void {
      if (input) input.value = '';
      updateCount();
      setWarning(false);
    },
  };
}
