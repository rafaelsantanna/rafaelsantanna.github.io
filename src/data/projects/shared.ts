import type { LocalizedText } from '../types';

export const demoDisclaimer: LocalizedText = {
  en: "A demo built by Rafael Sant' Anna for this portfolio.",
  pt: "Demonstração autoral criada por Rafael Sant' Anna para este portfólio.",
};

export function previewFor(slug: string, alt: LocalizedText) {
  return { image: `/images/projects/${slug}.png`, width: 1600, height: 1000, alt };
}
