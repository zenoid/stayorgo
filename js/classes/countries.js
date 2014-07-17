window.countryComparison = window.countryComparison || {};

(function( app ) {

  'use strict';

  app.countries = (function() {

    var sourceData, selectedCountries, countryInput, homeCountry, continentsList, continentsListHeight;


    // ----------------- Managing Selection -----------------

    function changeCountry( c ) {
      if ( c ) {
        var id = '';
        sourceData.forEach(function( d, i ) {
          if ( d.name === c ) {
            id = d.id;
            return;
          }
        });
        homeCountry = id;
        selectedCountries.push( id );
        app.chart.update();
      }
      countryInput.val( '' );
    }

    function addContinent( cont ) {
      sourceData.forEach(function( d, i ) {
        if ( d.continent === cont && $.inArray( d.id, selectedCountries ) === -1 ) {
          selectedCountries.push( d.id );
        }
      });
      app.chart.update();
    }

    function removeContinent( cont ) {
      sourceData.forEach(function( d, i ) {
        if ( $.inArray( d.id, selectedCountries ) !== -1 && d.continent === cont && d.id !== homeCountry ) {
          selectedCountries.splice( $.inArray( d.id, selectedCountries ), 1 );
        }
      });
      app.chart.update();
    }


    // ----------------- UI components -----------------

    function setupAutoComplete() {

      countryInput = $( '#country-new' );

      var selectableCountries = [];
      sourceData.forEach(function( d, i ) {
        selectableCountries.push( d.name );
      });

      countryInput.autocomplete({

        lookup: selectableCountries,
        autoSelectFirst: true,
        triggerSelectOnValidInput: true,

        onSelect: function( suggestion ) {
          changeCountry( suggestion.value );
        },

        onInvalidateSelection: function() {
          changeCountry( '' );
        },

      });

      countryInput.on( 'blur', function(){
        $( this ).val( '' );
      });

    }

    function createContinentsList() {

      continentsList = $( '#continents-list' );

      var list = document.createDocumentFragment(), li;

      for ( var c in app.main.continents ) {
        li = document.createElement( 'li' );
        li.innerHTML = app.main.continents[ c ] + '<div class="continents-list-btns"><a class="continent-add"></a><a class="continent-remove"></a></div>';
        $( li ).data( 'continent', c );
        list.appendChild( li );
      }

      continentsList.append( list );

      continentsList.find( 'a' ).on( 'click', function( e ) {
        var target = $( e.target ),
          cont = target.parent().parent().data( 'continent' );

        if ( cont ) {
          if ( target.attr( 'class' ) === 'continent-add' ) {
            addContinent( cont );
          } else {
            removeContinent( cont );
          }
        }
      });

    }

    function setupContinentsButton() {

      var container = $( '#continents-list-container'),
        list = $( '#continents-list' );

      continentsListHeight = list.outerHeight( true );
      list.css( 'top', -continentsListHeight );

      $( '#continents-list-link' ).on( 'click', function() {
        if ( container.height() > 0 ) {
          list.animate({
            top: -continentsListHeight
          }, {
            duration: 200,
            easing: 'easingFunction',
            complete: function() {
              container.height( 0 );
            }
          });
        } else {
          container.height( continentsListHeight );
          list.animate({
            top: 0
          }, {
            duration: 300,
            easing: 'easingFunction'
          });
        }
      });

      $( '#continents-list-block' ).on( 'mouseleave', function() {
          list.animate({
            top: -continentsListHeight
          }, {
            duration: 200,
            easing: 'easingFunction',
            complete: function() {
              container.height( 0 );
            }
          });
      });

    }

    function setupBestCountriesButton() {
      $( '#best-countries-link' ).on( 'click', function() {

        var countries = [], i, msg,
        homeCountryName = app.countries.getHomeCountryAndContinentName().country,
        paramsList = app.params.getList().slice();

        if ( !paramsList.length ) {
          return;
        }

        // Reset countries list
        selectedCountries = [ homeCountry ];

        // Calculate country value
        sourceData.forEach(function( d ) {
          d.value = 0;
          paramsList.forEach(function( p ) {
            d.value += parseFloat( d[ p ] );
          });
          countries.push( d );
        });

        // Sort countries by value
        countries.sort(function( a, b ){
          if ( a.value < b.value ) {
            return 1;
          }
          if ( a.value > b.value ) {
            return -1;
          }
          return 0;
        });

        // Add the 10 best countries
        for ( i = 0; i < 10; i++ ) {
          if ( countries[ 0 ].id !== homeCountry ) {
            selectedCountries.push( countries[ 0 ].id );
          }
          countries.splice( 0, 1 );
        }

        // Create Chart Legend
        msg = 'These are the 10 most ';
        paramsList.forEach(function( p, i ) {
          if ( i > 0 ) {
            if ( i === paramsList.length-1 ) {
              msg += ' and ';
            } else {
              msg += ', ';
            }
          }
          msg += '<span>' + app.main.paramsList[ p ].title + '</span>';
        });
        msg += ' countries in the world, ';
        if ( selectedCountries.length === 10 ) {
          msg += 'and <span>' + homeCountryName + '</span> is one of them!';
        } else {
          msg += ' compared to <span>' + homeCountryName + '</span>';
        }

        app.chart.update( msg );
      });
    }


    // ----------------- Public Methods -----------------

    return {

      setup: function( d, s, h ) {
        $( '#country-selection' ).show();
        sourceData = d;
        selectedCountries = s.slice();
        homeCountry = h;
        setupAutoComplete();
        createContinentsList();
        setupContinentsButton();
        setupBestCountriesButton();
      },

      getList: function() {
        return selectedCountries;
      },

      getHomeCountry: function() {
        return homeCountry;
      },

      getHomeCountryAndContinentName: function() {
        var countryData = {};
        sourceData.forEach(function( d ) {
          if ( d.id === homeCountry ) {
            countryData.country = d.name;
            countryData.continent = app.main.continents[ d.continent ];
            return;
          }
        });
        return countryData;
      },

    };

  })();

})( window.countryComparison );