// FLOAT ACTION BUTTON
$('.fab').click(function() {
  $(this).toggleClass('open');
});

// DROPDOWN CUSTOM
var dropdown = document.querySelectorAll('.custom-dropdown');
dropdown.forEach(function(item){
  item.querySelector('a').addEventListener('click', function(event) {
    event.preventDefault();
    var parent = item.parentNode;
    var child = parent.querySelector('.custom-dropdown-menu');
    if(child.style.display == 'block') {
      child.style.display = 'none';
      this.classList.remove('active');
    } else {
      child.style.display = 'block';
      this.classList.add('active');
    }
  });
});

