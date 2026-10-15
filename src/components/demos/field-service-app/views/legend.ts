import type { Strings } from '../content/strings';
import { unsyncedInOrder } from '../lib/queue';
import { esc, fill } from '../lib/text';
import type { EventStatus, QueueEvent } from '../lib/types';
import { eventStatusIcons } from './common';
import { icon } from './icons';

const STRIP_SIZE = 8;

export const legendOrder: EventStatus[] = ['pending', 'sending', 'failed', 'synced'];

/** Small tiles for the events still to be sent, in sending order. Purely visual; the counts carry the information. */
export function legendStrip(s: Strings, events: QueueEvent[]): string {
  const queued = unsyncedInOrder(events);
  if (!queued.length) return `<p class="turno-strip__empty">${icon('cloudCheck')}${esc(s.stage.legendEmpty)}</p>`;
  const tiles = queued
    .slice(0, STRIP_SIZE)
    .map((event) => `<span class="turno-strip__tile" data-status="${event.status}">${icon(eventStatusIcons[event.status], event.status === 'sending' ? 't-spin' : '')}</span>`)
    .join('');
  const more = queued.length > STRIP_SIZE ? `<span class="turno-strip__more">${esc(fill(s.stage.legendMore, { n: queued.length - STRIP_SIZE }))}</span>` : '';
  return `<div class="turno-strip__tiles">${tiles}${more}</div>`;
}
