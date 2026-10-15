import type { Locale } from '@/data/types';
import { corpusEn } from './en';
import { corpusPt } from './pt';
import type { KbCorpus } from './types';

export function corpusFor(locale: Locale): KbCorpus {
  return locale === 'pt' ? corpusPt : corpusEn;
}
