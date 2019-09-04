  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBJb6hOvbXGWxLvqbAiyFZErREBNfPE4ro",
    authDomain: "giftlist-e27ea.firebaseapp.com",
    databaseURL: "https://giftlist-e27ea.firebaseio.com",
    projectId: "giftlist-e27ea",
    storageBucket: "",
    messagingSenderId: "813499865296",
    appId: "1:813499865296:web:65e603c3585e4239"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var app = new Vue({
    el: '#app',
    data: {
      userName: 'Fulano',
      products: []
    },
    mounted: function () {
      this.loadProducts();
    },
    methods: {
      addItemGiftList: function(productId) {
        firebase.database().ref('products/' + productId).update({
          signed: true,
        });
      },
      removeItemGiftList: function(productId) {
        firebase.database().ref('products/' + productId).update({
          signed: false,
        });
      },
      loadProducts: function() {
        var vm = this;
        firebase.database().ref('products').on('value', function (snapshot) {
          vm.products = [];
          snapshot.forEach(function(item){
            vm.products.push({
              id: item.key,
              name: item.val().name,
              imgUrl: item.val().imgUrl,
              signed: item.val().signed
            });
          });
        });
      }
    }
  })