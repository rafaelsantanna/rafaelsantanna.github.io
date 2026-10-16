import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'logistics-control',
  name: 'Trajeto',
  kind: 'product',
  category: { en: 'B2B SaaS / Logistics operations', pt: 'SaaS B2B / Operação logística' },
  tagline: { en: "A control tower for the day's deliveries.", pt: 'Torre de controle para as entregas do dia.' },
  summary: {
    en: 'An operations console to track deliveries, act on exceptions, and rebalance routes, with role-based permissions and sample data generated in the browser.',
    pt: 'Um painel operacional para acompanhar entregas, agir sobre exceções e redistribuir rotas, com permissões por perfil e dados de exemplo gerados no navegador.',
  },
  problem: {
    en: 'Logistics teams often follow deliveries across spreadsheets, message groups, and separate systems. When something runs late, the information arrives late and each person sees a different part of the problem.',
    pt: 'Equipes de logística costumam acompanhar entregas em planilhas, grupos de mensagem e sistemas separados. Quando algo atrasa, a informação chega tarde e cada pessoa vê uma parte diferente do problema.',
  },
  approach: {
    en: 'A single console with daily indicators, a schematic route map, an exceptions queue, and a dense table with search, filters, and bulk actions. Every action shows its effect immediately and can be undone.',
    pt: 'Um console único com indicadores do dia, mapa esquemático das rotas, fila de exceções e uma tabela densa com busca, filtros e ações em lote. Cada ação mostra o efeito na hora e pode ser desfeita.',
  },
  highlights: {
    en: [
      { title: 'A live overview', text: 'Five indicators with sparklines, a schematic map where vehicles move along their routes, and an exceptions queue. Click a vehicle or a route to filter the list by that driver.' },
      { title: 'A real operational table', text: '240 deliveries with debounced search, status, zone and driver filters, sortable columns, pagination, tri-state bulk selection and a CSV export generated in the browser. On phones the table becomes a card list with the same filters.' },
      { title: 'Detail without losing context', text: 'A side panel with the delivery timeline, driver, window, attempts and actions. It traps focus, closes with Escape and becomes a full-height sheet on phones.' },
      { title: 'Role-based permissions', text: 'As Operator, reassigning and prioritizing stay visible but locked, with an explanation. Switch to Supervisor and the same screens unlock them.' },
      { title: 'Actions you can undo', text: 'Reschedule, resolve, report an issue, reassign or prioritize: the change shows up at once in indicators, map and list, and a notice offers Undo, which restores the exact previous state.' },
      { title: 'Command palette and shortcuts', text: 'Ctrl+K searches commands and delivery numbers, forgiving accents and typos. The ? key lists the shortcuts, and single-key shortcuts can be turned off.' },
    ],
    pt: [
      { title: 'Visão geral ao vivo', text: 'Cinco indicadores com minigráficos, um mapa esquemático em que os veículos andam pelas rotas e uma fila de exceções. Clique em um veículo ou rota para filtrar a lista por aquele motorista.' },
      { title: 'Tabela operacional de verdade', text: '240 entregas com busca com debounce, filtros por status, zona e motorista, colunas ordenáveis, paginação, seleção em lote com estado parcial e exportação CSV gerada no navegador. No celular, a tabela vira uma lista de cartões com os mesmos filtros.' },
      { title: 'Detalhe sem perder o contexto', text: 'Um painel lateral com linha do tempo, motorista, janela, tentativas e ações. Prende o foco, fecha com Esc e vira uma tela cheia no celular.' },
      { title: 'Permissões por perfil', text: 'Como Operador, reatribuir e priorizar aparecem bloqueados, com a explicação do motivo. Troque para Supervisor e as mesmas telas liberam essas ações.' },
      { title: 'Ações com desfazer', text: 'Reagendar, resolver, registrar ocorrência, reatribuir ou priorizar: a mudança aparece na hora nos indicadores, no mapa e na lista, e um aviso oferece Desfazer, que volta exatamente ao estado anterior.' },
      { title: 'Paleta de comandos e atalhos', text: 'Ctrl+K busca comandos e números de entrega, tolerando acentos e erros de digitação. A tecla ? mostra os atalhos, e os atalhos de uma tecla podem ser desligados.' },
    ],
  },
  decisions: {
    en: [
      { title: 'Deterministic data, real clock', text: 'A seeded generator (mulberry32) builds the same operating day on every visit, with times relative to your clock. Outside operating hours it shows 14:20. The server renders the same scenario, so the page makes sense without JavaScript.' },
      { title: 'State in one place', text: 'One store holds the deliveries and the interface state, and indicators, map, queue and table are derived from it. Each action keeps the previous records, so undo is exact. The same render functions run on the server and in the browser.' },
      { title: 'Density with accessibility', text: 'Tabular numbers, statuses with color, icon and label, WAI-ARIA patterns (modal dialogs, combobox, aria-sort, live regions), a pausable map that stays still under reduced motion, and a tuned dark theme.' },
    ],
    pt: [
      { title: 'Dados determinísticos, relógio real', text: 'Um gerador com semente fixa (mulberry32) monta o mesmo dia de operação em toda visita, com horários relativos ao seu relógio. Fora do horário de operação, mostra as 14:20. O servidor renderiza o mesmo cenário, então a página faz sentido sem JavaScript.' },
      { title: 'Estado em um único lugar', text: 'Um store guarda as entregas e o estado da interface, e indicadores, mapa, fila e tabela são derivados dele. Cada ação guarda os registros anteriores, então o desfazer é exato. As mesmas funções de renderização rodam no servidor e no navegador.' },
      { title: 'Densidade com acessibilidade', text: 'Números tabulares, status com cor, ícone e texto, padrões WAI-ARIA (diálogos modais, combobox, aria-sort, regiões ao vivo), mapa com pausa que fica parado quando o sistema pede menos movimento e um tema escuro ajustado.' },
    ],
  },
  stack: ['TypeScript', 'Astro', 'CSS', 'SVG', 'WAI-ARIA'],
  services: ['b2b-saas-internal-systems', 'frontend-modernization'],
  boundary: {
    en: 'It does not connect to any real system. The data is sample data generated in your browser, the map is a schematic of an invented city, and nothing is sent anywhere: changes stay in this browser until you reset the demo.',
    pt: 'Não se conecta a nenhum sistema real. Os dados são de exemplo e gerados no seu navegador, o mapa é um esquema de uma cidade inventada e nada é enviado: as alterações ficam só neste navegador até você restaurar a demo.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#F2F1ED', ink: '#17181C', accent: '#F59E0B' },
  device: 'desktop',
  preview: previewFor('logistics-control', {
    en: 'Trajeto operations console with daily indicators, route map, and delivery table filled with sample data',
    pt: 'Console operacional Trajeto com indicadores do dia, mapa de rotas e tabela de entregas preenchida com dados de exemplo',
  }),
};
