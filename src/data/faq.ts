import type { Locale } from './types';

export interface FaqItem {
  question: string;
  answer: string;
}

// Questions a prospective client asks before getting in touch. Rendered on the home page and as FAQPage schema.
export const homeFaq: Record<Locale, FaqItem[]> = {
  pt: [
    { question: 'Você está aceitando projetos?', answer: 'Sim, estou aberto a projetos freelance. Trabalho de forma remota, no horário comercial do Brasil.' },
    { question: 'Que tipo de projeto você faz?', answer: 'Sistemas B2B e internos, sites e landing pages, modernização de frontend, automações com IA e RAG, e apps com integrações. Do backend à interface.' },
    { question: 'Os projetos do portfólio são de clientes?', answer: 'Não. São demonstrações que eu criei para este portfólio, com marcas e dados fictícios, porque os sistemas dos clientes não podem ser mostrados. A experiência real está na página Sobre e no CV.' },
    { question: 'Com quais tecnologias você trabalha?', answer: 'React, TypeScript, Vue, Laravel, Node.js, .NET, PostgreSQL, MySQL e React Native, além de IA aplicada com RAG e assistentes.' },
    { question: 'Como começa um projeto?', answer: 'Pelo email ou pelo WhatsApp desta página. Conte o contexto, o prazo e o que precisa ficar pronto. A partir disso a gente conversa sobre escopo e valores.' },
    { question: 'Você mora em Portugal. Atende clientes no Brasil?', answer: 'Sim. Moro em Viseu, Portugal, e trabalho no horário comercial do Brasil, com reuniões e mensagens em português.' },
  ],
  en: [
    { question: 'Are you taking on projects?', answer: 'Yes, I am open to freelance projects. I work remotely, during Brazilian business hours.' },
    { question: 'What kind of projects do you take on?', answer: 'B2B and internal systems, websites and landing pages, frontend modernization, AI and RAG automation, and apps with integrations. From the backend to the interface.' },
    { question: 'Are the portfolio projects client work?', answer: 'No. They are demos I built for this portfolio, with fictional brands and data, because client systems cannot be shown. My real experience is on the About page and in the CV.' },
    { question: 'Which technologies do you work with?', answer: 'React, TypeScript, Vue, Laravel, Node.js, .NET, PostgreSQL, MySQL, and React Native, plus applied AI with RAG and assistants.' },
    { question: 'How does a project start?', answer: 'Through the email or WhatsApp on this page. Share the context, the timeline, and what needs to ship, and we talk about scope and pricing from there.' },
    { question: 'You live in Portugal. Do you work with clients in Brazil?', answer: 'Yes. I live in Viseu, Portugal, and work during Brazilian business hours, in Portuguese or English.' },
  ],
};
