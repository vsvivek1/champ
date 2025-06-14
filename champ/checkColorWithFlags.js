function checkColorWithFlags(cis) {
    // Get the current seconds from the global time (assuming global.seconds is available)
    const currentSeconds = global.seconds;

    // Get the color from liveMinute
    const currentColor = cis.liveMinute.color;

    // Initialize flags
    let flag15 = false;
    let flag30 = false;
    let flagAfter30 = false;

    // Check if the color is red at the 15th second
    if (currentColor === 'red' && currentSeconds === 15) {
        flag15 = true;
    }

    // Check if the color is red at the 30th second
    if (currentColor === 'red' && currentSeconds === 30) {
        flag30 = true;
    }

    // Check if the color is red after the 30th second
    if (currentColor === 'red' && currentSeconds > 30) {
        flagAfter30 = true;
    }

    // Return true if any of the flags are set

    if(flagAfter30 && cis.hasPosition){

               console.log('EXECUTING STOP LOSS flagAfter30 for',cis.tradingsymbol)
    }

    return  flagAfter30;
    //return flag15 || flag30 || flagAfter30;
}

// Export the function using ES6 module syntax
export default checkColorWithFlags;
