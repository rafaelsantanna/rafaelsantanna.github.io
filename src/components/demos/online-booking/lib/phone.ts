/**
 * Brazilian mobile numbers: DDD (area code) plus 9 digits starting with 9. Landlines (8 digits after
 * the DDD) are recognized only to say so, since the field asks for a mobile.
 */
const areaCodes = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export type PhoneIssue = 'empty' | 'short' | 'ddd' | 'nine' | 'missingNine' | 'landline' | 'start';

/**
 * Keeps up to 11 national digits, dropping a leading trunk zero. A leading 55 is read as the +55
 * country code only when the text has a '+' or arrived in bulk (paste, autofill, drop): typed digit
 * by digit it is the area code, so one extra keystroke never turns (55) 98765-4321 into another number.
 */
export function phoneDigits(value: string, bulk: boolean): string {
  let digits = value.replace(/\D/g, '');
  const countryCode = bulk || value.includes('+');
  if (countryCode && digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
  return digits.replace(/^0+/, '').slice(0, 11);
}

/** Progressive mask: (11) 3456-7890 or (11) 98765-4321. */
export function formatPhone(digits: string): string {
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const rest = digits.slice(2);
  const head = rest.length > 8 ? 5 : 4;
  const area = `(${digits.slice(0, 2)}) `;
  return rest.length <= head ? `${area}${rest}` : `${area}${rest.slice(0, head)}-${rest.slice(head)}`;
}

export function phoneIssue(digits: string): PhoneIssue | null {
  if (!digits) return 'empty';
  if (digits.length < 10) return 'short';
  if (!areaCodes.has(Number(digits.slice(0, 2)))) return 'ddd';
  const first = digits[2];
  if (digits.length === 11) return first === '9' ? null : 'nine';
  if (first >= '6') return 'missingNine';
  return first >= '2' ? 'landline' : 'start';
}

/** Caret position right after the given number of digits in a formatted value. */
export function caretAfterDigits(formatted: string, count: number): number {
  if (count <= 0) return formatted.startsWith('(') ? 1 : 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index += 1) {
    if (formatted[index] >= '0' && formatted[index] <= '9') {
      seen += 1;
      if (seen === count) return index + 1;
    }
  }
  return formatted.length;
}
