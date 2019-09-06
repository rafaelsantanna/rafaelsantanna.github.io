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
      userName: "",
      products: [],
      showModal: true
    },
    mounted: function () {
      var vm = this;
      this.loadProducts();
      var isLogged = this.checkCookie('username');
      if(isLogged) {
        vm.showModal = false;
        vm.userName = vm.getCookie('username');
      } else {
        vm.showModal = true;
      }
    },
    methods: {
      addItemGiftList: function(productId) {
        var vm = this;
        firebase.database().ref('products/' + productId).update({
          signed: true,
          userSigned: vm.userName
        });
      },
      removeItemGiftList: function(productId) {
        firebase.database().ref('products/' + productId).update({
          signed: false
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
              signed: item.val().signed,
              userSigned: item.val().userSigned
            });
          });
        });
      },
      login: function() {
        var vm = this;
        vm.setCookie("username", vm.userName, 365);
        vm.showModal = false;
      },
      getCookie: function(cname) {
        var name = cname + "=";
        var ca = window.document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      },
      setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        window.document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      },
      checkCookie: function(cname) {
        var vm = this;
        var user = vm.getCookie(cname);
        if (user != "") {
          return true
        } 
          return false;
      },
      logout: function() {
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
        location.reload();
      }
    }
  })