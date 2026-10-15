import { esc } from '../lib/text';

/** Routes drawn along the fake street grid; picked per order so each visit looks different. */
const routes = [
  { path: 'M40 88H150V34H262', start: [40, 88], end: [262, 34] },
  { path: 'M30 34H70V88H230V60', start: [30, 34], end: [230, 60] },
  { path: 'M300 108V88H150V34H112', start: [300, 108], end: [112, 34] },
] as const;

/** An abstract street map placeholder. It is deliberately not a real map and carries no real location. */
export function mapSvg(orderId: string, label: string): string {
  const route = routes[Number(orderId) % routes.length];
  const [sx, sy] = route.start;
  const [ex, ey] = route.end;
  return `<svg class="t-map__svg" viewBox="0 0 340 128" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">
    <rect class="t-map__ground" width="340" height="128"/>
    <rect class="t-map__park" x="160" y="44" width="62" height="36" rx="6"/>
    <path class="t-map__water" d="M0 112c40-10 70 6 110-2s60-22 100-16 80 14 130 4v30H0Z"/>
    <path class="t-map__road t-map__road--main" d="M0 34H340M0 88H340M70 0V128M150 0V128M230 0V128M300 0V128"/>
    <path class="t-map__road" d="M0 61H70M150 61H230M230 14H340M300 61H340M110 0V34M110 88V128M190 88V128M265 34V88"/>
    <path class="t-map__route-casing" d="${route.path}"/>
    <path class="t-map__route" d="${route.path}"/>
    <circle class="t-map__me-halo" cx="${sx}" cy="${sy}" r="12"/>
    <circle class="t-map__me" cx="${sx}" cy="${sy}" r="6.5"/>
    <path class="t-map__pin" d="M${ex} ${ey + 1}c-1.6-3.2-8-8.6-8-14a8 8 0 0 1 16 0c0 5.4-6.4 10.8-8 14Z"/>
    <circle class="t-map__pin-dot" cx="${ex}" cy="${ey - 13}" r="3"/>
  </svg>`;
}
