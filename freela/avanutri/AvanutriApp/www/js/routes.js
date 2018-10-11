function limparTemplate() {
    $('#content').html('');
}

function navigateTo(page, event) {
    if (event != undefined) {
        event.preventDefault();
    }

    limparTemplate();
    $('#content').load('../pages/' + page + '.html');

    //Condição para mostrar o menu inferior
    if(page != 'forgot-account' && page != 'login'){
        $('#footer').load('../pages/navigation-bottom.html');
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
}