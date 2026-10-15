/** Tiny string-template helpers shared by server and client rendering. */
export function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Joins class names, skipping falsy entries. */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

const PATHS: Record<string, string> = {
  overview: '<rect x="3" y="3" width="6" height="6" rx="1.2"/><rect x="11" y="3" width="6" height="6" rx="1.2"/><rect x="3" y="11" width="6" height="6" rx="1.2"/><rect x="11" y="11" width="6" height="6" rx="1.2"/>',
  deliveries: '<path d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5z"/><path d="M3.5 6.5 10 10l6.5-3.5M10 10v7"/>',
  drivers: '<circle cx="7.5" cy="7" r="2.8"/><path d="M2.5 16.5c.6-2.8 2.6-4.3 5-4.3s4.4 1.5 5 4.3"/><path d="M13 4.6a2.6 2.6 0 0 1 0 5M14.6 12.4c1.5.5 2.5 1.9 2.9 4.1"/>',
  exceptions: '<path d="M10 3.2 17.2 16H2.8z"/><path d="M10 8v3.6M10 13.8v.1"/>',
  search: '<circle cx="8.8" cy="8.8" r="5"/><path d="m12.6 12.6 4 4"/>',
  sun: '<circle cx="10" cy="10" r="3.4"/><path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7l1.3 1.3M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3"/>',
  moon: '<path d="M15.8 12.4A6.5 6.5 0 0 1 7.6 4.2a6.5 6.5 0 1 0 8.2 8.2z"/>',
  keyboard: '<rect x="2.5" y="5" width="15" height="10" rx="1.8"/><path d="M5.5 8h.1M8.5 8h.1M11.5 8h.1M14.5 8h.1M5.5 11h.1M14.5 11h.1M8 11.5h4"/>',
  menu: '<path d="M3.5 6h13M3.5 10h13M3.5 14h13"/>',
  close: '<path d="m5 5 10 10M15 5 5 15"/>',
  left: '<path d="m12 4.5-5.5 5.5 5.5 5.5"/>',
  right: '<path d="m8 4.5 5.5 5.5L8 15.5"/>',
  sortAsc: '<path d="M10 4v12M5.5 8.5 10 4l4.5 4.5"/>',
  sortDesc: '<path d="M10 16V4M5.5 11.5 10 16l4.5-4.5"/>',
  sortNone: '<path d="m6.5 8 3.5-3.5L13.5 8M6.5 12l3.5 3.5 3.5-3.5"/>',
  route: '<path d="M2.5 6h8.5v7.5H2.5z"/><path d="M11 8.5h3.2l2.3 2.6v2.4H11"/><circle cx="5.5" cy="14.5" r="1.5"/><circle cx="13.8" cy="14.5" r="1.5"/>',
  late: '<circle cx="10" cy="10" r="6.8"/><path d="M10 6.2V10l2.6 1.8"/>',
  issue: '<path d="M10 3.2 17.2 16H2.8z"/><path d="M10 8v3.6M10 13.8v.1"/>',
  delivered: '<circle cx="10" cy="10" r="6.8"/><path d="m6.8 10.2 2.2 2.2 4.3-4.6"/>',
  awaiting: '<path d="M3.5 7 10 3.8 16.5 7v6.5L10 16.7l-6.5-3.2z"/><path d="M3.5 7 10 10.2 16.5 7M10 10.2v6.5M6.8 5.4l6.5 3.2"/>',
  flag: '<path d="M5 17V3.5M5 4h9l-2 3.2 2 3.3H5"/>',
  lock: '<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.6a3 3 0 0 1 6 0V9"/>',
  download: '<path d="M10 3.5v9M6 8.8l4 4 4-4M4 16.5h12"/>',
  swap: '<path d="M4 7h11M12 4l3 3-3 3M16 13H5M8 10l-3 3 3 3"/>',
  reset: '<path d="M4.2 8.2A6 6 0 1 1 4.5 13"/><path d="M4 3.8v4.6h4.6"/>',
  phone: '<path d="M6.2 3.5 8 7.3 6.6 8.8a8.6 8.6 0 0 0 4.6 4.6l1.5-1.4 3.8 1.8-.6 2.4c-.2.6-.7 1-1.4 1A12.6 12.6 0 0 1 2.8 5.5c0-.7.4-1.2 1-1.4z"/>',
  calendar: '<rect x="3" y="4.5" width="14" height="12.5" rx="1.6"/><path d="M3 8.5h14M7 2.8v3.4M13 2.8v3.4"/>',
  check: '<path d="m4.5 10.5 3.5 3.5 7.5-8"/>',
  pause: '<path d="M7.5 5v10M12.5 5v10"/>',
  play: '<path d="M6.5 4.8v10.4L15 10z"/>',
  arrow: '<path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5"/>',
  clear: '<circle cx="10" cy="10" r="6.8"/><path d="m7.6 7.6 4.8 4.8M12.4 7.6l-4.8 4.8"/>',
  pin: '<path d="M10 17.5s5.5-5 5.5-9.3a5.5 5.5 0 0 0-11 0c0 4.3 5.5 9.3 5.5 9.3z"/><circle cx="10" cy="8.2" r="1.9"/>',
  hub: '<path d="M3 16.5V8l7-4.5L17 8v8.5"/><path d="M7 16.5v-5h6v5"/>',
  down: '<path d="m5.5 8 4.5 4.5L14.5 8"/>',
  info: '<circle cx="10" cy="10" r="6.8"/><path d="M10 9.2v4.3M10 6.6v.1"/>',
};

/**
 * Every icon as a symbol, written once per page; icon() references them, which keeps the markup small.
 * The stroke style lives on each symbol and the color follows `currentColor` of the referencing icon.
 */
export function iconSprite(): string {
  const symbols = Object.entries(PATHS)
    .map(([name, paths]) => `<symbol id="lc-i-${name}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</symbol>`)
    .join('');
  return `<svg class="lc-sprite" aria-hidden="true" focusable="false">${symbols}</svg>`;
}

export function icon(name: string, className = 'lc-icon'): string {
  return `<svg class="${className}" width="20" height="20" aria-hidden="true" focusable="false"><use href="#lc-i-${name}"/></svg>`;
}
