import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'academia-luta',
  name: 'Guarda Alta',
  kind: 'site',
  category: { pt: 'Serviço local / Aula experimental', en: 'Local service / Trial class' },
  tagline: {
    pt: 'Jiu-jitsu, no-gi, muay thai e turma kids, com a primeira aula por conta da academia.',
    en: 'Jiu-jitsu, no-gi, muay thai, and a kids program, with the first class on the house.',
  },
  summary: {
    pt: 'Landing page de uma academia de lutas com grade semanal filtrável por modalidade e nível, planos com preço de partida e um montador de mensagem para agendar a aula experimental.',
    en: 'A landing page for a martial-arts gym with a weekly timetable filtered by discipline and level, plans with starting prices, and a message builder to book the free trial class.',
  },
  problem: {
    pt: 'Quem nunca treinou tem vergonha de perguntar. A academia responde no WhatsApp, um por um, as mesmas dúvidas: que horas tem aula, se precisa de kimono, se dá para começar fora de forma e quanto custa.',
    en: 'People who have never trained feel awkward asking. The gym answers the same questions one by one on WhatsApp: when classes run, whether a gi is needed, whether you can start out of shape, and how much it costs.',
  },
  approach: {
    pt: 'Uma página que tira o medo do primeiro treino: grade semanal que filtra por modalidade e nível, explicação da primeira aula para adulto e criança, faixas em linguagem simples, regras do tatame e uma mensagem pronta com o horário escolhido.',
    en: 'A page that takes the fear out of the first session: a weekly timetable filtered by discipline and level, a walkthrough of the first class for adults and kids, belts explained simply, mat rules, and a ready message with the chosen slot.',
  },
  highlights: {
    pt: [
      { title: 'Grade semanal filtrável', text: 'Segunda a sábado, filtrada por modalidade e nível com animação, e com um seletor de dia no celular.' },
      { title: 'Do horário para a mensagem', text: 'Cada turma tem um botão que preenche a mensagem com modalidade, dia e horário e leva direto até ela.' },
      { title: 'Primeira aula sem mistério', text: 'Abas para adulto e kids com o passo a passo da aula experimental e o que levar.' },
      { title: 'Faixas explicadas', text: 'A progressão da branca à preta como elemento gráfico, com o que cada faixa significa em poucas palavras.' },
      { title: 'Planos com preço de partida', text: 'Mensal, trimestral, combo de duas modalidades e kids, com o que está incluso em cada um.' },
    ],
    en: [
      { title: 'Filterable weekly timetable', text: 'Monday to Saturday, filtered by discipline and level with animation, plus a day picker on phones.' },
      { title: 'From a slot to the message', text: 'Every class has a button that fills the message with discipline, day, and time and takes you straight to it.' },
      { title: 'A first class without mystery', text: 'Adult and kids tabs with a step-by-step of the trial class and what to bring.' },
      { title: 'Belts explained', text: 'The progression from white to black as a graphic element, with what each belt means in a few words.' },
      { title: 'Plans with starting prices', text: 'Monthly, quarterly, a two-discipline combo, and kids, with what each one includes.' },
    ],
  },
  decisions: {
    pt: [
      { title: 'Dimensão real da semana', text: 'O filtro esmaece em vez de esconder no computador, para a pessoa ver como a semana inteira se encaixa na rotina dela.' },
      { title: 'Confiança sem números inventados', text: 'Nada de contador de alunos ou depoimentos. A página convence explicando a primeira aula, os preços e as regras.' },
      { title: 'Mensagem que não finge enviar', text: 'O texto é montado no aparelho para revisar e copiar. Nada sai da página sozinho.' },
    ],
    en: [
      { title: 'The real shape of the week', text: 'On desktop the filter dims instead of hiding, so people see how the whole week fits their routine.' },
      { title: 'Trust without invented numbers', text: 'No student counters or testimonials. The page persuades by explaining the first class, prices, and rules.' },
      { title: 'A message that does not pretend to send', text: 'The text is assembled on the device to review and copy. Nothing leaves the page on its own.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    pt: 'A grade e os planos são exemplos. A mensagem é montada só no seu dispositivo: não verifica vagas, não agenda e não envia seus dados.',
    en: 'The timetable and plans are examples. The message is assembled only on your device: it does not check availability, book a class, or send your details.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#121110', ink: '#EDE7DA', accent: '#D02B1E' },
  device: 'desktop',
  preview: previewFor('academia-luta', {
    pt: 'Landing page da Guarda Alta com dois atletas de jiu-jitsu treinando no tatame azul sob luz lateral e o título em letras condensadas sobre a faixa branca',
    en: 'Guarda Alta landing page with two jiu-jitsu athletes grappling on a blue mat in side light and a condensed headline about the white belt',
  }),
};
