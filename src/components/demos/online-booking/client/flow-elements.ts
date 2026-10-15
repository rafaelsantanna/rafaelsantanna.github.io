import { qs, qsa } from './dom';

/** Every node of the booking dialog that the scripts read or update. */
export function flowElements(dialog: HTMLDialogElement) {
  const sum = (name: string) => qs(dialog, `[data-sum="${name}"]`);
  return {
    dialog,
    count: qs(dialog, '[data-flow-count]'),
    main: qs(dialog, '[data-flow-main]'),
    progress: qsa<HTMLButtonElement>(dialog, '[data-goto]'),
    sections: qsa(dialog, '[data-step]'),
    serviceList: qs(dialog, '.svc-list'),
    services: qsa<HTMLButtonElement>(dialog, '[data-service]'),
    comboHint: qs(dialog, '[data-combo-hint]'),
    comboText: qs(dialog, '[data-combo-text]'),
    comboApply: qs<HTMLButtonElement>(dialog, '[data-combo-apply]'),
    barbers: qs(dialog, '[data-barbers]'),
    days: qs(dialog, '[data-days]'),
    dayReason: qs(dialog, '[data-day-reason]'),
    slots: qs(dialog, '[data-slots]'),
    slotReason: qs(dialog, '[data-slot-reason]'),
    timeHelper: qs(dialog, '[data-time-helper]'),
    name: qs<HTMLInputElement>(dialog, '[data-input="name"]'),
    phone: qs<HTMLInputElement>(dialog, '[data-input="phone"]'),
    note: qs<HTMLTextAreaElement>(dialog, '[data-input="note"]'),
    nameError: qs(dialog, '[data-error="name"]'),
    phoneError: qs(dialog, '[data-error="phone"]'),
    noteCount: qs(dialog, '[data-note-count]'),
    review: qs(dialog, '[data-review]'),
    replace: qs(dialog, '[data-replace]'),
    done: qs(dialog, '[data-done-panel]'),
    summary: qs(dialog, '[data-summary]'),
    summaryToggle: qs<HTMLButtonElement>(dialog, '[data-summary-toggle]'),
    compact: qs(dialog, '[data-sum-compact]'),
    sum: {
      services: sum('services'),
      barber: sum('barber'),
      day: sum('day'),
      time: sum('time'),
      duration: sum('duration'),
      total: sum('total'),
    },
    error: qs(dialog, '[data-flow-error]'),
    back: qs<HTMLButtonElement>(dialog, '[data-flow-back]'),
    next: qs<HTMLButtonElement>(dialog, '[data-flow-next]'),
    labelNext: qs(dialog, '[data-label-next]'),
    labelConfirm: qs(dialog, '[data-label-confirm]'),
    close: qs<HTMLButtonElement>(dialog, '[data-flow-close]'),
    live: qs(dialog, '[data-flow-live]'),
  };
}

export type FlowElements = ReturnType<typeof flowElements>;
