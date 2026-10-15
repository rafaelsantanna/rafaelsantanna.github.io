import type { Ctx } from './context';
import { h, prefersReducedMotion } from './dom';
import { handoffDoneText } from './handoff-view';
import type { Reader } from './reader';
import type { Tabs } from './tabs';
import { queryStems, type Turn } from './turn';
import { feedbackNote } from './turn-view';

export interface InteractionDeps {
  turnList: HTMLElement;
  evidenceView: HTMLElement;
  reader: Reader;
  tabs: Tabs;
  findTurn: (id: number) => Turn | undefined;
  activeTurn: () => Turn | undefined;
  setActive: (id: number) => void;
  retryAll: (question: string) => void;
  suggest: (question: string) => void;
  changed: () => void;
  announce: (message: string) => void;
}

const FLASH_MS = 1600;

/** Delegated handlers for suggestions, citations, evidence, feedback, handoff and the reader. */
export function bindInteractions(root: HTMLElement, ctx: Ctx, deps: InteractionDeps): void {
  const { t, engine } = ctx;
  const { turnList, evidenceView } = deps;
  let flashTimer = 0;

  const behavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');
  const card = (passage: number) => evidenceView.querySelector<HTMLElement>(`.ka-ev[data-passage="${passage}"]`);
  const turnOf = (element: Element) => {
    const item = element.closest<HTMLElement>('[data-turn]');
    return item ? { item, turn: deps.findTurn(Number(item.dataset.turn)) } : null;
  };

  function link(turn: Turn, item: HTMLElement, passage: number, on: boolean): void {
    if (on) deps.setActive(turn.id);
    item.querySelectorAll(`.ka-cite[data-passage="${passage}"]`).forEach((cite) => cite.classList.toggle('is-linked', on));
    const target = card(passage);
    target?.classList.toggle('is-linked', on);
    if (on && target && !deps.tabs.isTabMode()) target.scrollIntoView({ block: 'nearest', behavior: behavior() });
  }

  function focusEvidence(turn: Turn, passage: number | null): void {
    deps.setActive(turn.id);
    if (deps.tabs.isTabMode()) deps.tabs.select('evidence');
    const target = passage === null ? null : card(passage);
    const focusable = target?.querySelector<HTMLElement>('.ka-ev__doc') ?? evidenceView.querySelector<HTMLElement>('[data-evidence-focus]');
    focusable?.focus({ preventScroll: true });
    (target ?? evidenceView.querySelector('.ka-ev-head'))?.scrollIntoView({ block: target ? 'nearest' : 'start', behavior: behavior() });
    if (!target) return;
    window.clearTimeout(flashTimer);
    evidenceView.querySelectorAll('.is-flash').forEach((element) => element.classList.remove('is-flash'));
    target.classList.add('is-flash');
    flashTimer = window.setTimeout(() => target.classList.remove('is-flash'), FLASH_MS);
  }

  function openPassage(turn: Turn, button: HTMLElement): void {
    const passage = Number(button.dataset.openPassage);
    const citation = Number(button.dataset.citation) || null;
    deps.reader.open(engine.passages[passage].docId, { passage, stems: queryStems(turn.result), citation });
  }

  function setFeedback(turn: Turn, item: HTMLElement, kind: 'up' | 'down'): void {
    turn.feedback = turn.feedback === kind ? null : kind;
    item.querySelectorAll<HTMLElement>('[data-feedback]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.feedback === turn.feedback));
    });
    const note = feedbackNote(turn, ctx);
    const output = item.querySelector('[data-feedback-note]');
    if (output) output.textContent = note;
    deps.changed();
    if (note) deps.announce(note);
  }

  function forward(turn: Turn, button: HTMLElement, item: HTMLElement): void {
    if (turn.forwarded) return;
    turn.forwarded = true;
    button.setAttribute('aria-disabled', 'true');
    button.replaceChildren(ctx.icon('check'), h('span', {}, t.handoffSent));
    const note = item.querySelector('[data-handoff-note]');
    if (note) {
      note.textContent = handoffDoneText(ctx);
      note.classList.add('is-done');
    }
    deps.changed();
    deps.announce(handoffDoneText(ctx));
  }

  root.querySelector('[data-ka-thread]')?.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-ka-suggestion]');
    if (button?.dataset.kaSuggestion) deps.suggest(button.dataset.kaSuggestion);
  });

  root.querySelectorAll<HTMLElement>('[data-ka-read]').forEach((button) => {
    button.addEventListener('click', () => deps.reader.open(button.dataset.kaRead ?? ''));
  });

  turnList.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('button');
    const owner = button ? turnOf(button) : null;
    if (!button || !owner?.turn) return;
    const { item, turn } = owner;
    if (button.matches('[data-cite]')) focusEvidence(turn, Number(button.dataset.passage));
    else if (button.matches('[data-open-passage]')) openPassage(turn, button);
    else if (button.matches('[data-feedback]')) setFeedback(turn, item, button.dataset.feedback === 'up' ? 'up' : 'down');
    else if (button.matches('[data-show-evidence]')) focusEvidence(turn, null);
    else if (button.matches('[data-handoff]')) forward(turn, button, item);
    else if (button.matches('[data-retry-all]')) deps.retryAll(turn.result.question);
  });

  const onCite = (on: boolean) => (event: Event) => {
    const cite = (event.target as Element).closest<HTMLElement>('[data-passage]');
    if (!cite || !cite.matches('.ka-cite, .ka-source')) return;
    const owner = turnOf(cite);
    if (owner?.turn) link(owner.turn, owner.item, Number(cite.dataset.passage), on);
  };
  turnList.addEventListener('pointerover', onCite(true));
  turnList.addEventListener('pointerout', onCite(false));
  turnList.addEventListener('focusin', onCite(true));
  turnList.addEventListener('focusout', onCite(false));

  evidenceView.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-open-passage]');
    const turn = deps.activeTurn();
    if (button && turn) openPassage(turn, button);
  });

  const onCard = (on: boolean) => (event: Event) => {
    const target = (event.target as Element).closest<HTMLElement>('.ka-ev');
    const turn = deps.activeTurn();
    if (!target || !turn) return;
    turnList.querySelectorAll(`[data-turn="${turn.id}"] .ka-cite[data-passage="${target.dataset.passage}"]`)
      .forEach((cite) => cite.classList.toggle('is-linked', on));
  };
  evidenceView.addEventListener('pointerover', onCard(true));
  evidenceView.addEventListener('pointerout', onCard(false));
}
