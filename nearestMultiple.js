var nearestMultiple=function nearestMultiplesOfX(number, factor) {
    var nearestAbove = Math.ceil(number / factor) * factor;


    /* nearestAbove=nearestAbove+factor*2

    nearestBelow=nearestBelow-factor*2 */

    var nearestBelow = Math.floor(number / factor) * factor;
    
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
