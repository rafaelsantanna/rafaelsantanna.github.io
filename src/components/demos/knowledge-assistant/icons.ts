// Inner markup of 24x24 stroke icons. Rendered on the server and cloned by the client from a <template>.
export const icons = {
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/>',
  doc: '<path d="M6.5 3h7.5l4.5 4.5V21h-12z"/><path d="M13.5 3v5h5"/><path d="M9.5 13h5M9.5 16.5h5"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  send: '<path d="M12 19V5"/><path d="m6.5 10.5 5.5-5.5 5.5 5.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.6v.4"/>',
  thumbUp: '<path d="M7.5 10.5V20H4.5v-9.5z"/><path d="M7.5 10.5 11.2 4a2 2 0 0 1 2.3 2v3.5h5a2 2 0 0 1 2 2.4l-1.3 6.2A2 2 0 0 1 17.2 20H7.5"/>',
  thumbDown: '<path d="M7.5 13.5V4H4.5v9.5z"/><path d="M7.5 13.5 11.2 20a2 2 0 0 0 2.3-2v-3.5h5a2 2 0 0 0 2-2.4l-1.3-6.2A2 2 0 0 0 17.2 4H7.5"/>',
  open: '<path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  handoff: '<circle cx="9" cy="8" r="3.25"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5 1.5 0 2.8.5 3.8 1.4"/><path d="M15 17h6M18.5 14.5 21 17l-2.5 2.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chevron: '<path d="m9.5 6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m15.5 15.5 4.5 4.5"/>',
} as const;

export type IconName = keyof typeof icons;
