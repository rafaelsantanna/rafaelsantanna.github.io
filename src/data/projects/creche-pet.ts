import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'creche-pet',
  name: 'Pipoca Pet',
  kind: 'site',
  category: { pt: 'Serviço local / Creche, banho e tosa', en: 'Local service / Dog daycare and grooming' },
  tagline: {
    pt: 'Uma landing page para creche, banho e tosa que mostra preço, regras e rotina antes do primeiro oi.',
    en: 'A landing page for a dog daycare and grooming spot that shows prices, rules, and routine before the first hello.',
  },
  summary: {
    pt: 'Abra a página, monte o dia do seu cão para ver o preço de partida mudar e deixe a mensagem de agendamento pronta para copiar.',
    en: 'Open the page, plan your dog’s day to watch the starting price change, and get the booking message ready to copy.',
  },
  problem: {
    pt: 'Creches e pet shops de bairro respondem as mesmas perguntas o dia inteiro no WhatsApp: quanto custa o banho, quais vacinas precisa, se precisa ser castrado. O tutor desiste antes de marcar a avaliação.',
    en: 'Neighbourhood daycares and grooming spots answer the same WhatsApp questions all day: how much a bath costs, which vaccines are needed, whether the dog must be neutered. Owners give up before booking the trial visit.',
  },
  approach: {
    pt: 'Uma página com marca própria e tom acolhedor, que mostra preços de partida por porte e pelagem, regras de vacina e castração, a rotina do dia e um montador de mensagem que já chega com nome, porte e serviço.',
    en: 'A page with its own brand and a warm tone that shows starting prices by size and coat, vaccine and neutering rules, the daily routine, and a message builder that arrives with name, size, and service.',
  },
  highlights: {
    pt: [
      { title: 'Simulador “Monte o dia”', text: 'O tutor escolhe porte, pelagem e serviço. O cãozinho em SVG muda de tamanho e o preço de partida anima até o novo valor.' },
      { title: 'Serviços em abas', text: 'Creche, banho e tosa e hotel com foto, o que está incluso, tabela de preços e um atalho para a mensagem.' },
      { title: 'Regras que todo tutor pergunta', text: 'Vacinas, antipulgas, castração, avaliação de adaptação, o que levar e horários, tudo antes da primeira conversa.' },
      { title: 'Mensagem pronta para copiar', text: 'Nome, cão, porte, idade e serviços viram um texto no estilo WhatsApp, montado no próprio navegador.' },
    ],
    en: [
      { title: '“Plan the day” simulator', text: 'Owners pick size, coat, and service. The SVG dog changes size and the starting price animates to the new value.' },
      { title: 'Services in tabs', text: 'Daycare, bath and grooming, and boarding, each with a photo, what is included, a price table, and a shortcut to the message.' },
      { title: 'The rules every owner asks about', text: 'Vaccines, flea treatment, neutering, the settling-in visit, what to bring, and opening hours, all before the first chat.' },
      { title: 'A message ready to copy', text: 'Name, dog, size, age, and services become a WhatsApp-style text assembled right in the browser.' },
    ],
  },
  decisions: {
    pt: [
      { title: 'Marca antes de template', text: 'Tangerina, azul-marinho e papel creme, fonte arredondada e um mascote de pipoca desenhado à mão, para o negócio parecer único.' },
      { title: 'Preço honesto', text: 'Valores “a partir de” coerentes com porte e pelagem, e o aviso de que o preço final é confirmado depois de conhecer o cão.' },
      { title: 'Nada enviado de mentira', text: 'O montador só organiza a mensagem na tela. Sem envio automático, sem depoimentos ou números inventados.' },
    ],
    en: [
      { title: 'Brand before template', text: 'Tangerine, navy, and cream paper, a rounded display font, and a hand-drawn popcorn mascot, so the business feels like its own.' },
      { title: 'Honest pricing', text: '“From” prices that follow size and coat, plus a note that the final price is confirmed after meeting the dog.' },
      { title: 'No fake sending', text: 'The builder only assembles the message on screen. No automatic sending, no invented testimonials or numbers.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'SVG', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    pt: 'O simulador mostra preços de partida de exemplo e o montador só organiza a mensagem no seu dispositivo. Nada é enviado e nenhuma agenda é consultada.',
    en: 'The simulator shows sample starting prices and the builder only assembles the message on your device. Nothing is sent and no schedule is checked.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#FFF6EA', ink: '#14213D', accent: '#FF7A2F' },
  device: 'desktop',
  preview: previewFor('creche-pet', {
    pt: 'Landing page da Pipoca Pet com o título “Brinca o dia todo. Volta cheiroso.” e uma colagem de fotos de um cão caramelo correndo na grama, cães brincando de cabo de guerra e um cãozinho saindo do banho',
    en: 'Pipoca Pet landing page with the headline “Plays all day. Comes home fresh.” and a photo collage of a caramel dog running on grass, dogs playing tug of war, and a small dog fresh out of the bath',
  }),
};
