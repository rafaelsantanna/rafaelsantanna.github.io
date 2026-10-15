import { DEFAULT_SETTINGS } from '../lib/settings';
import { fill } from '../strings';
import type { Ctx } from './context';

export interface TuningValues {
  topK: number;
  threshold: number;
}

/** Disclosure popover with the top-k and threshold sliders. */
export function setupSettings(root: HTMLElement, ctx: Ctx, onChange: (values: TuningValues) => void) {
  const wrapper = root.querySelector<HTMLElement>('[data-ka-settings]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-ka-settings-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-ka-settings-panel]');
  const topK = root.querySelector<HTMLInputElement>('[data-ka-topk]');
  const threshold = root.querySelector<HTMLInputElement>('[data-ka-threshold]');
  const topKValue = root.querySelector<HTMLElement>('[data-ka-topk-value]');
  const thresholdValue = root.querySelector<HTMLElement>('[data-ka-threshold-value]');
  const summary = root.querySelector<HTMLElement>('[data-ka-settings-summary]');
  const restore = root.querySelector<HTMLButtonElement>('[data-ka-settings-restore]');

  function render(values: TuningValues): void {
    const thresholdText = ctx.decimal(values.threshold);
    if (topK) topK.value = String(values.topK);
    if (threshold) {
      threshold.value = String(values.threshold);
      threshold.setAttribute('aria-valuetext', thresholdText);
    }
    if (topKValue) topKValue.textContent = String(values.topK);
    if (thresholdValue) thresholdValue.textContent = thresholdText;
    if (summary) summary.textContent = fill(ctx.t.settingsSummary, { k: values.topK, t: thresholdText });
  }

  function read(): TuningValues {
    return { topK: Number(topK?.value ?? DEFAULT_SETTINGS.topK), threshold: Number(threshold?.value ?? DEFAULT_SETTINGS.threshold) };
  }

  function setOpen(open: boolean, returnFocus = false): void {
    if (!panel || !toggle) return;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (!open && returnFocus) toggle.focus();
  }

  const change = () => {
    const values = read();
    render(values);
    onChange(values);
  };

  toggle?.addEventListener('click', () => setOpen(Boolean(panel?.hidden)));
  topK?.addEventListener('input', change);
  threshold?.addEventListener('input', change);
  restore?.addEventListener('click', () => {
    render(DEFAULT_SETTINGS);
    onChange({ topK: DEFAULT_SETTINGS.topK, threshold: DEFAULT_SETTINGS.threshold });
  });
  wrapper?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel?.hidden) {
      event.stopPropagation();
      setOpen(false, true);
    }
  });
  wrapper?.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !wrapper.contains(next)) setOpen(false);
  });
  document.addEventListener('pointerdown', (event) => {
    if (panel?.hidden || !(event.target instanceof Node) || wrapper?.contains(event.target)) return;
    setOpen(false);
  });

  return { render, close: () => setOpen(false) };
}
