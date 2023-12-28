const mutateWithLtp = {

    methods: {
        mutateWithLtp( s ) { 
     
            this.heartBeatAndCurrentCheckDigit()
     
     
     
           
     
            if ( this.hasStartedGetOrders || this.hasStartedGetLivePositions || this.refreshingTradeStatus ) { 
     
             this.tradeEntryFlowStatus = 'updating variuos status on Mount 1'
             this.cl( 'various status updates  mutate ltp 16' )
         return false;
        } 
          
           s.forEach( async ( element )  => { 
            if( !element || !element.instrument_token ){ 
     
                this.tradeEntryFlowStatus = 'Element null  4'
                return false;
               } 
      
     
              


             this.cl( 'inside s of mutate with  ltp' );
             this.tradeEntryFlowStatus = 'Inside mutate with ltp 3'
             let last_price;
             let ohlc = element.ohlc;
     
             
     
    
           
     
             
           
     
          
             
     
     let instrument_token  =  element.instrument_token;
     
     
     let cis  =  this.instruments.filter( i  => i.instrument_token  ==  instrument_token )[0];
     
     // console.log( cis.pricePoints.d1 )
     // this.cl( cis,'cis' )
     
     
     
     
     // console.log( this.seconds )
     let secs = [0,15,30,45]
     
     if( secs.includes( this.seconds ) && false ){ 
     
       if( this.seconds == 0 ){ 
     let v0 = element.volume_traded;
     this.$set( cis,'v0',element.volume_traded );
     
     // this.cl( v0,'volume' )
      } 
     
       if( this.seconds == 15 ){ 
     
         let v1 = element.volume_traded-cis.v0;
     
         this.$set( cis,'v1',v1 );
         // this.cl( v1,' v1 nvolume' )
        } 
       if( this.seconds == 30 ){ 
     
         let v2 = element.volume_traded-cis.v1;
     
     this.$set( cis,'v2',v2 );
      } 
     
     if( this.seconds == 30 ){ 
     
       let v3 = element.volume_traded-cis.v3;
     
     this.$set( cis,'v3',v3 );
     
     // this.cl( 'voulume up 30',cis.tradingsymbol )
     
     if( cis.v1>cis.v2>cis.v3 ){ 
     
      this.cl( 'voulume up 30',cis.tradingsymbol, v1,v2,v3 )
      } 
      } 
     
       
     
     
      } 
     
     
     
     
     
     if( typeof cis == 'undefined' ){ 
     
       this.tradeEntryFlowStatus = 'CIS undefined 5'
     
       let i = [];
       i.push( instrument_token )
     
       this.cl( 'cis undefined',instrument_token )
     
       let k = await this.updateMissingScriptInInstrumetsFile( JSON.stringify( i ))
     
       return false;
      } 
     
     let mar = ( element.ohlc == element.ohlc.low && ( element.last_price*1.1<= element.ohlc.high || element.last_price == element.ohlc.high )  && this.hours>= 14 );
     
     
     if( mar ){ 
     
     
     this.cl( "MARUBOZU CANDLE FOR",cis.tradingsymbol )
      } 
     
     
     
     
     
     
     // this.cl( 'check point 4a' )
     this.currentTradingsymbol = cis.tradingsymbol
     
     
     let lp1 = element.last_price;
     // this.isOpenLow( ohlc,cis,lp1 );
     
     
     // this.cl( element.depth.sell,'deph' )
     
     
     // let sells = element.depth.sell;
     
     
     
     
     let ma = this. calculateMovingAverage( cis );
     
     
      let ep = ma;
      let exit = element.ohlc.high*1.1;
     
     
     
     
     
     
     if ( !cis ) { 
     
       this.tradeEntryFlowStatus = 'CIS undefined 6'
       this.cl( 'cur instru type undefined frpn s so i am return nign false @7071', instrument_token );
       return false;
      } 
                  
         
     // this.cl( 'check[ point 3]' )
     
             last_price = element.last_price;
     
     this.setPreviousPriceAndLastPrice( instrument_token,last_price );
     
     let { msg,bs }  =  this.basicCheckers( element,cis,instrument_token,last_price );
     
     
     
     if( bs == false ){ 
     
       this.tradeEntryFlowStatus = 'BASIC CHECKERS FALSE 6'
       if( !msg == 'cis.previousPrice' ){ 
     
         this.cl( 'basic cehckes issue',cis.tradingsymbol,instrument_token,cis.last_price,cis.previousPrice,msg )
        } 
      return false
      } 
     
     
     ///////////////setting live postion and live target
     
     
     let livePosObject = this.livePositions.find( lp =>lp.instrument_token == instrument_token )
     
     
     
     let liveOrderObj = this.liveOrders.find( lo =>lo.instrument_token == instrument_token );
     
     if( livePosObject!== undefined  && liveOrderObj!== undefined ){ 
     
     // IF LIVE POS AND LIVE ORDER RESET THESE
     
     
     this.$set( 
             this.instruments.filter( 
               ( i )  => i.instrument_token  ==  instrument_token
              )[0],
             "hasLivePosition",
             true
            );
     
     
     this.$set( 
             this.instruments.filter( 
               ( i )  => i.instrument_token  ==  instrument_token
              )[0],
             "hasLiveTarget",
             true
            );
     
     
           this.cl( 'SETTING OF LIVE TARGET LIVE POS' )
      } 
     
     
     // this.$set( 
     //         this.instruments.filter( 
     //           ( i )  => i.instrument_token  ==  l.instrument_token
     //          )[0],
     //         "hasLivePosition",
     //         true
     //        );
     
     
     // this.cl( 'checkpoint 4c' );
               
             let hasLivetargetFromcis = cis.hasLiveTarget;
        let hasLivePositionFromcis = cis.hasLivePosition;
     
      this.cl( 'here after haslivepos' )
     
     
      this.tradeEntryFlowStatus = 'HAS LIVE POSITION CHECK 7'
     
             if (  hasLivePositionFromcis == true ) {                             
     
            
     
               let lpCurrent = this.livePositions.find( 
                 ( lp )  => lp.instrument_token  ==  cis.instrument_token
                );
     // console.log( lpCurrent,'LP CURRENT' );
     
     
     
     let ln1 = this.livePositions.some( 
                 ( lp )  => lp.instrument_token  ==  cis.instrument_token
                )
               let average_price = -1
     
               if( typeof lpCurrent!= 'undefined' ){ 
     
     
                 if( lpCurrent.quantity<0 ){ 
                   average_price = lpCurrent.sell_price
     
                  } else if( lpCurrent.quantity>0 ){ 
     
                   average_price = lpCurrent.buy_price
                  } 
                 
     
                } else{ 
     
                 
                 this.cl( 'avaerage price not defined for',cis.tradingsymbol )
                 average_price = cis.pricePoints.d1.high;
     
                } 
               let tradingsymbol = cis.tradingsymbol;
               this.currentTradingsymbolAverage = { instrument_token,tradingsymbol,average_price } 
     
               // console.log( this.currentTradingsymbolAverage );
     
     
               if( !ln1 ){ 
     
     
               this.cl( 'live postition for script is zero' )
     
                return false;
                } 
     
               let { bidPrice,offerPrice,count,stopLoss, target, lstPrice,livePnlOffered,quantity 
                 }  =  await  this.setTargetPricesBasedOnQuantity( cis,element,low,high,instrument_token )
              
     
             
              
     
          
     
     
     
     var { high,low }  = cis.pricePoints.d1;
               
     
     let hasLiveTarget;
               if ( count > 0 ) { 
                 hasLiveTarget  =  true;
                }  else if ( count == 0 ) { 
                 hasLiveTarget  =  false;
                } 
     
     
                             //there is a live position
     
               //check whether already a reverse order placed
     
     
              
     
     
     let PlacedReverseOrder  =  this.instruments.find( 
                 ( i )  => i.instrument_token  ==  instrument_token
                ).PlacedReverseOrder;
     
     
             
              
               if ( hasLivePositionFromcis ==  true && 
                hasLivetargetFromcis  ==  true ) { 
     
                          
                
           
     
     
                   // console.log( livePnlOffered,'livePnlOffered',cis.tradingsymbol )
     
     
                   this.stopLossTargetSwitch( quantity,last_price,high,
                   low,bidPrice,
                   offerPrice,cis,element,livePnlOffered,lpCurrent )
                  
            
     
                            //return false;
                }  else /// no live target or palced reverse order
               
               { 
     
     
                 this.cl( 'NO LIVE TARGETS FOR ',cis.tradingsymbol )
                 //think about placing a reverse order 
     
                 //check thoroughly 
                 
                 let lnLive = this.liveOrders.some( lo =>lo.instrument_token == instrument_token )
             //  this.cl( 'talakalam onnum cheyyunilla no reverse order placed evide etthiyittum' )
     
     
              if ( !lnLive ) { 
     
     if(( PlacedReverseOrder!= true  &&  hasLiveTarget !=  true )){ 
     
       this.cl( 'iam return ning false @7217' )
     
       if( this.manualReverseOrderStart == true ){ 
     
     
     
         // let out  = await    this.placeTargetsForSingleScript( instrument_token,quantity )
     
        } 
      return false;
      } 
              
             
               
                } 
     
              
                } 
     
            
              } 
     
     
     
             this.cl( 'here before entre trade',cis.enterNowToTrade )
             if ( cis.enterNowToTrade  ==  false ) { 
     
     
                this.cl( 'inside trade entry after cis entry trade 8' )
     
                this.tradeEntryFlowStatus = 'INSIDE ENTER NOW TO TRADE 8'
     
     //  this.cl( 'inside trade entry ' );
     let inst = cis;
     
     let isHigherLows = this.higherLowsCheck( cis );
     
     
     
     // this.cl( 'higher lows check',isHigherLows,cis.tradingsymbol )
     
     if( !isHigherLows ){ 
     
     
       this.tradeEntryFlowStatus = 'HIGHER LOW CHECK FALSE 9'
       return false
      } 
     
     
     this.cl( 'before hours chk 7812' )
     
     if( 
       
     !( this.hours>9 || ( this.hours == 9 && this.minutes>15 )  )
     
     
      ){ 
     
     
       this.tradeEntryFlowStatus = 'LESS THAN 10 HOURS NO TRADE ZONE 10'
       this.cl( 'NO TRADING TIME' );
     
       return;
      } 
     
     this.cl( 'reached before trade entry fn' )
     this.tradeEntry( instrument_token,inst,cis,element ) 
     
     // return ;
            
              } 
     
          ///already palced order .... so check whte there is live position
     
     
     
             
           
            }  );
          }
    },
    mounted() {
        console.log('hello from mixin!');
    },
};

export default mutateWithLtp;