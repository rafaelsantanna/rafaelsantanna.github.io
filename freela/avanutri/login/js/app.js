/* ---------------------------------------------------
    LOGIN FORM STYLE
----------------------------------------------------- */

var working = false;
$('.login').on('submit', function (e) {
    e.preventDefault();
    if (working) return;
    working = true;
    var $this = $(this),
        $state = $this.find('button > .state');
    $this.addClass('loading');
    $state.html('Autenticando');
    $('.spinner').show();
    setTimeout(function () {
        $this.addClass('ok');
        $state.html('Bem vindo de volta!');
        setTimeout(function () {
            $state.html('Log in');
            $this.removeClass('ok loading');
            $('.spinner').hide();
            working = false;
        }, 4000);
    }, 3000);
});