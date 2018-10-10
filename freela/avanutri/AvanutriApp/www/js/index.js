// Initial all accordion
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('.collapsible');
  M.Collapsible.init(elems, 'accordion');
});

// INIT Tabs recipe details
var tabs = document.querySelector('#tabs-recipe');
M.Tabs.init(tabs);

function navigateTo(event, origin, destiny) {
  event.preventDefault();
  document.querySelector(destiny).style.display = 'block';
  document.querySelector(origin).style.display = 'none';
}

$('#content').load('../pages/login.html');