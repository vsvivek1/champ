import { buyAboveOpenAtNineAm } from "./buyAboveOpenAtNineAm.js";
import { buyAtHugeLastTick } from "./buyAtHugeTick.js";
import { validateCISTradeConditions } from "./handleCISTTradeConditions.js";
import { handleLongLowerShadowTrades } from "./handleLongLowerShadowTrades.js";
import { handleReversalTrades } from "./handleReversalTrades.js";
import { handleGeneralTrades } from "./handleTrade.js";




export function handleNonSTKTrades(cis, kite) {
   
    if (!validateCISTradeConditions(cis)) 
    {


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

   // handleGeneralTrades
    handleGeneralTrades(cis, kite); //not working

    cis.entryHealth='exitAfterAllChecks'


    //cis.hugeLastTick
}


