export const BOOKING_HASH = '#agendar';

export interface DialogControl {
  /** Shows the modal and records #agendar in the history, so Back closes it. */
  open(): void;
  /** Closes the modal and runs `after` once the history entry is gone. */
  close(after?: () => void): void;
  readonly isOpen: boolean;
}

/** Native modal dialog kept in sync with the #agendar URL hash. */
export function createDialog(dialog: HTMLDialogElement, onHistoryOpen: () => void): DialogControl {
  let pushed = false;
  let pending: (() => void) | null = null;

  const flush = () => {
    const callback = pending;
    pending = null;
    if (callback) window.setTimeout(callback, 30);
  };

  dialog.addEventListener('close', () => {
    if (location.hash === BOOKING_HASH) {
      if (pushed) {
        pushed = false;
        history.back();
        return;
      }
      history.replaceState(history.state, '', `${location.pathname}${location.search}`);
    }
    flush();
  });

  window.addEventListener('popstate', () => {
    if (location.hash === BOOKING_HASH) {
      if (!dialog.open) {
        dialog.showModal();
        onHistoryOpen();
      }
      return;
    }
    pushed = false;
    if (dialog.open) dialog.close();
    else flush();
  });

  return {
    open() {
      if (dialog.open) return;
      if (location.hash !== BOOKING_HASH) {
        history.pushState(history.state, '', BOOKING_HASH);
        pushed = true;
      }
      dialog.showModal();
    },
    close(after) {
      pending = after ?? null;
      if (dialog.open) dialog.close();
      else flush();
    },
    get isOpen() {
      return dialog.open;
    },
  };
}
