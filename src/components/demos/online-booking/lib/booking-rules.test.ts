// Scheduling and phone rules of the booking demo. Run with:
// node --test src/components/demos/online-booking/lib/booking-rules.test.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BUFFER_MINUTES, SLOT_STEP, weeklyHours } from '../data/catalog.ts';
import type { Appointment, Interval } from '../data/model';
import { clashes, dayState, dayStats, fitsBarber, listSlots, type DayFrame, type Schedule, type Slot, type SlotRules } from './availability.ts';
import { caretAfterDigits, formatPhone, phoneDigits, phoneIssue } from './phone.ts';
import type { Clock } from './time';

const at = (hours: number, minutes = 0): number => hours * 60 + minutes;

// Same shape as the catalog team: Ana works Tue-Sat, Bruno Wed-Sat, Caio Tue and Thu-Sat.
const ana: Schedule = { id: 'ana', days: [2, 3, 4, 5, 6], breaks: [{ start: at(12, 30), end: at(13, 30) }] };
const bruno: Schedule = { id: 'bruno', days: [3, 4, 5, 6], breaks: [{ start: at(13), end: at(14) }] };
const caio: Schedule = { id: 'caio', days: [2, 4, 5, 6], breaks: [{ start: at(12), end: at(13) }] };
const team = [ana, bruno, caio];
const solo: Schedule = { id: 'solo', days: [0, 1, 2, 3, 4, 5, 6], breaks: [] };

const TUESDAY = '2026-10-20';
const WEDNESDAY = '2026-10-21';
const tuesday: DayFrame = { day: TUESDAY, weekday: 2, hours: weeklyHours[2] };
const wednesday: DayFrame = { day: WEDNESDAY, weekday: 3, hours: weeklyHours[3] };
const shortDay: DayFrame = { day: TUESDAY, weekday: 2, hours: { start: at(9), end: at(10) } };
const dayBefore: Clock = { day: '2026-10-19', minutes: at(23, 59) };
const dayAfter: Clock = { day: '2026-10-21', minutes: 0 };

const rules = (duration: number): SlotRules => ({ duration, buffer: BUFFER_MINUTES, step: SLOT_STEP });

function booked(barberId: string, start: number, end: number, own = false): Appointment {
  return { id: `${barberId}-${start}`, barberId, day: TUESDAY, start, end, serviceIds: ['cut'], client: 'Client', own };
}

function slotAt(slots: Slot[], start: number): Slot {
  const slot = slots.find((item) => item.start === start);
  assert.ok(slot, `no slot at ${start}`);
  return slot;
}

const statuses = (slots: Slot[], starts: number[]) => starts.map((start) => slotAt(slots, start).status);

describe('clashes: the 10 minute buffer between appointments of the same barber', () => {
  const appointment: Interval = { start: at(10), end: at(10, 30) };

  it('needs a gap of at least the buffer on both sides, in either argument order', () => {
    assert.equal(BUFFER_MINUTES, 10);
    const cases: Array<[Interval, boolean]> = [
      [{ start: at(10, 40), end: at(11, 10) }, false],
      [{ start: at(10, 39), end: at(11, 9) }, true],
      [{ start: at(9, 20), end: at(9, 50) }, false],
      [{ start: at(9, 21), end: at(9, 51) }, true],
      [{ start: at(10, 10), end: at(10, 20) }, true],
    ];
    for (const [other, expected] of cases) {
      assert.equal(clashes(other, appointment, BUFFER_MINUTES), expected, `${other.start}-${other.end}`);
      assert.equal(clashes(appointment, other, BUFFER_MINUTES), expected, `${other.start}-${other.end} reversed`);
    }
  });

  it('with no buffer only a real overlap clashes, so back-to-back is allowed', () => {
    assert.equal(clashes({ start: at(10, 30), end: at(11) }, appointment, 0), false);
    assert.equal(clashes({ start: at(10, 29), end: at(11) }, appointment, 0), true);
    assert.equal(clashes({ start: at(10, 30), end: at(11) }, appointment, BUFFER_MINUTES), true);
  });
});

describe('listSlots', () => {
  it('offers every start on the 15 minute grid that ends by closing time', () => {
    const slots = listSlots(tuesday, [solo], [], rules(30), dayBefore);
    const expected = Array.from({ length: 43 }, (_, index) => at(9) + index * SLOT_STEP);
    assert.deepEqual(slots.map((slot) => slot.start), expected);
    assert.ok(slots.every((slot) => slot.status === 'free'));
    // A 45 minute service must start by 19:15 to end at 20:00.
    assert.equal(listSlots(tuesday, [solo], [], rules(45), dayBefore).at(-1)?.start, at(19, 15));
    assert.equal(fitsBarber(solo, { start: at(9), end: at(20) }, [], at(8, 45), rules(30)), false);
    assert.equal(fitsBarber(solo, { start: at(9), end: at(20) }, [], at(19, 45), rules(30)), false);
  });

  it('marks slots busy when they fall within the buffer around an existing appointment', () => {
    const slots = listSlots(tuesday, [solo], [booked('solo', at(10), at(10, 30))], rules(30), dayBefore);
    const starts = [at(9, 15), at(9, 30), at(9, 45), at(10), at(10, 15), at(10, 30), at(10, 45)];
    assert.deepEqual(statuses(slots, starts), ['free', 'busy', 'busy', 'busy', 'busy', 'busy', 'free']);
  });

  it('accepts a gap of exactly 10 minutes before and after an appointment', () => {
    const slots = listSlots(tuesday, [solo], [booked('solo', at(10), at(10, 35))], rules(20), dayBefore);
    // 09:30 ends at 09:50 and 10:45 starts 10 minutes after 10:35.
    assert.deepEqual(statuses(slots, [at(9, 30), at(9, 45), at(10, 30), at(10, 45)]), ['free', 'busy', 'busy', 'free']);
  });

  it('ignores appointments that belong to another barber', () => {
    const slots = listSlots(tuesday, [solo], [booked('ana', at(10), at(10, 30))], rules(30), dayBefore);
    assert.equal(slotAt(slots, at(10)).status, 'free');
  });

  it('blocks slots that overlap a break, with no buffer needed next to the break', () => {
    const slots = listSlots(tuesday, [ana], [], rules(30), dayBefore);
    const starts = [at(12), at(12, 15), at(13), at(13, 15), at(13, 30)];
    assert.deepEqual(statuses(slots, starts), ['free', 'busy', 'busy', 'busy', 'free']);
  });

  it('marks slots before the current minute as past, keeping the current minute bookable', () => {
    const slots = listSlots(tuesday, [ana], [], rules(30), { day: TUESDAY, minutes: at(14) });
    assert.deepEqual(slotAt(slots, at(13, 45)), { start: at(13, 45), status: 'past', freeBarbers: [] });
    assert.deepEqual(slotAt(slots, at(14)), { start: at(14), status: 'free', freeBarbers: ['ana'] });
    assert.ok(listSlots(tuesday, [ana], [], rules(30), dayAfter).every((slot) => slot.status === 'past'));
    assert.ok(listSlots(tuesday, [ana], [], rules(30), dayBefore).every((slot) => slot.status !== 'past'));
  });

  it('returns nothing on a closed day, for a missing service, or with no barber working', () => {
    const sunday: DayFrame = { day: '2026-10-18', weekday: 0, hours: weeklyHours[0] };
    assert.equal(sunday.hours, null);
    assert.deepEqual(listSlots(sunday, team, [], rules(30), dayBefore), []);
    assert.deepEqual(listSlots(tuesday, team, [], rules(0), dayBefore), []);
    assert.deepEqual(listSlots(tuesday, [bruno], [], rules(30), dayBefore), []);
  });

  it('is deterministic and leaves its inputs untouched', () => {
    const appointments = Object.freeze([Object.freeze(booked('ana', at(10), at(10, 30))), Object.freeze(booked('caio', at(15), at(16)))]);
    const candidates = Object.freeze(team.map((barber) => Object.freeze({ ...barber })));
    const clock = Object.freeze({ day: TUESDAY, minutes: at(11) });
    const first = listSlots(tuesday, candidates, appointments, rules(30), clock);
    const second = listSlots(tuesday, candidates, appointments, rules(30), clock);
    assert.deepEqual(first, second);
    assert.notEqual(first, second);
  });
});

describe('any barber assignment', () => {
  it('lists free barbers in team order and skips anyone off that weekday', () => {
    const slots = listSlots(tuesday, team, [], rules(30), dayBefore);
    assert.deepEqual(slotAt(slots, at(10)).freeBarbers, ['ana', 'caio']);
    assert.ok(slots.every((slot) => !slot.freeBarbers.includes('bruno')));
  });

  it('falls through to the next barber when the first is booked or on a break', () => {
    const booking = listSlots(tuesday, team, [booked('ana', at(10), at(10, 30))], rules(30), dayBefore);
    assert.deepEqual(slotAt(booking, at(10)).freeBarbers, ['caio']);
    const lunch = listSlots(wednesday, team, [], rules(30), dayBefore);
    assert.deepEqual(slotAt(lunch, at(12, 30)).freeBarbers, ['bruno']);
  });

  it('is busy only when no candidate can take it, and a chosen barber limits the candidates', () => {
    const both = [booked('ana', at(10), at(10, 30)), booked('caio', at(10), at(10, 30))];
    assert.deepEqual(slotAt(listSlots(tuesday, team, both, rules(30), dayBefore), at(10)), { start: at(10), status: 'busy', freeBarbers: [] });
    const onlyCaio = listSlots(tuesday, [caio], [booked('caio', at(10), at(10, 30))], rules(30), dayBefore);
    assert.equal(slotAt(onlyCaio, at(10)).status, 'busy');
  });
});

describe('dayState', () => {
  it('is closed when the shop has no hours and off when no candidate works that weekday', () => {
    const monday: DayFrame = { day: '2026-10-19', weekday: 1, hours: weeklyHours[1] };
    assert.deepEqual(dayState(monday, team, [], rules(30), dayBefore), { kind: 'closed' });
    assert.deepEqual(dayState(tuesday, [bruno], [], rules(30), dayBefore), { kind: 'off' });
  });

  it('is open with the free count, full when the rest is taken, and over once every slot is past', () => {
    assert.deepEqual(dayState(shortDay, [solo], [], rules(30), dayBefore), { kind: 'open', free: 3 });
    // 09:00 to 09:15 leaves only 09:30 with the 10 minute buffer.
    assert.deepEqual(dayState(shortDay, [solo], [booked('solo', at(9), at(9, 15))], rules(30), dayBefore), { kind: 'open', free: 1 });
    const lateMorning: Clock = { day: TUESDAY, minutes: at(9, 20) };
    assert.deepEqual(dayState(shortDay, [solo], [booked('solo', at(9, 30), at(10))], rules(30), lateMorning), { kind: 'full' });
    assert.deepEqual(dayState(shortDay, [solo], [], rules(30), dayAfter), { kind: 'over' });
  });
});

describe('dayStats', () => {
  it('counts occupancy per working barber on the step grid, leaving breaks out', () => {
    const appointments = [booked('ana', at(10), at(10, 45)), booked('caio', at(15), at(15, 20), true)];
    // Ana and Caio each have 44 cells from 09:00 to 20:00 minus 4 break cells; Bruno is off on Tuesday.
    assert.deepEqual(dayStats(tuesday, team, appointments, SLOT_STEP), {
      appointments: 2,
      own: 1,
      total: 80,
      occupied: 5,
      free: 75,
      occupancy: 6,
    });
    const sunday: DayFrame = { day: '2026-10-18', weekday: 0, hours: null };
    assert.deepEqual(dayStats(sunday, team, appointments, SLOT_STEP), { appointments: 0, own: 0, total: 0, occupied: 0, free: 0, occupancy: 0 });
  });
});

describe('phoneDigits: country code 55 for pasted versus typed input', () => {
  it('drops a +55 country code from pasted or autofilled numbers', () => {
    assert.equal(phoneDigits('+55 11 98765-4321', true), '11987654321');
    assert.equal(phoneDigits('5511987654321', true), '11987654321');
    assert.equal(phoneDigits('+55 (55) 98765-4321', true), '55987654321');
    // A '+' marks a country code even when the event looks like typing.
    assert.equal(phoneDigits('+5511987654321', false), '11987654321');
  });

  it('reads a typed 55 as the area code, so an extra keystroke never shifts the number', () => {
    assert.equal(phoneDigits('(55) 98765-43211', false), '55987654321');
    assert.equal(phoneDigits('5511987654321', false), '55119876543');
    // A pasted national number with DDD 55 has only 11 digits and is kept.
    assert.equal(phoneDigits('(55) 98765-4321', true), '55987654321');
  });

  it('drops a leading trunk zero, ignores non-digits, and keeps at most 11 digits', () => {
    assert.equal(phoneDigits('(011) 98765-4321', true), '11987654321');
    assert.equal(phoneDigits('+55 0 11 98765-4321', true), '11987654321');
    assert.equal(phoneDigits('0 11 3456-7890', false), '1134567890');
    assert.equal(phoneDigits('11 98765-4321 ext 22', false), '11987654321');
    assert.equal(phoneDigits('call me', false), '');
  });
});

describe('formatPhone and caretAfterDigits', () => {
  it('applies the mask progressively while typing', () => {
    const expected: Record<string, string> = {
      '': '',
      '1': '(1',
      '11': '(11',
      '113': '(11) 3',
      '113456': '(11) 3456',
      '1134567': '(11) 3456-7',
      '1134567890': '(11) 3456-7890',
      '11987654321': '(11) 98765-4321',
    };
    for (const [digits, formatted] of Object.entries(expected)) assert.equal(formatPhone(digits), formatted, digits);
  });

  it('reads back the same digits from its own mask, typed or pasted', () => {
    for (const digits of ['1', '11', '113', '1134567890', '11987654321', '55987654321']) {
      assert.equal(phoneDigits(formatPhone(digits), false), digits);
      assert.equal(phoneDigits(formatPhone(digits), true), digits);
    }
  });

  it('puts the caret right after the nth digit, skipping mask characters', () => {
    const formatted = '(11) 98765-4321';
    const cases: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 6], [7, 10], [8, 12], [11, 15], [20, 15]];
    for (const [count, caret] of cases) assert.equal(caretAfterDigits(formatted, count), caret, `after ${count} digits`);
    assert.equal(caretAfterDigits('', 0), 0);
  });
});

describe('phoneIssue', () => {
  it('accepts an 11 digit mobile with a known DDD and a leading 9', () => {
    for (const digits of ['11987654321', '21987654321', '55987654321', '99987654321']) assert.equal(phoneIssue(digits), null, digits);
  });

  it('checks for empty, then too short, then an unknown DDD', () => {
    assert.equal(phoneIssue(''), 'empty');
    assert.equal(phoneIssue('119876543'), 'short');
    assert.equal(phoneIssue('209'), 'short');
    for (const digits of ['20987654321', '10987654321', '23987654321']) assert.equal(phoneIssue(digits), 'ddd', digits);
  });

  it('tells a landline, a mobile missing the 9, and an invalid first digit apart', () => {
    const expected: Record<string, string> = {
      '1134567890': 'landline',
      '1124567890': 'landline',
      '1158765432': 'landline',
      '1168765432': 'missingNine',
      '1198765432': 'missingNine',
      '1118765432': 'start',
      '1108765432': 'start',
      '11876543210': 'nine',
      '11187654321': 'nine',
    };
    for (const [digits, issue] of Object.entries(expected)) assert.equal(phoneIssue(digits), issue, digits);
  });
});
