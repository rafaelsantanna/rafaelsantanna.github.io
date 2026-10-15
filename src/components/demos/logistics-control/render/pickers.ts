import { fill, formatNumber } from '../lib/format';
import { ISSUE_TYPES } from '../lib/model';
import type { DriverStats } from '../lib/query';
import { zoneName, type RenderContext } from './context';
import { esc, icon } from './html';

/** Driver choices for reassignment. `current` lists the drivers that already hold the selected deliveries. */
export function renderDriverPicker(stats: Map<string, DriverStats>, current: Set<string>, ctx: RenderContext): string {
  const { t, lang } = ctx;
  return ctx.drivers
    .map((driver) => {
      const isCurrent = current.size === 1 && current.has(driver.id);
      const open = fill(t.reassignDialog.open, { n: formatNumber(lang, stats.get(driver.id)?.open ?? 0) });
      return `<li><button type="button" class="lc-pick" data-action="reassign" data-driver="${driver.id}"${isCurrent ? ' aria-disabled="true"' : ''}><span class="lc-avatar" aria-hidden="true">${esc(driver.initials)}</span><span class="lc-pick__text"><span class="lc-pick__name">${esc(driver.name)}${isCurrent ? ` <span class="lc-pick__current">(${esc(t.reassignDialog.current)})</span>` : ''}</span><span class="lc-pick__meta">${esc(t.hubs[driver.hubId])} · ${esc(zoneName(driver.zoneId, ctx))}</span></span><span class="lc-pick__load">${esc(open)}</span></button></li>`;
    })
    .join('');
}

export function renderIssuePicker(ctx: RenderContext): string {
  return ISSUE_TYPES.map((issue) => `<li><button type="button" class="lc-pick lc-pick--issue" data-action="issue" data-issue="${issue}">${icon('issue')}<span class="lc-pick__name">${esc(ctx.t.exceptionKind[issue])}</span></button></li>`).join('');
}
