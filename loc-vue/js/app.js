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