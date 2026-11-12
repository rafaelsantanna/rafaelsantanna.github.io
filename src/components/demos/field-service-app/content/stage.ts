import type { Locale } from '@/data/types';

/** Copy that only the presentation stage around the phone uses. It is rendered on the server and never shipped to the app. */
export const stageCopy: Record<Locale, { tagline: string; tryDone: string; tryProgress: string }> = {
  pt: {
    tagline: 'O app de campo que continua funcionando quando o sinal cai.',
    tryDone: 'feito',
    tryProgress: '{done} de {total} feitos',
  },
  en: {
    tagline: 'The field app that keeps working when the signal drops.',
    tryDone: 'done',
    tryProgress: '{done} of {total} done',
  },
};
