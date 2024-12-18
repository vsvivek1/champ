export default function setAboveOpenScripts(){


    if(cis.tick.last_price>cis.tick.ohlc.open 
        && !global.aboveOpens.includes(cis.tradingsymbol)
    
    ){

        global.aboveOpens.push(cis.tradingsymbol)
    }else(cis.tick.last_price<cis.tick.ohlc.open && global.aboveOpens.includes(cis.tradingsymbol)) 
    {


   

const index = global.aboveOpens.indexOf(cis.tradingsymbol);
if (index > -1) {
    global.aboveOpens.splice(index, 1);
}
       

    }
}