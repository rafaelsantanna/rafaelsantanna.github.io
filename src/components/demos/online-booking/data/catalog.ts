import type { Locale, LocalizedText } from '@/data/types';
import type { BarberItem, Interval, ServiceItem, WeeklyHours } from './model';

/** Grid used for slot starts and for the shop-side occupancy stats. */
export const SLOT_STEP = 15;
/** Cleanup time kept between two appointments of the same barber. */
export const BUFFER_MINUTES = 10;
/** How many days ahead the booking flow offers. */
export const WINDOW_DAYS = 14;
/** The shop's clock: opening hours, today, and past times are read in this time zone. */
export const SHOP_TIME_ZONE = 'America/Sao_Paulo';

const at = (hours: number, minutes = 0): number => hours * 60 + minutes;
const weekday: Interval = { start: at(9), end: at(20) };

export const weeklyHours: WeeklyHours = [null, null, weekday, weekday, weekday, weekday, { start: at(8), end: at(18) }];

interface ServiceSource {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  duration: number;
  price: number;
  includes?: string[];
}

const serviceSource: ServiceSource[] = [
  {
    id: 'corte',
    name: { pt: 'Corte', en: 'Haircut' },
    description: {
      pt: 'Tesoura e máquina, lavagem e finalização com o produto certo para o seu cabelo.',
      en: 'Scissors and clippers, a wash, and a finish with the right product for your hair.',
    },
    duration: 40,
    price: 55,
  },
  {
    id: 'barba',
    name: { pt: 'Barba', en: 'Beard' },
    description: {
      pt: 'Toalha quente, navalha e balm. Contorno alinhado sem irritar a pele.',
      en: 'Hot towel, straight razor, and balm. A clean line without irritating the skin.',
    },
    duration: 30,
    price: 40,
  },
  {
    id: 'corte-barba',
    name: { pt: 'Corte + barba', en: 'Haircut + beard' },
    description: {
      pt: 'O combo completo, por R$ 10 a menos do que os dois separados.',
      en: 'The full combo, R$10 less than booking both separately.',
    },
    duration: 70,
    price: 85,
    includes: ['corte', 'barba'],
  },
  {
    id: 'pezinho',
    name: { pt: 'Pezinho', en: 'Neck trim' },
    description: {
      pt: 'Acabamento da nuca e das laterais entre um corte e outro.',
      en: 'Neck and sides tidied up between haircuts.',
    },
    duration: 15,
    price: 20,
  },
  {
    id: 'sobrancelha',
    name: { pt: 'Sobrancelha', en: 'Eyebrows' },
    description: {
      pt: 'Limpeza e alinhamento discretos, na navalha ou na pinça.',
      en: 'A discreet cleanup and shape, with razor or tweezers.',
    },
    duration: 15,
    price: 20,
  },
  {
    id: 'hidratacao',
    name: { pt: 'Hidratação de barba', en: 'Beard treatment' },
    description: {
      pt: 'Vapor, máscara e óleo para a barba ficar macia e sem frizz.',
      en: 'Steam, mask, and oil for a soft, frizz-free beard.',
    },
    duration: 25,
    price: 35,
  },
];

interface BarberSource {
  id: string;
  name: string;
  initials: string;
  specialty: LocalizedText;
  bio: LocalizedText;
  days: number[];
  breaks: Interval[];
  daysLabel: LocalizedText;
}

const barberSource: BarberSource[] = [
  {
    id: 'davi',
    name: 'Davi Moreira',
    initials: 'DM',
    specialty: { pt: 'Degradê e cortes curtos', en: 'Fades and short cuts' },
    bio: {
      pt: 'Acabamento na navalha e paciência para acertar o degradê de primeira.',
      en: 'Razor finishing and the patience to get a fade right the first time.',
    },
    days: [2, 3, 4, 5, 6],
    breaks: [{ start: at(12, 30), end: at(13, 30) }],
    daysLabel: { pt: 'Terça a sábado', en: 'Tuesday to Saturday' },
  },
  {
    id: 'caio',
    name: 'Caio Ribeiro',
    initials: 'CR',
    specialty: { pt: 'Barba e navalha', en: 'Beards and straight razor' },
    bio: {
      pt: 'Toalha quente, desenho de barba e cuidado com pele sensível.',
      en: 'Hot towels, beard shaping, and care for sensitive skin.',
    },
    days: [3, 4, 5, 6],
    breaks: [{ start: at(13), end: at(14) }],
    daysLabel: { pt: 'Quarta a sábado', en: 'Wednesday to Saturday' },
  },
  {
    id: 'jonas',
    name: 'Jonas Teixeira',
    initials: 'JT',
    specialty: { pt: 'Cabelo crespo e cacheado', en: 'Coily and curly hair' },
    bio: {
      pt: 'Corte na tesoura pensado para o formato de cada fio.',
      en: 'Scissor cuts designed around the shape of each curl.',
    },
    days: [2, 4, 5, 6],
    breaks: [{ start: at(12), end: at(13) }],
    daysLabel: { pt: 'Terça, quinta, sexta e sábado', en: 'Tuesday, Thursday, Friday, and Saturday' },
  },
];

export function localizedServices(locale: Locale): ServiceItem[] {
  return serviceSource.map((service) => ({
    id: service.id,
    name: service.name[locale],
    description: service.description[locale],
    duration: service.duration,
    price: service.price,
    includes: service.includes ?? [],
  }));
}

export function localizedBarbers(locale: Locale): BarberItem[] {
  return barberSource.map((barber) => ({
    id: barber.id,
    name: barber.name,
    firstName: barber.name.split(' ')[0],
    initials: barber.initials,
    specialty: barber.specialty[locale],
    bio: barber.bio[locale],
    days: barber.days,
    breaks: barber.breaks,
    daysLabel: barber.daysLabel[locale],
  }));
}
