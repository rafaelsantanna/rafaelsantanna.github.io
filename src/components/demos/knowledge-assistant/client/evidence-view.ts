import type { Bm25Hit } from '../lib/bm25';
import { CONFIDENCE_WEIGHTS } from '../lib/confidence';
import type { Passage } from '../lib/passages';
import { tokenize } from '../lib/text';
import { fill, plural } from '../strings';
import type { Ctx } from './context';
import { h, highlight } from './dom';
import { confidenceLevel, queryStems, type Turn } from './turn';

/** First surface form of each matched stem, preferring the paragraph over the title and heading. */
function matchedWords(hit: Bm25Hit, passage: Passage, ctx: Ctx): string[] {
  const matched = new Set(hit.matched);
  const words = new Map<string, string>();
  for (const text of [passage.text, passage.sectionHeading, passage.docTitle]) {
    for (const token of tokenize(text, ctx.lang)) {
      if (!token.stop && matched.has(token.stem) && !words.has(token.stem)) words.set(token.stem, token.raw.toLowerCase());
    }
  }
  return hit.matched.map((stem) => words.get(stem) ?? stem);
}

/** Passage text with matched terms marked and the sentences quoted in the answer underlined. */
function passageText(text: string, used: readonly string[], stems: ReadonlySet<string>, ctx: Ctx): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let cursor = 0;
  for (const sentence of used) {
    const start = text.indexOf(sentence, cursor);
    if (start < 0) continue;
    if (start > cursor) fragment.append(highlight(text.slice(cursor, start), stems, ctx.lang));
    fragment.append(h('span', { class: 'ka-used' }, highlight(sentence, stems, ctx.lang)));
    cursor = start + sentence.length;
  }
  if (cursor < text.length) fragment.append(highlight(text.slice(cursor), stems, ctx.lang));
  return fragment;
}

function renderCard(turn: Turn, hit: Bm25Hit, rank: number, citations: Map<number, number>, ctx: Ctx): HTMLLIElement {
  const { t, engine } = ctx;
  const passage = engine.passages[hit.index];
  const citation = citations.get(hit.index);
  const used = turn.result.answer?.parts.find((part) => part.passageIndex === hit.index)?.sentences ?? [];
  const top = turn.result.hits[0]?.score || 1;
  const status = citation ? fill(t.evCited, { n: citation }) : t.evUncited;

  return h('li', { class: citation ? 'ka-ev is-cited' : 'ka-ev', 'data-passage': hit.index },
    h('div', { class: 'ka-ev__top' },
      h('span', { class: citation ? 'ka-ev__badge ka-ev__badge--cited' : 'ka-ev__badge', 'aria-hidden': 'true' }, citation ? String(citation) : `#${rank + 1}`),
      h('div', { class: 'ka-ev__title' },
        h('h3', { class: 'ka-ev__doc', tabindex: -1 }, passage.docTitle, h('span', { class: 'ka-sr' }, `. ${status}. ${fill(t.evRank, { n: rank + 1 })}.`)),
        h('p', { class: 'ka-ev__section' }, passage.sectionHeading),
      ),
      h('p', { class: 'ka-ev__score' }, h('span', { class: 'ka-sr' }, `${t.evScore}: `), ctx.decimal(hit.score)),
    ),
    h('div', { class: 'ka-ev__bar', 'aria-hidden': 'true' }, h('span', { style: `--w: ${Math.max(0.04, hit.score / top)}` })),
    h('p', { class: 'ka-ev__status', 'aria-hidden': 'true' }, status),
    h('p', { class: 'ka-ev__text' }, passageText(passage.text, used, queryStems(turn.result), ctx)),
    h('div', { class: 'ka-ev__foot' },
      h('p', { class: 'ka-ev__terms' },
        h('span', { class: 'ka-ev__terms-label' }, `${t.evMatched}:`),
        ...matchedWords(hit, passage, ctx).map((word) => h('span', { class: 'ka-term' }, word)),
      ),
      h('button', { type: 'button', class: 'ka-ev__open', 'data-open-passage': hit.index, 'data-citation': citation ?? null },
        h('span', {}, t.evOpen),
        h('span', { class: 'ka-sr' }, `: ${fill(t.evOpenContext, { doc: passage.docTitle, n: rank + 1 })}`),
        ctx.icon('open'),
      ),
    ),
  );
}

/** Confidence at a glance: the value, its two weighted parts and the threshold on one scale. */
function renderGauge(turn: Turn, ctx: Ctx): HTMLDivElement {
  const { t } = ctx;
  const { result } = turn;
  const { score, coverage, value } = result.confidence;
  const { threshold } = result.settings;
  const level = confidenceLevel(result);
  const labels = { high: t.levelHigh, ok: t.levelOk, low: t.levelLow };
  const part = (weight: number, amount: number) => `${ctx.decimal(weight, 1)} × ${ctx.decimal(amount)}`;
  const legend = (kind: string, label: string, detail: string) => h('div', { class: `ka-gauge__row ka-gauge__row--${kind}` },
    h('dt', {}, label),
    h('dd', {}, detail),
  );

  return h('div', { class: 'ka-gauge', 'data-level': level },
    h('p', { class: 'ka-sr' }, `${plural(t.evidenceSummary, result.hits.length, { value: ctx.decimal(value) })}, ${labels[level]}, ${fill(t.thresholdShort, { t: ctx.decimal(threshold) })}.`),
    h('div', { class: 'ka-gauge__top', 'aria-hidden': 'true' },
      h('span', { class: 'ka-gauge__label' }, t.confidence),
      h('span', { class: 'ka-gauge__value' }, ctx.decimal(value)),
      h('span', { class: 'ka-gauge__level' }, labels[level]),
    ),
    h('div', {
      class: 'ka-gauge__bar',
      'aria-hidden': 'true',
      style: `--score: ${CONFIDENCE_WEIGHTS.score * score}; --coverage: ${CONFIDENCE_WEIGHTS.coverage * coverage}; --threshold: ${threshold}`,
    },
    h('span', { class: 'ka-gauge__seg ka-gauge__seg--score' }),
    h('span', { class: 'ka-gauge__seg ka-gauge__seg--coverage' }),
    h('span', { class: 'ka-gauge__tick' }, h('span', {}, fill(t.thresholdShort, { t: ctx.decimal(threshold) }))),
    ),
    h('dl', { class: 'ka-gauge__legend' },
      legend('score', t.evScore, part(CONFIDENCE_WEIGHTS.score, score)),
      legend('coverage', t.confCoverage, part(CONFIDENCE_WEIGHTS.coverage, coverage)),
    ),
  );
}

/** Every passage of the base as one mark, grouped by document; retrieved and cited passages light up. */
function renderMap(turn: Turn, citations: Map<number, number>, ctx: Ctx): HTMLDivElement {
  const { t, engine } = ctx;
  const { result } = turn;
  const scores = new Map(result.hits.map((hit) => [hit.index, hit.score]));
  const top = result.hits[0]?.score || 1;
  const scope = result.settings.docs ? new Set(result.settings.docs) : null;
  const columns = new Map<string, HTMLSpanElement>();

  engine.passages.forEach((passage, index) => {
    let column = columns.get(passage.docId);
    if (!column) {
      const off = scope !== null && !scope.has(passage.docId);
      column = h('span', { class: off ? 'ka-map__doc is-off' : 'ka-map__doc', title: passage.docTitle });
      columns.set(passage.docId, column);
    }
    const score = scores.get(index);
    const state = citations.has(index) ? ' is-cited' : score !== undefined ? ' is-hit' : '';
    column.append(h('span', { class: `ka-map__tick${state}`, style: score === undefined ? null : `--h: ${Math.max(0.25, score / top)}` }));
  });

  return h('div', { class: 'ka-map-block', 'aria-hidden': 'true' },
    h('p', { class: 'ka-map-block__title' }, t.mapTitle),
    h('div', { class: 'ka-map' }, ...columns.values()),
    h('p', { class: 'ka-map-block__legend' },
      h('span', { class: 'ka-map-key ka-map-key--cited' }, t.mapCited),
      h('span', { class: 'ka-map-key ka-map-key--hit' }, t.mapRetrieved),
    ),
  );
}

/** Evidence panel for one turn: the question, the outcome and every retrieved passage. */
export function renderEvidence(turn: Turn, ctx: Ctx): HTMLElement[] {
  const { t } = ctx;
  const { result } = turn;
  const citations = new Map(result.answer?.parts.map((part) => [part.passageIndex, part.citation]) ?? []);
  const head = h('div', { class: 'ka-ev-head' },
    h('p', { class: 'ka-ev-head__label' }, t.evidenceFor),
    h('p', { class: 'ka-ev-head__q', tabindex: -1, 'data-evidence-focus': '' }, result.question),
  );
  if (result.outcome !== 'answer') {
    head.append(h('p', { class: 'ka-ev-head__note' }, result.hits.length > 0 ? t.evidenceWeak : t.evidenceNone));
  }
  if (result.outcome !== 'empty') head.append(renderGauge(turn, ctx));
  if (result.hits.length === 0) return [head];
  return [
    head,
    renderMap(turn, citations, ctx),
    h('ol', { class: 'ka-ev-list' }, ...result.hits.map((hit, rank) => renderCard(turn, hit, rank, citations, ctx))),
    h('p', { class: 'ka-ev-legend' }, t.evidenceLegend),
  ];
}
