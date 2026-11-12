import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'escola-danca',
  name: 'Estúdio Compasso',
  kind: 'site',
  category: { pt: 'Escola de dança / Aula experimental', en: 'Dance school / Trial class' },
  tagline: {
    pt: 'Uma escola de dança que ajuda o aluno a achar o próprio ritmo antes da primeira aula.',
    en: 'A dance school page that helps people find their style before the first class.',
  },
  summary: {
    pt: 'Landing page de escola de dança com teste de ritmo, horários por dia, planos com preço e um montador de mensagem para marcar a aula experimental.',
    en: 'A dance-school landing page with a style quiz, day-by-day timetable, priced plans, and a message builder for booking the trial class.',
  },
  problem: {
    pt: 'Escolas de dança recebem as mesmas perguntas no WhatsApp todo dia: qual ritmo fazer, se precisa de par, qual a idade, quanto custa e que roupa usar. Quem nunca dançou desiste antes de perguntar.',
    en: 'Dance schools get the same WhatsApp questions every day: which style to pick, whether a partner is needed, age limits, prices, and what to wear. People who have never danced give up before asking.',
  },
  approach: {
    pt: 'Uma página com identidade forte que responde essas perguntas antes da conversa: ritmos por idade, um teste de três perguntas que indica a turma, a grade da semana, planos claros, o custo real da mostra de fim de ano e uma mensagem pronta para a aula experimental.',
    en: 'A page with a strong identity that answers those questions before the conversation: styles by age, a three-question quiz that points to a class, the weekly timetable, clear plans, the real cost of the end-of-year show, and a ready-made message for the trial class.',
  },
  highlights: {
    pt: [
      { title: 'Teste "qual ritmo é a sua cara"', text: 'Três perguntas com transições animadas revelam o ritmo, a foto e os dias de aula, e já marcam o ritmo na mensagem.' },
      { title: 'Horários por dia', text: 'Abas acessíveis por teclado que abrem no dia de hoje, com cores por família de ritmo.' },
      { title: 'Planos e custos honestos', text: 'Mensalidades a partir de R$ 140, aula particular, pacote para noivos e quanto custa participar da mostra.' },
      { title: 'Mensagem pronta para a aula grátis', text: 'Nome, faixa etária, ritmos, experiência e período viram um texto pronto para conferir, sem envio automático.' },
    ],
    en: [
      { title: '"Which style is so you" quiz', text: 'Three questions with animated transitions reveal the style, a photo, and the class days, and tick that style in the message.' },
      { title: 'Timetable by day', text: 'Keyboard-accessible tabs that open on today, colour-coded by style family.' },
      { title: 'Honest plans and costs', text: 'Monthly plans from R$ 140, private lessons, a wedding package, and what taking part in the show costs.' },
      { title: 'A ready message for the free class', text: 'Name, age group, styles, experience, and time of day become text to review, never sent automatically.' },
    ],
  },
  decisions: {
    pt: [
      { title: 'Marca editorial e com movimento', text: 'Ameixa, magenta e laranja de pôr do sol, Archivo pesado com itálico do Newsreader e linhas curvas que lembram passos de dança.' },
      { title: 'Responder antes de vender', text: 'Par, idade, roupa e reposição estão na página, porque são as dúvidas que travam a primeira aula.' },
      { title: 'Conteúdo que funciona sem JavaScript', text: 'Ritmos, horários, planos e dúvidas são HTML estático. O teste e o montador de mensagem são melhorias progressivas.' },
    ],
    en: [
      { title: 'An editorial brand with movement', text: 'Plum, magenta, and sunset orange, heavy Archivo with Newsreader italics, and curved lines that suggest dance steps.' },
      { title: 'Answer before selling', text: 'Partners, age, clothing, and make-up classes are on the page, because those are the doubts that stall the first class.' },
      { title: 'Content that works without JavaScript', text: 'Styles, timetable, plans, and FAQ are static HTML. The quiz and message builder are progressive enhancements.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'SVG', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    pt: 'O teste e a mensagem funcionam só no seu dispositivo. A página não reserva vaga, não consulta agenda e não envia seus dados.',
    en: 'The quiz and the message run only on your device. The page does not reserve a spot, check a schedule, or send your details.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#FBF1E6', ink: '#2A0F2B', accent: '#C41F63' },
  device: 'desktop',
  preview: previewFor('escola-danca', {
    pt: 'Landing page do Estúdio Compasso com o título "Dance no seu compasso", um casal dançando samba de gafieira em foto com topo em arco e um selo giratório de aula experimental grátis',
    en: 'Estúdio Compasso landing page with the headline "Dance to your own beat", a couple dancing samba de gafieira in an arch-topped photo, and a spinning free trial class badge',
  }),
};
