// Wires the shared store to both screens, the page controls, autosave and the parity panel.
import type { Locale } from '@/data/types';
import { exampleDraft } from '../draft.ts';
import { fill, percent } from '../format.ts';
import { DISCOUNT_LIMIT, type Role } from '../rules.ts';
import type { Strings } from '../strings.ts';
import { clearDraft, createAutosave, loadDraft, type SaveStatus } from './autosave.ts';
import { createAnnouncer, must, type Context } from './dom.ts';
import { initLegacy } from './legacy.ts';
import { initModern, type ModernScreen } from './modern.ts';
import { initParity } from './parity.ts';
import { initRadioGroup } from './radio-group.ts';
import { initStage } from './stage.ts';
import { createStore } from './store.ts';

export function boot(): void {
  const root = document.querySelector<HTMLElement>('[data-ventura]');
  const configElement = root?.querySelector('[data-ventura-config]');
  if (!root || !configElement?.textContent) return;
  const { locale, t } = JSON.parse(configElement.textContent) as { locale: Locale; t: Strings };

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const context: Context = {
    locale,
    t,
    announce: createAnnouncer(must(root, '[data-live]')),
    reducedMotion: () => motion.matches,
  };

  const saved = loadDraft();
  const store = createStore({ draft: saved?.draft ?? exampleDraft(), role: 'seller' });

  let modern: ModernScreen | null = null;
  const autosave = createAutosave(store, (status: SaveStatus, at?: Date) => modern?.showSaveStatus(status, at));
  const legacy = initLegacy(must(root, '[data-legacy]'), store, context);
  // A clerk opening the same order on the old screen calculates it too, so both sides start from the same totals.
  legacy.reset(true);
  modern = initModern(must(root, '[data-modern]'), store, context, autosave);
  if (saved) modern.showSaveStatus('restored', saved.savedAt);
  else modern.showSaveStatus('example');
  initParity(must(root, '[data-parity]'), store, legacy, context);
  const stage = initStage(root, context);

  const roleHint = must(root, '[data-role-hint]');
  const showRole = (role: Role) => {
    roleHint.textContent = fill(t.page.roleHint, { limit: percent(DISCOUNT_LIMIT[role], locale) });
  };
  const roleGroup = initRadioGroup(must(root, '[data-radio="role"]'), (value) => {
    const role = value as Role;
    store.setRole(role, 'page');
    showRole(role);
    context.announce(fill(t.page.liveRole, { role: t.roles[role], limit: percent(DISCOUNT_LIMIT[role], locale) }));
  });

  must(root, '[data-reset]').addEventListener('click', () => {
    clearDraft();
    store.replace({ draft: exampleDraft(), role: 'seller' }, 'page');
    legacy.reset(true);
    modern?.reset();
    modern?.showSaveStatus('example');
    stage.reset();
    roleGroup.set('seller');
    showRole('seller');
    context.announce(t.page.liveReset);
  });
}
