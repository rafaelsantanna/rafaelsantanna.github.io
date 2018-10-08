// Initial all accordion
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems, 'accordion');
  });


// INIT Tabs recipe details
var tabs = document.querySelector('#tabs-recipe');
M.Tabs.init(tabs);