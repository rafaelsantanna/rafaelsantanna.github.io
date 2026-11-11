/*
 * Niche presets for the preview page.
 * To add a niche, add one entry to NICHOS and one token block in previa.css.
 * Text tokens: {nome}, {cidade}, {em_cidade} (expands to " em <city>" or to nothing).
 */
(function () {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  var PARADO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function no(nome, attrs, pai) {
    var item = document.createElementNS(SVG, nome);
    Object.keys(attrs).forEach(function (k) { item.setAttribute(k, attrs[k]); });
    if (pai) pai.appendChild(item);
    return item;
  }

  function tela(largura, altura) {
    return no('svg', { viewBox: '0 0 ' + largura + ' ' + altura });
  }

  /* Climate: the thermometer drops from street heat to room comfort. */
  function cenaClima(palco) {
    var graus = document.createElement('p');
    var numero = document.createElement('span');
    graus.className = 'graus';
    graus.append(numero, '°');
    palco.appendChild(graus);
    if (PARADO) { numero.textContent = '23'; return; }
    var inicio = null;
    numero.textContent = '38';
    function quadro(agora) {
      if (inicio === null) inicio = agora;
      var p = Math.min((agora - inicio) / 1800, 1);
      var suave = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      numero.textContent = String(Math.round(38 - 15 * suave));
      if (p < 1) requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
  }

  /* Inn: the address side of a postcard, with stamp and postmark. */
  function cenaPousada(palco) {
    palco.innerHTML =
      '<div class="destino">' +
        '<span class="destino-rotulo">Para</span>' +
        '<span class="destino-linha" data-t="nome"></span>' +
        '<span class="destino-linha" data-t="cidade"></span>' +
      '</div>' +
      '<div class="selo">' +
        '<svg class="selo-carimbo" viewBox="0 0 120 120">' +
          '<defs><path id="volta" d="M60 60m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0"/></defs>' +
          '<circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
          '<circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
          '<text font-size="11.5" letter-spacing="2.5" fill="currentColor"><textPath href="#volta" data-t="carimbo"></textPath></text>' +
          '<path d="M38 55h44M38 62h44M38 69h44" stroke="currentColor" stroke-width="1.5" fill="none"/>' +
        '</svg>' +
        '<svg class="selo-arte" viewBox="0 0 96 116">' +
          '<rect x="4" y="4" width="88" height="108" fill="#F8FCFA"/>' +
          '<rect x="4" y="4" width="88" height="108" fill="none" stroke="var(--painel)" stroke-width="7" stroke-dasharray="0.1 10.9" stroke-linecap="round"/>' +
          '<rect x="14" y="14" width="68" height="70" fill="#F6C15B"/>' +
          '<circle cx="60" cy="42" r="13" fill="#F0643F"/>' +
          '<path d="M14 66c14-16 26-16 38-4s20 8 30-6v28H14Z" fill="#2E8076"/>' +
          '<path d="M14 76c12-8 24-8 36 0s22 6 32-2v10H14Z" fill="#0E4F4A"/>' +
          '<text x="48" y="101" text-anchor="middle" font-size="8" letter-spacing="1.2" fill="#0E4F4A" font-weight="700">RESERVA DIRETA</text>' +
        '</svg>' +
      '</div>';
  }

  /* Martial arts: a black belt with the gym name embroidered on it. */
  function cenaLuta(palco) {
    palco.innerHTML = '<div class="faixa"><span class="faixa-nome" data-t="nome"></span><span class="faixa-ponta"></span></div>';
  }

  /* Music: one notation diagram per instrument family. */
  var DESENHOS = {
    cordas: function () {
      var s = tela(240, 150), i;
      no('rect', { x: 70, y: 18, width: 100, height: 7, 'class': 'cheio' }, s);
      for (i = 0; i < 6; i++) no('line', { x1: 70 + i * 20, y1: 22, x2: 70 + i * 20, y2: 140, 'class': 'traco' }, s);
      for (i = 1; i <= 4; i++) no('line', { x1: 70, y1: 22 + i * 29.5, x2: 170, y2: 22 + i * 29.5, 'class': 'traco' }, s);
      [[1, 3], [2, 2], [4, 1]].forEach(function (d) {
        no('circle', { cx: 70 + d[0] * 20, cy: 22 + (d[1] - 0.5) * 29.5, r: 8, 'class': 'ponto' }, s);
      });
      return s;
    },
    teclas: function () {
      var s = tela(240, 150), i;
      for (i = 0; i < 8; i++) no('rect', { x: 24 + i * 24, y: 20, width: 24, height: 112, 'class': 'tecla' }, s);
      [0, 1, 3, 4, 5].forEach(function (k) {
        no('rect', { x: 24 + k * 24 + 16, y: 20, width: 16, height: 68, 'class': 'cheio' }, s);
      });
      [0, 2, 4].forEach(function (k) {
        no('circle', { cx: 24 + k * 24 + 12, cy: 112, r: 7, 'class': 'ponto' }, s);
      });
      return s;
    },
    pauta: function () {
      var s = tela(240, 150), i;
      for (i = 0; i < 5; i++) no('line', { x1: 16, y1: 45 + i * 15, x2: 224, y2: 45 + i * 15, 'class': 'traco' }, s);
      [[50, 105], [95, 90], [140, 75], [185, 60]].forEach(function (n) {
        no('ellipse', { cx: n[0], cy: n[1], rx: 10, ry: 7.5, transform: 'rotate(-20 ' + n[0] + ' ' + n[1] + ')', 'class': 'ponto' }, s);
        no('line', { x1: n[0] + 9, y1: n[1] - 3, x2: n[0] + 9, y2: n[1] - 48, 'class': 'haste' }, s);
      });
      return s;
    },
    ritmo: function () {
      var s = tela(240, 150), i;
      for (i = 0; i < 3; i++) no('line', { x1: 16, y1: 40 + i * 35, x2: 224, y2: 40 + i * 35, 'class': 'traco' }, s);
      for (i = 0; i < 8; i++) {
        no('path', { d: 'M' + (26 + i * 26) + ' 33l14 14m0-14l-14 14', 'class': 'haste' }, s);
        if (i % 4 === 2) no('circle', { cx: 33 + i * 26, cy: 75, r: 8, 'class': 'ponto' }, s);
        if (i % 4 === 0 || i === 5) no('circle', { cx: 33 + i * 26, cy: 110, r: 8, 'class': 'cheio' }, s);
      }
      return s;
    }
  };

  function desenhoPara(rotulo) {
    if (/viol|guitar|ukulele|baixo|cavaqu|cordas/i.test(rotulo)) return 'cordas';
    if (/piano|teclado/i.test(rotulo)) return 'teclas';
    if (/bateria|percuss|pandeiro/i.test(rotulo)) return 'ritmo';
    return 'pauta';
  }

  function mudaMusica(palco, escolha) {
    var rotulo = escolha[0] ? escolha[0].rotulo : 'Violão';
    var legenda = document.createElement('p');
    legenda.className = 'cena-legenda';
    legenda.textContent = rotulo;
    palco.replaceChildren(DESENHOS[desenhoPara(rotulo)](), legenda);
  }

  /* Dance: a step chart, footprints placed in order. */
  var PASSOS = [
    [[92, 128, 0], [150, 128, 0], [208, 98, 24], [208, 46, 0], [150, 46, 0], [92, 76, -24]],
    [[50, 112, -6], [104, 64, 6], [158, 112, -6], [212, 64, 6], [266, 112, -6]],
    [[52, 136, 32], [106, 112, 32], [160, 88, 32], [214, 64, 32], [268, 40, 32]]
  ];

  function mudaDanca(palco, escolha) {
    var pontos = PASSOS[(escolha[0] ? escolha[0].indice : 0) % PASSOS.length];
    var s = tela(320, 170);
    no('polyline', { points: pontos.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), 'class': 'trilha' }, s);
    pontos.forEach(function (p, i) {
      var lugar = no('g', { transform: 'translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')' }, s);
      var pe = no('g', { 'class': 'pegada' + (i % 2 ? ' pegada-par' : ''), style: '--i:' + i }, lugar);
      no('ellipse', { cx: 0, cy: -7, rx: 9, ry: 15 }, pe);
      no('ellipse', { cx: 0, cy: 17, rx: 7, ry: 7 }, pe);
      no('text', { x: 0, y: -3, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700 }, pe).textContent = String(i + 1);
    });
    palco.replaceChildren(s);
  }

  window.NICHOS = {
    clima: {
      nomePadrao: 'Sua Empresa',
      fontes: 'family=Archivo:wdth,wght@62..125,400..900',
      navServicos: 'Serviços',
      titulo: 'Seu ar gelando de novo.',
      lead: 'Instalação, limpeza e conserto{em_cidade}. Conte o que está acontecendo e receba o orçamento no WhatsApp.',
      saudacao: 'Oi! Encontrei vocês pelo site e quero um orçamento.',
      grupos: [
        { pergunta: 'O que você precisa?', opcoes: [
          { rotulo: 'Não está gelando', frase: 'Meu ar-condicionado não está gelando' },
          { rotulo: 'Está pingando', frase: 'Meu ar-condicionado está pingando água' },
          { rotulo: 'Instalar um novo', frase: 'Quero instalar um ar-condicionado novo' },
          { rotulo: 'Limpeza', frase: 'Quero fazer a limpeza do meu ar-condicionado' }
        ] },
        { pergunta: 'Onde é?', opcoes: [
          { rotulo: 'Casa', frase: 'em casa' },
          { rotulo: 'Apartamento', frase: 'em apartamento' },
          { rotulo: 'Comércio', frase: 'em um comércio' }
        ] }
      ],
      mensagem: function (e, ctx) {
        return 'Oi! Encontrei vocês pelo site. ' + e[0].frase + '. É ' + e[1].frase + (ctx.cidade ? ', em ' + ctx.cidade : '') + '. Podem me passar um orçamento?';
      },
      oferta: { titulo: 'O que a gente faz', acao: 'Pedir orçamento', itens: [
        { nome: 'Instalação', desc: 'Split, inverter e multi-split, com acabamento limpo e teste no final.' },
        { nome: 'Limpeza e higienização', desc: 'Limpeza completa das duas unidades, sem sujeira no ambiente.' },
        { nome: 'Manutenção preventiva', desc: 'Revisão periódica para o aparelho durar mais e gastar menos energia.' },
        { nome: 'Conserto', desc: 'Diagnóstico do defeito e orçamento antes de qualquer serviço.' }
      ] },
      passos: [
        ['Conte o que precisa', 'Escolha as opções acima ou escreva do seu jeito.'],
        ['Receba o orçamento', 'A resposta chega no WhatsApp, com o valor e o prazo.'],
        ['Marque a visita', 'Combine o melhor dia e horário para o atendimento.']
      ],
      duvidas: [
        ['Quanto custa?', 'Depende do serviço e do aparelho. Mande o modelo ou uma foto pelo WhatsApp e respondemos com o valor.'],
        ['Vocês atendem no meu bairro?', 'Atendemos {cidade} e região. Informe o bairro na mensagem para confirmarmos.'],
        ['De quanto em quanto tempo devo limpar o ar-condicionado?', 'Em casa, o mais comum é a cada seis meses. Em comércio, o intervalo costuma ser menor.']
      ],
      fecho: ['Calor não espera.', 'Chame no WhatsApp, conte o que precisa e receba o orçamento.'],
      cena: cenaClima
    },

    pousada: {
      nomePadrao: 'Sua Pousada',
      fontes: 'family=Gloock&family=Kalam&family=Figtree:wght@400;500;700',
      navServicos: 'Acomodações',
      titulo: 'Sua próxima estadia começa aqui.',
      lead: 'Fale direto com a pousada{em_cidade}, sem intermediário. Escolha as datas e mande o pedido pelo WhatsApp.',
      saudacao: 'Olá! Encontrei a pousada pelo site e quero consultar datas.',
      estadia: true,
      mensagem: function (e) {
        return 'Olá! Queremos ficar de ' + e.entrada + ' a ' + e.saida + ', ' + e.hospedes + '. Tem disponibilidade?';
      },
      oferta: { titulo: 'Onde você vai ficar', acao: 'Consultar datas', itens: [
        { nome: 'Suíte casal', desc: 'Cama queen, ar-condicionado e varanda.' },
        { nome: 'Suíte família', desc: 'Espaço para até quatro pessoas, com café da manhã.' },
        { nome: 'Chalé', desc: 'Mais privacidade, com cozinha compacta e área externa.' }
      ] },
      passos: [
        ['Escolha as datas', 'Informe a entrada, a saída e quantas pessoas vêm.'],
        ['Receba a resposta', 'A pousada confirma a disponibilidade e o valor pelo WhatsApp.'],
        ['Garanta a reserva', 'Combine o pagamento direto com a pousada.']
      ],
      duvidas: [
        ['Por que reservar direto?', 'Você fala com quem vai te receber, tira as dúvidas na hora e não paga taxa de intermediário.'],
        ['Como confirmo a reserva?', 'Depois de combinar as datas pelo WhatsApp, a pousada envia a confirmação por lá mesmo.'],
        ['Posso tirar dúvidas antes de reservar?', 'Pode. Mande a mensagem com as datas e pergunte o que quiser.']
      ],
      fecho: ['Sua viagem começa com uma mensagem.', 'Consulte as datas direto com a pousada.'],
      cena: cenaPousada
    },

    luta: {
      nomePadrao: 'Sua Academia',
      fontes: 'family=Rubik:wght@400;500;700;800',
      navServicos: 'Modalidades',
      titulo: 'Comece do zero. O tatame ensina o resto.',
      lead: 'Turmas para iniciantes, adultos e crianças{em_cidade}. Escolha a modalidade e agende sua aula experimental pelo WhatsApp.',
      saudacao: 'Oi! Encontrei vocês pelo site e quero agendar uma aula experimental.',
      extrasNoPedido: true,
      descPadrao: 'Turmas para iniciantes e avançados, com acompanhamento de perto.',
      grupos: [
        { pergunta: 'Qual modalidade?', opcoes: [
          { rotulo: 'Jiu-jitsu', frase: 'jiu-jitsu' },
          { rotulo: 'Muay thai', frase: 'muay thai' },
          { rotulo: 'Boxe', frase: 'boxe' },
          { rotulo: 'Turma kids', frase: 'turma kids' }
        ] },
        { pergunta: 'Melhor horário?', opcoes: [
          { rotulo: 'Manhã', frase: 'de manhã' },
          { rotulo: 'Tarde', frase: 'à tarde' },
          { rotulo: 'Noite', frase: 'à noite' }
        ] }
      ],
      mensagem: function (e) {
        return 'Oi! Encontrei vocês pelo site. Quero agendar uma aula experimental de ' + e[0].frase + '. Prefiro treinar ' + e[1].frase + '.';
      },
      oferta: { titulo: 'O que você treina aqui', acao: 'Agendar aula', itens: [
        { nome: 'Jiu-jitsu', desc: 'Técnica, defesa pessoal e condicionamento, com turmas separadas por nível.' },
        { nome: 'Muay thai', desc: 'Golpes, cardio e disciplina. Dá para começar sem nunca ter treinado.' },
        { nome: 'Boxe', desc: 'Movimentação, fundamentos e treino de saco para todos os níveis.' },
        { nome: 'Turma kids', desc: 'Coordenação, respeito e confiança para as crianças.' }
      ] },
      passos: [
        ['Escolha a modalidade', 'Diga o que quer treinar e o horário que funciona.'],
        ['Agende a aula experimental', 'A resposta chega no WhatsApp, com dia e horário.'],
        ['Venha treinar', 'Roupa leve e água bastam para a primeira aula.']
      ],
      duvidas: [
        ['Nunca treinei. Posso começar?', 'Pode. A maioria dos alunos começa do zero, e a primeira aula já é adaptada ao seu ritmo.'],
        ['Preciso de equipamento?', 'Para a aula experimental, roupa leve e água. O professor explica o que vale comprar depois.'],
        ['Tem turma para criança?', 'Informe a idade na mensagem e indicamos a melhor turma.']
      ],
      fecho: ['A primeira aula é a mais difícil. A gente facilita.', 'Agende pelo WhatsApp e venha conhecer o tatame.'],
      cena: cenaLuta
    },

    musica: {
      nomePadrao: 'Sua Escola de Música',
      fontes: 'family=Caprasimo&family=Courier+Prime:wght@700&family=Figtree:wght@400;500;700',
      navServicos: 'Cursos',
      titulo: 'Aprenda a tocar a música que você ama.',
      acordes: { 0: 'C', 2: 'G7', 4: 'Am', 7: 'F' },
      lead: 'Aulas individuais e em grupo{em_cidade}, para todas as idades. Escolha o instrumento e marque sua primeira aula pelo WhatsApp.',
      saudacao: 'Oi! Encontrei vocês pelo site e quero marcar uma aula experimental.',
      extrasNoPedido: true,
      descPadrao: 'Do básico ao avançado, com repertório escolhido junto com você.',
      grupos: [
        { pergunta: 'O que você quer aprender?', opcoes: [
          { rotulo: 'Violão', frase: 'violão' },
          { rotulo: 'Piano', frase: 'piano' },
          { rotulo: 'Canto', frase: 'canto' },
          { rotulo: 'Bateria', frase: 'bateria' }
        ] },
        { pergunta: 'Seu nível', opcoes: [
          { rotulo: 'Começando do zero', frase: 'Estou começando do zero' },
          { rotulo: 'Já tenho alguma prática', frase: 'Já tenho alguma prática' },
          { rotulo: 'Quero me aperfeiçoar', frase: 'Quero me aperfeiçoar' }
        ] }
      ],
      mensagem: function (e) {
        return 'Oi! Encontrei vocês pelo site. Quero marcar uma aula experimental de ' + e[0].frase + '. ' + e[1].frase + '.';
      },
      oferta: { titulo: 'O que você aprende aqui', acao: 'Marcar aula', itens: [
        { nome: 'Violão', desc: 'Do primeiro acorde às suas músicas preferidas, com cifra e partitura.' },
        { nome: 'Piano', desc: 'Leitura, técnica e repertório, do clássico ao popular.' },
        { nome: 'Canto', desc: 'Respiração, afinação e interpretação para soltar a voz com segurança.' },
        { nome: 'Bateria', desc: 'Ritmo, coordenação e as levadas dos principais estilos.' }
      ] },
      passos: [
        ['Escolha o instrumento', 'Diga o que quer aprender e em que nível está.'],
        ['Marque a aula experimental', 'A resposta chega no WhatsApp, com dia e horário.'],
        ['Comece a tocar', 'Na primeira aula você já sai tocando alguma coisa.']
      ],
      duvidas: [
        ['Preciso ter o instrumento?', 'Para a aula experimental, não. Depois o professor orienta o que vale a pena comprar.'],
        ['Tem idade certa para começar?', 'Não. Há alunos de todas as idades, e a aula se adapta a cada um.'],
        ['As aulas são individuais?', 'Há opções individuais e em grupo. Diga na mensagem o que prefere.']
      ],
      fecho: ['A primeira nota é a mais difícil. Depois vira música.', 'Marque sua aula experimental pelo WhatsApp.'],
      aoMudar: mudaMusica
    },

    danca: {
      nomePadrao: 'Sua Escola de Dança',
      fontes: 'family=Alfa+Slab+One&family=Figtree:wght@400;500;700',
      navServicos: 'Aulas',
      titulo: 'Seu corpo já sabe o ritmo. A gente ensina os passos.',
      lead: 'Aulas{em_cidade} para quem nunca dançou e para quem quer evoluir. Escolha o ritmo e marque sua aula experimental pelo WhatsApp.',
      saudacao: 'Oi! Encontrei vocês pelo site e quero marcar uma aula experimental.',
      extrasNoPedido: true,
      descPadrao: 'Turmas para iniciantes e avançados, em horários variados.',
      grupos: [
        { pergunta: 'O que você quer dançar?', opcoes: [
          { rotulo: 'Dança de salão', frase: 'dança de salão' },
          { rotulo: 'Forró', frase: 'forró' },
          { rotulo: 'Ballet', frase: 'ballet' },
          { rotulo: 'Jazz', frase: 'jazz' }
        ] },
        { pergunta: 'Para quem é a aula?', opcoes: [
          { rotulo: 'Para mim', frase: 'A aula é para mim' },
          { rotulo: 'Para um casal', frase: 'A aula é para um casal' },
          { rotulo: 'Para uma criança', frase: 'A aula é para uma criança' }
        ] }
      ],
      mensagem: function (e) {
        return 'Oi! Encontrei vocês pelo site. Quero marcar uma aula experimental de ' + e[0].frase + '. ' + e[1].frase + '.';
      },
      oferta: { titulo: 'O que você dança aqui', acao: 'Marcar aula', itens: [
        { nome: 'Dança de salão', desc: 'Bolero, samba de gafieira e soltinho, com ou sem par.' },
        { nome: 'Forró', desc: 'Do dois pra lá, dois pra cá até os giros, em turmas animadas.' },
        { nome: 'Ballet', desc: 'Postura, técnica e leveza, em turmas infantis e adultas.' },
        { nome: 'Jazz', desc: 'Ritmo, expressão e coreografia para soltar o corpo.' }
      ] },
      passos: [
        ['Escolha o ritmo', 'Diga o que quer dançar e para quem é a aula.'],
        ['Marque a aula experimental', 'A resposta chega no WhatsApp, com dia e horário.'],
        ['Venha dançar', 'Roupa confortável e disposição. Não precisa de par.']
      ],
      duvidas: [
        ['Nunca dancei. Consigo acompanhar?', 'Consegue. As turmas de iniciantes começam do básico, no seu tempo.'],
        ['Preciso ir com par?', 'Não. Nas aulas em dupla, os pares se revezam durante a turma.'],
        ['Tem aula para criança?', 'Informe a idade na mensagem e indicamos a turma certa.']
      ],
      fecho: ['O primeiro passo é mandar um oi.', 'Marque sua aula experimental pelo WhatsApp.'],
      aoMudar: mudaDanca
    }
  };
}());
