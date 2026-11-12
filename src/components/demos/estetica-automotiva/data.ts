import type { Locale } from '@/data/content';

export type SizeId = 'hatch' | 'sedan' | 'suv' | 'picape';

export interface LumeService {
  id: string;
  name: string;
  text: string;
  includes: string[];
  /** Working hours on the bench, used to estimate the turnaround. */
  hours: number;
  turnaround: string;
  /** Starting prices in reais for hatch, sedan, SUV, and pickup. */
  prices: [number, number, number, number];
  note?: string;
}

export interface LumeSize { id: SizeId; name: string; example: string }

const prices = {
  lavagem: [120, 140, 160, 180],
  higienizacao: [280, 320, 360, 380],
  polimento: [650, 750, 850, 950],
  vitrificacao: [1200, 1400, 1600, 1800],
  farol: [180, 180, 180, 180],
  oxi: [150, 150, 170, 170],
  couro: [220, 240, 260, 260],
} satisfies Record<string, [number, number, number, number]>;

export const sizes: Record<Locale, LumeSize[]> = {
  pt: [
    { id: 'hatch', name: 'Hatch', example: 'compacto, até 4 m' },
    { id: 'sedan', name: 'Sedã', example: 'porta-malas separado' },
    { id: 'suv', name: 'SUV', example: 'utilitário e minivan' },
    { id: 'picape', name: 'Picape', example: 'cabine dupla e caçamba' },
  ],
  en: [
    { id: 'hatch', name: 'Hatchback', example: 'compact, up to 4 m' },
    { id: 'sedan', name: 'Sedan', example: 'separate trunk' },
    { id: 'suv', name: 'SUV', example: 'crossovers and minivans' },
    { id: 'picape', name: 'Pickup', example: 'double cab and bed' },
  ],
};

export const services: Record<Locale, LumeService[]> = {
  pt: [
    { id: 'lavagem', name: 'Lavagem detalhada', text: 'Lavagem com dois baldes e luva de microfibra, sem escova de lava-rápido encostando na pintura.', includes: ['Pré-lavagem com espuma', 'Rodas, caixas de roda e frisos', 'Aspiração e painel', 'Vidros por dentro e por fora'], hours: 3, turnaround: '3 horas', prices: prices.lavagem },
    { id: 'higienizacao', name: 'Higienização interna', text: 'Bancos, carpete, teto e cintos limpos com extratora. Tira mancha, cheiro de comida e pelo de bicho.', includes: ['Extração em bancos e carpete', 'Limpeza do teto e das portas', 'Dutos de ar e painel', 'Secagem completa antes de entregar'], hours: 7, turnaround: '1 dia', prices: prices.higienizacao },
    { id: 'polimento', name: 'Polimento técnico', text: 'Corte e refino em etapas para tirar marcas de lavagem, manchas de água e riscos que estão só no verniz.', includes: ['Descontaminação com clay bar', 'Medição da camada de verniz', 'Corte e refino com luz de inspeção', 'Cera de proteção no final'], hours: 8, turnaround: '1 dia', prices: prices.polimento },
    { id: 'vitrificacao', name: 'Vitrificação de pintura', text: 'Camada de proteção cerâmica sobre a pintura polida. A água escorre, a sujeira gruda menos e lavar fica mais fácil.', includes: ['Lavagem e descontaminação', 'Polimento de refino', 'Aplicação em duas camadas', 'Cura em ambiente fechado'], hours: 16, turnaround: '2 dias úteis', prices: prices.vitrificacao, note: 'Dura de 1 a 2 anos com lavagem correta e manutenção a cada 6 meses. Não protege contra pedrada nem risco fundo.' },
    { id: 'farol', name: 'Revitalização de farol', text: 'Lixamento progressivo e polimento para tirar o amarelado, com verniz UV para não voltar tão cedo.', includes: ['Os dois faróis', 'Lixamento e polimento', 'Verniz com proteção UV'], hours: 2, turnaround: '2 horas', prices: prices.farol, note: 'Preço pelo par, em qualquer porte.' },
    { id: 'oxi', name: 'Oxi-sanitização', text: 'Ozônio dentro do carro fechado para eliminar cheiro de cigarro, mofo e ar-condicionado.', includes: ['Aplicação com o carro fechado', 'Ventilação depois', 'Limpeza do filtro de cabine'], hours: 1, turnaround: '1 hora e meia', prices: prices.oxi },
    { id: 'couro', name: 'Proteção de couro', text: 'Limpeza com escova macia e hidratação para o couro não ressecar, rachar ou manchar de jeans.', includes: ['Limpeza com pH neutro', 'Hidratação', 'Protetor contra transferência de cor'], hours: 3, turnaround: '3 horas', prices: prices.couro },
  ],
  en: [
    { id: 'lavagem', name: 'Detailed wash', text: 'Two-bucket wash with a microfibre mitt. No car-wash brushes ever touch the paint.', includes: ['Snow foam pre-wash', 'Wheels, arches, and trim', 'Vacuum and dashboard', 'Glass inside and out'], hours: 3, turnaround: '3 hours', prices: prices.lavagem },
    { id: 'higienizacao', name: 'Interior deep clean', text: 'Seats, carpet, headliner, and belts cleaned with an extractor. Removes stains, food smells, and pet hair.', includes: ['Seat and carpet extraction', 'Headliner and door cards', 'Air vents and dashboard', 'Fully dry before handover'], hours: 7, turnaround: '1 day', prices: prices.higienizacao },
    { id: 'polimento', name: 'Paint correction', text: 'Cutting and finishing in stages to remove wash marks, water spots, and scratches that sit only in the clear coat.', includes: ['Clay bar decontamination', 'Clear coat thickness reading', 'Cut and finish under inspection lights', 'Protective wax to finish'], hours: 8, turnaround: '1 day', prices: prices.polimento },
    { id: 'vitrificacao', name: 'Ceramic coating', text: 'A ceramic protection layer over freshly polished paint. Water beads off, dirt sticks less, and washing gets easier.', includes: ['Wash and decontamination', 'Finishing polish', 'Two-layer application', 'Indoor curing'], hours: 16, turnaround: '2 working days', prices: prices.vitrificacao, note: 'Lasts 1 to 2 years with correct washing and a maintenance visit every 6 months. It does not stop stone chips or deep scratches.' },
    { id: 'farol', name: 'Headlight restoration', text: 'Progressive sanding and polishing to clear the yellowing, sealed with UV clear coat so it stays clear longer.', includes: ['Both headlights', 'Sanding and polishing', 'UV-protective clear coat'], hours: 2, turnaround: '2 hours', prices: prices.farol, note: 'Price per pair, any vehicle size.' },
    { id: 'oxi', name: 'Ozone sanitising', text: 'Ozone inside the closed car to remove cigarette, mould, and air-conditioning smells.', includes: ['Applied with the car closed', 'Airing out afterwards', 'Cabin filter cleaning'], hours: 1, turnaround: '1.5 hours', prices: prices.oxi },
    { id: 'couro', name: 'Leather protection', text: 'Soft-brush cleaning and conditioning so leather does not dry out, crack, or pick up denim dye.', includes: ['pH-neutral cleaning', 'Conditioning', 'Dye-transfer protector'], hours: 3, turnaround: '3 hours', prices: prices.couro },
  ],
};

/** Services that already include the detailed wash, so it is not charged twice. */
export const includesWash = ['polimento', 'vitrificacao'];

export const steps: Record<Locale, { title: string; text: string }[]> = {
  pt: [
    { title: 'Você manda o carro e o serviço', text: 'Modelo, ano e o que está incomodando. Foto ajuda, mas não é obrigatória.' },
    { title: 'Combinamos dia e leva e traz', text: 'Você escolhe se traz o carro ou se a gente busca. A entrega já sai com horário marcado.' },
    { title: 'Avaliação na luz de inspeção', text: 'Antes de começar, olhamos a pintura com luz forte e mostramos o que sai e o que não sai. O valor é confirmado aqui.' },
    { title: 'Entrega com fotos e cuidados', text: 'Você recebe o carro com fotos do antes e depois e um guia de como lavar daqui para frente.' },
  ],
  en: [
    { title: 'Send the car and the service', text: 'Model, year, and what is bothering you. A photo helps but is not required.' },
    { title: 'Agree on the day and pickup', text: 'Bring the car yourself or we collect it. The handover time is set from the start.' },
    { title: 'Inspection under bright light', text: 'Before starting, we check the paint under strong light and show what will and will not come out. The price is confirmed here.' },
    { title: 'Handover with photos and care tips', text: 'You get the car back with before and after photos and a guide on how to wash it from now on.' },
  ],
};

export const care: Record<Locale, string[]> = {
  pt: [
    'Nos primeiros 7 dias, não lave com shampoo. Se precisar, tire a poeira só com água.',
    'Evite chuva e sereno nas primeiras 24 horas. Se der, deixe na garagem.',
    'Lave com shampoo neutro e luva de microfibra. Nada de detergente nem escova de lava-rápido.',
    'Seque com toalha de microfibra, sem esfregar e sem rodo de silicone.',
    'Tire cocô de passarinho e resina de árvore no mesmo dia.',
    'Volte a cada 6 meses para a manutenção da camada, a partir de R$ 180.',
  ],
  en: [
    'For the first 7 days, do not wash with shampoo. If needed, rinse off dust with water only.',
    'Avoid rain and dew for the first 24 hours. Keep it in a garage if you can.',
    'Wash with pH-neutral shampoo and a microfibre mitt. No dish soap and no car-wash brushes.',
    'Dry with a microfibre towel, without rubbing and without a silicone blade.',
    'Remove bird droppings and tree sap the same day.',
    'Come back every 6 months for coating maintenance, from R$ 180.',
  ],
};

export const faqs: Record<Locale, { q: string; a: string }[]> = {
  pt: [
    { q: 'Quanto tempo o carro fica pronto?', a: 'Lavagem detalhada e farol saem no mesmo dia, em poucas horas. Higienização e polimento levam um dia. Vitrificação leva dois dias úteis, porque a camada precisa curar em ambiente fechado. O horário de entrega é combinado no agendamento.' },
    { q: 'Vitrificação é a mesma coisa que cera?', a: 'Não. A cera dá brilho e dura algumas semanas. A vitrificação forma uma camada mais dura que dura de 1 a 2 anos com a manutenção em dia. No primeiro dia o brilho é parecido; a diferença aparece na duração e em como fica fácil lavar.' },
    { q: 'Posso lavar o carro depois?', a: 'Pode e deve. Depois do polimento, já no dia seguinte. Depois da vitrificação, espere 7 dias e use shampoo neutro. A gente entrega um guia de lavagem junto com o carro.' },
    { q: 'O polimento tira risco?', a: 'Tira marcas de lavagem e riscos que estão só no verniz. Risco que prende a unha e chegou na tinta não sai com polimento, só com retoque ou funilaria. Na avaliação a gente mostra o que sai antes de começar.' },
    { q: 'Vocês atendem moto?', a: 'Sim. Fazemos lavagem detalhada, polimento e vitrificação de moto, com valor combinado pelo modelo. O leva e traz é só para carros.' },
    { q: 'Tem garantia?', a: 'Na vitrificação, 12 meses contra perda de repelência, com a manutenção semestral feita e as orientações de lavagem seguidas. Nos outros serviços, se algo não ficou como combinado, refazemos sem custo em até 7 dias.' },
  ],
  en: [
    { q: 'How long until the car is ready?', a: 'Detailed washes and headlights are done the same day, in a few hours. Interior cleaning and paint correction take a day. Ceramic coating takes two working days, because the layer has to cure indoors. The handover time is agreed when you book.' },
    { q: 'Is a ceramic coating the same as wax?', a: 'No. Wax adds shine and lasts a few weeks. A ceramic coating forms a harder layer that lasts 1 to 2 years with maintenance. On day one the shine looks similar; the difference is how long it lasts and how easy washing becomes.' },
    { q: 'Can I wash the car afterwards?', a: 'You can and should. After paint correction, from the next day. After a ceramic coating, wait 7 days and use pH-neutral shampoo. We hand over a washing guide with the car.' },
    { q: 'Does polishing remove scratches?', a: 'It removes wash marks and scratches that sit only in the clear coat. A scratch that catches your fingernail and reached the paint will not polish out; it needs a touch-up or bodywork. During the inspection we show what will come out before starting.' },
    { q: 'Do you work on motorcycles?', a: 'Yes. We do detailed washes, polishing, and ceramic coating for motorcycles, priced by model. Pickup and delivery is for cars only.' },
    { q: 'Is there a guarantee?', a: 'For ceramic coating, 12 months against loss of water repellency, as long as the six-monthly maintenance is done and the washing guide is followed. For other services, if something is not as agreed, we redo it free of charge within 7 days.' },
  ],
};

/** Formats whole reais with the locale's thousands separator, keeping the "R$" prefix in both languages. */
export function formatPrice(value: number, locale: Locale): string {
  return `R$\u00a0${value.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US')}`;
}
