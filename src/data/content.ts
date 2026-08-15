export type Locale = 'en' | 'pt';

export type LocalizedText = Record<Locale, string>;

export interface CaseStudy {
  slug: string;
  title: string;
  eyebrow: LocalizedText;
  summary: LocalizedText;
  role: LocalizedText;
  period: LocalizedText;
  context: LocalizedText;
  challenge: LocalizedText;
  solution: LocalizedText;
  outcomes: Record<Locale, string[]>;
  technologies: string[];
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: LocalizedText;
  externalUrl?: string;
  externalLabel?: LocalizedText;
  schemaType: 'SoftwareApplication' | 'CreativeWork';
}

export interface Service {
  slug: string;
  index: string;
  title: LocalizedText;
  summary: LocalizedText;
  idealFor: Record<Locale, string[]>;
  deliverables: Record<Locale, string[]>;
  evidence: string[];
  technologies: string[];
}

export const identity = {
  name: "Rafael Sant' Anna",
  role: {
    en: 'Senior Software Engineer',
    pt: 'Engenheiro de Software Sênior',
  },
  location: 'Viseu, Portugal',
  email: 'dev.rafaelsilva@gmail.com',
  phoneDisplay: '+351 926 979 735',
  phoneE164: '351926979735',
  github: 'https://github.com/rafaelsantanna',
  linkedin: 'https://www.linkedin.com/in/devrafaelsantanna/',
  edgeData: 'https://edgedata.com.br/',
  availability: {
    en: 'Available for remote freelance projects',
    pt: 'Disponível para projetos freelance remotos',
  },
};

export const cases: CaseStudy[] = [
  {
    slug: 'edgedata',
    title: 'EdgeData',
    eyebrow: { en: 'Owned product / Network operations', pt: 'Produto próprio / Operações de rede' },
    summary: {
      en: 'An on-premise platform that centralizes infrastructure inventory, SSH and Telnet sessions, reusable commands, permissions, and operational history inside the customer network.',
      pt: 'Uma plataforma on-premise que centraliza inventário de infraestrutura, sessões SSH e Telnet, comandos reutilizáveis, permissões e histórico operacional dentro da rede do cliente.',
    },
    role: { en: 'Creator and product engineer', pt: 'Criador e engenheiro de produto' },
    period: { en: 'Independent product', pt: 'Produto independente' },
    context: {
      en: 'Infrastructure teams often split equipment records, credentials, command sequences, and session history across unrelated tools and personal notes.',
      pt: 'Equipes de infraestrutura frequentemente distribuem registros de equipamentos, credenciais, sequências de comandos e históricos de sessão entre ferramentas desconectadas e anotações pessoais.',
    },
    challenge: {
      en: 'Reduce the time needed to find the correct equipment and repeat sensitive operational routines without moving credentials or records outside the private network.',
      pt: 'Reduzir o tempo necessário para encontrar o equipamento correto e repetir rotinas operacionais sensíveis sem retirar credenciais ou registros da rede privada.',
    },
    solution: {
      en: 'A browser workspace with inventory, role-based access, up to four simultaneous terminals, controlled broadcast, shared command templates, and traceable session history. Licensing works through a signed file without continuous cloud access.',
      pt: 'Um workspace no navegador com inventário, acesso baseado em papéis, até quatro terminais simultâneos, broadcast controlado, templates de comandos compartilhados e histórico rastreável. O licenciamento funciona por arquivo assinado, sem acesso contínuo à nuvem.',
    },
    outcomes: {
      en: [
        'Supports operations across thousands of servers and internet infrastructure devices.',
        'In one provider workflow, the reported time to move user blocks fell from roughly eight minutes to two, depending on environment and standardization.',
        'Keeps application data, credentials, inventory, and logs inside the organization network.',
      ],
      pt: [
        'Suporta operações com milhares de servidores e equipamentos de infraestrutura de internet.',
        'Em um fluxo de provedor, o tempo relatado para mover blocos de usuários caiu de aproximadamente oito para dois minutos, dependendo do ambiente e da padronização.',
        'Mantém dados da aplicação, credenciais, inventário e registros dentro da rede da organização.',
      ],
    },
    technologies: ['.NET Core', 'REST APIs', 'SSH', 'Telnet', 'RBAC', 'Automation'],
    image: '/images/work/edgedata-inventory.png',
    imageWidth: 1028,
    imageHeight: 715,
    imageAlt: {
      en: 'EdgeData private multi-session terminal interface',
      pt: 'Interface de terminal multissessão privado do EdgeData',
    },
    externalUrl: 'https://edgedata.com.br/',
    externalLabel: { en: 'Visit EdgeData', pt: 'Conhecer o EdgeData' },
    schemaType: 'SoftwareApplication',
  },
  {
    slug: 'academic-operations',
    title: 'Academic Operations Platform',
    eyebrow: { en: 'Affinity / Axians', pt: 'Affinity / Axians' },
    summary: {
      en: 'Digital enrollment, academic administration, and assessment journeys built for complex rules, secure access, documents, and long multi-step flows.',
      pt: 'Jornadas de matrícula digital, administração acadêmica e avaliação construídas para regras complexas, acesso seguro, documentos e fluxos longos com múltiplas etapas.',
    },
    role: { en: 'Senior Full Stack Developer', pt: 'Desenvolvedor Full Stack Sênior' },
    period: { en: 'Aug 2025 - Apr 2026', pt: 'Ago 2025 - Abr 2026' },
    context: {
      en: 'A large education operation needed modular interfaces and reliable APIs for students and administrative users working across long, stateful journeys.',
      pt: 'Uma grande operação educacional precisava de interfaces modulares e APIs confiáveis para alunos e usuários administrativos em jornadas longas e com múltiplos estados.',
    },
    challenge: {
      en: 'Coordinate documents, conditional validation, permissions, assessments, authentication, and integration contracts without making the experience brittle.',
      pt: 'Coordenar documentos, validações condicionais, permissões, avaliações, autenticação e contratos de integração sem tornar a experiência frágil.',
    },
    solution: {
      en: 'Reusable React interfaces, Zustand state patterns, responsive Tailwind layouts, Laravel REST APIs, business validation, authenticated endpoints, and RBAC across critical modules.',
      pt: 'Interfaces React reutilizáveis, padrões de estado com Zustand, layouts responsivos em Tailwind, APIs REST em Laravel, validações de negócio, endpoints autenticados e RBAC em módulos críticos.',
    },
    outcomes: {
      en: [
        'Contributed to delivering a project estimated at more than one year in approximately six months.',
        'Delivered more than 200 improvements and features across frontend and backend.',
        'Reduced friction in critical modules used by academic administrators.',
      ],
      pt: [
        'Participação na entrega, em aproximadamente seis meses, de um projeto estimado para mais de um ano.',
        'Entrega de mais de 200 melhorias e funcionalidades entre frontend e backend.',
        'Redução de fricção em módulos críticos utilizados pela administração acadêmica.',
      ],
    },
    technologies: ['React 19', 'TypeScript', 'Zustand', 'Tailwind CSS', 'Laravel 11', 'PHP 8.4', 'RBAC'],
    image: '/images/work/academic-operations-record.svg',
    imageWidth: 1200,
    imageHeight: 760,
    imageAlt: {
      en: 'Delivery record highlighting more than 200 improvements across a six-month academic platform project',
      pt: 'Registro de entrega destacando mais de 200 melhorias em seis meses de projeto de plataforma acadêmica',
    },
    schemaType: 'CreativeWork',
  },
  {
    slug: 'corporate-learning',
    title: 'Corporate Learning Ecosystems',
    eyebrow: { en: 'Revvo', pt: 'Revvo' },
    summary: {
      en: 'LMS and LXP platforms, learning journeys, dashboards, enterprise integrations, and applied AI delivered across corporate and educational contexts.',
      pt: 'Plataformas LMS e LXP, jornadas de aprendizagem, dashboards, integrações empresariais e IA aplicada em contextos corporativos e educacionais.',
    },
    role: { en: 'Senior Full Stack Developer', pt: 'Desenvolvedor Full Stack Sênior' },
    period: { en: 'Jun 2019 - Aug 2025', pt: 'Jun 2019 - Ago 2025' },
    context: {
      en: 'Large organizations needed learning platforms adapted to their identity, data, HR processes, reporting, and internal systems.',
      pt: 'Grandes organizações precisavam de plataformas de aprendizagem adaptadas à identidade, aos dados, aos processos de RH, aos relatórios e aos sistemas internos.',
    },
    challenge: {
      en: 'Connect courses, learning paths, certificates, rankings, gamification, reporting, and enterprise systems while keeping each client flow maintainable.',
      pt: 'Conectar cursos, trilhas, certificados, rankings, gamificação, relatórios e sistemas empresariais mantendo cada fluxo de cliente sustentável.',
    },
    solution: {
      en: 'Custom Moodle and LearningFlix experiences, React and Vue components, Laravel and Node.js APIs, dashboards, and integrations with ERP, CRM, BI, Microsoft Teams, Active Directory, and HR tools.',
      pt: 'Experiências personalizadas em Moodle e LearningFlix, componentes React e Vue, APIs Laravel e Node.js, dashboards e integrações com ERP, CRM, BI, Microsoft Teams, Active Directory e ferramentas de RH.',
    },
    outcomes: {
      en: [
        'Delivered more than 15 corporate and educational LMS projects.',
        'Contributed to the architecture and evolution of the JUDY AI assistant for learning interactions.',
        'Experience in projects for organizations including Santander, Coca-Cola, Renault, Hyundai, TIM, Embraer, Vale, Bradesco, PicPay, Safra, and SEBRAE.',
      ],
      pt: [
        'Entrega de mais de 15 projetos LMS corporativos e educacionais.',
        'Participação na arquitetura e evolução da assistente de IA JUDY para interações de aprendizagem.',
        'Experiência em projetos para organizações como Santander, Coca-Cola, Renault, Hyundai, TIM, Embraer, Vale, Bradesco, PicPay, Safra e SEBRAE.',
      ],
    },
    technologies: ['React', 'Vue.js', 'Laravel', 'Node.js', 'Moodle', 'SCORM', 'BI integrations', 'AI'],
    image: '/images/work/corporate-learning-record.svg',
    imageWidth: 1200,
    imageHeight: 760,
    imageAlt: {
      en: 'Delivery record highlighting more than 15 corporate and educational LMS projects from 2019 to 2025',
      pt: 'Registro de entrega destacando mais de 15 projetos LMS corporativos e educacionais entre 2019 e 2025',
    },
    schemaType: 'CreativeWork',
  },
  {
    slug: 'trinks',
    title: 'Trinks',
    eyebrow: { en: 'Beauty business platform', pt: 'Plataforma para negócios de beleza' },
    summary: {
      en: 'Administrative interfaces, online booking flows, responsive pages, and back-office tools for salons, clinics, studios, networks, and franchises.',
      pt: 'Interfaces administrativas, fluxos de agendamento online, páginas responsivas e ferramentas de backoffice para salões, clínicas, estúdios, redes e franquias.',
    },
    role: { en: 'Frontend Developer', pt: 'Desenvolvedor Frontend' },
    period: { en: 'Jun 2017 - May 2019', pt: 'Jun 2017 - Mai 2019' },
    context: {
      en: 'A broad management platform served daily operations across appointments, professionals, customers, services, finance, inventory, commissions, and communications.',
      pt: 'Uma plataforma ampla de gestão atendia operações diárias de agenda, profissionais, clientes, serviços, finanças, estoque, comissões e comunicação.',
    },
    challenge: {
      en: 'Make dense business workflows understandable and responsive while integrating booking experiences with channels customers already used.',
      pt: 'Tornar fluxos densos de negócio compreensíveis e responsivos, integrando o agendamento aos canais já utilizados pelos clientes.',
    },
    solution: {
      en: 'Administrative interfaces, back-office screens, responsive marketing pages, and booking flows connected to the business website, Instagram, Facebook, and Google Reserve.',
      pt: 'Interfaces administrativas, telas de backoffice, páginas de marketing responsivas e fluxos de agendamento conectados ao site do negócio, Instagram, Facebook e Google Reserve.',
    },
    outcomes: {
      en: [
        'Worked across operational modules including schedules, professionals, customers, reporting, finance, inventory, invoices, loyalty, and WhatsApp messaging.',
        'Supported web experiences for independent businesses, networks, and franchises.',
      ],
      pt: [
        'Atuação em módulos de agenda, profissionais, clientes, relatórios, finanças, estoque, notas fiscais, fidelidade e mensagens via WhatsApp.',
        'Suporte a experiências web para negócios independentes, redes e franquias.',
      ],
    },
    technologies: ['AngularJS', 'Vue.js', 'JavaScript', 'HTML5', 'CSS3', 'ASP.NET'],
    image: '/images/work/trinks.png',
    imageWidth: 1349,
    imageHeight: 616,
    imageAlt: { en: 'Trinks business platform landing page', pt: 'Landing page da plataforma de negócios Trinks' },
    externalUrl: 'https://www.trinks.com/negocios/programa-para-salao-de-beleza',
    externalLabel: { en: 'Visit Trinks', pt: 'Conhecer a Trinks' },
    schemaType: 'CreativeWork',
  },
  {
    slug: 'enterprise-operations',
    title: 'Enterprise Operations at Scale',
    eyebrow: { en: 'aspecTI / Grupo Profarma', pt: 'aspecTI / Grupo Profarma' },
    summary: {
      en: 'Operational platforms for service requests, dynamic workflows, field teams, time records, notifications, accounts, and maintenance across large organizations.',
      pt: 'Plataformas operacionais para chamados, workflows dinâmicos, equipes de campo, ponto, notificações, contas e manutenção em grandes organizações.',
    },
    role: { en: 'Full Stack Developer', pt: 'Desenvolvedor Full Stack' },
    period: { en: 'Jun 2014 - Jun 2017', pt: 'Jun 2014 - Jun 2017' },
    context: {
      en: 'Health, education, retail, engineering, and logistics operations required bespoke systems for high-volume internal processes and nationally used workflows.',
      pt: 'Operações de saúde, educação, varejo, engenharia e logística precisavam de sistemas sob medida para processos internos de alto volume e fluxos utilizados nacionalmente.',
    },
    challenge: {
      en: 'Translate varied approval rules, dynamic forms, team responsibilities, deadlines, and notifications into maintainable web and mobile workflows.',
      pt: 'Traduzir regras variadas de aprovação, formulários dinâmicos, responsabilidades de equipes, prazos e notificações em fluxos web e mobile sustentáveis.',
    },
    solution: {
      en: 'Requirements analysis, data modeling, APIs, administrative interfaces, dynamic forms, approval workflows, mobile applications, testing, deployment, and maintenance.',
      pt: 'Levantamento de requisitos, modelagem de dados, APIs, interfaces administrativas, formulários dinâmicos, workflows de aprovação, aplicações mobile, testes, implantação e manutenção.',
    },
    outcomes: {
      en: [
        'An integrated Grupo Profarma platform served more than 10,000 users.',
        'A retail maintenance system centralized accounts, alerts, history, due dates, and validation across 226 stores.',
        'Delivered operational systems for additional contexts including engineering, logistics, and public-facing complaint workflows.',
      ],
      pt: [
        'Uma plataforma integrada do Grupo Profarma atendeu mais de 10.000 usuários.',
        'Um sistema de manutenção centralizou contas, alertas, históricos, vencimentos e validações em 226 lojas.',
        'Entrega de sistemas operacionais para outros contextos, incluindo engenharia, logística e fluxos públicos de reclamação.',
      ],
    },
    technologies: ['ASP.NET MVC', 'ASP.NET Web API', 'C#', 'SQL Server', 'Entity Framework', 'Ionic', 'Vue.js'],
    image: '/images/work/enterprise-operations-record.svg',
    imageWidth: 1200,
    imageHeight: 760,
    imageAlt: {
      en: 'Delivery record highlighting more than 10,000 platform users and retail maintenance across 226 stores',
      pt: 'Registro de entrega destacando mais de 10.000 usuários da plataforma e manutenção em 226 lojas',
    },
    schemaType: 'CreativeWork',
  },
];

export const services: Service[] = [
  {
    slug: 'b2b-saas-internal-systems',
    index: '01',
    title: { en: 'B2B SaaS and internal systems', pt: 'SaaS B2B e sistemas internos' },
    summary: {
      en: 'Turn complex rules, permissions, approvals, and operational data into software teams can run every day.',
      pt: 'Transforme regras complexas, permissões, aprovações e dados operacionais em software que equipes usam todos os dias.',
    },
    idealFor: {
      en: ['New B2B products', 'Administrative portals', 'Operational workflows', 'Legacy process replacement'],
      pt: ['Novos produtos B2B', 'Portais administrativos', 'Fluxos operacionais', 'Substituição de processos legados'],
    },
    deliverables: {
      en: ['Product and technical discovery', 'Responsive frontend', 'APIs and integrations', 'Permissions and auditability'],
      pt: ['Descoberta de produto e técnica', 'Frontend responsivo', 'APIs e integrações', 'Permissões e rastreabilidade'],
    },
    evidence: ['edgedata', 'academic-operations', 'enterprise-operations'],
    technologies: ['React', 'Vue.js', 'Laravel', 'Node.js', '.NET/C#', 'PostgreSQL'],
  },
  {
    slug: 'ai-automation-rag',
    index: '02',
    title: { en: 'AI automation, RAG, and bots', pt: 'Automação com IA, RAG e bots' },
    summary: {
      en: 'Apply generative AI where it reduces repetitive work, improves access to knowledge, or accelerates operational decisions.',
      pt: 'Aplique IA generativa onde ela reduz trabalho repetitivo, melhora o acesso ao conhecimento ou acelera decisões operacionais.',
    },
    idealFor: {
      en: ['Knowledge assistants', 'Workflow automation', 'Telegram and WhatsApp bots', 'Predictive operational analysis'],
      pt: ['Assistentes de conhecimento', 'Automação de workflows', 'Bots para Telegram e WhatsApp', 'Análise operacional preditiva'],
    },
    deliverables: {
      en: ['Use-case validation', 'RAG and retrieval design', 'Human review paths', 'Observability and iteration plan'],
      pt: ['Validação do caso de uso', 'Design de RAG e recuperação', 'Fluxos de revisão humana', 'Plano de observabilidade e evolução'],
    },
    evidence: ['edgedata', 'corporate-learning'],
    technologies: ['RAG', 'Generative AI', 'Node.js', 'Python', 'Telegram', 'WhatsApp'],
  },
  {
    slug: 'lms-lxp-learning',
    index: '03',
    title: { en: 'LMS, LXP, and digital learning', pt: 'LMS, LXP e aprendizagem digital' },
    summary: {
      en: 'Build and evolve learning platforms with journeys, content, integrations, reporting, gamification, and AI.',
      pt: 'Construa e evolua plataformas de aprendizagem com jornadas, conteúdo, integrações, relatórios, gamificação e IA.',
    },
    idealFor: {
      en: ['Corporate learning', 'Educational portals', 'Moodle modernization', 'HR and BI integrations'],
      pt: ['Educação corporativa', 'Portais educacionais', 'Modernização de Moodle', 'Integrações com RH e BI'],
    },
    deliverables: {
      en: ['Custom learning journeys', 'Moodle and LXP interfaces', 'SCORM and enterprise integrations', 'Dashboards and reporting'],
      pt: ['Jornadas personalizadas', 'Interfaces Moodle e LXP', 'Integrações SCORM e empresariais', 'Dashboards e relatórios'],
    },
    evidence: ['corporate-learning', 'academic-operations'],
    technologies: ['Moodle', 'SCORM', 'React', 'Vue.js', 'Laravel', 'Node.js'],
  },
  {
    slug: 'mobile-integrations',
    index: '04',
    title: { en: 'Mobile applications and integrations', pt: 'Aplicações mobile e integrações' },
    summary: {
      en: 'Connect field operations, logistics, customers, and back-office systems through focused mobile experiences.',
      pt: 'Conecte operações de campo, logística, clientes e sistemas administrativos por meio de experiências mobile focadas.',
    },
    idealFor: {
      en: ['Field teams', 'Fleet and logistics', 'Customer self-service', 'Operational data capture'],
      pt: ['Equipes de campo', 'Frotas e logística', 'Autoatendimento de clientes', 'Coleta de dados operacionais'],
    },
    deliverables: {
      en: ['React Native application', 'Backend APIs', 'Authentication and offline-aware flows', 'Operational integrations'],
      pt: ['Aplicação React Native', 'APIs de backend', 'Autenticação e fluxos conscientes de conexão', 'Integrações operacionais'],
    },
    evidence: ['enterprise-operations'],
    technologies: ['React Native', 'Ionic', 'Node.js', 'REST APIs', 'SQL'],
  },
  {
    slug: 'frontend-modernization',
    index: '05',
    title: { en: 'Frontend and back-office modernization', pt: 'Modernização de frontend e backoffice' },
    summary: {
      en: 'Modernize dense interfaces and legacy platforms incrementally, without losing the business rules that keep operations running.',
      pt: 'Modernize interfaces densas e plataformas legadas de forma incremental, sem perder as regras que mantêm a operação funcionando.',
    },
    idealFor: {
      en: ['Legacy AngularJS or jQuery applications', 'Complex back-office interfaces', 'Responsive remediation', 'Incremental migrations'],
      pt: ['Aplicações legadas em AngularJS ou jQuery', 'Interfaces complexas de backoffice', 'Correção responsiva', 'Migrações incrementais'],
    },
    deliverables: {
      en: ['Interface audit', 'Migration sequence', 'Reusable component foundation', 'Accessibility and performance hardening'],
      pt: ['Auditoria de interface', 'Sequência de migração', 'Base de componentes reutilizáveis', 'Acessibilidade e performance'],
    },
    evidence: ['academic-operations', 'trinks', 'enterprise-operations'],
    technologies: ['React', 'Vue.js', 'TypeScript', 'AngularJS', 'Tailwind CSS', 'ASP.NET'],
  },
];

export const selectedWork = [
  {
    title: 'BWA Transportes',
    description: {
      en: 'React Native application and Node.js backend for fleet, route, driver, field-operation, and administrative data.',
      pt: 'Aplicação React Native e backend Node.js para dados de frota, rotas, motoristas, operações de campo e usuários administrativos.',
    },
    technologies: ['React Native', 'Node.js', 'REST APIs'],
  },
  {
    title: 'Avanutri',
    description: {
      en: 'Web management screens and a mobile application for nutrition professionals and administrative workflows.',
      pt: 'Telas de gestão web e aplicação mobile para profissionais de nutrição e fluxos administrativos.',
    },
    technologies: ['Web', 'Mobile', 'Administrative systems'],
  },
];

export const timeline = [
  { period: '2025-2026', company: 'Affinity / Axians', role: { en: 'Senior Full Stack Developer', pt: 'Desenvolvedor Full Stack Sênior' } },
  { period: '2019-2025', company: 'Revvo', role: { en: 'Senior Full Stack Developer', pt: 'Desenvolvedor Full Stack Sênior' } },
  { period: '2017-2019', company: 'Trinks', role: { en: 'Frontend Developer', pt: 'Desenvolvedor Frontend' } },
  { period: '2014-2017', company: 'aspecTI', role: { en: 'Full Stack Developer', pt: 'Desenvolvedor Full Stack' } },
];

export const clients = ['Santander', 'Coca-Cola', 'Renault', 'Hyundai', 'TIM', 'Embraer', 'Vale', 'Bradesco', 'PicPay', 'Safra', 'GOL', 'Grupo Boticário', 'SEBRAE'];

export const copy = {
  en: {
    localeName: 'EN',
    switchLocale: 'Português',
    skip: 'Skip to content',
    nav: { work: 'Work', services: 'Services', about: 'About', cv: 'CV', agents: 'For agents', contact: 'Contact' },
    availability: 'Available for remote freelance projects',
    heroTitle: 'I build the software behind complex operations.',
    heroIntro: 'Senior software engineer with 10+ years across B2B SaaS, internal platforms, learning ecosystems, mobile applications, and AI automation.',
    discuss: 'Discuss a project',
    seeWork: 'See selected work',
    proofTitle: 'Evidence, not a logo wall.',
    proofIntro: 'Five cases show the systems, constraints, responsibilities, and measurable outcomes behind the work.',
    servicesTitle: 'Where I can help.',
    servicesIntro: 'Focused engagements grounded in work already delivered across complex operations.',
    viewCase: 'Read case study',
    viewService: 'Explore service',
    workTitle: 'Selected work',
    workIntro: 'Products and platforms built for operations where permissions, integrations, workflows, and reliability matter.',
    servicesPageTitle: 'Services built around real operational problems',
    servicesPageIntro: 'Each offer is connected to cases Rafael has already delivered. No fictional portfolio pieces, no generic capability claims.',
    aboutTitle: 'Engineering that starts with the operation',
    aboutIntro: 'Rafael Sant\' Anna is a senior software engineer based in Viseu, Portugal. He has more than 10 years of experience turning complex processes into maintainable web, mobile, and AI-enabled products.',
    cvTitle: 'Curriculum vitae',
    contactTitle: 'Bring the difficult part.',
    contactIntro: 'Share the operation, constraint, or product you need to improve. Rafael is available for remote freelance projects with clear ownership and senior execution.',
    agentTitle: 'A clear brief for humans and agents',
    agentIntro: 'This page contains the factual information needed to evaluate Rafael for a project. It does not expose a booking API or pretend to be an autonomous service.',
    outcomes: 'Outcomes',
    challenge: 'The operational challenge',
    solution: 'What was built',
    context: 'Context',
    technologies: 'Technology',
    fit: 'Good fit for',
    deliverables: 'Typical delivery',
    evidence: 'Related evidence',
    downloadCv: 'Download CV as PDF',
    email: 'Email Rafael',
    whatsapp: 'Message on WhatsApp',
    backWork: 'Back to work',
    backServices: 'Back to services',
    footerLine: 'Senior engineering for complex operations.',
  },
  pt: {
    localeName: 'PT',
    switchLocale: 'English',
    skip: 'Pular para o conteúdo',
    nav: { work: 'Projetos', services: 'Serviços', about: 'Sobre', cv: 'CV', agents: 'Para agentes', contact: 'Contato' },
    availability: 'Disponível para projetos freelance remotos',
    heroTitle: 'Eu construo o software por trás de operações complexas.',
    heroIntro: 'Engenheiro de software sênior com mais de 10 anos em SaaS B2B, plataformas internas, ecossistemas de aprendizagem, aplicações mobile e automação com IA.',
    discuss: 'Conversar sobre um projeto',
    seeWork: 'Ver projetos selecionados',
    proofTitle: 'Evidências, não uma parede de logos.',
    proofIntro: 'Cinco cases mostram sistemas, restrições, responsabilidades e resultados mensuráveis por trás do trabalho.',
    servicesTitle: 'Onde posso ajudar.',
    servicesIntro: 'Projetos focados, apoiados em entregas reais para operações complexas.',
    viewCase: 'Ler o case',
    viewService: 'Explorar serviço',
    workTitle: 'Projetos selecionados',
    workIntro: 'Produtos e plataformas construídos para operações em que permissões, integrações, workflows e confiabilidade importam.',
    servicesPageTitle: 'Serviços construídos em torno de problemas operacionais reais',
    servicesPageIntro: 'Cada oferta está conectada a cases já entregues por Rafael. Sem projetos fictícios e sem alegações genéricas de capacidade.',
    aboutTitle: 'Engenharia que começa pela operação',
    aboutIntro: 'Rafael Sant\' Anna é um engenheiro de software sênior baseado em Viseu, Portugal. Possui mais de 10 anos de experiência transformando processos complexos em produtos web, mobile e habilitados por IA.',
    cvTitle: 'Currículo profissional',
    contactTitle: 'Traga a parte difícil.',
    contactIntro: 'Compartilhe a operação, a restrição ou o produto que você precisa melhorar. Rafael está disponível para projetos freelance remotos, com responsabilidade clara e execução sênior.',
    agentTitle: 'Um briefing claro para pessoas e agentes',
    agentIntro: 'Esta página contém as informações factuais necessárias para avaliar Rafael em um projeto. Ela não expõe uma API de agendamento nem finge ser um serviço autônomo.',
    outcomes: 'Resultados',
    challenge: 'O desafio operacional',
    solution: 'O que foi construído',
    context: 'Contexto',
    technologies: 'Tecnologias',
    fit: 'Ideal para',
    deliverables: 'Entrega típica',
    evidence: 'Evidências relacionadas',
    downloadCv: 'Baixar CV em PDF',
    email: 'Enviar email',
    whatsapp: 'Conversar no WhatsApp',
    backWork: 'Voltar aos projetos',
    backServices: 'Voltar aos serviços',
    footerLine: 'Engenharia sênior para operações complexas.',
  },
} as const;

export function localize<T extends LocalizedText>(value: T, locale: Locale): string {
  return value[locale];
}

export function withLocale(locale: Locale, path = ''): string {
  const normalized = path.replace(/^\/+|\/+$/g, '');
  const prefix = locale === 'pt' ? '/pt' : '';
  return `${prefix}/${normalized}${normalized ? '/' : ''}`;
}

export function alternatePath(locale: Locale, path: string): string {
  return withLocale(locale === 'en' ? 'pt' : 'en', path);
}
