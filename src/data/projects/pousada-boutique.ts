import type { DemoProject } from '../types';
import { concepts } from '../concepts.ts';
import { previewFor } from './shared.ts';

const concept = concepts.find((item) => item.slug === 'pousada-boutique')!;

export const project: DemoProject = {
  slug: concept.slug,
  name: concept.demoName.pt,
  kind: 'site',
  category: concept.category,
  tagline: concept.demoTagline,
  summary: concept.summary,
  problem: {
    en: 'Small lodges depend on social media and booking platforms to be found, and their own brand ends up without a place to show its atmosphere and guide guests toward a stay.',
    pt: 'Pequenas hospedagens dependem de redes sociais e plataformas de reserva para serem encontradas, e a própria marca fica sem um lugar para mostrar sua atmosfera e conduzir o hóspede até a estadia.',
  },
  approach: {
    en: 'A bilingual landing page with its own art direction, a visual narrative in sections, and a stay planner that organizes dates and guests on the device without sending any data.',
    pt: 'Uma landing page bilíngue com direção de arte própria, narrativa visual em seções e um planejador de estadia que organiza datas e hóspedes no próprio dispositivo, sem enviar dados.',
  },
  highlights: {
    en: [
      { title: 'Its own art direction', text: 'Serif typography, forest and mist tones, and full-bleed photography, with the mist lifting as the page opens.' },
      { title: 'What a guest needs to decide', text: 'A day at the lodge, suites with size and starting rate, surroundings, and practical rules, in the order a guest makes decisions.' },
      { title: 'A local stay planner', text: 'Arrival, nights, and guests organized into a draft, with clear validation and announced results.' },
      { title: 'Bilingual from the start', text: 'Portuguese and English versions with a language switch on every page.' },
    ],
    pt: [
      { title: 'Direção de arte própria', text: 'Tipografia serifada, tons de mata e névoa e fotografia em tela cheia, com a névoa se abrindo quando a página carrega.' },
      { title: 'O que o hóspede precisa para decidir', text: 'Um dia na pousada, suítes com tamanho e valor de partida, arredores e regras práticas, na ordem em que o hóspede decide.' },
      { title: 'Planejador de estadia local', text: 'Chegada, noites e hóspedes organizados em um rascunho, com validação clara e resultado anunciado.' },
      { title: 'Bilíngue desde o início', text: 'Versões em português e inglês, com troca de idioma em todas as páginas.' },
    ],
  },
  decisions: {
    en: [
      { title: 'Optimized imagery', text: 'Every photograph is served as WebP with explicit dimensions to avoid layout shifts.' },
      { title: 'No fake submission', text: 'The planner never pretends to book. It explains what it does and announces its result to screen readers.' },
      { title: 'Content that works without JavaScript', text: 'Everything except the planner is static HTML, readable by people, search engines, and agents.' },
    ],
    pt: [
      { title: 'Imagens otimizadas', text: 'Todas as fotografias são servidas em WebP com dimensões explícitas para evitar saltos de layout.' },
      { title: 'Sem envio de mentira', text: 'O planejador nunca finge reservar. Ele explica o que faz e anuncia o resultado para leitores de tela.' },
      { title: 'Conteúdo que funciona sem JavaScript', text: 'Tudo, exceto o planejador, é HTML estático, legível por pessoas, buscadores e agentes.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    en: 'The planner only organizes details on your device during the visit. It does not check availability or send information.',
    pt: 'O planejador só organiza os dados no seu dispositivo durante a visita. Não consulta disponibilidade nem envia informações.',
  },
  disclaimer: concept.disclaimer,
  palette: { base: '#141D18', ink: '#DFE5E1', accent: '#E8B76F' },
  device: 'desktop',
  preview: previewFor(concept.slug, {
    en: 'Casa Neblina landing page with a misty mountain lodge photograph and the headline about slowing down',
    pt: 'Landing page da Casa Neblina com fotografia de uma pousada na serra envolta em névoa e o título sobre desacelerar',
  }),
};
