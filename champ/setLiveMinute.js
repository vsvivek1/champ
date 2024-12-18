export default function setLiveMinute(cis){


  if (!cis.liveMinute) cis.liveMinute = {};

    if (global.seconds == 1) {

        cis.liveMinute.t1=tick.last_price;;
        cis.liveMinute.open = tick.last_price;
        cis.liveMinute.high = tick.last_price;
        cis.liveMinute.low= tick.last_price;

       
    }

    //return;
    cis.liveMinute.low= Math.min(cis.liveMinute.low, tick.last_price);
    cis.liveMinute.high = Math.max(cis.liveMinute.high, tick.last_price);
    cis.liveMinute.body = Math.abs(cis.liveMinute.open - tick.last_price);
    cis.liveMinute.upperShadow = cis.liveMinute.high - Math.max(cis.liveMinute.open, tick.last_price);
    cis.liveMinute.hasLongUpperShadow = cis.liveMinute.body < cis.liveMinute.upperShadow / 2;

    cis.liveMinute.lowerShadow = cis.liveMinute.low - tick.last_price;

    cis.liveMinute.range=cis.liveMinute.high-cis.liveMinute.low;



    if(cis.liveMinute.lowerShadow>=3*cis.liveMinute.body){

        cis.liveMinute.hasLongLowerShadow=true
    }else{
        cis.liveMinute.hasLongLowerShadow=false

    }
    
    
   // cis.liveMinute.color =(tick.last_price-cis.liveMinute.open)<0?'bearish':'bullish'
    
    
    cis.liveMinute.last_price = tick.last_price;

    cis.currentMinute=cis.liveMinute;
   
   
    //very important  



if(typeof cis.liveMinute.t1=='undefined' && global.seconds<10){

    cis.liveMinute.t1=tick.last_price

}


    if(tick.last_price>cis.liveMinute.open){
cis.liveMinute.color='bullish';

    }else  if(tick.last_price<cis.liveMinute.open){
cis.liveMinute.color='bearish'

    }else{

        cis.liveMinute.color='doji'
    }


}