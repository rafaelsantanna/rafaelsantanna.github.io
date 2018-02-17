var app = new Vue({
  el:'#app',
  
  data: {
    listHeroes: {},
    listPositions: {},

  },

  mounted(){
    this.getHeroes(),
    this.getPositions(),
    this.getCounterHeroes()
  },

  methods: {
    
    getHeroes: function () {
      axios.get('https://api-loc-rafaeel16.c9users.io/api/heroes').then((response) => {
        console.log(response)
        this.listHeroes = response.data
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