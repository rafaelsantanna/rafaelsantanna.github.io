import type { Booking } from '../data/model';
import { bookingCode, bookingId } from '../lib/booking';
import { STEP_IDS, applyCombo, comboFor, emptyDraft, firstOpenStep, reconcile, stepDone, toggleService, totals, type Draft, type FlowContext, type StepId } from '../lib/flow';
import { fill } from '../lib/format';
import { buildIcs } from '../lib/ics';
import { createDialog } from './dialog';
import { capitalize, h, reducedMotion } from './dom';
import { bindDetails } from './flow-details';
import { flowElements } from './flow-elements';
import { createFlowRenderer, type FlowEnv, type FlowState } from './flow-render';
import { cancelledPanel, donePanel } from './flow-views';
import { bindRadioGroups, setChecked } from './radio';

export interface OpenOptions {
  preset?: Partial<Draft>;
  startAt?: StepId;
  /** Shows the saved booking even if a new booking was in progress. */
  showBooking?: boolean;
}

type Mode = 'steps' | 'done' | 'cancelled';

export function createFlow(dialog: HTMLDialogElement, env: Omit<FlowEnv, 'context'>, showOnAgenda: () => void) {
  const { config, fmt, words, schedule, store } = env;
  const t = config.t;
  const el = flowElements(dialog);
  const durationOf = (draft: Draft) => totals(draft.serviceIds, config.services).duration;
  const context: FlowContext = {
    dayOpen: (draft, day) => schedule.dayState(day, draft.barber, durationOf(draft), false).kind === 'open',
    slotFree: (draft, day, start) =>
      schedule.slots(day, draft.barber, durationOf(draft), false).some((slot) => slot.start === start && slot.status === 'free'),
  };
  const render = createFlowRenderer(el, { ...env, context });
  const control = createDialog(dialog, () => openCurrent());
  const state: FlowState = { draft: emptyDraft(), step: 0 };
  let mode: Mode = 'steps';
  let justBooked = false;
  let resumeSteps = false;
  let cancelled: Booking | null = null;

  const details = bindDetails(el, t, {
    draft: () => state.draft,
    update: (patch) => {
      state.draft = { ...state.draft, ...patch };
      render.progress(state);
    },
    submit: () => next(),
  });

  const needs: Record<StepId, string> = {
    services: t.needServices,
    barber: t.needBarber,
    day: t.needDay,
    time: t.needTime,
    details: t.needDetails,
    review: '',
  };

  // Live regions are emptied first and filled a moment later so repeated messages are announced again.
  const timers = new Map<HTMLElement, number>();
  function speak(region: HTMLElement, message: string): void {
    window.clearTimeout(timers.get(region));
    region.textContent = '';
    if (message) timers.set(region, window.setTimeout(() => { region.textContent = message; }, 80));
  }

  const announce = (message: string): void => speak(el.live, message);
  const notify = (message: string): void => speak(el.error, message);

  function chrome(): void {
    render.progress(state);
    render.summary(state);
    render.actions(state);
  }

  function showSections(): void {
    const target = mode === 'steps' ? STEP_IDS[state.step] : 'done';
    el.sections.forEach((section) => { section.hidden = section.dataset.step !== target; });
    dialog.dataset.mode = mode;
    el.main.scrollTop = 0;
  }

  function focusHeading(): void {
    el.sections.find((section) => !section.hidden)?.querySelector<HTMLElement>('h3')?.focus();
  }

  function buildStep(): void {
    const builders: Record<StepId, () => void> = {
      services: () => render.services(state),
      barber: () => render.barbers(state),
      day: () => render.days(state),
      time: () => render.slots(state),
      details: () => details.fill(state.draft),
      review: () => render.review(state),
    };
    builders[STEP_IDS[state.step]]();
  }

  function show(index: number, focus = true): void {
    mode = 'steps';
    state.step = Math.max(0, Math.min(index, STEP_IDS.length - 1));
    notify('');
    showSections();
    buildStep();
    chrome();
    if (focus) focusHeading();
  }

  /** Re-checks day and time after services or barber change, keeping them whenever they still fit. */
  function afterUpstreamChange(): void {
    const before = state.draft;
    const result = reconcile(state.draft, context);
    state.draft = result.draft;
    if (result.cleared === 'day') notify(t.clearedDay);
    else if (result.cleared === 'time' && before.start !== null) notify(fill(t.clearedTime, { time: fmt.hour(before.start) }));
    else notify('');
  }

  function setServices(ids: string[]): void {
    const hintWasHidden = el.comboHint.hidden;
    state.draft = { ...state.draft, serviceIds: ids };
    afterUpstreamChange();
    render.services(state);
    chrome();
    const { duration, price } = totals(ids, config.services);
    const total = fill(t.totalLive, { duration: fmt.duration(duration), price: fmt.price(price) });
    const hint = render.comboHint(ids);
    if (ids.length) announce(hint ? `${total} ${hint}` : total);
    // The suggestion sits above the list, which may be scrolled past on short screens.
    if (hint && hintWasHidden) el.comboHint.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function next(): void {
    const id = STEP_IDS[state.step];
    if (id === 'review') {
      confirm();
      return;
    }
    if (id === 'details' && !details.validate()) {
      notify(needs.details);
      return;
    }
    if (!stepDone(id, state.draft, context)) {
      notify(needs[id]);
      return;
    }
    show(state.step + 1);
  }

  function confirm(): void {
    const open = firstOpenStep(state.draft, context);
    const { draft } = state;
    if (open < STEP_IDS.indexOf('review') || draft.day === null || draft.start === null || draft.barber === null) {
      show(open);
      notify(STEP_IDS[open] === 'time' ? t.slotTaken : needs[STEP_IDS[open]]);
      return;
    }
    const barberId = render.assignedBarber(draft);
    if (!barberId) {
      show(STEP_IDS.indexOf('time'));
      notify(t.slotTaken);
      return;
    }
    const { duration, price } = totals(draft.serviceIds, config.services);
    store.set({
      id: bookingId(),
      code: bookingCode(),
      serviceIds: [...draft.serviceIds],
      barberChoice: draft.barber,
      barberId,
      day: draft.day,
      start: draft.start,
      duration,
      price,
      name: draft.name.trim(),
      phone: draft.phone,
      note: draft.note.trim(),
      createdAt: new Date().toISOString(),
    });
    state.draft = { ...emptyDraft(), name: draft.name, phone: draft.phone };
    state.step = 0;
    details.reset();
    resumeSteps = false;
    justBooked = true;
    showDone();
  }

  function showDone(focus = true): void {
    const booking = store.get();
    if (!booking) {
      show(0, focus);
      return;
    }
    mode = 'done';
    const clock = schedule.now();
    const firstName = booking.name.split(/\s+/)[0];
    el.done.replaceChildren(
      donePanel(
        {
          title: justBooked ? fill(t.done.titleNew, { name: firstName }) : t.done.titleSaved,
          when: fill(t.done.when, {
            day: words.relativeDay(booking.day, clock),
            time: fmt.hour(booking.start),
            barber: schedule.barber(booking.barberId)?.name ?? '',
          }),
          code: booking.code,
          services: schedule.serviceNames(booking.serviceIds),
          date: capitalize(fill(t.whenAt, { day: fmt.dayLong(booking.day), time: fmt.hour(booking.start) })),
          duration: fmt.duration(booking.duration),
          total: fmt.price(booking.price),
        },
        t.done,
      ),
    );
    notify('');
    showSections();
    if (focus) focusHeading();
  }

  /** Swaps the secondary actions for an inline confirmation, so a stray click cannot cancel the booking. */
  function askCancel(open: boolean): void {
    const more = el.done.querySelector<HTMLElement>('[data-done-more]');
    const ask = el.done.querySelector<HTMLElement>('[data-done-confirm]');
    if (!more || !ask) return;
    more.hidden = open;
    ask.hidden = !open;
    el.done.querySelector<HTMLElement>(`[data-done="${open ? 'keep' : 'cancel'}"]`)?.focus();
  }

  /** Starts over from the first step with the services, barber, and details of `from`; day and time stay open. */
  function restart(from: Booking | null): void {
    if (from) {
      state.draft = { ...emptyDraft(), serviceIds: [...from.serviceIds], barber: from.barberChoice, name: from.name, phone: from.phone, note: from.note };
    }
    cancelled = null;
    resumeSteps = true;
    justBooked = false;
    show(0);
  }

  function showCancelled(): void {
    mode = 'cancelled';
    el.done.replaceChildren(cancelledPanel(t.done, t.close));
    showSections();
    focusHeading();
    announce(`${t.done.cancelledTitle}. ${t.done.cancelled}`);
  }

  function downloadIcs(booking: Booking): void {
    const content = buildIcs({
      uid: `${booking.id}@corte-e-prosa.demo`,
      day: booking.day,
      start: booking.start,
      duration: booking.duration,
      timeZone: config.timeZone,
      title: fill(t.ics.title, { services: schedule.serviceNames(booking.serviceIds) }),
      description: fill(t.ics.description, { barber: schedule.barber(booking.barberId)?.name ?? '' }),
      stamp: new Date(booking.createdAt),
    });
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const link = h('a', { href: url, download: fill(t.ics.file, { day: booking.day }), hidden: true });
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    announce(t.done.icsDone);
  }

  function setSummaryOpen(open: boolean): void {
    el.summaryToggle.setAttribute('aria-expanded', String(open));
    el.summary.toggleAttribute('data-open', open);
  }

  function openCurrent(): void {
    setSummaryOpen(false);
    if (mode === 'done' && store.get()) showDone();
    else show(state.step);
  }

  // Events
  el.serviceList.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-service]');
    if (!button) return;
    if (button.getAttribute('aria-disabled') === 'true') {
      notify(button.querySelector('[data-service-note]')?.textContent ?? '');
      return;
    }
    setServices(toggleService(state.draft.serviceIds, button.dataset.service ?? '', config.services));
  });

  el.comboApply.addEventListener('click', () => {
    const combo = comboFor(state.draft.serviceIds, config.services);
    if (combo) setServices(applyCombo(state.draft.serviceIds, combo, config.services));
    el.serviceList.querySelector<HTMLElement>(`[data-service="${combo?.id}"]`)?.focus();
  });

  bindRadioGroups(el.barbers, (radio) => {
    state.draft = { ...state.draft, barber: radio.dataset.barber ?? null };
    afterUpstreamChange();
    setChecked(el.barbers, radio);
    chrome();
  });

  bindRadioGroups(el.days, (radio) => {
    const day = radio.dataset.day ?? '';
    if (radio.getAttribute('aria-disabled') === 'true') {
      el.dayReason.textContent = render.dayReason(day);
      return;
    }
    if (state.draft.day !== day) state.draft = { ...state.draft, day, start: null };
    setChecked(el.days, radio);
    el.dayReason.textContent = '';
    notify('');
    chrome();
  });

  bindRadioGroups(el.slots, (radio) => {
    if (radio.getAttribute('aria-disabled') === 'true') {
      el.slotReason.textContent = fill(t.slotUnavailable, { time: radio.textContent ?? '', reason: radio.dataset.reason ?? '' });
      return;
    }
    state.draft = { ...state.draft, start: Number(radio.dataset.start) };
    el.slots.querySelectorAll<HTMLElement>('[role="radiogroup"]').forEach((group) => setChecked(group, group.contains(radio) ? radio : null));
    el.slotReason.textContent = '';
    notify('');
    chrome();
  });

  el.progress.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      show(Number(button.dataset.goto));
    });
  });

  el.review.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-goto-step]');
    if (button) show(Number(button.dataset.gotoStep));
  });

  el.done.addEventListener('click', (event) => {
    const action = (event.target as Element).closest<HTMLElement>('[data-done]')?.dataset.done;
    const booking = store.get();
    if (action === 'ics' && booking) downloadIcs(booking);
    else if (action === 'agenda') control.close(showOnAgenda);
    else if (action === 'close') control.close();
    else if (action === 'cancel') askCancel(true);
    else if (action === 'keep') askCancel(false);
    else if (action === 'cancel-confirm' && booking) {
      cancelled = booking;
      store.set(null);
      showCancelled();
    } else if (action === 'reschedule') restart(booking);
    else if (action === 'another') restart(cancelled);
  });

  el.next.addEventListener('click', next);
  el.back.addEventListener('click', () => show(state.step - 1));
  el.close.addEventListener('click', () => control.close());
  el.summaryToggle.addEventListener('click', () => setSummaryOpen(el.summaryToggle.getAttribute('aria-expanded') !== 'true'));

  dialog.addEventListener('close', () => {
    justBooked = false;
    if (mode === 'cancelled') mode = 'steps';
  });

  return {
    get isOpen() {
      return control.isOpen;
    },
    announce,
    /** Opens the booking. A preset fills choices (from a service row or the next free time). */
    open(options: OpenOptions = {}): void {
      if (options.preset) {
        state.draft = reconcile({ ...state.draft, ...options.preset }, context).draft;
        const target = options.startAt ? STEP_IDS.indexOf(options.startAt) : 0;
        state.step = Math.min(target, firstOpenStep(state.draft, context));
        mode = 'steps';
        resumeSteps = true;
      } else if (store.get() && (options.showBooking || !resumeSteps)) {
        mode = 'done';
      } else {
        mode = 'steps';
      }
      control.open();
      openCurrent();
    },
    reset(): void {
      state.draft = emptyDraft();
      state.step = 0;
      mode = 'steps';
      resumeSteps = false;
      justBooked = false;
      cancelled = null;
      details.reset();
      if (control.isOpen) control.close();
    },
  };
}
