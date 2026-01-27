export function colorPatternBuying(){

    if(global.seconds%30==0) {
    
        console.log('HIGH SPEED HEALTH at buy',cis.tradingsymbol,'color',cis.liveMinute.color);
       
    }

    if(cis.tick.last_price> cis.tick.ohlc.open && 
    
    
        global.speedSymbols.includes(cis.tradingsymbol)   && cis.liveMinute.color=='bullish'
        
        && (
            
            
             global.seconds==16 /* ||  global.seconds==32  ||   global.seconds==59 ||
        
              global.seconds==5  */
        
        )
        
        && !cis.ordered){
    
    
    
       
        
    
        if(cis.liveMinute.color=='bullish'){
    
            console.log('high speed buying for',cis.tradingsymbol,'color',cis.liveMinute.color);
    
            executeBuy(cis,kite,cis.tick.last_price)
        }
    } 
    
    
    return;
    

}