export type Locale = 'en' | 'pt';

export type LocalizedText = Record<Locale, string>;

export type LocalizedList = Record<Locale, string[]>;

export interface TitledText {
  title: string;
  text: string;
}

/** Professional experience backed by the CV. Shown as text only, without project imagery. */
export interface Experience {
  slug: string;
  company: string;
  title: LocalizedText;
  /** The role Rafael holds now; it may not have documented outcomes or a case story yet. */
  current?: boolean;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  role: LocalizedText;
  period: LocalizedText;
  context?: LocalizedText;
  challenge?: LocalizedText;
  solution?: LocalizedText;
  outcomes: LocalizedList;
  technologies: string[];
  externalUrl?: string;
  externalLabel?: LocalizedText;
}

export interface Service {
  slug: string;
  index: string;
  title: LocalizedText;
  summary: LocalizedText;
  idealFor: LocalizedList;
  deliverables: LocalizedList;
  /** Demo project slugs that illustrate the service. */
  projects: string[];
  technologies: string[];
}

export type ProjectKind = 'product' | 'ai' | 'site' | 'mobile';

/** An authorial demonstration built by Rafael for the portfolio, with a fictional brand and fictional data. */
export interface DemoProject {
  slug: string;
  /** Fictional brand or product name shown inside the demo. */
  name: string;
  kind: ProjectKind;
  /** Short segment label, e.g. "B2B SaaS / Logistics". */
  category: LocalizedText;
  /** One-line value statement of the demo product. */
  tagline: LocalizedText;
  /** One or two sentences that describe what the visitor can open and try. */
  summary: LocalizedText;
  /** The realistic scenario the demo answers. */
  problem: LocalizedText;
  /** What was built to answer it. */
  approach: LocalizedText;
  /** What the demo lets a visitor see working (4 to 6 items). */
  highlights: Record<Locale, TitledText[]>;
  /** Technical and product decisions worth explaining (3 items). */
  decisions: Record<Locale, TitledText[]>;
  /** Technologies actually used by the demo implementation. */
  stack: string[];
  /** Related service slugs. */
  services: string[];
  /** What the demo deliberately does not do. */
  boundary: LocalizedText;
  disclaimer: LocalizedText;
  palette: { base: string; ink: string; accent: string };
  device: 'desktop' | 'mobile';
  preview: { image: string; width: number; height: number; alt: LocalizedText };
}

/** Content for the two original landing-page demonstrations. */
export interface Concept {
  slug: string;
  title: LocalizedText;
  category: LocalizedText;
  summary: LocalizedText;
  disclaimer: LocalizedText;
  demoName: LocalizedText;
  demoTagline: LocalizedText;
  sections: Record<Locale, TitledText[]>;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: LocalizedText;
  theme: 'hospitality' | 'service';
}
