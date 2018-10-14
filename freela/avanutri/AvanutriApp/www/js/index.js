// Página de login
$('#content').load('../pages/login.html');

// Initial all accordion
function initAccordion() {
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, 'accordion');
}

// Init side menu
function openSidemenu(e) {
  e.preventDefault();
  $('.sidenav').sidenav();
  $('.sidenav').sidenav('open');
}

// Set active icon menu bottom
function activeMenuIcon(self) {
  $('.navigation-item').children('.icon').removeClass('active');
  $(self).children('.icon').addClass('active');
}