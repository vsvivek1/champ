export function colorPatternSquareOff(){

    if(global.seconds%3==0)console.log('has positon health',cis.tradingsymbol,cis.liveMinute.color)
        if(global.speedSymbols.includes(cis.tradingsymbol)){
           // console.log(cis.tradingsymbol,'spped test,',cis.liveMinute.color);
    
           if(global.seconds%30==0) console.log('HIGH SPEED HEALTH',cis.tradingsymbol,'color',cis.liveMinute.color);
        
            if(cis.liveMinute.color=='bearish' && global.seconds%19==0){
        
                console.log('high speed squareoff',cis.tradingsymbol,'color',cis.liveMinute.color);
        
                squareOff=true;
                executeSquareOff(squareOff, cis, kite);
        
               // executeBuy(cis,kite,cis.tick.last_price)
            }
        
           // return;
        }
        return;


}