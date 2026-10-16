import type { Locale } from './types';

export interface FaqItem {
  question: string;
  answer: string;
}

// Questions a prospective client asks before getting in touch. Rendered on the home page and as FAQPage schema.
export const homeFaq: Record<Locale, FaqItem[]> = {
  pt: [
    { question: 'Que tipo de projeto você faz?', answer: 'Sistemas web sob medida, sistemas B2B e SaaS, ERPs e sistemas internos, painéis administrativos e dashboards, plataformas EAD (LMS e LXP), sistemas de agendamento, lojas virtuais, sites institucionais e landing pages, aplicativos mobile para Android e iOS, PWAs, APIs REST e integrações com ERP, CRM, BI, meios de pagamento e WhatsApp, chatbots e assistentes com IA, automações com IA e RAG, e modernização de sistemas legados. Do backend à interface.' },
    { question: 'Com quais tecnologias você trabalha?', answer: 'Frontend com React, Next.js, Vue.js, Angular, TypeScript, JavaScript, HTML, CSS e Tailwind CSS. Backend com Node.js, PHP, Laravel, Java, C#, .NET, ASP.NET e Python, sempre com APIs REST. Apps com React Native para Android e iOS. Bancos de dados PostgreSQL, MySQL, SQL Server, MongoDB e Redis. Docker, Git, CI/CD, AWS e Cloudflare para infraestrutura e deploy. IA aplicada com OpenAI, Claude, RAG, agentes e automações.' },
    { question: 'Como começa um projeto?', answer: 'Pelo email ou pelo WhatsApp desta página. Conte o contexto, o prazo e o que precisa ficar pronto. A partir disso a gente conversa sobre escopo e valores.' },
  ],
  en: [
    { question: 'What kind of projects do you take on?', answer: 'Custom web systems, B2B and SaaS platforms, ERPs and internal systems, admin panels and dashboards, e-learning platforms (LMS and LXP), booking systems, online stores, company websites and landing pages, mobile apps for Android and iOS, PWAs, REST APIs and integrations with ERP, CRM, BI, payment providers, and WhatsApp, AI chatbots and assistants, AI and RAG automation, and legacy system modernization. From the backend to the interface.' },
    { question: 'Which technologies do you work with?', answer: 'Frontend with React, Next.js, Vue.js, Angular, TypeScript, JavaScript, HTML, CSS, and Tailwind CSS. Backend with Node.js, PHP, Laravel, Java, C#, .NET, ASP.NET, and Python, always with REST APIs. Apps with React Native for Android and iOS. PostgreSQL, MySQL, SQL Server, MongoDB, and Redis databases. Docker, Git, CI/CD, AWS, and Cloudflare for infrastructure and deployment. Applied AI with OpenAI, Claude, RAG, agents, and automation.' },
    { question: 'How does a project start?', answer: 'Through the email or WhatsApp on this page. Share the context, the timeline, and what needs to ship, and we talk about scope and pricing from there.' },
  ],
};
