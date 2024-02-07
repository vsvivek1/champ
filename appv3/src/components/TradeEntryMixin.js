import Vue from "vue";
import moment from 'moment';
const TradeEntryMixin = {
    methods: {

tradeEntry( instrument_token,inst = cis,cis,element ){ 
    try { 

        
this.cl('from trade entry mixin');
        // return;


      this.triggers( element,cis ); /// what is thios
      




      // 

      var buying = true;
      var selling = true;
      const lastTradedDate  =  new Date( element.last_traded_time );

// Get the current time
const currentTime  =  new Date();

// Calculate the difference in minutes
var timeDiffInMinutes  =  Math.floor(( currentTime - lastTradedDate ) / ( 1000 * 60 ));

// Check if the time difference is less than or equal to 15 minutes
var isBefore15Minutes  =  timeDiffInMinutes > 15;



let { d2,d1 }  = cis.pricePoints;

let d2Range = d2.high-d2.low;
let d1Range = d1.high-d1.low;

let d1UpperShadow = d1.high-Math.max( d1.close,d1.open );
let d1LowerShadow = Math.min( d1.close,d1.open )-d1.low;

let d1Body = Math.abs( d1.open-d1.close );
let d2Body = Math.abs( d2.open-d2.close );




let largeYesterdayCandle = d1Range>= d2Range*2


let largeYesterdayBody = d1Body>= d2Body*2


if( largeYesterdayCandle ){ 

// this.cl( 'YESTEFDAY HUGE CANDLE NO TRADING ',cis.tradingsymbol );
return;
} 


if( !( element && element.depth && element.depth.buy )){ 

// this.cl( 'BUY NOT DEFINED FOR',cis.tradingsymbol,element.depth )

return false
} 

let depthBuy = element.depth.buy

let lowestPrice  =  Number.MAX_VALUE;
let highestPrice  =  Number.MIN_VALUE;

for ( let i  =  0; i < depthBuy.length; i++ ) { 
const {  price  }   =  depthBuy[i];

if ( price < lowestPrice ) { 
  lowestPrice  =  price;
 } 

if ( price > highestPrice ) { 
  highestPrice  =  price;
 } 
} 



// console.log( "Lowest Price:", lowestPrice,'highestPrice',highestPrice,'last_price',element.last_price,'astPriceForBuying',lastPriceForBuying );
// console.log( "Highest Price:", highestPrice );




// if( isBefore15Minutes ){ 


//   this.cl( 'LAST TRADED TIME IS BEFORE 15 MINUTES IGNORING TRADE ENTRY DUR TO LIQUIDITY ISSUE FOR',cis.tradingsymbol,'traded before ',timeDiffInMinutes,' minutes' );

//   return false;


//  } 

if(  this.totalOptionPrice &&



this.totalOptionPrice!= -2 

&&
this.totalOptionPrice>300000 ){ 

this.cl( 'DEBITS MORE THAN 100000 NO TRADING FURTER' );

return false;
} 


      if( cis.pricePoints.d1.high == cis.pricePoints.d1.open ){ 

        //  this.cl( `YESTERDAYS (  ${ cis.pricePoints.d1.normalDate }  ) OPEN WAS HIGH FOR ${ cis.tradingsymbol }  NO TRADE yday high ${ cis.pricePoints.d1.high }  and Yday open ${ cis.pricePoints.d1.open }  ` )
return;

       } 

      
 

      let a =   this.checkNiftyStatus( "NIFTY 50" );
    // this.cl( a,'index status' )

    let niftyFavorable = false
    if( a.change>75 ){ 

      niftyFavorable = true;

    
     } 
    niftyFavorable = true;

    if( niftyFavorable == false ){ 

    let t =   moment()
      this.cl( 'NIFTY NOT FAVORABLE',t.hours());

      // return false
     } 

    this.cl( 'nifty favorable',niftyFavorable )

      // return;

if(  !element  || !cis || !cis.pricePoints || !cis.pricePoints.d1 || !cis.pricePoints.d1.high ){ 

this.cl( 'cis or element undefined for inside trade entry',instrument_token );

return false;
} 



      let ts = cis.tradingsymbol;
   
     

      
      let filter = this.filterScripts( element );


      
      if( filter == false ){ 
//  this.cl( 'filter false',ts )
        return false
       } 








         this.cl( 'inside trade entry7' )









//// program working till hhere no issues  feb 17 2023

let cond = cis.pricePoints.d0.high<cis.pricePoints.d1.high 
&& cis.pricePoints.d0.open<cis.pricePoints.d1.high
&& cis.previousPrice != 0 
&& cis.last_price >=  cis.pricePoints.d1.high;


// this.cl( 'combined',ts,cond


//  )

this.cl( 'reached inside trade entry' )



let { entry,target,stopLoss }  =  this.getAverageClosingValue( cis );



//enterTrade
//tradeSwitch

///tradeEntrySwitch



// this.cl( 'here',ts )

let closingMovingAverageCondition = element.ohlc.open<entry &&
element.last_price>= entry && false;

// this.cl( closingMovingAverageCondition,'closingMovingAverageCondition2' )

// let a = this.evaluateConditions( element, entry, cis, ts );

// this.cl( a,element.last_price,closingMovingAverageCondition );

// let a = this.retrieveTradeDetailsInLocalStorage( cis.tradingsymbol );
// console.log( a,'retrieveTradeDetailsInLocalStorage @4031' );






let ohlc = element.ohlc;
let lp1 = element.last_price;
let isOpenLow1  = this.isOpenLow( ohlc,cis,lp1 );
let isOpenLow  = isOpenLow1 /// && niftyFavorable;



// let sells = element.depth.sell;
// this.cl( element,'element' );


if( !element || !element.depth || !element.depth.buy  )
{ 


this.cl( 'element issue inside trade entry for',cis.tradingsymbol )
return;


} 


let buys = element.depth.buy;

if( buys  == 'undefined' ){ 

this.cl( element,'element no bus ibside trade entry',instrument_token );
} 
// console.log( 'buys' );

// let { highestOrdersPrice, secondHighestOrdersPrice }  = this. getHighestOrdersPrice( sells );
let {  secondLowestOrdersPrice }  = this. getLowestOrdersPrice( buys );

if( secondLowestOrdersPrice == -1 ){ 


this.cl( 'issue with secondLowestOrdersPrice for inside trade entry function',cis.tradingsymbol,element.depth.buy )
return false;
} 




let todayLastPriceHigh = false;



// if(  ( this.hours == 15 ) && this.minutes>15  ){ 



// // console.log( element.last_price == element.ohlc.high,ts )


// // if( element.last_price<element.ohlc.high*1.01 && element.last_price>element.ohlc.high*.99 && !cis.tradingsymbol.includes( 'FUT' )){ 

// //  this.cl( ts,'is seems to be at HIGHEST PRICE OF THE DAY ' );

// //    todayLastPriceHigh = true
// //  } 






//  } 


let todayLastPriceClosing = false
if(  ( this.hours == 15 ) && this.minutes>25  ){ 



// console.log( element.last_price == element.ohlc.high,ts )


if( 

element.last_price<element.ohlc.high*1.01 && element.last_price>element.ohlc.high*.99 && !cis.tradingsymbol.includes( 'FUT' ) 





){ 

console.log( ts,'is seems to be at higest price close todayLastPriceClosing from inside trade entry function' );

todayLastPriceClosing = true
} 






} 




// this.cl( 'before yesterDayCloseStrategy' )





let shortGapUpOpen = ( 
// this.hours == 9 //&& this.minutes<17 && this.minutes>15 // trigger only at 9:16
  
  // && 
  ( element.ohlc.open>element.ohlc.close*2  || element.last_price>element.ohlc.close*2.5  ) //open 1.5 times greater than yesterdays close price

  && element.ohlc.open!= 0  && false
  
  // && d1.high!= d1.low


 );



/// yesterday small body filter  


// if( d1Body<d1LowerShadow/4 || d1Body<d1UpperShadow ){ 

// this.cl( 'UPPER OR LOWER SHADOW OF YESTERDAY CANDLE IS DOUBLE COMPARED TO BODY . RISKY TRADE AVOIDING FOR ',cis.tradingsymbol )

// // return false
//  } 



let yesterDayCloseStrategy = ( element.last_price>= cis.pricePoints.d1.high &&


this.isBetween( cis.pricePoints.d1.close,element.ohlc.open,cis.pricePoints.d1.open ) // oepenong price in the body of ysterday candle
// element.ohlc.open<cis.pricePoints.d1.close



&& !largeYesterdayBody // yesterday not have a huge body
&& element.ohlc.high< cis.pricePoints.d1.high*1.05

&& !largeYesterdayCandle && 

( d1Body>d1LowerShadow/4 || d1Body>d1UpperShadow )

&& this.hours<11
)



//ned some other cond//&& element.last_price<element.ohlc.high )
// let newTradingObj = this.newTradingObj;
// newTradingObj.tradingsymbol = ts;
// newTradingObj.buyTime = new Date();
// newTradingObj.buyPrice = Math.min( secondLowestOrdersPrice,element.last_price );




// let noOfOptionsOfScript = this.livePositions.

let livePositionInstrumentTokens = this.livePositions.map( lp =>lp.instrument_token );


// console.log( typeof yesterDayCloseStrategy,ts )





let dailyRangeBreakOut = ( 


( element.ohlc.high-element.ohlc.open )/element.ohlc.open<.2  && 

element.ohlc.high<= element.last_price 

&& element.ohlc.high>element.ohlc.open

// && ( cis.pricePoints.d1.close- cis.pricePoints.d1.open )> 0 /// yesterday not red candle

&& ( this.hours>= 9 && this.minutes>= 25  ) //after 9:25

&& element.ohlc.open>cis.pricePoints.d1.low    //open greater thabn yesterday low

&& cis.pricePoints.d1.high!= cis.pricePoints.d1.open  //yesterday high not open


// && element.last_price>= cis.pricePoints.d0.high  //entry criteria
&& element.last_price>= element.ohlc.high  //entry criteria


// && element.last_price<=  cis.pricePoints.d0.high*1.05  /// limiting criteria


&& cis.pricePoints.d0.high!= 0 // today high not zero

);



if( dailyRangeBreakOut )
{ 

// this.cl( 'DAILY RANGE BREAK OUT AFTER 11 OF ',ts,'AT ',element.last_price,'TIME',this.hours,':',this.minutes )
} 

if( element.last_price<1 ){ 

// this.cl( ' NO TRADING IN SCRIPT PRICE LESS THAN 1 RS',ts )

return ;
} 


// if( !niftyFavorable && 
// !( 
// cis.tradingsymbol.includes( "NIFTY" )

// || cis.tradingsymbol.includes( "BANKNIFTY" ))


//  ){ 

//   this.cl( 'NIFTY NOT FAVORABLE NO TRADE',niftyFavorable );

//   return ;//false;
//  } 

let specialCheck;

var msg;

var now  =  moment();

var formattedTime  =  now.format( "DD-MM-YY H:mm" );


let openHigh = element.ohlc.open == element.ohlc .high;



let lastPriceForBuying = Math.min( highestPrice,element.last_price )

if( this.checkSidewaysMovementTime()  ){ 

this.cl( 'NO TRADING TIME SIDE WISE TIME' )

// return false;
} 


this.tradeEntrySwitchHealth = !this.tradeEntrySwitchHealth;

let sells = element.depth.sell;
// let buys = element.depth.buy;

// this.cl( sells[0].price,sells[sells.length-1].price,'sells',cis.tradingsymbol,'last price',element.last_price );


let bestSellOffer = sells[0].price
let bestBuyOffer = buys[0].price;


if( bestBuyOffer>element.last_price ){ 


// this.cl( 'BUY OFFER GREATER THAN LAST PRICE DEMAND FOR',cis.tradingsymbol );
} 


this.cl( 'REACEHED  BEFORE TRADE ENTRY SWITCH 4687',element.last_price>element.ohlc.close*2 )


let buyersHighestPrice = element.depth.buy[0].price;
let sellersLowestPrice = element.depth.sell[0].price;



//  { d1 }  = cis.pricePoints;

d2Body = Math.abs( d2.close-d2.open );

let body = Math.abs( d1.close-d1.open )
let upper = Math.abs( Math.max( d1.close,d1.open )-d1.high );
let lower = Math.abs( Math.min( d1.close,d1.open )-d1.low );


//thudakkam

// return false;

selling = true;

let e = element;
// if( element.last_price>cis.pricePoints.d0.high &&  element.volume_traded>cis.pricePoints.d1.volume*6/7 ){ 

//   this.cl( element.last_price>cis.pricePoints.d0.high &&  element.volume_traded>cis.pricePoints.d1.volume

//   ,'element.last_price>cis.pricePoints.d0.high  @ ',cis.tradingsymbol,'ltp',element.last_price,element.volume_traded,cis.pricePoints.d1.volume )
//  } 


// console.log( cis.pricePoints.d1.volume ,'cis.pricePoints.d1.volume' );

// this.cl( 'element.volume_traded>cis.pricePoints.d1.volume',element.volume_traded,cis.pricePoints.d1.volume );

// return;

// let d2Body = Math.abs( d2.close-d2.open );

// let body = Math.abs( d1.close-d1.open )
// let upper = Math.abs( Math.max( d1.close,d1.open )-d1.high );
// let lower = Math.abs( Math.min( d1.close,d1.open )-d1.low );


if( this.exitNow ){ 


this.cl( 'NO ENTRY DURING EXIT SWITH IS ON ' )
return false
} 



let NoTradeForLtpBelowOpenPrice = element.last_price<e.ohlc.open;

this.cl( 'reached thudakkam switch' );

if( this.liveMargin.equity.utilised.option_premium>30000 ){ 

return false;
} 


// this.cl( 
//  ` element.last_price>= cis.pricePoints.d0.high   /// break todays high at reference time

//   && element.ohlc.high<cis.pricePoints.d0.high*1.1


// //  &&  element.last_price>element.ohlc.open  /// buying only stocks above open

//   &&  (( element.last_price-element.ohlc.open )*cis.lot_size )<2500   // even if it broke just check  whether it have moved too much  this is the stopo loss  open is the stop loss


//   && element.volume_traded>cis.pricePoints.d1.volume && cis.pricePoints.d1.volume!= 0   //  have a volume greater than yesterday



//   && element.ohlc.open<element.last_price   /// must be above todays open price 


//   // && cis.pricePoints.d0.high>element.ohlc.high  what is this 

//   && body>upper*1.5   ///yesterdays bodys must be greater than atleast 1.5 times  upper shadow

//   && d2Body>body   /// yesterdays body less than   day befores yesterdays body
//   && d2.high<d1.high "`,


//   element.last_price,cis.pricePoints.d0.high  ,( element.last_price-element.ohlc.open )*cis.lot_size,body,upper,d2Body

// ,cis.tradingsymbol
//  );

switch( true ){ 




case 


( 

element.ohlc.high<cis.pricePoints.d1.high && /// has not crossed yesterday high previosly
  
element.last_price>= cis.pricePoints.d1.high   /// break todays high at reference time

// && element.ohlc.high<cis.pricePoints.d0.high*1.1


//  &&  element.last_price>element.ohlc.open  /// buying only stocks above open

// &&  (( element.last_price-element.ohlc.open )*cis.lot_size )<2500   // even if it broke just check  whether it have moved too much  this is the stopo loss  open is the stop loss


// && element.volume_traded>cis.pricePoints.d1.volume && cis.pricePoints.d1.volume!= 0   //  have a volume greater than yesterday



&& element.ohlc.open<cis.pricePoints.d1.high   /// must be above todays open price 


// && cis.pricePoints.d0.high>element.ohlc.high  what is this 

&& body>upper*1.5   ///yesterdays bodys must be greater than atleast 1.5 times  upper shadow

&& d2Body>body   /// yesterdays body less than   day befores yesterdays body
&& d2.high<d1.high /// d2 high less than d1 high 

// && NoTradeForLtpBelowOpenPrice // no entry below entry

 ):



this.proceedForEntry( 
       instrument_token,
       cis,
       element,
       sellersLowestPrice,
       "long"
      );
this.cl( 'DO break out with volume greater than yeterday high  ',cis.tradingsymbol )



break;




case (  
  
  // e.ohlc.low<d1.low && 
  // e.ohlc.high> d1.high &&

false &&

  ( body<d2Body*2 ) &&

  element.ohlc.high<d1.high*1.3 && 

  element.last_price>= d1.high && 

  element.ohlc.high!= element.ohlc.open &&

body>upper && body>lower &&
  d1.open<d1.close &&
  e.ohlc.open<d1.close 

 &&
  e.ohlc.open!= 0  

  && sellersLowestPrice<element.last_price*1.2 // to cehck malleciaou trade

  && 

( Math.max( buyersHighestPrice,sellersLowestPrice )- Math.min( buyersHighestPrice,sellersLowestPrice )*100 )/Math.min( buyersHighestPrice,sellersLowestPrice ) <20


///percetage difff between buy price and sell price to prevent mallicious tradees
  



   ):


  this.cl( `LONG Entry for new tested ALGO  ${ ts }  Buying for ${ sellersLowestPrice }   ` )
this.proceedForEntry( 
       instrument_token,
       cis,
       element,
       sellersLowestPrice,
       "long"
      );


  break;


case ( element.last_price>element.ohlc.close*2 && false ):

// && selling  //&& element.ohlc.high>element.last_price*1.03

// && this.hours>9 || ( this.hours == 9 && this.minutes>30 )

//  )
// :

let entry250HiPriceForShort = Math.max( 

( element.ohlc.close*2.5 ).toFixed( 1 ),( element.last_price*1.3 ).toFixed( 1 )
 );



this.cl( `SHORTING ${ ts }  FOR last price ${ element.last_price }  higher than 2.1 times y day  close of ${ element.ohlc.close }  `,ts ,'AT ',entry250HiPriceForShort )
this.proceedForEntry( 
       instrument_token,
       cis,
       element,
       entry250HiPriceForShort,
       "short"
      );


break;



// case ( buyersHighestPrice>element.last_price ):

// this.proceedForEntry( 
//        instrument_token,
//        cis,
//        element,
//        Math.min( element.last_price ),
//        "long"
//       );
// this.cl( ' has to buy this :buyersHighestPrice is greater than last price for',cis.tradingsymbol, 'buyersHighestPrice', buyersHighestPrice,' last price', element.last_price )
// break;


// case ( sellersLowestPrice<element.last_price ):


// this.cl( ' has to sell this :sellersLowestPrice is less  than last price for',cis.tradingsymbol, 'sellersLowestPrice', sellersLowestPrice,' last price', element.last_price )
// break;


case ( element.last_price == element.ohlc.high && element.ohlc.high!= element.ohlc.open &&  
element.upper_circuit_limit!= element.ohlc.high && false  ):

this.cl( 'LAST PRICE HIGH BREAK OUT FOR',cis.tradingsymbol )

this.proceedForEntry( 
       instrument_token,
       cis,
       element,
       Math.min( element.last_price,bestSellOffer ),
       "long"
      );

break;

// &&  element.ohlc.high<element.last_price*1.2





case ( shortGapUpOpen && selling ):

let entryPriceForShort = Math.max(( element.ohlc.close*2.5 ).toFixed( 1 ),( element.last_price*1.2 ).toFixed( 1 ));



this.cl( 'SHORTING FOR GAP UP OPEN FOR ',ts ,'AT ',entryPriceForShort )
this.proceedForEntry( 
         instrument_token,
         cis,
         element,
         entryPriceForShort,
         "short"
        );


break;

case ( dailyRangeBreakOut && buying && false ): 


 specialCheck = this.specialChecks( element,cis,'FROM DAILY RANGE BRAK OUT' );

if( specialCheck == false ){ 

  return false
 } 


if( openHigh && buying &&  false ){ 
this.cl( 'OPEN IS HIGH NO TRADE  FOR',cis.tradingsymbol )
return false
} 
this.cl( 'safe','daily range break out' )

// this.cl( secondLowestOrdersPrice,'secondLowestOrdersPrice',ts )

let e4 = Math.min( secondLowestOrdersPrice,lastPriceForBuying,cis.pricePoints.d0.high );


this.cl( 'daily range break out ',ts )

this.proceedForEntry( 
         instrument_token,
         cis,
         element,
         bestSellOffer,
         "long"
        );



        msg = `TRADE EXECUTION SEND BY  DAILY RANGE BREAKOUT STRATEGY FOR ${ ts }   for ${ bestSellOffer }  at ${ formattedTime } `
       this.cl( msg )

this.sendTradeStrategy( cis.tradingsymbol,e4,cis.lot_size,'daily range break out' )




break;


case ( yesterDayCloseStrategy && buying && false ) :

specialCheck = this.specialChecks( element,cis,'FROM YDAY HIGH STRATEGY' );

if( specialCheck == false ){ 

return false
} 

if( openHigh ){ 
this.cl( 'OPEN IS HIGH NO TRADE  FOR',cis.tradingsymbol )
return false
} 

// newTradingObj.strategy = 'yesterDayCloseStrategy';

// newTradingObj.targetPrice = cis.pricePoints.d1.rangeBreakOutTarget;

// this.storeTradeDataInLocalStrorage( newTradingObj )

this.cl( 'safe','yesterDayCloseStrategy' )

let e3 = Math.min( secondLowestOrdersPrice,lastPriceForBuying,cis.pricePoints.d1.high );


this.cl( 'yester day yesterDayCloseStrategy ',ts )

this.proceedForEntry( 
           instrument_token,
           cis,
           element,
           e3,
           "long"
          );


  

        msg = `TRADE EXECUTION SEND BY yesterDayCloseStrategy FOR ${ ts }   for ${ e3 }  at ${ formattedTime } `
       this.cl( msg )


this.sendTradeStrategy( cis.tradingsymbol,e3,cis.lot_size,'yesterDayCloseStrategy' )


break;



case ( todayLastPriceHigh && buying && false ):



if( openHigh ){ 
this.cl( 'OPEN IS HIGH NO TRADE  FOR',cis.tradingsymbol )
return false
} 


let e2 = Math.min( secondLowestOrdersPrice,lastPriceForBuying );

this.cl( 'todayLastPriceHigh',ts )



this.proceedForEntry( 
           instrument_token,
           cis,
           element,
           lastPriceForBuying,
           "long"
          );

         this.cl( 'safe','todayLastPriceHigh' )

         this.sendTradeStrategy( cis.tradingsymbol,e2,cis.lot_size,'todayLastPriceHigh' )

         msg = `TRADE EXECUTION SEND BY  DAILY todayLastPriceHigh STRATEGY FOR ${ ts }   for ${ e2 }  at ${ formattedTime } `
       this.cl( msg )


break; 


// case todayLastPriceClosing:





case ( todayLastPriceClosing && buying && false ):

( Math.abs( element.ohlc.low-element.last_price )> ( cis.pricePoints.d1.high-cis.pricePoints.d1.low )*2 )
{ 

  this.cl( 'to big today candle',cis.tradingsymbol )
  return false;
 } 

if( openHigh ){ 
this.cl( 'OPEN IS HIGH NO TRADE  FOR',cis.tradingsymbol )
return false
} 
// let e2 = Math.min( secondLowestOrdersPrice,element.last_price );

this.cl( 'todayLastPriceClosing high',ts )



this.proceedForEntry( 
           instrument_token,
           cis,
           element,
           lastPriceForBuying,
           "long"
          );

        //  this.cl( 'safe','todayLastPriceHigh' )

        //  this.sendTradeStrategy( cis.tradingsymbol,e2,cis.lot_size,'todayLastPriceHigh' )

         msg = `TRADE EXECUTION SEND BY  DAILY todayLastPriceClosing STRATEGY FOR ${ ts }   for ${ element.last_price }  at ${ formattedTime } `
       this.cl( msg )


break;



case ( isOpenLow && buying && false ):


specialCheck = this.specialChecks( element,cis );

if( specialCheck == false ){ 

return false
} 


// let e1 = Math.min( secondLowestOrdersPrice,element.last_price );
// console.log( { e1 } ,'e1' )

this.cl( 'openLowScrßiptFithFixedLoss strategy ',ts,lastPriceForBuying,'lastPriceForBuying' )

this.proceedForEntry( 
            instrument_token,
            cis,
            element,
            lastPriceForBuying,
            "long"
           );
          this.cl( 'safe','todayLastPriceHigh' )

          msg = `TRADE EXECUTION SEND BY  DAILY isOpenLow STRATEGY FOR ${ ts }   for ${ lastPriceForBuying }  at ${ formattedTime } `
       this.cl( msg )

          this.sendTradeStrategy( cis.tradingsymbol,lastPriceForBuying,cis.lot_size,'todayLastPriceHigh' )
break;








case  ( closingMovingAverageCondition && false && buying ):

this.cl( 'closingMovingAverageCondition' )



this.cl( 'entering  closingMovingAverageCondition',ts )

entry = Math.min( secondLowestOrdersPrice,element.last_price );

this.proceedForEntry( 
            instrument_token,
            cis,
            element,
            entry,
            "long"
           );
          this.cl( 'safe','closingMovingAverageCondition' )

this.sendTradeStrategy( cis.tradingsymbol,entry,cis.lot_size,'closingMovingAverageCondition' )

break;


} 




}  catch ( e ) { 
       console.log( "trade entry function", e );
          return false;
         } 

       

   } ,
    }}
    Vue.mixin(TradeEntryMixin);

export default TradeEntryMixin;