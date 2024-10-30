import { executeBuy } from "./executeBuy.js";
import { isHammerCandle } from "./hammerStrategy.js";
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import { isOpenLowAtSpecificSeconds } from './isOpenLowAtSpecifiedSeconds.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import findHourlyHighestPrice from './findElapsedHourHigh.js';
import { compareVolatility } from './compareVolatility.js';
import { hasManyUpperWicks } from './hasManyUpperWicks.js';
export function handle12to4PM(cis, kite) {

    if(global.seconds<50){

return false;

    }

    let h2 = findHourlyHighestPrice(cis);
    let previousCandleClose = cis.minuteData.slice(-2, -1)[0].close;
    let lastCandleClose = cis.minuteData.slice(-1)[0].close;
    let lastCandleHigh = cis.minuteData.slice(-2, -1)[0].high;
    if(cis.tick.last_price<1){

        return;
    }
   // Exit if live minute is bearish
   if (cis.liveMinute.color === 'bearish') {
    cis.message = 'Live minute Color bearish, no entry ' + cis.tradingsymbol;
    if (global.seconds == 57 && global.minutes%5==0)  //console.log(cis.message, cis.liveMinute.color, 'live color red rejection');
    return;
}

if (cis.tick.last_price < lastCandleHigh) {
     if (global.seconds == 57 && global.minutes%5==0) console.log('ltp less than last candle high', cis.tradingsymbol, lastCandleHigh);
     return;
 }


const result = compareVolatility(cis.minuteData);
//console.log('Last 5 candles volatility:',cis.tradingsymbol, result.lastFiveVolatility);
//console.log('Previous 10 candles volatility:',cis.tradingsymbol, result.previousTenVolatility);

if(result.lastFiveVolatility>result.previousTenVolatility*1.4

    && cis.tick.last_price>cis.minuteData.slice(-1)[0].high
    
    
    ){


      
            cis.buyCriteria = 'volatality cross';
            let noLots = 3; // Adjust as needed
            for (let i = 0; i < noLots; i++) {
                let price = cis.tick.last_price;
                executeBuy(cis, kite, price);
            }
            console.log('Comparison result:',cis.tradingsymbol, result.comparison);

            return;
    }
   
            if (global.seconds == 57 && global.minutes%5==0)  console.log('health here', cis.tradingsymbol);

   // return;

    let proceedToTrade = false;

 

    // Exit if last price is less than the last candle's high
   

 
    // Strategy 1: h2 breakout condition (previous close < h2 and current close > h2)
    if (previousCandleClose < h2 && lastCandleClose > h2) {
        proceedToTrade = true;
 console.log('h2 breakout occurred', cis.tradingsymbol);
    }

    // Strategy 2: 15-minute breakout
    let {
        breakoutOccurred,
    } = is15MinuteBreakout(cis.minuteData, cis.last_price);

    if (breakoutOccurred) {

        cis.timeDelayRequired=true;
        cis.timer=1000*60;
        proceedToTrade = true;
       console.log('15-minute breakout occurred', cis.tradingsymbol);
    }

    // Strategy 3: Three Black Crows Bullish Reversal
    if (checkThreeBlackCrowsBullishReversal(cis.minuteData)) {
        proceedToTrade = true;
       console.log('Three Black Crows pattern detected', cis.tradingsymbol);
    }

    // Strategy 4: Hammer Candle
    if (isHammerCandle(cis.minuteData.slice(-1)[0])) {

        proceedToTrade = true;
     console.log('Hammer candle pattern detected', cis.tradingsymbol);
    }

    if ( hasManyUpperWicks(cis.minuteData)) {
        proceedToTrade = true;
      console.log('has many upper wick', cis.tradingsymbol);
    }


    if(cis.tick.last_price>cis.tick.ohlc.high){
        proceedToTrade = true;
        console.log('break day high', cis.tradingsymbol,'alst_price=',cis.tick.last_price,'day high','cis.tick.ohlc.high');

    }

  if(global.minutes%5==0) if(global.seconds==58) console.log('procced to health 12-15 health check');
    

    // Execute buy logic if any of the strategies meet the criteria


    if (proceedToTrade) {
        cis.buyCriteria = '12-4 PM';
        let noLots = 3; // Adjust as needed
        for (let i = 0; i < noLots; i++) {
            let price = cis.tick.last_price;
            executeBuy(cis, kite, price);
        }
    }
}
