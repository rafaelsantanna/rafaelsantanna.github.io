var slideout = new Slideout({
    'panel': document.getElementById('main'),
    'menu': document.getElementById('menu-mobile'),
    'padding': 256,
    'tolerance': 70
  });

  // Toggle button
  document.querySelector('.toggle-button').addEventListener('click', function() {
    slideout.toggle();
});