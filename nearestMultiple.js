const nearestMultiple=function nearestMultiplesOfX(number, factor) {
    const nearestAbove = Math.ceil(number / factor) * factor;
    const nearestBelow = Math.floor(number / factor) * factor;
    
    return {
        nearestAbove: nearestAbove,
        nearestBelow: nearestBelow
    };
}


module.exports=nearestMultiple;


// Example usage:
// const givenNumber = 73;
// const x = 50;

// const nearestMultiples = nearestMultiplesOfX(givenNumber, x);
// console.log(`Nearest multiple of ${x} above ${givenNumber}: ${nearestMultiples.nearestAbove}`);
// console.log(`Nearest multiple of ${x} below ${givenNumber}: ${nearestMultiples.nearestBelow}`);
