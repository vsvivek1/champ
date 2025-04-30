import { checkGapDown } from './gapDownChecker.js';

export function validateCISTradeConditions(cis) {


    // General Rejection Checks


if(
    !cis.operatorBuyCandles

    || !cis.operatorBuyCandles.allCandles

){


    if(typeof cis.returnPoints=='undefined'){

        cis.returnPoints=[];
        
    }

    cis.entryHealth='NO OPERATOR BUY CANDLES FOUND'
    cis.returnPoints.push('NO OPERATOR BUY CANDLES FOUND')

    return false;

}

    if (cis.tick.last_price < 1) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
            
        }

        cis.entryHealth='LAST PRICE LESS THAN 1'
        cis.returnPoints.push('less than one ')

        global.addOrIncrementRejection("LAST PRICE LESS THAN 1: " + cis.tradingsymbol);
        return;
    }

    // if (cis.liveMinute.color === "bearish") {

    //     if(typeof cis.returnPoints=='undefined'){

    //         cis.returnPoints=[];
           
    //     }
    //     cis.returnPoints.push('live candle bearish ') 
    //    cis.entryHealth='live candle bearish'
        
    //     global.addOrIncrementRejection("LIVE CANDLE BEARISH: " + cis.tradingsymbol);
    //     return;
    // }



    if (checkGapDown(cis)) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
            cis.returnPoints.push('Gap down ')
        }
             cis.entryHealth='Gap down '
        global.addOrIncrementRejection("GAP DOWN: " + cis.tradingsymbol);
        return;
    }

    // Time-Specific Strategies
    // if (global.hours === 9 && global.minutes < 30) {
    //     // Early morning specific strategies
    //     if (cis.tick.last_price < cis.tick.ohlc.open) {

    //         if(typeof cis.returnPoints=='undefined'){

    //             cis.returnPoints=[];
    //             cis.returnPoints.push('below open')

    //             cis.entryHealth='below open AT 9'
    //         }else{

    //             cis.returnPoints.push('below open')

    //               cis.entryHealth='below open AT 9 RET POINTS'
    //         }
    //         console.log(cis.tradingsymbol, "Price below open, skipping trade.");
    //         return;
    //     }
    
    // }
    ///

    if(!cis.isAboveOpen){

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('Below Open')
        
        return false;
    }
    if (cis.tick.last_price < 5) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
          
        
        global.addOrIncrementRejection('Price too low');
        cis.returnPoints.push('Below 5 Rs')
        return false;
    }

    if (cis.noBuy) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('cis no buy time')
        
        global.addOrIncrementRejection('cis no buy');

        cis.returnPoints.push('cis no buy')
        return false;
    }

    if ( !cis.tick) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('no tick')
        
        global.addOrIncrementRejection('cis no tick');

        cis.returnPoints.push('cis no tick')
        return false;
    }

    if (!cis.minuteData ) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('no minute data')
        
        global.addOrIncrementRejection('no minute data');
        return false;
    }

    cis.returnPoints.push('no minute data')



      cis.entryHealth='NOTHING PICKED IN CIST'
    return true;
}