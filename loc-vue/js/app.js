var app = new Vue({
    el: '#app',
    data: {
      message: 'Olá Vue!'
    }
  });

  var app2 = new Vue({
    el: '#app-2',
    data: {
      message: 'Você carregou esta página em ' + new Date().toLocaleString()
    }
  });

  var app3 = new Vue({
    el: '#app-3',
    data: {
      seen: true
    }
  });

  var app4 = new Vue({
    el: '#app-4',
    data: {
      todos: [
        { text: 'Aprender JavaScript' },
        { text: 'Aprender Vue' },
        { text: 'Criar algo incrível' }
      ]
    }
  });