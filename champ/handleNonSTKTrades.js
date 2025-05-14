import { buyAboveOpenAtNineAm } from "./buyAboveOpenAtNineAm.js";
import { buyAtHugeLastTick } from "./buyAtHugeTick.js";
import { validateCISTradeConditions } from "./handleCISTTradeConditions.js";
import { handleLongLowerShadowTrades } from "./handleLongLowerShadowTrades.js";
import { handleNminuteBreakout } from "./handleNminutesBreakOut.js";
import { handleReversalTrades } from "./handleReversalTrades.js";
import { handleGeneralTrades } from "./handleTrade.js";
import { handleLastCandleHighBelowMA20 } from './handleLastCandleHighBelowMA20.js';
import { handleHammerCandleTrade } from './handleHammerCandleTrade.js';

import { handleAfternoonBreakouts } from './handleAfternoonBreakouts.js';
import { handleYesterdayHighCross } from './handleYesterdayHighCross.js';
import { handleManyUpperWicks } from './handleManyUpperWicks.js';
import { handleThreeBlackCrowsReversal } from './handleThreeBlackCrowsReversal.js';
import { handleOpenLowAtSpecificSeconds } from './handleOpenLowAtSpecificSeconds.js';


//import { handleNminuteBreakout } from './handleNminuteBreakout.js';






export function handleNonSTKTrades(cis, kite) {

if(typeof cis.tick=='undefined' || typeof cis.tick.ohlc=='undefined' || typeof cis.ma20=='undefined') return;

//c//onsole.log(cis.tick,'tick')






    
    if(cis.tick.last_price<cis.ma20 && cis.minuteData.length>=20){
    
    

        cis.returnPoints='ltp less than mooving average 20'+`MA20 ${cis.ma20},LTP ${cis.tick.last_price}`;
        //console.log(`last price   ${cis.tick.ohlc.last_price} less than ma20 ${cis.ma20} for ${cis.tradingsymbol} returning`)
        return ;
    }else{



        cis.returnPoints=''
    }
    

   // console.log('cis.ohlc.last_price is greater than cis.ma20',cis.tick.last_price,cis.ma20)


    //return

   
    if (!validateCISTradeConditions(cis)) 
    {


        cis.returnPoints='CIST_HEALT-CHECK_FAILED';
        cis.entryHealth='CIST HEALTH CHECK FAILED'

        
        return;
    }
        
 





     cis.entryHealth='validatedCISTradeConditions'
    // Handle time-based trades
    //handleTimeBasedTrades(cis, kite);



   // handleReversalTrades
    //handleNonSTKTrades
    // Handle reversal trades
    if (handleReversalTrades(cis, kite)) return; ///


    //// case morning before 10 above open buy and sl at open and not gap down





    //buyAboveOpenAtNineAm
    if(buyAboveOpenAtNineAm(cis,kite)) return;


    ///buy if its a huge tick


    if(buyAtHugeLastTick(cis,kite) ) return;
    
  
    // Handle long lower shadow trades
   // handleLongLowerShadowTrades
    if (handleLongLowerShadowTrades(cis, kite)) return;

    // Handle general trades


    if (handleNminuteBreakout(cis, kite, 60)) return;
    if (handleNminuteBreakout(cis, kite, 30)) return;
    if (handleNminuteBreakout(cis, kite, 15)) return;
    if (handleLastCandleHighBelowMA20(cis, kite)) return;
    if (handleHammerCandleTrade(cis, kite)) return;
    if (handleAfternoonBreakouts(cis, kite)) return;
    if (handleYesterdayHighCross(cis, kite)) return;
    if (handleManyUpperWicks(cis, kite)) return;
    if (handleThreeBlackCrowsReversal(cis, kite)) return;
    if (handleOpenLowAtSpecificSeconds(cis, kite)) return;




    



   // handleNminuteBreakout


   // handleGeneralTrades
    handleGeneralTrades(cis, kite); //not working

    cis.entryHealth='exitAfterAllChecks'


    //cis.hugeLastTick
}


