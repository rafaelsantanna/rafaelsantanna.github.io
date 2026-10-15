import type { Locale } from '@/data/types';
import type { OrderInfo, SeedDefinition, Stroke } from '../lib/types';

/** Fictional work orders for one technician's day. Customers and neighborhoods are invented; there are no street addresses. */
const baseOrders: Omit<OrderInfo, 'planLabel' | 'note'>[] = [
  { id: '48213', type: 'install', start: '08:00', end: '10:00', customer: 'Helena Batista', neighborhood: 'Vila Sabiá', priority: 'normal', plan: 500, distanceKm: 3.1, etaMin: 12 },
  { id: '48217', type: 'repair', start: '09:00', end: '11:00', customer: 'Padaria Grão Dourado', neighborhood: 'Alto do Cedral', priority: 'high', plan: 300, distanceKm: 1.8, etaMin: 7 },
  { id: '48220', type: 'router', start: '10:30', end: '12:30', customer: 'Otávio Rangel', neighborhood: 'Jardim Bruma', priority: 'normal', plan: 700, distanceKm: 2.4, etaMin: 9 },
  { id: '48226', type: 'move', start: '13:00', end: '15:00', customer: 'Luíza Sampaio', neighborhood: 'Parque Ipezal', priority: 'normal', plan: 500, distanceKm: 5.6, etaMin: 18 },
  { id: '48231', type: 'install', start: '14:30', end: '16:30', customer: 'Caio Medeiros', neighborhood: 'Vila Candeia', priority: 'low', plan: 1000, distanceKm: 7.2, etaMin: 21 },
  { id: '48235', type: 'repair', start: '16:00', end: '18:00', customer: 'Beatriz Toledo', neighborhood: 'Morada do Vento', priority: 'high', plan: 300, distanceKm: 4, etaMin: 14 },
];

const notes: Record<Locale, Record<string, string>> = {
  pt: {
    '48213': 'Casa de esquina, portão azul. O cachorro fica preso no quintal.',
    '48217': 'Sem internet desde ontem à noite. A maquininha de cartão depende da conexão.',
    '48220': 'Cliente trabalha em casa e pediu atendimento antes do almoço.',
    '48226': 'Mudança para um apartamento no mesmo bairro. Levar cabo drop extra.',
    '48231': 'Primeira instalação no condomínio. Combinar com a portaria a passagem do cabo.',
    '48235': 'O sinal cai quando chove. Verificar a caixa de emenda no poste.',
  },
  en: {
    '48213': 'Corner house with a blue gate. The dog stays in the backyard.',
    '48217': 'No internet since last night. The card machine depends on the connection.',
    '48220': 'Customer works from home and asked for a visit before lunch.',
    '48226': 'Moving to an apartment in the same neighborhood. Bring extra drop cable.',
    '48231': 'First installation in this building. Agree on the cable route with the front desk.',
    '48235': 'Signal drops when it rains. Check the splice closure on the pole.',
  },
};

function planLabel(plan: number, locale: Locale): string {
  if (plan >= 1000) return locale === 'pt' ? `${plan / 1000} Giga` : `${plan / 1000} Gbps`;
  return locale === 'pt' ? `${plan} Mega` : `${plan} Mbps`;
}

export function ordersFor(locale: Locale): OrderInfo[] {
  return baseOrders.map((order) => ({ ...order, planLabel: planLabel(order.plan, locale), note: notes[locale][order.id] }));
}

/**
 * A handwritten-looking signature, stored like a real capture. The cursive run is a looped cycloid:
 * each letter is one turn, tall loops read as "l" or "h", short loops as "e", and shallow turns as "n".
 */
function seedSignature(): Stroke[] {
  const letterHeights = [95, 40, 105, 38, 14, 36, 12];
  const advance = 16;
  const baseline = 560;
  const run: Stroke = [];
  letterHeights.forEach((height, letter) => {
    const steps = letter === letterHeights.length - 1 ? 29 : 28;
    for (let step = 0; step < steps; step += 1) {
      const angle = 2 * Math.PI * (letter + step / 28);
      const y = baseline - height * (1 - Math.cos(angle));
      const x = 140 + advance * angle - height * 0.55 * Math.sin(angle) + (baseline - y) * 0.35;
      run.push(Math.round(x), Math.round(y));
    }
  });
  const lead: Stroke = [];
  for (let step = 0; step <= 24; step += 1) {
    const t = step / 24;
    lead.push(Math.round(170 + 20 * t), Math.round(600 - 230 * t));
  }
  const flourish: Stroke = [];
  for (let step = 0; step <= 30; step += 1) {
    const t = step / 30;
    flourish.push(Math.round(120 + 640 * t), Math.round(640 - 30 * Math.sin(t * Math.PI) - 20 * t));
  }
  return [lead, run, flourish];
}

const minutes = (clock: string) => {
  const [hours, mins] = clock.split(':').map(Number);
  return hours * 60 + mins;
};

/** Earlier today: one order completed and one in progress, with their events already synced. */
export function seedFor(locale: Locale): SeedDefinition {
  return {
    progress: {
      '48213': {
        status: 'done',
        startedAt: minutes('08:14'),
        completedAt: minutes('09:03'),
        checks: { cto: minutes('08:21'), splice: minutes('08:39'), wifi: minutes('08:50') },
        power: { value: -18.7, at: minutes('08:44') },
        speed: { value: 486, at: minutes('08:47') },
        photo: { variant: 3, at: minutes('08:52') },
        signature: { strokes: seedSignature(), at: minutes('08:58') },
        waiver: null,
        notes: {
          text: locale === 'pt' ? 'Roteador instalado na sala, perto da TV. Cliente testou o Wi-Fi no quarto.' : 'Router placed in the living room, next to the TV. Customer tested the Wi-Fi in the bedroom.',
          at: minutes('09:01'),
        },
      },
      '48217': {
        status: 'in-progress',
        startedAt: minutes('09:31'),
        completedAt: null,
        checks: { cto: minutes('09:38') },
        power: null,
        speed: null,
        photo: null,
        signature: null,
        waiver: null,
        notes: null,
      },
    },
    events: [
      { kind: 'start', orderId: '48213', at: minutes('08:14') },
      { kind: 'check', orderId: '48213', at: minutes('08:21'), item: 'cto' },
      { kind: 'check', orderId: '48213', at: minutes('08:39'), item: 'splice' },
      { kind: 'power', orderId: '48213', at: minutes('08:44'), value: -18.7 },
      { kind: 'speed', orderId: '48213', at: minutes('08:47'), value: 486 },
      { kind: 'check', orderId: '48213', at: minutes('08:50'), item: 'wifi' },
      { kind: 'photo', orderId: '48213', at: minutes('08:52') },
      { kind: 'signature', orderId: '48213', at: minutes('08:58') },
      { kind: 'notes', orderId: '48213', at: minutes('09:01') },
      { kind: 'complete', orderId: '48213', at: minutes('09:03') },
      { kind: 'start', orderId: '48217', at: minutes('09:31') },
      { kind: 'check', orderId: '48217', at: minutes('09:38'), item: 'cto' },
    ],
  };
}
