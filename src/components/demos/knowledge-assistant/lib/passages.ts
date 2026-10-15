import type { KbCorpus } from '../corpus/types';

/** The retrieval unit: one paragraph of one section, with its context. */
export interface Passage {
  id: string;
  docId: string;
  docTitle: string;
  sectionId: string;
  sectionHeading: string;
  paragraph: number;
  text: string;
}

export function chunkCorpus(corpus: KbCorpus): Passage[] {
  return corpus.documents.flatMap((doc) =>
    doc.sections.flatMap((section) =>
      section.paragraphs.map((text, paragraph) => ({
        id: `${doc.id}/${section.id}/${paragraph + 1}`,
        docId: doc.id,
        docTitle: doc.title,
        sectionId: section.id,
        sectionHeading: section.heading,
        paragraph,
        text,
      })),
    ),
  );
}

/** Text that is indexed for a passage: the document title and section heading add context. */
export function searchableText(passage: Passage): string {
  return `${passage.docTitle}. ${passage.sectionHeading}. ${passage.text}`;
}
