function navigateTo(page, event, self) {
    var self = self;
    if (event != undefined) {
        event.preventDefault();
    }

    //Animação na transição de tela
    $('#content nav~div').css({
        'position': 'relative'
    }).animate({
        left: '50px',
        opacity: 0,
    }, 300);
    

    // Timeout para dar tempo de executar a animação
    setTimeout(function(){
        $('#content').load('./pages/' + page + '.html');
        
        // Condição que verifica se o menu inferior está escondido, se sim mostre
        if ($('#navigation-bottom').css('display', 'none')) {
            $('#navigation-bottom').css('display', 'flex');
        }
        
        //Iniciando abas
        if (page == 'recipe-details') {
            setTimeout(function () {
                $('.tabs').tabs();
            }, 100);
        }
        
        //Condição para esconder o menu inferior se for 'x' página
        if (page == 'forgot-account' || page == 'login') {
            $('#navigation-bottom').css('display', 'none');
        }
        
        // Iniciando accordion
        if (page == 'dietary-prescription' || page == 'replacement-list') {
            setTimeout(function () {
                initAccordion();
            }, 100);
        }

    }, 300);
    
    // Fechando o sidemenu
    if (page == 'notifications') {
        $('.sidenav').sidenav('close');
    }

    // Condição para ativar o primeiro icone do menu inferior após o login
    if ($(self).hasClass('btn-login-enter')) {
        var active = $('#navigation-bottom .navigation-item:first');
        activeMenuIcon(active);
    } else {
        //Ativar icones do menu inferior
        activeMenuIcon(self);
    }
}