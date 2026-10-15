const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab and Shift+Tab inside a modal surface. Focus can also rest on an element that is not in the tab order,
 * such as a heading with tabindex="-1", so anything outside the list of tabbable items wraps as well.
 */
function trapTab(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.getClientRects().length > 0);
  if (!items.length) return;
  const index = document.activeElement instanceof HTMLElement ? items.indexOf(document.activeElement) : -1;
  if (event.shiftKey && index <= 0) {
    event.preventDefault();
    items[items.length - 1].focus();
  } else if (!event.shiftKey && (index === -1 || index === items.length - 1)) {
    event.preventDefault();
    items[0].focus();
  }
}

/**
 * Below 1024px the demo controls live in a bottom sheet. On larger screens the same panel is a static column,
 * so the dialog semantics are only applied while the sheet is open.
 */
export function createControlsSheet(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>('[data-panel]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-panel-open]');
  const scrim = root.querySelector<HTMLElement>('[data-panel-scrim]');
  const title = root.querySelector<HTMLElement>('[data-panel-title]');
  if (!panel || !toggle || !scrim || !title) return;
  // The demo disclosure bar sits outside the demo root but is part of the page behind the sheet.
  const background = [...root.querySelectorAll<HTMLElement>('[data-panel-inert]'), ...document.querySelectorAll<HTMLElement>('[data-demo-bar]')];
  const compact = window.matchMedia('(max-width: 63.999rem)');

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else {
      trapTab(panel, event);
    }
  };

  function open() {
    panel!.setAttribute('role', 'dialog');
    panel!.setAttribute('aria-modal', 'true');
    panel!.setAttribute('aria-labelledby', title!.id);
    panel!.dataset.open = '';
    scrim!.hidden = false;
    toggle!.setAttribute('aria-expanded', 'true');
    for (const element of background) element.inert = true;
    document.addEventListener('keydown', onKey);
    title!.focus();
  }

  function close(restoreFocus: boolean) {
    if (!('open' in panel!.dataset)) return;
    delete panel!.dataset.open;
    panel!.removeAttribute('role');
    panel!.removeAttribute('aria-modal');
    panel!.removeAttribute('aria-labelledby');
    scrim!.hidden = true;
    toggle!.setAttribute('aria-expanded', 'false');
    for (const element of background) element.inert = false;
    document.removeEventListener('keydown', onKey);
    if (restoreFocus) toggle!.focus();
  }

  toggle.addEventListener('click', open);
  scrim.addEventListener('click', () => close(true));
  root.querySelector('[data-panel-close]')?.addEventListener('click', () => close(true));
  compact.addEventListener('change', () => {
    if (!compact.matches) close(false);
  });
}

export interface ConfirmOptions {
  title: string;
  body: string;
  cancel: string;
  confirm: string;
}

/** Destructive confirmation shown inside the phone. Resolves true when confirmed. */
export function confirmInApp(app: HTMLElement, host: HTMLElement, options: ConfirmOptions, escapeHtml: (value: string) => string): Promise<boolean> {
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const background = [...app.children].filter((child): child is HTMLElement => child instanceof HTMLElement && child !== host);
  host.innerHTML = `<div class="t-modal">
    <div class="t-modal__scrim" data-modal-cancel></div>
    <div class="t-modal__sheet" role="alertdialog" aria-modal="true" aria-labelledby="t-modal-title" aria-describedby="t-modal-body">
      <h2 id="t-modal-title">${escapeHtml(options.title)}</h2>
      <p id="t-modal-body">${escapeHtml(options.body)}</p>
      <div class="t-modal__actions">
        <button type="button" class="t-btn t-btn--secondary" data-modal-cancel>${escapeHtml(options.cancel)}</button>
        <button type="button" class="t-btn t-btn--danger" data-modal-confirm>${escapeHtml(options.confirm)}</button>
      </div>
    </div>
  </div>`;
  const sheet = host.querySelector<HTMLElement>('.t-modal__sheet')!;
  for (const element of background) element.inert = true;

  return new Promise((resolve) => {
    const finish = (confirmed: boolean) => {
      document.removeEventListener('keydown', onKey);
      host.innerHTML = '';
      for (const element of background) element.inert = false;
      if (!confirmed && opener?.isConnected) opener.focus();
      resolve(confirmed);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(false);
      } else {
        trapTab(sheet, event);
      }
    };
    document.addEventListener('keydown', onKey);
    host.querySelectorAll('[data-modal-cancel]').forEach((element) => element.addEventListener('click', () => finish(false)));
    host.querySelector('[data-modal-confirm]')?.addEventListener('click', () => finish(true));
    sheet.querySelector<HTMLElement>('[data-modal-cancel].t-btn')?.focus();
  });
}
