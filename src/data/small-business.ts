import type { Locale, LocalizedList, LocalizedText } from './types';
import type { FaqItem } from './faq';

/** Commercial terms of the small-business website offer. Every price shown on the site comes from here. */
export const offer = {
  price: 700,
  lodgingPrice: 1200,
  extrasFrom: 1500,
  auditPrice: 390,
  renewalPerYear: 180,
  maintenancePerMonth: 89,
  portugalFromEuro: 250,
  businessDays: 3,
  revisionRounds: 2,
};

export const brl = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

export interface Niche {
  slug: string;
  /** Demo project that shows this niche working. */
  demo: string;
  /** Page heading and title, written the way owners search. */
  title: LocalizedText;
  /** Short label for cards and links. */
  label: LocalizedText;
  /** The demo's signature interaction, in one short line for cards. */
  tryOut: LocalizedText;
  description: LocalizedText;
  lede: LocalizedText;
  price: number;
  reasons: Record<Locale, { title: string; text: string }[]>;
  includes: LocalizedList;
  /** Related searches the page answers, shown as plain text for people and search engines. */
  searches: LocalizedList;
  faq: Record<Locale, FaqItem[]>;
}

export const niches: Niche[] = [
  {
    slug: 'ar-condicionado',
    demo: 'climatizacao-local',
    title: { pt: 'Site para empresa de ar-condicionado e climatização', en: 'Website for air-conditioning and HVAC companies' },
    label: { pt: 'Ar-condicionado e climatização', en: 'Air conditioning and HVAC' },
    tryOut: { pt: 'Guia de sintomas e pedido de orçamento', en: 'Symptom guide and quote request' },
    description: {
      pt: 'Site para empresa de instalação, limpeza e conserto de ar-condicionado, com serviços, preços de partida, bairros atendidos e botão de orçamento no WhatsApp. Pronto em 3 dias úteis, a partir de R$ 700.',
      en: 'Website for air-conditioning installation, cleaning, and repair companies, with services, starting prices, service areas, and a WhatsApp quote button. Ready in 3 business days, from R$ 700.',
    },
    lede: {
      pt: 'Quem está com o ar parado no calor quer saber três coisas: se você atende o bairro dele, quanto custa mais ou menos e como chamar. A página responde isso antes da primeira mensagem.',
      en: 'Someone with a broken unit in the heat wants to know three things: whether you cover their area, roughly how much it costs, and how to reach you. The page answers that before the first message.',
    },
    price: offer.price,
    reasons: {
      pt: [
        { title: 'Aparece para quem pesquisa', text: 'Muita gente procura "instalação de ar-condicionado" com o nome da cidade, no Google ou perguntando para o ChatGPT. Um site com serviços e bairros em texto ajuda a sua empresa a ser encontrada e indicada.' },
        { title: 'Orçamento que já chega com contexto', text: 'O cliente escolhe o serviço, conta o sintoma e o tamanho do ambiente. O técnico responde mais rápido e chega sabendo o que levar.' },
        { title: 'Uma instalação paga a página', text: 'Com instalação a partir de algumas centenas de reais, um único serviço fechado pelo site cobre o investimento.' },
      ],
      en: [
        { title: 'Found by people who search', text: 'Many people search for "air conditioning installation" plus their city, on Google or by asking ChatGPT. A site with services and areas written as text helps your company get found and recommended.' },
        { title: 'Quotes that arrive with context', text: 'The customer picks the service and describes the symptom and room size. The technician answers faster and arrives with the right material.' },
        { title: 'One installation pays for it', text: 'With installations starting at a few hundred reais, one job closed through the site covers the cost.' },
      ],
    },
    includes: {
      pt: ['Instalação, limpeza, conserto e PMOC com preço de partida', 'Bairros e cidades que você atende', 'Guia de sintomas: pingando, não gela, barulho, cheiro', 'Tabela de BTUs como referência para o cliente', 'Garantia, prazo de visita e marcas com que trabalha', 'Botão de orçamento direto no seu WhatsApp'],
      en: ['Installation, cleaning, repair, and maintenance plans with starting prices', 'Neighborhoods and cities you cover', 'Symptom guide: dripping, not cooling, noise, smell', 'BTU table as a reference for customers', 'Warranty, visit timing, and brands you work with', 'Quote button straight to your WhatsApp'],
    },
    searches: {
      pt: ['site para empresa de ar-condicionado', 'site para técnico de refrigeração', 'landing page para climatização', 'site para instalação de split'],
      en: ['website for air-conditioning company', 'website for refrigeration technician', 'HVAC landing page', 'split installation website'],
    },
    faq: {
      pt: [
        { question: 'Dá para mostrar preço se cada instalação é diferente?', answer: 'Sim, com preço de partida. Por exemplo, instalação de split até 12.000 BTUs a partir de um valor, com o que está incluso. O cliente entende a faixa e o orçamento final continua com você.' },
        { question: 'Atendo várias cidades. Cabe tudo numa página?', answer: 'Cabe. A página lista as cidades e os bairros atendidos em texto, o que também ajuda na busca por região.' },
        { question: 'Já tenho Instagram com fotos dos serviços. Preciso do site?', answer: 'O Instagram continua. O site entra para quem pesquisa no Google e para você conseguir anunciar mandando o cliente para uma página com preço, região e botão de orçamento.' },
      ],
      en: [
        { question: 'Can I show prices if every installation is different?', answer: 'Yes, as starting prices. For example, split installation up to 12,000 BTU from a given amount, with what is included. The customer understands the range and the final quote stays with you.' },
        { question: 'I cover several cities. Does it all fit on one page?', answer: 'It does. The page lists the cities and neighborhoods you cover as text, which also helps local search.' },
        { question: 'I already have Instagram with photos of my work. Do I need a site?', answer: 'Instagram stays. The site serves people who search on Google and lets you run ads that send customers to a page with prices, areas, and a quote button.' },
      ],
    },
  },
  {
    slug: 'pousada',
    demo: 'pousada-boutique',
    title: { pt: 'Site para pousada com reserva direta', en: 'Website for guesthouses with direct booking' },
    label: { pt: 'Pousadas e chalés', en: 'Guesthouses and cabins' },
    tryOut: { pt: 'Galeria das suítes e pedido de reserva direta', en: 'Suite gallery and direct booking request' },
    description: {
      pt: 'Site para pousada e chalé com suítes, fotos, regras da casa e pedido de reserva direto no WhatsApp, para o hóspede fechar sem pagar comissão de plataforma. A partir de R$ 1.200.',
      en: 'Website for guesthouses and cabins with suites, photos, house rules, and a direct booking request on WhatsApp, so guests book without platform commission. From R$ 1,200.',
    },
    lede: {
      pt: 'Cada reserva que chega pelo Booking ou Airbnb deixa uma parte do valor na plataforma. Um site próprio dá ao hóspede um caminho direto e bonito para falar com a casa.',
      en: 'Every booking through Booking or Airbnb leaves part of the rate with the platform. Your own site gives guests a direct, good-looking way to reach you.',
    },
    price: offer.lodgingPrice,
    reasons: {
      pt: [
        { title: 'Reserva direta, sem comissão', text: 'O hóspede que já conhece a pousada, ou que achou pelo Instagram, fecha com você pelo WhatsApp em vez de passar pela plataforma.' },
        { title: 'A atmosfera que a foto do anúncio não mostra', text: 'Suítes, café da manhã, arredores e regras da casa contados do seu jeito, com fotos grandes e sem o layout padrão das plataformas.' },
        { title: 'Pedido que chega completo', text: 'Datas, número de pessoas, suíte e pedidos especiais já vêm na mensagem. Menos ida e volta para confirmar.' },
      ],
      en: [
        { title: 'Direct booking, no commission', text: 'Guests who already know the house, or found it on Instagram, book with you on WhatsApp instead of going through a platform.' },
        { title: 'The atmosphere a listing cannot show', text: 'Suites, breakfast, surroundings, and house rules told your way, with large photos and without the platforms\' standard layout.' },
        { title: 'Requests that arrive complete', text: 'Dates, number of guests, suite, and special requests are already in the message. Less back-and-forth to confirm.' },
      ],
    },
    includes: {
      pt: ['Suítes com fotos, capacidade e diária a partir de', 'Galeria da casa, café da manhã e áreas comuns', 'Arredores, passeios e como chegar', 'Regras da casa, check-in, check-out e pets', 'Pedido de reserva com datas, pessoas e suíte', 'Botão para o WhatsApp da recepção'],
      en: ['Suites with photos, capacity, and rates from', 'Gallery of the house, breakfast, and common areas', 'Surroundings, outings, and directions', 'House rules, check-in, check-out, and pets', 'Booking request with dates, guests, and suite', 'Button to the front desk WhatsApp'],
    },
    searches: {
      pt: ['site para pousada', 'site de reserva direta para pousada', 'site para chalé', 'landing page para hospedagem'],
      en: ['guesthouse website', 'direct booking website', 'cabin rental website', 'lodging landing page'],
    },
    faq: {
      pt: [
        { question: 'O site tem motor de reserva com calendário?', answer: 'O pacote padrão tem pedido de reserva pelo WhatsApp: o hóspede escolhe datas, pessoas e suíte e você confirma. Calendário com disponibilidade e pagamento online é um projeto à parte.' },
        { question: 'Vou ter que sair do Booking?', answer: 'Não. As plataformas continuam trazendo hóspede novo. O site serve para quem já quer falar direto com você, e para você divulgar no Instagram e no Google.' },
        { question: 'Posso trocar as diárias na alta temporada?', answer: 'Pode. Você me manda os valores novos e eu atualizo. Com o plano de manutenção, as trocas do mês já estão incluídas.' },
      ],
      en: [
        { question: 'Does the site have a booking engine with a calendar?', answer: 'The standard package has a WhatsApp booking request: the guest picks dates, guests, and suite, and you confirm. A calendar with live availability and online payment is a separate project.' },
        { question: 'Do I have to leave Booking?', answer: 'No. Platforms keep bringing new guests. The site is for people who already want to talk to you directly, and for you to share on Instagram and Google.' },
        { question: 'Can I change rates in high season?', answer: 'Yes. Send me the new values and I update them. With the maintenance plan, monthly changes are included.' },
      ],
    },
  },
  {
    slug: 'academia-de-luta',
    demo: 'academia-luta',
    title: { pt: 'Site para academia de jiu-jitsu, muay thai e artes marciais', en: 'Website for jiu-jitsu, muay thai, and martial arts gyms' },
    label: { pt: 'Academias de luta', en: 'Martial arts gyms' },
    tryOut: { pt: 'Grade de horários e aula experimental', en: 'Class timetable and trial class' },
    description: {
      pt: 'Site para academia de luta com modalidades, grade de horários, planos e botão de aula experimental no WhatsApp. Pronto em 3 dias úteis, a partir de R$ 700.',
      en: 'Website for martial arts gyms with classes, weekly timetable, plans, and a WhatsApp trial class button. Ready in 3 business days, from R$ 700.',
    },
    lede: {
      pt: 'Quem nunca treinou chega com medo de não acompanhar. A página mostra as turmas para iniciante, os horários e como é a primeira aula, e convida para a experimental.',
      en: 'People who have never trained worry they will not keep up. The page shows beginner classes, the timetable, and what the first class is like, and invites them to a trial.',
    },
    price: offer.price,
    reasons: {
      pt: [
        { title: 'Horário é a primeira pergunta', text: 'A grade da semana filtrada por modalidade e nível responde sozinha a pergunta que mais chega no direct.' },
        { title: 'Aula experimental com um toque', text: 'O aluno escolhe a turma e o horário e a mensagem já chega pronta no seu WhatsApp.' },
        { title: 'Pais encontram o kids', text: 'Turma infantil, idade mínima e o que a criança aprende ficam explicados para quem pesquisa "jiu-jitsu infantil" na cidade.' },
      ],
      en: [
        { title: 'Schedule is the first question', text: 'A weekly timetable filtered by class and level answers the question that fills your inbox.' },
        { title: 'Trial class in one tap', text: 'The student picks the class and time and the message arrives ready on your WhatsApp.' },
        { title: 'Parents find the kids program', text: 'Kids classes, minimum age, and what children learn are explained for parents searching for "kids jiu-jitsu" in town.' },
      ],
    },
    includes: {
      pt: ['Modalidades com nível e faixa etária', 'Grade semanal de horários', 'Planos e mensalidades a partir de', 'Como funciona a primeira aula e o que levar', 'Graduação e regras do tatame', 'Botão de aula experimental no WhatsApp'],
      en: ['Classes with level and age group', 'Weekly timetable', 'Plans and monthly fees from', 'What the first class is like and what to bring', 'Belt system and mat rules', 'Trial class button on WhatsApp'],
    },
    searches: {
      pt: ['site para academia de jiu-jitsu', 'site para academia de muay thai', 'site para academia de artes marciais', 'landing page para academia de luta'],
      en: ['jiu-jitsu gym website', 'muay thai gym website', 'martial arts school website', 'fight gym landing page'],
    },
    faq: {
      pt: [
        { question: 'Mudo a grade de horários com frequência. Como fica?', answer: 'Os horários ficam num lugar só do site e a troca é rápida. Com o plano de manutenção, as mudanças do mês estão incluídas.' },
        { question: 'Dá para separar adulto e kids?', answer: 'Dá. A página pode ter seções e filtros diferentes para adulto, feminino e kids, cada um com seus horários e planos.' },
        { question: 'O aluno consegue pagar a mensalidade pelo site?', answer: 'No pacote padrão, não: o site leva para o WhatsApp. Pagamento recorrente e área do aluno são um projeto à parte.' },
      ],
      en: [
        { question: 'I change the timetable often. How does that work?', answer: 'The timetable lives in one place on the site and changes are quick. With the maintenance plan, monthly changes are included.' },
        { question: 'Can adults and kids be separate?', answer: 'Yes. The page can have separate sections and filters for adults, women, and kids, each with its own times and plans.' },
        { question: 'Can students pay the monthly fee on the site?', answer: 'Not in the standard package: the site leads to WhatsApp. Recurring payments and a student area are a separate project.' },
      ],
    },
  },
  {
    slug: 'escola-de-danca',
    demo: 'escola-danca',
    title: { pt: 'Site para escola de dança e estúdio de dança', en: 'Website for dance schools and studios' },
    label: { pt: 'Escolas de dança', en: 'Dance schools' },
    tryOut: { pt: 'Teste de ritmo e grade da semana', en: 'Style quiz and weekly schedule' },
    description: {
      pt: 'Site para escola de dança com ritmos, turmas por idade, horários, planos e botão de aula experimental no WhatsApp. Pronto em 3 dias úteis, a partir de R$ 700.',
      en: 'Website for dance schools with styles, classes by age, schedule, plans, and a WhatsApp trial class button. Ready in 3 business days, from R$ 700.',
    },
    lede: {
      pt: 'Tem gente que quer dançar e não sabe por onde começar, nem se precisa levar par. A página apresenta os ritmos, tira essas dúvidas e leva para a primeira aula.',
      en: 'Some people want to dance but do not know where to start, or whether they need a partner. The page presents the styles, answers those questions, and leads to the first class.',
    },
    price: offer.price,
    reasons: {
      pt: [
        { title: 'Cada ritmo com a sua cara', text: 'Ballet, jazz, dança de salão, hip hop: cada turma com foto, idade, nível e horário, sem o cliente precisar perguntar.' },
        { title: 'Ajuda quem está em dúvida', text: 'Um teste rápido sugere o ritmo pelo jeito da pessoa. É conteúdo que segura a visita e termina na aula experimental.' },
        { title: 'Pais e adultos no mesmo lugar', text: 'Turma infantil, turma para iniciantes adultos e aula particular para noivos ficam explicadas em uma página só.' },
      ],
      en: [
        { title: 'Each style its own look', text: 'Ballet, jazz, ballroom, hip hop: each class with a photo, age, level, and schedule, without the customer having to ask.' },
        { title: 'Helps people who are unsure', text: 'A quick quiz suggests a style based on the person. It keeps visitors on the page and ends at the trial class.' },
        { title: 'Parents and adults in one place', text: 'Kids classes, adult beginners, and private lessons for couples are all explained on one page.' },
      ],
    },
    includes: {
      pt: ['Ritmos com foto, idade e nível', 'Horários por dia da semana', 'Planos por frequência', 'Respostas para "preciso de par?" e "que roupa usar?"', 'Festival ou mostra de fim de ano', 'Botão de aula experimental no WhatsApp'],
      en: ['Styles with photo, age, and level', 'Schedule by day of the week', 'Plans by frequency', 'Answers to "do I need a partner?" and "what should I wear?"', 'Year-end recital or show', 'Trial class button on WhatsApp'],
    },
    searches: {
      pt: ['site para escola de dança', 'site para estúdio de dança', 'site para escola de ballet', 'landing page para dança de salão'],
      en: ['dance school website', 'dance studio website', 'ballet school website', 'ballroom dance landing page'],
    },
    faq: {
      pt: [
        { question: 'Tenho muitos ritmos e professores. Fica confuso?', answer: 'Não. Os ritmos ficam em cartões separados e a grade de horários é organizada por dia, com filtro. O visitante acha só o que procura.' },
        { question: 'Dá para usar os vídeos do Instagram?', answer: 'Dá. Os vídeos que vocês já postam podem entrar na página, junto com as fotos das turmas.' },
        { question: 'Posso divulgar o festival de fim de ano no site?', answer: 'Pode. Entra uma seção com data, local e como participar, e ela pode ser atualizada a cada ano.' },
      ],
      en: [
        { question: 'I have many styles and teachers. Will it be confusing?', answer: 'No. Styles are in separate cards and the timetable is organized by day, with a filter. Visitors find only what they are looking for.' },
        { question: 'Can I use our Instagram videos?', answer: 'Yes. The videos you already post can go on the page, together with photos of the classes.' },
        { question: 'Can I promote the year-end recital on the site?', answer: 'Yes. A section with date, venue, and how to take part can be added and updated every year.' },
      ],
    },
  },
  {
    slug: 'escola-de-musica',
    demo: 'escola-musica',
    title: { pt: 'Site para escola de música e aulas de instrumento', en: 'Website for music schools and instrument lessons' },
    label: { pt: 'Escolas de música', en: 'Music schools' },
    tryOut: { pt: 'Teclado que toca e escolha do curso', en: 'Playable keyboard and course finder' },
    description: {
      pt: 'Site para escola de música e professor de instrumento com cursos, formatos de aula, preços e botão de aula experimental no WhatsApp. Pronto em 3 dias úteis, a partir de R$ 700.',
      en: 'Website for music schools and instrument teachers with courses, lesson formats, prices, and a WhatsApp trial lesson button. Ready in 3 business days, from R$ 700.',
    },
    lede: {
      pt: 'Adulto que sempre quis tocar e pai procurando musicalização para o filho pesquisam do mesmo jeito: "aula de violão" ou "aula de piano" na cidade. A página mostra os cursos e tira o medo de começar.',
      en: 'An adult who always wanted to play and a parent looking for early music classes search the same way: "guitar lessons" or "piano lessons" in town. The page shows the courses and takes the fear out of starting.',
    },
    price: offer.price,
    reasons: {
      pt: [
        { title: 'Um curso para cada pessoa', text: 'Violão, piano, canto, bateria, musicalização infantil: cada curso com idade, formato e preço a partir de.' },
        { title: 'Experiência que vende a aula', text: 'Um teclado que toca de verdade na página faz o visitante querer experimentar. É o tipo de detalhe que vira assunto e indicação.' },
        { title: 'Funciona para escola e para professor', text: 'Serve tanto para a escola com vários professores quanto para o professor que dá aula em casa ou online.' },
      ],
      en: [
        { title: 'A course for every person', text: 'Guitar, piano, voice, drums, early childhood music: each course with age, format, and starting price.' },
        { title: 'An experience that sells the lesson', text: 'A keyboard that actually plays on the page makes visitors want to try. That kind of detail gets talked about and shared.' },
        { title: 'Works for schools and teachers', text: 'It fits a school with several teachers and a teacher who gives lessons at home or online.' },
      ],
    },
    includes: {
      pt: ['Cursos por instrumento e idade', 'Aula individual, em dupla e em turma', 'Preços a partir de e o que está incluso', 'Recital, estúdio e aula online, se houver', 'Respostas para "preciso ter instrumento?"', 'Botão de aula experimental no WhatsApp'],
      en: ['Courses by instrument and age', 'Private, paired, and group lessons', 'Starting prices and what is included', 'Recital, practice studio, and online lessons, if offered', 'Answers to "do I need my own instrument?"', 'Trial lesson button on WhatsApp'],
    },
    searches: {
      pt: ['site para escola de música', 'site para professor de violão', 'site para aula de piano', 'site para professor de canto'],
      en: ['music school website', 'guitar teacher website', 'piano lessons website', 'singing teacher website'],
    },
    faq: {
      pt: [
        { question: 'Sou professor autônomo. O site serve para mim?', answer: 'Serve. A página fica com o seu nome, os instrumentos que você ensina, onde dá aula e os horários livres.' },
        { question: 'Dou aula online também. Dá para mostrar?', answer: 'Dá. Os cursos online entram com o mesmo destaque, o que abre a página para alunos de outras cidades.' },
        { question: 'Os alunos conseguem marcar a aula sozinhos?', answer: 'No pacote padrão, o aluno escolhe o curso e o período e a mensagem chega no seu WhatsApp. Agenda online com horários livres é um projeto à parte.' },
      ],
      en: [
        { question: 'I am an independent teacher. Does this work for me?', answer: 'Yes. The page carries your name, the instruments you teach, where you teach, and your open times.' },
        { question: 'I also teach online. Can that be shown?', answer: 'Yes. Online courses get the same prominence, which opens the page to students in other cities.' },
        { question: 'Can students book lessons on their own?', answer: 'In the standard package, the student picks the course and period and the message arrives on your WhatsApp. An online calendar with open slots is a separate project.' },
      ],
    },
  },
  {
    slug: 'pet-shop',
    demo: 'creche-pet',
    title: { pt: 'Site para pet shop, banho e tosa e creche para cães', en: 'Website for pet shops, grooming, and dog daycare' },
    label: { pt: 'Pet shop, banho e tosa', en: 'Pet grooming and daycare' },
    tryOut: { pt: 'Preço por porte e rotina do dia', en: 'Prices by size and daily routine' },
    description: {
      pt: 'Site para pet shop, banho e tosa, creche e hotel para cães com preços por porte, regras, rotina e botão de agendamento no WhatsApp. Pronto em 3 dias úteis, a partir de R$ 700.',
      en: 'Website for pet shops, grooming, dog daycare, and boarding with prices by size, rules, daily routine, and a WhatsApp booking button. Ready in 3 business days, from R$ 700.',
    },
    lede: {
      pt: 'O tutor só deixa o cachorro com quem passa confiança. A página mostra o espaço, a rotina, as regras e o preço por porte, e o primeiro contato já começa tranquilo.',
      en: 'Owners only leave their dog with people they trust. The page shows the space, the routine, the rules, and prices by size, so the first contact starts calm.',
    },
    price: offer.price,
    reasons: {
      pt: [
        { title: 'Preço por porte sem perguntar', text: 'Banho, tosa e diária da creche aparecem por porte e pelagem, e o tutor vê na hora quanto fica.' },
        { title: 'Confiança antes da visita', text: 'Fotos do espaço, rotina do dia, vacinas exigidas e avaliação de adaptação explicadas de um jeito leve.' },
        { title: 'Agendamento organizado', text: 'Nome do tutor, do cão, porte e serviço já chegam na mensagem. Sem perder pedido no meio do WhatsApp.' },
      ],
      en: [
        { title: 'Prices by size without asking', text: 'Bath, grooming, and daycare rates appear by size and coat, and owners see the price right away.' },
        { title: 'Trust before the visit', text: 'Photos of the space, the daily routine, required vaccines, and the adaptation assessment explained in a friendly way.' },
        { title: 'Organized bookings', text: 'Owner name, dog name, size, and service arrive in the message. No requests lost in the WhatsApp scroll.' },
      ],
    },
    includes: {
      pt: ['Banho, tosa, creche e hotel com preço por porte', 'Rotina do dia e fotos do espaço', 'Vacinas, antipulgas e regras de convivência', 'Táxi pet e horários', 'Avaliação de adaptação para a creche', 'Botão de agendamento no WhatsApp'],
      en: ['Bath, grooming, daycare, and boarding priced by size', 'Daily routine and photos of the space', 'Vaccines, flea treatment, and group rules', 'Pet taxi and opening hours', 'Adaptation assessment for daycare', 'Booking button on WhatsApp'],
    },
    searches: {
      pt: ['site para pet shop', 'site para banho e tosa', 'site para creche de cachorro', 'site para hotel para cães'],
      en: ['pet shop website', 'dog grooming website', 'dog daycare website', 'dog boarding website'],
    },
    faq: {
      pt: [
        { question: 'Tenho loja e banho e tosa. Dá para mostrar os dois?', answer: 'Dá. O foco da página fica nos serviços com agendamento, e a loja entra como uma seção com o que vocês vendem e o horário.' },
        { question: 'Os preços mudam por raça. Como mostrar?', answer: 'Com preço de partida por porte e pelagem, e uma nota de que raças específicas são confirmadas no atendimento.' },
        { question: 'Dá para fazer uma loja virtual de ração?', answer: 'Loja com carrinho e pagamento é um projeto à parte. A página padrão leva o pedido para o WhatsApp.' },
      ],
      en: [
        { question: 'I have a store and grooming. Can both be shown?', answer: 'Yes. The page focuses on bookable services, and the store gets a section with what you sell and opening hours.' },
        { question: 'Prices change by breed. How do I show that?', answer: 'With starting prices by size and coat, and a note that specific breeds are confirmed when booking.' },
        { question: 'Can I have an online store for pet food?', answer: 'A store with a cart and payment is a separate project. The standard page sends orders to WhatsApp.' },
      ],
    },
  },
  {
    slug: 'estetica-automotiva',
    demo: 'estetica-automotiva',
    title: { pt: 'Site para estética automotiva e lava-rápido', en: 'Website for car detailing and car wash businesses' },
    label: { pt: 'Estética automotiva', en: 'Car detailing' },
    tryOut: { pt: 'Antes e depois e orçamento por porte', en: 'Before and after and quote by car size' },
    description: {
      pt: 'Site para estética automotiva e lava-rápido com serviços, preços por porte do carro, antes e depois e botão de orçamento no WhatsApp. Pronto em 3 dias úteis, a partir de R$ 700.',
      en: 'Website for car detailing and car wash businesses with services, prices by car size, before and after, and a WhatsApp quote button. Ready in 3 business days, from R$ 700.',
    },
    lede: {
      pt: 'Polimento, vitrificação e higienização são serviços que o cliente precisa ver para acreditar. A página mostra o resultado, explica cada serviço e já monta o orçamento pelo porte do carro.',
      en: 'Polishing, ceramic coating, and interior cleaning are services customers need to see to believe. The page shows results, explains each service, and builds a quote by car size.',
    },
    price: offer.price,
    reasons: {
      pt: [
        { title: 'O antes e depois vende sozinho', text: 'Um comparador que o cliente arrasta mostra o farol ou a pintura antes e depois do serviço.' },
        { title: 'Orçamento por porte do carro', text: 'Hatch, sedã, SUV ou picape: o cliente marca os serviços e vê o valor de partida e o prazo.' },
        { title: 'Explica o que vale cada serviço', text: 'Diferença entre cera e vitrificação, quanto tempo dura, cuidados depois. É o que justifica o preço de um trabalho bem feito.' },
      ],
      en: [
        { title: 'Before and after sells itself', text: 'A slider customers drag shows the headlight or paint before and after the service.' },
        { title: 'Quotes by car size', text: 'Hatchback, sedan, SUV, or pickup: customers pick services and see the starting price and time.' },
        { title: 'Explains what each service is worth', text: 'Wax versus ceramic coating, how long it lasts, aftercare. That is what justifies the price of careful work.' },
      ],
    },
    includes: {
      pt: ['Serviços com preço por porte do carro', 'Comparador de antes e depois', 'Prazo de cada serviço e leva e traz', 'Cuidados depois do polimento e da vitrificação', 'Galeria de trabalhos', 'Botão de orçamento no WhatsApp'],
      en: ['Services priced by car size', 'Before and after slider', 'Time per service and pickup and delivery', 'Aftercare for polishing and coating', 'Gallery of work', 'Quote button on WhatsApp'],
    },
    searches: {
      pt: ['site para estética automotiva', 'site para lava-rápido', 'site para polimento automotivo', 'landing page para vitrificação'],
      en: ['car detailing website', 'car wash website', 'car polishing website', 'ceramic coating landing page'],
    },
    faq: {
      pt: [
        { question: 'Posso usar fotos dos carros que eu já fiz?', answer: 'Deve. As fotos reais de antes e depois são o melhor argumento da página. Eu trato e organizo as que você mandar.' },
        { question: 'Atendo moto também. Entra no site?', answer: 'Entra. Moto pode ser um porte a mais no orçamento ou uma seção própria.' },
        { question: 'Dá para o cliente agendar o horário?', answer: 'No pacote padrão, o cliente monta o pedido e manda pelo WhatsApp. Agenda com horários livres é um projeto à parte.' },
      ],
      en: [
        { question: 'Can I use photos of cars I have already done?', answer: 'You should. Real before and after photos are the strongest argument on the page. I edit and organize the ones you send.' },
        { question: 'I also work on motorcycles. Can that be included?', answer: 'Yes. Motorcycles can be one more size in the quote or a section of their own.' },
        { question: 'Can customers book a time slot?', answer: 'In the standard package, customers build the request and send it on WhatsApp. A calendar with open slots is a separate project.' },
      ],
    },
  },
];

export function findNiche(slug: string): Niche | undefined {
  return niches.find((item) => item.slug === slug);
}

/** Copy for the /sites/ hub, shared by the page, its Markdown alternative, and its schema. */
export const sitesCopy = {
  pt: {
    navLabel: 'Sites',
    title: 'Criação de site e landing page para pequenos negócios',
    description: `Site para negócio local pronto em ${offer.businessDays} dias úteis, a partir de ${brl(offer.price)}, com domínio e hospedagem do primeiro ano, botão de WhatsApp e preparado para Google e busca por IA. Atendo todo o Brasil e Portugal.`,
    eyebrow: 'Sites para pequenos negócios',
    heading: 'Seu negócio no Google e no WhatsApp em 3 dias.',
    lede: 'Faço a página da sua empresa com serviços, preços de partida, região atendida e um botão que leva o cliente direto para o seu WhatsApp. Pronta para o Google e para quem pergunta ao ChatGPT onde encontrar o que você faz.',
    includes: [
      'Uma página com serviços, preços de partida, região, dúvidas frequentes e botão de WhatsApp',
      'Versão para celular, rápida e fácil de ler',
      'Preparada para o Google e para busca por IA, com dados estruturados do seu tipo de negócio',
      'Domínio e hospedagem do primeiro ano, com o domínio registrado no seu nome',
      `Até ${offer.revisionRounds} rodadas de ajuste depois da primeira versão`,
      'Cadastro no Google Search Console e envio do mapa do site',
    ],
    extras: [
      `Agendamento online, chatbot no WhatsApp e área do cliente: a partir de ${brl(offer.extrasFrom)}`,
      `Renovação de domínio e hospedagem a partir do segundo ano: ${brl(offer.renewalPerYear)} por ano`,
      `Manutenção opcional com trocas de fotos, preços e horários: ${brl(offer.maintenancePerMonth)} por mês, com a renovação incluída`,
    ],
    howTitle: 'Do primeiro áudio à página no ar.',
    steps: [
      { title: 'Conversa no WhatsApp', text: 'Você conta o que faz, onde atende e manda fotos e preços. Pode ser por áudio.' },
      { title: 'Metade para começar', text: 'Pagamento de metade do valor por Pix. A outra metade só quando você aprovar.' },
      { title: `Primeira versão em ${offer.businessDays} dias úteis`, text: 'Você recebe o link para ver no celular e manda tudo o que quer mudar de uma vez.' },
      { title: 'No ar com o seu domínio', text: 'Depois dos ajustes, a página entra no ar, é enviada ao Google e o botão já cai no seu WhatsApp.' },
    ],
    audit: {
      title: 'Já tem site?',
      text: `Se o seu site já existe mas não aparece no Google, não tem descrição ou o botão de WhatsApp não abre no celular, faço o ajuste com escopo fechado: título e descrição de cada página, dados estruturados do negócio, botão de WhatsApp certo e cadastro no Search Console. A partir de ${brl(offer.auditPrice)}.`,
    },
    portugal: `Para negócios em Portugal, o valor é em euros, a partir de ${offer.portugalFromEuro} €.`,
    engineer: 'Por trás de cada página está um engenheiro de software com mais de 10 anos de experiência em sistemas para empresas. Se um dia você precisar de agendamento online, área do cliente ou um sistema para organizar a operação, é comigo mesmo.',
    faq: [
      { question: 'Quanto custa um site para pequeno negócio?', answer: `A página fica a partir de ${brl(offer.price)}, com domínio e hospedagem do primeiro ano. Para pousada com pedido de reserva, a partir de ${brl(offer.lodgingPrice)}. Metade para começar e metade quando você aprovar.` },
      { question: 'Em quanto tempo fica pronto?', answer: `A primeira versão fica pronta em ${offer.businessDays} dias úteis depois que você manda as informações e as fotos.` },
      { question: 'Tem mensalidade?', answer: `Não é obrigatória. O primeiro ano de domínio e hospedagem já está incluído. Do segundo ano em diante, a renovação é ${brl(offer.renewalPerYear)} por ano. A manutenção mensal é opcional.` },
      { question: 'O domínio fica no meu nome?', answer: 'Fica. O domínio é registrado no seu CPF ou CNPJ e eu entro só como contato técnico.' },
      { question: 'Você garante que vou aparecer em primeiro no Google?', answer: 'Ninguém consegue garantir posição. O que eu garanto é a página pronta para ser encontrada: conteúdo em texto, dados estruturados, mapa do site enviado ao Google e velocidade. A posição depende de tempo e da concorrência na sua região.' },
      { question: 'Você atende fora da minha cidade?', answer: 'Atendo todo o Brasil e Portugal, de forma remota. Tudo é resolvido pelo WhatsApp, e o pagamento no Brasil é por Pix.' },
    ],
  },
  en: {
    navLabel: 'Websites',
    title: 'Websites and landing pages for small businesses',
    description: `A website for your local business ready in ${offer.businessDays} business days, from ${brl(offer.price)}, with the first year of domain and hosting, a WhatsApp button, and preparation for Google and AI search. Serving Brazil and Portugal.`,
    eyebrow: 'Websites for small businesses',
    heading: 'Your business on Google and WhatsApp in 3 days.',
    lede: 'I build your company page with services, starting prices, service area, and a button that takes customers straight to your WhatsApp. Ready for Google and for people who ask ChatGPT where to find what you do.',
    includes: [
      'One page with services, starting prices, service area, FAQ, and a WhatsApp button',
      'A fast, easy-to-read mobile version',
      'Prepared for Google and AI search, with structured data for your type of business',
      'First year of domain and hosting, with the domain registered in your name',
      `Up to ${offer.revisionRounds} rounds of changes after the first version`,
      'Google Search Console setup and sitemap submission',
    ],
    extras: [
      `Online booking, WhatsApp chatbot, and customer area: from ${brl(offer.extrasFrom)}`,
      `Domain and hosting renewal from the second year: ${brl(offer.renewalPerYear)} per year`,
      `Optional maintenance with photo, price, and schedule changes: ${brl(offer.maintenancePerMonth)} per month, renewal included`,
    ],
    howTitle: 'From the first voice message to a live page.',
    steps: [
      { title: 'A WhatsApp conversation', text: 'You tell me what you do and where, and send photos and prices. Voice messages are fine.' },
      { title: 'Half to start', text: 'Half of the price by Pix to start. The other half only when you approve.' },
      { title: `First version in ${offer.businessDays} business days`, text: 'You get a link to check on your phone and send every change at once.' },
      { title: 'Live on your domain', text: 'After the changes, the page goes live, is submitted to Google, and the button opens your WhatsApp.' },
    ],
    audit: {
      title: 'Already have a site?',
      text: `If your site exists but does not show up on Google, has no description, or its WhatsApp button does not open on phones, I fix it with a fixed scope: title and description for each page, business structured data, a working WhatsApp button, and Search Console setup. From ${brl(offer.auditPrice)}.`,
    },
    portugal: `For businesses in Portugal, prices are in euros, from ${offer.portugalFromEuro} €.`,
    engineer: 'Behind every page is a software engineer with more than 10 years of experience building business systems. If you ever need online booking, a customer area, or a system to organize operations, I can build that too.',
    faq: [
      { question: 'How much does a small business website cost?', answer: `A page starts at ${brl(offer.price)}, with the first year of domain and hosting. For guesthouses with booking requests, from ${brl(offer.lodgingPrice)}. Half to start and half when you approve.` },
      { question: 'How long does it take?', answer: `The first version is ready ${offer.businessDays} business days after you send the information and photos.` },
      { question: 'Is there a monthly fee?', answer: `Not a required one. The first year of domain and hosting is included. From the second year, renewal is ${brl(offer.renewalPerYear)} per year. Monthly maintenance is optional.` },
      { question: 'Is the domain in my name?', answer: 'Yes. The domain is registered under your tax ID and I am only the technical contact.' },
      { question: 'Do you guarantee the first spot on Google?', answer: 'Nobody can guarantee a position. What I guarantee is a page ready to be found: text content, structured data, a sitemap submitted to Google, and speed. Ranking depends on time and local competition.' },
      { question: 'Do you work outside my city?', answer: 'I work remotely across Brazil and Portugal. Everything is handled on WhatsApp, and payment in Brazil is by Pix.' },
    ],
  },
} satisfies Record<Locale, unknown>;

/** Questions shown on a niche page: the niche's own, then the general price and domain answers. */
export function nicheFaq(niche: Niche, locale: Locale): FaqItem[] {
  const general = sitesCopy[locale].faq;
  const price = locale === 'pt'
    ? { question: `Quanto custa um ${niche.title.pt.charAt(0).toLowerCase()}${niche.title.pt.slice(1)}?`, answer: `A partir de ${brl(niche.price)}, com domínio e hospedagem do primeiro ano. Metade para começar e metade quando você aprovar a página.` }
    : { question: `How much does a ${niche.title.en.charAt(0).toLowerCase()}${niche.title.en.slice(1)} cost?`, answer: `From ${brl(niche.price)}, with the first year of domain and hosting. Half to start and half when you approve the page.` };
  return [...niche.faq[locale], price, general[2], general[3]];
}

/** Why the WhatsApp number is Portuguese, said plainly next to every WhatsApp action aimed at Brazilian owners. */
export const whatsappNote = {
  pt: 'Moro em Portugal e atendo clientes em todo o Brasil, por isso o WhatsApp começa com +351. A conversa é pelo WhatsApp mesmo, e o pagamento, por Pix.',
  en: 'I live in Portugal and work with clients all over Brazil, which is why the WhatsApp number starts with +351. We talk on WhatsApp, and payment in Brazil is by Pix.',
} satisfies Record<Locale, string>;

/** WhatsApp link with a prefilled first message, so the conversation starts with context. */
export function whatsappLink(phoneE164: string, locale: Locale, niche?: Niche): string {
  const text = locale === 'pt'
    ? `Oi, Rafael! Quero um site${niche ? ` para ${niche.label.pt.toLowerCase()}` : ' para o meu negócio'}.`
    : `Hi Rafael! I would like a website${niche ? ` for ${niche.label.en.toLowerCase()}` : ' for my business'}.`;
  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(text)}`;
}
