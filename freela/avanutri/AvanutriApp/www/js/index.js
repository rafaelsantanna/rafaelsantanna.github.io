// Initial all accordion
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, 'accordion');
  });


// INIT Tabs recipe details
var tabs = document.querySelector('#tabs-recipe');
M.Tabs.init(tabs);


function trocarPagina(page) {
  if(page == 1){
    document.querySelector('#login').style.display = "none";
    document.querySelector('#forgot-account').style.display = "block";
  }
  if(page == 2){
    document.querySelector('#forgot-account').style.display = "none";
    document.querySelector('#user-anthropometric-data').style.display = "block";
  }
  if(page == 3){
    document.querySelector('#user-anthropometric-data').style.display = "none";
    document.querySelector('#dietary-prescription').style.display = "block";
  }
  if(page == 4){
    document.querySelector('#dietary-prescription').style.display = "none";
    document.querySelector('#replacement-list').style.display = "block";
  }
  if(page == 5){
    document.querySelector('#replacement-list').style.display = "none";
    document.querySelector('#grocery-list').style.display = "block";
  }
  if(page == 6){
    document.querySelector('#grocery-list').style.display = "none";
    document.querySelector('#notifications').style.display = "block";
  }
  if(page == 7){
    document.querySelector('#notifications').style.display = "none";
    document.querySelector('#nutritional-recipes').style.display = "block";
  }
  if(page == 8){
    document.querySelector('#nutritional-recipes').style.display = "none";
    document.querySelector('#recipe-details').style.display = "block";
  }
  if(page == 9){
    document.querySelector('#recipe-details').style.display = "none";
    document.querySelector('#login').style.display = "block";
  }
}