const RADIO = '[role="radio"]';
const isEnabled = (radio: HTMLElement): boolean => radio.getAttribute('aria-disabled') !== 'true';
const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** One tab stop per radio group: the checked radio, or the first enabled one. */
export function syncRoving(group: HTMLElement): void {
  const radios = Array.from(group.querySelectorAll<HTMLElement>(RADIO));
  const enabled = radios.filter(isEnabled);
  const current = enabled.find((radio) => radio.getAttribute('aria-checked') === 'true') ?? enabled[0];
  radios.forEach((radio) => {
    radio.tabIndex = radio === current ? 0 : -1;
  });
}

export function setChecked(group: HTMLElement, chosen: HTMLElement | null): void {
  group.querySelectorAll<HTMLElement>(RADIO).forEach((radio) => radio.setAttribute('aria-checked', String(radio === chosen)));
  syncRoving(group);
}

/**
 * WAI-ARIA radio group behavior, delegated from a container so groups can be re-rendered:
 * arrows move and select, Home and End jump, disabled radios are skipped.
 */
export function bindRadioGroups(container: HTMLElement, choose: (radio: HTMLElement) => void): void {
  container.addEventListener('click', (event) => {
    const radio = (event.target as Element).closest<HTMLElement>(RADIO);
    if (radio && container.contains(radio)) choose(radio);
  });
  container.addEventListener('keydown', (event) => {
    const radio = (event.target as Element).closest<HTMLElement>(RADIO);
    const group = radio?.closest<HTMLElement>('[role="radiogroup"]');
    if (!radio || !group) return;
    const radios = Array.from(group.querySelectorAll<HTMLElement>(RADIO)).filter(isEnabled);
    if (!radios.length) return;
    let target: HTMLElement | undefined;
    if (event.key in moves) {
      const index = radios.indexOf(radio);
      target = index === -1 ? radios[0] : radios[(index + moves[event.key] + radios.length) % radios.length];
    } else if (event.key === 'Home') target = radios[0];
    else if (event.key === 'End') target = radios[radios.length - 1];
    if (!target) return;
    event.preventDefault();
    target.focus();
    choose(target);
  });
}
