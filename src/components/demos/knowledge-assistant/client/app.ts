import { ask, createEngine } from '../lib/pipeline';
import { DEFAULT_SETTINGS, sanitizeSettings, type SearchSettings } from '../lib/settings';
import { fill, plural } from '../strings';
import { createComposer } from './composer';
import { createCtx, readClientData } from './context';
import { h, nextPaint, prefersReducedMotion } from './dom';
import { renderEvidence } from './evidence-view';
import { bindInteractions } from './interactions';
import { createReader } from './reader';
import { setupSettings } from './settings';
import { setupSources } from './sources';
import { createStore } from './storage';
import { setupTabs, type TabId } from './tabs';
import { toStoredTurn, type Turn } from './turn';
import { renderPending, renderTurn } from './turn-view';

const now = () => performance.now();

export function mountKnowledgeAssistant(root: HTMLElement): void {
  const data = readClientData(root);
  const engine = createEngine(data.corpus, data.lang, now);
  const ctx = createCtx(root, data, engine);
  const { t } = ctx;
  const store = createStore(data.lang);
  const docIds = data.corpus.documents.map((doc) => doc.id);

  const thread = root.querySelector<HTMLElement>('[data-ka-thread]');
  const empty = root.querySelector<HTMLElement>('[data-ka-empty]');
  const next = root.querySelector<HTMLElement>('[data-ka-next]');
  const turnList = root.querySelector<HTMLOListElement>('[data-ka-turns]');
  const evidenceView = root.querySelector<HTMLElement>('[data-ka-evidence]');
  const evidenceEmpty = root.querySelector<HTMLElement>('[data-ka-evidence-empty]');
  const status = root.querySelector<HTMLElement>('[data-ka-status]');
  const build = root.querySelector<HTMLElement>('[data-ka-build]');
  if (!thread || !empty || !turnList || !evidenceView || !evidenceEmpty || !status) return;

  let settings: SearchSettings = { ...DEFAULT_SETTINGS };
  let turns: Turn[] = [];
  let activeId: number | null = null;
  let nextId = 1;
  let busy = false;

  const reader = createReader(root, ctx);
  const sources = setupSources(root, ctx, (docs) => {
    settings = { ...settings, docs };
    persist();
    updateBadges();
    announce(sources.label());
  });
  const tuning = setupSettings(root, ctx, (values) => {
    settings = { ...settings, ...values };
    persist();
  });
  const tabs = setupTabs(root, onTabSelect);
  const composer = createComposer(root, ctx, (question) => submit(question, 'composer'), announce);

  if (build) build.textContent = fill(t.indexBuilt, { ms: ctx.ms(engine.buildMs) });

  function announce(message: string): void {
    status.textContent = '';
    window.setTimeout(() => {
      status.textContent = message;
    }, 50);
  }

  function persist(): void {
    store.save({ settings, turns: turns.map(toStoredTurn) });
  }

  function badge(id: TabId, visible: string, spoken: string): void {
    const element = root.querySelector<HTMLElement>(`[data-ka-badge="${id}"]`);
    if (!element) return;
    element.hidden = visible === '';
    element.replaceChildren(h('span', { 'aria-hidden': 'true' }, visible), h('span', { class: 'ka-sr' }, `, ${spoken}`));
  }

  function updateBadges(): void {
    const active = turns.find((turn) => turn.id === activeId);
    badge('chat', turns.length ? String(turns.length) : '', plural(t.badgeTurns, turns.length));
    const hits = active?.result.hits.length ?? 0;
    badge('evidence', hits ? String(hits) : '', plural(t.passagesCount, hits));
    const selected = sources.count();
    badge('sources',
      selected ? `${selected}/${sources.total}` : String(sources.total),
      selected ? fill(t.badgeDocsSome, { n: selected, total: sources.total }) : plural(t.docsCount, sources.total));
  }

  // After the first question, the suggestions not asked yet stay one tap away below the conversation.
  function updateNext(): void {
    if (!next) return;
    const asked = new Set(turns.map((turn) => turn.result.question));
    let remaining = 0;
    for (const button of next.querySelectorAll<HTMLElement>('[data-ka-suggestion]')) {
      const used = asked.has(button.dataset.kaSuggestion ?? '');
      const item = button.closest('li');
      if (item) item.hidden = used;
      if (!used) remaining += 1;
    }
    next.hidden = turns.length === 0 || remaining === 0;
  }

  function setActive(id: number | null): void {
    activeId = id;
    const turn = turns.find((item) => item.id === id) ?? null;
    for (const item of turnList.querySelectorAll<HTMLElement>('[data-turn]')) {
      const isActive = Number(item.dataset.turn) === id;
      item.classList.toggle('is-active', isActive);
      item.querySelector('[data-show-evidence]')?.setAttribute('aria-pressed', String(isActive));
    }
    evidenceView.replaceChildren(...(turn ? renderEvidence(turn, ctx) : []));
    evidenceView.hidden = !turn;
    evidenceEmpty.hidden = Boolean(turn);
    updateBadges();
  }

  function scrollIntoView(element: Element, block: ScrollLogicalPosition = 'start'): void {
    element.scrollIntoView({ block, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  // Each tab starts right below the sticky tab bar; the conversation reopens on its latest turn.
  function onTabSelect(id: TabId): void {
    const last = turnList.lastElementChild;
    if (id === 'chat' && last) {
      last.scrollIntoView({ block: 'start' });
      return;
    }
    const header = root.querySelector('.ka-top');
    const top = header ? header.getBoundingClientRect().bottom + window.scrollY : 0;
    if (window.scrollY > top) window.scrollTo({ top });
  }

  function appendTurn(question: string, searchSettings: SearchSettings, stored?: Pick<Turn, 'feedback' | 'forwarded'>): Turn {
    const result = ask(engine, question, searchSettings, now);
    const turn: Turn = { id: nextId, result, feedback: stored?.feedback ?? null, forwarded: stored?.forwarded ?? false };
    nextId += 1;
    turns.push(turn);
    return turn;
  }

  function announceResult(turn: Turn): void {
    const { result } = turn;
    if (result.outcome === 'answer') announce(plural(t.statusAnswer, result.answer?.parts.length ?? 0, { value: ctx.decimal(result.confidence.value) }));
    else if (result.outcome === 'handoff') announce(fill(t.statusHandoff, { team: engine.corpus.handoffTeam }));
    else announce(t.statusEmpty);
  }

  async function submit(raw: string, origin: 'composer' | 'other'): Promise<void> {
    const question = raw.trim();
    if (busy || !question) return;
    busy = true;
    const keepTyping = origin === 'composer' && !tabs.isTabMode();
    composer.setBusy(true);
    tuning.close();
    empty.hidden = true;
    if (tabs.isTabMode()) tabs.select('chat');
    const pending = renderPending(question, ctx);
    turnList.append(pending);
    scrollIntoView(pending);
    announce(t.statusProcessing);
    await nextPaint();

    const turn = appendTurn(question, settings);
    const view = renderTurn(turn, ctx);
    pending.replaceWith(view);
    setActive(turn.id);
    updateNext();
    persist();
    composer.setBusy(false);
    busy = false;
    announceResult(turn);
    if (keepTyping) composer.focus();
    else view.querySelector<HTMLElement>('.ka-a')?.focus({ preventScroll: true });
    scrollIntoView(view);
  }

  function reset(): void {
    store.clear();
    turns = [];
    nextId = 1;
    settings = { ...DEFAULT_SETTINGS };
    turnList.replaceChildren();
    empty.hidden = false;
    updateNext();
    tuning.render(settings);
    tuning.close();
    sources.set(null);
    composer.clear();
    setActive(null);
    tabs.select('chat');
    announce(t.resetDone);
  }

  function restore(): void {
    const saved = store.load();
    if (!saved) return;
    settings = sanitizeSettings(saved.settings, docIds);
    tuning.render(settings);
    sources.set(settings.docs);
    for (const stored of saved.turns) {
      const turn = appendTurn(stored.question, sanitizeSettings(stored, docIds), stored);
      turnList.append(renderTurn(turn, ctx));
    }
    if (turns.length === 0) return;
    empty.hidden = true;
    setActive(turns[turns.length - 1].id);
    updateNext();
    // Only the conversation scrolls to its latest turn; the page stays at the top, so the
    // disclosure bar and the header are the first thing a returning visitor sees.
    const last = turnList.lastElementChild;
    if (last instanceof HTMLElement && thread.scrollHeight > thread.clientHeight) {
      thread.scrollTop = last.offsetTop - parseFloat(getComputedStyle(last).scrollMarginTop);
    }
  }

  bindInteractions(root, ctx, {
    turnList,
    evidenceView,
    reader,
    tabs,
    findTurn: (id) => turns.find((turn) => turn.id === id),
    activeTurn: () => turns.find((turn) => turn.id === activeId),
    setActive: (id) => {
      if (id !== activeId) setActive(id);
    },
    retryAll: (question) => {
      settings = { ...settings, docs: null };
      sources.set(null);
      persist();
      void submit(question, 'other');
    },
    suggest: (question) => void submit(question, 'other'),
    changed: () => persist(),
    announce,
  });
  root.querySelector('[data-ka-reset]')?.addEventListener('click', reset);

  tuning.render(settings);
  sources.set(null);
  restore();
  updateBadges();
}
