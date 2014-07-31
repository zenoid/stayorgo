window.countryComparison = window.countryComparison || {};

(function( app ) {

  'use strict';

  app.selection = (function() {

    var _data, selectionScreens, title, countryInput, goBtnCountry, goBtnParams, selectedCountry, validCountry = false, autocompleteOptions = {}, selectedParams = [];


    // ----------------- Screens -----------------

    function setupScreens() {
      selectionScreens = $( '#setup-screens' );
      title = $( '#title' );
      $( '.screen' ).each(function( i ) {
        $( this ).data( 'screenNum', i + 1 );
      });
    }

    function changeScreen( n ) {
      selectionScreens.animate(
        { top: -100 * n + '%' },
        { duration: 800,
          easing: 'easingFunction',
          complete: function() {
            if ( n === 2 ) {
              selectionScreens.remove();
              title.remove();
            }
        }
      });
      if ( n === 2 ) {
        title.animate(
          { top: '-100%' },
          { duration: 800,
            easing: 'easingFunction'
          }
        );
      }
    }


    // ----------------- Home Country Selection -----------------

    function setupCountrySelection( _data ) {

      var selectableCountries = [];

      goBtnCountry = $( '#setup-screen-country button' );
      goBtnCountry.on( 'click', selectCountry);

      $( window ).bind('keypress', function( e ) {
        if ( e.which === 13 && validCountry ) {
          selectCountry();
        }
      });

      countryInput = $( '#country-home' );

      _data.forEach(function( d ) {
        selectableCountries.push( d.name );
      });

      autocompleteOptions = {

        lookup: selectableCountries,
        autoSelectFirst: true,
        triggerSelectOnValidInput: true,

        onSelect: function( suggestion ) {
          validCountry = true;
          goBtnCountry.addClass( 'visible' );
        },

        onInvalidateSelection: function() {
          validCountry = false;
          goBtnCountry.removeClass( 'visible' );
          countryInput.val( '' );
        }

      };

      countryInput.autocomplete( autocompleteOptions );
    }

    function selectCountry() {
      $( window ).unbind( 'keypress' );
      var countryName = countryInput.val();
      _data.forEach(function( d, i ) {
        if ( d.name === countryName ) {
          selectedCountry = d.id;
          return;
        }
      });
      changeScreen( 1 );
      setupParamsSelection();
    }


    // ----------------- Params Selection -----------------

    function selectParams() {
      $( window ).unbind( 'keypress' );
      setupViews();
      changeScreen( 2 );
    }

    function setupParamsSelection() {

      var paramsListUl = $( '#setup-params-list' ),
        suggestionLbl = $( '#setup-screen-params .suggestion' ),
        list = document.createDocumentFragment(),
        validParams = false,
        paramsLi, param, li;

      for ( param in app.main.paramsList ) {
        li = document.createElement( 'li' );
        li.innerHTML = '<p class="param-title">' + app.main.paramsList[ param ].title + '</p><span>' + app.main.paramsList[ param ].description + '</span>';
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

        paramsLi.each(function( i, el ) {
          var li = $( el );
          if ( $.inArray( li.data( 'param' ), selectedParams ) > -1 ) {
            li.addClass( 'selected' );
          } else {
            li.removeClass( 'selected' );
          }
        });

        if ( selectedParams.length > 2 ) {
          suggestionLbl.css( 'opacity', 0 );
          goBtnParams.addClass( 'visible' );
          validParams = true;
        } else {
          suggestionLbl.css( 'opacity', 1 );
          goBtnParams.removeClass( 'visible' );
          validParams = false;
        }

      });

      goBtnParams = $( '#setup-screen-params button' );
      goBtnParams.on( 'click', selectParams);

      $( window ).bind('keypress', function( e ) {
        if ( e.which === 13 && validParams ) {
          selectParams();
        }
      });

    }


    // ----------------- Resize listener -----------------

    var resizeEndTimeout;

    function setupResizeListener() {
      $( window ).on( 'resize', function() {
        clearTimeout( resizeEndTimeout );
        resizeEndTimeout = setTimeout( resize, 500 );
      });
    }

    function resize() {
      countryInput.autocomplete( autocompleteOptions );
    }


    // ----------------- Initial Selection -----------------

    function setupViews() {

      var startingCountries = [], selectedContinent;

      // Add home country
      startingCountries.push( selectedCountry );

      // Add continent
      _data.forEach(function( d ) {
        if ( d.id === selectedCountry ) {
          selectedContinent = d.continent;
          return;
        }
      });
      _data.forEach(function( d ) {
        if ( d.continent === selectedContinent && d.id !== selectedCountry ) {
          startingCountries.push( d.id );
        }
      });

      app.countries.setup( _data, startingCountries, selectedCountry );
      app.params.setup( selectedParams );
      app.chart.setup( _data );

    }


    // ----------------- Public Methods -----------------

    return {

      show: function( sourceData ) {
        _data = JSON.parse( JSON.stringify( sourceData ) );
        setupScreens();
        setupCountrySelection( sourceData );
        countryInput.focus();
        setupResizeListener();
      },

      setDefaultCountry: function( countryId ) {
        if ( !countryInput.val() ) {
          countryId = countryId.toLowerCase();
          _data.forEach(function( d ) {
            if ( d.id === countryId ) {
              countryInput.val( d.name );
              validCountry = true;
              goBtnCountry.addClass( 'visible' );
              countryInput.focus();
              return;
            }
          });
        }
      },

    };

  })();

})( window.countryComparison );