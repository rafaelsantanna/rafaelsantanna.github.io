import type { DemoProject } from '../types';
import { concepts } from '../concepts.ts';
import { previewFor } from './shared.ts';

const concept = concepts.find((item) => item.slug === 'climatizacao-local')!;

export const project: DemoProject = {
  slug: concept.slug,
  name: concept.demoName.pt,
  kind: 'site',
  category: concept.category,
  tagline: concept.demoTagline,
  summary: concept.summary,
  problem: {
    en: 'Local service businesses often exist only on WhatsApp. Customers do not know which service to ask for, and every quote starts with the same back-and-forth questions.',
    pt: 'Negócios de serviço local muitas vezes existem só no WhatsApp. O cliente não sabe qual serviço pedir, e todo orçamento começa com as mesmas perguntas de ida e volta.',
  },
  approach: {
    en: 'A direct commercial page that explains each service, shows how the process works, and helps the customer organize the details a technician needs before the first conversation.',
    pt: 'Uma página comercial direta que explica cada serviço, mostra como o processo funciona e ajuda o cliente a organizar os detalhes que um técnico precisa antes da primeira conversa.',
  },
  highlights: {
    en: [
      { title: 'Services in plain language', text: 'Installation, maintenance, and repair explained by what the customer is experiencing.' },
      { title: 'A visible process', text: 'Clear steps from first contact to service, so expectations are set before the call.' },
      { title: 'A local request draft', text: 'The customer chooses a service and writes a note, with validation and an announced result.' },
      { title: 'Bilingual from the start', text: 'Portuguese and English versions with a language switch on every page.' },
    ],
    pt: [
      { title: 'Serviços em linguagem simples', text: 'Instalação, manutenção e reparo explicados a partir do que o cliente está vivendo.' },
      { title: 'Processo visível', text: 'Etapas claras do primeiro contato ao atendimento, para alinhar expectativas antes da conversa.' },
      { title: 'Rascunho de pedido local', text: 'O cliente escolhe um serviço e escreve uma observação, com validação e resultado anunciado.' },
      { title: 'Bilíngue desde o início', text: 'Versões em português e inglês, com troca de idioma em todas as páginas.' },
    ],
  },
  decisions: {
    en: [
      { title: 'Clarity over persuasion', text: 'No fake counters or testimonials. The page earns trust by explaining the service well.' },
      { title: 'No fake submission', text: 'The draft never pretends to send a request. It says exactly what it does.' },
      { title: 'Content that works without JavaScript', text: 'Everything except the draft is static HTML, readable by people, search engines, and agents.' },
    ],
    pt: [
      { title: 'Clareza antes de persuasão', text: 'Sem contadores ou depoimentos inventados. A página gera confiança explicando bem o serviço.' },
      { title: 'Sem envio de mentira', text: 'O rascunho nunca finge enviar um pedido. Ele diz exatamente o que faz.' },
      { title: 'Conteúdo que funciona sem JavaScript', text: 'Tudo, exceto o rascunho, é HTML estático, legível por pessoas, buscadores e agentes.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    en: 'The draft only organizes details on your device. It does not size equipment, check a schedule, or send your details.',
    pt: 'O rascunho só organiza os dados no seu dispositivo. Ele não calcula capacidade, não verifica agenda e não envia seus dados.',
  },
  disclaimer: concept.disclaimer,
  palette: { base: '#F5F7F8', ink: '#142B3C', accent: '#007C91' },
  device: 'desktop',
  preview: previewFor(concept.slug, {
    en: 'Clima Certa landing page with a technician servicing an air-conditioning unit and the headline about asking the right questions',
    pt: 'Landing page da Clima Certa com um técnico revisando um ar-condicionado e o título sobre boas perguntas',
  }),
};
