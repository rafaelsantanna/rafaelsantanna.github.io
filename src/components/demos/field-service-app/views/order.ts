import { checklistFor, checklistProgress, missingRequired } from '../lib/checklist';
import { unsyncedForOrder } from '../lib/queue';
import { esc, fill, plural } from '../lib/text';
import type { OrderInfo, OrderProgress } from '../lib/types';
import { findOrder, orderLabel, orderStatusChip, priorityChip, typeIcons, windowLabel, type ViewContext } from './common';
import { icon } from './icons';
import { recordValue, renderChecklistItem, type OrderUi } from './items';
import { mapSvg } from './map';

export const NOTES_MAX = 500;

export function progressText(ctx: ViewContext, info: OrderInfo, progress: OrderProgress): { text: string; ratio: number } {
  const { done, total } = checklistProgress(info, progress);
  return { text: fill(ctx.s.order.progress, { done, total }), ratio: total ? done / total : 0 };
}

export interface CompleteHint {
  /** Full sentence: what is still missing, or that the order is ready. */
  text: string;
  /** Count of missing items, shown instead of the full list where height is scarce. */
  short: string;
  ready: boolean;
}

export function completeHint(ctx: ViewContext, info: OrderInfo, progress: OrderProgress): CompleteHint {
  const missing = missingRequired(info, progress);
  if (!missing.length) return { text: ctx.s.order.ready, short: ctx.s.order.ready, ready: true };
  return {
    text: fill(ctx.s.order.missing, { list: ctx.f.list(missing.map((id) => ctx.s.items[id].short)) }),
    short: plural(ctx.s.order.missingCount, missing.length),
    ready: false,
  };
}

/** Inner HTML of the completion hint. The full list stays in the accessibility tree even when only the count is shown. */
export function completeHintContent(hint: CompleteHint): string {
  const long = hint.short !== hint.text;
  const full = `<span class="t-actionbar__full${long ? ' t-actionbar__full--long' : ''}">${esc(hint.text)}</span>`;
  const short = long ? `<span class="t-actionbar__short" aria-hidden="true">${esc(hint.short)}</span>` : '';
  return `${icon(hint.ready ? 'check' : 'info')}${full}${short}`;
}

export function orderSyncText(ctx: ViewContext, orderId: string): { text: string; pending: number } {
  const pending = unsyncedForOrder(ctx.state.events, orderId);
  return { text: plural(ctx.s.order.syncLine, pending), pending };
}

/** The next order still to be worked, or undefined when the day is done. */
function nextOpenOrder(ctx: ViewContext, currentId: string): OrderInfo | undefined {
  return ctx.orders.find((order) => order.id !== currentId && ctx.state.orders[order.id].status !== 'done');
}

function header(ctx: ViewContext, info: OrderInfo, progress: OrderProgress): string {
  return `<header class="t-head t-head--bar">
    <button type="button" class="t-back" data-action="back" data-key="back" aria-label="${esc(ctx.s.order.backLabel)}">${icon('chevronLeft')}<span aria-hidden="true">${esc(ctx.s.order.back)}</span></button>
    <p class="t-head__os">${esc(orderLabel(ctx, info.id))}</p>
    <span class="t-head__status" data-order-status>${orderStatusChip(ctx, progress.status)}</span>
  </header>`;
}

function hero(ctx: ViewContext, info: OrderInfo): string {
  const km = ctx.f.decimal(info.distanceKm);
  const fact = (label: string, value: string) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  return `<div class="t-hero">
    <p class="t-hero__type">${icon(typeIcons[info.type])}${esc(ctx.s.common.types[info.type])}</p>
    <h2 class="t-title" id="t-screen-title" tabindex="-1">${esc(info.customer)}</h2>
    <dl class="t-facts">
      ${fact(ctx.s.order.facts.window, esc(windowLabel(ctx, info)))}
      ${fact(ctx.s.order.facts.place, esc(info.neighborhood))}
      ${fact(ctx.s.order.facts.plan, esc(info.planLabel))}
      ${fact(ctx.s.order.facts.priority, priorityChip(ctx, info.priority))}
    </dl>
  </div>
  <figure class="t-map">
    ${mapSvg(info.id, fill(ctx.s.order.mapAlt, { km, min: info.etaMin }))}
    <figcaption><span>${esc(ctx.s.order.mapLabel)}</span><span>${esc(fill(ctx.s.order.mapMeta, { km, min: info.etaMin }))}</span></figcaption>
  </figure>
  <div class="t-dispatch">
    <p class="t-dispatch__title">${icon('note')}${esc(ctx.s.order.dispatch)}</p>
    <p>${esc(info.note)}</p>
  </div>`;
}

function syncLine(ctx: ViewContext, info: OrderInfo): string {
  const sync = orderSyncText(ctx, info.id);
  return `<p class="t-order-sync" data-order-sync data-pending="${sync.pending > 0}">${icon(sync.pending ? 'queue' : 'cloudCheck')}<span data-order-sync-text>${esc(sync.text)}</span></p>`;
}

function scheduledBody(ctx: ViewContext, info: OrderInfo): string {
  const items = checklistFor(info.type)
    .map((item) => `<li>${icon('lock')}<span>${esc(ctx.s.items[item.id].label)}</span>${item.required ? '' : `<span class="t-tag">${esc(ctx.s.order.optional)}</span>`}</li>`)
    .join('');
  return `<section class="t-locked" aria-labelledby="t-locked-title">
    <h3 id="t-locked-title">${esc(ctx.s.order.lockedTitle)}</h3>
    <p class="t-locked__hint">${esc(ctx.s.order.lockedHint)}</p>
    <ul class="t-locked__list">${items}</ul>
  </section>`;
}

function notesSection(ctx: ViewContext, progress: OrderProgress): string {
  const text = progress.notes?.text ?? '';
  const saved = progress.notes ? fill(ctx.s.notes.saved, { time: ctx.f.time(progress.notes.at) }) : '';
  return `<section class="t-notes" aria-labelledby="t-notes-title">
    <h3 id="t-notes-title"><label for="t-notes-input">${esc(ctx.s.notes.title)}</label></h3>
    <p class="t-item__help" id="t-notes-hint">${esc(ctx.s.notes.hint)}</p>
    <textarea id="t-notes-input" class="t-textarea" rows="3" maxlength="${NOTES_MAX}" placeholder="${esc(ctx.s.notes.placeholder)}" data-notes data-key="notes" aria-describedby="t-notes-hint t-notes-count">${esc(text)}</textarea>
    <p class="t-notes__meta"><span data-notes-saved>${esc(saved)}</span><span id="t-notes-count" data-notes-count>${esc(fill(ctx.s.notes.counter, { n: text.length, max: NOTES_MAX }))}</span></p>
  </section>`;
}

function inProgressBody(ctx: ViewContext, info: OrderInfo, progress: OrderProgress, ui: OrderUi): string {
  const bar = progressText(ctx, info, progress);
  const items = checklistFor(info.type).map((item) => renderChecklistItem(ctx, info, progress, ui, item)).join('');
  const started = progress.startedAt ? `<p class="t-started">${icon('activity')}<span>${esc(fill(ctx.s.order.startedAt, { time: ctx.f.time(progress.startedAt) }))}</span></p>` : '';
  return `${started}
  <section class="t-checklist" aria-labelledby="t-checklist-title">
    <div class="t-checklist__head">
      <h3 id="t-checklist-title" tabindex="-1" data-key="checklist-title">${esc(ctx.s.order.checklistTitle)}</h3>
      <p data-progress-text>${esc(bar.text)}</p>
    </div>
    <div class="t-progress" aria-hidden="true"><span data-progress-bar style="inline-size: ${Math.round(bar.ratio * 100)}%"></span></div>
    <ol class="t-items">${items}</ol>
  </section>
  ${notesSection(ctx, progress)}`;
}

function doneBody(ctx: ViewContext, info: OrderInfo, progress: OrderProgress): string {
  const rows = checklistFor(info.type)
    .map((item) => {
      const value = recordValue(ctx, info, progress, item.id);
      let media = '';
      if (item.id === 'photo' && progress.photo) {
        media = `<canvas class="t-photo__canvas" width="640" height="480" role="img" aria-label="${esc(fill(ctx.s.photo.alt, { id: info.id, time: ctx.f.time(progress.photo.at) }))}" data-photo data-variant="${progress.photo.variant}" data-at="${progress.photo.at}" data-order="${info.id}"></canvas>`;
      }
      if (item.id === 'signature' && progress.signature) {
        media = `<canvas class="t-signed__canvas" role="img" aria-label="${esc(fill(ctx.s.signature.image, { id: info.id }))}" data-signature-view></canvas>`;
      }
      const state = value ? 'done' : 'todo';
      return `<li class="t-record__row" data-state="${state}"><span class="t-item__mark" aria-hidden="true">${state === 'done' ? icon('check') : ''}</span><span class="t-record__text"><span class="t-record__label">${esc(ctx.s.items[item.id].label)}</span><span class="t-record__value">${esc(value)}</span>${media ? `<span class="t-record__media">${media}</span>` : ''}</span></li>`;
    })
    .join('');
  const notes = progress.notes?.text ? `<div class="t-record__notes"><h4>${esc(ctx.s.notes.title)}</h4><p>${esc(progress.notes.text)}</p></div>` : '';
  return `<div class="t-done" tabindex="-1" data-key="done-banner">
    <span class="t-done__icon" aria-hidden="true">${icon('check')}</span>
    <div><h3>${esc(progress.completedAt === null ? ctx.s.common.status.done : fill(ctx.s.order.doneTitle, { time: ctx.f.time(progress.completedAt) }))}</h3><p>${esc(ctx.s.order.doneText)}</p></div>
  </div>
  <section class="t-record" aria-labelledby="t-record-title">
    <h3 id="t-record-title">${esc(ctx.s.order.summaryTitle)}</h3>
    <ul class="t-record__list">${rows}</ul>
    ${notes}
  </section>`;
}

function actionBar(ctx: ViewContext, info: OrderInfo, progress: OrderProgress): string {
  if (progress.status === 'scheduled') {
    return `<div class="t-actionbar">
      <p class="t-actionbar__hint" id="t-action-hint">${esc(ctx.s.order.startHint)}</p>
      <button type="button" class="t-btn t-btn--primary t-btn--block" data-action="start" data-key="start" aria-describedby="t-action-hint">${icon('activity')}${esc(ctx.s.order.start)}</button>
    </div>`;
  }
  if (progress.status === 'in-progress') {
    const hint = completeHint(ctx, info, progress);
    return `<div class="t-actionbar">
      <p class="t-actionbar__hint" id="t-action-hint" data-complete-hint data-ready="${hint.ready}">${completeHintContent(hint)}</p>
      <button type="button" class="t-btn t-btn--primary t-btn--block" data-action="complete" data-key="complete" aria-disabled="${!hint.ready}" aria-describedby="t-action-hint">${icon('check')}${esc(ctx.s.order.complete)}</button>
    </div>`;
  }
  const next = nextOpenOrder(ctx, info.id);
  const nextButton = next
    ? `<button type="button" class="t-btn t-btn--primary" data-action="open-order" data-order="${next.id}" data-key="next-order">${esc(ctx.s.order.nextOrder)}${icon('chevronRight')}</button>`
    : '';
  return `<div class="t-actionbar t-actionbar--split">
    <button type="button" class="t-btn t-btn--secondary" data-action="back" data-key="back-today">${esc(ctx.s.order.backToday)}</button>
    ${nextButton}
  </div>`;
}

export function renderOrder(ctx: ViewContext, orderId: string, ui: OrderUi): string {
  const info = findOrder(ctx, orderId);
  const progress = ctx.state.orders[orderId];
  const body = progress.status === 'scheduled' ? scheduledBody(ctx, info) : progress.status === 'in-progress' ? inProgressBody(ctx, info, progress, ui) : doneBody(ctx, info, progress);
  return `<section class="t-screen t-screen--order" data-screen="order" data-order-id="${orderId}" aria-labelledby="t-screen-title">
    ${header(ctx, info, progress)}
    <div class="t-screen__body">
      ${hero(ctx, info)}
      ${syncLine(ctx, info)}
      ${body}
    </div>
    ${actionBar(ctx, info, progress)}
  </section>`;
}
