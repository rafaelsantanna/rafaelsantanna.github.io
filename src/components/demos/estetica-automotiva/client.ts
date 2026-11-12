import { formatPrice, includesWash } from './data';

interface QuoteService { id: string; name: string; hours: number; prices: number[] }
interface QuoteLabels { sameDay: string; days: string; pickupFree: string; pickupPaid: string; total: string; included: string }
interface MessageLabels { missing: string; hello: string; ask: string; services: string; pickupYes: string; pickupNo: string; estimate: string; close: string }

const SIZE_ORDER = ['hatch', 'sedan', 'suv', 'picape'];
const FREE_PICKUP_FROM = 600;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sums the starting prices and bench hours, without charging the wash twice when polishing already includes it. */
function estimate(services: QuoteService[], picked: Set<string>, size: string) {
  const index = Math.max(0, SIZE_ORDER.indexOf(size));
  const washCovered = includesWash.some((id) => picked.has(id));
  let total = 0;
  let hours = 0;
  const lines: { id: string; name: string; price: number | null }[] = [];
  services.forEach((service) => {
    if (!picked.has(service.id)) return;
    const covered = service.id === 'lavagem' && washCovered;
    lines.push({ id: service.id, name: service.name, price: covered ? null : service.prices[index] });
    if (covered) return;
    total += service.prices[index];
    hours += service.hours;
  });
  return { total, hours, lines, index, washCovered };
}

function animateValue(element: HTMLElement, to: number, format: (value: number) => string) {
  const from = Number(element.dataset.value || 0);
  element.dataset.value = String(to);
  if (reducedMotion() || from === to) {
    element.textContent = format(to);
    return;
  }
  const start = performance.now();
  const duration = 560;
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = format(Math.round(from + (to - from) * eased));
    if (progress < 1 && element.dataset.value === String(to)) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  element.classList.remove('is-bumped');
  void element.offsetWidth;
  element.classList.add('is-bumped');
}

function initQuote(root: HTMLElement, locale: 'pt' | 'en') {
  const quote = root.querySelector<HTMLElement>('[data-lume-quote]');
  if (!quote) return;
  const services: QuoteService[] = JSON.parse(quote.dataset.services || '[]');
  const labels: QuoteLabels = JSON.parse(quote.dataset.labels || '{}');
  const format = (value: number) => formatPrice(value, locale);
  const sizeInputs = [...quote.querySelectorAll<HTMLInputElement>('[data-size]')];
  const picks = [...quote.querySelectorAll<HTMLInputElement>('[data-pick]')];
  const total = quote.querySelector<HTMLElement>('[data-total]');
  const live = quote.querySelector<HTMLElement>('[data-total-live]');
  const time = quote.querySelector<HTMLElement>('[data-time]');
  const pickup = quote.querySelector<HTMLElement>('[data-pickup]');
  const list = quote.querySelector<HTMLElement>('[data-list]');
  const emptyText = list?.textContent?.trim() || '';
  const addButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-add]')];

  const current = () => ({
    size: sizeInputs.find((input) => input.checked)?.value || 'hatch',
    picked: new Set(picks.filter((input) => input.checked).map((input) => input.value)),
  });

  const render = () => {
    const { size, picked } = current();
    const result = estimate(services, picked, size);
    services.forEach((service) => {
      const slot = quote.querySelector<HTMLElement>(`[data-price-for="${service.id}"]`);
      if (!slot) return;
      const covered = service.id === 'lavagem' && result.washCovered;
      slot.textContent = covered ? labels.included : format(service.prices[result.index]);
    });
    if (total) animateValue(total, result.total, format);
    if (time) time.textContent = result.hours === 0 ? '-' : result.hours <= 8 ? labels.sameDay : labels.days.replace('{n}', String(Math.ceil(result.hours / 8)));
    if (pickup) pickup.textContent = result.total >= FREE_PICKUP_FROM ? labels.pickupFree : labels.pickupPaid;
    if (live) live.textContent = result.total ? `${labels.total} ${format(result.total)}. ${time?.textContent || ''}` : '';
    if (list) {
      list.replaceChildren(...(result.lines.length ? result.lines : [null]).map((line) => {
        const item = document.createElement('li');
        if (!line) {
          item.className = 'is-empty';
          item.textContent = emptyText;
          return item;
        }
        const name = document.createElement('span');
        name.textContent = line.name;
        const value = document.createElement('span');
        value.textContent = line.price === null ? labels.included : format(line.price);
        item.append(name, value);
        return item;
      }));
    }
    addButtons.forEach((button) => button.setAttribute('aria-pressed', String(picked.has(button.dataset.add || ''))));
  };

  quote.addEventListener('change', render);
  addButtons.forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const pick = picks.find((input) => input.value === button.dataset.add);
      if (!pick) return;
      pick.checked = !pick.checked;
      render();
    });
  });

  // Hands the chosen size and services over to the message builder.
  root.querySelector<HTMLButtonElement>('[data-use-quote]')?.addEventListener('click', () => {
    const message = root.querySelector<HTMLElement>('[data-lume-message]');
    if (!message) return;
    const { size, picked } = current();
    message.querySelectorAll<HTMLInputElement>('input[type="radio"][data-label]').forEach((input) => { input.checked = input.value === size; });
    message.querySelectorAll<HTMLInputElement>('[data-msg-service]').forEach((input) => { input.checked = picked.has(input.value); });
    message.closest('section')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    message.querySelector<HTMLInputElement>('[name="lu-name"]')?.focus({ preventScroll: true });
  });

  render();
  return services;
}

function initMessage(root: HTMLElement, locale: 'pt' | 'en', services: QuoteService[]) {
  const message = root.querySelector<HTMLElement>('[data-lume-message]');
  if (!message) return;
  const labels: MessageLabels = JSON.parse(message.dataset.labels || '{}');
  const output = message.querySelector<HTMLElement>('[data-output]');
  const copy = message.querySelector<HTMLButtonElement>('[data-copy]');
  const copyLabel = copy?.textContent || '';

  message.querySelector<HTMLButtonElement>('[data-build]')?.addEventListener('click', () => {
    if (!output) return;
    const name = message.querySelector<HTMLInputElement>('[name="lu-name"]')?.value.trim() || '';
    const car = message.querySelector<HTMLInputElement>('[name="lu-car"]')?.value.trim() || '';
    const sizeInput = message.querySelector<HTMLInputElement>('input[type="radio"][data-label]:checked');
    const chosen = [...message.querySelectorAll<HTMLInputElement>('[data-msg-service]:checked')];
    const pickup = message.querySelector<HTMLInputElement>('input[value="yes"]:checked');
    if (!name || chosen.length === 0) {
      output.textContent = labels.missing;
      if (copy) copy.hidden = true;
      return;
    }
    const result = estimate(services, new Set(chosen.map((input) => input.value)), sizeInput?.value || 'hatch');
    const lowerFirst = (text = '') => (/^[A-Z]{2,}/.test(text) ? text : text.charAt(0).toLocaleLowerCase() + text.slice(1));
    const vehicle = [car, lowerFirst(sizeInput?.dataset.label)].filter(Boolean);
    const list = new Intl.ListFormat(locale === 'pt' ? 'pt-BR' : 'en', { type: 'conjunction' });
    const carText = vehicle.length === 2 ? `${vehicle[0]} (${vehicle[1]})` : vehicle[0] || '';
    output.textContent = [
      labels.hello.replace('{name}', name),
      `${labels.ask}${carText ? `, ${carText}` : ''}.`,
      `${labels.services}: ${list.format(chosen.map((input) => lowerFirst(input.dataset.label)))}.`,
      pickup ? labels.pickupYes : labels.pickupNo,
      labels.estimate.replace('{total}', formatPrice(result.total, locale)),
      labels.close,
    ].join(' ');
    if (copy) {
      copy.hidden = false;
      copy.textContent = copyLabel;
    }
  });

  copy?.addEventListener('click', async () => {
    if (!output?.textContent) return;
    try {
      await navigator.clipboard.writeText(output.textContent);
      copy.textContent = message.dataset.copied || copyLabel;
      window.setTimeout(() => { copy.textContent = copyLabel; }, 2200);
    } catch {
      // Clipboard can be blocked; the text stays visible for manual copying.
    }
  });
}

function initCompare(root: HTMLElement) {
  const compare = root.querySelector<HTMLElement>('[data-lume-compare]');
  const range = compare?.querySelector<HTMLInputElement>('input[type="range"]');
  if (!compare || !range) return;
  const update = () => compare.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', update);
  update();
}

function initChrome(root: HTMLElement) {
  root.classList.add('lu-js');
  const nav = root.querySelector<HTMLElement>('[data-lume-nav]');
  const sentinel = root.querySelector<HTMLElement>('[data-lume-sentinel]');
  if (nav && sentinel) {
    new IntersectionObserver(([entry]) => nav.classList.toggle('is-condensed', !entry.isIntersecting)).observe(sentinel);
  }
  const reveals = root.querySelectorAll<HTMLElement>('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach((element) => observer.observe(element));
}

export function initLume(root: HTMLElement) {
  const locale = root.dataset.locale === 'en' ? 'en' : 'pt';
  initChrome(root);
  initCompare(root);
  const services = initQuote(root, locale) || [];
  initMessage(root, locale, services);
}
