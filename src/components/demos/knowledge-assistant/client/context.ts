import type { KbCorpus, KbDocument } from '../corpus/types';
import type { IconName } from '../icons';
import { formatDecimal, formatMs } from '../lib/format';
import type { Lang } from '../lib/lang';
import type { Engine } from '../lib/pipeline';
import type { UiStrings } from '../strings';

export interface ClientData {
  lang: Lang;
  corpus: KbCorpus;
  strings: UiStrings;
}

export interface Ctx {
  lang: Lang;
  t: UiStrings;
  engine: Engine;
  docs: Map<string, KbDocument>;
  decimal: (value: number) => string;
  ms: (value: number) => string;
  icon: (name: IconName) => SVGElement;
  mark: () => SVGElement;
}

export function readClientData(root: HTMLElement): ClientData {
  const script = root.querySelector('script[data-ka-data]');
  return JSON.parse(script?.textContent ?? '{}') as ClientData;
}

export function createCtx(root: HTMLElement, data: ClientData, engine: Engine): Ctx {
  const template = root.querySelector<HTMLTemplateElement>('template[data-ka-icons]');
  const brandMark = root.querySelector<SVGElement>('[data-ka-mark]');
  const clone = (source: Element | null | undefined) => (source?.cloneNode(true) ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg')) as SVGElement;
  return {
    lang: data.lang,
    t: data.strings,
    engine,
    docs: new Map(data.corpus.documents.map((doc) => [doc.id, doc])),
    decimal: (value) => formatDecimal(value, data.lang),
    ms: (value) => formatMs(value, data.lang),
    icon: (name) => clone(template?.content.querySelector(`[data-icon="${name}"]`)),
    mark: () => {
      const mark = clone(brandMark);
      mark.removeAttribute('data-ka-mark');
      return mark;
    },
  };
}
