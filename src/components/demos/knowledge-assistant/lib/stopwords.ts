import type { Lang } from './lang';

// Accent-folded function words removed before indexing and searching.
const pt = `a o as os um uma uns umas de da do das dos em na no nas nos num numa por pela pelo pelas pelos
para pra pro com sem sob sobre entre ate apos desde e ou mas nem que se como quando onde quanto quanta quantos
quantas qual quais quem porque pois ja ainda tambem so apenas mais menos muito muita muitos muitas pouco pouca
poucos poucas algum alguma alguns algumas nenhum nenhuma todo toda todos todas outro outra outros outras mesmo
mesma esse essa esses essas este esta estes estas isso isto aquele aquela aqueles aquelas aquilo deste desta
destes destas desse dessa desses dessas disso disto neste nesta nesse nessa nisso nisto dele dela deles delas
ele ela eles elas eu voce voces me mim lhe lhes meu minha meus minhas seu sua seus suas nosso nossa nossos
nossas ao aos sao ser sou era foi for fosse seria estou estao ter tem tenho temos tinha ha fazer faco faz
fazem posso pode podem podemos poder devo deve devem preciso precisa precisam vou vai ir nao sim la aqui ali
agora entao assim oi ola favor gostaria queria quero saber sei alguem algo coisa caso cada qualquer
funciona funcionam mil reais`;

const en = `a an the and or but if then than so as of to for from in on at by with without about into over
under after before between during up down out off is am are was were be been being do does did doing done
have has had having can could should would will shall may might must need needs i me my mine myself we us
our ours you your yours he him his she her hers it its they them their theirs this that these those what
which who whom whose when where why how there here all any both each few more most other another some such
no nor not only own same too very just also don doesn isn aren get gets got want wanted know like please
hi hello thanks someone something anything ok okay many much lot let long per
thousand reais`;

function toSet(list: string): Set<string> {
  return new Set(list.split(/\s+/).filter(Boolean));
}

export const stopwords: Record<Lang, Set<string>> = { pt: toSet(pt), en: toSet(en) };
