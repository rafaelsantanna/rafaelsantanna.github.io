function limparTemplate() {
    $('#content').html('');
}

function navigateTo(page, event, self) {
    var self = self;
    if (event != undefined) {
        event.preventDefault();
    }

    limparTemplate();
    $('#content').load('../pages/' + page + '.html');

    // Condição que verifica se o menu inferior está escondido, se sim mostre
    if($('#navigation-bottom').css('display', 'none')){
        $('#navigation-bottom').css('display', 'flex');
    }

    //Condição para esconder o menu inferior se for 'x' página
    if(page == 'forgot-account' || page == 'login'){
        $('#navigation-bottom').css('display', 'none');
    }

    // Iniciando accordion
    if(page == 'dietary-prescription' || page == 'replacement-list') {
        setTimeout(function() {
            initAccordion();
        },100);
    }

    //Iniciando abas
    if(page == 'recipe-details') {
        setTimeout(function() {
            $('.tabs').tabs();
        }, 100);
    }

    // Fechando o sidemenu
    if(page == 'notifications') {
        $('.sidenav').sidenav('close');
    }
    
    setTimeout(function() {
        activeMenuIcon(self);
    }, 100);
}