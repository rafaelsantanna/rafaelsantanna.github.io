import { fill, formatNumber } from '../lib/format';
import { attentionOf, type DriverStats } from '../lib/query';
import { zoneName, type RenderContext } from './context';
import { esc, icon } from './html';

export function renderDriverCards(stats: Map<string, DriverStats>, ctx: RenderContext): string {
  const { t, lang } = ctx;
  return ctx.drivers
    .map((driver) => {
      const entry = stats.get(driver.id) ?? { total: 0, done: 0, open: 0, route: 0, late: 0, issues: 0, awaiting: 0 };
      const ratio = entry.total ? entry.done / entry.total : 0;
      const attention = attentionOf(entry);
      const counts: [string, string, number][] = [
        ['route', t.driversView.route, entry.route],
        ['late', t.driversView.late, entry.late],
        ['issue', t.driversView.issues, entry.issues],
      ];
      return `<li class="lc-driver lc-driver--${attention}">
        <div class="lc-driver__head"><span class="lc-avatar lc-avatar--lg" aria-hidden="true">${esc(driver.initials)}</span><div><h3 class="lc-driver__name">${esc(driver.name)}</h3><p class="lc-driver__meta">${esc(t.vehicles[driver.vehicle])} · ${esc(t.hubs[driver.hubId])} · ${esc(zoneName(driver.zoneId, ctx))}</p></div></div>
        <div class="lc-driver__progress"><span class="lc-driver__progress-label">${esc(t.driversView.progress)}</span><span class="lc-driver__progress-value">${esc(fill(t.driversView.progressValue, { done: formatNumber(lang, entry.done), total: formatNumber(lang, entry.total) }))}</span><span class="lc-bar" aria-hidden="true"><span style="width:${(ratio * 100).toFixed(1)}%"></span></span></div>
        <ul class="lc-driver__counts">${counts.map(([status, label, value]) => `<li class="lc-driver__count lc-driver__count--${status}${value ? ' has-value' : ''}">${icon(status)}<span class="lc-driver__count-value">${formatNumber(lang, value)}</span><span class="lc-driver__count-label">${esc(label)}</span></li>`).join('')}</ul>
        <button type="button" class="lc-btn lc-btn--ghost lc-driver__go" data-action="driver" data-driver="${driver.id}" data-key="dv-${driver.id}" aria-label="${esc(fill(t.driversView.actionFor, { name: driver.name }))}"><span>${esc(t.driversView.action)}</span>${icon('arrow')}</button>
      </li>`;
    })
    .join('');
}
