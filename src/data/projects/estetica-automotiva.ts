import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'estetica-automotiva',
  name: 'Lume Estética Automotiva',
  kind: 'site',
  category: { pt: 'Serviço local / Estética automotiva', en: 'Local service / Car detailing' },
  tagline: {
    pt: 'Seu carro com brilho de vitrine, com preço de partida por porte.',
    en: 'Your car with a showroom shine, with starting prices by vehicle size.',
  },
  summary: {
    pt: 'Landing page escura e premium para um estúdio de estética automotiva, com comparador de antes e depois, orçamento por porte do carro e mensagem pronta para o WhatsApp.',
    en: 'A dark, premium landing page for a car detailing studio, with a before and after comparison, a quote by vehicle size, and a ready-to-send WhatsApp message.',
  },
  problem: {
    pt: 'Estúdios de estética automotiva vendem pelo resultado, mas o cliente chega no WhatsApp sem saber a diferença entre polimento e vitrificação, quanto custa para o porte do carro dele e quanto tempo fica sem o carro.',
    en: 'Detailing studios sell on results, but customers arrive on WhatsApp without knowing the difference between polishing and ceramic coating, what it costs for their vehicle size, or how long they will be without the car.',
  },
  approach: {
    pt: 'Uma página com direção de arte própria, de estúdio com luz de LED, que mostra o resultado num comparador, explica cada serviço com preço e prazo honestos e deixa o cliente montar o orçamento e a mensagem antes do primeiro contato.',
    en: 'A page with its own art direction, a studio under LED light, that shows results in a comparison slider, explains each service with honest prices and turnaround, and lets customers build the quote and message before the first contact.',
  },
  highlights: {
    pt: [
      { title: 'Antes e depois arrastável', text: 'Comparador de farol com controle deslizante, que também funciona pelo teclado.' },
      { title: 'Orçamento por porte', text: 'Hatch, sedã, SUV ou picape: a estimativa e o prazo mudam na hora, sem cobrar a lavagem duas vezes.' },
      { title: 'Preço e prazo de cada serviço', text: 'Sete serviços com o que está incluso, o preço de partida por porte e uma durabilidade realista da vitrificação.' },
      { title: 'Mensagem montada no aparelho', text: 'O orçamento preenche nome, carro, porte, serviços e leva e traz numa mensagem pronta para copiar.' },
    ],
    en: [
      { title: 'Draggable before and after', text: 'A headlight comparison slider that also works from the keyboard.' },
      { title: 'Quote by vehicle size', text: 'Hatchback, sedan, SUV, or pickup: the estimate and turnaround update instantly, without charging the wash twice.' },
      { title: 'Price and turnaround per service', text: 'Seven services with what is included, starting prices by size, and a realistic lifespan for ceramic coating.' },
      { title: 'A message built on the device', text: 'The quote fills in name, car, size, services, and pickup into a message ready to copy.' },
    ],
  },
  decisions: {
    pt: [
      { title: 'Honestidade vende melhor', text: 'A página diz o que o polimento não tira e quanto a vitrificação dura de verdade. Sem depoimentos nem notas inventadas.' },
      { title: 'Luz como identidade', text: 'Grafite, âmbar de luz de sódio e linhas finas como tubos de LED refletidos na pintura dão uma marca reconhecível sem copiar ninguém.' },
      { title: 'Nada é enviado', text: 'O orçamento e a mensagem rodam só no navegador. O cliente revisa o texto e decide se manda.' },
    ],
    en: [
      { title: 'Honesty sells better', text: 'The page says what polishing cannot remove and how long a coating really lasts. No invented testimonials or ratings.' },
      { title: 'Light as identity', text: 'Graphite, sodium-lamp amber, and thin lines like LED tubes reflected on paint create a recognisable brand without copying anyone.' },
      { title: 'Nothing is sent', text: 'The quote and message run only in the browser. The customer reviews the text and decides whether to send it.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    pt: 'A estimativa é um preço de partida e não substitui a avaliação. A mensagem é montada no seu aparelho e não é enviada.',
    en: 'The estimate is a starting price and does not replace the inspection. The message is built on your device and is not sent.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#0E0E10', ink: '#ECEAE4', accent: '#F2A93B' },
  device: 'desktop',
  preview: previewFor('estetica-automotiva', {
    pt: 'Landing page da Lume Estética Automotiva com um SUV grafite em estúdio escuro, reflexos de LED e o título "Seu carro com brilho de vitrine" com a palavra brilho em âmbar',
    en: 'Lume car detailing landing page with a graphite SUV in a dark studio, LED reflections, and the headline "Your car with a showroom shine" with showroom in amber',
  }),
};
