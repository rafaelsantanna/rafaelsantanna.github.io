import { fill, formatNumber, formatPercent } from '../lib/format';
import type { Status } from '../lib/model';
import type { Kpis } from '../lib/query';
import type { RenderContext } from './context';
import { esc, icon } from './html';

/**
 * Sparkline in a 100 x 28 box; the line keeps its width when the SVG stretches. The live value is
 * marked with a dot drawn in HTML, so it stays round however wide the card is.
 */
export function sparkline(values: number[], fixedRange?: [number, number]): string {
  const series = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const min = fixedRange ? fixedRange[0] : Math.min(...series);
  const max = fixedRange ? fixedRange[1] : Math.max(...series);
  const span = max - min || 1;
  const yOf = (value: number) => 25 - ((Math.min(Math.max(value, min), max) - min) / span) * 21;
  const points = series.map((value, index) => `${((index / (series.length - 1)) * 100).toFixed(1)} ${yOf(value).toFixed(1)}`);
  const line = `M${points.join('L')}`;
  const last = yOf(series[series.length - 1]);
  return `<span class="lc-spark-wrap" aria-hidden="true"><svg class="lc-spark" viewBox="0 0 100 28" preserveAspectRatio="none" focusable="false"><path class="lc-spark__area" d="${line}L100 28L0 28Z"/><path class="lc-spark__line" d="${line}"/></svg><span class="lc-spark__dot" style="--y:${((last / 28) * 100).toFixed(1)}%"></span></span>`;
}

interface Card { key: keyof Kpis['series']; label: string; value: string; hint: string; status: Status | ''; iconName: string; tone: string }

export function renderKpis(kpis: Kpis, ctx: RenderContext): string {
  const { t, lang } = ctx;
  const pct = (part: number) => formatPercent(lang, kpis.total ? part / kpis.total : 0);
  const cards: Card[] = [
    { key: 'total', label: t.overview.total, value: formatNumber(lang, kpis.total), hint: t.overview.totalHint, status: '', iconName: 'deliveries', tone: 'neutral' },
    { key: 'route', label: t.overview.route, value: formatNumber(lang, kpis.route), hint: fill(t.overview.routeHint, { pct: pct(kpis.route) }), status: 'route', iconName: 'route', tone: 'route' },
    { key: 'late', label: t.overview.late, value: formatNumber(lang, kpis.late), hint: t.overview.lateHint, status: 'late', iconName: 'late', tone: kpis.late ? 'late' : 'neutral' },
    { key: 'delivered', label: t.overview.delivered, value: formatNumber(lang, kpis.delivered), hint: fill(t.overview.deliveredHint, { pct: pct(kpis.delivered) }), status: 'delivered', iconName: 'delivered', tone: 'delivered' },
    { key: 'onTime', label: t.overview.onTime, value: formatPercent(lang, kpis.onTime, 1), hint: t.overview.onTimeHint, status: '', iconName: 'check', tone: 'accent' },
  ];
  return cards
    .map((card) => {
      const range: [number, number] | undefined = card.key === 'onTime' ? [0.7, 1] : undefined;
      const body = `<span class="lc-kpi__label">${icon(card.iconName)}<span>${esc(card.label)}</span></span><span class="lc-kpi__value" data-kpi-value="${card.key}">${esc(card.value)}</span><span class="lc-kpi__hint">${esc(card.hint)}</span>${sparkline(kpis.series[card.key], range)}`;
      const interactive = card.key !== 'onTime';
      const inner = interactive
        ? `<button type="button" class="lc-kpi__body" data-action="kpi" data-status="${card.status}" data-key="kpi-${card.key}">${body}<span class="lc-sr">. ${esc(t.overview.kpiOpen)}</span>${icon('arrow', 'lc-icon lc-kpi__go')}</button>`
        : `<div class="lc-kpi__body">${body}</div>`;
      return `<li class="lc-kpi lc-kpi--${card.tone}">${inner}</li>`;
    })
    .join('');
}

/** Order of the day bar: work done first, then what is moving, what needs attention and what has not left. */
const MIX: Status[] = ['delivered', 'route', 'late', 'issue', 'awaiting'];

/** Share of the day in each status, as one segmented bar with a readable legend. */
export function renderMix(counts: Record<Status, number>, ctx: RenderContext): string {
  const { t, lang } = ctx;
  const total = MIX.reduce((sum, status) => sum + counts[status], 0);
  const done = formatPercent(lang, total ? counts.delivered / total : 0);
  const segments = MIX.filter((status) => counts[status])
    .map((status) => `<span class="lc-mix__seg lc-mix__seg--${status}" style="flex-grow:${counts[status]}"></span>`)
    .join('');
  const legend = MIX.map((status) => `<li class="lc-mix__item lc-mix__item--${status}"><span class="lc-mix__dot" aria-hidden="true"></span><span class="lc-mix__count">${formatNumber(lang, counts[status])}</span><span class="lc-mix__label">${esc(t.status[status])}</span></li>`).join('');
  return `<div class="lc-mix__head"><h3 class="lc-mix__title">${esc(t.overview.mixTitle)}</h3><p class="lc-mix__done">${esc(fill(t.overview.mixDone, { pct: done }))}</p></div><div class="lc-mix__bar" aria-hidden="true">${segments}</div><ul class="lc-mix__legend">${legend}</ul>`;
}
