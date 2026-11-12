// Client behaviour for the Clima Certa demo: header state, reveals, hero thermometer, BTU table highlight, and the local message builder.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initClima(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>('.cc-nav');
  if (header) {
    const onScroll = () => header.classList.toggle('is-condensed', window.scrollY > 72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Reveals are progressive enhancement: content stays visible unless JS runs and motion is allowed.
  const reveals = root.querySelectorAll<HTMLElement>('.cc-reveal');
  if (!reduceMotion && 'IntersectionObserver' in window && reveals.length) {
    root.classList.add('cc-armed');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((element) => observer.observe(element));
  }

  initThermometer(root);
  initSizing(root);
  initPlanner(root);
}

function initThermometer(root: HTMLElement) {
  const thermo = root.querySelector<HTMLElement>('[data-thermo]');
  const value = thermo?.querySelector<HTMLElement>('[data-thermo-value]');
  if (!thermo || !value || reduceMotion) return;
  const from = 38;
  const to = 23;
  const duration = 2400;
  thermo.dataset.state = 'hot';
  value.textContent = String(from);
  let start = 0;
  const tick = (now: number) => {
    if (!start) start = now;
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    value.textContent = String(Math.round(from - (from - to) * eased));
    if (progress > 0.45) thermo.dataset.state = 'cool';
    if (progress < 1) requestAnimationFrame(tick);
  };
  window.setTimeout(() => requestAnimationFrame(tick), 700);
}

function initSizing(root: HTMLElement) {
  const slider = root.querySelector<HTMLInputElement>('[data-sizing-range]');
  const output = root.querySelector<HTMLOutputElement>('[data-sizing-output]');
  const rows = root.querySelectorAll<HTMLTableRowElement>('[data-sizing-row]');
  const room = root.querySelector<HTMLElement>('[data-sizing-room]');
  const areaLabel = root.querySelector<HTMLElement>('[data-sizing-area]');
  if (!slider || !rows.length) return;
  const update = () => {
    const index = Number(slider.value);
    rows.forEach((row, rowIndex) => row.toggleAttribute('data-active', rowIndex === index));
    const area = rows[index]?.querySelector('th')?.textContent || '';
    const unit = rows[index]?.querySelector('td')?.textContent || '';
    if (output) output.textContent = `${area}: ${unit}`;
    slider.setAttribute('aria-valuetext', `${area}, ${unit}`);
    room?.style.setProperty('--room', String(0.42 + index * 0.145));
    if (areaLabel) areaLabel.textContent = area;
  };
  slider.addEventListener('input', update);
  update();
}

function initPlanner(root: HTMLElement) {
  const planner = root.querySelector<HTMLElement>('[data-demo-planner]');
  if (!planner) return;
  const status = planner.querySelector<HTMLElement>('[role="status"]');
  const note = planner.querySelector<HTMLTextAreaElement>('[name="note"]');
  const area = planner.querySelector<HTMLInputElement>('[name="area"]');
  const labels = planner.dataset;

  planner.querySelector<HTMLButtonElement>('[data-demo-update]')?.addEventListener('click', () => {
    if (!status) return;
    const kind = planner.querySelector<HTMLInputElement>('[name="kind"]:checked')?.value || '';
    const place = planner.querySelector<HTMLInputElement>('[name="place"]:checked')?.value || '';
    const where = area?.value.trim() || '';
    const observed = note?.value.trim() || '';
    if (!kind || !observed) {
      status.dataset.state = 'empty';
      status.textContent = labels.labelEmpty || '';
      return;
    }
    const placeLine = [place, where && `${labels.labelArea} ${where}`].filter(Boolean).join(', ');
    const lines = [
      labels.labelGreeting,
      `${labels.labelKind}: ${kind}`,
      placeLine && `${labels.labelPlace}: ${placeLine}`,
      `${labels.labelNote}: ${observed}`,
    ].filter(Boolean);
    status.dataset.state = 'ready';
    status.textContent = lines.join('\n');
  });

  // Service and symptom links preselect the matching service and seed the note.
  root.querySelectorAll<HTMLAnchorElement>('[data-prefill-kind]').forEach((link) => {
    link.addEventListener('click', () => {
      const kind = planner.querySelector<HTMLInputElement>(`[name="kind"][value="${link.dataset.prefillKind}"]`);
      if (kind) kind.checked = true;
      if (note && link.dataset.prefillNote && !note.value.trim()) note.value = `${link.dataset.prefillNote}. `;
      window.setTimeout(() => note?.focus({ preventScroll: true }), 0);
    });
  });
}
