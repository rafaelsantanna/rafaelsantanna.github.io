// Client behaviour for the Guarda Alta demo: sticky header, reveals, timetable filters, tabs, and the message builder.

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>('[data-ga-header]');
  const sentinel = root.querySelector<HTMLElement>('[data-ga-sentinel]');
  if (!header || !sentinel) return;
  new IntersectionObserver(([entry]) => header.classList.toggle('is-condensed', !entry.isIntersecting)).observe(sentinel);
}

function initReveals(root: HTMLElement) {
  const items = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;
  root.classList.add('is-revealing');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((item) => observer.observe(item));
}

function initSchedule(root: HTMLElement) {
  const schedule = root.querySelector<HTMLElement>('[data-ga-schedule]');
  if (!schedule) return;
  const week = schedule.querySelector<HTMLElement>('[data-ga-week]');
  const status = schedule.querySelector<HTMLElement>('[data-ga-count]');
  const cells = Array.from(schedule.querySelectorAll<HTMLElement>('[data-ga-class]'));
  const dayPicker = schedule.querySelector<HTMLElement>('[data-ga-days]');
  if (!week || !status) return;

  const value = (name: string) => schedule.querySelector<HTMLInputElement>(`[name="${name}"]:checked`)?.value || 'all';

  const apply = (animate: boolean) => {
    const mod = value('ga-mod');
    const level = value('ga-level');
    const perDay = new Map<string, number>();
    let index = 0;
    cells.forEach((cell) => {
      const match = (mod === 'all' || cell.dataset.mod === mod) && (level === 'all' || cell.dataset.level === level);
      cell.classList.toggle('is-out', !match);
      cell.toggleAttribute('inert', !match);
      cell.classList.remove('is-pop');
      if (match) {
        perDay.set(cell.dataset.day || '', (perDay.get(cell.dataset.day || '') || 0) + 1);
        cell.style.setProperty('--i', String(index++));
      }
    });
    if (animate && !prefersReducedMotion()) {
      void week.offsetWidth;
      cells.forEach((cell) => { if (!cell.classList.contains('is-out')) cell.classList.add('is-pop'); });
    }
    schedule.querySelectorAll<HTMLElement>('[data-ga-daycount]').forEach((badge) => {
      badge.textContent = String(perDay.get(badge.dataset.gaDaycount || '') || 0);
    });
    schedule.querySelectorAll<HTMLElement>('[data-ga-day]').forEach((day) => {
      day.classList.toggle('is-empty', !perDay.get(day.dataset.gaDay || ''));
    });
    const filtered = mod !== 'all' || level !== 'all';
    const template = index === 0 ? status.dataset.none : filtered ? status.dataset.some : status.dataset.all;
    status.textContent = (template || '').replace('{n}', String(index));
  };

  schedule.querySelectorAll<HTMLInputElement>('[name="ga-mod"], [name="ga-level"]').forEach((input) => {
    input.addEventListener('change', () => apply(true));
  });

  // Phones show one day at a time once the script runs; without it every day stays listed.
  if (dayPicker) {
    dayPicker.hidden = false;
    week.classList.add('is-paged');
    const today = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date().getDay() - 1] || 'seg';
    const setDay = (day: string) => { week.dataset.activeDay = day; };
    dayPicker.querySelectorAll<HTMLInputElement>('[name="ga-day"]').forEach((input) => {
      if (input.value === today) input.checked = true;
      input.addEventListener('change', () => setDay(input.value));
    });
    setDay(today);
  }

  // Links elsewhere on the page can preselect a discipline before jumping to the timetable.
  root.querySelectorAll<HTMLAnchorElement>('[data-ga-show]').forEach((link) => {
    link.addEventListener('click', () => {
      const input = schedule.querySelector<HTMLInputElement>(`[name="ga-mod"][value="${link.dataset.gaShow}"]`);
      const anyLevel = schedule.querySelector<HTMLInputElement>('[name="ga-level"][value="all"]');
      if (input) input.checked = true;
      if (anyLevel) anyLevel.checked = true;
      apply(true);
    });
  });

  apply(false);
}

function initTabs(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-ga-tabs]').forEach((group) => {
    const list = group.querySelector<HTMLElement>('[role="tablist"]');
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = tabs.map((tab) => group.querySelector<HTMLElement>(`#${tab.getAttribute('aria-controls')}`));
    if (!list) return;
    list.hidden = false;
    group.classList.add('is-tabbed');
    const select = (index: number, focus: boolean) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (panels[i]) panels[i]!.hidden = !active;
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index, false));
      tab.addEventListener('keydown', (event) => {
        const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in keys)) return;
        event.preventDefault();
        select((keys[event.key] + tabs.length) % tabs.length, true);
      });
    });
    select(0, false);
  });
}

function initBuilder(root: HTMLElement) {
  const builder = root.querySelector<HTMLElement>('[data-ga-builder]');
  if (!builder) return;
  const section = builder.closest<HTMLElement>('section');
  const status = builder.querySelector<HTMLElement>('[data-ga-message]');
  const copyButton = builder.querySelector<HTMLButtonElement>('[data-ga-copy]');
  const nameField = builder.querySelector<HTMLInputElement>('[name="ga-name"]');
  const slotField = builder.querySelector<HTMLInputElement>('[name="ga-slot"]');
  const d = builder.dataset;
  let message = '';

  const checked = (name: string) => builder.querySelector<HTMLInputElement>(`[name="${name}"]:checked`);
  const labelOf = (input: HTMLInputElement | null) => input?.dataset.say || '';

  builder.querySelector<HTMLButtonElement>('[data-ga-build]')?.addEventListener('click', () => {
    if (!status) return;
    const name = nameField?.value.trim() || '';
    const modality = checked('ga-modality');
    if (!name || !modality) {
      message = '';
      status.classList.remove('is-ready');
      status.textContent = d.empty || '';
      if (copyButton) copyButton.hidden = true;
      (name ? builder.querySelector<HTMLInputElement>('[name="ga-modality"]') : nameField)?.focus();
      return;
    }
    const slot = slotField?.value.trim();
    const parts = [
      (d.greeting || '').replace('{name}', name),
      (d.want || '').replace('{modality}', labelOf(modality)).replace('{who}', labelOf(checked('ga-age'))),
      labelOf(checked('ga-exp')),
      slot ? (d.slot || '').replace('{slot}', slot) : d.noSlot || '',
      d.closing || '',
    ];
    message = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').replace(/ \./g, '.');
    status.classList.add('is-ready');
    status.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'ga-bubble__label';
    label.textContent = d.ready || '';
    const text = document.createElement('span');
    text.className = 'ga-bubble__text';
    text.textContent = message;
    status.append(label, text);
    if (copyButton) { copyButton.hidden = false; copyButton.textContent = d.copy || ''; }
  });

  copyButton?.addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      copyButton.textContent = d.copied || '';
    } catch {
      copyButton.textContent = d.copyFailed || '';
    }
  });

  // A class in the timetable fills discipline, age group, and slot, then brings the builder into view.
  root.querySelectorAll<HTMLButtonElement>('[data-ga-class]').forEach((cell) => {
    cell.addEventListener('click', () => {
      const modality = builder.querySelector<HTMLInputElement>(`[name="ga-modality"][value="${cell.dataset.mod}"]`);
      if (modality) modality.checked = true;
      if (cell.dataset.mod === 'kids') {
        const kids = builder.querySelector<HTMLInputElement>('[name="ga-age"][value="crianca"]');
        if (kids) kids.checked = true;
      }
      if (slotField) {
        slotField.value = cell.dataset.slot || '';
        slotField.classList.remove('is-filled');
        void slotField.offsetWidth;
        slotField.classList.add('is-filled');
      }
      section?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => nameField?.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 450);
    });
  });
}

export function initGuardaAlta() {
  document.querySelectorAll<HTMLElement>('.demo--guarda').forEach((root) => {
    initHeader(root);
    initReveals(root);
    initSchedule(root);
    initTabs(root);
    initBuilder(root);
  });
}
