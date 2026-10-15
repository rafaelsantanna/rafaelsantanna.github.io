/** A section of a fictional internal policy. Each paragraph becomes one searchable passage. */
export interface KbSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export interface KbDocument {
  id: string;
  title: string;
  /** Team that owns and reviews the document. */
  owner: string;
  /** Last review, as YYYY-MM. */
  updated: string;
  summary: string;
  sections: KbSection[];
}

export interface KbCorpus {
  company: string;
  /** Team that receives questions the assistant cannot answer. */
  handoffTeam: string;
  documents: KbDocument[];
}
