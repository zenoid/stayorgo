window.countryComparison = window.countryComparison || {};

(function( app ) {

  'use strict';

  app.main = (function() {

    var paramsList = {
        wealth: {
          title: 'Rich',
          description: 'high GDP, high economic growth, high GDP per capita'
        },
        education: {
          title: 'Well educated',
          description: 'high literacy rate, low school dropout rate, high students proficiency'
        },
        unemployment: {
          title: 'Working',
          description: 'low unemployment rate'
        },
        innovation: {
          title: 'Innovative',
          description: 'high investments in research, high informatization'
        },
        environment: {
          title: 'Green',
          description: 'high renewable energy usage, low pollution, low energy consumption'
        },
        weather: {
          title: 'Warm and Dry',
          description: 'mild temperatures and low precipitations'
        },
        gender: {
          title: 'Egalitarian',
          description: 'high gender equality'
        },
        satisfaction: {
          title: 'Satisfied',
          description: 'high satisfaction and trust, low suicide rates'
        },
      },

      continents = {
        na: 'North America',
        sa: 'South America',
        as: 'Asia',
        eu: 'Europe',
        af: 'Africa',
        oc: 'Oceania'
      };


    return {

      init: function( d ) {
        app.selection.show( d );
      },

      paramsList: paramsList,

      continents: continents,

    };

  })();


  // ----------------- Utilities -----------------

  $.extend($.easing, {
    easingFunction: function( x, t, b, c, d ) {
      if (( t /= d/2 ) < 1) {
        return c/2*t*t + b;
      }
      return -c/2 * ((--t)*(t-2) - 1) + b;
    },
  });

  function detectLowPerformanceDevices() {
   if ( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i) ) {
      $( 'body' ).addClass( 'low-performance' );
    }
  }

  function fixScrolling() {

    $( 'input' ).on( 'blur', function () {
      window.scrollTo( 0, 0 );
      document.body.scrollTop = 0;
    });

    $( document ).on( 'touchmove', function( e ) {
      e.preventDefault();
    });

  }


  // ----------------- Data Loading and Startup -----------------

  $( document ).ready( function() {

    fixScrolling();
    detectLowPerformanceDevices();

    d3.csv( 'data/countries.csv', function( data ) {

      app.main.init( data );

      d3.json( 'https://ipinfo.io/geo', function( response ) {
        if ( response && response.country ) {
          app.selection.setDefaultCountry( response.country );
        }
      });

    });

  });

})( window.countryComparison );