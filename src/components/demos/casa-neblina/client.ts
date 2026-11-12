// Client behaviour for the Casa Neblina demo. Everything runs locally; nothing is sent anywhere.

type SuiteRule = { id: string; name: string; rate: number; max: number; pets: boolean };
type PlannerData = { msg: Record<string, any>; suites: SuiteRule[]; copied: string };

const DAY_MS = 86_400_000;
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
const toISO = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parseISO = (value: string) => (value ? new Date(`${value}T00:00:00`) : null);

function initNav(root: HTMLElement) {
  const nav = root.querySelector<HTMLElement>('[data-nb-nav]');
  if (!nav) return;
  let ticking = false;
  const update = () => {
    nav.classList.toggle('is-condensed', nav.getBoundingClientRect().top <= 0 && window.scrollY > 80);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

function initReveal(root: HTMLElement) {
  const items = root.querySelectorAll<HTMLElement>('[data-nb-reveal]');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

// Arrow keys move between sibling buttons and activate the one that receives focus.
function arrowKeys(buttons: HTMLButtonElement[], activate: (index: number) => void) {
  buttons.forEach((button, index) => {
    button.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = (index + step + buttons.length) % buttons.length;
      buttons[next].focus();
      activate(next);
    });
  });
}

function initDay(root: HTMLElement) {
  const day = root.querySelector<HTMLElement>('[data-nb-day]');
  if (!day) return;
  const buttons = [...day.querySelectorAll<HTMLButtonElement>('.nb-day__list button')];
  const photos = [...day.querySelectorAll<HTMLImageElement>('.nb-day__photo')];
  const mist = day.querySelector<HTMLElement>('[data-nb-day-mist]');
  const sun = day.querySelector<SVGGElement>('[data-nb-day-sun]');
  const fields = {
    time: day.querySelector<HTMLElement>('[data-nb-day-time]'),
    title: day.querySelector<HTMLElement>('[data-nb-day-title]'),
    text: day.querySelector<HTMLElement>('[data-nb-day-text]'),
  };

  const select = (index: number) => {
    const button = buttons[index];
    if (!button) return;
    buttons.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
    photos.forEach((photo) => {
      const active = photo.dataset.photo === button.dataset.photo;
      photo.classList.toggle('is-active', active);
      if (active) photo.removeAttribute('aria-hidden'); else photo.setAttribute('aria-hidden', 'true');
      if (active) photo.style.objectPosition = button.dataset.position || '';
    });
    mist?.style.setProperty('--mist', button.dataset.mist || '0');
    day.classList.toggle('is-night', index === buttons.length - 1);
    if (fields.time) fields.time.textContent = button.querySelector('time')?.textContent || '';
    if (fields.title) fields.title.textContent = button.dataset.title || '';
    if (fields.text) fields.text.textContent = button.dataset.text || '';
    if (sun) {
      // Quadratic arc from (50,110) through control (300,-40) to (550,110); x is linear in t, so each stop sits above its button.
      const k = index / Math.max(1, buttons.length - 1);
      const y = (1 - k) ** 2 * 110 + 2 * (1 - k) * k * -40 + k ** 2 * 110;
      sun.style.transform = `translate(${50 + 500 * k}px, ${y}px)`;
    }
  };

  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  arrowKeys(buttons, select);
  select(0);
}

function initGallery(root: HTMLElement) {
  const gallery = root.querySelector<HTMLElement>('[data-nb-gallery]');
  if (!gallery) return;
  const slides = [...gallery.querySelectorAll<HTMLElement>('.nb-gallery__slide')];
  const thumbs = [...gallery.querySelectorAll<HTMLButtonElement>('[data-nb-thumb]')];
  const count = gallery.querySelector<HTMLElement>('[data-nb-count]');
  let current = 0;

  const show = (index: number) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      if (i === current) slide.removeAttribute('aria-hidden'); else slide.setAttribute('aria-hidden', 'true');
    });
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === current)));
    if (count) count.textContent = String(current + 1).padStart(2, '0');
    thumbs[current]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => show(index)));
  gallery.querySelectorAll<HTMLButtonElement>('[data-nb-step]').forEach((button) => {
    button.addEventListener('click', () => show(current + Number(button.dataset.nbStep)));
  });
  gallery.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
    if (thumbs.includes(document.activeElement as HTMLButtonElement)) thumbs[current].focus();
  });
}

function initSeasons(root: HTMLElement) {
  const group = root.querySelector<HTMLElement>('[data-nb-season]');
  const places = root.querySelector<HTMLElement>('[data-nb-places]');
  if (!group || !places) return;
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('button')];
  const select = (index: number) => {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    places.dataset.season = buttons[index].dataset.season || '';
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  arrowKeys(buttons, select);
}

function initPlanner(root: HTMLElement) {
  const planner = root.querySelector<HTMLElement>('[data-demo-planner]');
  if (!planner) return;
  const data = JSON.parse(planner.dataset.nbPlanner || '{}') as PlannerData;
  const { msg } = data;
  const lang = document.documentElement.lang || 'pt-BR';
  const isPt = lang.startsWith('pt');
  const checkin = planner.querySelector<HTMLInputElement>('[name="checkin"]')!;
  const checkout = planner.querySelector<HTMLInputElement>('[name="checkout"]')!;
  const guests = planner.querySelector<HTMLInputElement>('[name="guests"]')!;
  const name = planner.querySelector<HTMLInputElement>('[name="name"]')!;
  const status = planner.querySelector<HTMLElement>('[data-nb-status]')!;
  const copy = planner.querySelector<HTMLButtonElement>('[data-nb-copy]')!;
  const copyLabel = copy.textContent || '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkin.min = toISO(today);
  checkout.min = toISO(new Date(today.getTime() + DAY_MS));
  let message = '';

  checkin.addEventListener('change', () => {
    const start = parseISO(checkin.value);
    if (!start) return;
    const next = new Date(start.getTime() + DAY_MS);
    checkout.min = toISO(next);
    const end = parseISO(checkout.value);
    if (!end || end <= start) checkout.value = toISO(new Date(start.getTime() + 2 * DAY_MS));
  });

  planner.querySelectorAll<HTMLButtonElement>('[data-nb-guests]').forEach((button) => {
    button.addEventListener('click', () => {
      guests.value = String(Math.min(4, Math.max(1, (Number(guests.value) || 2) + Number(button.dataset.nbGuests))));
    });
  });

  root.querySelectorAll<HTMLAnchorElement>('[data-nb-pick]').forEach((link) => {
    link.addEventListener('click', () => {
      const radio = planner.querySelector<HTMLInputElement>(`[name="suite"][value="${link.dataset.nbPick}"]`);
      if (radio) radio.checked = true;
      window.setTimeout(() => checkin.focus({ preventScroll: true }), 0);
    });
  });

  const render = (warnings: string[], text = '', estimate = '') => {
    status.replaceChildren();
    warnings.forEach((warning) => {
      const p = document.createElement('p');
      p.className = 'nb-form__warn';
      p.textContent = warning;
      status.append(p);
    });
    if (text) {
      const label = document.createElement('p');
      label.className = 'nb-form__ready';
      label.textContent = msg.ready;
      const bubble = document.createElement('p');
      bubble.className = 'nb-bubble';
      bubble.textContent = text;
      status.append(label, bubble);
      if (estimate) {
        const p = document.createElement('p');
        p.className = 'nb-form__estimate';
        p.textContent = estimate;
        status.append(p);
      }
    }
    message = text;
    copy.hidden = !text;
    copy.textContent = copyLabel;
  };

  planner.querySelector<HTMLButtonElement>('[data-demo-update]')?.addEventListener('click', () => {
    const start = parseISO(checkin.value);
    const end = parseISO(checkout.value);
    if (!start || !end || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return render([msg.missing]);
    if (start < today) return render([msg.past]);
    if (end <= start) return render([msg.order]);

    const nights = Math.round((end.getTime() - start.getTime()) / DAY_MS);
    const people = Math.min(4, Math.max(1, Number(guests.value) || 2));
    guests.value = String(people);
    const suiteId = planner.querySelector<HTMLInputElement>('[name="suite"]:checked')?.value || '';
    const suite = data.suites.find((item) => item.id === suiteId);
    const extras = [...planner.querySelectorAll<HTMLInputElement>('[name="extras"]:checked')].map((input) => input.value);

    const warnings: string[] = [];
    const weekendNight = Array.from({ length: nights }, (_, i) => new Date(start.getTime() + i * DAY_MS).getDay()).some((d) => d === 5 || d === 6);
    if (nights === 1 && weekendNight) warnings.push(msg.weekend);
    if (suite && people > suite.max) warnings.push(msg.capacity);
    if (suite && extras.includes('pet') && !suite.pets) warnings.push(msg.pets);

    const date = new Intl.DateTimeFormat(lang, isPt ? { day: '2-digit', month: '2-digit' } : { month: 'long', day: 'numeric' });
    const values = {
      suite: suite ? msg.the[suite.id] : '',
      in: date.format(start),
      out: date.format(end),
      nights: `${nights} ${nights === 1 ? msg.night : msg.nights}`,
      guests: `${people} ${people === 1 ? msg.person : msg.people}`,
    };
    const lines = [msg.hello];
    const who = name.value.trim();
    if (who) lines.push(fill(msg.name, { name: who }));
    lines.push(fill(suite ? msg.want : msg.help, values));
    if (extras.length) lines.push(fill(msg.extras, { list: new Intl.ListFormat(lang, { type: 'conjunction' }).format(extras.map((id) => msg.extraText[id])) }));
    lines.push(msg.close);

    const total = suite ? `R$ ${(suite.rate * nights).toLocaleString(isPt ? 'pt-BR' : 'en-US')}` : '';
    const estimate = suite ? fill(msg.estimate, { nights: values.nights, suite: suite.name, total }) : '';
    render(warnings, lines.join(' '), estimate);
  });

  copy.addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      copy.textContent = data.copied;
    } catch {
      copy.hidden = true;
    }
  });
}

export function initNeblina() {
  document.querySelectorAll<HTMLElement>('[data-nb-root]').forEach((root) => {
    root.classList.add('nb-js');
    initNav(root);
    initReveal(root);
    initDay(root);
    initGallery(root);
    initSeasons(root);
    initPlanner(root);
  });
}
