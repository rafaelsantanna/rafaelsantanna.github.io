// Hand-drawn inline icons (24px grid, stroke follows currentColor). Always decorative: aria-hidden.
const svg = (body: string, extra = '') =>
  `<svg class="vt-icon${extra}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  check: svg('<path d="m5 12.5 4.2 4.2L19 7"/>'),
  checkCircle: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.6"/>'),
  alert: svg('<path d="M12 3.5 2.8 19.5h18.4L12 3.5Z"/><path d="M12 10v4.2"/><path d="M12 17.1v.1"/>'),
  alertCircle: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.4v.1"/>'),
  waiting: svg('<circle cx="12" cy="12" r="9" stroke-dasharray="3 3.2"/>'),
  cross: svg('<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'),
  search: svg('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
  minus: svg('<path d="M6 12h12"/>'),
  plus: svg('<path d="M12 6v12M6 12h12"/>'),
  trash: svg('<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l.9 12.2h9.2L17.5 7"/><path d="M10.3 10.6v5.2M13.7 10.6v5.2"/>'),
  reset: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4.5 4.5v4h4"/>'),
  saved: svg('<path d="M7 18.5h10.2a4 4 0 0 0 .6-7.95A5.6 5.6 0 0 0 7 9.3a4.6 4.6 0 0 0 0 9.2Z"/><path d="m9.4 13.6 1.9 1.9 3.4-3.6"/>'),
  cloud: svg('<path d="M7 18.5h10.2a4 4 0 0 0 .6-7.95A5.6 5.6 0 0 0 7 9.3a4.6 4.6 0 0 0 0 9.2Z"/>'),
  unsaved: svg('<path d="M7 18.5h10.2a4 4 0 0 0 .6-7.95A5.6 5.6 0 0 0 7 9.3a4.6 4.6 0 0 0 0 9.2Z"/><path d="M12 11.5v3"/><path d="M12 16.6v.1"/>'),
  truck: svg('<path d="M3 6.5h11v9.5H3z"/><path d="M14 9.5h3.8l3.2 3.4V16h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17.2" cy="17.5" r="1.7"/>'),
  wallet: svg('<path d="M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 17.5V6a1.5 1.5 0 0 1 1.5-1.5H16"/><path d="M16 13.3h.1"/>'),
  target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>'),
  user: svg('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 19.5c1.1-3.4 3.8-5.2 7-5.2s5.9 1.8 7 5.2"/>'),
  chevronUp: svg('<path d="m7 14.5 5-5 5 5"/>'),
  arrowLeft: svg('<path d="M19 12H5.5"/><path d="M11 6.5 5.5 12l5.5 5.5"/>'),
  send: svg('<path d="M4 12 20 4.5l-4.5 15-3.8-6.2L4 12Z"/><path d="m11.7 13.3 3.6-3.6"/>'),
  grip: svg('<path d="m9 7.5-4.5 4.5L9 16.5"/><path d="m15 7.5 4.5 4.5-4.5 4.5"/>'),
};

/** The Ventura mark: a road that turns into a "V". */
export const logo = `<svg class="vt-logo" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="8" fill="#0F1F17"/><path d="M8.2 9.2 16 23.4l7.8-14.2" fill="none" stroke="#34D399" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.6 9.2 16 15.4l3.4-6.2" fill="none" stroke="#F5F7F4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.6 2.2"/></svg>`;

/** An empty crate for the empty items state. */
export const emptyCrate = `<svg class="vt-empty__art" viewBox="0 0 120 84" width="120" height="84" aria-hidden="true" focusable="false"><path d="M18 34 60 18l42 16-42 16Z" fill="#E1F2EA" stroke="#047857" stroke-width="2" stroke-linejoin="round"/><path d="M18 34v30l42 16V50" fill="#F5F7F4" stroke="#047857" stroke-width="2" stroke-linejoin="round"/><path d="M102 34v30L60 80V50" fill="#FFFFFF" stroke="#047857" stroke-width="2" stroke-linejoin="round"/><path d="M38 26.5 80 42.5v10" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/><path d="M28 60.5l10 3.8M28 66l6 2.3" stroke="#047857" stroke-width="2" stroke-linecap="round"/></svg>`;
