/**
 * Command palette: a combobox that owns a grouped listbox (WAI-ARIA combobox pattern with
 * aria-activedescendant). Search is accent-insensitive, typo-tolerant and also finds deliveries by ID.
 */
import type { Strings } from '../i18n';
import { fill, plural } from '../lib/format';
import type { Delivery } from '../lib/model';
import { score } from '../lib/search';
import { esc, icon } from '../render/html';

export interface Command { id: string; label: string; keywords: string; iconName: string; hint?: string; run: () => void }

interface Option { id: string; label: string; meta: string; iconName: string; run: () => void }

const MAX_DELIVERIES = 6;

export function createPalette(input: HTMLInputElement, list: HTMLElement, live: HTMLElement, t: Strings, deps: {
  commands: () => Command[];
  deliveries: () => Delivery[];
  describe: (delivery: Delivery) => string;
  openDelivery: (id: string) => void;
  close: () => void;
}) {
  let options: Option[] = [];
  let active = 0;
  let announceTimer = 0;

  function results(query: string): { commands: Option[]; deliveries: Option[] } {
    const available = deps.commands();
    const commands = available
      .map((command) => ({ command, value: score(query, command.label, [command.keywords]) }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value)
      .map(({ command }) => ({ id: command.id, label: command.label, meta: command.hint ?? '', iconName: command.iconName, run: command.run }));
    const trimmed = query.trim();
    // Deliveries match literally (ID or customer); typo tolerance only kicks in when nothing matches
    // literally, commands included, so a command search such as "late" does not bring in customers whose
    // names are merely close. Customer words match by prefix only ("late" must not find "Pilates");
    // ID digits may match anywhere.
    const matchDeliveries = (fuzzy: boolean) => deps.deliveries()
      .map((delivery) => ({ delivery, value: score(trimmed, `${delivery.id} ${delivery.customer}`, [], { fuzzy, infix: false }) }))
      .filter((entry) => entry.value > 0);
    const literal = trimmed ? matchDeliveries(false) : [];
    const literalCommand = available.some((command) => score(trimmed, command.label, [command.keywords], { fuzzy: false }) > 0);
    const deliveries = (literal.length || !trimmed || literalCommand ? literal : matchDeliveries(true))
      .sort((a, b) => b.value - a.value || a.delivery.id.localeCompare(b.delivery.id))
      .slice(0, MAX_DELIVERIES)
      .map(({ delivery }) => ({
        id: `delivery-${delivery.id}`,
        label: `${delivery.id} · ${delivery.customer}`,
        meta: deps.describe(delivery),
        iconName: 'deliveries',
        run: () => deps.openDelivery(delivery.id),
      }));
    return { commands, deliveries };
  }

  function optionHtml(option: Option, index: number): string {
    return `<div class="lc-option" role="option" id="lc-opt-${index}" data-index="${index}" aria-selected="${index === active}">${icon(option.iconName, 'lc-icon lc-option__icon')}<span class="lc-option__label">${esc(option.label)}</span>${option.meta ? `<span class="lc-option__meta">${esc(option.meta)}</span>` : ''}</div>`;
  }

  function render() {
    const query = input.value;
    const groups = results(query);
    // A query that looks like a delivery number lists deliveries first.
    const order = /\d{3,}/.test(query.trim()) ? (['deliveries', 'commands'] as const) : (['commands', 'deliveries'] as const);
    options = order.flatMap((group) => groups[group]);
    active = Math.min(active, Math.max(0, options.length - 1));
    if (!options.length) {
      list.innerHTML = `<p class="lc-palette__empty">${esc(fill(t.palette.empty, { q: query.trim() }))}</p>`;
      input.removeAttribute('aria-activedescendant');
    } else {
      let index = 0;
      list.innerHTML = order
        .filter((group) => groups[group].length)
        .map((group) => {
          const title = group === 'commands' ? t.palette.commands : t.palette.deliveries;
          const items = groups[group].map((option) => optionHtml(option, index++)).join('');
          return `<div role="group" aria-labelledby="lc-pg-${group}"><p class="lc-palette__group" id="lc-pg-${group}" role="presentation">${esc(title)}</p>${items}</div>`;
        })
        .join('');
      input.setAttribute('aria-activedescendant', `lc-opt-${active}`);
    }
    window.clearTimeout(announceTimer);
    announceTimer = window.setTimeout(() => {
      live.textContent = options.length ? plural(t.lang, options.length, t.palette.results) : fill(t.palette.empty, { q: query.trim() });
    }, 350);
  }

  function setActive(index: number) {
    if (!options.length) return;
    active = (index + options.length) % options.length;
    list.querySelectorAll('[role="option"]').forEach((element) => element.setAttribute('aria-selected', String(Number((element as HTMLElement).dataset.index) === active)));
    input.setAttribute('aria-activedescendant', `lc-opt-${active}`);
    list.querySelector(`#lc-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }

  function execute(index: number) {
    const option = options[index];
    if (!option) return;
    deps.close();
    option.run();
  }

  input.addEventListener('input', () => {
    active = 0;
    render();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(active + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(active - 1); }
    else if (event.key === 'Home' && options.length) { event.preventDefault(); setActive(0); }
    else if (event.key === 'End' && options.length) { event.preventDefault(); setActive(options.length - 1); }
    else if (event.key === 'Enter') { event.preventDefault(); execute(active); }
  });
  list.addEventListener('click', (event) => {
    const option = (event.target as Element).closest<HTMLElement>('[role="option"]');
    if (option) execute(Number(option.dataset.index));
  });
  list.addEventListener('pointermove', (event) => {
    const option = (event.target as Element).closest<HTMLElement>('[role="option"]');
    if (option && Number(option.dataset.index) !== active) setActive(Number(option.dataset.index));
  });

  return {
    /** Prepares a fresh search each time the palette opens. */
    reset() {
      input.value = '';
      active = 0;
      live.textContent = '';
      render();
    },
  };
}
