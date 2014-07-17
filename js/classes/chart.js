window.countryComparison = window.countryComparison || {};

(function( app ) {

  'use strict';

  app.chart = (function() {

    var width, height, center, maxRadius,
      minRadiusForLabel = 18,
      gravity = 0.01,
      damper = 0.09,
      data, nodes, activeNodes, vis, chartLegend, force, circles, radiusScale;


    // ----------------- Data Setup -----------------

    function setupChart() {
      vis = d3.select( '#chart' ).append( 'svg' );
      setupSize();
      chartLegend = $( '#chart-legend' );
    }

    function setupSize() {
      width = window.innerWidth;
      height = window.innerHeight;
      center = { x: width / 2, y: height / 2 };
      maxRadius = Math.min( width, height ) * 0.1;
      vis.attr('width', width)
        .attr('height', height);
    }

    function setupData( _data ) {
      data = _data;
      nodes = [];
      _data.forEach(function( d, i ) {
        data[ d.id ] = d;
        var node = {
          id: d.id,
          name: d.name,
        };
        nodes.push( node );
      });
    }

    function getActive( d, i ) {
      return ( $.inArray( d.id, app.countries.getList() ) > -1 );
    }

    function setupParams() {

      activeNodes = nodes.filter( getActive );

      activeNodes.forEach(function( node, i ) {
        var value = 0;
        app.params.getList().forEach(function( param, i ) {
          value += +data[ node.id ][ param ];
        });
        node.value = +parseFloat( value ).toFixed( 2 );
      });

      var maxAmount = d3.max( activeNodes, function( d ) { return d.value; } );
      radiusScale = d3.scale.pow().exponent( 5 )
        .domain( [ 0, maxAmount ] )
        .range( [ 10, maxRadius ] );

      activeNodes.forEach(function( node, i ) {
        node.radius = radiusScale( node.value );
      });

    }


    // ----------------- Chart Creation -----------------

    function getColor( d ) {
      var f = d.radius / maxRadius;
      return d3.hsl( 250 - f * 250, f, 0.4 + f * 0.2 );
    }

    function createMultilineLabel( lbl ) {

      var words = lbl.text().split(/\s+/).reverse(),
        word,
        line = [],
        lines = 1,
        lastLine = '',
        is_firefox = ( navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ),
        textAreaSize = is_firefox? 75 : 80,
        fontSize,
        tspan = lbl.text( null ).append( 'tspan' );

      while ( ( word = words.pop() ) ) {
        line.push( word );
        tspan.text( line.join(' ') );
        lastLine = line.join(' ');
        if ( tspan.node().getComputedTextLength() > textAreaSize ) {
          line.pop();
          if ( line.join( '' ) !== '' ) {
            lines++;
            tspan.text( line.join( ' ' ) );
            tspan = lbl.append( 'tspan' ).attr( 'x', 0 ).attr( 'dy', '1em' ).text( word );
          }
          line = [ word ];
        }
      }

      fontSize = ( textAreaSize / Math.max( lbl.node().getBBox().width, lbl.node().getBBox().height ) ) * 30;
      lbl.attr( 'font-size', fontSize + 'px');
      lbl.attr( 'y', fontSize - ( ( lines > 1 )? fontSize * lines * 0.12 : (is_firefox? fontSize*0.24 : 0) ) - lbl.node().getBBox().height / 2 + 'px' );

    }

    function createCircles() {

      circles = vis.selectAll( 'g' )
        .data( activeNodes, function( d ) { return d.id; });

      var g = circles.enter().append( 'g' )
        .attr( 'class', function( d ) { return ( d.id === app.countries.getHomeCountry() )? 'home-country-circle' : ''; })
        .each(function( d, i ) {

          d.x = center.x;
          d.y = Math.round( Math.random() * height * 0.2 + height * 0.4 );

          d3.select( this ).append( 'circle' )
            .attr( 'r', 0 )
            .attr( 'fill', d3.hsl( 0, 0, 0.5 ) )
            .transition().delay( 500 ).duration( 1000 )
            .attr( 'fill', getColor )
            .attr( 'r', function( d ) { return d.radius; });

          d3.select( this ).append( 'text' )
            .attr( 'class', 'country-id-text' )
            .text(function( d ) { return d.id.toUpperCase(); })
            .attr( 'dy', '10px' )
            .attr( 'transform', 'scale(0)' )
            .attr( 'opacity', 0 )
            .transition().delay( 500 ).duration( 1000 )
            .attr( 'transform', function( d ) { return 'scale(' + d.radius / 100 + ')'; })
            .attr( 'opacity', function( d ) { return ( d.radius < minRadiusForLabel? 1 : 0 ); });

          d3.select( this ).append( 'text' )
            .attr( 'class', 'country-name-text' )
            .text(function( d ) { return d.name.toUpperCase(); })
            .attr( 'transform', 'scale(0)' )
            .attr( 'opacity', 0 )
            .transition().delay( 500 ).duration( 1000 )
            .attr( 'transform', function( d ) { return 'scale(' + d.radius / 100 + ')'; })
            .attr( 'opacity', function( d ) { return ( d.radius < minRadiusForLabel? 0 : 1 ); });

          createMultilineLabel( d3.select( this ).select( '.country-name-text' ) );

        });
    }

    function updateCircles() {

      removeCircles();
      createCircles();

      circles.data( activeNodes, function( d ) { return d.id; })
        .attr( 'class', function( d ) { return ( d.id === app.countries.getHomeCountry() )? 'home-country-circle' : ''; })
        .each(function( d, i ) {

          d3.select( this ).select( 'circle' )
            .transition().duration( 500 )
            .attr( 'fill', getColor )
            .attr( 'r', function( d ) { return d.radius; });

          d3.select( this ).selectAll( '.country-id-text' )
            .transition().duration( 500 )
            .attr( 'transform', function( d ) { return 'scale(' + d.radius / 100 + ')'; })
            .attr( 'opacity', function( d ) { return ( d.radius < minRadiusForLabel? 1 : 0 ); });

          d3.select( this ).selectAll( '.country-name-text' )
            .transition().duration( 500 )
            .attr( 'transform', function( d ) { return 'scale(' + d.radius / 100 + ')'; })
            .attr( 'opacity', function( d ) { return ( d.radius < minRadiusForLabel? 0 : 1 ); });

        });

    }

    function removeCircles() {

      circles.data( activeNodes, function( d ) { return d.id; })
        .exit()
        .each(function ( d, i ) {

          d3.select( this ).select( 'circle' )
            .transition().duration( 500 )
            .attr( 'fill', getColor )
            .attr( 'r', 0 );

          d3.select( this ).selectAll( 'text' )
            .transition().duration( 500 )
            .attr( 'transform', function( d ) { return 'scale(0)'; });

        })
        .transition().duration( 500 )
        .remove();
    }


    // ----------------- Animation -----------------

    function startAnimation() {

      force = d3.layout.force()
        .nodes( activeNodes )
        .size( [ width, height ] );

      force.gravity( gravity )
       .charge(function( d ) { return -Math.pow( d.radius, 2 ) * 0.17; })
       .friction( 0.9 )
       .on( 'tick', function( e ) {
          circles.each(moveTowardsCenter( e.alpha ) )
            .attr( 'transform', function( d ) { return 'translate(' + d.x + ',' + d.y + ')'; });
       });

      force.start();

    }

    function moveTowardsCenter( alpha ) {
      return function( d ) {
        d.x = d.x + ( center.x - d.x ) * ( damper + 0.02 ) * alpha;
        d.y = d.y + ( center.y - d.y ) * ( damper + 0.02 ) * alpha;
      };
    }


    // ----------------- Chart Legend -----------------

    var showChartLegendTimeout;

    function showChartLegend( msg ) {
      chartLegend.html( msg );
      resetChartLegend( true );
      showChartLegendTimeout = setTimeout(function() {
        chartLegend.fadeIn( 500 );
        showChartLegendTimeout = setTimeout(function() {
          chartLegend.fadeOut( 500 );
        }, Math.min( 7000, msg.length * 80 ) );
      }, 1500);
    }

    function resetChartLegend( dontHide ) {
      clearTimeout( showChartLegendTimeout );
      if ( !dontHide ) {
        chartLegend.fadeOut( 500 );
      }
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
      setupSize();
      force.size( [ width, height ] );
      app.chart.update();
    }


    // ----------------- Public Methods -----------------

    return {

      setup: function( countryData ) {
        setupChart();
        setupData( countryData );
        setupParams();
        createCircles();
        startAnimation();
        setupResizeListener();
        var homeCountryData = app.countries.getHomeCountryAndContinentName();
        showChartLegend( 'This is <span>' + homeCountryData.country + '</span><br/>compared to <span>' + homeCountryData.continent + '</span>' );
      },

      update: function( msg ) {
        setupParams();
        updateCircles();
        force.nodes( activeNodes );
        force.start();
        if ( msg ) {
          showChartLegend( msg );
        } else {
          resetChartLegend();
        }
      },

    };

  })();

})( window.countryComparison );