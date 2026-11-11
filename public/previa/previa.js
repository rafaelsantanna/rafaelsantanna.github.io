/*
 * Preview engine. Reads the lead from the query string and fills the page.
 *   t = niche key      n = business name     c = city
 *   w = WhatsApp digits (with country code)  g = Google rating   a = review count
 *   m = comma-separated list that replaces the default options (classes, instruments)
 * Every value from the URL is written with textContent, never as markup.
 */
(function () {
  'use strict';

  var AUTOR_WHATSAPP = '351926979735';
  var NICHOS = window.NICHOS;
  var params = new URLSearchParams(location.search);

  function limpar(valor, max) {
    return (valor || '').replace(/\s+/g, ' ').trim().slice(0, max);
  }

  var pedida = params.get('t') || '';
  var chave = Object.prototype.hasOwnProperty.call(NICHOS, pedida) ? pedida : 'clima';
  var nicho = NICHOS[chave];
  var notaBruta = params.get('g') || '';
  var avalBruta = params.get('a') || '';

  var ctx = {
    nome: limpar(params.get('n'), 60) || nicho.nomePadrao,
    cidade: limpar(params.get('c'), 40),
    zap: (params.get('w') || '').replace(/\D/g, '').slice(0, 15),
    nota: /^[1-5]([.,]\d)?$/.test(notaBruta) ? notaBruta.replace('.', ',') : '',
    avaliacoes: /^\d{1,6}$/.test(avalBruta) ? Number(avalBruta).toLocaleString('pt-BR') : '',
    extras: limpar(params.get('m'), 120).split(',').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 4)
  };

  function texto(modelo) {
    return modelo
      .replace(/\{nome\}/g, function () { return ctx.nome; })
      .replace(/\{em_cidade\}/g, function () { return ctx.cidade ? ' em ' + ctx.cidade : ''; })
      .replace(/\{cidade\}/g, function () { return ctx.cidade || 'sua cidade'; });
  }

  function linkZap(numero, mensagem) {
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem);
  }

  function criar(tag, classe, conteudo) {
    var item = document.createElement(tag);
    if (classe) item.className = classe;
    if (conteudo) item.textContent = conteudo;
    return item;
  }

  var raiz = document.documentElement;
  raiz.dataset.nicho = chave;
  document.title = ctx.nome + ' | Prévia do site';

  var fontes = criar('link');
  fontes.rel = 'stylesheet';
  fontes.href = 'https://fonts.googleapis.com/css2?' + nicho.fontes + '&display=swap';
  document.head.appendChild(fontes);

  /* Offer rows and first option group share the custom list when one is given. */
  var grupos = nicho.grupos ? nicho.grupos.map(function (g) { return { pergunta: g.pergunta, opcoes: g.opcoes }; }) : [];
  var itens = nicho.oferta.itens;
  if (ctx.extras.length && nicho.extrasNoPedido) {
    grupos[0].opcoes = ctx.extras.map(function (rotulo) { return { rotulo: rotulo, frase: rotulo.toLowerCase() }; });
    itens = ctx.extras.map(function (rotulo) {
      var padrao = nicho.oferta.itens.filter(function (i) { return i.nome.toLowerCase() === rotulo.toLowerCase(); })[0];
      return { nome: rotulo, desc: padrao ? padrao.desc : nicho.descPadrao };
    });
  }

  var valores = {
    nome: ctx.nome,
    cidade: ctx.cidade || 'Brasil',
    carimbo: ((ctx.cidade || 'Brasil') + ' · reserva direta · ').toUpperCase(),
    local: ctx.cidade ? ctx.cidade + ' e região' : '',
    aviso: 'Prévia feita para ' + ctx.nome + '.',
    titulo: texto(nicho.titulo),
    lead: texto(nicho.lead),
    navServicos: nicho.navServicos,
    ofertaTitulo: nicho.oferta.titulo,
    fechoTitulo: texto(nicho.fecho[0]),
    fechoTexto: texto(nicho.fecho[1])
  };

  function preencher(escopo) {
    escopo.querySelectorAll('[data-t]').forEach(function (item) {
      var valor = valores[item.getAttribute('data-t')];
      if (valor !== undefined) item.textContent = valor;
    });
  }
  preencher(document);

  /* Chord symbols over the headline words (music niche). */
  if (nicho.acordes) {
    var h1 = document.querySelector('h1');
    var palavras = h1.textContent.split(' ');
    h1.textContent = '';
    palavras.forEach(function (palavra, i) {
      var trecho = criar('span', '', palavra);
      if (nicho.acordes[i]) { trecho.className = 'acorde'; trecho.dataset.acorde = nicho.acordes[i]; }
      h1.append(trecho, i < palavras.length - 1 ? ' ' : '');
    });
  }

  if (ctx.nota && ctx.avaliacoes) {
    var nota = document.querySelector('[data-nota]');
    nota.querySelector('span').textContent = ctx.nota + ' no Google, em ' + ctx.avaliacoes + ' avaliações';
    nota.hidden = false;
    var prova = document.querySelector('.prova');
    prova.querySelector('.prova-frase').textContent = 'Nota ' + ctx.nota + ' no Google, em ' + ctx.avaliacoes + ' avaliações.';
    prova.hidden = false;
  }

  document.querySelectorAll('[data-zap]').forEach(function (a) { a.href = linkZap(ctx.zap, nicho.saudacao); });
  document.querySelectorAll('[data-autor]').forEach(function (a) {
    a.href = linkZap(AUTOR_WHATSAPP, 'Oi, Rafael! Vi a prévia da página (' + ctx.nome + ') e quero saber mais.');
  });

  /* Request composer. */
  var form = document.querySelector('.pedido');
  var caixaGrupos = form.querySelector('.pedido-grupos');
  var recado = form.querySelector('.recado-texto');
  var enviar = form.querySelector('[data-enviar]');
  var palco = document.querySelector('.cena');

  function chips(nomeCampo, pergunta, opcoes) {
    var grupo = criar('fieldset');
    grupo.appendChild(criar('legend', '', pergunta));
    var linha = criar('div', 'chips');
    opcoes.forEach(function (opcao, i) {
      var rotulo = criar('label', 'chip');
      var entrada = criar('input');
      entrada.type = 'radio';
      entrada.name = nomeCampo;
      entrada.value = String(i);
      entrada.checked = i === 0;
      rotulo.append(entrada, criar('span', '', opcao.rotulo));
      linha.appendChild(rotulo);
    });
    grupo.appendChild(linha);
    return grupo;
  }

  function iso(data) {
    return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' + String(data.getDate()).padStart(2, '0');
  }
  function diaMes(valorIso) {
    var p = valorIso.split('-');
    return p[2] + '/' + p[1];
  }
  function campoData(nomeCampo, rotulo, data) {
    var caixa = criar('label', 'campo-data', rotulo);
    var entrada = criar('input');
    entrada.type = 'date';
    entrada.name = nomeCampo;
    entrada.value = iso(data);
    entrada.min = iso(new Date());
    caixa.appendChild(entrada);
    return caixa;
  }

  var HOSPEDES = [
    { rotulo: '1', frase: '1 pessoa' },
    { rotulo: '2', frase: '2 pessoas' },
    { rotulo: '3', frase: '3 pessoas' },
    { rotulo: '4 ou mais', frase: '4 ou mais pessoas' }
  ];

  if (nicho.estadia) {
    var sexta = new Date();
    sexta.setDate(sexta.getDate() + (((5 - sexta.getDay() + 7) % 7) || 7));
    var domingo = new Date(sexta);
    domingo.setDate(sexta.getDate() + 2);
    var datas = criar('div', 'datas');
    datas.append(campoData('entrada', 'Entrada', sexta), campoData('saida', 'Saída', domingo));
    caixaGrupos.append(datas, chips('hospedes', 'Hóspedes', HOSPEDES));
    form.elements.hospedes[1].checked = true;
  } else {
    grupos.forEach(function (g, i) { caixaGrupos.appendChild(chips('g' + i, g.pergunta, g.opcoes)); });
  }

  function escolha() {
    return grupos.map(function (g, i) {
      var indice = Number(form.elements['g' + i].value);
      return { indice: indice, rotulo: g.opcoes[indice].rotulo, frase: g.opcoes[indice].frase };
    });
  }

  function atualizar(animar) {
    var mensagem;
    if (nicho.estadia) {
      var entrada = form.elements.entrada;
      var saida = form.elements.saida;
      if (entrada.value && (!saida.value || saida.value <= entrada.value)) {
        var seguinte = new Date(entrada.value + 'T12:00:00');
        seguinte.setDate(seguinte.getDate() + 1);
        saida.value = iso(seguinte);
      }
      mensagem = nicho.mensagem({
        entrada: entrada.value ? diaMes(entrada.value) : '...',
        saida: saida.value ? diaMes(saida.value) : '...',
        hospedes: HOSPEDES[Number(form.elements.hospedes.value)].frase
      }, ctx);
    } else {
      var atual = escolha();
      mensagem = nicho.mensagem(atual, ctx);
      if (nicho.aoMudar) nicho.aoMudar(palco, atual);
    }
    recado.textContent = mensagem;
    enviar.href = linkZap(ctx.zap, mensagem);
    if (animar) {
      recado.classList.remove('troca');
      void recado.offsetWidth;
      recado.classList.add('troca');
    }
  }

  if (nicho.cena) { nicho.cena(palco); preencher(palco); }
  form.addEventListener('change', function () { atualizar(true); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  atualizar(false);

  /* Offer list. Each row can preselect its option in the composer. */
  var lista = document.querySelector('.lista');
  itens.forEach(function (item, i) {
    var linha = criar('li');
    var ligar = criar('a', 'ligar', nicho.oferta.acao);
    ligar.href = '#pedido';
    ligar.addEventListener('click', function () {
      var campo = form.elements.g0;
      if (campo && nicho.extrasNoPedido && campo[i]) { campo[i].checked = true; atualizar(true); }
    });
    linha.append(criar('h3', '', item.nome), criar('p', '', item.desc), ligar);
    lista.appendChild(linha);
  });

  var ol = document.querySelector('.passos ol');
  nicho.passos.forEach(function (passo) {
    var li = criar('li');
    li.append(criar('h3', '', passo[0]), criar('p', '', passo[1]));
    ol.appendChild(li);
  });

  var duvidas = document.querySelector('.duvidas-lista');
  nicho.duvidas.forEach(function (par) {
    var bloco = criar('details');
    bloco.append(criar('summary', '', texto(par[0])), criar('p', '', texto(par[1])));
    duvidas.appendChild(bloco);
  });

  /* The floating button steps aside while the composer is on screen. */
  var flutuante = document.querySelector('.flutuante');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      flutuante.classList.toggle('recolhido', entradas[0].isIntersecting);
    }).observe(document.querySelector('.objeto'));
  }
}());
