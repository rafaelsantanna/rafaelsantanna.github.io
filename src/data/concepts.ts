import type { Concept } from './types';
import { demoDisclaimer } from './projects/shared.ts';

export const concepts: Concept[] = [
  {
    slug: 'pousada-boutique',
    title: { en: 'Casa Neblina', pt: 'Casa Neblina' },
    category: { en: 'Hospitality / Direct booking', pt: 'Hospedagem / Reserva direta' },
    summary: {
      en: 'A conversion-focused bilingual experience for a small lodge that needs to present its atmosphere, stays, and reservation path beyond social media.',
      pt: 'Uma experiência bilíngue focada em conversão para uma pequena pousada que precisa apresentar atmosfera, hospedagens e caminho de reserva além das redes sociais.',
    },
    disclaimer: demoDisclaimer,
    demoName: { en: 'Casa Neblina', pt: 'Casa Neblina' },
    demoTagline: { en: 'Let time find another rhythm.', pt: 'O tempo encontra outro ritmo.' },
    sections: {
      en: [
        { title: 'The mountains need no itinerary.', text: 'Start with a long breakfast, take a trail through the trees, or stay on the porch. At Casa Neblina, the day follows the pace of the landscape.' },
        { title: 'Spaces to simply be.', text: 'Quiet rooms, a shared living room for coffee, and corners made for reading, resting, and watching the light change.' },
        { title: 'Paths that begin slowly.', text: 'Forest, fresh air, and small discoveries just past the gate. Head out whenever you like and come back when you feel like it.' },
      ],
      pt: [
        { title: 'A serra não precisa de roteiro.', text: 'Comece pelo café demorado, escolha uma trilha entre as árvores ou fique na varanda. Na Casa Neblina, o dia segue o ritmo da paisagem.' },
        { title: 'Espaços para estar.', text: 'Quartos silenciosos, uma sala para dividir o café e cantos pensados para ler, descansar e ver a luz mudar.' },
        { title: 'Caminhos que começam devagar.', text: 'Mata, ar fresco e pequenas descobertas logo depois da porteira. Saia quando quiser e volte quando der vontade.' },
      ],
    },
    image: '/images/concepts/pousada-boutique-hero.png',
    imageWidth: 1536,
    imageHeight: 1024,
    imageAlt: { en: 'Mountain lodge surrounded by mist and native vegetation', pt: 'Pousada na serra, cercada por névoa e vegetação nativa' },
    theme: 'hospitality',
  },
  {
    slug: 'climatizacao-local',
    title: { en: 'Clima Certa', pt: 'Clima Certa' },
    category: { en: 'Local service / Quote journey', pt: 'Serviço local / Jornada de orçamento' },
    summary: {
      en: 'A direct commercial page for an HVAC business that needs to explain services, coverage, and the quote journey beyond a WhatsApp-only presence.',
      pt: 'Uma página comercial direta para uma empresa de climatização que precisa explicar serviços, cobertura e jornada de orçamento além de uma presença apenas no WhatsApp.',
    },
    disclaimer: demoDisclaimer,
    demoName: { en: 'Clima Certa', pt: 'Clima Certa' },
    demoTagline: { en: 'Your air conditioner, cold again.', pt: 'Seu ar-condicionado gelando de novo.' },
    sections: {
      en: [
        { title: 'Installation', text: 'Before recommending a unit, the technician looks at the room size, the afternoon sun, and how the space is used.' },
        { title: 'Maintenance', text: 'Regular cleaning and checks so the unit cools well, runs quieter, and lasts longer.' },
        { title: 'Repair', text: 'Dripping, noisy, or barely cooling? Share the model and what is happening so the technician arrives prepared.' },
      ],
      pt: [
        { title: 'Instalação', text: 'Antes de indicar um aparelho, o técnico entende o tamanho do ambiente, o sol que ele recebe e como o espaço é usado.' },
        { title: 'Manutenção', text: 'Limpeza e revisão periódicas para o aparelho gelar bem, fazer menos barulho e durar mais.' },
        { title: 'Conserto', text: 'Pingando, fazendo barulho ou gelando pouco? Informe o modelo e o que está acontecendo para o técnico chegar preparado.' },
      ],
    },
    image: '/images/concepts/climatizacao-local-hero.png',
    imageWidth: 1799,
    imageHeight: 874,
    imageAlt: { en: 'Technician inspecting a modern air-conditioning unit in a bright interior', pt: 'Técnico inspecionando um aparelho de ar-condicionado moderno em ambiente iluminado' },
    theme: 'service',
  },
];
