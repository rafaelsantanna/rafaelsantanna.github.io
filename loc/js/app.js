 $(document).ready(function () {

     //Seleciona o input name-hero na página de Cadastro
     $("#name-hero").focus();

     //Ajax preencher o Select de Heróis
     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/heroes",
         type: "GET",
         dataType: "JSON",
         success: function (response) {
             console.log(response);
             var optionHeroi = "<option value='0'>--Select Hero--</option>";
             $.each(response, function (i, item) {
                 optionHeroi += "<option value='" + item.id + "'>" + item.name + "</option>";
             }); //Fim Each

             $("#ddlHero").append(optionHeroi);
             $("#ddlHero").material_select();

         },
         error: function (e) {
             console.log("Erro: " + e);
         }

     });

     //Ajax para preencher o Select das Posições
     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/positions",
         type: "GET",
         dataType: "JSON",
         success: function (response) {
             console.log(response);
             var optionPosition = "<option value='0'>--Select Postion--</option>";
             $.each(response, function (i, item) {
                 optionPosition += "<option value='" + item.id + "'>" + item.name + "</option>";
             }); //Fim Each

             $("#ddlPosition").append(optionPosition);
             $("#ddlPosition").material_select();
         },
         error: function (e) {
             console.log("Erro: " + e);
         }
     });

     //Ajax preencher o Select dos Counters Heroes
     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/countersheroes",
         type: "GET",
         dataType: "JSON",
         success: function (response) {
             console.log(response);
             var optionHeroi = "<option value='0'>--Select Hero--</option>";
             $.each(response, function (i, item) {
                 optionHeroi += "<option value='" + item.id + "'>" + item.name + "</option>";
             }); //Fim Each

             $("#ddlCountersHeroesWeaks").append(optionHeroi);
             $("#ddlCountersHeroesStrongs").append(optionHeroi);

             $("#ddlCountersHeroesWeaks").material_select();
             $("#ddlCountersHeroesStrongs").material_select();

         },
         error: function (e) {
             console.log("Erro: " + e);
         }

     });

     //Fazendo a função que captura a mudança do select de herois e também da posição
     var hero_id = 0;
     $("#ddlHero").on("change", function(){
        hero_id = $(this).val();
     });
    
     var position_id = 0;
     $("#ddlPosition").on("change", function(){
        position_id = $(this).val();
        
     });


 });

 //Função Ajax para cadastrar o Counter Weak ou Strong
 // 0 para Weak e 1 para Strong
 function Counter(weak_or_strong) {
     var heroes_id = $("#ddlHero").val();
     var positions_id = $("#ddlPosition").val();
     var heroes_weak = $("#ddlCountersHeroesWeaks").val();
     var heroes_strong = $("#ddlCountersHeroesStrongs").val();
     var countersheroes_id = 0;
     var counter = 0;
    //  console.log(weak_or_strong + " weak or strong");
    //  console.log(heroes_id + " Hero");
    //  console.log(positions_id + " Position");
    //  console.log(heroes_weak + " Weak");
    //  console.log(heroes_strong + " Strong");
    //  console.log("-----------");
     
     if(weak_or_strong == 1){
        counter = 1;
        countersheroes_id = heroes_strong;
        // console.log(countersheroes_id + " recive Strong")
     }else {
        counter = 0;
        countersheroes_id = heroes_weak;
        // console.log(countersheroes_id + " recive Weak");
     }

     // Enviando o POST que vai cadastrar o Counter
     $.ajax({
         type: "POST",
         data: {
             "counter":counter,
             "heroes_id": heroes_id,
             "positions_id": positions_id,
             "countersheroes_id":countersheroes_id
         },
         url: "https://api-loc-rafaeel16.c9users.io/api/counters",
         success: function (data) {
             console.log("Counter successfully registered");

             window.location.reload();
         },
         error: function (e) {
             console.log("Erro: " + e);
         }
     });

 }


 //Função Ajax para cadastrar o herói
 function CadastraHeroi() {
     var name = $("#name-hero").val();
     var icon = $("#name-icon").val();

     if (name && icon != "") {
         $.ajax({
             type: "POST",
             data: {
                 "name": name,
                 "icon": icon
             },
             url: "https://api-loc-rafaeel16.c9users.io/api/heroes",
             success: function (data) {
                 console.log("Hero successfully registered");

                 $("#nome-heroi").val("")
                 $("#nome-icone").val("");

                 window.location.reload();
             },
             error: function (e) {
                 console.log("Erro: " + e);
             }
         });
     } else {
         Materialize.toast("Fill the fields!", 4000);
     }
 }

 // Captura o ENTER para executar a função de Cadastrar o Herói
 $(document).keypress(function (e) {
     if (e.which == 13) {
         CadastraHeroi();
     }
 });