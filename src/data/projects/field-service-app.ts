import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'field-service-app',
  name: 'Turno',
  kind: 'mobile',
  category: { en: 'Mobile app / Field team', pt: 'App mobile / Equipe de campo' },
  tagline: { en: 'Work orders that keep working without signal.', pt: 'Ordens de serviço que funcionam até sem sinal.' },
  summary: {
    en: 'An app prototype for field technicians with work orders, checklists, customer signature, and a sync queue for when the connection drops.',
    pt: 'Um protótipo de app para técnicos de campo com ordens de serviço, checklist, assinatura do cliente e fila de sincronização para quando a conexão cai.',
  },
  problem: {
    en: 'Field technicians work with unstable connections and little time. When the app needs the internet on every tap, records get postponed and information is lost.',
    pt: 'Técnicos de campo trabalham com conexão instável e pouco tempo. Quando o app depende de internet a cada toque, o registro fica para depois e informações se perdem.',
  },
  approach: {
    en: 'An interface with large touch targets, high contrast, and an explicit offline mode. Every change goes into a local queue and syncs when the connection returns, with visible status for the technician.',
    pt: 'Uma interface com alvos de toque grandes, alto contraste e um modo offline explícito. Cada alteração entra em uma fila local e é sincronizada quando a conexão volta, com estado visível para o técnico.',
  },
  highlights: {
    en: [
      { title: 'Offline without blocking', text: 'Switch the connection off and keep working. A banner at the top counts the changes waiting to be sent, and nothing locks up.' },
      { title: 'A visible sync queue', text: 'The Queue tab lists every event as Pending, Sending, Synced, or Failed, with a countdown to the next retry and a live legend beside the phone.' },
      { title: 'Checklist with validation', text: 'Complete order stays locked and says what is missing. Optical power only accepts −27 to −8 dBm, and the speed test is checked against the customer plan.' },
      { title: 'Photo and signature on screen', text: 'A simulated camera generates the photo with date and order number, the signature pad takes a finger or a mouse, and a keyboard option records why the customer could not sign.' },
      { title: 'Progress that survives a reload', text: 'Orders and the queue stay saved in this browser. Reset demo restores the starting day, and Erase local data simulates a wiped phone.' },
      { title: 'Built for one hand', text: 'The main action sits at the bottom, touch targets are at least 48 pixels, and screen transitions turn off when the system asks for reduced motion.' },
    ],
    pt: [
      { title: 'Offline sem travar', text: 'Desligue a conexão e continue trabalhando. Um aviso no topo conta as alterações que aguardam envio, e nada fica bloqueado.' },
      { title: 'Fila de envio à vista', text: 'A aba Fila mostra cada evento como Pendente, Enviando, Sincronizado ou Falhou, com contagem para a próxima tentativa e uma legenda ao vivo ao lado do celular.' },
      { title: 'Checklist com validação', text: 'Concluir OS fica bloqueado e explica o que falta. A potência só aceita de −27 a −8 dBm, e o teste de velocidade é comparado ao plano do cliente.' },
      { title: 'Foto e assinatura na tela', text: 'Uma câmera simulada gera a foto com data e número da OS, a assinatura aceita dedo ou mouse, e uma opção por teclado registra por que o cliente não assinou.' },
      { title: 'Progresso que resiste ao recarregar', text: 'As OS e a fila ficam salvas neste navegador. Reiniciar demo volta ao início do dia, e Apagar dados locais simula um celular zerado.' },
      { title: 'Feito para uma mão', text: 'A ação principal fica na parte de baixo, os alvos de toque têm pelo menos 48 pixels e as transições se desligam quando o sistema pede menos movimento.' },
    ],
  },
  decisions: {
    en: [
      { title: 'An ordered queue with retries', text: 'Each change becomes an event with a time and a status. Events go out one at a time, in order; when one fails, the next ones wait and the retry follows 2 s, 4 s, and 8 s, so “order completed” never arrives before “job started”.' },
      { title: 'Offline as a normal state', text: 'Everything is written to the device first. The interface never blocks the technician for lack of network; it only shows what has not been sent yet.' },
      { title: 'A web prototype with app decisions', text: 'Bottom navigation, screens that slide like a native stack, local storage, and inputs shaped for the field, such as the minus sign already applied to optical power. The same model would carry over to a React Native app.' },
    ],
    pt: [
      { title: 'Fila ordenada com novas tentativas', text: 'Cada alteração vira um evento com horário e situação. Os envios saem um por vez, na ordem; se um falha, os seguintes esperam e a nova tentativa vem depois de 2 s, 4 s e 8 s, para que “OS concluída” nunca chegue antes de “Atendimento iniciado”.' },
      { title: 'Offline como estado normal', text: 'Tudo é gravado primeiro no aparelho. A interface nunca bloqueia o técnico por falta de rede; ela só mostra o que ainda não foi enviado.' },
      { title: 'Protótipo web, decisões de app', text: 'Navegação inferior, telas que deslizam como uma pilha nativa, armazenamento local e campos pensados para o trabalho em campo, como o sinal negativo da potência já aplicado. O mesmo modelo serviria a um app em React Native.' },
    ],
  },
  stack: ['TypeScript', 'Astro', 'CSS', 'Canvas API', 'Pointer Events', 'Web Storage'],
  services: ['mobile-integrations', 'b2b-saas-internal-systems'],
  boundary: {
    en: 'This is a web prototype that simulates the app. The connection, the server, and the failed sends are simulated, the map is illustrative, the camera generates its image, and data stays only in this browser. Nothing is sent.',
    pt: 'É um protótipo web que simula o app. A conexão, o servidor e as falhas de envio são simulados, o mapa é ilustrativo, a câmera gera a própria imagem e os dados ficam apenas neste navegador. Nada é enviado.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#F7F8FA', ink: '#0E1525', accent: '#2F6BFF' },
  device: 'mobile',
  preview: previewFor('field-service-app', {
    en: 'Turno field technician app in a phone frame showing a work order checklist and the offline sync queue',
    pt: 'App Turno para técnicos de campo em uma moldura de celular, com checklist da ordem de serviço e fila de sincronização offline',
  }),
};
