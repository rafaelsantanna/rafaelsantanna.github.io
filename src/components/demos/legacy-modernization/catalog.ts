import type { LocalizedText } from '@/data/types';

export type CategoryId = 'grocery' | 'beverages' | 'dairy' | 'frozen' | 'bakery' | 'disposables';
export type UnitId = 'bundle' | 'case' | 'pack' | 'sack' | 'pail' | 'jug' | 'each';
export type RegionId = 'southeast' | 'south' | 'midwest' | 'northeast' | 'north';
export type PaymentTermId = 'cash' | 'd28' | 'd28-42' | 'd30-60' | 'd30-60-90';

export interface Product {
  sku: string;
  name: LocalizedText;
  unit: UnitId;
  /** Price per unit, in cents of BRL. */
  price: number;
  stock: number;
  category: CategoryId;
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  state: string;
  region: RegionId;
  paymentTerm: PaymentTermId;
}

export const categories: Record<CategoryId, { name: LocalizedText; prefix: string }> = {
  grocery: { name: { pt: 'Mercearia', en: 'Pantry' }, prefix: 'MER' },
  beverages: { name: { pt: 'Bebidas', en: 'Beverages' }, prefix: 'BEB' },
  dairy: { name: { pt: 'Laticínios e frios', en: 'Dairy and deli' }, prefix: 'LAT' },
  frozen: { name: { pt: 'Congelados', en: 'Frozen' }, prefix: 'CON' },
  bakery: { name: { pt: 'Panificação', en: 'Baking' }, prefix: 'PAN' },
  disposables: { name: { pt: 'Descartáveis', en: 'Disposables' }, prefix: 'DES' },
};

export const units: Record<UnitId, { name: LocalizedText; code: LocalizedText }> = {
  bundle: { name: { pt: 'fardo', en: 'bundle' }, code: { pt: 'FD', en: 'BD' } },
  case: { name: { pt: 'caixa', en: 'case' }, code: { pt: 'CX', en: 'CS' } },
  pack: { name: { pt: 'pacote', en: 'pack' }, code: { pt: 'PC', en: 'PK' } },
  sack: { name: { pt: 'saco', en: 'sack' }, code: { pt: 'SC', en: 'SK' } },
  pail: { name: { pt: 'balde', en: 'pail' }, code: { pt: 'BD', en: 'PL' } },
  jug: { name: { pt: 'galão', en: 'jug' }, code: { pt: 'GL', en: 'JG' } },
  each: { name: { pt: 'unidade', en: 'each' }, code: { pt: 'UN', en: 'EA' } },
};

export const regions: Record<RegionId, LocalizedText> = {
  southeast: { pt: 'Sudeste', en: 'Southeast' },
  south: { pt: 'Sul', en: 'South' },
  midwest: { pt: 'Centro-Oeste', en: 'Central-West' },
  northeast: { pt: 'Nordeste', en: 'Northeast' },
  north: { pt: 'Norte', en: 'North' },
};

export const paymentTerms: Record<PaymentTermId, { name: LocalizedText; code: string }> = {
  cash: { name: { pt: 'À vista', en: 'Upfront' }, code: 'AV' },
  d28: { name: { pt: '28 dias', en: '28 days' }, code: '28DD' },
  'd28-42': { name: { pt: '28/42 dias', en: '28/42 days' }, code: '28/42DD' },
  'd30-60': { name: { pt: '30/60 dias', en: '30/60 days' }, code: '30/60DD' },
  'd30-60-90': { name: { pt: '30/60/90 dias', en: '30/60/90 days' }, code: '30/60/90DD' },
};

type ProductRow = [sku: string, pt: string, en: string, unit: UnitId, price: number, stock: number];

const categoryByPrefix = Object.fromEntries(
  (Object.keys(categories) as CategoryId[]).map((id) => [categories[id].prefix, id]),
) as Record<string, CategoryId>;

const productRows: ProductRow[] = [
  ['MER-1001', 'Arroz branco tipo 1, 6 × 5 kg', 'Long-grain white rice, 6 × 5 kg', 'bundle', 16890, 240],
  ['MER-1002', 'Arroz parboilizado, 6 × 5 kg', 'Parboiled rice, 6 × 5 kg', 'bundle', 16240, 85],
  ['MER-1003', 'Arroz integral, 10 × 1 kg', 'Brown rice, 10 × 1 kg', 'bundle', 7490, 60],
  ['MER-1004', 'Feijão carioca tipo 1, 10 × 1 kg', 'Carioca beans, 10 × 1 kg', 'bundle', 7990, 180],
  ['MER-1005', 'Feijão preto tipo 1, 10 × 1 kg', 'Black beans, 10 × 1 kg', 'bundle', 8450, 96],
  ['MER-1006', 'Açúcar refinado, 10 × 1 kg', 'Refined sugar, 10 × 1 kg', 'bundle', 4990, 300],
  ['MER-1007', 'Açúcar cristal, 50 kg', 'Granulated sugar, 50 kg', 'sack', 18900, 40],
  ['MER-1008', 'Café torrado e moído, 10 × 500 g', 'Ground roasted coffee, 10 × 500 g', 'bundle', 23900, 72],
  ['MER-1009', 'Óleo de soja, 20 × 900 ml', 'Soybean oil, 20 × 900 ml', 'case', 15980, 150],
  ['MER-1010', 'Azeite de oliva extravirgem, 12 × 500 ml', 'Extra virgin olive oil, 12 × 500 ml', 'case', 43140, 24],
  ['MER-1011', 'Macarrão espaguete, 20 × 500 g', 'Spaghetti, 20 × 500 g', 'bundle', 8990, 130],
  ['MER-1012', 'Macarrão parafuso, 20 × 500 g', 'Fusilli pasta, 20 × 500 g', 'bundle', 9230, 110],
  ['MER-1013', 'Farinha de mandioca, 12 × 1 kg', 'Cassava flour, 12 × 1 kg', 'bundle', 7190, 54],
  ['MER-1014', 'Fubá mimoso, 10 × 1 kg', 'Fine cornmeal, 10 × 1 kg', 'bundle', 4290, 66],
  ['MER-1015', 'Sal refinado, 30 × 1 kg', 'Refined salt, 30 × 1 kg', 'bundle', 3960, 210],
  ['MER-1016', 'Molho de tomate tradicional, 24 × 340 g', 'Tomato sauce, 24 × 340 g', 'case', 6720, 140],
  ['MER-1017', 'Extrato de tomate, 24 × 190 g', 'Tomato paste, 24 × 190 g', 'case', 5880, 0],
  ['MER-1018', 'Milho verde em conserva, 24 × 170 g', 'Canned sweet corn, 24 × 170 g', 'case', 7920, 88],
  ['MER-1019', 'Aveia em flocos, 12 × 500 g', 'Rolled oats, 12 × 500 g', 'case', 8160, 18],
  ['MER-1020', 'Vinagre de álcool, 12 × 750 ml', 'White vinegar, 12 × 750 ml', 'case', 3480, 120],
  ['BEB-2001', 'Água mineral sem gás, 12 × 500 ml', 'Still mineral water, 12 × 500 ml', 'bundle', 1490, 520],
  ['BEB-2002', 'Água mineral com gás, 12 × 500 ml', 'Sparkling mineral water, 12 × 500 ml', 'bundle', 1740, 260],
  ['BEB-2003', 'Água mineral, galão de 20 l', 'Mineral water, 20 l jug', 'jug', 1590, 150],
  ['BEB-2004', 'Refrigerante de cola, 6 × 2 l', 'Cola soft drink, 6 × 2 l', 'bundle', 4790, 210],
  ['BEB-2005', 'Refrigerante de guaraná, 6 × 2 l', 'Guaraná soft drink, 6 × 2 l', 'bundle', 3990, 230],
  ['BEB-2006', 'Refrigerante de limão, 6 × 2 l', 'Lemon soft drink, 6 × 2 l', 'bundle', 3840, 90],
  ['BEB-2007', 'Refrigerante de laranja, 6 × 2 l', 'Orange soft drink, 6 × 2 l', 'bundle', 3840, 80],
  ['BEB-2008', 'Refrigerante de cola em lata, 12 × 350 ml', 'Cola soft drink cans, 12 × 350 ml', 'bundle', 4190, 160],
  ['BEB-2009', 'Suco de uva integral, 6 × 1 l', '100% grape juice, 6 × 1 l', 'case', 8940, 48],
  ['BEB-2010', 'Suco de laranja integral, 6 × 1 l', '100% orange juice, 6 × 1 l', 'case', 7140, 36],
  ['BEB-2011', 'Suco de maçã integral, 6 × 1 l', '100% apple juice, 6 × 1 l', 'case', 7440, 22],
  ['BEB-2012', 'Néctar de pêssego, 12 × 1 l', 'Peach nectar, 12 × 1 l', 'case', 7680, 64],
  ['BEB-2013', 'Suco concentrado de caju, 12 × 500 ml', 'Cashew juice concentrate, 12 × 500 ml', 'case', 5940, 75],
  ['BEB-2014', 'Chá mate gelado, 12 × 1,5 l', 'Iced mate tea, 12 × 1.5 l', 'bundle', 6960, 70],
  ['BEB-2015', 'Água de coco, 12 × 1 l', 'Coconut water, 12 × 1 l', 'case', 11880, 30],
  ['BEB-2016', 'Isotônico sabor limão, 6 × 500 ml', 'Lemon sports drink, 6 × 500 ml', 'bundle', 2990, 120],
  ['BEB-2017', 'Energético, 24 × 269 ml', 'Energy drink, 24 × 269 ml', 'case', 16790, 0],
  ['BEB-2018', 'Água tônica, 6 × 1,5 l', 'Tonic water, 6 × 1.5 l', 'bundle', 3270, 44],
  ['BEB-2019', 'Achocolatado em pó, 12 × 400 g', 'Chocolate drink powder, 12 × 400 g', 'case', 10680, 58],
  ['BEB-2020', 'Cappuccino solúvel, 6 × 1 kg', 'Instant cappuccino, 6 × 1 kg', 'case', 21120, 14],
  ['LAT-3001', 'Leite UHT integral, 12 × 1 l', 'Whole UHT milk, 12 × 1 l', 'case', 6480, 400],
  ['LAT-3002', 'Leite UHT desnatado, 12 × 1 l', 'Skimmed UHT milk, 12 × 1 l', 'case', 6600, 140],
  ['LAT-3003', 'Leite em pó integral, 10 × 400 g', 'Whole milk powder, 10 × 400 g', 'bundle', 18900, 36],
  ['LAT-3004', 'Creme de leite, 27 × 200 g', 'Table cream, 27 × 200 g', 'case', 9990, 75],
  ['LAT-3005', 'Leite condensado, 27 × 395 g', 'Sweetened condensed milk, 27 × 395 g', 'case', 17820, 60],
  ['LAT-3006', 'Queijo muçarela fatiado, 1 kg', 'Sliced mozzarella, 1 kg', 'pack', 4290, 120],
  ['LAT-3007', 'Queijo prato em peça, 3 kg', 'Prato cheese block, 3 kg', 'each', 11970, 28],
  ['LAT-3008', 'Queijo parmesão ralado, 10 × 100 g', 'Grated parmesan, 10 × 100 g', 'case', 7900, 44],
  ['LAT-3009', 'Requeijão cremoso, 12 × 200 g', 'Requeijão cheese spread, 12 × 200 g', 'case', 9540, 52],
  ['LAT-3010', 'Manteiga com sal, 20 × 200 g', 'Salted butter, 20 × 200 g', 'case', 23900, 30],
  ['LAT-3011', 'Margarina culinária, 15 kg', 'Baking margarine, 15 kg', 'pail', 21990, 25],
  ['LAT-3012', 'Iogurte natural, 12 × 170 g', 'Plain yogurt, 12 × 170 g', 'case', 3840, 0],
  ['LAT-3013', 'Presunto cozido fatiado, 1 kg', 'Sliced cooked ham, 1 kg', 'pack', 3490, 90],
  ['LAT-3014', 'Peito de peru defumado, 1 kg', 'Smoked turkey breast, 1 kg', 'pack', 5890, 35],
  ['LAT-3015', 'Mortadela fatiada, 1 kg', 'Sliced mortadella, 1 kg', 'pack', 2490, 110],
  ['LAT-3016', 'Salame tipo italiano, 6 × 200 g', 'Italian-style salami, 6 × 200 g', 'case', 10740, 20],
  ['LAT-3017', 'Bacon em cubos, 1 kg', 'Diced bacon, 1 kg', 'pack', 4690, 48],
  ['LAT-3018', 'Cream cheese, 1,5 kg', 'Cream cheese, 1.5 kg', 'pail', 6490, 26],
  ['LAT-3019', 'Doce de leite, 4,8 kg', 'Dulce de leche, 4.8 kg', 'pail', 7200, 16],
  ['LAT-3020', 'Ovos brancos, 30 dúzias', 'White eggs, 30 dozen', 'case', 23800, 40],
  ['CON-4001', 'Pão de queijo congelado, 4 × 1 kg', 'Frozen cheese bread, 4 × 1 kg', 'case', 9960, 80],
  ['CON-4002', 'Batata pré-frita, 4 × 2,5 kg', 'Frozen fries, 4 × 2.5 kg', 'case', 14990, 70],
  ['CON-4003', 'Hambúrguer bovino, 36 × 90 g', 'Beef burger patties, 36 × 90 g', 'case', 10980, 54],
  ['CON-4004', 'Filé de peito de frango, 4 × 1 kg', 'Chicken breast fillet, 4 × 1 kg', 'case', 10760, 64],
  ['CON-4005', 'Coxinha de frango para fritar, 100 un.', 'Chicken coxinhas to fry, 100 pcs', 'pack', 7990, 40],
  ['CON-4006', 'Polpa de morango, 10 × 1 kg', 'Strawberry pulp, 10 × 1 kg', 'case', 15900, 22],
  ['CON-4007', 'Polpa de acerola, 10 × 1 kg', 'Acerola pulp, 10 × 1 kg', 'case', 9800, 30],
  ['CON-4008', 'Polpa de açaí, 10 × 1 kg', 'Açaí pulp, 10 × 1 kg', 'case', 18900, 0],
  ['CON-4009', 'Sorvete de creme, 2 × 5 l', 'Vanilla ice cream, 2 × 5 l', 'case', 12980, 18],
  ['CON-4010', 'Massa de pizza pré-assada, 10 un.', 'Par-baked pizza crusts, 10 pcs', 'pack', 3490, 60],
  ['CON-4011', 'Lasanha à bolonhesa, 6 × 600 g', 'Bolognese lasagna, 6 × 600 g', 'case', 11340, 24],
  ['CON-4012', 'Mandioca descascada, 4 × 2 kg', 'Peeled cassava, 4 × 2 kg', 'case', 5120, 46],
  ['CON-4013', 'Brócolis em floretes, 4 × 1 kg', 'Broccoli florets, 4 × 1 kg', 'case', 7960, 33],
  ['CON-4014', 'Mix de legumes, 4 × 1 kg', 'Mixed vegetables, 4 × 1 kg', 'case', 6360, 41],
  ['CON-4015', 'Filé de tilápia, 4 × 1 kg', 'Tilapia fillet, 4 × 1 kg', 'case', 19960, 15],
  ['CON-4016', 'Camarão descascado, 1 kg', 'Peeled shrimp, 1 kg', 'pack', 8990, 12],
  ['CON-4017', 'Linguiça toscana, 5 kg', 'Tuscan sausage, 5 kg', 'case', 9950, 38],
  ['CON-4018', 'Empanado de frango, 4 × 1 kg', 'Breaded chicken, 4 × 1 kg', 'case', 8760, 50],
  ['CON-4019', 'Pão francês pré-assado, 60 un.', 'Par-baked bread rolls, 60 pcs', 'pack', 5290, 44],
  ['CON-4020', 'Gelo em cubos, 10 × 5 kg', 'Ice cubes, 10 × 5 kg', 'bundle', 5900, 100],
  ['PAN-5001', 'Farinha de trigo tipo 1, 25 kg', 'Wheat flour type 1, 25 kg', 'sack', 10490, 120],
  ['PAN-5002', 'Farinha de trigo especial, 10 × 1 kg', 'Premium wheat flour, 10 × 1 kg', 'bundle', 5490, 140],
  ['PAN-5003', 'Fermento biológico seco, 10 × 125 g', 'Dry yeast, 10 × 125 g', 'case', 7900, 34],
  ['PAN-5004', 'Fermento químico em pó, 12 × 250 g', 'Baking powder, 12 × 250 g', 'case', 7080, 28],
  ['PAN-5005', 'Chocolate meio amargo em barra, 10 × 1 kg', 'Semisweet chocolate bars, 10 × 1 kg', 'case', 49900, 12],
  ['PAN-5006', 'Cobertura fracionada ao leite, 5 × 1 kg', 'Milk chocolate coating, 5 × 1 kg', 'case', 18950, 18],
  ['PAN-5007', 'Chocolate granulado, 1 kg', 'Chocolate sprinkles, 1 kg', 'pack', 2190, 40],
  ['PAN-5008', 'Cacau em pó 50%, 1 kg', 'Cocoa powder 50%, 1 kg', 'pack', 3990, 26],
  ['PAN-5009', 'Amido de milho, 12 × 500 g', 'Cornstarch, 12 × 500 g', 'case', 7440, 48],
  ['PAN-5010', 'Açúcar de confeiteiro, 10 × 1 kg', 'Powdered sugar, 10 × 1 kg', 'bundle', 6990, 0],
  ['PAN-5011', 'Leite de coco, 12 × 500 ml', 'Coconut milk, 12 × 500 ml', 'case', 10680, 30],
  ['PAN-5012', 'Coco ralado desidratado, 1 kg', 'Desiccated coconut, 1 kg', 'pack', 4490, 22],
  ['PAN-5013', 'Gordura vegetal, 14,5 kg', 'Vegetable shortening, 14.5 kg', 'pail', 23900, 14],
  ['PAN-5014', 'Geleia de morango, 4 kg', 'Strawberry jam, 4 kg', 'pail', 7490, 20],
  ['PAN-5015', 'Essência de baunilha, 12 × 30 ml', 'Vanilla extract, 12 × 30 ml', 'case', 3840, 30],
  ['PAN-5016', 'Mistura para bolo de baunilha, 5 kg', 'Vanilla cake mix, 5 kg', 'sack', 6490, 26],
  ['PAN-5017', 'Melhorador de farinha, 1 kg', 'Bread improver, 1 kg', 'pack', 2290, 36],
  ['PAN-5018', 'Uva-passa preta, 1 kg', 'Black raisins, 1 kg', 'pack', 3690, 18],
  ['PAN-5019', 'Castanha de caju, 1 kg', 'Cashew nuts, 1 kg', 'pack', 8990, 10],
  ['PAN-5020', 'Gotas de chocolate forneáveis, 2 kg', 'Bake-stable chocolate chips, 2 kg', 'pack', 9200, 15],
  ['DES-6001', 'Copo descartável 200 ml, 25 × 100 un.', 'Disposable cups 200 ml, 25 × 100 pcs', 'case', 12900, 90],
  ['DES-6002', 'Copo descartável 50 ml, 50 × 100 un.', 'Disposable cups 50 ml, 50 × 100 pcs', 'case', 10450, 40],
  ['DES-6003', 'Copo de papel para café 180 ml, 50 × 50 un.', 'Paper coffee cups 180 ml, 50 × 50 pcs', 'case', 11500, 14],
  ['DES-6004', 'Tampa para copo 300 ml, 1.000 un.', 'Cup lids 300 ml, 1,000 pcs', 'case', 6990, 22],
  ['DES-6005', 'Guardanapo 24 × 24 cm, 40 × 50 un.', 'Napkins 24 × 24 cm, 40 × 50 pcs', 'bundle', 5960, 70],
  ['DES-6006', 'Marmitex de alumínio nº 8, 100 un.', 'Aluminum takeout trays no. 8, 100 pcs', 'case', 5490, 60],
  ['DES-6007', 'Pote com tampa 500 ml, 100 un.', 'Lidded containers 500 ml, 100 pcs', 'case', 7400, 0],
  ['DES-6008', 'Embalagem para hambúrguer, 500 un.', 'Burger boxes, 500 pcs', 'case', 8990, 26],
  ['DES-6009', 'Sacola plástica 40 × 50 cm, 1.000 un.', 'Plastic bags 40 × 50 cm, 1,000 pcs', 'pack', 7290, 30],
  ['DES-6010', 'Filme de PVC 28 cm × 300 m', 'PVC cling film 28 cm × 300 m', 'each', 3990, 24],
  ['DES-6011', 'Papel-alumínio 45 cm × 100 m', 'Aluminum foil 45 cm × 100 m', 'each', 7990, 18],
  ['DES-6012', 'Luva descartável, 10 × 100 un.', 'Disposable gloves, 10 × 100 pcs', 'case', 8900, 40],
  ['DES-6013', 'Touca descartável, 10 × 100 un.', 'Disposable hairnets, 10 × 100 pcs', 'case', 4900, 32],
  ['DES-6014', 'Canudo de papel, 10 × 100 un.', 'Paper straws, 10 × 100 pcs', 'case', 3990, 55],
  ['DES-6015', 'Kit talher descartável, 500 un.', 'Disposable cutlery kits, 500 pcs', 'case', 6450, 28],
  ['DES-6016', 'Prato descartável 21 cm, 10 × 10 un.', 'Disposable plates 21 cm, 10 × 10 pcs', 'bundle', 3290, 46],
  ['DES-6017', 'Saco de lixo 100 l, 100 un.', 'Trash bags 100 l, 100 pcs', 'pack', 5800, 64],
  ['DES-6018', 'Papel toalha interfolhado, 6 × 1.000 folhas', 'Interfolded paper towels, 6 × 1,000 sheets', 'bundle', 6120, 38],
  ['DES-6019', 'Bobina plástica picotada, 5 kg', 'Perforated plastic roll, 5 kg', 'each', 5400, 20],
  ['DES-6020', 'Palito de dente em sachê, 2.000 un.', 'Wrapped toothpicks, 2,000 pcs', 'case', 2890, 50],
];

export const products: Product[] = productRows.map(([sku, pt, en, unit, price, stock]) => ({
  sku,
  name: { pt, en },
  unit,
  price,
  stock,
  category: categoryByPrefix[sku.slice(0, 3)],
}));

export const customers: Customer[] = [
  { id: 'C-0107', name: 'Empório Vila Serena', city: 'Campinas', state: 'SP', region: 'southeast', paymentTerm: 'd28-42' },
  { id: 'C-0112', name: 'Padaria Grão Dourado', city: 'Belo Horizonte', state: 'MG', region: 'southeast', paymentTerm: 'd28' },
  { id: 'C-0118', name: 'Restaurante Fogo Brando', city: 'Niterói', state: 'RJ', region: 'southeast', paymentTerm: 'd30-60' },
  { id: 'C-0125', name: 'Mercado Ponte Alta', city: 'Juiz de Fora', state: 'MG', region: 'southeast', paymentTerm: 'cash' },
  { id: 'C-0131', name: 'Lanchonete Esquina Clara', city: 'Vitória', state: 'ES', region: 'southeast', paymentTerm: 'd28' },
  { id: 'C-0204', name: 'Hotel Mirante das Araucárias', city: 'Curitiba', state: 'PR', region: 'south', paymentTerm: 'd30-60-90' },
  { id: 'C-0209', name: 'Cantina Bella Serra', city: 'Caxias do Sul', state: 'RS', region: 'south', paymentTerm: 'd28-42' },
  { id: 'C-0215', name: 'Mercearia Recanto Verde', city: 'Joinville', state: 'SC', region: 'south', paymentTerm: 'cash' },
  { id: 'C-0302', name: 'Rede Bom Grão Supermercados', city: 'Goiânia', state: 'GO', region: 'midwest', paymentTerm: 'd30-60-90' },
  { id: 'C-0308', name: 'Churrascaria Pampa Novo', city: 'Campo Grande', state: 'MS', region: 'midwest', paymentTerm: 'd28-42' },
  { id: 'C-0311', name: 'Bistrô Cerrado Vivo', city: 'Brasília', state: 'DF', region: 'midwest', paymentTerm: 'd28' },
  { id: 'C-0405', name: 'Pousada Maré Mansa', city: 'Recife', state: 'PE', region: 'northeast', paymentTerm: 'd28' },
  { id: 'C-0410', name: 'Sorveteria Brisa Leve', city: 'Fortaleza', state: 'CE', region: 'northeast', paymentTerm: 'cash' },
  { id: 'C-0503', name: 'Restaurante Sabor da Várzea', city: 'Belém', state: 'PA', region: 'north', paymentTerm: 'd30-60' },
  { id: 'C-0507', name: 'Empório Floresta Viva', city: 'Manaus', state: 'AM', region: 'north', paymentTerm: 'd28-42' },
];

const productIndex = new Map(products.map((product) => [product.sku, product]));
const customerIndex = new Map(customers.map((customer) => [customer.id, customer]));

export function findProduct(sku: string): Product | undefined {
  return productIndex.get(sku);
}

export function findCustomer(id: string): Customer | undefined {
  return customerIndex.get(id);
}
