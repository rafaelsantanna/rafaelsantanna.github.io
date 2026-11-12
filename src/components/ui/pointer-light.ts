// Feeds the pointer position to cards so their hover light follows the cursor (styles in motion.css).
const selector = '.project-card, .niche-card, .sites-steps li, .offer-box, .callout';

export function trackPointerLight(): void {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointermove', (event) => {
    const card = (event.target as Element | null)?.closest<HTMLElement>(selector);
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - box.left}px`);
    card.style.setProperty('--my', `${event.clientY - box.top}px`);
  }, { passive: true });
}
