 $(document).ready(function () {

     //Seleciona o input name-hero na página de Cadastro
     $("#name-hero").focus();

     //Ajax preencher o Select de Heróis
     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/heroes",
         type: "GET",
         dataType: "JSON",
         success: function (response) {
             //console.log(response);
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
             //console.log(response);
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

     //Ajax para preencher o Select dos Counters Heroes
     $.ajax({
         url: "https://api-loc-rafaeel16.c9users.io/api/countersheroes",
         type: "GET",
         dataType: "JSON",
         success: function (response) {
             //console.log(response);
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

     // Função que captura o ID do Herói escolhido no Select
     var hero_id = 0;
     $("#ddlHero").on("change", function(){
        hero_id = $(this).val();
     });
    
     // Função que captura o Id da Posição no Select e também preenche a lista dos Counters Weak e Strong 
     var position_id = 0;
     $("#ddlPosition").on("change", function(){
        position_id = $(this).val();
        
        // Limpando a Lista Weak
        $("#listWeak > li").remove();
        $("#listStrong > li").remove();
        
        // Ajax para trazer a Lista de Counters e preencher a Lista
        $.ajax({
            url:"https://api-loc-rafaeel16.c9users.io/api/counters/listCounters/heroes_id/"+ hero_id +"/positions_id/"+position_id,
            type:"GET",
            dataType:"JSON",
            success: function(response){
                //console.log(response);
                
                var listCountersWeaks = "";
                var listCountersStrongs = "";
                $.each(response, function(i, item){
                   if(item.counter == 0){
                       listCountersWeaks += "<li class='collection-item' id='counter_"+item.id+"'><div>"+ item.name +"<a href='#' onclick='deleteCounter("+item.id+")' class='secondary-content'><i class='material-icons'>delete</i></a></div></li>";
                   }
                   else{
                       listCountersStrongs += "<li class='collection-item' id='counter_"+item.id+"'><div>"+ item.name +"<a href='#' onclick='deleteCounter("+item.id+")' class='secondary-content'><i class='material-icons'>delete</i></a></div></li>";
                   }

                });

                $("#listWeak").append(listCountersWeaks);
                $("#listStrong").append(listCountersStrongs);
            },
            error:function(e){
                console.log("Counters not found" + e);
            }
        });
     });


 });

 //Função Ajax para cadastrar o Counter Weak ou Strong
 // 0(Zero) para Weak e 1 para Strong
 function Counter(weak_or_strong) {
     $("#loading").show();
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
             $("#loading").hide();
             Materialize.toast("Counter successfully registered",4000);
            var nameCounter = "";

            //Para não precisar atualizar a página, estou adicionando o Counter a Lista depois do POST
            if(counter == 0){
                nameCounter = $("#ddlCountersHeroesWeaks option:selected").text();
                $("#listWeak").append("<li class='collection-item'><div>"+ nameCounter +"<a href='#!' class='secondary-content'><i class='material-icons'>delete</i></a></div></li>");
            }
            else{
                nameCounter = $("#ddlCountersHeroesStrongs option:selected").text();
                $("#listStrong").append("<li class='collection-item'><div>"+ nameCounter +"<a href='#!' class='secondary-content'><i class='material-icons'>delete</i></a></div></li>");
            }

         },
         error: function (e) {
             console.log("Erro: " + e);
         }
     });

 }


 //Função Ajax para cadastrar o herói na página de Cadastro
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
                 $("#name-hero").val("")
                 $("#name-icon").val("");

                 Materialize.toast("Hero successfully registered");
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

 // Função para deletar Counters
 function deleteCounter(id){
     $("#loading").show();
     $.ajax({
         type: "DELETE",
         data:{"id":id},
         url:"https://api-loc-rafaeel16.c9users.io/api/counters/" + id,
         success:function(response){
             $("#loading").hide();
             $("#counter_"+id).remove();
             Materialize.toast("Counter successfully deleted",4000);
         },
         error:function(e){
             console.log("Erro:" + e);
         }
     });
 }