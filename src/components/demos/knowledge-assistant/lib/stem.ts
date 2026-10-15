import type { Lang } from './lang';

// Light suffix stripping, not full morphology: the goal is that "reembolso", "reembolsos",
// "reembolsado" and "reembolsar" share one stem, while short words stay untouched.
const MIN_STEM = 3;

type Rule = readonly [suffix: string, replacement: string];

const PT_PLURAL: Rule[] = [
  ['oes', 'ao'], ['aes', 'ao'], ['ais', 'al'], ['eis', 'el'], ['ois', 'ol'],
  ['ns', 'm'], ['res', 'r'], ['ses', 's'], ['zes', 'z'],
];

// Short words that keep their final vowel: without it they would meet an unrelated word
// ("mesa" and "mês", "casa" and "casamento", "leve" and "levar").
const PT_KEEP = new Set(['mesa', 'casa', 'leve']);

// Irregular forms of "pedir", the verb behind most questions ("Como peço férias?").
const PT_IRREGULAR = new Map([['peco', 'ped'], ['peca', 'ped'], ['pecam', 'ped']]);

// Longest first. Nouns built from verbs and common verb endings collapse to the same root.
// No "idade": it would turn "novidade" into "nov", the stem of "novo".
const PT_SUFFIXES = [
  'amento', 'imento', 'mente', 'aram', 'eram', 'iram', 'acao', 'ador', 'edor', 'idor', 'avel', 'ivel',
  'ista', 'ismo', 'ando', 'endo', 'indo', 'ado', 'ada', 'ido', 'ida', 'oso', 'osa', 'ivo', 'iva',
  'ar', 'er', 'ir', 'ei', 'ou',
];

// Irregular forms that questions use while the policies use the regular ones ("paid" and "pays").
const EN_IRREGULAR = new Map([['paid', 'pay'], ['lost', 'lose'], ['loss', 'lose']]);

const EN_SUFFIXES = ['ation', 'ement', 'ment', 'ness', 'able', 'ible', 'ing', 'ed', 'ly', 'al', 'er'];
// These endings also close plain words ("apply", "total", "paper"), so they need a longer stem:
// otherwise "apply" would become "app" and match the desk booking app.
const EN_SHORT_ENDINGS = new Set(['ly', 'al', 'er']);
const enMinStem = (suffix: string) => (EN_SHORT_ENDINGS.has(suffix) ? MIN_STEM + 1 : MIN_STEM);

function replaceSuffix(word: string, rules: readonly Rule[]): string | null {
  for (const [suffix, replacement] of rules) {
    if (word.endsWith(suffix) && word.length - suffix.length >= MIN_STEM - 1) {
      return word.slice(0, -suffix.length) + replacement;
    }
  }
  return null;
}

function stripSuffix(word: string, suffixes: readonly string[], minStem: (suffix: string) => number = () => MIN_STEM): string {
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= minStem(suffix)) return word.slice(0, -suffix.length);
  }
  return word;
}

function stemPt(word: string): string {
  const irregular = PT_IRREGULAR.get(word);
  if (irregular) return irregular;
  let stem = replaceSuffix(word, PT_PLURAL) ?? word;
  // A plain final "s" is a plural unless it follows s, u or i (país, bônus, lápis).
  if (stem === word && /[^siu]s$/.test(stem) && stem.length > MIN_STEM) stem = stem.slice(0, -1);
  stem = stripSuffix(stem, PT_SUFFIXES);
  // Final vowel, including the "i" of first person past forms (recebi, perdi).
  if (/[aeo]$|[^aeiou]i$/.test(stem) && stem.length > MIN_STEM && !PT_KEEP.has(stem)) stem = stem.slice(0, -1);
  return stem;
}

function stemEn(word: string): string {
  const irregular = EN_IRREGULAR.get(word);
  if (irregular) return irregular;
  let stem = word;
  if (stem.endsWith('sses')) stem = stem.slice(0, -2);
  else if (stem.endsWith('ies') && stem.length > 4) stem = `${stem.slice(0, -3)}y`;
  else if (/(ch|sh|x|z|ss)es$/.test(stem)) stem = stem.slice(0, -2);
  else if (/[^siu]s$/.test(stem) && stem.length > MIN_STEM) stem = stem.slice(0, -1);
  const stripped = stripSuffix(stem, EN_SUFFIXES, enMinStem);
  if (stripped !== stem && /(ing|ed)$/.test(stem) && /([^aeiouls])\1$/.test(stripped)) stem = stripped.slice(0, -1);
  else stem = stripped;
  if (stem.endsWith('e') && stem.length > MIN_STEM + 1) stem = stem.slice(0, -1);
  return stem;
}

export function stem(word: string, lang: Lang): string {
  if (word.length <= MIN_STEM || /^\d/.test(word)) return word;
  return lang === 'pt' ? stemPt(word) : stemEn(word);
}
