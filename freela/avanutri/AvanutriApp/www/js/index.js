// Página de login
$('#content').load('../pages/login.html');

// Initial all accordion
function initAccordion() {
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, 'accordion');
}

function openSidemenu(e) {
  e.preventDefault();
  $('.sidenav').sidenav();
  $('.sidenav').sidenav('open');
}