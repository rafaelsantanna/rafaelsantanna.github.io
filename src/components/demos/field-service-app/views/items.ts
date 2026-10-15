import { POWER_RANGE, isItemDone, speedBounds, type ChecklistItem } from '../lib/checklist';
import { esc, fill } from '../lib/text';
import type { CheckItemId, ItemId, MeasureId, OrderInfo, OrderProgress, WaiverReason } from '../lib/types';
import type { ViewContext } from './common';
import { icon } from './icons';

/** Transient, per-order UI state that is not worth persisting. */
export interface OrderUi {
  waiverOpen: boolean;
  waiverReason: WaiverReason | null;
  errors: Partial<Record<MeasureId, string>>;
}

export type ItemState = 'todo' | 'done' | 'error';

export const waiverReasons: WaiverReason[] = ['absent', 'unable', 'refused'];

export function itemState(progress: OrderProgress, ui: OrderUi, id: ItemId): ItemState {
  if ((id === 'power' || id === 'speed') && ui.errors[id]) return 'error';
  return isItemDone(progress, id) ? 'done' : 'todo';
}

export function markHtml(state: ItemState): string {
  if (state === 'done') return icon('check');
  if (state === 'error') return icon('alert');
  return '';
}

function itemHelp(ctx: ViewContext, info: OrderInfo, id: ItemId): string {
  const item = ctx.s.items[id];
  if (id === 'power') return fill(item.help, { min: ctx.f.decimal(POWER_RANGE.min), max: ctx.f.decimal(POWER_RANGE.max) });
  if (id === 'speed') return fill(item.help, { plan: info.planLabel, min: ctx.f.mbps(speedBounds(info.plan).min) });
  return item.help;
}

export function checkStatusText(ctx: ViewContext, progress: OrderProgress, id: CheckItemId): string {
  const at = progress.checks[id];
  return at ? fill(ctx.s.items.checkedAt, { time: ctx.f.time(at) }) : '';
}

/** Message under a measurement: the validation error if there is one, otherwise the saved value. */
export function measureMessage(ctx: ViewContext, progress: OrderProgress, ui: OrderUi, id: MeasureId): { text: string; tone: 'error' | 'ok' | '' } {
  const error = ui.errors[id];
  if (error) return { text: error, tone: 'error' };
  const saved = progress[id];
  if (!saved) return { text: '', tone: '' };
  const template = id === 'power' ? ctx.s.measure.powerSaved : ctx.s.measure.speedSaved;
  const value = id === 'power' ? ctx.f.dbm(saved.value) : ctx.f.mbps(saved.value);
  return { text: fill(template, { value, time: ctx.f.time(saved.at) }), tone: 'ok' };
}

function optionalTag(ctx: ViewContext, item: ChecklistItem): string {
  return item.required ? '' : `<span class="t-tag">${esc(ctx.s.order.optional)}</span>`;
}

function itemHead(ctx: ViewContext, item: ChecklistItem, state: ItemState): string {
  return `<div class="t-item__row">
    <span class="t-item__mark" data-mark aria-hidden="true">${markHtml(state)}</span>
    <h4 class="t-item__label" id="t-label-${item.id}">${esc(ctx.s.items[item.id].label)}</h4>
    ${optionalTag(ctx, item)}
  </div>`;
}

function checkItem(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, item: ChecklistItem & { id: CheckItemId }, state: ItemState): string {
  const done = state === 'done';
  return `<button type="button" role="checkbox" aria-checked="${done}" class="t-item__toggle" data-action="check" data-item-id="${item.id}" data-key="item-${item.id}" aria-describedby="t-help-${item.id}">
      <span class="t-item__mark" data-mark aria-hidden="true">${markHtml(state)}</span>
      <span class="t-item__label">${esc(ctx.s.items[item.id].label)}</span>
      ${optionalTag(ctx, item)}
    </button>
    <p class="t-item__help t-item__help--indent" id="t-help-${item.id}">${esc(itemHelp(ctx, info, item.id))} <span class="t-item__done-at" data-item-status>${esc(checkStatusText(ctx, progress, item.id))}</span></p>`;
}

function measureItem(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, ui: OrderUi, id: MeasureId, state: ItemState, item: ChecklistItem): string {
  const saved = progress[id];
  const value = saved ? ctx.f.input(Math.abs(saved.value)) : '';
  const message = measureMessage(ctx, progress, ui, id);
  const isPower = id === 'power';
  return `${itemHead(ctx, item, state)}
    <p class="t-item__help" id="t-help-${id}">${esc(itemHelp(ctx, info, id))}</p>
    <label class="t-measure__label" for="t-input-${id}">${esc(isPower ? ctx.s.measure.powerInput : ctx.s.measure.speedInput)}</label>
    <div class="t-measure">
      <div class="t-measure__field${isPower ? ' t-measure__field--signed' : ''}">
        ${isPower ? '<span class="t-measure__prefix" aria-hidden="true">−</span>' : ''}
        <input id="t-input-${id}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" enterkeyhint="done" value="${esc(value)}" data-measure="${id}" data-key="input-${id}" aria-describedby="t-help-${id} t-msg-${id}" aria-invalid="${state === 'error'}">
        <span class="t-measure__unit" aria-hidden="true">${isPower ? 'dBm' : 'Mbps'}</span>
      </div>
      <button type="button" class="t-btn t-btn--secondary" data-action="commit" data-item-id="${id}" data-key="commit-${id}">${esc(ctx.s.measure.save)}<span class="t-sr"> ${esc(ctx.s.measure.saveTarget[id])}</span></button>
    </div>
    <p class="t-item__msg" id="t-msg-${id}" data-msg data-tone="${message.tone}" aria-live="polite">${message.tone === 'error' ? icon('alert') : ''}<span data-msg-text>${esc(message.text)}</span></p>`;
}

function photoItem(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, state: ItemState, item: ChecklistItem): string {
  const photo = progress.photo;
  const figure = photo
    ? `<figure class="t-photo" data-photo-frame>
        <canvas class="t-photo__canvas" width="640" height="480" role="img" aria-label="${esc(fill(ctx.s.photo.alt, { id: info.id, time: ctx.f.time(photo.at) }))}" data-photo data-variant="${photo.variant}" data-at="${photo.at}" data-order="${info.id}"></canvas>
        <figcaption>${esc(fill(ctx.s.photo.taken, { time: ctx.f.time(photo.at) }))}</figcaption>
      </figure>`
    : '';
  return `${itemHead(ctx, item, state)}
    <p class="t-item__help">${esc(itemHelp(ctx, info, 'photo'))}</p>
    ${figure}
    <div class="t-item__actions">
      <button type="button" class="t-btn t-btn--secondary" data-action="photo" data-key="photo">${icon('camera')}${esc(photo ? ctx.s.photo.retake : ctx.s.photo.take)}</button>
    </div>
    <p class="t-item__fine">${esc(ctx.s.photo.simulated)}</p>`;
}

function waiverPanel(ctx: ViewContext, ui: OrderUi): string {
  const selected = ui.waiverReason;
  const radios = waiverReasons
    .map((reason, index) => {
      const checked = selected === reason;
      const tabbable = checked || (!selected && index === 0);
      return `<button type="button" role="radio" class="t-radio" aria-checked="${checked}" tabindex="${tabbable ? 0 : -1}" data-action="waiver-reason" data-reason="${reason}" data-key="reason-${reason}"><span class="t-radio__dot" aria-hidden="true"></span><span>${esc(ctx.s.signature.reasons[reason])}</span></button>`;
    })
    .join('');
  return `<div class="t-waiver">
    <p class="t-waiver__title" id="t-waiver-title">${esc(ctx.s.signature.reasonsTitle)}</p>
    <div class="t-radios" role="radiogroup" aria-labelledby="t-waiver-title" data-radiogroup>${radios}</div>
    <p class="t-item__msg" data-tone="error" data-waiver-msg aria-live="polite"></p>
    <div class="t-item__actions">
      <button type="button" class="t-btn t-btn--ghost" data-action="waiver-cancel" data-key="waiver-cancel">${esc(ctx.s.signature.cancelWaiver)}</button>
      <button type="button" class="t-btn t-btn--secondary" data-action="waiver-confirm" data-key="waiver-confirm" aria-disabled="${selected ? 'false' : 'true'}">${esc(ctx.s.signature.confirmWaiver)}</button>
    </div>
  </div>`;
}

function signatureItem(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, ui: OrderUi, state: ItemState, item: ChecklistItem): string {
  const head = `${itemHead(ctx, item, state)}<p class="t-item__help">${esc(itemHelp(ctx, info, 'signature'))}</p>`;
  if (progress.signature) {
    return `${head}
      <figure class="t-signed">
        <canvas class="t-signed__canvas" role="img" aria-label="${esc(fill(ctx.s.signature.image, { id: info.id }))}" data-signature-view></canvas>
        <figcaption>${esc(fill(ctx.s.signature.signed, { time: ctx.f.time(progress.signature.at) }))}</figcaption>
      </figure>
      <div class="t-item__actions"><button type="button" class="t-btn t-btn--ghost" data-action="sig-redo" data-key="sig-redo">${icon('reset')}${esc(ctx.s.signature.redo)}</button></div>`;
  }
  if (progress.waiver) {
    const reason = ctx.s.signature.reasons[progress.waiver.reason];
    return `${head}
      <p class="t-waived">${icon('info')}<span>${esc(fill(ctx.s.signature.waived, { reason, time: ctx.f.time(progress.waiver.at) }))}</span></p>
      <div class="t-item__actions"><button type="button" class="t-btn t-btn--ghost" data-action="waiver-undo" data-key="waiver-undo">${icon('pen')}${esc(ctx.s.signature.undoWaiver)}</button></div>`;
  }
  if (ui.waiverOpen) return `${head}${waiverPanel(ctx, ui)}`;
  return `${head}
    <div class="t-sigpad" data-sigpad-frame>
      <canvas class="t-sigpad__canvas" role="img" aria-label="${esc(ctx.s.signature.pad)}" data-sigpad></canvas>
      <span class="t-sigpad__hint" aria-hidden="true" data-sig-hint>${icon('pen')}${esc(ctx.s.signature.placeholder)}</span>
      <span class="t-sigpad__line" aria-hidden="true"></span>
      <button type="button" class="t-sigpad__clear" data-action="sig-clear" data-key="sig-clear" aria-disabled="true">${icon('close')}${esc(ctx.s.signature.clear)}</button>
    </div>
    <button type="button" class="t-btn t-btn--secondary t-btn--block" data-action="sig-confirm" data-key="sig-confirm" aria-disabled="true" aria-describedby="t-sig-msg">${icon('check')}${esc(ctx.s.signature.confirm)}</button>
    <p class="t-item__msg" id="t-sig-msg" data-tone="" data-sig-msg aria-live="polite"></p>
    <button type="button" class="t-linkbtn" data-action="waiver-open" data-key="waiver-open">${esc(ctx.s.signature.cannot)}</button>`;
}

export function renderChecklistItem(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, ui: OrderUi, item: ChecklistItem): string {
  const state = itemState(progress, ui, item.id);
  let body: string;
  switch (item.id) {
    case 'cto':
    case 'splice':
    case 'wifi':
      body = checkItem(ctx, info, progress, item as ChecklistItem & { id: CheckItemId }, state);
      break;
    case 'power':
    case 'speed':
      body = measureItem(ctx, info, progress, ui, item.id, state, item);
      break;
    case 'photo':
      body = photoItem(ctx, info, progress, state, item);
      break;
    case 'signature':
      body = signatureItem(ctx, info, progress, ui, state, item);
      break;
  }
  return `<li class="t-item t-item--${item.id}" data-item="${item.id}" data-state="${state}" data-required="${item.required}" tabindex="-1">${body}</li>`;
}

/** Read-only line of the completed job record. */
export function recordValue(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, id: ItemId): string {
  switch (id) {
    case 'cto':
    case 'splice':
    case 'wifi':
      return checkStatusText(ctx, progress, id);
    case 'power':
      return progress.power ? `${ctx.f.dbm(progress.power.value)} dBm` : '';
    case 'speed':
      return progress.speed ? `${ctx.f.mbps(progress.speed.value)} Mbps` : '';
    case 'photo':
      return progress.photo ? fill(ctx.s.photo.taken, { time: ctx.f.time(progress.photo.at) }) : '';
    case 'signature':
      if (progress.signature) return fill(ctx.s.signature.signed, { time: ctx.f.time(progress.signature.at) });
      if (progress.waiver) return fill(ctx.s.signature.waived, { reason: ctx.s.signature.reasons[progress.waiver.reason], time: ctx.f.time(progress.waiver.at) });
      return '';
  }
}

