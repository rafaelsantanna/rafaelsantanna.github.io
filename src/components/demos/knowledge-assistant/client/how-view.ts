import type { AskResult } from '../lib/pipeline';
import { fill, plural } from '../strings';
import type { Ctx } from './context';
import { h } from './dom';
import { isShortQuestionCap } from './turn';

/** One pipeline step; the bar shows its share of the total measured time. */
function step(name: string, detail: string, duration: number | null, total: number, ctx: Ctx): HTMLLIElement {
  const share = duration === null || total <= 0 ? 0 : Math.min(1, duration / total);
  return h('li', { class: 'ka-step' },
    h('span', { class: 'ka-step__name' }, name),
    h('span', { class: 'ka-step__detail' }, detail),
    duration === null ? null : h('span', { class: 'ka-step__ms' }, ctx.ms(duration)),
    duration === null ? null : h('span', { class: 'ka-step__bar', 'aria-hidden': 'true' }, h('span', { style: `--share: ${share}` })),
  );
}

function wordList(words: string[], ctx: Ctx): string {
  return words.length > 0 ? words.join(', ') : ctx.t.howNone;
}

function confidenceDetail(result: AskResult, ctx: Ctx): string {
  const { t } = ctx;
  const { confidence, settings, analysis } = result;
  const formula = fill(t.stepConfidenceDetail, {
    score: ctx.decimal(confidence.score),
    coverage: ctx.decimal(confidence.coverage),
    value: ctx.decimal(confidence.value),
    t: ctx.decimal(settings.threshold),
  });
  return isShortQuestionCap(result) ? `${formula}. ${plural(t.stepConfidenceShort, analysis.terms.length)}` : formula;
}

/** "How this answer was built": normalized terms and the measured pipeline steps. */
export function renderHow(result: AskResult, ctx: Ctx): HTMLDetailsElement {
  const { t } = ctx;
  const { analysis, timings } = result;
  const unmatched = new Set(result.unmatched.map((term) => term.stem));

  const tokens = h('ul', { class: 'ka-tokens' }, ...analysis.terms.map((term) => {
    const missing = unmatched.has(term.stem);
    return h('li', { class: missing ? 'ka-token ka-token--miss' : 'ka-token' },
      h('span', { class: 'ka-token__word' }, term.words.join(' / ')),
      h('span', { class: 'ka-token__arrow', 'aria-hidden': 'true' }, ctx.icon('arrow')),
      h('code', { class: 'ka-token__stem' }, term.stem),
      missing ? h('span', { class: 'ka-sr' }, ` (${t.howUnmatched})`) : null,
    );
  }));

  const total = timings.total;
  const steps = h('ol', { class: 'ka-steps' },
    step(t.stepNormalize, plural(t.stepNormalizeDetail, analysis.terms.length), timings.normalize, total, ctx));
  if (result.outcome === 'empty') {
    steps.append(step(t.stepEmpty, t.stepEmptyDetail, null, total, ctx));
  } else {
    steps.append(
      step(t.stepRetrieve, plural(t.stepRetrieveDetail, result.hits.length, { passages: plural(t.passagesCount, result.searched.passages) }), timings.retrieve, total, ctx),
      step(t.stepConfidence, confidenceDetail(result, ctx), timings.confidence, total, ctx),
      result.answer
        ? step(t.stepAssemble, fill(t.stepAssembleDetail, {
          sentences: plural(t.sentencesCount, result.answer.parts.reduce((sum, part) => sum + part.sentences.length, 0)),
          passages: plural(t.passagesCount, result.answer.parts.length),
        }), timings.assemble, total, ctx)
        : step(t.stepHandoff, t.stepHandoffDetail, timings.assemble, total, ctx),
    );
  }

  return h('details', { class: 'ka-how' },
    h('summary', { class: 'ka-how__summary' },
      ctx.icon('chevron'),
      h('span', { class: 'ka-how__title' }, t.howTitle),
      h('span', { class: 'ka-how__chip' }, ctx.ms(timings.total)),
    ),
    h('div', { class: 'ka-how__body' },
      h('p', { class: 'ka-how__label' }, t.howTokens),
      analysis.terms.length > 0 ? tokens : null,
      h('dl', { class: 'ka-how__words' },
        h('div', {}, h('dt', {}, t.howIgnored), h('dd', {}, wordList(analysis.ignored, ctx))),
        result.outcome === 'empty' ? null : h('div', {}, h('dt', {}, t.howUnmatched), h('dd', {}, wordList(result.unmatched.flatMap((term) => term.words), ctx))),
      ),
      steps,
      h('p', { class: 'ka-how__total' }, fill(t.howTotal, { ms: ctx.ms(timings.total) })),
    ),
  );
}
