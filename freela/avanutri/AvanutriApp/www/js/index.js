// Página de login
$('#content').load('../pages/login.html');

// Initial all accordion
function initAccordion() {
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, 'accordion');
}

// Init Tabs recipe details
function initTabs() {
  var tabs = document.querySelector('#tabs-recipe');
  M.Tabs.init(tabs);
}

function openSidemenu(e) {
  e.preventDefault();
  $('.sidenav').sidenav();
  $('.sidenav').sidenav('open');
}