/** Hand-drawn 24px stroke icons. Every icon is decorative; meaning always comes with visible text. */
const paths = {
  today: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 14.8 2 2 4-4"/>',
  queue: '<path d="M7 18.5a4.5 4.5 0 0 1-.7-8.95A6 6 0 0 1 17.7 8.5a4 4 0 0 1-.2 10"/><path d="M12 12.5v8M9 15.5l3-3 3 3"/>',
  settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  install: '<path d="M4 20c3.5-2.5 5-6 5-10.5V4M20 20c-3.5-2.5-5-6-5-10.5V4"/><circle cx="12" cy="19" r="2"/><path d="M9 9.5h6"/>',
  repair: '<path d="M14.5 5.5a4.2 4.2 0 0 0-4.9 5.6L4 16.7V20h3.3l5.6-5.6a4.2 4.2 0 0 0 5.6-4.9l-2.7 2.7-2.6-.6-.6-2.6 2.9-3.5Z"/>',
  router: '<rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 16.5h.01M10.5 16.5h.01M7.5 13 6 6M16.5 13 18 6"/>',
  move: '<path d="M3.5 11 12 4.5l8.5 6.5"/><path d="M5.5 9.5V20H11M14 16.5h6.5M17.5 13.5l3 3-3 3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  sync: '<path d="M19.5 10A8 8 0 0 0 5.4 7.3L4 9M4 4.5V9h4.5M4.5 14a8 8 0 0 0 14.1 2.7L20 15M20 19.5V15h-4.5"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4.2M12 17h.01"/>',
  cloudOff: '<path d="m3 3 18 18"/><path d="M8.6 8.7A4.5 4.5 0 0 0 7 18.5h10.5M18.3 8.6A6 6 0 0 0 10.6 5.2M20.4 16.4a4 4 0 0 0-2.1-7.8"/>',
  cloudCheck: '<path d="M7 18.5a4.5 4.5 0 0 1-.7-8.95A6 6 0 0 1 17.7 8.5a4 4 0 0 1-.2 10H7Z"/><path d="m9.5 13.5 2 2 3.5-3.5"/>',
  chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
  chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h11l-2.2 4 2.2 4h-11"/>',
  camera: '<path d="M4 8.5h3.2L9 5.5h6l1.8 3H20V19H4V8.5Z"/><circle cx="12" cy="13.5" r="3.5"/>',
  pen: '<path d="M4 20h4.2L19 9.2 14.8 5 4 15.8V20ZM12.8 7l4.2 4.2"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4L4.5 9"/><path d="M4.5 4.5V9H9"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  note: '<path d="M5 4.5h14v11h-9l-5 4v-15Z"/><path d="M9 9h6M9 12h4"/>',
  signal: '<path d="M4 19v-2M9 19v-5M14 19v-8M19 19V8"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  speed: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>',
  power: '<path d="M12 3.5v4M12 16.5v4M5 12H3.5M20.5 12H19"/><circle cx="12" cy="12" r="4.5"/>',
  activity: '<path d="M3 12h4l2.5-6 5 12 2.5-6h4"/>',
  sliders: '<path d="M6 4v6M6 14v6M12 4v3M12 11v9M18 4v9M18 17v3M3.5 12h5M9.5 9h5M15.5 15h5"/>',
} as const;

export type IconName = keyof typeof paths;

export function icon(name: IconName, className = ''): string {
  const classes = className ? `t-ico ${className}` : 't-ico';
  return `<svg class="${classes}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
