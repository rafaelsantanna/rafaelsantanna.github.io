// Editable combobox with a listbox popup (WAI-ARIA APG pattern, list autocomplete).
import { must } from './dom.ts';

export interface ComboboxConfig {
  root: HTMLElement;
  /** Polite live region for result counts. */
  status: HTMLElement;
  search(query: string): { html: string; count: number };
  noResults(query: string): string;
  resultsText(count: number): string;
  onSelect(value: string): void;
  onDisabled(value: string): void;
  /** Highlights the first result while typing, so Enter picks it. */
  autoSelect: boolean;
}

export interface Combobox {
  input: HTMLInputElement;
  close(): void;
}

export function createCombobox(config: ComboboxConfig): Combobox {
  const { root, status } = config;
  const input = must<HTMLInputElement>(root, '[data-combo-input]');
  const list = must<HTMLUListElement>(root, '[data-combo-list]');
  const empty = must<HTMLElement>(root, '[data-combo-empty]');
  let active = -1;
  let statusTimer = 0;

  const options = () => Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'));
  const isOpen = () => input.getAttribute('aria-expanded') === 'true';

  const say = (message: string) => {
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      status.textContent = message;
    }, 400);
  };

  const setActive = (index: number) => {
    const all = options();
    all.forEach((option, position) => {
      const on = position === index;
      option.classList.toggle('is-active', on);
      option.setAttribute('aria-selected', String(on));
    });
    active = index >= 0 && index < all.length ? index : -1;
    if (active === -1) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    input.setAttribute('aria-activedescendant', all[active].id);
    all[active].scrollIntoView({ block: 'nearest' });
  };

  const close = () => {
    list.hidden = true;
    empty.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  };

  const open = (query: string, initial: 'first' | 'last' | 'none') => {
    const result = config.search(query);
    if (!result.count) {
      list.hidden = true;
      list.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      setActive(-1);
      const message = query.trim() ? config.noResults(query.trim()) : '';
      empty.textContent = message;
      empty.hidden = !message;
      say(message);
      return;
    }
    empty.hidden = true;
    list.innerHTML = result.html;
    list.hidden = false;
    list.scrollTop = 0;
    input.setAttribute('aria-expanded', 'true');
    setActive(initial === 'first' ? 0 : initial === 'last' ? result.count - 1 : -1);
    say(config.resultsText(result.count));
  };

  const choose = (option: HTMLElement) => {
    const value = option.dataset.value ?? '';
    if (option.getAttribute('aria-disabled') === 'true') {
      config.onDisabled(value);
      return;
    }
    close();
    config.onSelect(value);
  };

  input.addEventListener('input', () => {
    open(input.value, config.autoSelect && input.value.trim() ? 'first' : 'none');
  });

  input.addEventListener('click', () => {
    if (!isOpen()) open(input.value, 'none');
  });

  input.addEventListener('keydown', (event) => {
    const count = options().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (event.altKey) {
          if (!isOpen()) open(input.value, 'none');
        } else if (!isOpen()) open(input.value, 'first');
        else setActive(active >= count - 1 ? 0 : active + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (event.altKey) close();
        else if (!isOpen()) open(input.value, 'last');
        else setActive(active <= 0 ? count - 1 : active - 1);
        break;
      case 'Enter':
        if (isOpen() && active >= 0) {
          event.preventDefault();
          choose(options()[active]);
        }
        break;
      case 'Escape':
        if (isOpen() || !empty.hidden) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
        break;
      case 'Tab':
        close();
        break;
      default:
    }
  });

  // Keep focus in the input while choosing with the pointer.
  list.addEventListener('mousedown', (event) => event.preventDefault());
  list.addEventListener('click', (event) => {
    const option = (event.target as Element).closest<HTMLElement>('[role="option"]');
    if (option) choose(option);
  });

  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) close();
  });

  return { input, close };
}
