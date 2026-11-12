/** Hand-drawn 24px line icons, shared by the server markup and the browser scripts. */
const svg = (body: string): string =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const icons = {
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  check: svg('<path d="M5 12.5l4.2 4.2L19 7"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  chevronUp: svg('<path d="m6 15 6-6 6 6"/>'),
  chevronLeft: svg('<path d="m15 6-6 6 6 6"/>'),
  chevronRight: svg('<path d="m9 6 6 6-6 6"/>'),
  calendar: svg('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  reset: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  shuffle: svg('<path d="M4 7h3c4.5 0 5.5 10 10 10h3M4 17h3c1.7 0 2.8-1.4 3.7-3.2M14.3 9.6C15 8 15.8 7 17 7h3M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5"/>'),
  alert: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.3v.2"/>'),
  info: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.7v.2"/>'),
  sunrise: svg('<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 5.5v3M5.4 9.4l1.8 1.8M18.6 9.4l-1.8 1.8M8.5 21h7"/>'),
  sun: svg('<circle cx="12" cy="12" r="3.8"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6"/>'),
  moon: svg('<path d="M19 14.6A7.5 7.5 0 0 1 9.4 5 7.5 7.5 0 1 0 19 14.6z"/>'),
  user: svg('<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/>'),
};

const service: Record<string, string> = {
  corte: svg('<circle cx="6.5" cy="17.5" r="2.6"/><circle cx="17.5" cy="17.5" r="2.6"/><path d="M8.4 15.7 17.5 4M15.6 15.7 6.5 4"/>'),
  barba: svg('<path d="M3 9h12.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-1.5 1.5H7.5A4.5 4.5 0 0 1 3 9z"/><path d="m16 13.5 4.5 6.5"/><path d="M6.5 11h6"/>'),
  'corte-barba': svg('<circle cx="5.5" cy="18" r="2.2"/><circle cx="12.5" cy="18" r="2.2"/><path d="M7 16.3 13 7.5M11 16.3 5 7.5"/><path d="M17.5 4v6M14.5 7h6"/>'),
  pezinho: svg('<rect x="7" y="8" width="10" height="13" rx="3"/><path d="M8.2 8V4.5M10.7 8V4.5M13.3 8V4.5M15.8 8V4.5"/><path d="M10 13.5h4M10 16.5h4"/>'),
  sobrancelha: svg('<path d="M3 14s3.5-4 9-4 9 4 9 4-3.5 4-9 4-9-4-9-4z"/><circle cx="12" cy="14" r="2"/><path d="M4.5 7.5C7 5.9 9.6 5.3 12.3 5.5c2.4.2 4.6 1 6.7 2.4"/>'),
  hidratacao: svg('<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z"/><path d="M9.3 14.6a2.7 2.7 0 0 0 2.7 2.7"/>'),
};

/** Line icon for a service id, falling back to scissors. */
export const serviceIcon = (id: string): string => service[id] ?? service.corte;
