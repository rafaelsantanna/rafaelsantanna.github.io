 $(document).ready(function () {

    //Seleciona o input para Cadastro do Herói na página de Cadastro
     $("#nome-heroi").focus();

     //Ajax preencher o Select de Heróis
     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/heroes",
         type: "GET",
         dataType:"JSON",
         success: function (response) {
             console.log(response);
            var optionHeroi = "<option value='0'>--Selecione um Herói--</option>";
            $.each(response, function(i, item) {
                optionHeroi += "<option value='" + item.id + "'>" + item.name + "</option>";
            }); //Fim Each

            $("#ddlHeroi").append(optionHeroi);
            $("#ddlHeroi").material_select();

         },
         error: function (e) {
             console.log("Erro: " + e);
             alert("Erro: " + e);
         }

     });

     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/positions",
         type: "GET",
         dataType: "JSON",
        success: function(response){
            console.log(response);
            var optionPosition = "<option value='0'>--Selecione uma Posição--</option>";
            $.each(response, function(i, item){
                optionPosition += "<option value='" + item.id + "'>" + item.name + "</option>";
            }); //Fim Each

            $("#ddlPosition").append(optionPosition);
            $("#ddlPosition").material_select();
        },
        error: function(e){
            console.log("Erro: " + e);
            alert("Erro: " + e);
        }
     });


 });


 //Função Ajax para cadastrar o herói
 function CadastraHeroi() {
     var name = $("#nome-heroi").val();
     var icon = $("#nome-icone").val();
     $.ajax({
         type: "POST",
         data: {
             "name": name,
             "icon": icon
         },
         url: "https://api-loc-rafaeel16.c9users.io/api/heroes",
         success: function (data) {
             console.log("Herói Cadastrado com sucesso.");

             $("#nome-heroi").val("")
             $("#nome-icone").val("");

             window.location.reload();
         },
         error: function (e) {
             alert("Erro: " + e);
         }
     });
 }

 // Captura o ENTER para executar a função de Cadastrar o Herói
 $(document).keypress(function (e) {
     if (e.which == 13) {
         CadastraHeroi();
     }
 });