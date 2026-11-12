// Page behaviour for the Casa Clave demo: header, reveals, format tabs, course finder, and message builder.
import { suggestCourse, type AgeId, type GoalId } from './copy';

export function initHeader(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>('.clave-header');
  const sentinel = root.querySelector<HTMLElement>('[data-header-sentinel]');
  if (!header || !sentinel || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => header.classList.toggle('is-condensed', !entry.isIntersecting)).observe(sentinel);
}

export function initReveals(root: HTMLElement) {
  const items = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('has-reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((item) => observer.observe(item));
}

export function initTabs(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[role="tablist"]').forEach((list) => {
    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const select = (next: HTMLButtonElement, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab === next;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = root.querySelector<HTMLElement>(`#${tab.getAttribute('aria-controls')}`);
        if (panel) panel.hidden = !active;
      });
      if (focus) next.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (event) => {
        const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in moves)) return;
        event.preventDefault();
        select(tabs[(moves[event.key] + tabs.length) % tabs.length], true);
      });
    });
    select(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
  });
}

function prefillBuilder(root: HTMLElement, course?: string, age?: string) {
  const builder = root.querySelector<HTMLElement>('[data-builder]');
  if (!builder) return;
  if (course) {
    const chip = builder.querySelector<HTMLInputElement>(`[name="clave-course"][value="${course}"]`);
    if (chip) chip.checked = true;
  }
  if (age) {
    const select = builder.querySelector<HTMLSelectElement>('[name="clave-age"]');
    if (select) select.value = age;
  }
}

export function initFinder(root: HTMLElement) {
  const finder = root.querySelector<HTMLElement>('[data-finder]');
  if (!finder) return;
  const result = finder.querySelector<HTMLElement>('[data-finder-result]');
  const useButton = finder.querySelector<HTMLButtonElement>('[data-finder-use]');
  const reasons = JSON.parse(finder.dataset.reasons || '{}') as Record<string, string>;
  const courseNames = JSON.parse(finder.dataset.courses || '{}') as Record<string, string>;
  const online = JSON.parse(finder.dataset.online || '{}') as Record<string, boolean>;
  let current: { course: string; age: string } | null = null;

  const update = () => {
    const age = finder.querySelector<HTMLInputElement>('[name="clave-finder-age"]:checked')?.value as AgeId | undefined;
    const goal = finder.querySelector<HTMLInputElement>('[name="clave-finder-goal"]:checked')?.value as GoalId | undefined;
    if (!result) return;
    if (!age || (!goal && age !== 'kids')) {
      result.dataset.state = 'idle';
      result.querySelector('[data-finder-name]')!.textContent = '';
      result.querySelector('[data-finder-reason]')!.textContent = finder.dataset.idle || '';
      result.querySelector('[data-finder-meta]')!.textContent = '';
      if (useButton) useButton.hidden = true;
      current = null;
      return;
    }
    const course = suggestCourse(age, goal || 'sing-along');
    current = { course, age };
    result.dataset.state = 'ready';
    result.querySelector('[data-finder-name]')!.textContent = courseNames[course];
    result.querySelector('[data-finder-reason]')!.textContent = reasons[course];
    const price = course === 'musicalizacao' ? finder.dataset.priceTurma : finder.dataset.priceIndividual;
    result.querySelector('[data-finder-meta]')!.textContent = `${price}${online[course] ? `. ${finder.dataset.onlineLine}` : '.'}`;
    if (useButton) useButton.hidden = false;
  };

  finder.addEventListener('change', update);
  useButton?.addEventListener('click', () => {
    if (!current) return;
    prefillBuilder(root, current.course, current.age);
    const target = root.querySelector<HTMLElement>('#clave-contato');
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    window.setTimeout(() => root.querySelector<HTMLInputElement>('[name="clave-name"]')?.focus({ preventScroll: true }), 450);
  });
  update();
}

export function initPrefillLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>('[data-prefill-course]').forEach((link) => {
    link.addEventListener('click', () => prefillBuilder(root, link.dataset.prefillCourse));
  });
}

export function initBuilder(root: HTMLElement) {
  const builder = root.querySelector<HTMLElement>('[data-builder]');
  if (!builder) return;
  const status = builder.querySelector<HTMLElement>('[data-builder-status]');
  const copyButton = builder.querySelector<HTMLButtonElement>('[data-builder-copy]');
  const text = JSON.parse(builder.dataset.msg || '{}') as Record<string, string> & { periodWords: Record<string, string> };
  const ageLabels = JSON.parse(builder.dataset.ages || '{}') as Record<string, string>;
  let message = '';

  builder.querySelector<HTMLButtonElement>('[data-builder-build]')?.addEventListener('click', () => {
    if (!status) return;
    const name = builder.querySelector<HTMLInputElement>('[name="clave-name"]')?.value.trim() || '';
    const course = builder.querySelector<HTMLInputElement>('[name="clave-course"]:checked')?.dataset.label?.toLowerCase() || '';
    if (!name || !course) {
      message = '';
      status.dataset.state = 'error';
      status.textContent = text.empty;
      if (copyButton) copyButton.hidden = true;
      if (!name) builder.querySelector<HTMLInputElement>('[name="clave-name"]')?.focus();
      return;
    }
    const age = builder.querySelector<HTMLSelectElement>('[name="clave-age"]')?.value || '';
    const instrument = builder.querySelector<HTMLInputElement>('[name="clave-instrument"]:checked')?.value;
    const period = builder.querySelector<HTMLInputElement>('[name="clave-period"]:checked')?.value;
    const lines = [
      text.hello.replace('{name}', name),
      `${text.want.replace('{course}', course)}${age ? text.forAge.replace('{age}', ageLabels[age] || '') : ''}.`,
    ];
    if (instrument) lines.push(instrument === 'yes' ? text.instrumentYes : text.instrumentNo);
    if (period) lines.push(text.period.replace('{period}', text.periodWords[period] || ''));
    message = lines.join(' ');
    const prefix = document.createElement('span');
    prefix.className = 'clave-bubble__label';
    prefix.textContent = text.ready;
    status.dataset.state = 'ready';
    status.replaceChildren(prefix, document.createTextNode(message));
    if (copyButton) copyButton.hidden = !navigator.clipboard;
  });

  copyButton?.addEventListener('click', async () => {
    if (!message || !status) return;
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = builder.dataset.copied || '';
    } catch {
      copyButton.hidden = true;
    }
  });
}
