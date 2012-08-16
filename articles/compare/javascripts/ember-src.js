$(function() {
    App = Em.Application.create();

    App.ApplicationController = Em.Controller.extend();
    App.ApplicationView = Em.View.extend({
        templateName: 'application'
    });

    App.Beer = Ember.Object.extend({
        url: function(){
            return "/images/"+this.get("image_url")
        }.property("image_url")
    });
    App.BeerListController = Ember.ArrayController.extend({
        content:[],
        filter:"",
        loadBeers:function(callback) {
            var bc = this;
            $.getJSON('http://jeff2.com:3000/beer/show?filter=' + this.filter, function(data) {
                bc.set("content", []);
                data.forEach(function(item) {
                    var beer = App.Beer.create(item.beer);
                    bc.pushObject(beer);
                });
                if (callback != undefined){
                    callback();
                }
            });
        },
        getObjectById: function(id){
            var beerForId = null;
            for( var i=0;i<this.content.length;i++){
                var beer = this.content[i];
                if (beer.get("id") == id){
                    return beer;
                }
            }
            return beer;
        }
    });
    App.BeerListView = Ember.View.extend({
        templateName: 'beer-list-view'

    });

    App.BeerController = Ember.Controller.extend({
        content:null
    });
    App.BeerView = Ember.View.extend({
        templateName:'beer-detail-view'
    });


    App.FavoritesListController = Ember.ArrayController.extend();

    App.FilterTextField = Em.TextField.extend({
        classNames: ['filter-input'],
        keyUp: function(e) {
            var val = this.value;
            if (val.length > 2 || val.length == 0) {

                var beerListController = App.Router.get("beerListController");
                beerListController.filter = val;
                beerListController.loadBeers();
            }
        }
    });
    App.Router = Em.Router.create({
        enableLogging: true,
        location: 'hash',

        root: Em.Route.extend({
            goToBeerDetail: Ember.Route.transitionTo('beerDetail'),
            // STATES
            home: Em.Route.extend({
                route: '/',
                connectOutlets: function(router, context) {
                    var beerListController = router.get("beerListController");
                    beerListController.loadBeers();
alert('hi');
                }
            }),
            beerDetail: Em.Route.extend({
                route: '/beer/:beer_id' ,
                deserialize:function(router, params){
                    var beerListController = router.get("beerListController");
                    var beerController = router.get("beerController");
                    beerController.set("content", Ember.ObjectProxy.create({id:params.beer_id}));
                    beerListController.loadBeers(function(){
                        beerController.content.set("content", beerListController.getObjectById(params.beer_id));


                    });
                    return beerController.content;
                },
                connectOutlets: function(router, beer) {
                    var appController = router.get('applicationController');
                    var beerListController = router.get("beerListController");
                    var beerController = router.get("beerController");

                    beerController.set("url", "/images/"+beer.get("image_url"));

                    appController.connectOutlet('beer', beer);
                }


            }),
        addToFavorites:function(router, event){
            var beerController = router.get("beerController");
            var favListController = router.get("favoritesListController");
            var beer = beerController.get("content");
            if (favListController.content == null){
                favListController.set("content",[]);
            }
            favListController.pushObject(beer);

        },
            deleteFromFavorites:function(router, event){
              var favListController = router.get("favoritesListController");
              favListController.removeObject(event.context);
            }

        })
    });
    App.initialize(App.Router);
});
