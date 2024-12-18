export function isOpenLowAtSpecificSeconds(cis) {
    // Check if `cis.currentMinute` exists
    if (!cis.currentMinute) {
        console.log("currentMinute is undefined",cis.tradingsymbol);
        return false;
    }

    // Initialize tracking if it's the start of a new minute
    if (global.seconds === 0) {
        cis.openLowAt10 = false;
        cis.openLowAt15 = false;
        cis.openLowAt30 = false;
    }

    // Check the condition at specific seconds
    if (global.seconds === 10 && cis.currentMinute.open === cis.currentMinute.low) {
        cis.openLowAt10 = true;
    }

    if (global.seconds === 15 && cis.currentMinute.open === cis.currentMinute.low) {
        cis.openLowAt15 = true;
    }

    if (global.seconds === 30 && cis.currentMinute.open === cis.currentMinute.low) {
        cis.openLowAt30 = true;
    }

    // Return true only if all three conditions are met
    return cis.openLowAt10 && cis.openLowAt15 && cis.openLowAt30;
}

//export {isOpenLowAtSpecificSeconds};