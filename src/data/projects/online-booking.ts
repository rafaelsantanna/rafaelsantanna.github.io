import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'online-booking',
  name: 'Corte & Prosa',
  kind: 'site',
  category: { en: 'Website and booking / Barbershop', pt: 'Site e agendamento / Barbearia' },
  tagline: { en: 'Book your chair in under a minute.', pt: 'Agende seu horário em menos de um minuto.' },
  summary: {
    en: 'A barbershop website with a complete online booking flow: service, barber, day, and time, plus the shop-side view of the schedule.',
    pt: 'Um site para barbearia com agendamento online completo: serviço, profissional, dia e horário, além da visão da agenda do lado da barbearia.',
  },
  problem: {
    en: 'Many local businesses schedule everything by message. Customers wait for replies, barbers stop working to answer, and open slots go unnoticed.',
    pt: 'Muitos negócios locais agendam tudo por mensagem. O cliente espera resposta, o profissional interrompe o atendimento para responder e horários vagos passam despercebidos.',
  },
  approach: {
    en: "A clear page with illustrative services and prices, and a step-by-step booking flow that calculates open slots from the service length and each barber's schedule.",
    pt: 'Uma página clara com serviços e preços ilustrativos e um fluxo de agendamento em etapas, que calcula horários livres a partir da duração do serviço e da agenda de cada profissional.',
  },
  highlights: {
    en: [
      { title: 'Availability that is really calculated', text: "Free times combine opening hours, each barber's days off and lunch break, appointments already booked, the total length, and a 10 minute buffer, and anything already past is blocked." },
      { title: 'Six short steps', text: 'Services, barber, day, time, details, and review, with progress, back navigation that keeps every choice, and a summary that is always visible (a collapsible bar on phones).' },
      { title: 'No preference? The schedule picks', text: 'Skipping the barber choice assigns the first one free at the chosen time, and picking a haircut and a beard separately suggests the cheaper combo.' },
      { title: 'Two views of one schedule', text: "After confirming, the booking appears highlighted on the shop's day view, one column per barber, with occupancy computed from the same data." },
      { title: 'Brazilian mobile validation', text: 'Area code mask, checks for nonexistent area codes and the leading 9, and messages that say exactly what to fix.' },
      { title: 'A confirmation worth keeping', text: 'Booking code, an .ics calendar file generated in the browser, cancellation, and the booking saved locally for the next visit.' },
    ],
    pt: [
      { title: 'Horários calculados de verdade', text: 'Os horários livres cruzam funcionamento, folga e almoço de cada barbeiro, atendimentos já marcados, a duração total e 10 minutos de intervalo, e bloqueiam o que já passou.' },
      { title: 'Seis etapas curtas', text: 'Serviços, profissional, dia, horário, dados e revisão, com progresso, volta sem perder escolhas e um resumo sempre visível (uma barra recolhível no celular).' },
      { title: 'Sem preferência? A agenda escolhe', text: 'Quem não escolhe barbeiro fica com o primeiro livre no horário escolhido, e quem marca corte e barba separados recebe a sugestão do combo, que sai mais barato.' },
      { title: 'Duas visões da mesma agenda', text: 'Depois de confirmar, o horário aparece em destaque na agenda do dia da barbearia, com uma coluna por barbeiro e a ocupação calculada a partir dos mesmos dados.' },
      { title: 'Celular brasileiro validado', text: 'Máscara com DDD, checagem de DDD inexistente e do 9 do celular, com mensagens que dizem exatamente o que corrigir.' },
      { title: 'Confirmação que serve para algo', text: 'Código do agendamento, arquivo .ics gerado no navegador, cancelamento e o agendamento salvo localmente para a próxima visita.' },
    ],
  },
  decisions: {
    en: [
      { title: 'Isolated scheduling rules', text: 'Availability, combo suggestions, phone validation, and the .ics file are pure TypeScript functions, separate from the interface and ready to run behind a real API.' },
      { title: 'Choices that survive changes', text: 'Changing services or barber checks the day and time again: whatever still fits stays, and whatever no longer fits is cleared with a note explaining why.' },
      { title: 'Accessible end to end', text: 'A native dialog tied to the #agendar address (the browser Back button closes it), option groups with arrow key navigation, focus moved at each step, and screen reader announcements.' },
    ],
    pt: [
      { title: 'Regras de agenda isoladas', text: 'Disponibilidade, sugestão de combo, validação de telefone e geração do .ics são funções puras em TypeScript, separadas da interface e prontas para rodar atrás de uma API real.' },
      { title: 'Escolhas que sobrevivem às mudanças', text: 'Trocar serviço ou barbeiro revalida dia e horário: o que ainda cabe fica, e o que não cabe sai com um aviso explicando o motivo.' },
      { title: 'Acessível de ponta a ponta', text: 'Diálogo nativo ligado ao endereço #agendar (o Voltar do navegador fecha), grupos de opções com navegação pelas setas, foco conduzido a cada etapa e anúncios para leitores de tela.' },
    ],
  },
  stack: ['TypeScript', 'Astro', 'CSS', 'HTML dialog', 'WAI-ARIA', 'iCalendar (.ics)', 'Web Storage'],
  services: ['websites-landing-pages', 'mobile-integrations'],
  boundary: {
    en: "No time is reserved and no data is sent: the booking is saved only in the tester's browser. The barbershop, team, prices, clients, and schedule are fictional, and there is no payment, reminder, or barber login.",
    pt: 'Nenhum horário é reservado e nenhum dado é enviado: o agendamento fica salvo só no navegador de quem testa. Barbearia, equipe, preços, clientes e agenda são fictícios, e não há pagamento, lembrete ou acesso para os barbeiros.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#13201B', ink: '#F2EADB', accent: '#C9A35B' },
  device: 'desktop',
  preview: previewFor('online-booking', {
    en: 'Corte & Prosa barbershop website with its serif headline, the book now button, and a card showing the next free slot',
    pt: 'Site da barbearia Corte & Prosa com o título em serifa, o botão de agendar e um cartão com o próximo horário livre',
  }),
};
