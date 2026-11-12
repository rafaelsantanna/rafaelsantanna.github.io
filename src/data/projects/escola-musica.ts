import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'escola-musica',
  name: 'Casa Clave',
  kind: 'site',
  category: { pt: 'Escola de música / Aula experimental', en: 'Music school / Trial lesson' },
  tagline: {
    pt: 'A música que você ouve, tocada por você.',
    en: 'The music you listen to, played by you.',
  },
  summary: {
    pt: 'Landing page de uma escola de música com cursos, preços de partida, um teclado que toca no navegador e um montador de mensagem para agendar a aula experimental.',
    en: 'A music school landing page with courses, starting prices, a keyboard that plays in the browser, and a message builder to book the trial lesson.',
  },
  problem: {
    pt: 'Escolas de música pequenas recebem as mesmas perguntas todo dia no WhatsApp: qual curso para qual idade, quanto custa, se precisa ter instrumento. Muita gente desiste antes de marcar a primeira aula.',
    en: 'Small music schools get the same questions on WhatsApp every day: which course for which age, how much it costs, whether you need your own instrument. Many people give up before booking a first lesson.',
  },
  approach: {
    pt: 'Uma página com cara de capa de disco, que responde essas perguntas na ordem em que os pais e alunos decidem, deixa a pessoa tocar algumas notas antes de vir e entrega a mensagem pronta para a escola.',
    en: 'A page styled like a record sleeve that answers those questions in the order parents and students decide, lets people play a few notes before they visit, and hands the school a ready message.',
  },
  highlights: {
    pt: [
      { title: 'Teclado que toca de verdade', text: 'Uma oitava com som sintetizado no navegador, tocada com o mouse, o toque ou o teclado do computador, e um botão que toca o começo da Ode à Alegria.' },
      { title: 'Cursos como lista de faixas', text: 'Sete cursos com idade mínima, formato e o que se aprende primeiro, em uma lista que abre cada faixa sem sair da página.' },
      { title: 'Encontre seu curso', text: 'Idade e objetivo viram uma indicação de curso com preço de partida, que já preenche a mensagem.' },
      { title: 'Mensagem pronta para o WhatsApp', text: 'Nome, idade, curso, instrumento e período montam o texto no próprio aparelho, sem envio automático.' },
    ],
    en: [
      { title: 'A keyboard that really plays', text: 'One octave with a synthesized tone in the browser, played by mouse, touch, or computer keys, plus a button that plays the opening of Ode to Joy.' },
      { title: 'Courses as a tracklist', text: 'Seven courses with minimum age, format, and what comes first, in a list where each track opens in place.' },
      { title: 'Find your course', text: 'Age and goal become a course suggestion with a starting price that also fills in the message.' },
      { title: 'A ready WhatsApp message', text: 'Name, age, course, instrument, and preferred time build the text on the device, with nothing sent automatically.' },
    ],
  },
  decisions: {
    pt: [
      { title: 'Som só depois de um gesto', text: 'O áudio é criado no primeiro toque em uma tecla. Com movimento reduzido, o som continua e a animação das teclas sai.' },
      { title: 'Respostas antes da conversa', text: 'Preço de partida, idade mínima e a política de reposição ficam visíveis, porque são as primeiras perguntas no WhatsApp.' },
      { title: 'Conteúdo sem depender de JavaScript', text: 'Cursos, preços e dúvidas são HTML estático. O script só liga o teclado, as abas, o indicador de curso e a mensagem.' },
    ],
    en: [
      { title: 'Sound only after a gesture', text: 'Audio starts on the first key press. With reduced motion, the sound stays and the key animation goes.' },
      { title: 'Answers before the conversation', text: 'Starting prices, minimum ages, and the make-up lesson policy are visible, because they are the first questions on WhatsApp.' },
      { title: 'Content that does not depend on JavaScript', text: 'Courses, prices, and questions are static HTML. The script only powers the keyboard, tabs, course finder, and message.' },
    ],
  },
  stack: ['Astro', 'TypeScript', 'CSS', 'Web Audio API', 'WebP'],
  services: ['websites-landing-pages'],
  boundary: {
    pt: 'A mensagem é montada só no seu aparelho. A página não agenda aulas, não consulta horários e não envia seus dados.',
    en: 'The message is built only on your device. The page does not book lessons, check schedules, or send your details.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#F6EFE2', ink: '#163A2E', accent: '#B53A24' },
  device: 'desktop',
  preview: previewFor('escola-musica', {
    pt: 'Landing page da Casa Clave com um professor e uma aluna tocando violão em uma sala de madeira e o título sobre tocar a música que você ouve',
    en: 'Casa Clave landing page with a teacher and a student playing acoustic guitars in a wooden room and the headline about playing the music you listen to',
  }),
};
