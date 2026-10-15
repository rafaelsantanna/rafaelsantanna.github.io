import { missingRequired, speedBounds, validatePower, validateSpeed } from '../lib/checklist';
import { fill } from '../lib/text';
import type { CheckItemId, ItemId, MeasureId, Stroke, WaiverReason } from '../lib/types';
import { findOrder, type ViewContext } from '../views/common';
import { icon } from '../views/icons';
import { checkStatusText, itemState, markHtml, measureMessage, waiverReasons, type OrderUi } from '../views/items';
import { NOTES_MAX, completeHint, completeHintContent, orderSyncText, progressText } from '../views/order';
import { revealInScreen } from './navigator';
import { MIN_INK, attachSignaturePad, drawSignature, inkLength, type SignaturePad } from './signature-pad';
import type { Store } from './store';

interface Deps {
  store: Store;
  ctx(): ViewContext;
  screen(): HTMLElement | null;
  rerender(focusKey?: string): void;
  announce(text: string): void;
  toast(text: string): void;
  reducedMotion(): boolean;
}

/** Interactions of the work order screen. In-place edits patch the DOM so focus and typing are never interrupted. */
export function createOrderController(deps: Deps) {
  const uiState = new Map<string, OrderUi>();
  const drafts = new Map<string, Stroke[]>();
  let pad: SignaturePad | null = null;

  function ui(orderId: string): OrderUi {
    let value = uiState.get(orderId);
    if (!value) {
      value = { waiverOpen: false, waiverReason: null, errors: {} };
      uiState.set(orderId, value);
    }
    return value;
  }

  function updatePadControls(screen: HTMLElement, strokes: Stroke[]) {
    const hint = screen.querySelector<HTMLElement>('[data-sig-hint]');
    if (hint) hint.hidden = strokes.length > 0;
    screen.querySelector('[data-action="sig-clear"]')?.setAttribute('aria-disabled', String(strokes.length === 0));
    screen.querySelector('[data-action="sig-confirm"]')?.setAttribute('aria-disabled', String(inkLength(strokes) < MIN_INK));
    setMessage(screen.querySelector('[data-sig-msg]'), '', '');
  }

  function setMessage(element: HTMLElement | null, text: string, tone: string) {
    if (!element) return;
    element.dataset.tone = tone;
    element.innerHTML = tone === 'error' && text ? icon('alert') : '';
    const span = document.createElement('span');
    span.textContent = text;
    element.append(span);
  }

  /** Draws canvases and wires the signature pad after the screen is (re)rendered. */
  function mount(screen: HTMLElement, orderId: string) {
    pad?.destroy();
    pad = null;
    const progress = deps.store.progress(orderId);
    if (progress.signature) {
      const strokes = progress.signature.strokes;
      screen.querySelectorAll<HTMLCanvasElement>('[data-signature-view]').forEach((canvas) => drawSignature(canvas, strokes));
    }
    const canvas = screen.querySelector<HTMLCanvasElement>('[data-sigpad]');
    if (!canvas) return;
    pad = attachSignaturePad(canvas, drafts.get(orderId) ?? [], (strokes) => {
      drafts.set(orderId, strokes.map((stroke) => [...stroke]));
      updatePadControls(screen, strokes);
    });
    updatePadControls(screen, drafts.get(orderId) ?? []);
  }

  function unmount() {
    pad?.destroy();
    pad = null;
  }

  /** Refreshes item states, progress, and the completion hint without replacing any control. */
  function patch(screen: HTMLElement, orderId: string) {
    const ctx = deps.ctx();
    const info = findOrder(ctx, orderId);
    const progress = ctx.state.orders[orderId];
    const state = ui(orderId);
    const sync = orderSyncText(ctx, orderId);
    const syncLine = screen.querySelector<HTMLElement>('[data-order-sync]');
    if (syncLine) {
      syncLine.dataset.pending = String(sync.pending > 0);
      const text = syncLine.querySelector('[data-order-sync-text]');
      if (text) text.textContent = sync.text;
      syncLine.querySelector('svg')?.replaceWith(document.createRange().createContextualFragment(icon(sync.pending ? 'queue' : 'cloudCheck')));
    }
    if (progress.status !== 'in-progress') return;
    screen.querySelectorAll<HTMLElement>('[data-item]').forEach((row) => {
      const id = row.dataset.item as ItemId;
      const itemStateValue = itemState(progress, state, id);
      row.dataset.state = itemStateValue;
      const mark = row.querySelector<HTMLElement>('[data-mark]');
      if (mark) mark.innerHTML = markHtml(itemStateValue);
      if (id === 'cto' || id === 'splice' || id === 'wifi') {
        row.querySelector('[role="checkbox"]')?.setAttribute('aria-checked', String(itemStateValue === 'done'));
        const status = row.querySelector<HTMLElement>('[data-item-status]');
        if (status) status.textContent = checkStatusText(ctx, progress, id);
      }
      if (id === 'power' || id === 'speed') {
        const message = measureMessage(ctx, progress, state, id);
        setMessage(row.querySelector('[data-msg]'), message.text, message.tone);
        row.querySelector('input')?.setAttribute('aria-invalid', String(itemStateValue === 'error'));
      }
    });
    const bar = progressText(ctx, info, progress);
    const progressLabel = screen.querySelector<HTMLElement>('[data-progress-text]');
    if (progressLabel) progressLabel.textContent = bar.text;
    screen.querySelector<HTMLElement>('[data-progress-bar]')?.style.setProperty('inline-size', `${Math.round(bar.ratio * 100)}%`);
    const hint = completeHint(ctx, info, progress);
    const hintRow = screen.querySelector<HTMLElement>('[data-complete-hint]');
    if (hintRow) {
      hintRow.dataset.ready = String(hint.ready);
      const html = completeHintContent(hint);
      if (hintRow.innerHTML !== html) hintRow.innerHTML = html;
    }
    screen.querySelector('[data-action="complete"]')?.setAttribute('aria-disabled', String(!hint.ready));
  }

  function validate(orderId: string, item: MeasureId, input: string): { value: number; error: null } | { value: null; error: string } {
    const ctx = deps.ctx();
    const info = findOrder(ctx, orderId);
    const result = item === 'power' ? validatePower(input, ctx.f.groupSeparator) : validateSpeed(input, info.plan, ctx.f.groupSeparator);
    if (result.ok) return { value: result.value, error: null };
    const value = result.value === undefined ? '' : ctx.f.reading(result.value);
    return { value: null, error: fill(ctx.s.measure.errors[result.error], { value, min: ctx.f.mbps(speedBounds(info.plan).min), plan: info.planLabel }) };
  }

  /** Validates and saves a reading. `explicit` is true for Enter or the save button, false when the field loses focus. */
  function commitMeasure(screen: HTMLElement, orderId: string, item: MeasureId, explicit: boolean) {
    const input = screen.querySelector<HTMLInputElement>(`[data-measure="${item}"]`);
    if (!input) return;
    const state = ui(orderId);
    const saved = deps.store.progress(orderId)[item];
    const ctx = deps.ctx();
    if (!input.value.trim() && !explicit) {
      // Leaving an emptied field keeps the last saved reading instead of flagging an error.
      if (saved) input.value = ctx.f.input(Math.abs(saved.value));
      delete state.errors[item];
      patch(screen, orderId);
      return;
    }
    const result = validate(orderId, item, input.value);
    if (result.error !== null) {
      state.errors[item] = result.error;
      patch(screen, orderId);
      return;
    }
    delete state.errors[item];
    input.value = ctx.f.input(Math.abs(result.value));
    if (!deps.store.setMeasure(orderId, item, result.value)) patch(screen, orderId);
  }

  /** Once a field shows an error, it re-validates while typing so the message clears as soon as the value is fixed. */
  function revalidate(screen: HTMLElement, orderId: string, item: MeasureId, value: string) {
    const state = ui(orderId);
    if (!state.errors[item]) return;
    const { error } = validate(orderId, item, value);
    if (error !== null) state.errors[item] = error;
    else delete state.errors[item];
    patch(screen, orderId);
  }

  function updateNotesCounter(screen: HTMLElement, value: string) {
    const counter = screen.querySelector<HTMLElement>('[data-notes-count]');
    if (counter) counter.textContent = fill(deps.ctx().s.notes.counter, { n: value.length, max: NOTES_MAX });
  }

  function saveNotes(screen: HTMLElement, orderId: string, value: string) {
    if (!deps.store.setNotes(orderId, value)) return;
    const notes = deps.store.progress(orderId).notes;
    const saved = screen.querySelector<HTMLElement>('[data-notes-saved]');
    if (saved) saved.textContent = notes ? fill(deps.ctx().s.notes.saved, { time: deps.ctx().f.time(notes.at) }) : '';
  }

  function selectReason(screen: HTMLElement, orderId: string, reason: WaiverReason, focus: boolean) {
    ui(orderId).waiverReason = reason;
    screen.querySelectorAll<HTMLElement>('[data-reason]').forEach((radio) => {
      const checked = radio.dataset.reason === reason;
      radio.setAttribute('aria-checked', String(checked));
      radio.tabIndex = checked ? 0 : -1;
      if (checked && focus) radio.focus();
    });
    screen.querySelector('[data-action="waiver-confirm"]')?.setAttribute('aria-disabled', 'false');
    setMessage(screen.querySelector('[data-waiver-msg]'), '', '');
  }

  function attention(row: HTMLElement) {
    row.classList.remove('t-item--attention');
    void row.offsetWidth;
    row.classList.add('t-item--attention');
    row.scrollIntoView({ block: 'center', behavior: deps.reducedMotion() ? 'auto' : 'smooth' });
    row.focus({ preventScroll: true });
  }

  /** Handles a `data-action` click inside the work order screen. Returns false when the action is not one of its own. */
  function handle(action: string, target: HTMLElement, screen: HTMLElement, orderId: string): boolean {
    const ctx = deps.ctx();
    const store = deps.store;
    switch (action) {
      case 'start': {
        store.start(orderId);
        // The start button is gone after the re-render, so focus and the view move to the unlocked checklist.
        deps.rerender('checklist-title');
        const current = deps.screen();
        const checklist = current?.querySelector<HTMLElement>('.t-checklist');
        if (current && checklist) revealInScreen(current, checklist, !deps.reducedMotion());
        deps.announce(ctx.s.announce.started);
        return true;
      }
      case 'check':
        store.toggleCheck(orderId, target.dataset.itemId as CheckItemId);
        return true;
      case 'commit':
        commitMeasure(screen, orderId, target.dataset.itemId as MeasureId, true);
        return true;
      case 'photo':
        store.takePhoto(orderId);
        deps.rerender('photo');
        if (!deps.reducedMotion()) deps.screen()?.querySelector('[data-photo-frame]')?.classList.add('t-photo--flash');
        deps.announce(ctx.s.announce.photo);
        return true;
      case 'sig-clear':
        pad?.clear();
        // The clear control hides itself once the pad is empty, so focus moves to the item.
        screen.querySelector<HTMLElement>('[data-item="signature"]')?.focus({ preventScroll: true });
        return true;
      case 'sig-confirm': {
        const strokes = drafts.get(orderId) ?? [];
        if (inkLength(strokes) < MIN_INK) {
          setMessage(screen.querySelector('[data-sig-msg]'), ctx.s.signature.needInk, 'error');
          return true;
        }
        store.sign(orderId, strokes);
        drafts.delete(orderId);
        deps.rerender('sig-redo');
        deps.announce(ctx.s.announce.signed);
        return true;
      }
      case 'sig-redo':
        store.removeSignature(orderId);
        deps.rerender('waiver-open');
        return true;
      case 'waiver-open':
        ui(orderId).waiverOpen = true;
        deps.rerender(`reason-${ui(orderId).waiverReason ?? waiverReasons[0]}`);
        return true;
      case 'waiver-reason':
        selectReason(screen, orderId, target.dataset.reason as WaiverReason, false);
        return true;
      case 'waiver-cancel':
        ui(orderId).waiverOpen = false;
        ui(orderId).waiverReason = null;
        deps.rerender('waiver-open');
        return true;
      case 'waiver-confirm': {
        const reason = ui(orderId).waiverReason;
        if (!reason) {
          setMessage(screen.querySelector('[data-waiver-msg]'), ctx.s.signature.chooseReason, 'error');
          return true;
        }
        store.waive(orderId, reason);
        ui(orderId).waiverOpen = false;
        ui(orderId).waiverReason = null;
        drafts.delete(orderId);
        deps.rerender('waiver-undo');
        deps.announce(ctx.s.announce.waived);
        return true;
      }
      case 'waiver-undo':
        store.removeWaiver(orderId);
        deps.rerender('waiver-open');
        return true;
      case 'complete': {
        const info = findOrder(ctx, orderId);
        const progress = store.progress(orderId);
        const missing = missingRequired(info, progress);
        if (missing.length) {
          const row = screen.querySelector<HTMLElement>(`[data-item="${missing[0]}"]`);
          if (row) attention(row);
          deps.announce(completeHint(ctx, info, progress).text);
          return true;
        }
        store.complete(orderId);
        deps.rerender('done-banner');
        // Focus moves to the completion banner, which sits at the top of the order screen.
        const doneScreen = deps.screen();
        const banner = doneScreen?.querySelector<HTMLElement>('.t-done');
        if (doneScreen && banner) revealInScreen(doneScreen, banner, !deps.reducedMotion());
        const message = fill(store.state.online ? ctx.s.announce.completed : ctx.s.announce.completedOffline, { id: orderId });
        deps.toast(message);
        deps.announce(message);
        return true;
      }
      default:
        return false;
    }
  }

  function onKeydown(event: KeyboardEvent, screen: HTMLElement, orderId: string) {
    const target = event.target as HTMLElement;
    if (target.matches('[data-measure]') && event.key === 'Enter') {
      event.preventDefault();
      commitMeasure(screen, orderId, target.dataset.measure as MeasureId, true);
      return;
    }
    if (target.matches('[role="radio"]') && ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault();
      const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
      const index = waiverReasons.indexOf(target.dataset.reason as WaiverReason);
      const next = waiverReasons[(index + step + waiverReasons.length) % waiverReasons.length];
      selectReason(screen, orderId, next, true);
    }
  }

  function onChange(target: HTMLElement, screen: HTMLElement, orderId: string) {
    if (target.matches('[data-measure]')) commitMeasure(screen, orderId, (target as HTMLInputElement).dataset.measure as MeasureId, false);
    else if (target.matches('[data-notes]')) saveNotes(screen, orderId, (target as HTMLTextAreaElement).value);
  }

  function onInput(target: HTMLElement, screen: HTMLElement, orderId: string) {
    if (target.matches('[data-measure]')) revalidate(screen, orderId, target.dataset.measure as MeasureId, (target as HTMLInputElement).value);
    else if (target.matches('[data-notes]')) updateNotesCounter(screen, (target as HTMLTextAreaElement).value);
  }

  function reset() {
    unmount();
    uiState.clear();
    drafts.clear();
  }

  return { ui, mount, unmount, patch, handle, onKeydown, onChange, onInput, reset };
}
