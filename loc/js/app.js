 $(document).ready(function () {

     //Seleciona o input para Cadastro do Herói na página de Cadastro
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


 });


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
                 alert("Erro: " + e);
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