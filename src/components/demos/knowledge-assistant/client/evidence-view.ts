import type { Bm25Hit } from '../lib/bm25';
import type { Passage } from '../lib/passages';
import { tokenize } from '../lib/text';
import { fill, plural } from '../strings';
import type { Ctx } from './context';
import { h, highlight } from './dom';
import { queryStems, type Turn } from './turn';

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

function renderCard(turn: Turn, hit: Bm25Hit, rank: number, citations: Map<number, number>, ctx: Ctx): HTMLLIElement {
  const { t, engine } = ctx;
  const passage = engine.passages[hit.index];
  const citation = citations.get(hit.index);
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
    h('div', { class: 'ka-ev__bar', 'aria-hidden': 'true' }, h('span', { style: `width: ${Math.max(4, Math.round((hit.score / top) * 100))}%` })),
    h('p', { class: 'ka-ev__status', 'aria-hidden': 'true' }, status),
    h('p', { class: 'ka-ev__text' }, highlight(passage.text, queryStems(turn.result), ctx.lang)),
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

/** Evidence panel for one turn: the question, the outcome and every retrieved passage. */
export function renderEvidence(turn: Turn, ctx: Ctx): HTMLElement[] {
  const { t } = ctx;
  const { result } = turn;
  const citations = new Map(result.answer?.parts.map((part) => [part.passageIndex, part.citation]) ?? []);
  const head = h('div', { class: 'ka-ev-head' },
    h('p', { class: 'ka-ev-head__label' }, t.evidenceFor),
    h('p', { class: 'ka-ev-head__q', tabindex: -1, 'data-evidence-focus': '' }, result.question),
  );
  if (result.outcome !== 'empty') {
    head.append(h('p', { class: 'ka-ev-head__meta' }, plural(t.evidenceSummary, result.hits.length, { value: ctx.decimal(result.confidence.value) })));
  }
  if (result.outcome !== 'answer') {
    head.append(h('p', { class: 'ka-ev-head__note' }, result.hits.length > 0 ? t.evidenceWeak : t.evidenceNone));
  }
  if (result.hits.length === 0) return [head];
  return [
    head,
    h('ol', { class: 'ka-ev-list' }, ...result.hits.map((hit, rank) => renderCard(turn, hit, rank, citations, ctx))),
    h('p', { class: 'ka-ev-legend' }, t.evidenceLegend),
  ];
}
