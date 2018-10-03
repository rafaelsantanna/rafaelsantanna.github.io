// const NotFound = { template: '<p>Página não encontrada</p>' }
// const Login = {template: '<p>teste</p>'}
// const Home = { template: '<p>Página Inicial</p>' }
// const About = { template: '<p>Sobre</p>' }

// const routes = {
//   '/': Login,
//   '/home': Home,
//   '/about': About
// }

// var app = new Vue({
//   el: '#app',
//   data: {
//     currentRoute: window.location.pathname
//   },
//   computed: {
//     ViewComponent () {
//       return routes[this.currentRoute] || NotFound
//     }
//   },
//   render (h) { return h(this.ViewComponent) }
// })