export default{

methods:{

    stoplossCriteria(element,cis){
     /*  let normalShorCovering = false;
      if( element.ohlc.open< cis.pricePoints.d1.low  ){ 
     
     
       if( this.hours>9 ){ 
     
     
         if( element.ohlc.open = element.ohlc.high ){ 
     
     
           normalShorCovering = lp.quantity>0 && ( yesterDayLowStopLoss ) && positionObj.buy_price>cis.pricePoints.d1.low;
          } 
     
     
        
        }  else if( this.hours>14 ){ 
     
         normalShorCovering = lp.quantity>0 && ( yesterDayLowStopLoss ) && positionObj.buy_price>cis.pricePoints.d1.low;
     
     
        } 
     
       } else{ 
     
       normalShorCovering = lp.quantity>0 && ( yesterDayLowStopLoss ) && positionObj.buy_price>cis.pricePoints.d1.low;
     
       }  */
      

       //this.fla
        switch ( true ) { 

 //check later
            /* case ( isGapDown && isOverNightScript && buyPriceGreaterThanTodaysOpen  ) :
    
    
    
            let exitingPrice;
            if(  element.last_price<element.ohlc.open ){ 
    
              exitingPrice = element.last_price;
             } else if( element.last_price>element.ohlc.open  ){ 
    
    
              let exitingPrice = element.last_price>= ( Math.min( cis.pricePoints.d1.close,cis.pricePoints.d1.open ))
             } 
    
    
    
            msg = `EXITING POSITIONS FOR  ${ cis.tradingsymbol }   for ${ element.last_price }  at ${ formattedTime }  in GapDownOpeneing strategy for overnight scripts`
             this.cl( msg )
    
             this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               exitingPrice
              );
    
            break; */
    
    
            case ( this.exitNow ):
    
            msg = `EXITING POSITIONS FOR  ${ cis.tradingsymbol }   for ${ buyersHighestPrice }  at ${ formattedTime } `
             this.cl( msg )
    
             this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               buyersHighestPrice
              );
    
    
            break;
    


            case ( element.last_price<element.ohlc.open ):
             let msgy = `STOP LOSS  EXECUTION SEND BY below  daily open point ${ cis.tradingsymbol }   for ${ element.last_price }  at ${ Date() } `
               this.cl( msgy )

               this.flashMessage=msgy;
      
               this.updateSquareOfforderWithDesiredPrice( 
                 cis,
                 element,
                 false,
                 element.last_price
                );
      
              break;
    
            case ( element.last_price<cis.pricePoints.d0.low ):
            msg = `STOP LOSS  EXECUTION SEND BY  DAILY  LOW STRATEGY FOR ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
    
             this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               element.last_price
              );
    
            break;
    
    
    
            case ( element.last_price<element.ohlc.open && element.last_price>0 ) :
           let msg = `STOP LOSS  EXECUTION SEND BY  DAILY price less than open price: ${element.ohlc.open}  ${ cis.tradingsymbol }   for ${ element.last_price }  at ${ new Date() }  ohlc ${element.ohlc}`
             this.cl( msg )
    
             this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               element.last_price
              );
    
            break;  


            case (element.last_price<cis.sellersLowestPrice*.95):

            let msg2 = `STOP LOSS  EXECUTION SEND BY last price less than .95 of buy price  ${ cis.tradingsymbol }   for ${ element.last_price }  at ${ new Date() } `
         
            this.flashMessage=msg2;
            this.cl( msg2 )
   
            this.updateSquareOfforderWithDesiredPrice( 
              cis,
              element,
              false,
              element.last_price
             );
            break;
            
            case (cis && cis.minuteCandle &&  element.last_price<cis.minuteCandle.lastHigh*.95 ) :
           let msg1 = `STOP LOSS  EXECUTION SEND BY  last price  less than last hourly high price  ${ cis.tradingsymbol }   for ${ element.last_price }  at ${ new Date() } `
             this.cl( msg1 )
    
             this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               element.last_price
              );
    
            break;
    
            /* case ( 
            
            
           normalShorCovering
            
             ):
    
    // console.log( 'yesterDayLowStopLoss 5 sl at ',cis.tradingsymbol )
    
    
    msg = `STOP LOSS  EXECUTION SEND BY  DAILY yesterDayLowStopLoss STRATEGY FOR ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
    
             this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               element.last_price
              );
          
    
    
    break; */  
    
    
    
    
    
          /*   case ( sellersLowestPrice<element.last_price && false ):
    
    
    this.cl( ' line-7559 has to sell this :sellersLowestPrice is less  than last price for',cis.tradingsymbol, 'sellersLowestPrice', sellersLowestPrice,' last price', element.last_price )
    this.updateSquareOfforderWithDesiredPrice( 
        cis,
        element,
        false,
        buyersHighestPrice
       );
    
    break; */
    
      //       case ( lp.quantity>0 && bestBuyOffer>element.last_price ):
    
    
      //       this.cl( 
      //  "Firing stop loss order for bestSellOffer  less than last price ",
      //  cis.tradingsymbol,
      //  offerPrice,
      //   high,last_price
      //  );
      //       this.updateSquareOfforderWithDesiredPrice( 
      //   cis,
      //   element,
      //   false,
      //   element.last_price
      //  );
    
    
      //       break;
    
    
    //         case ( lp.quantity<0 && bestSellOffer<element.last_price ):
    
    
    // this.cl( 
    // "Firing stop loss order for buy offer less than last price ",
    // cis.tradingsymbol,
    // offerPrice,
    // high,last_price
    //  );
    // this.updateSquareOfforderWithDesiredPrice( 
    // cis,
    // element,
    // false,
    // element.last_price
    //  );
    
    
    // break;
    
    /* 
    
            case ( lp.quantity>0 &&  element.last_price<element.ohlc.high*97  && false ):
    
            this.cl( 
       "Firing stop loss order for 3% less than high ",
       cis.tradingsymbol,
       offerPrice,
        high,last_price
       );
      
      this.updateSquareOfforderWithDesiredPrice( 
        cis,
        element,
        false,
        element.last_price
       );
            break */
     
    
         /*    case ( lp.quantity < 0 && element.last_price >=
              lp.sell_price*1.05 && waitForShortCovering   && false  ):
    
                  
    
    this.cl( 
       "Firing shortcover stop loss order for %s bidprice is %s and high is %s  and last price is %s",
       cis.tradingsymbol,
       offerPrice,
        high,last_price
       );
      
      this.updateSquareOfforderWithDesiredPrice( 
        cis,
        element,
        false,
        element.last_price
       );
    
      break; */
            
    
            case this.exitNow:
    
            // if( lp.quantity>0 )
    
    
            msg = `EXITING NOW, ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime }  SQUARING OFF`
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
            
            break;
    
    
    
           /*  case ( lp.quantity>0 && openBelowYesterdayHigh && false ):
            
            msg = `open below yesterdays high , touched y day high and thebn  retturning to yesterdays high , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime }  SQUARING OFF`
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
            
            break; */
            
            
           /*  case ( lp.quantity>0 && openLowTouchedYdayHigh && false ):
            
            msg = `open below yesterdays low, touched y day high and thebn  retturning to yesterdays high , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime }  SQUARING OFF`
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
            
            break */;
    
    
           /*  case ( lp.quantity>0 && hitHighStopLoss && false ):
            
            msg = `open below yesterdays candle body crossed yesterdays body, retturning to yesterdays body stop loss , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime }  SQUARING OFF`
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
            
            break; */
    /* 
            case ( lp.quantity>0 && element.last_price<element.ohlc.open*.98 && false ):
    
    
            msg = `GONE BELOW OPEN PRICE FOR , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime }  SQUARING OFF`
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break; */
    
    
        /*     case ( lp.quantity>0 && NineFiftySquareOff && false ):
    
    
            msg = `SQUARING OFF ALL GREENS AT 9 :58 , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break; */
    
  /*   case ( lp.quantity>0 && buyPriceAboveOpenAndLastPriceFallsBelowOpen && false ):
    
    msg = `SQUARING OFF IF BUY PRICE ABOVE OPEN AND LAST PRICE FELL BELOW 5% OPEN , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
    break;
     */
    
    
    
    
         /*    case  ( lp.quantity>0 && squareoffDuringSideWise && false ):
    
    
           
    
            msg = `SQUARING OFF DURING SIDE WISE TIME WITH AVAILABLE PROFIT , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break; */
    
    
    
    
   /*  case ((  (  lp.quantity>0 && element.last_price<element.ohlc.open && false && ( this.hours == 15 && this.minutes>15 ) && positionObj.buy_price>= element.ohlc.open )  )):
    
    
    msg = `STOP LOSS  EXECUTION  PRICE AFTER 3 :15 PM WAS BELOW TODAYS OPEN EXIT FOR , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
    break; */
    
    
          /*   case(  (   lp.quantity>0 && element.ohlc.low<= cis.pricePoints.d1.low && false && ( this.hours == 15 && this.minutes>15 ) && positionObj.buy_price>= element.ohlc.low )):
            msg = `STOP LOSS  EXECUTION TODAYS LOW CROESSED AT SOME TIME YESTERDAYS LOW DANGER EXIT , ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break; */
    
    
    
    
    
    
          /*   case(  lp.quantity>0 && todayOpenYesterDayhigh && false ):
            msg = `STOP LOSS  EXECUTION  BY  GAP UP YESTERDAY HIGH , THEN FALLED BELOW 5% OF YESTERDAY HIGH ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break;
     */
    
         /*    case ( lp.quantity>0 &&todayOpenYesterDayClose && false ):
            msg = `STOP LOSS  EXECUTION  BY  GAP UP YESTERDAY close , THEN FALLED BELOW 5% OF YESTERDAY close ${ cis.tradingsymbol }   for ${ last_price }  at ${ formattedTime } `
             this.cl( msg )
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break; */
    
    
         /*    case ( lp.quantity>0 &&momentFire && false ):
    
    
    
             this.cl( 'FIRING TARGETED PRFIT BOOKING FOR',cis.tradingsymbol,'at', last_price,'FOR PROFIT',livePnlOffered );
            this.updateSquareOfforderWithDesiredPrice( 
               cis,
               element,
               false,
               last_price
              );
    
            break; */
    
    
    
    
    
    
    // case daySqOff:
    
    // console.log( 'daySqOff 5 sl at ',cis.tradingsymbol )
    
    //          this.updateSquareOfforderWithDesiredPrice( 
    //            cis,
    //            element,
    //            false,
    //            last_price
    //           );
          
    
    
    // break;
    
    
    // case quickProfit:
    // console.log( 'quickProfit  of %s for %s ',livePnlOffered,cis.tradingsymbol )
    
    //          this.updateSquareOfforderWithDesiredPrice( 
    //            cis,
    //            element,
    //            false,
    //            last_price
    //           );
    
    //   break;
    
    
    
    
    
            // case livePnlOffe<-500:
    //         case ( livePnlHere <- 500 ):
    
    // console.log( '-500 sl at ',cis.tradingsymbol )
    
    //          this.updateSquareOfforderWithDesiredPrice( 
    //            cis,
    //            element,
    //            false,
    //            last_price
    //           );
          
    
    
    // break;
    
    
    //         case livePnlOffered<-2500:
    
    // console.log( '2500 sl at ',cis.tradingsymbol )
    
    //          this.updateSquareOfforderWithDesiredPrice( 
    //            cis,
    //            element,
    //            false,
    //            last_price
    //           );
          
    
    
    // break;
    
    
    
    
    // case ( element.last_price<= stopLoss ):
    
    
    
    // console.log( 'stopLoss sl at  for averagge stop loss @ %s for %s ',stopLoss,cis.tradingsymbol )
    
    //          this.updateSquareOfforderWithDesiredPrice( 
    //            cis,
    //            element,
    //            false,
    //            last_price
    //           );
          
    
    
    // break;
    
    
    
    
    
    
    /* case ( lp.quantity>0 && maxOfYdayTodayLow && false && positionObj.buy_price>= Math.max( cis.pricePoints.d0.low,cis.pricePoints.d1.low )  ):
    
    
    this.cl( 'sltrigger  trigger minimum of y day low todays low for  %s at squareoffPrice of %s',
    cis.tradingsymbol,Math.max( cis.pricePoints.d0.low,cis.pricePoints.d1.low ))
           
    
    this.updateSquareOfforderWithDesiredPrice( 
                       cis,
                       element,
                       false,
                       Math.max( cis.pricePoints.d0.low,cis.pricePoints.d1.low )
                      );
    
                     msg = `STOP LOSS  EXECUTION SEND BY  DAILY maxOfYdayTodayLow  STRATEGY FOR ${ cis.tradingsymbol }   for ${ Math.max( cis.pricePoints.d0.low,cis.pricePoints.d1.low ) }  at ${ formattedTime } `
             this.cl( msg )
                  
    
            break; */
    
    
    
    
    
    
    
    
    //         case livePnlOffered>500 && false:
    
         
    
    
    // this.cl( '1000 trigger' )
    //         this.updateSquareOfforderWithDesiredPrice( 
    //                    cis,
    //                    element,
    //                    false,
    //                    last_price
    //                   );
                  
    
    //         break;
    
    
    
            // testForHasLivetarget
            // case ( this.hours == 15 && this.minutes>10 && false ):
    
    
            // this.cl( 
            //            "Firing 15:10 square offf  order for %s bidprice is %s and high is %s ",
            //            cis.tradingsymbol, bidPrice,
            //            high
            //           );
    
            //          this.updateSquareOfforderWithDesiredPrice( 
            //            cis,
            //            element,
            //            false,
            //            last_price
            //           );
                  
    waitForShortCovering
            // break;
                   
    
    
    
    
                
    
              /*      case ( lp.quantity > 0 && last_price < low  && positionObj.buy_price>low ):
    
                     this.cl( 
                      "Firing long cover stop loss order for %s bidprice is %s and low  is %s  and last price is %s",
                      cis.tradingsymbol,
                      offerPrice,
                       low,last_price
                      );
    
                     //simple long covering
                    //  this.updateSquareOfforderWithDesiredPrice( 
                    //    cis,
                    //    element,
                    //    false,
                    //    offerPrice
                    //   ); 
                     
                     this.updateSquareOfforderWithDesiredPrice( 
                       cis,
                       element,
                       false,
                       squareoffPrice
                      );
    
    
                     msg = `STOP LOSS  EXECUTION SEND BY  DAILY quantity > 0 && last_price < low  STRATEGY FOR ${ cis.tradingsymbol }   for ${ squareoffPrice }  at ${ formattedTime } `
             this.cl( msg )
                  
    
                     break; */
    
                  
                  } 
    }
}



}