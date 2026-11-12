// Client behaviour for the Estudio Compasso demo: sticky header, reveals, quiz, timetable tabs, and message builder.

type Family = 'ballet' | 'jazz' | 'hiphop' | 'salao' | 'maduros';

interface QuizResult { name: string; why: string; days: string; chip: string; src: string; w: number; h: number; alt: string }
interface MessageCopy { hello: string; age: string; exp: string; period: string; join: string; empty: string }

const FAMILIES: Family[] = ['ballet', 'jazz', 'hiphop', 'salao', 'maduros'];

// Each answer adds points to a family; partner dancing is then refined by energy and goal.
const SCORES: Record<string, Partial<Record<Family, number>>> = {
  calma: { ballet: 2, maduros: 1, salao: 1 },
  alegria: { jazz: 2, salao: 2, maduros: 1 },
  intensa: { hiphop: 3, jazz: 1, salao: 1 },
  solo: { ballet: 1, jazz: 1, hiphop: 1, maduros: 1 },
  par: { salao: 4 },
  turma: { jazz: 1, maduros: 1 },
  tecnica: { ballet: 2, jazz: 1, hiphop: 1 },
  social: { salao: 2, maduros: 2, jazz: 1 },
  saude: { hiphop: 2, jazz: 1, maduros: 2 },
};

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pickResult(answers: string[]): string {
  const totals = { ballet: 0, jazz: 0, hiphop: 0, salao: 0, maduros: 0 };
  answers.forEach((answer) => {
    Object.entries(SCORES[answer] ?? {}).forEach(([family, points]) => { totals[family as Family] += points ?? 0; });
  });
  const best = FAMILIES.reduce((top, family) => (totals[family] > totals[top] ? family : top), FAMILIES[0]);
  if (best !== 'salao') return best;
  const [energy, , goal] = answers;
  if (energy === 'calma') return 'bolero';
  if (energy === 'intensa') return 'zouk';
  return goal === 'social' ? 'forro' : 'gafieira';
}

function swap(from: HTMLElement, to: HTMLElement, direction: number, done: () => void) {
  const finish = () => { from.hidden = true; to.hidden = false; done(); };
  if (reduceMotion() || typeof from.animate !== 'function') { finish(); return; }
  const out = from.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-28 * direction}px)` }],
    { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' },
  );
  out.onfinish = () => {
    finish();
    to.animate(
      [{ opacity: 0, transform: `translateX(${36 * direction}px) rotate(${direction}deg)` }, { opacity: 1, transform: 'none' }],
      { duration: 460, easing: EASE_OUT },
    );
  };
}

function initNav(root: HTMLElement) {
  const nav = root.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  let queued = false;
  const update = () => { nav.classList.toggle('is-condensed', window.scrollY > 72); queued = false; };
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function initReveal(root: HTMLElement) {
  if (reduceMotion() || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
  root.classList.add('is-animated');
  root.querySelectorAll('.co-reveal').forEach((item) => observer.observe(item));
}

function initQuiz(root: HTMLElement) {
  const quiz = root.querySelector<HTMLElement>('[data-quiz]');
  const result = quiz?.querySelector<HTMLElement>('[data-quiz-result]');
  if (!quiz || !result) return;
  const steps = [...quiz.querySelectorAll<HTMLElement>('[data-quiz-step]')];
  const progress = quiz.querySelector<HTMLElement>('[data-quiz-progress]');
  const bars = [...quiz.querySelectorAll<HTMLElement>('[data-quiz-bar]')];
  const results = JSON.parse(quiz.dataset.results || '{}') as Record<string, QuizResult>;
  const answers: string[] = [];
  let busy = false;

  const setProgress = (index: number) => {
    const done = index >= steps.length;
    if (progress) progress.textContent = done ? quiz.dataset.done || '' : (quiz.dataset.progress || '').replace('{n}', String(index + 1));
    bars.forEach((bar, i) => bar.classList.toggle('is-on', done || i <= index));
  };

  const go = (from: HTMLElement, to: HTMLElement, direction: number, index: number) => {
    busy = true;
    swap(from, to, direction, () => {
      setProgress(index);
      to.querySelector<HTMLElement>('[data-quiz-focus]')?.focus({ preventScroll: true });
      busy = false;
    });
  };

  const fillResult = () => {
    const key = pickResult(answers);
    const data = results[key];
    if (!data) return;
    const image = result.querySelector<HTMLImageElement>('img');
    if (image) {
      image.src = data.src;
      image.alt = data.alt;
      image.width = data.w;
      image.height = data.h;
      image.dataset.key = key;
    }
    const fill = (selector: string, text: string) => {
      const target = result.querySelector<HTMLElement>(selector);
      if (target) target.textContent = text;
    };
    fill('[data-result-name]', data.name);
    fill('[data-result-why]', data.why);
    fill('[data-result-days]', data.days);
    const cta = result.querySelector<HTMLElement>('[data-prefill-ritmo]');
    if (cta) cta.dataset.prefillRitmo = data.chip;
  };

  steps.forEach((step, index) => {
    step.hidden = index !== 0;
    const options = [...step.querySelectorAll<HTMLButtonElement>('[data-value]')];
    options.forEach((option) => option.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      answers[index] = option.dataset.value || '';
      options.forEach((item) => item.setAttribute('aria-pressed', String(item === option)));
      // A short beat lets the chosen option light up before the next question slides in.
      window.setTimeout(() => {
        if (index < steps.length - 1) {
          go(step, steps[index + 1], 1, index + 1);
          return;
        }
        fillResult();
        go(step, result, 1, steps.length);
      }, reduceMotion() ? 0 : 240);
    }));
    step.querySelector<HTMLButtonElement>('[data-quiz-back]')?.addEventListener('click', () => {
      if (!busy && index > 0) go(step, steps[index - 1], -1, index - 1);
    });
  });

  result.querySelector<HTMLButtonElement>('[data-quiz-restart]')?.addEventListener('click', () => {
    if (busy) return;
    answers.length = 0;
    quiz.querySelectorAll('[data-value]').forEach((option) => option.setAttribute('aria-pressed', 'false'));
    go(result, steps[0], -1, 0);
  });

  quiz.dataset.ready = 'true';
  setProgress(0);
}

function initTabs(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>('[data-tabs]');
  if (!list) return;
  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = tabs.map((tab) => root.querySelector<HTMLElement>(`#${tab.getAttribute('aria-controls')}`));

  const select = (index: number, focus = false, animate = true) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = panels[i];
      if (panel) panel.hidden = !active;
    });
    if (focus) tabs[index].focus();
    const panel = panels[index];
    if (panel && animate && !reduceMotion() && typeof panel.animate === 'function') {
      panel.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE_OUT });
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });

  // Open on today's classes; Sunday has none, so it falls back to Monday.
  const today = (new Date().getDay() + 6) % 7;
  tabs[today]?.querySelector('[data-today]')?.removeAttribute('hidden');
  list.dataset.ready = 'true';
  root.querySelector<HTMLElement>('[data-schedule]')?.setAttribute('data-ready', 'true');
  select(today < tabs.length ? today : 0, false, false);
}

function initBuilder(root: HTMLElement) {
  const builder = root.querySelector<HTMLElement>('[data-builder]');
  const output = builder?.querySelector<HTMLElement>('[role="status"]');
  if (!builder || !output) return;
  const copy = JSON.parse(builder.dataset.msg || '{}') as MessageCopy;
  const picked = (name: string) => builder.querySelector<HTMLInputElement>(`[name="${name}"]:checked`)?.value.toLowerCase();

  builder.querySelector<HTMLButtonElement>('[data-build]')?.addEventListener('click', () => {
    const name = builder.querySelector<HTMLInputElement>('[name="co-nome"]')?.value.trim() || '';
    const styles = [...builder.querySelectorAll<HTMLInputElement>('[name="co-ritmo"]:checked')].map((input) => input.value.toLowerCase());
    if (!name || !styles.length) {
      output.textContent = copy.empty;
      output.dataset.state = 'error';
      return;
    }
    const list = styles.length > 1 ? `${styles.slice(0, -1).join(', ')}${copy.join}${styles[styles.length - 1]}` : styles[0];
    const parts = [copy.hello.replace('{ritmos}', () => list).replace('{name}', () => name)];
    const extras: [string, string | undefined][] = [[copy.age, picked('co-idade')], [copy.exp, picked('co-exp')], [copy.period, picked('co-periodo')]];
    extras.forEach(([template, value]) => { if (value) parts.push(template.replace('{v}', () => value)); });
    output.textContent = parts.join(' ');
    output.dataset.state = 'ready';
  });

  // Links from the style cards and the quiz tick the matching style before jumping to the builder.
  root.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>('[data-prefill-ritmo]');
    if (!link) return;
    const value = link.dataset.prefillRitmo || '';
    const box = [...builder.querySelectorAll<HTMLInputElement>('[name="co-ritmo"]')].find((input) => input.value === value);
    if (box) box.checked = true;
    window.setTimeout(() => builder.querySelector<HTMLInputElement>('[name="co-nome"]')?.focus({ preventScroll: true }), 0);
  });
}

export function initCompasso() {
  const root = document.querySelector<HTMLElement>('.demo--compasso');
  if (!root) return;
  initNav(root);
  initReveal(root);
  initQuiz(root);
  initTabs(root);
  initBuilder(root);
}
