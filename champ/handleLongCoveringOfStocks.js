import executeSquareOff from './executeSquareOff.js';

export default function handleLongCoveringOfStocks(cis,kite){

    let squareOff=true
      if(cis.position.pnl>1000 && !cis.sqOff){
    

        cis.sqOff=true;
              console.log('Profit above 1000',cis.tradingsymbol,cis.position.pnl)
              executeSquareOff(squareOff, cis, kite);
          }
      


    if(cis.tick.last_price<cis.tick.ohlc.open && !cis.sqOff) {

        cis.message='executing squareoff below open in the morning'
        //console.log('executing squareoff below open in the morning',cis.inbuiltStopLoss,
            
            

            cis.sqOff=true;
        executeSquareOff(squareOff, cis, kite);
    
       }


}