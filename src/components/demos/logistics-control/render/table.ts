import { fill, formatNumber } from '../lib/format';
import { STATUSES, type Delivery, type Status } from '../lib/model';
import { pageWindow, SORT_KEYS, type PageSlice, type Sort, type SortKey } from '../lib/query';
import { driverName, etaCell, priorityFlag, statusBadge, windowLabel, zoneCell, type RenderContext } from './context';
import { cx, esc, icon } from './html';

const NUMERIC: SortKey[] = ['window', 'eta', 'volumes'];

export type CheckState = 'on' | 'off' | 'mixed';

export function pageCheckState(items: Delivery[], selection: Set<string>): CheckState {
  const selected = items.filter((item) => selection.has(item.id)).length;
  if (!selected) return 'off';
  return selected === items.length ? 'on' : 'mixed';
}

function checkbox(attrs: string, label: string, state: CheckState): string {
  return `<input type="checkbox" class="lc-check" ${attrs} aria-label="${esc(label)}"${state === 'on' ? ' checked' : ''} data-state="${state}" />`;
}

export function renderHead(sort: Sort, pageState: CheckState, ctx: RenderContext): string {
  const { t } = ctx;
  const cells = SORT_KEYS.map((key) => {
    const active = sort.key === key;
    const ariaSort = active ? ` aria-sort="${sort.dir === 'asc' ? 'ascending' : 'descending'}"` : '';
    const sortIcon = active ? (sort.dir === 'asc' ? 'sortAsc' : 'sortDesc') : 'sortNone';
    const label = t.list.columns[key];
    const srLabel = key === 'volumes' ? `<span class="lc-sr">${esc(t.list.volumesLong)}</span><span aria-hidden="true">${esc(label)}</span>` : esc(label);
    return `<th scope="col" class="${cx(`lc-col-${key}`, NUMERIC.includes(key) && 'lc-num', active && 'is-sorted')}"${ariaSort}><button type="button" class="lc-sort" data-action="sort" data-sort="${key}" data-key="sort-${key}">${srLabel}${icon(sortIcon, 'lc-icon lc-sort__icon')}</button></th>`;
  }).join('');
  return `<tr><th scope="col" class="lc-col-select">${checkbox('data-action="select-page" data-key="select-page"', t.list.selectPage, pageState)}</th>${cells}</tr>`;
}

export function renderRows(items: Delivery[], selection: Set<string>, ctx: RenderContext): string {
  const { t } = ctx;
  return items
    .map((delivery) => {
      const selected = selection.has(delivery.id);
      return `<tr class="${cx('lc-row', selected && 'is-selected', delivery.priority && 'is-priority')}" data-row="${delivery.id}">
        <td class="lc-col-select">${checkbox(`data-action="select" data-id="${delivery.id}" data-key="sel-${delivery.id}"`, fill(t.list.selectRow, { id: delivery.id }), selected ? 'on' : 'off')}</td>
        <th scope="row" class="lc-col-id"><span class="lc-idcell"><button type="button" class="lc-idlink" data-action="open" data-id="${delivery.id}" data-key="open-${delivery.id}" aria-label="${esc(fill(t.list.open, { id: delivery.id }))}">${esc(delivery.id)}</button>${delivery.priority ? priorityFlag(ctx) : ''}</span></th>
        <td class="lc-col-customer">${esc(delivery.customer)}</td>
        <td class="lc-col-zone">${zoneCell(delivery, ctx)}</td>
        <td class="lc-col-driver">${esc(driverName(delivery.driverId, ctx))}</td>
        <td class="lc-num lc-col-window">${esc(windowLabel(delivery, ctx.clock))}</td>
        <td class="lc-num lc-col-eta">${etaCell(delivery, ctx)}</td>
        <td class="lc-num lc-col-volumes">${formatNumber(ctx.lang, delivery.volumes)}</td>
        <td class="lc-col-status">${statusBadge(delivery.status, ctx)}</td>
      </tr>`;
    })
    .join('');
}

/** Card list used on narrow screens, with the same data and actions as the table. */
export function renderCards(items: Delivery[], selection: Set<string>, ctx: RenderContext): string {
  const { t } = ctx;
  return items
    .map((delivery) => {
      const selected = selection.has(delivery.id);
      const meta: [string, string][] = [
        [t.list.columns.zone, zoneCell(delivery, ctx)],
        [t.list.columns.driver, esc(driverName(delivery.driverId, ctx))],
        [t.list.columns.window, esc(windowLabel(delivery, ctx.clock))],
        [t.list.columns.eta, etaCell(delivery, ctx)],
      ];
      return `<li class="${cx('lc-dcard', selected && 'is-selected', delivery.priority && 'is-priority')}" data-row="${delivery.id}">
        <div class="lc-dcard__top"><label class="lc-hit">${checkbox(`data-action="select" data-id="${delivery.id}" data-key="csel-${delivery.id}"`, fill(t.list.selectRow, { id: delivery.id }), selected ? 'on' : 'off')}</label><button type="button" class="lc-idlink" data-action="open" data-id="${delivery.id}" data-key="copen-${delivery.id}" aria-label="${esc(fill(t.list.open, { id: delivery.id }))}">${esc(delivery.id)}</button>${delivery.priority ? priorityFlag(ctx) : ''}${statusBadge(delivery.status, ctx)}</div>
        <p class="lc-dcard__customer">${esc(delivery.customer)}</p>
        <dl class="lc-dcard__meta">${meta.map(([term, value]) => `<div><dt>${esc(term)}</dt><dd>${value}</dd></div>`).join('')}</dl>
      </li>`;
    })
    .join('');
}

export function renderPagination(slice: PageSlice<Delivery>, ctx: RenderContext): string {
  const { t } = ctx;
  if (slice.pages <= 1) return '';
  const button = (page: number, content: string, attrs: string, disabled: boolean) =>
    `<li><button type="button" class="lc-page" data-action="page" data-page="${page}"${disabled ? ' aria-disabled="true"' : ''} ${attrs}>${content}</button></li>`;
  const numbers = pageWindow(slice.page, slice.pages)
    .map((page) => (page === null
      ? '<li class="lc-page-gap" aria-hidden="true">…</li>'
      : button(page, String(page), `data-key="page-${page}" data-num aria-label="${esc(fill(t.list.page, { n: page }))}"${page === slice.page ? ' aria-current="page"' : ''}`, false)))
    .join('');
  return `<ul class="lc-pages">${button(slice.page - 1, `${icon('left')}<span class="lc-page__text">${esc(t.list.prev)}</span>`, 'data-key="page-prev"', slice.page === 1)}${numbers}${button(slice.page + 1, `<span class="lc-page__text">${esc(t.list.next)}</span>${icon('right')}`, 'data-key="page-next"', slice.page === slice.pages)}</ul>`;
}

export function renderRange(slice: PageSlice<Delivery>, ctx: RenderContext): string {
  if (!slice.total) return esc(ctx.t.list.rangeNone);
  return esc(fill(ctx.t.list.range, { from: formatNumber(ctx.lang, slice.from), to: formatNumber(ctx.lang, slice.to), total: formatNumber(ctx.lang, slice.total) }));
}

export function renderStatusChips(active: Status[], counts: Record<Status, number>, ctx: RenderContext): string {
  return STATUSES.map((status) => {
    const pressed = active.includes(status);
    return `<button type="button" class="lc-chip lc-chip--${status}" aria-pressed="${pressed}" data-action="status-chip" data-status="${status}" data-key="status-${status}">${icon(pressed ? 'check' : status, 'lc-icon lc-chip__icon')}<span>${esc(ctx.t.status[status])}</span><span class="lc-chip__count">${formatNumber(ctx.lang, counts[status])}</span></button>`;
  }).join('');
}
