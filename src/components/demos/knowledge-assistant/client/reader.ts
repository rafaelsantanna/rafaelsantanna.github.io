import { formatMonth } from '../lib/format';
import { fill } from '../strings';
import type { Ctx } from './context';
import { h, highlight, prefersReducedMotion } from './dom';

export interface ReaderTarget {
  /** Index of the passage to highlight in the engine's passage list. */
  passage: number;
  stems: ReadonlySet<string>;
  citation: number | null;
}

/** Document reader in a modal dialog, with the retrieved passage highlighted and in view. */
export function createReader(root: HTMLElement, ctx: Ctx) {
  const { t, engine } = ctx;
  const dialog = root.querySelector<HTMLDialogElement>('[data-ka-reader]');
  const title = root.querySelector<HTMLElement>('[data-ka-reader-title]');
  const meta = root.querySelector<HTMLElement>('[data-ka-reader-meta]');
  const body = root.querySelector<HTMLElement>('[data-ka-reader-body]');
  const close = root.querySelector<HTMLButtonElement>('[data-ka-reader-close]');
  let opener: HTMLElement | null = null;

  close?.addEventListener('click', () => dialog?.close());
  // A click on the backdrop lands on the dialog element itself.
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    opener = null;
  });

  function open(docId: string, target: ReaderTarget | null = null): void {
    const doc = ctx.docs.get(docId);
    if (!dialog || !title || !meta || !body || !doc) return;
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const passage = target ? engine.passages[target.passage] : null;
    let focusTarget: HTMLElement | null = null;

    title.textContent = doc.title;
    meta.textContent = fill(t.readerMeta, { team: doc.owner, date: formatMonth(doc.updated, ctx.lang), n: doc.sections.length });
    body.replaceChildren(
      h('p', { class: 'ka-reader__summary' }, doc.summary),
      ...doc.sections.map((section) => h('section', { class: 'ka-reader__section' },
        h('h3', {}, section.heading),
        ...section.paragraphs.map((text, paragraph) => {
          const isTarget = passage?.docId === doc.id && passage.sectionId === section.id && passage.paragraph === paragraph;
          if (!isTarget || !target) return h('p', {}, text);
          const flag = target.citation ? fill(t.readerCited, { n: target.citation }) : t.readerRetrieved;
          focusTarget = h('p', { class: 'ka-reader__target', tabindex: -1 },
            h('span', { class: 'ka-reader__flag' }, flag),
            highlight(text, target.stems, ctx.lang),
          );
          return focusTarget;
        }),
      )),
    );

    dialog.showModal();
    body.scrollTop = 0;
    const element = focusTarget as HTMLElement | null;
    if (element) {
      element.focus({ preventScroll: true });
      element.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }

  return { open };
}

export type Reader = ReturnType<typeof createReader>;
