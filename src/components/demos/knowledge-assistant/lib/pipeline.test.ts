// Golden questions for the retrieval and answer pipeline. Run with:
// node --test src/components/demos/knowledge-assistant/lib/pipeline.test.ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confidenceLevel } from '../client/turn.ts';
import { corpusEn } from '../corpus/en.ts';
import { corpusPt } from '../corpus/pt.ts';
import type { KbCorpus } from '../corpus/types';
import { uiStrings } from '../strings.ts';
import type { Lang } from './lang';
import { ask, createEngine, type AskResult, type Engine } from './pipeline.ts';
import { DEFAULT_SETTINGS } from './settings.ts';
import { stem } from './stem.ts';
import { analyzeQuery } from './text.ts';

const clock = () => 0;
const corpora: Record<Lang, KbCorpus> = { pt: corpusPt, en: corpusEn };
const engines: Record<Lang, Engine> = { pt: createEngine(corpusPt, 'pt', clock), en: createEngine(corpusEn, 'en', clock) };

interface Golden {
  question: string;
  /** Passage expected as citation [1]. */
  first: string;
  /** Another passage that must be cited somewhere in the answer. */
  cites?: string;
  /** Only one source passage is expected. */
  single?: boolean;
}

function run(lang: Lang, question: string): AskResult {
  return ask(engines[lang], question, DEFAULT_SETTINGS, clock);
}

function citedIds(lang: Lang, result: AskResult): string[] {
  return result.answer?.parts.map((part) => engines[lang].passages[part.passageIndex].id) ?? [];
}

function expectAnswer(lang: Lang, golden: Golden): void {
  const result = run(lang, golden.question);
  assert.equal(result.outcome, 'answer', `${golden.question}: expected an answer, got ${result.outcome}`);
  const cited = citedIds(lang, result);
  assert.equal(cited[0], golden.first, `${golden.question}: citation [1] is ${cited[0]}`);
  // Every source must come from the document that answers the question.
  const doc = golden.first.split('/')[0];
  for (const id of cited) assert.equal(id.split('/')[0], doc, `${golden.question}: off-topic source ${id}`);
  if (golden.cites) assert.ok(cited.includes(golden.cites), `${golden.question}: ${golden.cites} is not cited (${cited.join(', ')})`);
  if (golden.single) assert.equal(cited.length, 1, `${golden.question}: expected one source, got ${cited.join(', ')}`);
}

/** Quoted examples in the hint shown when a question has nothing to search for. */
function hintExamples(lang: Lang): string[] {
  return [...uiStrings[lang].emptyAnswer.matchAll(/“([^”]+)”/g)].map((match) => match[1]);
}

const suggestionAnswers = ['reembolso/prazos/1', 'remoto/exterior/1', 'equipamentos/perda-roubo/1'];
const hintAnswers = ['reembolso/prazos/1', 'viagens/passagens/2'];

const paraphrases: Record<Lang, Golden[]> = {
  pt: [
    { question: 'Quantos dias de férias eu tenho?', first: 'ferias/direito/1' },
    { question: 'Posso trabalhar de outro país por algumas semanas?', first: 'remoto/exterior/1', single: true },
    { question: 'Posso trabalhar de outro país por um mês?', first: 'remoto/exterior/1', single: true },
    { question: 'Como peço férias?', first: 'ferias/como-pedir/1' },
    { question: 'Como peço reembolso?', first: 'reembolso/quem-pode/1', cites: 'reembolso/prazos/1' },
    { question: 'Quando o reembolso é pago?', first: 'reembolso/aprovacao/1', single: true },
    { question: 'O que fazer se eu perder o notebook?', first: 'equipamentos/perda-roubo/1', single: true },
    { question: 'Qual o prazo para pedir férias?', first: 'ferias/como-pedir/1', single: true },
    { question: 'Como peço um notebook novo?', first: 'equipamentos/troca/1', single: true },
    { question: 'Como peço o auxílio educação?', first: 'beneficios/educacao/1', single: true },
    { question: 'Qual o limite de hotel por noite em viagem?', first: 'viagens/passagens/2', single: true },
    { question: 'O plano de saúde cobre dependentes?', first: 'beneficios/saude/1', single: true },
    { question: 'Quanto tempo tenho para pedir reembolso?', first: 'reembolso/prazos/1', single: true },
    { question: 'Até quando posso pedir reembolso?', first: 'reembolso/prazos/1', single: true },
    { question: 'Posso vender dias de férias?', first: 'ferias/abono/1', single: true },
    { question: 'Quantos dias posso trabalhar de outro país?', first: 'remoto/exterior/1', single: true },
  ],
  en: [
    { question: 'How long do I have to request a reimbursement?', first: 'reembolso/prazos/1', single: true },
    { question: 'How much time do I have to file a reimbursement?', first: 'reembolso/prazos/1', single: true },
    { question: 'How much can I spend on a hotel per night?', first: 'viagens/passagens/2', single: true },
    { question: 'Does the health plan cover dependents?', first: 'beneficios/saude/1', single: true },
    { question: 'Can I sell vacation days?', first: 'ferias/abono/1', single: true },
    { question: 'How many days can I work from another country?', first: 'remoto/exterior/1', single: true },
    { question: 'How many vacation days do I get?', first: 'ferias/direito/1' },
    { question: 'How many vacation days do I have per year?', first: 'ferias/direito/1' },
    { question: 'Can I work from another country for a few weeks?', first: 'remoto/exterior/1', single: true },
    { question: 'When is my reimbursement paid?', first: 'reembolso/aprovacao/1', single: true },
    { question: 'What if I lose my laptop?', first: 'equipamentos/perda-roubo/1', single: true },
    { question: 'What is the deadline to request vacation?', first: 'ferias/como-pedir/1', single: true },
    { question: 'How far in advance do I request vacation?', first: 'ferias/como-pedir/1', single: true },
    { question: 'How do I request a new laptop?', first: 'equipamentos/troca/1', single: true },
    { question: 'Is health insurance included?', first: 'beneficios/saude/1', single: true },
  ],
};

for (const lang of ['pt', 'en'] as const) {
  describe(`golden questions (${lang})`, () => {
    const { suggestions } = uiStrings[lang];

    it('answers the three suggestions from the right passage, with that single source', () => {
      suggestionAnswers.forEach((first, index) => expectAnswer(lang, { question: suggestions[index].text, first, single: true }));
    });

    it('hands the out-of-base suggestion off to a person', () => {
      const result = run(lang, suggestions[suggestions.length - 1].text);
      assert.equal(result.outcome, 'handoff');
      assert.equal(result.answer, null);
    });

    it('answers the hint examples', () => {
      const examples = hintExamples(lang);
      assert.equal(examples.length, hintAnswers.length);
      examples.forEach((question, index) => expectAnswer(lang, { question, first: hintAnswers[index], single: true }));
    });

    it('answers natural paraphrases without off-topic sources', () => {
      for (const golden of paraphrases[lang]) expectAnswer(lang, golden);
    });

    it('never labels a one or two term question as high confidence', () => {
      const result = run(lang, hintExamples(lang)[0]);
      assert.ok(result.analysis.terms.length <= 2);
      assert.ok(result.confidence.value >= 0.8);
      assert.equal(confidenceLevel(result), 'ok');
    });

    it('always cites retrieved passages when it answers', () => {
      for (const doc of corpora[lang].documents) {
        const result = run(lang, doc.title);
        const retrieved = new Set(result.hits.map((hit) => hit.index));
        for (const part of result.answer?.parts ?? []) assert.ok(retrieved.has(part.passageIndex), `${doc.title}: cited passage was not retrieved`);
        assert.ok(result.outcome !== 'answer' || (result.answer?.parts.length ?? 0) > 0, `${doc.title}: answer without sources`);
      }
    });
  });
}

describe('Portuguese stemmer', () => {
  it('keeps the inflections of one word together', () => {
    const reembolso = stem('reembolso', 'pt');
    for (const word of ['reembolsos', 'reembolsado', 'reembolsar', 'reembolsavel']) assert.equal(stem(word, 'pt'), reembolso, word);
    assert.equal(stem('peco', 'pt'), stem('pedir', 'pt'));
    assert.equal(stem('pago', 'pt'), stem('pagamento', 'pt'));
    assert.equal(stem('mes', 'pt'), stem('meses', 'pt'));
  });

  it('does not merge unrelated words', () => {
    assert.notEqual(stem('novo', 'pt'), stem('novidade', 'pt'));
    assert.notEqual(stem('mesa', 'pt'), stem('mes', 'pt'));
    assert.notEqual(stem('casa', 'pt'), stem('casamento', 'pt'));
  });

  it('does not match "novo" with "novidade" when asking for a new laptop', () => {
    const result = run('pt', 'Como peço um notebook novo?');
    const atendimento = engines.pt.passages.findIndex((passage) => passage.id === 'atendimento/prazos/2');
    assert.ok(!result.hits.some((hit) => hit.index === atendimento));
    for (const id of citedIds('pt', result)) assert.equal(id.split('/')[0], 'equipamentos', id);
  });
});

describe('English stemmer', () => {
  it('does not cut plain words that end like a suffix', () => {
    assert.equal(stem('applies', 'en'), stem('apply', 'en'));
    assert.notEqual(stem('apply', 'en'), stem('app', 'en'));
    assert.equal(stem('payment', 'en'), stem('pay', 'en'));
  });
});

describe('Question phrases', () => {
  it('searches for the deadline when the question asks how long someone has', () => {
    const en = analyzeQuery('How long do I have to request a reimbursement?', 'en');
    assert.deepEqual(en.terms.find((term) => term.stem === stem('deadline', 'en'))?.words, ['how long do i have']);
    assert.ok(!en.ignored.includes('how') && !en.ignored.includes('long'), en.ignored.join(', '));
    const pt = analyzeQuery('Quanto tempo eu tenho para pedir reembolso?', 'pt');
    assert.deepEqual(pt.terms.find((term) => term.stem === stem('prazo', 'pt'))?.words, ['quanto tempo eu tenho']);
    assert.ok(!pt.terms.some((term) => term.stem === stem('tempo', 'pt')));
  });

  it('keeps duration questions as plain searches', () => {
    const pt = analyzeQuery('Quanto tempo de férias eu tenho?', 'pt');
    assert.ok(!pt.terms.some((term) => term.stem === stem('prazo', 'pt')), pt.terms.map((term) => term.stem).join(', '));
    const en = analyzeQuery('How long is my vacation?', 'en');
    assert.ok(!en.terms.some((term) => term.stem === stem('deadline', 'en')), en.terms.map((term) => term.stem).join(', '));
  });
});

describe('English tokenizer', () => {
  it('keeps possessives and contractions on their word', () => {
    const analysis = analyzeQuery('What is this year’s bonus forecast? I don\'t know.', 'en');
    assert.deepEqual(analysis.terms.map((term) => term.stem), ['year', 'bonus', 'forecast']);
    assert.ok(!analysis.ignored.some((word) => word.length === 1 && word !== 'i'), analysis.ignored.join(', '));
  });
});
