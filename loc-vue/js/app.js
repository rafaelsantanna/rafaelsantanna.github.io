var app = new Vue({
  el: '#app',

  data: {
    listHeroesOptions: {},
    listPositionsOptions: {}
  },

  mounted() {
    this.getHeroes(),
    this.getPositions(),
    this.getCounterHeroes()
  },

  methods: {

    getHeroes: function () {
      axios.get('https://api-loc-rafaeel16.c9users.io/api/heroes').then((response) => {
          console.log(response)
          this.listHeroesOptions = response.data

          setTimeout(function () {
            $('#ddlHero').material_select()
          }, 0);

        })
        .catch((error) => {
          console.log(error)
        })
    },

    getPositions: function () {
      axios.get('https://api-loc-rafaeel16.c9users.io/api/positions').then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.log(error)
        })
    },

    getCounterHeroes: function () {
      axios.get('https://api-loc-rafaeel16.c9users.io/api/countersheroes').then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.log(error)
        })
    }

  }
})