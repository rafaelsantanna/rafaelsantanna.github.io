import { copyText } from './clipboard';

const RESET_AFTER = 2400;

/**
 * Reveals and wires every [data-copy-button] inside root. Each button copies its data-copy-value,
 * swaps its [data-copy-label] text and reports the result in the root's shared [data-copy-status] live region.
 */
export function enhanceCopyButtons(root: HTMLElement): void {
  const status = root.querySelector<HTMLElement>('[data-copy-status]');
  if (!status) return;

  root.querySelectorAll<HTMLButtonElement>('[data-copy-button]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('[data-copy-label]');
    const { labelIdle = '', labelDone = '', statusDone = '', statusFailed = '' } = button.dataset;
    let timer = 0;

    button.hidden = false;
    button.addEventListener('click', async () => {
      const copied = await copyText(button.dataset.copyValue ?? '');
      window.clearTimeout(timer);
      button.toggleAttribute('data-copied', copied);
      if (label) label.textContent = copied ? labelDone : labelIdle;
      status.textContent = copied ? statusDone : statusFailed;
      status.toggleAttribute('data-error', !copied);
      timer = window.setTimeout(() => {
        button.removeAttribute('data-copied');
        if (label) label.textContent = labelIdle;
        // Another button may have reported since; only clear this button's own message.
        if (copied && status.textContent === statusDone) status.textContent = '';
      }, RESET_AFTER);
    });
  });
}
