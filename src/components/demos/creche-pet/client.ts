// Client behaviour for the Pipoca Pet demo: sticky header, reveals, tabs, price simulator, popcorn toy, message builder.
import { brl, type Coat, type ServiceId, type Size } from './pricing';

interface Option { value: string; label: string; hint?: string }
interface ClientData {
  prices: Record<ServiceId, Record<Coat, Record<Size, number>>>;
  taxi: number;
  sim: { includes: Record<ServiceId, string>; flatNote: string; sizeWord: string; coatWord: string; taxiWord: string; from: string; services: Option[]; sizes: Option[]; coats: Option[] };
  message: { hello: string; about: string; size: string; age: string; want: string; note: string; close: string; and: string };
  contact: { empty: string; copied: string; copy: string; services: string[] };
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
const checkedValue = (root: ParentNode, name: string) => root.querySelector<HTMLInputElement>(`[name="${name}"]:checked`)?.value ?? '';

function joinList(items: string[], and: string): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}

function initHeader(root: HTMLElement) {
  const sentinel = root.querySelector('.pp-sentinel');
  const nav = root.querySelector('.pp-nav');
  if (!sentinel || !nav || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => nav.classList.toggle('is-condensed', !entry.isIntersecting)).observe(sentinel);
}

function initReveals(root: HTMLElement) {
  if (reducedMotion() || !('IntersectionObserver' in window)) return;
  root.classList.add('pp-motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  root.querySelectorAll('.pp-reveal').forEach((element) => observer.observe(element));
}

function initTabs(root: HTMLElement) {
  const container = root.querySelector<HTMLElement>('[data-tabs]');
  const list = container?.querySelector<HTMLElement>('[role="tablist"]');
  if (!container || !list) return;
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(container.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  list.hidden = false;
  container.classList.add('is-enhanced');

  const select = (index: number, focus = false) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      // Only a panel that goes from hidden to shown plays the entrance animation.
      const entering = active && panels[i].hidden;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      panels[i].classList.toggle('is-entering', entering);
    });
    list.style.setProperty('--pp-tab', String(index));
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const keys: Record<string, number> = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last };
      const next = keys[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });
  panels.forEach((panel) => panel.addEventListener('animationend', () => panel.classList.remove('is-entering')));
  select(0);
}

function initSimulator(root: HTMLElement, data: ClientData, prefill: (size: string, service: number) => void) {
  const sim = root.querySelector<HTMLElement>('[data-sim]');
  if (!sim) return;
  const stage = sim.querySelector<HTMLElement>('.pp-stage');
  // The big price in the card and the sticky mobile chip show the same number.
  const values = Array.from(sim.querySelectorAll<HTMLElement>('[data-sim-value]'));
  const bumper = sim.querySelector<HTMLElement>('.pp-sim__value');
  const live = sim.querySelector<HTMLElement>('[data-sim-live]');
  const includes = sim.querySelector<HTMLElement>('[data-sim-includes]');
  const note = sim.querySelector<HTMLElement>('[data-sim-note]');
  const sizeLabel = sim.querySelector<HTMLElement>('[data-sim-size-label]');
  const serviceMap: Record<string, number> = JSON.parse(root.dataset.simMap || '{}');
  const finalNote = note?.textContent ?? '';
  let shown = Number(values[0]?.textContent || 0);
  const render = (amount: number) => values.forEach((element) => { element.textContent = String(amount); });
  let frame = 0;
  let settle = 0;

  const animateTo = (target: number) => {
    cancelAnimationFrame(frame);
    window.clearTimeout(settle);
    if (reducedMotion() || target === shown) {
      shown = target;
      render(target);
      return;
    }
    const start = shown;
    const startTime = performance.now();
    const duration = 520;
    bumper?.classList.remove('is-bumping');
    void bumper?.offsetWidth;
    bumper?.classList.add('is-bumping');
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      shown = Math.round(start + (target - start) * eased);
      render(shown);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    // Lands on the exact value even when the browser throttles animation frames.
    settle = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      shown = target;
      render(target);
    }, duration + 80);
  };

  const update = () => {
    const size = checkedValue(sim, 'pp-size') as Size;
    const coat = checkedValue(sim, 'pp-coat') as Coat;
    const service = checkedValue(sim, 'pp-service') as ServiceId;
    const taxi = sim.querySelector<HTMLInputElement>('[name="pp-taxi"]')?.checked ?? false;
    if (!size || !coat || !service) return;
    const total = data.prices[service][coat][size] + (taxi ? data.taxi : 0);
    const sizeOption = data.sim.sizes.find((option) => option.value === size);
    const coatOption = data.sim.coats.find((option) => option.value === coat);
    const serviceOption = data.sim.services.find((option) => option.value === service);
    stage?.setAttribute('data-size', size);
    stage?.setAttribute('data-coat', coat);
    if (sizeLabel) sizeLabel.textContent = sizeOption?.label ?? '';
    if (includes) includes.textContent = data.sim.includes[service];
    const flat = service === 'creche' || service === 'hotel';
    if (note) note.textContent = flat ? `${data.sim.flatNote} ${finalNote}` : finalNote;
    animateTo(total);
    if (live) {
      const parts = [`${serviceOption?.label}`, `${data.sim.sizeWord} ${sizeOption?.label}`, `${data.sim.coatWord} ${coatOption?.label.toLowerCase()}`];
      if (taxi) parts.push(data.sim.taxiWord);
      live.textContent = `${parts.join(', ')}: ${data.sim.from} ${brl(total)}.`;
    }
  };

  sim.addEventListener('change', update);
  sim.querySelector('[data-sim-use]')?.addEventListener('click', () => {
    prefill(checkedValue(sim, 'pp-size'), serviceMap[checkedValue(sim, 'pp-service')]);
    if (sim.querySelector<HTMLInputElement>('[name="pp-taxi"]')?.checked) prefill('', 5);
  });
  update();
}

function initPopcorn(root: HTMLElement) {
  const pop = root.querySelector<HTMLElement>('[data-pop]');
  const button = pop?.querySelector<HTMLButtonElement>('button');
  if (!pop || !button || reducedMotion()) return;
  const kernels = Array.from(pop.querySelectorAll<SVGElement>('.pp-pop__kernel'));
  button.hidden = false;
  button.addEventListener('click', () => {
    kernels.forEach((kernel, index) => {
      const angle = -Math.PI / 2 + (index - (kernels.length - 1) / 2) * 0.32 + (Math.random() - 0.5) * 0.2;
      const distance = 70 + Math.random() * 60;
      kernel.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      kernel.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      kernel.style.setProperty('--r', `${Math.round((Math.random() - 0.5) * 300)}deg`);
      kernel.style.setProperty('--d', `${index * 35}ms`);
    });
    pop.classList.remove('is-popping');
    void pop.offsetWidth;
    pop.classList.add('is-popping');
  });
  pop.addEventListener('animationend', (event) => {
    if ((event.target as Element).classList.contains('pp-pop__kernel') && event.target === kernels[kernels.length - 1]) pop.classList.remove('is-popping');
  });
}

function initBuilder(root: HTMLElement, data: ClientData) {
  const builder = root.querySelector<HTMLElement>('[data-builder]');
  const output = builder?.querySelector<HTMLElement>('[data-output]');
  const copyButton = builder?.querySelector<HTMLButtonElement>('[data-copy]');
  if (!builder || !output) return;
  const field = (name: string) => builder.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value.trim() ?? '';
  let message = '';

  builder.querySelector('[data-build]')?.addEventListener('click', () => {
    const tutor = field('pp-tutor');
    const dog = field('pp-dog');
    const services = Array.from(builder.querySelectorAll<HTMLInputElement>('[name="pp-msg-service"]:checked')).map((input) => data.contact.services[Number(input.value)].toLowerCase());
    if (!tutor || !dog || services.length === 0) {
      output.textContent = data.contact.empty;
      output.classList.add('is-warning');
      if (copyButton) copyButton.hidden = true;
      return;
    }
    const sizeValue = checkedValue(builder, 'pp-msg-size');
    const size = data.sim.sizes.find((option) => option.value === sizeValue)?.label;
    const age = field('pp-age');
    const details = [size ? fill(data.message.size, { size }) : '', age ? fill(data.message.age, { age }) : ''].filter(Boolean);
    const about = details.length ? `${fill(data.message.about, { dog })}: ${details.join(', ')}.` : '';
    const rawNote = field('pp-note');
    const note = rawNote && !/[.!?]$/.test(rawNote) ? `${rawNote}.` : rawNote;
    message = [
      fill(data.message.hello, { tutor }),
      about,
      fill(data.message.want, { services: joinList(services, data.message.and) }),
      note ? fill(data.message.note, { note }) : '',
      data.message.close,
    ].filter(Boolean).join(' ');
    output.textContent = message;
    output.classList.remove('is-warning');
    if (copyButton) {
      copyButton.hidden = !navigator.clipboard;
      copyButton.textContent = data.contact.copy;
    }
  });

  copyButton?.addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      copyButton.textContent = data.contact.copied;
    } catch {
      copyButton.hidden = true;
    }
  });
}

export function initPipoca() {
  document.querySelectorAll<HTMLElement>('.demo--pipoca').forEach((root) => {
    const data: ClientData = JSON.parse(root.dataset.pipoca || '{}');
    const builder = root.querySelector<HTMLElement>('[data-builder]');

    // Ticks the matching size and service chips in the message builder.
    const prefill = (size: string, service?: number) => {
      if (!builder) return;
      if (size) {
        const sizeInput = builder.querySelector<HTMLInputElement>(`[name="pp-msg-size"][value="${size}"]`);
        if (sizeInput) sizeInput.checked = true;
      }
      if (service !== undefined) {
        const serviceInput = builder.querySelector<HTMLInputElement>(`[name="pp-msg-service"][value="${service}"]`);
        if (serviceInput) serviceInput.checked = true;
      }
    };

    initHeader(root);
    initReveals(root);
    initTabs(root);
    initSimulator(root, data, prefill);
    initPopcorn(root);
    initBuilder(root, data);
    root.querySelectorAll<HTMLAnchorElement>('[data-prefill-service]').forEach((link) => {
      link.addEventListener('click', () => prefill('', Number(link.dataset.prefillService)));
    });
  });
}
