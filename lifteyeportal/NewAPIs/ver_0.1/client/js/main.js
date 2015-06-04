require.config( {
    paths: {
        'jquery' : 'lib/jquery',
        'text' : 'lib/text',
        'underscore' : 'lib/underscore',
        'backbone' : 'lib/backbone'
    },
    shim: {
        'lib/underscore' : {
            exports : '_'
        },
        'lib/backbone' : {
            deps: ["lib/underscore", "jquery"],
            exports: 'Backbone'
        }
    }
});

//require(
//    ["jquery",
//    "underscore",
//    "backbone",
//    "views/headerview",
//    "views/navigatorview",
//    "views/detailview" ],
//    function($, _, Backbone, HeaderView, NavigatorView, DetailView) {
//        $( function() {
//            new HeaderView();
//            new NavigatorView();
//            new DetailView();
//        });
//    }
//);

require(["jquery"], function(jq){
    console.log("jQuery version: ", jq.fn.jquery);
    console.log("jQuery version: ", $.fn.jquery);
});
