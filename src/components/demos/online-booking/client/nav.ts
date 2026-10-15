/**
 * Phone menu: a disclosure button for the section links. Returns a function that closes it. When the
 * element that caused the closing sits inside the menu, focus moves to the toggle, because a link in the
 * hidden panel can no longer hold it (a dialog opened from there would otherwise return focus to nothing).
 */
export function bindNav(root: HTMLElement): (origin?: Element) => void {
  const toggle = root.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = root.querySelector<HTMLElement>('[data-nav]');
  if (!toggle || !nav) return () => undefined;
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.toggleAttribute('data-open', open);
  };
  toggle.addEventListener('click', () => set(!isOpen()));
  nav.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) set(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      set(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    if (isOpen() && !nav.contains(target) && !toggle.contains(target)) set(false);
  });
  return (origin) => {
    set(false);
    // The toggle only renders in the phone layout; on wider screens the menu links stay visible.
    if (origin && nav.contains(origin) && toggle.getClientRects().length) toggle.focus();
  };
}
