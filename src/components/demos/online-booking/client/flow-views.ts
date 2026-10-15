import type { ClientStrings } from '../data/i18n';
import { icons } from '../lib/icons';
import { h, markup } from './dom';

export interface DayOption {
  day: string;
  top: string;
  number: string;
  month: string;
  status: string;
  label: string;
  disabled: boolean;
  checked: boolean;
  today: boolean;
}

export function dayRadios(options: DayOption[]): HTMLElement[] {
  return options.map((option) =>
    h(
      'button',
      {
        type: 'button',
        role: 'radio',
        class: option.today ? 'day is-today' : 'day',
        'aria-checked': String(option.checked),
        'aria-disabled': option.disabled ? 'true' : null,
        'aria-label': option.label,
        'data-day': option.day,
      },
      h('span', { class: 'day__top' }, option.top),
      h('span', { class: 'day__number' }, option.number),
      h('span', { class: 'day__month' }, option.month),
      h('span', { class: 'day__status' }, option.status),
    ),
  );
}

export interface SlotOption {
  start: number;
  text: string;
  label: string;
  reason: string;
  disabled: boolean;
  checked: boolean;
}

export interface Period {
  id: string;
  title: string;
  count: string;
  slots: SlotOption[];
}

export function periodBlocks(periods: Period[], emptyText: string): HTMLElement[] {
  return periods.map((period) => {
    const free = period.slots.some((slot) => !slot.disabled);
    return h(
      'section',
      { class: 'period', 'aria-labelledby': period.id },
      h('h4', { class: 'period__title', id: period.id }, period.title, h('span', { class: 'period__count' }, period.count)),
      h(
        'div',
        { class: 'slots', role: 'radiogroup', 'aria-labelledby': period.id },
        ...period.slots.map((slot) =>
          h(
            'button',
            {
              type: 'button',
              role: 'radio',
              class: slot.disabled ? 'slot is-unavailable' : 'slot',
              'aria-checked': String(slot.checked),
              'aria-disabled': slot.disabled ? 'true' : null,
              'aria-label': slot.label,
              'data-start': slot.start,
              'data-reason': slot.reason || null,
            },
            slot.text,
          ),
        ),
      ),
      free ? null : h('p', { class: 'period__empty' }, emptyText),
    );
  });
}

export interface ReviewRow {
  label: string;
  value: string | Node;
  step: number;
  changeLabel: string;
}

export function reviewRows(rows: ReviewRow[], changeText: string): HTMLElement[] {
  return rows.map((row) =>
    h(
      'div',
      { class: 'review__row' },
      h('dt', {}, row.label),
      h('dd', { class: 'review__value' }, row.value),
      h('dd', { class: 'review__change' }, h('button', { type: 'button', class: 'text-btn', 'data-goto-step': row.step, 'aria-label': row.changeLabel }, changeText)),
    ),
  );
}

export interface DoneData {
  title: string;
  when: string;
  code: string;
  date: string;
  services: string;
  duration: string;
  total: string;
}

/** Confirmation panel. All visitor-provided text goes through text nodes. */
export function donePanel(data: DoneData, t: ClientStrings['done']): HTMLElement {
  return h(
    'div',
    { class: 'done' },
    h('span', { class: 'done__seal', 'aria-hidden': 'true' }, markup(icons.check)),
    h('h3', { class: 'done__title', id: 'cp-done-title', tabindex: '-1' }, data.title),
    h('p', { class: 'done__when' }, data.when),
    h(
      'div',
      { class: 'done__ticket' },
      h(
        'dl',
        {},
        h('div', { class: 'done__wide' }, h('dt', {}, t.date), h('dd', {}, data.date)),
        h('div', {}, h('dt', {}, t.services), h('dd', {}, data.services)),
        h('div', {}, h('dt', {}, t.duration), h('dd', {}, data.duration)),
        h('div', {}, h('dt', {}, t.total), h('dd', {}, data.total)),
        h('div', { class: 'done__code' }, h('dt', {}, t.code), h('dd', {}, data.code)),
      ),
      h('p', { class: 'done__pay' }, t.pay),
    ),
    h(
      'div',
      { class: 'done__actions' },
      h('button', { type: 'button', class: 'btn btn--primary', 'data-done': 'ics', 'aria-describedby': 'cp-ics-hint' }, markup(icons.download), t.ics),
      h('button', { type: 'button', class: 'btn btn--ghost', 'data-done': 'agenda' }, markup(icons.calendar), t.agenda),
    ),
    h('p', { class: 'done__hint', id: 'cp-ics-hint' }, t.icsHint),
    h(
      'div',
      { class: 'done__more', 'data-done-more': true },
      h('button', { type: 'button', class: 'text-btn', 'data-done': 'reschedule' }, t.reschedule),
      h('button', { type: 'button', class: 'text-btn text-btn--danger', 'data-done': 'cancel' }, t.cancel),
    ),
    h(
      'div',
      { class: 'done__confirm', role: 'group', 'aria-labelledby': 'cp-cancel-ask', 'data-done-confirm': true, hidden: true },
      h('p', { class: 'done__ask', id: 'cp-cancel-ask' }, t.cancelAsk),
      h(
        'div',
        { class: 'done__confirm-actions' },
        h('button', { type: 'button', class: 'btn btn--ghost btn--small', 'data-done': 'keep' }, t.cancelKeep),
        h('button', { type: 'button', class: 'btn btn--danger btn--small', 'data-done': 'cancel-confirm' }, t.cancelConfirm),
      ),
    ),
    h('p', { class: 'demo-note' }, markup(icons.info), t.note),
  );
}

export function cancelledPanel(t: ClientStrings['done'], closeText: string): HTMLElement {
  return h(
    'div',
    { class: 'done done--cancelled' },
    h('h3', { class: 'done__title', id: 'cp-done-title', tabindex: '-1' }, t.cancelledTitle),
    h('p', { class: 'done__when' }, t.cancelled),
    h(
      'div',
      { class: 'done__actions' },
      h('button', { type: 'button', class: 'btn btn--primary', 'data-done': 'another' }, t.again),
      h('button', { type: 'button', class: 'btn btn--ghost', 'data-done': 'close' }, closeText),
    ),
  );
}
