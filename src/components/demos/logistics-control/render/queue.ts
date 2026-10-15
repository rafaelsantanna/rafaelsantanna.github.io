import { canRun } from '../lib/actions';
import { timeOf } from '../lib/clock';
import { fill, formatDuration, formatNumber } from '../lib/format';
import { ISSUE_TYPES, type ExceptionKind } from '../lib/model';
import type { ExceptionItem } from '../lib/query';
import { actionButton, driverName, priorityFlag, windowLabel, zoneName, type RenderContext } from './context';
import { esc, icon } from './html';

function card(item: ExceptionItem, ctx: RenderContext, scope: string): string {
  const { t } = ctx;
  const { delivery, kind } = item;
  const isLate = kind === 'late';
  const primary = actionButton({
    label: isLate ? t.queue.reschedule : t.queue.resolve,
    iconName: isLate ? 'calendar' : 'check',
    variant: 'primary',
    attrs: `data-action="${isLate ? 'reschedule' : 'resolve'}" data-id="${delivery.id}" data-key="${scope}-main-${delivery.id}"`,
  });
  const priority = actionButton({
    label: delivery.priority ? t.queue.unprioritize : t.queue.prioritize,
    iconName: 'flag',
    variant: 'ghost',
    restricted: canRun(ctx.role, 'priority') ? undefined : t.permissions.supervisorOnly,
    attrs: `data-action="priority" data-value="${delivery.priority ? 'off' : 'on'}" data-id="${delivery.id}" data-key="${scope}-prio-${delivery.id}"`,
  });
  const meta = [zoneName(delivery.zoneId, ctx), driverName(delivery.driverId, ctx), windowLabel(delivery, ctx.clock)].map(esc).join(' · ');
  return `<li class="lc-xcard lc-xcard--${isLate ? 'late' : 'issue'}${delivery.priority ? ' is-priority' : ''}">
    <div class="lc-xcard__head"><span class="lc-kind lc-kind--${isLate ? 'late' : 'issue'}">${icon(isLate ? 'late' : 'issue')}<span>${esc(t.exceptionKind[kind])}</span></span><span class="lc-xcard__age" title="${esc(fill(t.queue.since, { time: timeOf(ctx.clock, item.openedAt) }))}">${esc(fill(t.queue.age, { t: formatDuration(item.age, t.duration) }))}</span></div>
    <p class="lc-xcard__title"><button type="button" class="lc-idlink" data-action="open" data-id="${delivery.id}" data-key="${scope}-open-${delivery.id}"><span class="lc-sr">${esc(t.queue.details)}: </span>${esc(delivery.id)}</button>${delivery.priority ? priorityFlag(ctx) : ''}<span class="lc-xcard__customer">${esc(delivery.customer)}</span></p>
    <p class="lc-xcard__meta">${meta}</p>
    <div class="lc-xcard__actions">${primary}${priority}</div>
  </li>`;
}

/** How many exceptions the overview panel lists before pointing to the full view. */
export const OVERVIEW_QUEUE_LIMIT = 8;

const KINDS: (ExceptionKind | '')[] = ['', 'late', ...ISSUE_TYPES];

/** Type filter for the exceptions view, with live counts. */
export function renderKindChips(items: ExceptionItem[], active: ExceptionKind | '', ctx: RenderContext): string {
  return KINDS.map((kind) => {
    const count = kind ? items.filter((item) => item.kind === kind).length : items.length;
    const label = kind ? ctx.t.exceptionKind[kind] : ctx.t.queue.all;
    const tone = kind === 'late' ? 'late' : kind ? 'issue' : 'all';
    return `<button type="button" class="lc-chip lc-chip--${tone}" aria-pressed="${active === kind}" data-action="queue-kind" data-kind="${kind}" data-key="kind-${kind || 'all'}"><span>${esc(label)}</span><span class="lc-chip__count">${formatNumber(ctx.lang, count)}</span></button>`;
  }).join('');
}

export function renderQueue(items: ExceptionItem[], ctx: RenderContext, scope: 'ov' | 'ex', emptyText: string): string {
  if (!items.length) return `<li class="lc-empty-inline">${icon('delivered')}<span>${esc(emptyText)}</span></li>`;
  return items.map((item) => card(item, ctx, scope)).join('');
}
