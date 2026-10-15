import { fill, plural } from '../strings';
import type { Ctx } from './context';
import { h } from './dom';
import type { Turn } from './turn';

function row(term: string, value: string): HTMLDivElement {
  return h('div', { class: 'ka-handoff__row' }, h('dt', {}, term), h('dd', {}, value));
}

export function handoffDoneText(ctx: Ctx): string {
  return fill(ctx.t.handoffDone, { team: ctx.engine.corpus.handoffTeam });
}

/** Low-confidence card: no answer, a prefilled summary and a simulated handoff. */
export function renderHandoff(turn: Turn, ctx: Ctx): HTMLDivElement {
  const { t, engine } = ctx;
  const { result } = turn;
  const team = engine.corpus.handoffTeam;
  const closest = result.hits[0] ? engine.passages[result.hits[0].index] : null;
  const searched = { docs: plural(t.docsCount, result.searched.documents), passages: plural(t.passagesCount, result.searched.passages) };
  const unmatched = result.unmatched.flatMap((term) => term.words);
  const filtered = result.settings.docs?.length ?? 0;

  const send = h('button', { type: 'button', class: 'ka-btn ka-btn--primary', 'data-handoff': turn.id, 'aria-disabled': turn.forwarded ? 'true' : null },
    ctx.icon(turn.forwarded ? 'check' : 'handoff'),
    h('span', {}, turn.forwarded ? t.handoffSent : t.handoffAction),
  );

  return h('div', { class: 'ka-handoff' },
    h('p', { class: 'ka-handoff__title' }, t.handoffTitle),
    h('p', { class: 'ka-handoff__ask' }, fill(t.handoffAsk, { team })),
    h('div', { class: 'ka-handoff__summary' },
      h('p', { class: 'ka-handoff__summary-title' }, t.handoffSummary),
      h('dl', {},
        row(t.handoffQuestion, result.question),
        row(t.handoffSearch, closest
          ? fill(t.handoffSearchValue, { ...searched, doc: closest.docTitle, section: closest.sectionHeading })
          : fill(t.handoffSearchNone, searched)),
        row(t.handoffConfidence, fill(t.handoffConfidenceValue, { value: ctx.decimal(result.confidence.value), t: ctx.decimal(result.settings.threshold) })),
        unmatched.length > 0 ? row(t.handoffUnmatched, unmatched.join(', ')) : null,
      ),
    ),
    filtered > 0 ? h('p', { class: 'ka-handoff__filtered' }, plural(t.handoffFiltered, filtered)) : null,
    h('div', { class: 'ka-handoff__actions' },
      send,
      filtered > 0 ? h('button', { type: 'button', class: 'ka-btn ka-btn--ghost', 'data-retry-all': turn.id }, t.handoffRetryAll) : null,
    ),
    h('p', { class: turn.forwarded ? 'ka-handoff__note is-done' : 'ka-handoff__note', 'data-handoff-note': '' }, turn.forwarded ? handoffDoneText(ctx) : t.handoffNote),
  );
}
