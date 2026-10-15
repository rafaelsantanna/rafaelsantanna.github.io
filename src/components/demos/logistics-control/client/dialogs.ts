/**
 * Modal dialogs on top of the native <dialog> element: focus moves in on open, Tab stays inside,
 * Escape or a backdrop click closes, and focus returns to the control that opened it.
 */
import { byKey, focusables } from './dom';

interface Entry { dialog: HTMLDialogElement; opener: HTMLElement | null; openerKey?: string; onClose?: () => void }
export interface OpenOptions { opener?: HTMLElement | null; initialFocus?: () => HTMLElement | null; onClose?: () => void }

export function createDialogs(root: HTMLElement, fallbackFocus: () => HTMLElement | null) {
  const stack: Entry[] = [];

  const find = (name: string) => root.querySelector<HTMLDialogElement>(`dialog[data-dialog="${name}"]`);

  function close(dialog: HTMLDialogElement, restoreFocus = true) {
    const index = stack.findIndex((entry) => entry.dialog === dialog);
    if (index === -1) return;
    const [entry] = stack.splice(index, 1);
    dialog.close();
    entry.onClose?.();
    if (!restoreFocus) return;
    const target = entry.opener?.isConnected && entry.opener.offsetParent !== null ? entry.opener : byKey(root, entry.openerKey);
    (target ?? stack[stack.length - 1]?.dialog ?? fallbackFocus())?.focus({ preventScroll: true });
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const dialog = event.currentTarget as HTMLDialogElement;
    const items = focusables(dialog);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  root.querySelectorAll<HTMLDialogElement>('dialog[data-dialog]').forEach((dialog) => {
    dialog.addEventListener('keydown', onKeydown);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close(dialog);
    });
    // A click on the backdrop lands on the dialog element itself, outside its box.
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      if (!inside) close(dialog);
    });
  });

  return {
    open(name: string, options: OpenOptions = {}) {
      const dialog = find(name);
      if (!dialog || dialog.open) return dialog;
      const opener = options.opener ?? (document.activeElement as HTMLElement | null);
      stack.push({ dialog, opener, openerKey: opener?.closest<HTMLElement>('[data-key]')?.dataset.key, onClose: options.onClose });
      dialog.showModal();
      (options.initialFocus?.() ?? focusables(dialog)[0])?.focus();
      return dialog;
    },
    close,
    closeByName(name: string, restoreFocus = true) {
      const dialog = find(name);
      if (dialog) close(dialog, restoreFocus);
    },
    isOpen: (name: string) => Boolean(find(name)?.open),
    top: () => stack[stack.length - 1]?.dialog ?? null,
    anyOpen: () => stack.length > 0,
  };
}
