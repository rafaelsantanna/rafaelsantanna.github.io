// Starting prices in BRL shared by the server-rendered tables and the "Monte o dia" simulator.
export type Size = 'p' | 'm' | 'g';
export type Coat = 'curta' | 'longa';
export type ServiceId = 'creche' | 'banho' | 'tosa' | 'hotel';

export const sizes: Size[] = ['p', 'm', 'g'];
export const coats: Coat[] = ['curta', 'longa'];
export const serviceIds: ServiceId[] = ['creche', 'banho', 'tosa', 'hotel'];

export const prices: Record<ServiceId, Record<Coat, Record<Size, number>>> = {
  creche: { curta: { p: 85, m: 85, g: 95 }, longa: { p: 85, m: 85, g: 95 } },
  banho: { curta: { p: 55, m: 70, g: 95 }, longa: { p: 70, m: 90, g: 125 } },
  tosa: { curta: { p: 85, m: 105, g: 140 }, longa: { p: 100, m: 130, g: 175 } },
  hotel: { curta: { p: 120, m: 120, g: 140 }, longa: { p: 120, m: 120, g: 140 } },
};

/** Pet taxi, round trip within 8 km. */
export const taxiRoundTrip = 40;

export function brl(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}
