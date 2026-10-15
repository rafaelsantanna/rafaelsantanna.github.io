export type TabId = 'chat' | 'evidence' | 'sources';

const TAB_MODE = '(max-width: 63.99rem)';

/**
 * On narrow screens the three panes become WAI-ARIA tabs. On wide screens the tab list is not
 * rendered and the panes go back to plain labelled regions.
 */
export function setupTabs(root: HTMLElement, onSelect: (id: TabId) => void) {
  const tablist = root.querySelector<HTMLElement>('[data-ka-tabs]');
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-ka-tab]')];
  const panes = [...root.querySelectorAll<HTMLElement>('[data-ka-pane]')];
  const query = window.matchMedia(TAB_MODE);
  const regionLabels = new Map(panes.map((pane) => [pane, pane.getAttribute('aria-labelledby')]));

  function applyMode(): void {
    for (const pane of panes) {
      if (query.matches) {
        pane.setAttribute('role', 'tabpanel');
        pane.setAttribute('aria-labelledby', `ka-tab-${pane.dataset.kaPane}`);
      } else {
        pane.removeAttribute('role');
        pane.setAttribute('aria-labelledby', regionLabels.get(pane) ?? '');
      }
    }
  }

  function select(id: TabId, focus = false): void {
    root.dataset.tab = id;
    for (const tab of tabs) {
      const selected = tab.dataset.kaTab === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    onSelect(id);
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.kaTab as TabId)));
  tablist?.addEventListener('keydown', (event) => {
    const current = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    const moves: Record<string, number> = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = tabs[(moves[event.key] + tabs.length) % tabs.length];
    select(next.dataset.kaTab as TabId, true);
  });
  query.addEventListener('change', applyMode);
  applyMode();

  return { select, isTabMode: () => query.matches };
}

export type Tabs = ReturnType<typeof setupTabs>;
