// stopLossCriterias.js

import { isMakingLowerLows, hasLargeUpperWick, isBearishAt50Sec, isOpenHighAtSpecificSeconds } from './criteriaFunctions.js';  // Import your criteria functions

export function squareOffBefore9Hrs(cis, orders, date) {
    // Logic for squaring off before 9 AM
    return isMakingLowerLows(cis) 
    
    //|| hasLargeUpperWick(cis) || isBearishAt50Sec(cis) || isOpenHighAtSpecificSeconds(cis);
}

export function squareOffBetween9And12Hrs(cis, orders, date) {

    if(cis.tick.ohlc.last_price<cis.tick.ohlc.open){

        return true
    }else{
        return isMakingLowerLows(cis) 
        
        //|| hasLargeUpperWick(cis) || isBearishAt50Sec(cis) || isOpenHighAtSpecificSeconds(cis);

        return false;
    }
    // Logic for squaring off between 9 AM and 12 PM
   // return isMakingLowerLows(cis) || hasLargeUpperWick(cis) || isBearishAt50Sec(cis) || isOpenHighAtSpecificSeconds(cis);
}

export function squareOffAfter12Hrs(cis, orders, date) {
    // Logic for squaring off after 12 PM
    return isMakingLowerLows(cis) 
    
    //|| hasLargeUpperWick(cis) || isBearishAt50Sec(cis) || isOpenHighAtSpecificSeconds(cis);
}
