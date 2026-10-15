import type { ClientStrings } from '../data/i18n';
import { NOTE_MAX, nameIssue, type Draft } from '../lib/flow';
import { fill } from '../lib/format';
import { icons } from '../lib/icons';
import { caretAfterDigits, formatPhone, phoneDigits, phoneIssue } from '../lib/phone';
import { markup } from './dom';
import type { FlowElements } from './flow-elements';

type Field = 'name' | 'phone';

interface DetailsHooks {
  draft(): Draft;
  update(patch: Partial<Draft>): void;
  submit(): void;
}

/**
 * Name, phone, and note fields: Brazilian phone mask with caret handling, validation shown
 * after a field is left or on Continue, and Enter to move on.
 */
export function bindDetails(el: FlowElements, t: ClientStrings, hooks: DetailsHooks) {
  const touched: Record<Field, boolean> = { name: false, phone: false };
  const inputs: Record<Field, HTMLInputElement> = { name: el.name, phone: el.phone };
  const errors: Record<Field, HTMLElement> = { name: el.nameError, phone: el.phoneError };

  function message(field: Field, draft: Draft): string {
    if (field === 'name') {
      const issue = nameIssue(draft.name);
      return issue === 'empty' ? t.nameEmpty : issue === 'short' ? t.nameShort : '';
    }
    const issue = phoneIssue(draft.phone);
    return issue ? fill(t.phone[issue], { ddd: draft.phone.slice(0, 2) }) : '';
  }

  function showErrors(): void {
    const draft = hooks.draft();
    (['name', 'phone'] as const).forEach((field) => {
      const text = touched[field] ? message(field, draft) : '';
      errors[field].replaceChildren(...(text ? [markup(icons.alert), text] : []));
      if (text) inputs[field].setAttribute('aria-invalid', 'true');
      else inputs[field].removeAttribute('aria-invalid');
    });
  }

  function countNote(): void {
    el.noteCount.textContent = fill(t.noteCount, { n: el.note.value.length, max: NOTE_MAX });
  }

  function setPhone(digits: string, caretDigits: number): void {
    el.phone.value = formatPhone(digits);
    const position = caretAfterDigits(el.phone.value, caretDigits);
    el.phone.setSelectionRange(position, position);
    hooks.update({ phone: digits });
    if (touched.phone) showErrors();
  }

  el.name.addEventListener('input', () => {
    hooks.update({ name: el.name.value });
    if (touched.name) showErrors();
  });

  el.phone.addEventListener('input', () => {
    const raw = el.phone.value;
    // More than one new digit in a single event means paste, autofill, or drop rather than typing.
    const bulk = raw.replace(/\D/g, '').length - hooks.draft().phone.length > 1;
    const digits = phoneDigits(raw, bulk);
    const caret = el.phone.selectionStart ?? raw.length;
    const before = raw.slice(0, caret).replace(/\D/g, '').length;
    setPhone(digits, bulk ? digits.length : Math.min(before, digits.length));
  });

  // Backspace right after a mask character removes the digit before it instead of getting stuck.
  el.phone.addEventListener('keydown', (event) => {
    if (event.key !== 'Backspace' || el.phone.selectionStart !== el.phone.selectionEnd) return;
    const caret = el.phone.selectionStart ?? 0;
    const previous = el.phone.value[caret - 1];
    if (caret === 0 || previous === undefined || /\d/.test(previous)) return;
    event.preventDefault();
    const index = el.phone.value.slice(0, caret).replace(/\D/g, '').length;
    if (index === 0) return;
    const digits = hooks.draft().phone;
    setPhone(digits.slice(0, index - 1) + digits.slice(index), index - 1);
  });

  el.note.addEventListener('input', () => {
    hooks.update({ note: el.note.value });
    countNote();
  });

  (['name', 'phone'] as const).forEach((field) => {
    inputs[field].addEventListener('blur', () => {
      if (inputs[field].value.trim()) touched[field] = true;
      showErrors();
    });
    inputs[field].addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.isComposing) return;
      event.preventDefault();
      hooks.submit();
    });
  });

  return {
    fill(draft: Draft): void {
      el.name.value = draft.name;
      el.phone.value = formatPhone(draft.phone);
      el.note.value = draft.note;
      countNote();
      showErrors();
    },
    /** Marks both fields as visited, shows any errors, and focuses the first invalid one. */
    validate(): boolean {
      touched.name = true;
      touched.phone = true;
      showErrors();
      const draft = hooks.draft();
      const invalid = (['name', 'phone'] as const).find((field) => message(field, draft));
      if (invalid) inputs[invalid].focus();
      return !invalid;
    },
    reset(): void {
      touched.name = false;
      touched.phone = false;
    },
  };
}
