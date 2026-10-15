import type { Lang } from './lang';

/** One position of a phrase: any of these accent-folded words, or nothing when optional. */
interface Slot {
  words: readonly string[];
  optional?: boolean;
}

/**
 * A question form that asks for something the policies name with another word: "how long do I
 * have" asks for a deadline, but the policies say "within 30 days" under a "Deadlines" heading.
 */
interface Phrase {
  slots: readonly Slot[];
  /** Word searched in place of the phrase. */
  means: string;
}

const word = (...words: string[]): Slot => ({ words });
const maybe = (...words: string[]): Slot => ({ words, optional: true });

const PT_SUBJECT = maybe('eu', 'voce', 'nos', 'ele', 'ela');
const EN_SUBJECT = maybe('i', 'we', 'you', 'they', 'employees', 'people', 'one');

// Only forms that always ask for a deadline. "Quanto tempo de férias" asks for a duration and
// "em quanto tempo recebo" for a payment date, so both stay plain searches.
const phrases: Record<Lang, readonly Phrase[]> = {
  pt: [
    { slots: [word('quanto'), word('tempo'), PT_SUBJECT, word('tenho', 'tem', 'temos', 'ha')], means: 'prazo' },
    { slots: [word('ate'), word('quando')], means: 'prazo' },
  ],
  en: [
    { slots: [word('how'), word('long'), word('do', 'does'), EN_SUBJECT, word('have')], means: 'deadline' },
    { slots: [word('how'), word('much'), word('time'), word('do', 'does'), EN_SUBJECT, word('have')], means: 'deadline' },
    { slots: [word('by', 'until'), word('when')], means: 'deadline' },
  ],
};

/** Index right after the phrase when the slots match from `at`, or null. */
function matchFrom(norms: readonly string[], at: number, slots: readonly Slot[], slot = 0): number | null {
  if (slot === slots.length) return at;
  const { words, optional } = slots[slot];
  if (at < norms.length && words.includes(norms[at])) {
    const end = matchFrom(norms, at + 1, slots, slot + 1);
    if (end !== null) return end;
  }
  return optional ? matchFrom(norms, at, slots, slot + 1) : null;
}

export interface PhraseMatch {
  /** Index right after the last token of the phrase. */
  end: number;
  means: string;
}

/** The question form that starts at token `at`, if any. */
export function phraseAt(norms: readonly string[], at: number, lang: Lang): PhraseMatch | null {
  for (const phrase of phrases[lang]) {
    const end = matchFrom(norms, at, phrase.slots);
    if (end !== null) return { end, means: phrase.means };
  }
  return null;
}
