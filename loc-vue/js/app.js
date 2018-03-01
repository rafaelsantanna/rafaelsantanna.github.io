var app = new Vue({
  el: '#app',

  data: {
    listHeroesOptions: {},
    listPositionsOptions: {},
    listHeroesWeakOptions: {},
    listHeroesStrongOptions: {}
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
          this.listHeroesWeakOptions = response.data
          this.listHeroesStrongOptions = response.data

          setTimeout(function () {
            $('#ddlHero').material_select()
            $('#ddlCountersHeroesWeaks').material_select()
            $('#ddlCountersHeroesStrongs').material_select()
          }, 0);

        })
        .catch((error) => {
          console.log(error)
        })
    },

    getPositions: function () {
      axios.get('https://api-loc-rafaeel16.c9users.io/api/positions').then((response) => {
          console.log(response)
          this.listPositionsOptions = response.data

          setTimeout(function () {
            $('#ddlPosition').material_select()
          }, 0);

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
    },

    addCounter: function(weak_or_strong) {
      var heroes_id = $("#ddlHero").val();
      var positions_id = $("#ddlPosition").val();
      var heroes_weak = $("#ddlCountersHeroesWeaks").val();
      var heroes_strong = $("#ddlCountersHeroesStrongs").val();
      var countersheroes_id = 0;
      var counter = 0;

      if(weak_or_strong == 1){
        counter = 1;
        countersheroes_id = heroes_strong;
        // console.log(countersheroes_id + " recive Strong")
     }else {
        counter = 0;
        countersheroes_id = heroes_weak;
        // console.log(countersheroes_id + " recive Weak");
     }

     axios.post('https://api-loc-rafaeel16.c9users.io/api/counters', {
      counter:counter,
      heroes_id: heroes_id,
      positions_id: positions_id,
      countersheroes_id:countersheroes_id
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

    }

  }
})