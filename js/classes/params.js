window.countryComparison = window.countryComparison || {};

(function( app ) {

  'use strict';

  app.params = (function() {

    var paramsListUl, paramsLi, selectedParams = [];


    // ----------------- Params List -----------------

    function createParamsList() {

      var list = document.createDocumentFragment(),
        param, li;

      for ( param in app.main.paramsList ) {
        li = document.createElement( 'li' );
        li.innerHTML = app.main.paramsList[ param ].title;
        $( li ).data( 'param', param );
        list.appendChild( li );
      }

      paramsListUl.append( list );

      paramsLi = paramsListUl.find( 'li' );

      paramsLi.on( 'click', function( e ) {
        var li = $( this ),
          p = li.data( 'param' );
        if ( li.hasClass( 'selected' ) ) {
          selectedParams.splice( $.inArray( p, selectedParams ), 1 );
        } else {
          selectedParams.push( p );
        }
        updateParamsList();
        app.chart.update();
      });

    }

    function updateParamsList() {
      paramsLi.each(function( i, el ) {
        var li = $( el );
        if ( $.inArray( li.data( 'param' ), selectedParams ) > -1 ) {
          li.addClass( 'selected' );
        } else {
          li.removeClass( 'selected' );
        }
      });
    }


    // ----------------- Public Methods -----------------

    return {

      setup: function( startingParams ) {
        paramsListUl = $( '#params-list' );
        selectedParams = startingParams.slice();
        createParamsList();
        updateParamsList();
      },

      getList: function() {
        return selectedParams;
      },

    };

  })();

})( window.countryComparison );