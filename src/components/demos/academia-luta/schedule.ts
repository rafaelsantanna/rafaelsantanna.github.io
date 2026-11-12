import type { Locale } from '@/data/content';

export type ModalityId = 'jj' | 'nogi' | 'mt' | 'kids' | 'fem';
export type LevelId = 'iniciante' | 'todos' | 'avancado';
export type PeriodId = 'manha' | 'almoco' | 'tarde' | 'noite';
export type DayId = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

type Text = Record<Locale, string>;

interface ClassSlot {
  days: DayId[];
  time: string;
  period: PeriodId;
  modality: ModalityId;
  level: LevelId;
  minutes: number;
  note?: Text;
}

export const days: { id: DayId; name: Text; short: Text }[] = [
  { id: 'seg', name: { pt: 'Segunda', en: 'Monday' }, short: { pt: 'Seg', en: 'Mon' } },
  { id: 'ter', name: { pt: 'Terça', en: 'Tuesday' }, short: { pt: 'Ter', en: 'Tue' } },
  { id: 'qua', name: { pt: 'Quarta', en: 'Wednesday' }, short: { pt: 'Qua', en: 'Wed' } },
  { id: 'qui', name: { pt: 'Quinta', en: 'Thursday' }, short: { pt: 'Qui', en: 'Thu' } },
  { id: 'sex', name: { pt: 'Sexta', en: 'Friday' }, short: { pt: 'Sex', en: 'Fri' } },
  { id: 'sab', name: { pt: 'Sábado', en: 'Saturday' }, short: { pt: 'Sáb', en: 'Sat' } },
];

export const periods: { id: PeriodId; name: Text }[] = [
  { id: 'manha', name: { pt: 'Manhã', en: 'Morning' } },
  { id: 'almoco', name: { pt: 'Almoço', en: 'Lunch' } },
  { id: 'tarde', name: { pt: 'Fim de tarde', en: 'Late afternoon' } },
  { id: 'noite', name: { pt: 'Noite', en: 'Evening' } },
];

export const modalities: { id: ModalityId; name: Text }[] = [
  { id: 'jj', name: { pt: 'Jiu-jitsu', en: 'Jiu-jitsu' } },
  { id: 'nogi', name: { pt: 'No-gi', en: 'No-gi' } },
  { id: 'mt', name: { pt: 'Muay Thai', en: 'Muay Thai' } },
  { id: 'kids', name: { pt: 'Kids', en: 'Kids' } },
  { id: 'fem', name: { pt: 'Feminino', en: 'Women only' } },
];

export const levels: { id: LevelId; name: Text }[] = [
  { id: 'iniciante', name: { pt: 'Iniciante', en: 'Beginner' } },
  { id: 'todos', name: { pt: 'Todos os níveis', en: 'All levels' } },
  { id: 'avancado', name: { pt: 'Avançado', en: 'Advanced' } },
];

const kidsYoung: Text = { pt: '4 a 7 anos', en: 'Ages 4 to 7' };
const kidsOlder: Text = { pt: '8 a 13 anos', en: 'Ages 8 to 13' };

const slots: ClassSlot[] = [
  { days: ['seg', 'qua', 'sex'], time: '06:30', period: 'manha', modality: 'jj', level: 'todos', minutes: 60 },
  { days: ['ter', 'qui'], time: '07:00', period: 'manha', modality: 'mt', level: 'todos', minutes: 60 },
  { days: ['sab'], time: '09:00', period: 'manha', modality: 'kids', level: 'todos', minutes: 60, note: { pt: '4 a 13 anos', en: 'Ages 4 to 13' } },
  { days: ['sab'], time: '10:15', period: 'manha', modality: 'fem', level: 'todos', minutes: 60 },
  { days: ['sab'], time: '11:30', period: 'manha', modality: 'jj', level: 'todos', minutes: 90, note: { pt: 'Treino livre', en: 'Open mat' } },
  { days: ['seg', 'qua', 'sex'], time: '12:00', period: 'almoco', modality: 'mt', level: 'todos', minutes: 50 },
  { days: ['ter', 'qui'], time: '12:00', period: 'almoco', modality: 'nogi', level: 'todos', minutes: 50 },
  { days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '17:00', period: 'tarde', modality: 'kids', level: 'todos', minutes: 50, note: kidsYoung },
  { days: ['seg', 'ter', 'qua', 'qui', 'sex'], time: '18:00', period: 'tarde', modality: 'kids', level: 'todos', minutes: 60, note: kidsOlder },
  { days: ['ter', 'qui'], time: '18:00', period: 'tarde', modality: 'fem', level: 'todos', minutes: 60 },
  { days: ['seg', 'qua'], time: '19:00', period: 'noite', modality: 'jj', level: 'iniciante', minutes: 60 },
  { days: ['ter', 'qui'], time: '19:00', period: 'noite', modality: 'mt', level: 'iniciante', minutes: 60 },
  { days: ['sex'], time: '19:00', period: 'noite', modality: 'jj', level: 'todos', minutes: 60 },
  { days: ['seg', 'qua'], time: '20:15', period: 'noite', modality: 'jj', level: 'avancado', minutes: 75 },
  { days: ['ter', 'qui'], time: '20:15', period: 'noite', modality: 'nogi', level: 'avancado', minutes: 75 },
  { days: ['sex'], time: '20:15', period: 'noite', modality: 'mt', level: 'todos', minutes: 60 },
];

export interface ScheduleCell {
  day: DayId;
  time: string;
  modality: ModalityId;
  level: LevelId;
  minutes: number;
  note?: Text;
}

/** Classes for one day and period, sorted by start time. */
export function classesFor(day: DayId, period: PeriodId): ScheduleCell[] {
  return slots
    .filter((slot) => slot.period === period && slot.days.includes(day))
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(({ time, modality, level, minutes, note }) => ({ day, time, modality, level, minutes, note }));
}

export const weeklyClassCount = slots.reduce((sum, slot) => sum + slot.days.length, 0);
