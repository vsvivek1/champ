export const tradingMixin  =  { 
    methods: { 
        checkForBuySignal(  ) { 
            for ( const element of this.s ) { 
              const correspondingInstrument  =  this.instruments.find( 
                ( instrumentObj )  => instrumentObj.instrument_token== element.instrument_token
               );
          
              if ( element.ohlc && element.ohlc.high== element.ohlc.open ) { 
                // If ohlc.high and ohlc.open are the same, ignore this element
                continue;
               } 
          
              // Check for existing buy signal in local storage
              const existingBuySignals  =  JSON.parse( localStorage.getItem( 'buySignals' )) || [];
              const existingBuySignal  =  existingBuySignals.find( 
                ( signal )  => signal.instrumentToken== correspondingInstrument.instrument_token
               );
              if ( !existingBuySignal && element.last_price < correspondingInstrument.pricePoints.d1.high ) { 
                // If no existing buy signal and last price is less than d1 high, skip to the next element
                continue;
               } 
          
              if ( element.last_price >=  correspondingInstrument.pricePoints.d1.high ) { 
                // Generate buy signal
                this.buySignal  =  true;
          
                // Store buy signal details in local storage
                const buySignalDetails  =  { 
                  instrumentToken: correspondingInstrument.instrument_token,
                  buyPrice: element.last_price,
                  tradingSymbol: correspondingInstrument.trading_symbol
                 } ;
                existingBuySignals.push( buySignalDetails );
                localStorage.setItem( 'buySignals', JSON.stringify( existingBuySignals ));
               } 
          
              if ( existingBuySignal ) { 
                if ( element.last_price <=  correspondingInstrument.pricePoints.d1.low ) { 
                  // Generate stop loss signal
                  const existingStopLossSignals  =  JSON.parse( localStorage.getItem( 'stopLossSignals' )) || [];
                  const existingStopLossSignal  =  existingStopLossSignals.find( 
                    ( signal )  => signal.instrumentToken== correspondingInstrument.instrument_token
                   );
                  if ( existingStopLossSignal ) { 
                    // If a stop loss signal already exists for this instrument, skip to the next element
                    continue;
                   } 
          
                  // Store stop loss signal details in local storage
                  const stopLossSignalDetails  =  { 
                    instrumentToken: correspondingInstrument.instrument_token,
                    stopLossPrice: element.last_price,
                    tradingSymbol: correspondingInstrument.trading_symbol
                   } ;
                  existingStopLossSignals.push( stopLossSignalDetails );
                  localStorage.setItem( 'stopLossSignals', JSON.stringify( existingStopLossSignals ));
                 }  else if ( element.last_price >=  correspondingInstrument.pricePoints.d1.rangeBreakOutTarget ) { 
                  // Generate target signal
                  const existingTargetSignals  =  JSON.parse( localStorage.getItem( 'targetSignals' )) || [];
                  const existingTargetSignal  =  existingTargetSignals.find( 
                    ( signal )  => signal.instrumentToken== correspondingInstrument.instrument_token
                   );
                  if ( existingTargetSignal ) { 
                    // If a target signal already exists for this instrument, skip to the next element
                    continue;
                   } 
          
                  // Store target signal details in local storage
                  const targetSignalDetails  =  { 
                    instrumentToken: correspondingInstrument.instrument_token,
                    targetPrice: element.last_price,
                    tradingSymbol: correspondingInstrument.trading_symbol
                   } ;
                  existingTargetSignals.push( targetSignalDetails );
                  localStorage.setItem( 'targetSignals', JSON.stringify( existingTargetSignals ));
                 } 
               } 
             } 
          
            this.buySignal  =  false;
           } ,
          myFunction( ...args ) { 
            console.log( args );
           }        
 } 


 } 