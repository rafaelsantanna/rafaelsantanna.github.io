import type { ClientConfig } from '../data/contract';
import { STEP_IDS, canVisit, comboFor, includedBy, stepDone, totals, type Draft, type FlowContext } from '../lib/flow';
import { fill, type Format } from '../lib/format';
import { formatPhone } from '../lib/phone';
import { clockLabel } from '../lib/time';
import { capitalize, h } from './dom';
import type { FlowElements } from './flow-elements';
import { dayRadios, periodBlocks, reviewRows, type DayOption, type Period } from './flow-views';
import { setChecked, syncRoving } from './radio';
import type { Schedule } from './schedule';
import type { BookingStore } from './store';
import type { Words } from './words';

export interface FlowState {
  draft: Draft;
  step: number;
}

export interface FlowEnv {
  config: ClientConfig;
  fmt: Format;
  words: Words;
  schedule: Schedule;
  store: BookingStore;
  context: FlowContext;
}

/** Morning ends at 12:00 and afternoon at 18:00. */
const PERIOD_ENDS = [12 * 60, 18 * 60, 24 * 60];

/** Draws each part of the booking dialog from the current state. */
export function createFlowRenderer(el: FlowElements, env: FlowEnv) {
  const { config, fmt, words, schedule, store, context } = env;
  const t = config.t;
  const dayReasons = new Map<string, string>();
  const totalsOf = (draft: Draft) => totals(draft.serviceIds, config.services);

  /** The barber who takes the chosen slot: the chosen one, or the first free one for No preference. */
  function assignedBarber(draft: Draft): string | null {
    if (draft.barber !== 'any') return draft.barber;
    if (!draft.day || draft.start === null) return null;
    const slot = schedule
      .slots(draft.day, 'any', totalsOf(draft).duration, false)
      .find((item) => item.start === draft.start && item.status === 'free');
    return slot?.freeBarbers[0] ?? null;
  }

  function barberText(draft: Draft): string | null {
    if (draft.barber === null) return null;
    const assigned = assignedBarber(draft);
    if (draft.barber === 'any') return assigned ? fill(t.assigned, { name: schedule.barber(assigned)?.name ?? '' }) : t.anyBarber;
    return schedule.barber(draft.barber)?.name ?? null;
  }

  function progress({ draft, step }: FlowState): void {
    el.progress.forEach((button, index) => {
      const current = index === step;
      const reachable = canVisit(index, draft, context);
      const done = !current && reachable && stepDone(STEP_IDS[index], draft, context);
      button.dataset.state = current ? 'current' : done ? 'done' : reachable ? 'open' : 'locked';
      if (current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.setAttribute('aria-disabled', String(current || !reachable));
      const state = current ? t.stepCurrent : done ? t.stepDone : reachable ? '' : t.stepLocked;
      const label = button.querySelector('[data-step-state]');
      if (label) label.textContent = state ? `, ${state}` : '';
    });
    el.count.textContent = `${fill(t.stepOf, { n: step + 1, total: STEP_IDS.length })} · ${config.flow.steps[step]}`;
  }

  function setValue(node: HTMLElement, value: string | Node | null): void {
    node.replaceChildren(value ?? t.pending);
    node.classList.toggle('is-pending', value === null);
  }

  function summary({ draft }: FlowState): void {
    const chosen = config.services.filter((service) => draft.serviceIds.includes(service.id));
    const { duration, price } = totalsOf(draft);
    setValue(
      el.sum.services,
      chosen.length
        ? h('ul', { class: 'summary__services', role: 'list' }, ...chosen.map((service) => h('li', {}, h('span', {}, service.name), h('span', {}, fmt.price(service.price)))))
        : null,
    );
    setValue(el.sum.barber, barberText(draft));
    setValue(el.sum.day, draft.day ? capitalize(fmt.dayLong(draft.day)) : null);
    setValue(el.sum.time, draft.start !== null ? clockLabel(draft.start) : null);
    setValue(el.sum.duration, chosen.length ? fmt.duration(duration) : null);
    setValue(el.sum.total, chosen.length ? fmt.price(price) : null);
    el.compact.textContent = chosen.length ? `${fmt.duration(duration)} · ${fmt.price(price)}` : t.pending;
  }

  function actions({ step }: FlowState): void {
    const review = STEP_IDS[step] === 'review';
    el.back.hidden = step === 0;
    el.labelNext.hidden = review;
    el.labelConfirm.hidden = !review;
  }

  function services({ draft }: FlowState): void {
    el.services.forEach((button) => {
      const id = button.dataset.service ?? '';
      const combo = includedBy(draft.serviceIds, id, config.services);
      button.setAttribute('aria-pressed', String(draft.serviceIds.includes(id)));
      if (combo) button.setAttribute('aria-disabled', 'true');
      else button.removeAttribute('aria-disabled');
      const note = button.querySelector('[data-service-note]');
      if (note) note.textContent = combo ? fill(t.includedIn, { combo: combo.name }) : '';
    });
    const hint = comboHint(draft.serviceIds);
    el.comboHint.hidden = !hint;
    el.comboText.textContent = hint ?? '';
  }

  /** The cheaper-combo suggestion for the selected services, if any. */
  function comboHint(serviceIds: readonly string[]): string | null {
    const combo = comboFor(serviceIds, config.services);
    if (!combo) return null;
    const separate = totals(combo.includes, config.services).price;
    return fill(t.comboHint, { combo: combo.name, price: fmt.price(combo.price), saving: fmt.price(separate - combo.price) });
  }

  function barbers({ draft }: FlowState): void {
    setChecked(el.barbers, el.barbers.querySelector<HTMLElement>(`[data-barber="${draft.barber}"]`));
  }

  function days({ draft }: FlowState): void {
    const clock = schedule.now();
    const { duration } = totalsOf(draft);
    const chosenName = draft.barber && draft.barber !== 'any' ? schedule.barber(draft.barber)?.firstName ?? '' : '';
    dayReasons.clear();
    const options: DayOption[] = schedule.window(clock).map((day) => {
      const state = schedule.dayState(day, draft.barber, duration, false, clock);
      const dayName = capitalize(fmt.dayLong(day));
      const reasons = {
        closed: t.closedReasons[schedule.frame(day).weekday],
        off: fill(t.offReason, { name: chosenName }),
        over: t.overReason,
        full: t.fullReason,
      };
      const statuses = { closed: t.dayClosed, off: t.dayOff, over: t.dayOver, full: t.dayFull };
      const open = state.kind === 'open';
      const status = state.kind === 'open' ? fmt.count(t.freeShort, state.free) : statuses[state.kind];
      const spoken = state.kind === 'open' ? fmt.count(t.freeSlots, state.free) : `${status}, ${reasons[state.kind]}`;
      if (state.kind !== 'open') dayReasons.set(day, fill(t.dayUnavailable, { day: dayName, reason: reasons[state.kind] }));
      return {
        day,
        top: words.dayTag(day, clock) ?? fmt.weekdayShort(day),
        number: fmt.dayNumber(day),
        month: fmt.monthShort(day),
        status,
        label: fill(t.dayLabel, { day: dayName, status: spoken }),
        disabled: !open,
        checked: draft.day === day,
        today: day === clock.day,
      };
    });
    el.days.replaceChildren(...dayRadios(options));
    syncRoving(el.days);
    el.dayReason.textContent = '';
  }

  function slots({ draft }: FlowState): void {
    el.slotReason.textContent = '';
    if (!draft.day) {
      el.slots.replaceChildren();
      return;
    }
    const clock = schedule.now();
    const { duration } = totalsOf(draft);
    const all = schedule.slots(draft.day, draft.barber, duration, false, clock);
    const free = all.filter((slot) => slot.status === 'free').length;
    el.timeHelper.textContent = fill(t.timeHelper, {
      count: fmt.count(t.freeSlots, free),
      duration: fmt.duration(duration),
      day: words.relativeDay(draft.day, clock),
    });
    const periods: Period[] = [];
    t.periods.forEach((title, index) => {
      const from = index === 0 ? 0 : PERIOD_ENDS[index - 1];
      const items = all.filter((slot) => slot.start >= from && slot.start < PERIOD_ENDS[index]);
      // A period that is entirely behind us (the morning, late in the day) is only noise.
      if (!items.length || items.every((slot) => slot.status === 'past')) return;
      periods.push({
        id: `cp-period-${index}`,
        title,
        count: fmt.count(t.freeShort, items.filter((slot) => slot.status === 'free').length),
        slots: items.map((slot) => ({
          start: slot.start,
          text: clockLabel(slot.start),
          reason: slot.status === 'free' ? '' : slot.status === 'past' ? t.slotPast : t.slotBusy,
          label: slot.status === 'free' ? clockLabel(slot.start) : `${clockLabel(slot.start)}, ${slot.status === 'past' ? t.slotPast : t.slotBusy}`,
          disabled: slot.status !== 'free',
          checked: draft.start === slot.start,
        })),
      });
    });
    el.slots.replaceChildren(...periodBlocks(periods, t.periodEmpty));
    el.slots.querySelectorAll<HTMLElement>('[role="radiogroup"]').forEach(syncRoving);
  }

  function review({ draft }: FlowState): void {
    const clock = schedule.now();
    const r = t.review;
    const { duration, price } = totalsOf(draft);
    const rows = [
      { label: r.services, value: schedule.serviceNames(draft.serviceIds), step: 0, change: r.services },
      { label: r.barber, value: barberText(draft) ?? '', step: 1, change: r.barber },
      { label: r.when, value: draft.day && draft.start !== null ? capitalize(fill(t.whenAt, { day: fmt.dayLong(draft.day), time: fmt.hour(draft.start) })) : '', step: 3, change: r.when },
      { label: r.duration, value: `${fmt.duration(duration)} · ${fmt.price(price)}`, step: 0, change: r.services },
      { label: r.name, value: draft.name.trim(), step: 4, change: r.name },
      { label: r.phone, value: formatPhone(draft.phone), step: 4, change: r.phone },
      ...(draft.note.trim() ? [{ label: r.note, value: draft.note.trim(), step: 4, change: r.note }] : []),
    ];
    el.review.replaceChildren(
      ...reviewRows(
        rows.map((row) => ({ label: row.label, value: row.value, step: row.step, changeLabel: fill(r.changeLabel, { item: row.change.toLocaleLowerCase() }) })),
        r.change,
      ),
    );
    const booking = store.get();
    el.replace.hidden = !booking;
    el.replace.textContent = booking ? fill(r.replace, { when: words.when(booking.day, booking.start, clock) }) : '';
  }

  return { assignedBarber, comboHint, progress, summary, actions, services, barbers, days, slots, review, dayReason: (day: string) => dayReasons.get(day) ?? '' };
}
