import type { DemoProject } from '../types';
import { demoDisclaimer, previewFor } from './shared.ts';

export const project: DemoProject = {
  slug: 'knowledge-assistant',
  name: 'Bússola',
  kind: 'ai',
  category: { en: 'Applied AI / Knowledge base', pt: 'IA aplicada / Base de conhecimento' },
  tagline: { en: 'Answers with the source beside them.', pt: 'Respostas com a fonte ao lado.' },
  summary: {
    en: 'An internal knowledge assistant that retrieves relevant passages from fictional documents and assembles an answer that cites each source. Retrieval runs entirely in the browser.',
    pt: 'Um assistente de conhecimento interno que busca trechos relevantes em documentos fictícios e monta a resposta citando cada fonte. A recuperação roda inteira no navegador.',
  },
  problem: {
    en: 'Policies, manuals, and procedures end up scattered across files nobody can find. AI assistants help, but they are only trustworthy when they show where each piece of information came from.',
    pt: 'Políticas, manuais e procedimentos ficam espalhados em arquivos que ninguém encontra. Assistentes com IA ajudam, mas só são confiáveis quando mostram de onde tiraram cada informação.',
  },
  approach: {
    en: 'Documents are split into passages and indexed with BM25. Each question retrieves the most relevant passages, the answer is assembled from them with numbered citations, and when confidence is low the assistant hands off to a person.',
    pt: 'Os documentos são divididos em trechos e indexados com BM25. Cada pergunta recupera os trechos mais relevantes, a resposta é montada a partir deles com citações numeradas e, quando a confiança é baixa, o assistente encaminha para uma pessoa.',
  },
  highlights: {
    en: [
      { title: 'Visible retrieval', text: 'An evidence panel lists every retrieved passage with its BM25 score, a comparison bar, and the matching terms highlighted.' },
      { title: 'Citations that lead to the source', text: 'Each part of the answer carries a numbered citation. Hovering or focusing it highlights the passage, and the reader opens the full document at that spot.' },
      { title: 'Confidence threshold and handoff', text: 'Below the threshold there is no answer: a card summarizes the question and simulates a handoff to HR, without sending anything.' },
      { title: 'Pipeline with real timings', text: '“How this answer was built” shows the normalized terms, the ignored words, and the measured time of each step.' },
      { title: 'Search tuned for Portuguese', text: 'Accent folding, stop words per language, and a light stemmer, so “reembolso”, “reembolsado”, and “reembolsar” find each other.' },
      { title: 'Controls to experiment with', text: 'Document filter, adjustable top-k and threshold, helpful or not helpful ratings, and a conversation saved only in the browser, with a reset button.' },
    ],
    pt: [
      { title: 'Recuperação visível', text: 'Um painel de evidências lista cada trecho recuperado com a pontuação BM25, uma barra comparativa e os termos em comum com a pergunta destacados.' },
      { title: 'Citações que levam à fonte', text: 'Cada parte da resposta tem uma citação numerada. Passar o mouse ou focar destaca o trecho, e o leitor abre o documento inteiro já no ponto citado.' },
      { title: 'Limiar de confiança e encaminhamento', text: 'Abaixo do limiar não há resposta: um cartão resume a pergunta e simula o encaminhamento para o RH, sem enviar nada.' },
      { title: 'Pipeline com tempos reais', text: '“Como esta resposta foi montada” mostra os termos normalizados, as palavras ignoradas e o tempo medido de cada etapa.' },
      { title: 'Busca ajustada ao português', text: 'Remove acentos, ignora as stopwords de cada idioma e usa um stemmer leve, para que “reembolso”, “reembolsado” e “reembolsar” se encontrem.' },
      { title: 'Controles para testar', text: 'Filtro por documento, top-k e limiar ajustáveis, avaliação útil ou não útil e conversa salva só no navegador, com botão para reiniciar.' },
    ],
  },
  decisions: {
    en: [
      { title: 'Retrieval before generation', text: 'In production, a language model would receive only the retrieved passages. Here the answer is extractive: sentences chosen by their overlap with the question, with no invented text, to show the pipeline without depending on an API.' },
      { title: 'Confidence that explains itself', text: 'Confidence combines the best BM25 score, normalized against a reference, with how many question terms the top passages cover. The formula and the threshold are on screen, and the threshold can be adjusted.' },
      { title: 'Saying it does not know', text: 'Terms that do not exist in the knowledge base count against the answer, so a question like the bonus forecast falls below the threshold and goes to a person instead of becoming an invented answer.' },
    ],
    pt: [
      { title: 'Recuperação antes da geração', text: 'Em produção, um modelo de linguagem receberia apenas os trechos recuperados. Aqui a resposta é extrativa: frases escolhidas pela sobreposição com a pergunta, sem texto inventado, para mostrar o pipeline sem depender de uma API.' },
      { title: 'Confiança que se explica', text: 'A confiança combina a melhor pontuação BM25, normalizada por uma referência, com a cobertura dos termos da pergunta nos melhores trechos. A fórmula e o limiar aparecem na tela, e o limiar pode ser ajustado.' },
      { title: 'Saber dizer que não sabe', text: 'Termos que não existem na base pesam contra a resposta, então uma pergunta como a previsão do bônus fica abaixo do limiar e vai para uma pessoa em vez de virar uma resposta inventada.' },
    ],
  },
  stack: ['TypeScript', 'BM25', 'Astro', 'CSS', 'WAI-ARIA'],
  services: ['ai-automation-rag', 'b2b-saas-internal-systems'],
  boundary: {
    en: 'It does not use a language model or send questions to any server. Search, answer assembly, and the simulated handoff happen in your browser over 10 fictional documents, and ratings and the conversation stay in local storage only.',
    pt: 'Não usa modelo de linguagem nem envia perguntas para servidores. A busca, a montagem da resposta e o encaminhamento simulado acontecem no seu navegador, sobre 10 documentos fictícios, e as avaliações e a conversa ficam só no armazenamento local.',
  },
  disclaimer: demoDisclaimer,
  palette: { base: '#121116', ink: '#EEEAE2', accent: '#F2C14E' },
  device: 'desktop',
  preview: previewFor('knowledge-assistant', {
    en: 'Bússola knowledge assistant answering a question with numbered citations and the retrieved passages beside it',
    pt: 'Assistente Bússola respondendo uma pergunta com citações numeradas e os trechos recuperados ao lado',
  }),
};
