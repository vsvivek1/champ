export default{ 

  data(  ){ 
return { 
  totalForgoneForStopLoss:0,
  totalForgoneFortarget:0,
  totalForgone:0,
  updatingInProgress:[],
        newOrder:[],
        loadingHourlyTradingLows: false,
        closedTradesScripts: [],
        tradingAlerts: [],
        liveScript: {  } ,
        liveOrders: [],
        webSocketNotActive: false,
        laggingCheckDigit: -1,
        CurrentCheckDigit: 0,
        hourlyPricePointsofLiveDay: [],
        livePositionScripts: [],
        liveOrderScripts: [],
        liveOrderPlacedScripts: [],
        livePositionsSelected: [],
        modalShow: false,
        proposedBuyAmount: 0,
        pnl: 0,
        totalBuyOrderLivePlacedBySoftware: 0,
  
        CurrentTick: [],
        orderArray: [],
        chat_id: -1,
        token: "2042279965:AAGudvLvwhEzbiz2G8f-RmeeADvzk0aY8YE",
        hours: 0,
        minutes: 0,
        seconds: 0,
        heartBeat: false,
        liveBuyOrderAmount: 0,
        userMessages: [],
        maxTradableAmount: 100000,
        placedAmountbyMining: 0,
        livePositionTotalCost: -1,
        counter: 0,
        AutoMode: false,
        orders: [],
        buyingPoint: ["LTP", "MARKET", "MAX"],
  
        targetPc: 1.1,
        livePositions: [],
        instrumentTokens: [],
        symbols: [],
        currentInstruments: [],
        displayingInstruments: [],
        instruments: [],
        ohlc: [],


 } 


   } 
,
methods:{ 

    getMisPricePointofScript( instrument_tocken )
    { 
try{ 
// return ;
// return instrument_tocken;

// return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.yesterday.high;;

//console.log( instrument_tocken )
//console.log( this.instruments.filter( i =>i.instrument_token == instrument_tocken ),'this.instruments.filter( i =>i.instrument_token == instrument_tocken )' )
// console.log( this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0],
// 'this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0]' );

if( this.instruments.filter( i =>i.instrument_token == instrument_tocken.length == 0 ))
{ 


 } 
let yesterdayHigh = 
this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
pricePoints.yesterday.high;


// return yesterdayHigh*1.2;
let type = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].instrument_type;
let name = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].name;

//.hourlyPricePoints( h =>h.h.high>1.1*yesterdayHigh

// return name+type;

if( name == 'BANKNIFTY' && type == 'FUT' ){ 

  let offset = 90;
 let reference =  yesterdayHigh+offset


return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
pricePoints.hourlyPricePoints.filter( l =>l.high>reference )[0].high



 } 




if( name == 'NIFTY' && type == 'FUT' ){ 

  let offset = 45;
 let reference =  yesterdayHigh+offset


return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.hourlyPricePoints.filter( l =>l.high>reference )[0].high






 }  else if(( type == 'CE' ||type == 'PE'  )){ 

  let offset = 1.5;
 let reference =  yesterdayHigh*offset
// return offset;


// return 1000;
if( typeof this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0]!= 'undefined' )
if( typeof this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints!= 'undefined' )
if( typeof this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.
hourlyPricePoints!= 'undefined' )
if( typeof this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.
hourlyPricePoints.filter( l =>l.high>reference )[0]!= 'undefined' )

// return 1000;


{ 
let lows = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
pricePoints.
hourlyPricePoints.

filter( l =>l.low>reference ).map( a =>a.low ).

sort( 
( a,b ) =>a-b


 )[0]


///if hourly price poits is absent multiply with ref and set target

let highs = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
pricePoints.
hourlyPricePoints.

filter( l =>l.high>reference ).map( a =>a.high ).

sort( 
( a,b ) =>a-b


 )[0]
// console.warn( lows,'lows' )

// return highs +',' + lows;
let target = Math.min( lows,highs )





  if( isNaN( target )){ 

   return  this.livePositions.
  filter( lp =>lp.instrument_token == instrument_tocken )[0]
  .average_price*1.2
   } 

 // return 'lows'
return target.toFixed( 1 );


return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.
hourlyPricePoints.

filter( l =>l.high>reference )[0].low


 } else{ 

if( typeof this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
yesterday == 'undefined'  || this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
yesterday.rangeBreakOutTarget == 'undefined' ){ 

// return instrument_tocken+'it';


let bo = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
pricePoints.yesterday.rangeBreakOutTarget;

return bo.toFixed( 2 );
  return this.livePositionsSelected.
  filter( lp =>lp.instrument_token == instrument_tocken )



 } else{ 
let ret = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
yesterday.rangeBreakOutTarget;
  if( isNaN( ret )){ 
//return 'nan'
   return  this.livePositionsSelected.
  filter( lp =>lp.instrument_token == instrument_tocken )[0].
  average_price*1.2
   } 
  

  //return 'avg'
  return ret.tofixed( 1 );

 } 

 } 




 } 


 }  catch( e ){ 


let tradingsymbol = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].tradingsymbol
console.log( e,'mis target error for ',tradingsymbol )
  return 1000
 } 




 } ,

    async  placetargetAndStopLoss( CurrentInstrument, instrument_token,
        element,product,quantity ) { 
   
   
   
   let misTarget = this.getMisPricePointofScript( instrument_token )
   let trailingStopLoss = this.getTrailingStopLoss( instrument_token );
   let sl = Math.max(  CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
           CurrentInstrument.pricePoints.d1.low,trailingStopLoss );
   
       //   console.log( 'pl target',
       //   CurrentInstrument.tradingsymbol,
       //  ' misTarget',misTarget,'trailingStopLoss',trailingStopLoss,
       //  'last price',element.last_price
       //    )
   
   if( 
       element.tradingsymbol == 'INDHOTEL22JUN230CE' ||
       element.tradingsymbol == 'BAJFINANCE22JUN5900CE'
       
        ){ 
   
         console.log( element.tradingsymbol,'lp2',element.ltp,
         'CurrentInstrument.buyNow',CurrentInstrument.buyNow )
        } 
   
   
         if ( CurrentInstrument.instrument_type  ==  "FUT" ) { 
   
           return false;
           this.ProcedureForFuturesTargetAndStopLoss( 
             CurrentInstrument,
             instrument_token,
             element
            );
   
           return true;
          }  //// procedure for futures  end here
   
         // if ( 
         //   CurrentInstrument.last_price >
         //   CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget 
         //  ) 
   
   if( quantity<0 ){ 
   
     this.procedureForOptionsShortCovering( CurrentInstrument, 
     instrument_token,
        element,product,quantity );
     return false
    } 
   
   
         
         if ( 
           CurrentInstrument.last_price >= 
           misTarget 
          ) 
         
         
         { 
           // if ( 
           //   CurrentInstrument.last_price >
           //   CurrentInstrument.average_price*1.12
           //  )
   
           //  if ( 
           //              true
           //              )
           // if ( 
           //               CurrentInstrument.last_price >
           //               CurrentInstrument.pricePoints.yesterday.high*1.02
           //              )
   
           let trade  =  `Target hit at  ${ CurrentInstrument.tradingsymbol }  at
            ${ misTarget } `;
   
   
    let trade1 = { 
   
           'type':'Target',
           
           'tradingsymbol':CurrentInstrument.tradingsymbol,
           'entry_price':CurrentInstrument.pricePoints.yesterday.high,
           'target':misTarget,
           'stoploss': Math.max(  CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),CurrentInstrument.pricePoints.d1.low )
         
          } 
   
         let trade2 = JSON.stringify( trade1 )
   
   
   
            this.writeTrades( trade2+',' );
           this.sendToTelegramGroup( trade );
           this.userMessages.push( trade );
           ////target buys
   
           //                                 var audio  =  new Audio( '/sounds/mixkit-sci-fi-confirmation-914.wav' );
           // audio.play(  );
   
           let transaction_type  =  "SELL";
   
           let tradingsymbol  =  CurrentInstrument.tradingsymbol;
   
           let lot_size  =  CurrentInstrument.lot_size;
           let order_type  =  "LIMIT";
   
           let priceBuy2  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
             .price;
   
         ;
     console.log( priceBuy2, "priceBuy2* avg*1.1",CurrentInstrument.average_price )
   
           if ( priceBuy2 > CurrentInstrument.average_price * 1.1 ) { 
             //  console.log( 'priceBuy1','priceBuy2',priceBuy2 )
             //  let Price = Math.round( CurrentInstrument.SevenDayMaxMin.Max*1.1,1 );
             let Price  =  priceBuy2;
             // let product = 'NRML'
   
             let arr  =  this.buildOrderArray( 
               tradingsymbol,
               transaction_type,
   
               lot_size,
               order_type,
               Price,product
              );
   
             // console.log( arr );
   
   
   
   
             let orderArray  =  [arr];
   
             // this.orderArray.push( orderArray );
   
             console.log( 
               "order array inside tgtsl fn",
               JSON.stringify( this.orderArray )
              );
   
             console.log( trade, "firing target", "@", Price );
   
             let a  =  await this.placeOrder( orderArray );
   
          
   
             this.userMessages.push( trade );
            
            
           //  this.$set( 
           //     this.instruments.filter( 
           //       ( i )  => i.instrument_token  ==  instrument_token
           //      )[0],
           //     "PlacedReverseOrder",
           //     true
           //    );
   
             this.$set( 
               this.instruments.filter( 
                 ( i )  => i.instrument_token  ==  instrument_token
                )[0],
               "PlacedReverseOrderType",
               "Target"
              );
            } 
          }  else if ( 
           CurrentInstrument.last_price <  
           Math.max(  CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
           CurrentInstrument.pricePoints.d1.low,trailingStopLoss )
          ) { 
   
           
           
           let trade  =  `Sl hit  ${ CurrentInstrument.tradingsymbol }  at 
         
         
         ${ sl } `;
   
           // this.sendToTelegramGroup( trade );
   
           //target sells
   
           //    var audio  =  new Audio( '/sounds/mixkit-sci-fi-confirmation-914.wav' );
           // audio.play(  );
   
           let transaction_type  =  "SELL";
   
           let tradingsymbol  =  CurrentInstrument.tradingsymbol;
   
           let lot_size  =  CurrentInstrument.lot_size;
           // lot_size = 0;
           let order_type  =  "LIMIT";
   
           let priceBuy2  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
             .price;
   
           //  let Price = Math.round( CurrentInstrument.SevenDayMaxMin.Max*.9,1 );
           let Price  =  priceBuy2;
   
           // let product = 'NRML'
   
           let arr  =  this.buildOrderArray( 
             tradingsymbol,
             transaction_type,
   
             lot_size,
             order_type,
             Price
            );
   
           console.log( "stop loss array below" );
           console.log( JSON.stringify( arr ));
   
           let orderArray  =  [arr];
   
            let a  =  await this.placeOrder( orderArray );
   
            this.orderArray.push( orderArray );
  
           console.log( 
             "order array inside tgtsl fn",
             JSON.stringify( this.orderArray )
            );
   
           console.log( trade, "firing stop loss", "@", Price );
   
   
            let trade1 = { 
   
           'type':'stoploss',
           
           'tradingsymbol':CurrentInstrument.tradingsymbol,
           'entry_price':CurrentInstrument.pricePoints.yesterday.high,
           'target':CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
           'stoploss': sl
         
          } 
   
         let trade2 = JSON.stringify( trade1 )
   
           this.writeTrades( trade2+',' );
   
           console.log( trade, "firing stop loss" );
   
           // this.$set( 
           //   this.instruments.filter( 
           //     ( i )  => i.instrument_token  ==  instrument_token
           //    )[0],
           //   "PlacedReverseOrder",
           //   true
           //  );
   
           this.$set( 
             this.instruments.filter( 
               ( i )  => i.instrument_token  ==  instrument_token
              )[0],
             "PlacedReverseOrderType",
             "Stop Loss"
            );
          }  else { 
   
   
           // console.warn( 
           //   "No target or stop for",
           //   CurrentInstrument.tradingsymbol,
           //   "stop loss",
           //    sl,
           //   "Target",
           //  misTarget,
           //   "Last price",
           //   CurrentInstrument.last_price
           //  );
   
           // this.userMessages.push( 'No target or stop for ',CurrentInstrument.tradingsymbol,'stop loss',CurrentInstrument.pricePoints.yesterday.high*.9  )
          } 
        } ,
   
    async proceedForBuy( instrument_token, CurrentInstrument, element ) { 

        if( this.otherCriteria( element,CurrentInstrument  ) == false ){ 
          return false
         } 
        
        
              if( this.hours>= 15 && this.minutes>10 ){ 
        
        
                console.log( 'No buying after 15:10 hrs' );
        
                // return false;
               } 
        
        
              if( this.livePositionTotalCost == -1 ){ 
        
        // console.log( 'Positions not loaded properly' )
                return false;
               } 
        
        
              if( this.liveOrders == 0 ){ 
        
        
        // console.log( 'liver orders  not loaded properly returning', this.liveOrders )
        
        // let o = await this.getOrders(  );
        // console.log( o,'refreshing live orders' )
                // return false;
        
               } 
        
        
        
        let ln = this.liveOrders.filter( lo =>lo.instrument_token
         == instrument_token ).length
        
        if( ln>0 ){ 
        
          // console.log( 'live order palced already for this symbol',CurrentInstrument.tradingsymbol )
        return false;
        
         } 
        
        
        let proposedStock = this.instruments.
        filter( i =>i.instrument_token == instrument_token )[0].name
        // console.log( proposedStock,'proposedStock' );
        
        
        if( this.liveOrderPlacedScripts.includes( proposedStock )){ 
        
          // console.log( proposedStock,
          // 'stock already holding ordered' )
        
        return false
         } 
        
        
        
        // if( this.proosed )
        
        
        if( this.liveOrderScripts.includes( proposedStock )){ 
        
        // console.log( proposedStock,'stock has live order ',CurrentInstrument.tradingsymbol )
        
        return false
        
         } 
        
        if( this.livePositionScripts.includes( proposedStock )){ 
        
          
        
        // console.log( proposedStock,'stock already holding' )
        
        return false
        
         } 
        
        
        
        let hasHit = this.hasAlreadyHitTargetBefore( element );
        if( hasHit ){ 
        
           return true;
         } 
        
             
              this.proposedBuyAmount  =  0;
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  instrument_token
                 )[0],
                "buyNow",
                true
               );
        
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  instrument_token
                 )[0],
                "PlacedReverseOrder",
                false
               );
        
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  instrument_token
                 )[0],
                "seletedBuyingMethod",
                "MAX"
               );
        
              let date  =  new Date(  );
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  instrument_token
                 )[0],
                "activatedTime",
                date
               );
        
              /// trigger buy
        
              // let trade  =  `Buy instrument ${ CurrentInstrument.tradingsymbol }  at ${ CurrentInstrument.SevenDayMaxMin.Max } `;
              let trade  =  `Buy instrument ${ CurrentInstrument.tradingsymbol }  at ${ CurrentInstrument.pricePoints.yesterday.high }  . 
              Target ${ CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget }  
              Strict stop loss at ${ 
                
        
                Math.max(  CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),CurrentInstrument.pricePoints.d1.low )
               
                
                
                 }  ,
              TargetProfit ${ ( CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget-CurrentInstrument.pricePoints.yesterday.high )*CurrentInstrument.lot_size } 
              Possible Loss ${ ( CurrentInstrument.pricePoints.yesterday.high-CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ))
              
              *CurrentInstrument.lot_size } 
              `;
        
              
              let trade1 = { 
        
                'type':'Entry',
                
                'tradingsymbol':CurrentInstrument.tradingsymbol,
                'entry_price':CurrentInstrument.pricePoints.yesterday.high,
                'target':CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
                'stoploss': Math.max(  CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),CurrentInstrument.pricePoints.d1.low )
              
               } 
        
              let trade2 = JSON.stringify( trade1 )
        
              this.sendToTelegramGroup( trade );
              this.writeTrades( trade2+',' );
        
              //checking the trade exeeds the maximum tradable amount   add live palced buy order in nfo
        
              // if( this.livePositionTotalCost<this.maxTradableAmount ){ 
        
              
              
              if ( CurrentInstrument.instrument_type  ==  "FUT" ) { 
                console.log( "its a future" );
                var audio1  =  new Audio( "/sounds/mixkit-sci-fi-confirmation-914.wav" );
                audio1.play(  );
        
                let transaction_type  =  "BUY";
                let tradingsymbol  =  CurrentInstrument.tradingsymbol;
        
                let lot_size  =  CurrentInstrument.lot_size;
        
                let order_type  =  "LIMIT";
        
                let Price  =  CurrentInstrument.pricePoints.yesterday.high;
                let priceSell1  =  element.depth.sell.sort(( a, b )  => a.price - b.price )[0]
                  .price;
        let product = 'NRML'
                let arr  =  this.buildOrderArray( 
                  tradingsymbol,
                  transaction_type,
        
                  lot_size,
                  order_type,
                  Price,product
                 );
        
                console.log( arr, "FUTURE" );
        
                let orderArray  =  [arr];
        
                let a  =  await this.placeOrder( orderArray );
                console.log( "placed order result", a );
        
                this.counter  =  this.counter + 1;
                console.log( 
                  "Placing Buy Order for :",
                  tradingsymbol,
                  this.counter,
                  CurrentInstrument.buyNow,
                  CurrentInstrument
                 );
               }  else if ( 
                CurrentInstrument.instrument_type  ==  "CE" ||
                CurrentInstrument.instrument_type  ==  "PE"
               ) { 
                this.proposedBuyAmount  = 
                  CurrentInstrument.pricePoints.yesterday.high *
                  CurrentInstrument.lot_size;
        
                console.log( 
                  "Proposed amount ",
                  this.proposedBuyAmount,
                  "for",
                  CurrentInstrument.tradingsymbol
                 );
                if ( this.liveTradablebalance > 0 ) { 
                  var audio  =  new Audio( "/sounds/mixkit-sci-fi-confirmation-914.wav" );
                  audio.play(  );
        
                  let transaction_type  =  "BUY";
        
                  let tradingsymbol  =  CurrentInstrument.tradingsymbol;
        
                  let lot_size  =  CurrentInstrument.lot_size;
                  //let lot_size = 0;
                  let order_type  =  "LIMIT";
        
                  //  let price1 =   element.depth.sell.sort(( a,b ) =>a.price-b.price )[0]
                  //  let price2 =   element.depth.sell.sort(( a,b ) =>b.price-a.price )[0]
        
                  //  console.log( 'sell price 1',price1,'sell price 2',price2 )
        
                  let priceBuy2  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
                    .price;
        
                  let priceSell1  =  element.depth.sell.sort( 
                    ( a, b )  => a.price - b.price
                   )[0].price;
        
                  //  console.log( priceSell1,'priceSell1',priceSell2,'priceSell2' );
        
                  //  console.log(  )
        
                  //  let Price = priceSell1;
                  let Price  =  CurrentInstrument.pricePoints.yesterday.high;
        
                  let currentPrice  =  lot_size * Price;
                  this.totalBuyOrderLivePlacedBySoftware  = 
                    this.totalBuyOrderLivePlacedBySoftware + currentPrice;
        
                  this.proposedBuyAmount  =  0;
                  //  let Price = priceSell1;
        let product = 'NRML'
                  let arr  =  this.buildOrderArray( 
                    tradingsymbol,
                    transaction_type,
        
                    lot_size,
                    order_type,
                    Price,product
                   );
        
                  // console.log( arr );
        
                  let orderArray  =  [arr];
        
                  let a  =  await this.placeOrder( orderArray );
                  // console.log( "place order result", a );
        
                  this.counter  =  this.counter + 1;
                  console.log( 
                    "Placing Buy Order for :",
                    tradingsymbol,
                    this.counter,
                    CurrentInstrument.buyNow,
                    CurrentInstrument
                   );
        
                  this.userMessages.push( 
                    "firing of auto mode+ buy now false",
                    this.counter,
                    CurrentInstrument.buyNow,
                    CurrentInstrument
                   );
                 }  else { 
                  this.userMessages.push( "Maximum tradable amout Exceeded" );
                  console.log( "Maximum tradable amout Exceeded" );
                 } 
               } 
             } ,

    getStopLoss( instrument_token ){ 


        try{ 
        let CurrentInstrument = this.instruments.filter( i =>i.instrument_token == instrument_token )[0];
         return Math.max( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
         CurrentInstrument.pricePoints.d1.low )
         
        
         } catch( e ){ 
        
          return 1000;
         } 
          
  
         } ,
            getMisPricePointofScript( instrument_tocken ){ 
        try{ 
        // return ;
        // return instrument_tocken;
        
        // return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.yesterday.high;;
        
        //console.log( instrument_tocken )
        //console.log( this.instruments.filter( i =>i.instrument_token == instrument_tocken ),'this.instruments.filter( i =>i.instrument_token == instrument_tocken )' )
        // console.log( this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0],
        // 'this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0]' );
        
        if( this.instruments.filter( i =>i.instrument_token == instrument_tocken.length == 0 ))
        { 
        
        
         } 
        let yesterdayHigh = 
        this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
        pricePoints.yesterday.high;
        
        
      
        let type = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].instrument_type;
        let name = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].name;
        
       
        if( name == 'BANKNIFTY' && type == 'FUT' ){ 
        
          let offset = 90;
         let reference =  yesterdayHigh+offset
        
        
        return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].
        pricePoints.hourlyPricePoints.filter( l =>l.high>reference )[0].high
        
        
        
         } 
        
        
        
        
        if( name == 'NIFTY' && type == 'FUT' ){ 
        
          let offset = 45;
         let reference =  yesterdayHigh+offset
        
        
        return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.hourlyPricePoints.filter( l =>l.high>reference )[0].high
        
        
        
        
        
        
         }  
        
        
        
         }  catch( e ){ 
        
        
        let tradingsymbol = this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].tradingsymbol
        console.log( e,'mis target error for ',tradingsymbol )
          return 1000
         } 
        
        
        
        
         } ,



    ProcedureForFuturesTargetAndStopLoss( 
        CurrentInstrument,
        instrument_token,
        element
       ) { 
  let misTarget = this.getMisPricePointofScript( instrument_token )
  
  
        console.log( 
          `Target for ${ CurrentInstrument.tradingsymbol }  is ${ 
            CurrentInstrument.average_price + 90
           }  and Stop loss is ${ CurrentInstrument.average_price - 45 }  and cmp is ${ 
            CurrentInstrument.last_price
           } `
         );
  
  
        // if ( CurrentInstrument.last_price > CurrentInstrument.average_price + 90 )
        if ( CurrentInstrument.last_price >= misTarget )
        
        
        
        { 
          let trade  =  `Target hit at  ${ CurrentInstrument.tradingsymbol }  at ${ 
            CurrentInstrument.average_price * 90
           } `;
  
  
  
        
  
  
  
  
  
  
  
  
  
  
          let transaction_type  =  "SELL";
  
          let tradingsymbol  =  CurrentInstrument.tradingsymbol;
  
          let lot_size  =  CurrentInstrument.lot_size;
          let order_type  =  "LIMIT";
  
          let priceBuy2  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
            .price;
          let Price  =  priceBuy2;
          let product = 'NRML'
  
          let arr  =  this.buildOrderArray( 
            tradingsymbol,
            transaction_type,
  
            lot_size,
            order_type,
            Price,product
           );
  
          // console.log( arr );
  
          let orderArray  =  [arr];
  
          this.orderArray.push( orderArray );
         
  
          this.$set( 
            this.instruments.filter( 
              ( i )  => i.instrument_token  ==  instrument_token
             )[0],
            "PlacedReverseOrderType",
            "Target"
           );
  
          //target
         } 
  
        if ( CurrentInstrument.last_price < CurrentInstrument.average_price - 45 ) { 
          //stop loss
          this.writeTrades( trade );
  
          /////////////////////////sl
  
          let trade  =  `Sl hit  ${ CurrentInstrument.tradingsymbol }  at ${ 
            CurrentInstrument.average_price - 45
           } `;
  
          // this.sendToTelegramGroup( trade );
  
          //target sells
  
          //    var audio  =  new Audio( '/sounds/mixkit-sci-fi-confirmation-914.wav' );
          // audio.play(  );
  
          let transaction_type  =  "SELL";
  
          let tradingsymbol  =  CurrentInstrument.tradingsymbol;
  
          let lot_size  =  CurrentInstrument.lot_size;
          let order_type  =  "LIMIT";
  
          let priceBuy2  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
            .price;
  
          let Price  =  priceBuy2;
  
          let product = 'NRML'
  
          let arr  =  this.buildOrderArray( 
            tradingsymbol,
            transaction_type,
  
            lot_size,
            order_type,
            Price,product
           );
  
          console.log( "stop loss array below" );
          console.log( JSON.stringify( arr ));
  
          let orderArray  =  [arr];
  
          this.orderArray.push( orderArray );
  
          //  console.log( 'order array inside tgtsl fn',JSON.stringify( this.orderArray ))
  
          console.log( trade, "firing stop loss", "@", Price );
  
          this.writeTrades( trade );
  
     
  
          // this.$set( 
          //   this.instruments.filter( 
          //     ( i )  => i.instrument_token  ==  instrument_token
          //    )[0],
          //   "PlacedReverseOrder",
          //   true
          //  );
  
          this.$set( 
            this.instruments.filter( 
              ( i )  => i.instrument_token  ==  instrument_token
             )[0],
            "PlacedReverseOrderType",
            "Stop Loss"
           );
  
          /////////////////////////sl
         } 
       } ,


 } 

 } 