import { zonedInstant } from './time';

export interface CalendarEvent {
  uid: string;
  day: string;
  start: number;
  duration: number;
  /** IANA time zone that `day` and `start` are read in. */
  timeZone: string;
  title: string;
  description: string;
  stamp: Date;
}

const escapeText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** RFC 5545 limits lines to 75 octets; continuation lines start with a space. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const width = encoder.encode(char).length;
    if (size + width > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += width;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const utcTime = (date: Date): string => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** The shop's wall-clock time written in UTC, so calendars in any time zone show the real moment. */
const shopTime = (event: CalendarEvent, minutes: number): string => utcTime(zonedInstant(event.day, minutes, event.timeZone));

export function buildIcs(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Corte e Prosa//Demo//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${utcTime(event.stamp)}`,
    `DTSTART:${shopTime(event, event.start)}`,
    `DTEND:${shopTime(event, event.start + event.duration)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
