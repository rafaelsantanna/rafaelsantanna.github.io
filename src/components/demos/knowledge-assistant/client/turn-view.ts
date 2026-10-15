import type { AskResult } from '../lib/pipeline';
import { fill } from '../strings';
import type { Ctx } from './context';
import { h } from './dom';
import { renderHandoff } from './handoff-view';
import { renderHow } from './how-view';
import { confidenceLevel, type Turn } from './turn';

function renderQuestion(question: string, ctx: Ctx): HTMLDivElement {
  return h('div', { class: 'ka-q' },
    h('p', { class: 'ka-q__who' }, ctx.t.you),
    h('h3', { class: 'ka-q__text' }, question),
  );
}

function renderWho(ctx: Ctx): HTMLParagraphElement {
  return h('p', { class: 'ka-a__who' }, ctx.mark(), h('span', {}, ctx.t.assistant));
}

function renderConfidence(result: AskResult, ctx: Ctx): HTMLDivElement {
  const { t } = ctx;
  const level = confidenceLevel(result);
  const labels = { high: t.levelHigh, ok: t.levelOk, low: t.levelLow };
  const { value } = result.confidence;
  const { threshold } = result.settings;
  return h('div', { class: 'ka-conf', 'data-level': level },
    h('span', { class: 'ka-conf__label' }, t.confidence),
    h('span', { class: 'ka-conf__meter', 'aria-hidden': 'true', style: `--value: ${value}; --threshold: ${threshold}` },
      h('span', { class: 'ka-conf__fill' }),
      h('span', { class: 'ka-conf__tick' }),
    ),
    h('span', { class: 'ka-conf__value' }, ctx.decimal(value)),
    h('span', { class: 'ka-conf__level' }, labels[level]),
    h('span', { class: 'ka-sr' }, `, ${fill(t.thresholdShort, { t: ctx.decimal(threshold) })}`),
  );
}

export function feedbackNote(turn: Turn, ctx: Ctx): string {
  if (turn.feedback === 'up') return ctx.t.feedbackUp;
  if (turn.feedback === 'down') return ctx.t.feedbackDown;
  return '';
}

function renderAnswerBody(turn: Turn, ctx: Ctx): HTMLElement[] {
  const { t, engine } = ctx;
  const { result } = turn;
  const answer = result.answer;
  if (!answer) return [];

  const text = h('p', { class: 'ka-a__text' });
  answer.parts.forEach((part, index) => {
    const passage = engine.passages[part.passageIndex];
    if (index > 0) text.append(' ');
    text.append(`${part.sentences.join(' ')} `, h('button', {
      type: 'button',
      class: 'ka-cite',
      'data-cite': part.citation,
      'data-passage': part.passageIndex,
      'aria-label': fill(t.citeLabel, { n: part.citation, doc: passage.docTitle, section: passage.sectionHeading }),
    }, String(part.citation)));
  });

  const sourcesId = `ka-sources-${turn.id}`;
  const sources = h('div', { class: 'ka-a__sources' },
    h('p', { class: 'ka-a__sources-title', id: sourcesId }, t.answerSources),
    h('ol', { class: 'ka-source-list', 'aria-labelledby': sourcesId }, ...answer.parts.map((part) => {
      const passage = engine.passages[part.passageIndex];
      return h('li', {}, h('button', { type: 'button', class: 'ka-source', 'data-open-passage': part.passageIndex, 'data-citation': part.citation, 'data-passage': part.passageIndex },
        h('span', { class: 'ka-source__n', 'aria-hidden': 'true' }, String(part.citation)),
        h('span', { class: 'ka-source__text' },
          h('span', { class: 'ka-source__doc' }, passage.docTitle),
          h('span', { class: 'ka-source__section' }, passage.sectionHeading),
        ),
        h('span', { class: 'ka-sr' }, `, ${t.evOpen}`),
        ctx.icon('open'),
      ));
    })),
  );

  const feedbackId = `ka-feedback-${turn.id}`;
  const feedbackButton = (kind: 'up' | 'down') => h('button', {
    type: 'button',
    class: 'ka-fb',
    'aria-pressed': turn.feedback === kind ? 'true' : 'false',
    'data-feedback': kind,
  }, ctx.icon(kind === 'up' ? 'thumbUp' : 'thumbDown'), h('span', {}, kind === 'up' ? t.useful : t.notUseful));

  const foot = h('div', { class: 'ka-a__foot' },
    h('div', { class: 'ka-feedback', role: 'group', 'aria-labelledby': feedbackId },
      h('span', { class: 'ka-feedback__label', id: feedbackId }, t.feedbackLabel),
      feedbackButton('up'),
      feedbackButton('down'),
    ),
    renderEvidenceToggle(turn, ctx),
  );
  const note = h('p', { class: 'ka-feedback__note', 'data-feedback-note': '' }, feedbackNote(turn, ctx));
  return [text, sources, foot, note];
}

function renderEvidenceToggle(turn: Turn, ctx: Ctx): HTMLButtonElement {
  return h('button', { type: 'button', class: 'ka-evbtn', 'aria-pressed': 'false', 'aria-controls': 'ka-pane-evidence', 'data-show-evidence': turn.id },
    ctx.icon('search'),
    h('span', {}, ctx.t.evidenceToggle),
    h('span', { class: 'ka-evbtn__n' }, String(turn.result.hits.length)),
  );
}

export function renderTurn(turn: Turn, ctx: Ctx): HTMLLIElement {
  const { t } = ctx;
  const { result } = turn;
  const article = h('article', { class: `ka-a ka-a--${result.outcome}`, 'aria-label': t.answerLabel, tabindex: -1 });
  const head = h('header', { class: 'ka-a__head' }, renderWho(ctx));
  if (result.outcome !== 'empty') head.append(renderConfidence(result, ctx));
  article.append(head);

  if (result.outcome === 'answer') article.append(...renderAnswerBody(turn, ctx));
  if (result.outcome === 'handoff') {
    article.append(renderHandoff(turn, ctx));
    if (result.hits.length > 0) article.append(h('div', { class: 'ka-a__foot ka-a__foot--end' }, renderEvidenceToggle(turn, ctx)));
  }
  if (result.outcome === 'empty') article.append(h('p', { class: 'ka-a__text ka-a__text--muted' }, t.emptyAnswer));
  article.append(renderHow(result, ctx));

  return h('li', { class: 'ka-turn', id: `ka-turn-${turn.id}`, 'data-turn': turn.id }, renderQuestion(result.question, ctx), article);
}

/** Shown while the pipeline runs; it lasts as long as the real work plus one paint. */
export function renderPending(question: string, ctx: Ctx): HTMLLIElement {
  return h('li', { class: 'ka-turn ka-turn--pending' },
    renderQuestion(question, ctx),
    h('div', { class: 'ka-a ka-a--pending' },
      renderWho(ctx),
      h('p', { class: 'ka-pending' },
        h('span', {}, fill(ctx.t.processing, { n: ctx.engine.passages.length })),
        h('span', { class: 'ka-pending__dots', 'aria-hidden': 'true' }, h('span'), h('span'), h('span')),
      ),
    ),
  );
}
