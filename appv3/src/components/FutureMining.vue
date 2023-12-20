<template>
    <div>


        <table class="table table-borderd table-stripped table-hover">
            <thead>
                <th>#</th>
                <th>Symbol</th>
                <th>LTP</th>
                <th></th>
                <th></th>
            </thead>
            <tbody>

               
                <tr v-for="( instrument,index ) in instruments" :key="index">
                 <td>{{ index+1 }} </td>
                    <td>
<a :href="instrument.pricePoints.chart">
{{ instrument.tradingsymbol }} 

</a>

                    </td>
                    <td>
{{ instrument.last_price }} 


                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
hi  lllxxxx 333 c

{{ instruments.length }} 

{{ instrument_tokens }} 
    </div>
</template>

<script>
import {  io  }  from "socket.io-client";
const socket = io( "http://localhost:4000" );
import axios from "axios";
import sessionMixin from "@/views/sessionMixin";

// let instru = require( "../../../instruments/instrumentsForMining.json" );
// import instru from "../../../instruments/instrumentsForMining.json" assert { type: 'json' } ; ;


l


let instru=axios.get( '../../../instruments/instrumentsForMining.json' ).then( r=>r.data );
console.log( instru );

let instruments=instru.filter( i=>( i.instrument_type == 'FUT' && i.exchange == 'NFO' ))
. filter(( e,index,arr )=>arr.indexOf( e ) == index )

    export default { 

        methods:{ 
mutateWithLtp( s ){ 

        let PriceReadyToBuy = element.depth.buy.sort(( a, b ) => b.price - a.price )[0]
            .price;

              let PriceReadyToSell= element.depth.sell.sort(( a, b ) => b.price - a.price )[0]
            .price;


            s.forEach(( element ) => { 
      

        let instrument_token = element.instrument_token;
       
      //  let last_price = element.last_price;
       let last_price = element.depth.buy.sort(( a, b ) => b.price - a.price )[0]
            .price;

       
       
       
       let average_price = element.average_price;

      
        let CurrentInstrument = this.instruments.filter( 
          ( i ) => i.instrument_token  ==  instrument_token
         )[0];

        if ( typeof CurrentInstrument  ==  "undefined" ) { 
          
          return false;
         } 

        if ( typeof CurrentInstrument.pricePoints  ==  "undefined" ) { 
          console.log( 
            typeof CurrentInstrument.SevenDayMaxMin,
            "CurrentInstrument.pricePoints",
            CurrentInstrument.tradingsymbol,
            CurrentInstrument.tradingsymbol
           );
          return false;
         } 

        if ( 
          typeof CurrentInstrument.pricePoints.SevenDayMaxMin  ==  "undefined"
         ) { 
          console.log( 
            typeof CurrentInstrument.pricePoints.SevenDayMaxMin,
            "typeof CurrentInstrument.SevenDayMaxMin1 pricePoints"
           );
          return false;
         } 

        if ( 
          typeof CurrentInstrument.pricePoints.SevenDayMaxMin.Max  ==  "undefined"
         ) { 
         
          return false;
         } 

        this.$set( 
          this.instruments.filter( 
            ( i ) => i.instrument_token  ==  instrument_token
           )[0],
          "previousPrice",
          this.instruments.filter( 
            ( i ) => i.instrument_token  ==  instrument_token
           )[0].last_price
         );


  this.instruments.filter( 
          ( i ) => i.instrument_token  ==  instrument_token
         )[0].last_price = last_price;


        //////////////////////////entry exit logic below
        var entryPoint, targetPoint;
        try { 
          //////////////////////////////checking y days  red candle or green candle

          // yester day Green candle
          //   buy at yesterday close and sell at next price point of  yesterday high or more

          if ( typeof CurrentInstrument.otherCriteria  ==  "undefined" ) { 
            // console.log( CurrentInstrument.tradingsymbol,CurrentInstrument.otherCriteria,'otehr criteria undefined' )
            return false;
           } 
          // console.log( CurrentInstrument.tradingsymbol,CurrentInstrument.otherCriteria,'otehr criteria undefined' )

          let hourlyPricePoints = this.hourlyPricePointsofLiveDay.filter( 
            ( i ) => i.instrument_token  ==  instrument_token
           );

          let yesterdayCandleColor =
            CurrentInstrument.otherCriteria.candleColor;

          if ( yesterdayCandleColor  ==  "green" ) { 
            entryPoint = element.ohlc.close;

            targetPoint = CurrentInstrument.pricePoints.d1.high - 0.15;
           }  else if ( yesterdayCandleColor  ==  "red" ) { 
            entryPoint = element.ohlc.open;


              

            targetPoint = CurrentInstrument.pricePoints.d1.high - 0.15; ///yesterdays closing point

         
           } 
         }  catch ( error ) { 
          console.log( error, "error target entry " );
          return false;
         } 

        /////entry exit logic ends

      

        let ls = {  } ;

        ls.tradingsymbol = CurrentInstrument.tradingsymbol;
        ls.ltp = last_price;
        ls.buyPoint = CurrentInstrument.pricePoints.d1.high;
        ls.target = CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;
        ls.stopLoss = CurrentInstrument.pricePoints.d1.low;

    
        let inst = this.instruments.filter( 
          ( i ) => i.instrument_token  ==  instrument_token
         )[0];

        if ( inst.previousPrice  ==  0 ) { 
          return false;
         } 

        if ( inst.previousPrice != 0 ) { 
           this.setcandleColour( inst,instrument_token )
         } 

        /////////////////////////////////////////////

        /////////////////////////////////////////////

        /////////////////auto mode false

        ////////////////////auto mode true

        // if ( this.AutoMode )

        // console.log( 'CurrentInstrument.buyNow',CurrentInstrument.buyNow )

        this.liveScript = ls;

        //////sl and target

        let ln = this.livePositions.filter( 
          ( lp ) => lp.instrument_token  ==  CurrentInstrument.instrument_token
         ).length;
if( !ln == 0 ){ 

        // console.log( 'this.live pos nit 0',CurrentInstrument.instrument_token,ln,CurrentInstrument.tradingsymbol )

 } 

        if ( ln > 0 ) { 
          let product = this.livePositions.filter( 
            ( lp ) => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].product;

          let livePnl = this.livePositions.filter( 
            ( lp ) => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].pnl;


       
let buy_price=this.livePositions.filter( 
            ( lp ) => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].buy_price;

          let buyQuantity=this.livePositions.filter( 
            ( lp ) => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].buy_quantity;
          



           let offerPrice = element.depth.buy.sort(( a, b ) => b.price - a.price )[0]
            .price;

            let p;



            let livePnlOffered=( offerPrice-buy_price )*buyQuantity;

            

           





          let quantity = this.livePositions.filter( 
            ( lp ) => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].quantity;
          
          //there is a live position

          //check whether already a reverse order placed

          let PlacedReverseOrder = this.instruments.filter( 
            ( i ) => i.instrument_token  ==  instrument_token
           )[0].PlacedReverseOrder;

          let hasLiveTarget = this.instruments.filter( 
            ( i ) => i.instrument_token  ==  instrument_token
           )[0].hasLiveTarget;







          if ( PlacedReverseOrder  ==  true || hasLiveTarget  ==  true ) { 

          

//// update sell order if below stop loss

if ( hasLiveTarget  ==  true ) //double checking whther ther is a live sell order
{ 
 /// various cases of order modification 1. stop loss triggering






      let twoHoursBefore = new Date(  );
      twoHoursBefore .setHours( twoHoursBefore. getHours(  ) - 2 );
let executionTime;
   if( typeof this.executedBuyOrdersTime.
              filter( i=>i.instrument_token == CurrentInstrument.instrument_token )[0] == 'undefined' ){ 


executionTime=moment(  ).format( 'Y-MM-DD 09:15:00' )


               } else{ 

  executionTime=this.executedBuyOrdersTime.
              filter( i=>i.instrument_token == CurrentInstrument.instrument_token )[0].exchange_update_timestamp;



               } 
if( !this.holdingScripts.includes( CurrentInstrument.tradingsymbol )){ 
this.holdingScripts.push( CurrentInstrument.tradingsymbol )

 } 



console.log( 'live pnl is %s and offred pnl is $s for %s ',livePnl,livePnlOffered,
CurrentInstrument.tradingsymbol )



livePnl=livePnlOffered
switch( true ){ 

// case true:


// break;

case ( livePnl>2000 && (( this.hours == 14 && this.hours>30  )|| this.hours>14 )   ):

 console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break;


  case ( livePnl>=1000 ):

 console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice )

  break;


case ( livePnl<= -2000 ):

 console.log( livePnl ,'loss trigering below 2 k ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false )

  break;


case ( livePnl>1000 ):

 console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

 this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break;


  case ( livePnl>500 ):

//  console.log( livePnl ,'livePnl trigger for 500 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice )

  break;



case (( twoHoursBefore - new Date( executionTime )) > 0 ):

 console.log( livePnl ,'livePnl trigger for 2 hr timer ',CurrentInstrument.tradingsymbol );

  // this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false )
break;




case ( CurrentInstrument.last_price<=CurrentInstrument.pricePoints.d1.low ):



this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false )


  break;

  case ( this.hours == 15 && this.minutes>=1 && this.hours == 15 && this.minutes<=3 ):

    console.log( CurrentInstrument.tradingsymbol,'updating to latest price' )

this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true )


  break;

   case ( this.hours == 12 && this.minutes>=25 && this.hours == 12 && this.minutes<=28 ):

this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true )


  break;


   case ( this.hours == 11 && this.minutes>=5 && this.hours == 11 && this.minutes<=8 ):

// this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true )


  break;



 } 




 } 






            return false;
           }  else { 
           

            this.placetargetAndStopLoss( 
              CurrentInstrument,
              instrument_token,
              element,
              product,
              quantity,
              targetPoint,
              livePnl,
              false
             );
           } 

         
         } 

        //////sl and target

        if ( CurrentInstrument.buyNow  ==  false ) { 
          //not triggred earlier
          
          if ( 
           
       inst.previousPrice <= entryPoint &&  CurrentInstrument.last_price >= entryPoint  
           ) { 
          
            this.proceedForBuy( 
              instrument_token,
              CurrentInstrument,
              element,
              entryPoint
             );
            return true;
           } 
         }  ///already palced order .... so check whte there is live position


     




        

       

        return;
       
       }  );
     } 






         } ,

        mounted(  ){ 

            console.log( this.instrument_tokens );
    socket.emit( "subscribe-future-mining", JSON.stringify( this.instrument_tokens ));

    socket.on( "future-mining-tick", ( s ) => { 

         console.log( s,'tick' )
      this.mutateWithLtp( s );

      this.CurrentTick = s;
     }  );



         } ,
computed:{ 
instrument_tokens(  ){ 

    return this.instruments.map( r=>parseInt( r.instrument_token )).
     filter(( e,index,arr )=>arr.indexOf( e ) == index )
    
 } 

 } ,
        data(  ){ 
return{ 
instruments:instruments,
refreshingStatus:false,

      holdingScripts:[],

      allOrders:[],
      executedOrders:[],
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

         } ,
        
         mixins: [sessionMixin],
        name:'FutureMining'
     } 
</script>

<style lang="scss" scoped>

</style>