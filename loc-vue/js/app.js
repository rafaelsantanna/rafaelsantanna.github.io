var ItemsVue = new Vue({
    el: '#heroes',
    data: {
        Items: []
    },
    mounted: function () {
        var self = this;
        $.ajax({
            url: "https://api-loc-rafaeel16.c9users.io/api/heroes",
            method: 'GET',
            success: function (data) {
                self.Items = data;
            },
            error: function (error) {
                alert(JSON.stringify(error));
            }
        });
    }
});