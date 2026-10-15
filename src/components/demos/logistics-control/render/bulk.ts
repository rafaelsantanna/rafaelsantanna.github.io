import { canRun } from '../lib/actions';
import { fill, formatNumber, plural } from '../lib/format';
import { actionButton, type RenderContext } from './context';
import { esc, icon } from './html';

export interface BulkState {
  /** Selected deliveries in the current list. */
  selected: number;
  /** Deliveries in the current list. */
  total: number;
  /** True when filters narrow the list. */
  filtered: boolean;
  /** True when every open selected delivery is already a priority. */
  allPriority: boolean;
}

/** Toolbar for the current selection. Empty when nothing is selected. */
export function renderBulk(state: BulkState, ctx: RenderContext): string {
  if (!state.selected) return '';
  const { t, lang } = ctx;
  const selectAllLabel = fill(state.filtered ? t.bulk.selectAllFiltered : t.bulk.selectAll, { n: formatNumber(lang, state.total) });
  const selectAll = state.total > state.selected
    ? `<button type="button" class="lc-linkbtn" data-action="bulk-select-all" data-key="bulk-all">${esc(selectAllLabel)}</button>`
    : '';
  const actions = [
    actionButton({ label: t.bulk.reassign, iconName: 'swap', keepIcon: true, restricted: canRun(ctx.role, 'reassign') ? undefined : t.permissions.supervisorOnly, attrs: 'data-action="bulk-reassign" data-key="bulk-reassign"' }),
    actionButton({ label: state.allPriority ? t.bulk.unprioritize : t.bulk.prioritize, iconName: 'flag', keepIcon: true, restricted: canRun(ctx.role, 'priority') ? undefined : t.permissions.supervisorOnly, attrs: `data-action="bulk-priority" data-value="${state.allPriority ? 'off' : 'on'}" data-key="bulk-priority"` }),
    actionButton({ label: t.bulk.export, iconName: 'download', attrs: 'data-action="bulk-export" data-key="bulk-export"' }),
  ].join('');
  return `<div class="lc-bulk__info"><p class="lc-bulk__count">${esc(plural(lang, state.selected, t.bulk.selected))}</p>${selectAll}</div><div class="lc-bulk__actions">${actions}<button type="button" class="lc-iconbtn" data-action="bulk-clear" data-key="bulk-clear" aria-label="${esc(t.bulk.clear)}">${icon('close')}</button></div>`;
}
