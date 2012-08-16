$(function() {
    _.templateSettings = {
        interpolate: /\{\{\=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    var Beer = Backbone.Model.extend({
        defaults:{},
        initialize: function() {
        }
    });


    var BeerCollection = Backbone.Collection.extend({
        model:Beer,
        url:function() {
            return "http://tutorials.jeffreyokawa.com/beer/show?filter=" + this.filter
        },
        parse: function (response) {
            var attrs = new Array();
            _.each(response, function(beer) {
                attrs.push(beer.beer);
            });
            return attrs;
        }

    });

    var FavoritesCollection = Backbone.Collection.extend({
        model:Beer
    });

    var FavoritesListItemView = Backbone.View.extend({
        tagName: "li",
        template: _.template($("#favorites-list-item-view").html()),
        events:{
            "click .close":"removeFavoriteFromList"
        },
        render: function(event) {

            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        removeFavoriteFromList: function(){
            this.favoritesList.remove(this.model);
        }
    });

    var FavoritesListView = Backbone.View.extend({
        tagName:'ul',
        initialize:function () {
            this.model.bind("reset", this.render, this);
            this.model.bind("add", this.render, this);
            this.model.bind("remove", this.render, this);
        },
        render: function (event) {
            this.$el.empty();
            _.each(this.model.models, function (item) {
                var favListItemView =  new FavoritesListItemView({model:item});
                favListItemView.favoritesList = this.model;
                this.$el.append(favListItemView.render().el);
            }, this);
            return this;
        }
    });

    var BeerFilterView = Backbone.View.extend({
        el: $('#beer-filter'),
        template: _.template($("#beer-filter-view").html()),
        render: function(event) {

            this.$el.html(this.template());
            return this;
        },
        events: {
            "keyup .filter-input": "change"
        },
        change: function(event) {
            var val = $('.filter-input').val();
            if (val.length > 2 || val.length == 0) {
                this.collection.filter = val;
                this.collection.fetch();
            }
        }


    });

    var BeerView = Backbone.View.extend({
        el: $('#beer-detail'),
        events: {
            "click #addToFavoritesBtn": "addToFavorites"
        },
        render: function(event) {
            var compiled_template = _.template($("#beer-view").html());

            this.$el.html(compiled_template(this.model.toJSON()));
            return this; //recommended as this enables calls to be chained.
        },
        addToFavorites: function () {
            this.favoritesList.add(this.model);
        }
    });

    var BeerListViewItem = Backbone.View.extend({
        tagName: "li",
        template: _.template($("#beer-list-view").html()),
        render: function(event) {

            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var BeerListView = Backbone.View.extend({
        tagName:'ul',
        initialize:function () {
            this.model.bind("reset", this.render, this);
        },
        render: function (event) {
            this.$el.empty();
            _.each(this.model.models, function (item) {
                this.$el.append(new BeerListViewItem({model:item}).render().el);
            }, this);
            return this;
        }
    });


    var Router = Backbone.Router.extend({
        beerList:null,

        routes:{
            "":"index",
            "beer/:id":"beerDetails"
        },

        index:function() {
            this.beerList = new BeerCollection();
            this.beerList.filter = "";
            this.favoritesList = new FavoritesCollection();

            var blv = new BeerListView({model:this.beerList});
            var router = this;
            this.beerList.fetch({success:function(){

                $("#beer-list").html(blv.render().el);

                var b = new BeerFilterView({collection:router.beerList});

                b.render();

                var flv = new FavoritesListView({model:router.favoritesList});
                $("#favorites-list").html(flv.render().el);

                if (router.requestedBeerId){
                    router.beerDetails(router.requestedBeerId);
                }
            }});



        },
        beerDetails:function(id) {
            if (this.beerList){
                var beer = this.beerList.get(id);
                var bv = new BeerView({model:beer});
                bv.favoritesList = this.favoritesList;
                bv.render();
            }else{
                this.requestedBeerId=id;
                this.index();
            }

        }
    });

    var app = new Router();
    Backbone.history.start();
});
