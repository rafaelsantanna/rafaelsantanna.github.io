0 - criar uma conta no https://developers.facebook.com  
1 - Criar um projeto(aplicativo)  
3 - clique em Configurar no Produto Login do faceobok  
4 - Clique em WEB  
5 - Coloque o endereço do seu site(Eu coloquei minha página do github e executei o projeto lá, pois não da para fazer localmente)  
6 - Avança até o final  
7 - Pegue o ID do aplicativo  
8 - Esse ID você vai colocar no código Javascript no campo, appId: '0000000000'  
9 - Acesse a tool explorer - https://developers.facebook.com/tools/explorer/  
10 - Clique em Obter Token(acesso do usuário) e marque a opção manage_pages e depois obter token  
11 - Preenche esse input e faça uma requisição para me/accounts, clique em enviar  
12 - Copie o access_token e o ID referente a sua página do facebook(você tem que ser admin/moderador da página para ela aparecer ai)  
13 - No código javascript você vai ver uma linha que começa assim FB.api e nela você vai preencher com o ID da pagina e o access_token:
    O primeiro numero que aparece antes de ratings é onde você vai colocar o ID, e você vai preencher o access_token no parametro após ratings, o código vai ficar assim.  

      FB.api("/252259148714278/ratings?access_token=EAAGPCP7A6C4BAJqJ39XWJDXktuXahJHcONAOIa2higbAZAQB0YZBlEMisNGKzAPFSLRMrjCTrDOwwH29UGzcglQo0SxbDsZABpLV3Q8JJRHB6ugiH9KVZBM1EZCN9ipVgS766QXhqpryLIPBfNK2kZADTylSs31yZBEI4zwig6IIEyChEviN3mDhwPZBSdwRuqq6ZB549QbDZCbAZDZD",
                function (response) {
                    if (response && !response.error) {
                        console.log(response);
                    }
                }
            );

Salve o arquivo e execute, na página vai ser retornado o array que você pediu...  
OBS: quando você executa o arquivo pela primeira vez ele pede permissão para abrir PopUp.  

É Isso!!  
