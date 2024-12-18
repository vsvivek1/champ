import executeSquareOff from './executeSquareOff.js';

export default  function     handleShortCoveringOfStocks(cis){


     if(cis.tick.last_price>cis.tick.ohlc.open) {
    
            console.log('executing squareoff below open in the morning',cis.inbuiltStopLoss,'9 hrs less than open sq off');
    
            
            executeSquareOff(squareOff, cis, kite);
        
           }


}