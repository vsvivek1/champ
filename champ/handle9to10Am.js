import { executeBuy } from "./executeBuy.js";
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import { isHammerCandle } from "./hammerStrategy.js";
import { isOpenLowAtSpecificSeconds } from './isOpenLowAtSpecifiedSeconds.js';
import { checkGapDown } from './gapDownChecker.js';

export function handle9to10AM(cis, kite) {

    // Check if there is a gap down or last price is less than open price
    if (
        checkGapDown(cis) || 
        cis.tick.last_price < cis.tick.ohlc.open
    ) {
        if (global.minutes % 5 == 0 && global.seconds == 30) {
            console.log(cis.tradingsymbol, 'is gap down, no morning trades or less than open price');
        }
        return false; // Exit condition
    }

    // Check for a no-buy time restriction
    if (cis.noBuyTime > global.date) {
        console.log('No buy allowed until ', cis.noBuyTime);
        return;
    }

    let proceedToTrade = false;
    cis.buyCriteria = null; // Reset the buy criteria flag

    let lastCandleHigh = cis.minuteData.slice(-1)[0].high;

    // Check if last price is less than last candle high
    if (cis.tick.last_price < lastCandleHigh) {
        if (global.seconds == 30) {
            console.log('ltp less than last candle high', cis.tradingsymbol, 'ltp',cis.tick.last_price ,'lstcndlehi',lastCandleHigh);
        }
        return; // Exit until the price crosses over the last candle's high
    }

    // Check if the current candle color is bearish
    if (cis.liveMinute.color === 'bearish') {
        cis.message = 'Live minute Color bearish, no entry ' + cis.tradingsymbol;
        if (global.seconds == 30) {
            console.log(cis.message, cis.liveMinute.color, 'live color red rejection');
        }
        return; // Exit if the candle is bearish
    }

    // Breakout Strategy: 15-minute breakout condition
    let {
        breakoutOccurred,
    } = is15MinuteBreakout(cis.minuteData, cis.tick.last_price);

    if (breakoutOccurred) {
        proceedToTrade = true;
        if (global.seconds == 30) console.log('15-minute breakout occurred in 9-10 AM', cis.tradingsymbol);
    }

    // Strategy 1: Check for Open=Low condition at specific seconds
    if (isOpenLowAtSpecificSeconds(cis)) {
        proceedToTrade = true;
        if (global.seconds == 30) console.log('Open=Low condition detected at specific seconds', cis.tradingsymbol);
    }

    // Strategy 2: Check for Three Black Crows Bullish Reversal
    if (checkThreeBlackCrowsBullishReversal(cis.minuteData)) {
        proceedToTrade = true;
        if (global.seconds == 30) console.log('Three Black Crows Bullish Reversal pattern detected', cis.tradingsymbol);
    }

    // Strategy 3: Check for Hammer Candle
    if (isHammerCandle(cis.minuteData.slice(-1)[0])) {
        proceedToTrade = true;
        if (global.seconds == 30) console.log('Hammer candle pattern detected', cis.tradingsymbol);
    }

    // Log status periodically for debugging
    if (global.seconds % 20 == 0) {
        console.log('Before proceeding to trade', cis.tradingsymbol, { proceedToTrade });
    }

    // Execute the trade if any of the conditions are met
    if (proceedToTrade) {
        cis.buyCriteria = '9-10 AM'; // Set the buy criteria flag
        let noLots = 3; // Adjust the number of lots as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite, cis.tick.last_price);
        }
    }
}
