import type { KbCorpus } from './types';

// Fictional company and fictional rules, written for this demonstration only.
export const corpusPt: KbCorpus = {
  company: 'Vela Norte',
  handoffTeam: 'RH',
  documents: [
    {
      id: 'reembolso',
      title: 'Reembolso de despesas',
      owner: 'Financeiro',
      updated: '2026-07',
      summary: 'Prazos, limites e comprovantes para pedir reembolso.',
      sections: [
        {
          id: 'quem-pode',
          heading: 'Quem pode pedir',
          paragraphs: [
            'Pessoas contratadas pela CLT e estagiárias podem pedir reembolso de despesas feitas a trabalho e aprovadas pela liderança. Prestadores PJ seguem o que estiver no próprio contrato e não usam este fluxo.',
          ],
        },
        {
          id: 'prazos',
          heading: 'Prazos e envio',
          paragraphs: [
            'O pedido de reembolso deve ser lançado no Portal Financeiro em até 30 dias corridos após a data da despesa. Pedidos fora desse prazo só são analisados com justificativa da liderança direta.',
            'Cada pedido precisa da nota fiscal ou do recibo, em PDF ou foto legível. Comprovantes de cartão sem a descrição do que foi comprado não são aceitos.',
          ],
        },
        {
          id: 'limites',
          heading: 'Limites por categoria',
          paragraphs: [
            'Refeições a trabalho têm limite de R$ 90 por pessoa por dia. Em viagens, o limite de refeição sobe para R$ 140 por dia e inclui o café da manhã quando o hotel não oferece.',
            'Corridas por aplicativo são reembolsadas integralmente em visitas a clientes. A quilometragem com carro próprio é paga a R$ 1,20 por quilômetro, com o trajeto informado no pedido.',
          ],
        },
        {
          id: 'aprovacao',
          heading: 'Aprovação e pagamento',
          paragraphs: [
            'A liderança direta aprova o reembolso em até 5 dias úteis. Depois disso, o Financeiro confere os comprovantes e paga na folha do mês seguinte, ou na quinzena seguinte quando o valor passa de R$ 1.000.',
          ],
        },
        {
          id: 'nao-reembolsavel',
          heading: 'O que não é reembolsável',
          paragraphs: [
            'Bebidas alcoólicas, multas de trânsito, gorjetas acima de 10% e compras pessoais não são reembolsadas. Quando a nota misturar itens pessoais e de trabalho, peça notas separadas no caixa.',
          ],
        },
      ],
    },
    {
      id: 'ferias',
      title: 'Férias e ausências',
      owner: 'RH',
      updated: '2026-05',
      summary: 'Como dividir, pedir e registrar férias, licenças e folgas.',
      sections: [
        {
          id: 'direito',
          heading: 'Quantos dias e como dividir',
          paragraphs: [
            'Cada pessoa contratada pela CLT tem direito a 30 dias de férias a cada 12 meses trabalhados.',
            'As férias podem ser divididas em até três períodos, sendo um deles de pelo menos 14 dias corridos e os demais de no mínimo 5 dias.',
          ],
        },
        {
          id: 'como-pedir',
          heading: 'Prazo e como pedir',
          paragraphs: [
            'O pedido de férias é feito no Portal de Pessoas com pelo menos 45 dias de antecedência. A liderança tem 7 dias para aprovar ou sugerir outra data.',
            'As férias não podem começar nos dois dias que antecedem um feriado ou o descanso semanal. O pagamento cai até 2 dias antes do início.',
          ],
        },
        {
          id: 'abono',
          heading: 'Abono e adiantamento',
          paragraphs: [
            'É possível vender até 10 dias de férias, o chamado abono, desde que o pedido seja feito junto com a solicitação das férias. O adiantamento da primeira parcela do décimo terceiro pode ser pedido no mesmo formulário.',
          ],
        },
        {
          id: 'ausencias',
          heading: 'Ausências justificadas',
          paragraphs: [
            'Consultas e exames médicos são registrados no ponto, com o atestado enviado ao RH em até 48 horas. Afastamentos por doença com mais de 15 dias seguem o fluxo de afastamento, com acompanhamento do RH.',
            'Casamento, nascimento de filho ou falecimento de familiar são informados pelo Portal de Pessoas. A Vela Norte concede 5 dias de folga para casamento e 20 dias de licença-paternidade.',
          ],
        },
        {
          id: 'banco-de-horas',
          heading: 'Folgas e banco de horas',
          paragraphs: [
            'Horas extras aprovadas viram banco de horas, que precisa ser compensado em até 6 meses. A folga é combinada com a liderança e registrada no ponto.',
          ],
        },
      ],
    },
    {
      id: 'remoto',
      title: 'Trabalho remoto e híbrido',
      owner: 'RH',
      updated: '2026-08',
      summary: 'Modelos de trabalho, dias de escritório e trabalho fora do Brasil.',
      sections: [
        {
          id: 'modelos',
          heading: 'Modelos de trabalho',
          paragraphs: [
            'A Vela Norte tem três modelos de trabalho: presencial, híbrido, com dois dias fixos no escritório por semana, e remoto. O modelo de cada vaga é definido na contratação e pode ser revisto uma vez por ano com a liderança.',
          ],
        },
        {
          id: 'escritorio',
          heading: 'Dias no escritório',
          paragraphs: [
            'No modelo híbrido, terça e quinta são os dias de escritório da maioria dos times. Reserve sua mesa no aplicativo Mesa Livre até as 18h do dia anterior.',
          ],
        },
        {
          id: 'exterior',
          heading: 'Trabalho fora do Brasil',
          paragraphs: [
            'Trabalhar de outro país é permitido por até 30 dias por ano, somando todos os períodos, e exige aprovação prévia do RH e da liderança. O pedido deve ser feito com 20 dias de antecedência pelo Portal de Pessoas.',
            'Períodos maiores no exterior dependem de análise jurídica e tributária e, em geral, não são aprovados. O acesso a sistemas de clientes pode ser bloqueado fora do Brasil.',
          ],
        },
        {
          id: 'auxilio',
          heading: 'Auxílio home office',
          paragraphs: [
            'Quem trabalha no modelo remoto ou híbrido recebe auxílio home office de R$ 150 por mês, pago na folha, para ajudar com internet e energia. Cadeira e monitor podem ser pedidos uma única vez, pelo fluxo de equipamentos.',
          ],
        },
        {
          id: 'horario',
          heading: 'Horário e disponibilidade',
          paragraphs: [
            'O horário de colaboração comum é das 10h às 16h, no horário de Brasília. Fora dessa faixa, cada pessoa organiza a própria agenda e mantém o status atualizado no chat.',
          ],
        },
      ],
    },
    {
      id: 'equipamentos',
      title: 'Equipamentos e notebooks',
      owner: 'TI',
      updated: '2026-06',
      summary: 'Kit inicial, troca, perda, roubo e devolução de equipamentos.',
      sections: [
        {
          id: 'kit',
          heading: 'Kit inicial',
          paragraphs: [
            'Toda pessoa recebe no primeiro dia um notebook configurado, carregador, mouse e headset. Os times de design e de dados recebem também um monitor externo de 27 polegadas.',
          ],
        },
        {
          id: 'troca',
          heading: 'Troca e upgrade',
          paragraphs: [
            'Os notebooks são trocados a cada 4 anos, ou antes se o diagnóstico da TI indicar defeito sem conserto viável. Para pedir um notebook novo, abra um chamado na TI com o número de patrimônio do atual. Pedidos de upgrade de memória passam pela liderança e pela TI e são atendidos em até 10 dias úteis.',
          ],
        },
        {
          id: 'perda-roubo',
          heading: 'Perda, roubo ou dano',
          paragraphs: [
            'Em caso de perda ou roubo do notebook, avise a TI imediatamente pelo canal #ti-urgente para que o equipamento seja bloqueado a distância. Em seguida, registre um boletim de ocorrência e anexe ao chamado em até 3 dias.',
            'Danos acidentais no notebook são cobertos pelo seguro da empresa uma vez por ano. A partir do segundo dano no mesmo ano, a liderança avalia o caso junto com a TI.',
          ],
        },
        {
          id: 'uso',
          heading: 'Uso pessoal e softwares',
          paragraphs: [
            'O notebook pode ser usado para tarefas pessoais leves, mas não para guardar arquivos pessoais. Instale apenas softwares do catálogo da TI; pedidos fora do catálogo são analisados em até 5 dias úteis.',
          ],
        },
        {
          id: 'devolucao',
          heading: 'Devolução',
          paragraphs: [
            'No desligamento, o equipamento deve ser devolvido em até 5 dias úteis. Para quem trabalha remoto, a TI agenda a coleta em casa, sem custo para a pessoa.',
          ],
        },
      ],
    },
    {
      id: 'seguranca',
      title: 'Segurança da informação',
      owner: 'TI',
      updated: '2026-09',
      summary: 'Senhas, phishing, classificação de dados e incidentes.',
      sections: [
        {
          id: 'senhas',
          heading: 'Senhas e acesso',
          paragraphs: [
            'Use o gerenciador de senhas corporativo e ative a autenticação em dois fatores em todos os sistemas que oferecerem. Senhas precisam ter pelo menos 14 caracteres e nunca podem ser compartilhadas, nem mesmo com a TI.',
          ],
        },
        {
          id: 'phishing',
          heading: 'Phishing e mensagens suspeitas',
          paragraphs: [
            'Desconfie de mensagens que pedem urgência, senha ou pagamento. Use o botão Reportar phishing do e-mail para encaminhar a mensagem suspeita e não clique em links nem abra anexos.',
          ],
        },
        {
          id: 'classificacao',
          heading: 'Classificação de dados',
          paragraphs: [
            'Os dados da Vela Norte são classificados como públicos, internos, confidenciais ou restritos. Dados de clientes são sempre confidenciais e só podem ficar nos sistemas aprovados pela TI.',
            'Não envie dados confidenciais por chat pessoal, pen drive ou e-mail pessoal. Para compartilhar com parceiros, use o link seguro do drive corporativo, com data de expiração.',
          ],
        },
        {
          id: 'incidentes',
          heading: 'Incidentes de segurança',
          paragraphs: [
            'Qualquer suspeita de incidente, como acesso indevido, vazamento ou equipamento perdido, deve ser comunicada em até 1 hora pelo canal #seguranca. Não tente investigar por conta própria nem apague evidências.',
          ],
        },
        {
          id: 'ia',
          heading: 'Ferramentas de IA',
          paragraphs: [
            'Ferramentas de IA externas só podem receber informações públicas. Para dados internos, use apenas as ferramentas homologadas pela TI, que não guardam o conteúdo das conversas.',
          ],
        },
      ],
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      owner: 'RH',
      updated: '2026-04',
      summary: 'O que acontece antes e durante os primeiros 90 dias.',
      sections: [
        {
          id: 'antes',
          heading: 'Antes do primeiro dia',
          paragraphs: [
            'O RH envia o kit de boas-vindas e o contrato para assinatura digital até 5 dias antes da data de início. O notebook chega em casa ou fica pronto na recepção, conforme o modelo de trabalho.',
          ],
        },
        {
          id: 'primeira-semana',
          heading: 'Primeira semana',
          paragraphs: [
            'Na primeira semana, a pessoa participa da integração na segunda-feira, conhece o time e ganha um padrinho ou madrinha, que acompanha os primeiros 90 dias. As trilhas obrigatórias de segurança e conduta devem ser concluídas até sexta-feira.',
          ],
        },
        {
          id: 'acessos',
          heading: 'Acessos',
          paragraphs: [
            'Os acessos básicos, como e-mail, chat e Portal de Pessoas, são liberados no primeiro dia. Acessos a sistemas de clientes dependem de pedido da liderança e levam até 2 dias úteis.',
          ],
        },
        {
          id: 'acompanhamento',
          heading: 'Acompanhamento',
          paragraphs: [
            'Há conversas de acompanhamento com a liderança aos 30, 60 e 90 dias. No fim dos 90 dias, a pessoa responde a uma pesquisa de onboarding que ajuda o RH a melhorar o processo.',
          ],
        },
      ],
    },
    {
      id: 'viagens',
      title: 'Viagens corporativas',
      owner: 'Financeiro',
      updated: '2026-03',
      summary: 'Antecedência, passagens, hotéis, adiantamento e cancelamentos.',
      sections: [
        {
          id: 'solicitacao',
          heading: 'Solicitação de viagem',
          paragraphs: [
            'Toda viagem a trabalho é solicitada no Portal de Viagens com pelo menos 10 dias de antecedência para voos nacionais e 21 dias para voos internacionais. A liderança aprova a viagem antes de qualquer compra.',
          ],
        },
        {
          id: 'passagens',
          heading: 'Passagens e hospedagem',
          paragraphs: [
            'A agência parceira compra as passagens em classe econômica, com a tarifa mais barata num intervalo de duas horas do horário pedido. Voos com mais de 8 horas podem ser em classe econômica premium.',
            'O gasto com hotel tem limite de R$ 380 por noite nas capitais e R$ 280 nas demais cidades. O valor da diária deve incluir o café da manhã sempre que possível.',
          ],
        },
        {
          id: 'adiantamento',
          heading: 'Adiantamento de viagem',
          paragraphs: [
            'Viagens com pernoite dão direito a um adiantamento opcional de até R$ 500, com prestação de contas em até 10 dias depois do retorno. As refeições seguem os limites da política de reembolso.',
          ],
        },
        {
          id: 'seguro',
          heading: 'Seguro e emergências',
          paragraphs: [
            'Viagens internacionais têm seguro-viagem contratado pela agência. Em uma emergência, ligue para a central da agência, que atende 24 horas, e avise a liderança assim que possível.',
          ],
        },
        {
          id: 'cancelamentos',
          heading: 'Cancelamentos e remarcações',
          paragraphs: [
            'Cancelamentos e remarcações de viagem são pedidos pelo Portal de Viagens. Multas causadas por motivo pessoal podem ser descontadas, a critério da liderança.',
          ],
        },
      ],
    },
    {
      id: 'beneficios',
      title: 'Benefícios',
      owner: 'RH',
      updated: '2026-01',
      summary: 'Saúde, alimentação, bem-estar e auxílio educação.',
      sections: [
        {
          id: 'saude',
          heading: 'Plano de saúde',
          paragraphs: [
            'Os planos de saúde e odontológico são oferecidos sem custo para quem trabalha na Vela Norte. O plano de saúde também cobre dependentes, que podem ser incluídos com coparticipação de 30% da mensalidade.',
          ],
        },
        {
          id: 'alimentacao',
          heading: 'Alimentação',
          paragraphs: [
            'O vale-refeição e alimentação é de R$ 1.100 por mês, creditado no cartão flexível até o quinto dia útil. O valor pode ser dividido livremente entre refeição e mercado.',
          ],
        },
        {
          id: 'bem-estar',
          heading: 'Bem-estar',
          paragraphs: [
            'O auxílio bem-estar de R$ 120 por mês pode ser usado em academias, aplicativos de meditação ou terapia. Também há 3 sessões gratuitas de apoio psicológico por mês, pelo programa Conversa Aberta.',
          ],
        },
        {
          id: 'educacao',
          heading: 'Auxílio educação',
          paragraphs: [
            'O auxílio educação reembolsa até 70% do valor de cursos ligados à função, com limite anual de R$ 6.000. A matrícula precisa ser aprovada pela liderança antes de começar o curso.',
          ],
        },
        {
          id: 'inicio',
          heading: 'Quando começam a valer',
          paragraphs: [
            'Os benefícios valem a partir do primeiro dia de trabalho, exceto o auxílio educação, liberado depois de 3 meses de casa.',
          ],
        },
      ],
    },
    {
      id: 'atendimento',
      title: 'Atendimento ao cliente (SLA interno)',
      owner: 'Atendimento',
      updated: '2026-08',
      summary: 'Prioridades, prazos de resposta, escalonamento e plantão.',
      sections: [
        {
          id: 'prioridades',
          heading: 'Prioridades',
          paragraphs: [
            'Os chamados de clientes têm quatro prioridades: crítica, quando o sistema está fora do ar; alta, quando uma função principal falha; média, quando há erro com alternativa; e baixa, para dúvidas e melhorias.',
          ],
        },
        {
          id: 'prazos',
          heading: 'Prazos de resposta',
          paragraphs: [
            'A primeira resposta ao cliente deve sair em até 30 minutos para chamados críticos, 2 horas para alta prioridade, 8 horas úteis para média e 2 dias úteis para baixa.',
            'Chamados críticos têm atualização para o cliente a cada hora até a solução, mesmo quando ainda não há novidade.',
          ],
        },
        {
          id: 'escalonamento',
          heading: 'Escalonamento',
          paragraphs: [
            'Se um chamado crítico não for resolvido em 4 horas, o plantão escala para a coordenação de engenharia. Chamados de alta prioridade são escalados depois de 1 dia útil sem solução.',
          ],
        },
        {
          id: 'plantao',
          heading: 'Plantão',
          paragraphs: [
            'O plantão funciona 24 horas para chamados críticos, em escala semanal. Quem está de plantão recebe adicional de sobreaviso e precisa responder ao alerta em até 15 minutos.',
          ],
        },
        {
          id: 'encerramento',
          heading: 'Encerramento',
          paragraphs: [
            'Um chamado só é encerrado depois da confirmação do cliente ou após 3 dias úteis sem resposta dele. Todo encerramento registra a causa e o artigo da base de conhecimento usado, quando houver.',
          ],
        },
      ],
    },
    {
      id: 'compras',
      title: 'Compras e fornecedores',
      owner: 'Suprimentos',
      updated: '2026-02',
      summary: 'Alçadas de aprovação, orçamentos, cadastro e pagamento.',
      sections: [
        {
          id: 'quando',
          heading: 'Quando abrir uma compra',
          paragraphs: [
            'Toda compra de produto ou serviço para a empresa passa pelo Portal de Compras, mesmo quando o fornecedor já é conhecido. Assinaturas de software também entram nesse fluxo.',
          ],
        },
        {
          id: 'alcadas',
          heading: 'Alçadas de aprovação',
          paragraphs: [
            'Compras de até R$ 2.000 precisam apenas da aprovação da liderança. Entre R$ 2.000 e R$ 20.000, a diretoria da área também aprova; acima de R$ 20.000, a compra vai para o Comitê de Compras, que se reúne às quartas-feiras.',
            'Compras acima de R$ 5.000 exigem três orçamentos de fornecedores diferentes, exceto quando há fornecedor exclusivo com justificativa.',
          ],
        },
        {
          id: 'cadastro',
          heading: 'Cadastro de fornecedores',
          paragraphs: [
            'Novos fornecedores são cadastrados por Suprimentos, com CNPJ ativo, certidões negativas e conta bancária em nome da empresa. O cadastro leva até 5 dias úteis.',
          ],
        },
        {
          id: 'pagamento',
          heading: 'Pagamento de fornecedores',
          paragraphs: [
            'Notas fiscais de fornecedores devem chegar a Suprimentos em até 3 dias após o recebimento. Os pagamentos saem nos dias 10 e 25 de cada mês, com prazo mínimo de 15 dias depois da emissão da nota.',
          ],
        },
        {
          id: 'conflito',
          heading: 'Conflito de interesses',
          paragraphs: [
            'Quem tem relação pessoal ou societária com um fornecedor deve declarar o conflito e não participa da escolha. Brindes de fornecedores acima de R$ 150 devem ser recusados com educação.',
          ],
        },
      ],
    },
  ],
};
