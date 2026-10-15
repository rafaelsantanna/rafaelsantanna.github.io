import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'legacy-modernization',
  name: 'Ventura',
  kind: 'product',
  category: { en: 'Modernization / Back office', pt: 'Modernização / Backoffice' },
  tagline: { en: 'Same rules, a new interface.', pt: 'Mesmas regras, interface nova.' },
  summary: {
    en: 'A sales-order screen in two versions, legacy and modernized. Drag the divider to compare them (on a phone, switch between them), then use the new version for real.',
    pt: 'Uma tela de pedido de venda em duas versões, a legada e a modernizada. Arraste o divisor para comparar (no celular, alterne entre elas) e use a nova versão de verdade.',
  },
  problem: {
    en: 'Older internal systems hold valuable business rules behind screens that are hard to use. Rewriting everything at once is risky, and keeping it as is costs time and errors every day.',
    pt: 'Sistemas internos antigos guardam regras de negócio valiosas atrás de telas difíceis de usar. Reescrever tudo de uma vez é arriscado, e manter como está custa tempo e erros todos os dias.',
  },
  approach: {
    en: 'The order rules live in a single module used by both interfaces. The new version reorganizes the flow into steps, validates as people type, and shows how each choice affects the total.',
    pt: 'As regras do pedido ficam em um módulo único, usado pelas duas interfaces. A versão nova reorganiza o fluxo em etapas, valida enquanto a pessoa digita e mostra o impacto de cada escolha no total.',
  },
  highlights: {
    en: [
      { title: 'Before and after', text: 'A divider you can drag, click into place, or move with the arrow keys reveals both versions of the same screen. On phones, a toggle switches between them.' },
      { title: 'One order, two screens', text: 'Both screens edit the same order: change it in the 2009 version and the new one shows it, and the other way around.' },
      { title: 'Parity panel', text: 'Each screen runs the order through the same rules function, and a panel compares subtotal, discount, shipping, total, payment terms, and open issues, next to a checklist of the 8 rules.' },
      { title: 'Validation at the right moment', text: 'The new screen points out each problem next to its field, in plain language. The old one waits for Save and lists everything in a single modal.' },
      { title: 'Keyboard search', text: 'Accessible search fields find customers and 120 products by name, code, or category, with price and stock, instead of a dropdown with every item.' },
      { title: 'Total always in view', text: 'Subtotal, discount, shipping, and the free shipping threshold update on every change. The draft is saved in the browser and the submission is simulated.' },
    ],
    pt: [
      { title: 'Antes e depois', text: 'Um divisor que se arrasta, aceita clique e anda com as setas do teclado revela as duas versões da mesma tela. No celular, um seletor alterna entre elas.' },
      { title: 'Um pedido, duas telas', text: 'As duas telas editam o mesmo pedido: altere na versão de 2009 e a nova mostra a mudança, e vice-versa.' },
      { title: 'Painel de paridade', text: 'Cada tela passa o pedido pela mesma função de regras, e um painel compara subtotal, desconto, frete, total, prazo e pendências, ao lado da lista das 8 regras.' },
      { title: 'Validação no momento certo', text: 'A tela nova aponta cada problema ao lado do campo, em linguagem clara. A antiga espera o Gravar e lista tudo em um único modal.' },
      { title: 'Busca pelo teclado', text: 'Campos de busca acessíveis encontram clientes e 120 produtos por nome, código ou categoria, com preço e estoque, no lugar de uma lista suspensa com tudo.' },
      { title: 'Total sempre visível', text: 'Subtotal, desconto, frete e a faixa de frete grátis mudam a cada alteração. O rascunho fica salvo no navegador e o envio é simulado.' },
    ],
  },
  decisions: {
    en: [
      { title: 'Rules outside the interface', text: 'A pure TypeScript module holds the catalog, the limits, and the evaluateOrder function. Both screens call the same code, so replacing a screen does not touch what already works.' },
      { title: 'Parity as a safety net', text: 'In a real migration, running the same order through the old and the new path and comparing the results is how you prove nothing changed before moving users over.' },
      { title: 'Accessibility as a requirement', text: 'Radio groups, the divider, and the search fields follow WAI-ARIA patterns. Errors are tied to their fields, focus follows the steps, and even the legacy screen works with the keyboard.' },
    ],
    pt: [
      { title: 'Regras fora da interface', text: 'Um módulo TypeScript puro guarda catálogo, limites e a função evaluateOrder. As duas telas chamam o mesmo código, então trocar a tela não mexe no que já funciona.' },
      { title: 'Paridade como rede de segurança', text: 'Numa migração real, passar o mesmo pedido pelo caminho antigo e pelo novo e comparar o resultado é o que prova que nada mudou antes de virar a chave para os usuários.' },
      { title: 'Acessibilidade como requisito', text: 'Grupos de opções, divisor e campos de busca seguem os padrões WAI-ARIA. Erros ficam ligados aos campos, o foco acompanha as etapas e até a tela legada funciona pelo teclado.' },
    ],
  },
  stack: ['TypeScript', 'Astro', 'CSS', 'WAI-ARIA', 'localStorage'],
  services: ['frontend-modernization', 'b2b-saas-internal-systems'],
  boundary: {
    en: 'No order is created or sent: the simulated submission ends in the browser, and the draft lives only in this browser’s storage. Customers, products, prices, and rules are fictional and exist only on this page.',
    pt: 'Nenhum pedido é criado ou enviado: o envio simulado termina no navegador, e o rascunho fica só no armazenamento deste navegador. Clientes, produtos, preços e regras são fictícios e existem apenas nesta página.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#F5F7F4', ink: '#0F1F17', accent: '#047857' },
  device: 'desktop',
  preview: previewFor('legacy-modernization', {
    en: 'Ventura sales-order screen split between a legacy interface and its modernized version',
    pt: 'Tela de pedido de venda Ventura dividida entre a interface legada e a versão modernizada',
  }),
};
