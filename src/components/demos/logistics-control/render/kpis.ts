import { fill, formatNumber, formatPercent } from '../lib/format';
import type { Status } from '../lib/model';
import type { Kpis } from '../lib/query';
import type { RenderContext } from './context';
import { esc, icon } from './html';

/** Sparkline path in a 100 x 28 box; the line keeps its width when the SVG stretches. */
export function sparkline(values: number[], fixedRange?: [number, number]): string {
  const series = values.length > 1 ? values : [values[0] ?? 0, values[0] ?? 0];
  const min = fixedRange ? fixedRange[0] : Math.min(...series);
  const max = fixedRange ? fixedRange[1] : Math.max(...series);
  const span = max - min || 1;
  const points = series.map((value, index) => {
    const x = (index / (series.length - 1)) * 100;
    const y = 25 - ((value - min) / span) * 21;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const line = `M${points.join('L')}`;
  return `<svg class="lc-spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="lc-spark__area" d="${line}L100 28L0 28Z"/><path class="lc-spark__line" d="${line}"/></svg>`;
}

interface Card { key: keyof Kpis['series']; label: string; value: string; hint: string; status: Status | ''; iconName: string; tone: string }

export function renderKpis(kpis: Kpis, ctx: RenderContext): string {
  const { t, lang } = ctx;
  const pct = (part: number) => formatPercent(lang, kpis.total ? part / kpis.total : 0);
  const cards: Card[] = [
    { key: 'total', label: t.overview.total, value: formatNumber(lang, kpis.total), hint: t.overview.totalHint, status: '', iconName: 'deliveries', tone: 'neutral' },
    { key: 'route', label: t.overview.route, value: formatNumber(lang, kpis.route), hint: fill(t.overview.routeHint, { pct: pct(kpis.route) }), status: 'route', iconName: 'route', tone: 'route' },
    { key: 'late', label: t.overview.late, value: formatNumber(lang, kpis.late), hint: t.overview.lateHint, status: 'late', iconName: 'late', tone: 'late' },
    { key: 'delivered', label: t.overview.delivered, value: formatNumber(lang, kpis.delivered), hint: fill(t.overview.deliveredHint, { pct: pct(kpis.delivered) }), status: 'delivered', iconName: 'delivered', tone: 'delivered' },
    { key: 'onTime', label: t.overview.onTime, value: formatPercent(lang, kpis.onTime, 1), hint: t.overview.onTimeHint, status: '', iconName: 'check', tone: 'accent' },
  ];
  return cards
    .map((card) => {
      const range: [number, number] | undefined = card.key === 'onTime' ? [0.7, 1] : undefined;
      const body = `<span class="lc-kpi__label">${icon(card.iconName)}<span>${esc(card.label)}</span></span><span class="lc-kpi__value">${esc(card.value)}</span><span class="lc-kpi__hint">${esc(card.hint)}</span>${sparkline(kpis.series[card.key], range)}`;
      const interactive = card.key !== 'onTime';
      const inner = interactive
        ? `<button type="button" class="lc-kpi__body" data-action="kpi" data-status="${card.status}" data-key="kpi-${card.key}">${body}<span class="lc-sr">. ${esc(t.overview.kpiOpen)}</span>${icon('arrow', 'lc-icon lc-kpi__go')}</button>`
        : `<div class="lc-kpi__body">${body}</div>`;
      return `<li class="lc-kpi lc-kpi--${card.tone}">${inner}</li>`;
    })
    .join('');
}
