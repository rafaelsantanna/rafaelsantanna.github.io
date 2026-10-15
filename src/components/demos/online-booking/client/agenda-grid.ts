import type { ClientStrings } from '../data/i18n';
import type { Appointment, BarberItem } from '../data/model';
import { worksOn, type DayFrame } from '../lib/availability';
import { fill, type Format } from '../lib/format';
import { clockLabel, type Clock } from '../lib/time';
import { h } from './dom';

interface GridEnv {
  barbers: readonly BarberItem[];
  t: ClientStrings['agenda'];
  fmt: Format;
  serviceNames(ids: readonly string[]): string;
}

/**
 * The day as a timeline: one column per barber, blocks positioned by minutes through CSS
 * custom properties. Each column is also a plain list for screen readers.
 */
export function buildTimeline(frame: DayFrame, appointments: readonly Appointment[], clock: Clock, env: GridEnv): HTMLElement {
  const { t, fmt } = env;
  const hours = frame.hours ?? { start: 0, end: 0 };
  const offset = (minutes: number): number => minutes - hours.start;
  const block = (start: number, end: number): string => `--at: ${offset(start)}; --len: ${end - start}`;

  const marks: HTMLElement[] = [];
  for (let minutes = hours.start; minutes <= hours.end; minutes += 60) {
    marks.push(h('span', { class: 'tl__hour', style: `--at: ${offset(minutes)}` }, clockLabel(minutes)));
  }

  const appointmentItem = (appointment: Appointment): HTMLElement => {
    const services = env.serviceNames(appointment.serviceIds);
    const label = fill(appointment.own ? t.ownLabel : t.apptLabel, {
      start: clockLabel(appointment.start),
      end: clockLabel(appointment.end),
      services,
      client: appointment.client,
    });
    const length = appointment.end - appointment.start;
    return h(
      'li',
      {
        class: appointment.own ? 'appt appt--own' : 'appt',
        style: block(appointment.start, appointment.end),
        'data-size': length < 30 ? 'xs' : length < 45 ? 's' : null,
        'data-own': appointment.own || null,
        tabindex: appointment.own ? '-1' : null,
      },
      h('span', { class: 'sr-only' }, label),
      h(
        'span',
        { class: 'appt__line', 'aria-hidden': 'true' },
        h('span', { class: 'appt__time' }, clockLabel(appointment.start)),
        h('span', { class: 'appt__client' }, appointment.own ? t.yours : appointment.client),
      ),
      h('span', { class: 'appt__svc', 'aria-hidden': 'true' }, appointment.own ? `${services} · ${appointment.client}` : services),
    );
  };

  const columns = env.barbers.map((barber) => {
    const working = worksOn(barber, frame.weekday);
    const own = appointments.filter((appointment) => appointment.barberId === barber.id);
    const headId = `cp-col-${barber.id}`;
    const items: HTMLElement[] = working
      ? [
          ...barber.breaks.map((pause) =>
            h(
              'li',
              { class: 'appt appt--pause', style: block(pause.start, pause.end) },
              h('span', { class: 'sr-only' }, fill(t.pauseLabel, { start: clockLabel(pause.start), end: clockLabel(pause.end) })),
              h('span', { class: 'appt__line', 'aria-hidden': 'true' }, h('span', { class: 'appt__client' }, t.pause)),
            ),
          ),
          ...own.map(appointmentItem),
        ]
      : [h('li', { class: 'appt appt--off', style: block(hours.start, hours.end) }, h('span', {}, fill(t.offLabel, { name: barber.firstName })))];
    if (working && !own.length) items.push(h('li', { class: 'sr-only' }, t.empty));
    return h(
      'section',
      { class: working ? 'tl__col' : 'tl__col is-off', 'aria-labelledby': headId },
      h(
        'header',
        { class: 'tl__head' },
        h('span', { class: 'avatar avatar--sm', 'data-tone': barber.id, 'aria-hidden': 'true' }, h('span', {}, barber.initials)),
        h('span', { class: 'tl__who' }, h('h3', { id: headId }, barber.name), h('span', { class: 'tl__count' }, working ? fmt.count(t.count, own.length) : t.off)),
      ),
      h('ol', { class: 'tl__body', role: 'list' }, ...items),
    );
  });

  const showNow = frame.day === clock.day && clock.minutes >= hours.start && clock.minutes <= hours.end;
  const now = showNow
    ? h('div', { class: 'tl__now', style: `--at: ${offset(clock.minutes)}`, 'aria-hidden': 'true', 'data-now': true }, h('span', {}, `${t.now} ${clockLabel(clock.minutes)}`))
    : null;

  return h(
    'div',
    { class: 'tl', style: `--span: ${hours.end - hours.start}` },
    h('div', { class: 'tl__gutter', 'aria-hidden': 'true' }, ...marks),
    h('div', { class: 'tl__cols' }, ...columns, now),
  );
}
