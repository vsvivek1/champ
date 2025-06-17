<template>
  <div>
    {{  holdings[0]  }} this.holdings 22

    <span class="text-danger">{{  lowCounts  }} </span>

    <hr>

    {{ holdingLength }}  loading

    <button @click="filterStocksLessThanYesterdayLow">
      <span>mdi-circle</span>
    </button>

    <table class="table table-bordered table-hover table-combact">
      <thead>
        <th>Symbol</th>
        <th>Qty</th>
        <th>Avg</th>
        <th>LTP</th>
        <th>Y'day LOW</th>
        <th>P/L</th>
        <th>select</th>
      </thead>
      <tbody>
        <tr
          :class="{  'bg-danger': holding.lowerLow  ==  true  } "
          v-for="( holding, index ) in holdingsFiltered"
          :key="index"
        >
          <td>{{  holding.tradingsymbol  }} </td>
          <td>{{  holding.average_price  }} </td>
          <td>{{  holding.quantity + holding.t1_quantity  }} </td>
          <td>{{  holding.last_price  }} </td>
          <td>{{  holding.yesterdayLow  }} </td>
          <td>{{  holding.pnl  }} </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {  io  }  from "socket.io-client";
//  import pricePointMixin from './pricePointMixin'

const socket = io( "http://localhost:4000" );
import axios from "axios";
import ServerCallMixins from "./ServerCallMixins";
import sessionMixin from "@/views/sessionMixin";
export default { 
  mixins: [sessionMixin, ServerCallMixins],
  name: "StopLoss",

  mounted(  ) { 
    this.getHoldings(  ).then(( r ) => { 
      this.holdingsFiltered = [...this.holdings];

      this.getOrders(  );

      
     }  );

    socket.on( "send-realtime-subscription", ( s ) => { 
    //   console.clear(  );
      this.mutateHoldingsWithLtp( s ); /// function for mutating orders with real time lTP

      this.filterStocksLessThanYesterdayLow(  );
     }  );
   } ,

  unmounted(  ) { 
    socket.disconnect(  );

    socket.emit( "forceDisconnect" );
   } ,
  data(  ) { 
    return { 

      holdingLength:0,
      previousDayCandle: {  } ,

      holdings: [],
      holdingsFiltered: [],
      lowCounts: 0,
      lowerLows: [],
      orders: [],
      OrdersTobeModified: [],
     } ;
   } ,

  methods: { 
    invokePricePoints(  ) { 

this.holdingLength=this.holdings.length;
      this.holdings.forEach( async ( e ) => { 
        
        setTimeout( async (  )=>{ 

          let pp = await this.getPricePoints( 
          e.instrument_token,
          this.accessToken
         );

this.holdingLength=this.holdingLength-1;
this.$set( e,'pricePoints',pp )

        console.log( "pricepoints", pp );
         } ,200 )
        
        
       }  );
     } ,

    getPricePoints( inst_token, acces_token = this.accessToken ) { 
      // let inst_token1=1207553;

      const url =
        "/api/pricePoints/" + inst_token + "/accessToken/" + acces_token;

      // let timeout=333;
      // setTimeout((  ) => { 

      // console.log( 'price fired  ' )
      return axios.get( url ).then(( res ) => { 
        return res.data;
        this.pricePoints = res.data.pricePoints;

        this.pivotPoints = res.data.pivotPoints; //json

        this.pivotPointObject = res.data.pivotPointObject;
        this.yesterday = res.data.yesterday;
        // console.log( 'price point from mixin',this.pricePoints );
       }  );

      //  } , timeout );
     } ,

    mutateHoldingsWithLtp( s ) { 
    //   console.clear(  );

      s.forEach(( element ) => { 
        let instrument_token = element.instrument_token;

        let ln = this.holdings.filter( 
          ( o ) => o.instrument_token  ==  instrument_token
         ).length;
        let last_price = element.last_price;

        if ( ln > 0 ) { 
          this.holdingsFiltered
            .filter(( o ) => o.instrument_token  ==  instrument_token )
            .forEach(( e ) => { 
              e.last_price = last_price;

              //   console.log( 'this.holdings.filter( o=>o.instrument_token == instrument_token )',
              this.holdingsFiltered.filter( 
                ( o ) => o.instrument_token  ==  instrument_token
               ).length;

              //  console.log( 'e',e )

              // this.$set( e,'last_price',last_price );
              // this.$set( e,'live_gain',last_price );
             }  );
         } 
       }  );
     } ,
    updateOrder(  ) { 
      let ordersString = JSON.stringify( this.OrdersTobeModified );
      //   console.log( 'ordersString=',ordersString )

      // return false;
      let params = {  } ;
      params.accessToken = this.accessToken;
      params.ordersString = ordersString;
      let url = "/api/modifyOrders";

      axios.post( url, params ).then(( res ) => { 
        // console.log( 'orders modify reply',res.data )

        this.getOrders(  ); //refreshing orders
       }  );
     } ,

    getOrdersTobeModified(  ) { 
      // console.log( 'this.orders',this.orders )

      this.orders.forEach(( order ) => { 
        // console.log( this.lowerLows,order.instrument_token )

        let lowerLow = this.lowerLows.filter( 
          ( e ) => e.instrument_token  ==  order.instrument_token
         );

        // console.log( 'lowerLow',lowerLow )

        let ln = lowerLow.length;

        if ( ln > 0 ) { 
          let o = {  } ;
          o.variety = order.variety;
          o.variety = "amo";
          o.order_id = order.order_id;
          let params = {  } ;
          // let qry=order.exchange+":"+i.tradingsymbol;
          // let newPrice=this.ltps[qry];
          params.price = lowerLow[0].last_price;

          o.params = params;

          this.OrdersTobeModified.push( o );
         } 
       }  );
     } ,

    subscribeToScripts(  ) { 
      let st = new Set(  );

      this.orders.forEach(( o ) => { 
        st.add( o.instrument_token );
       }  );

      socket.emit( "subscribe-orders", JSON.stringify( Array.from( st )) );
     } ,

    getOrders(  ) { 
      let url = "/api/getOrders/" + this.accessToken;

      axios.get( url ).then(( res ) => { 
        res.data.forEach(( r ) => ( r.selected = false ));
        this.orders = res.data.filter(( o ) => { 
          //   return true;
          return ( o.transaction_type = "SELL" );
          // return o.status == "OPEN" || o.status == "TRIGGER PENDING"
         }  );

        this.subscribeToScripts(  );
       }  );
     } ,

    //get orders and modify it with ltp

    //if no orders place new order to sell

    async filterStocksLessThanYesterdayLow(  ) { 



      this.lowerLows = [];
      this.lowCounts = 0;

      let ln = this.holdings.length;
      this.holdings.forEach( async ( e ) => { 
        let candle = await this.getCandleDetails( e.instrument_token );

        let yesterdayLow = candle.low;

        // console.log( 'yesterdayLow',yesterdayLow )
        this.$set( e, "yesterdayLow", yesterdayLow );

        if ( e.last_price < yesterdayLow ) { 
          this.$set( e, "lowerLow", true );

          // console.log( 'e.instrument_token',e.instrument_token )

          let instrument = {  } ;
          instrument.instrument_token = e.instrument_token;
          instrument.last_price = e.last_price;

          this.lowerLows.push( instrument );

          this.lowCounts = this.lowCounts + 1;
         }  else { 
          this.$set( e, "lowerLow", false );
         } 

        ln = ln - 1;
        if ( ln  ==  0 ) { 
          this.getOrdersTobeModified(  );

          //  this.updateOrder(  );
         } 

        // console.log( 'candle',candle,'yday low',yesterdayLow )
       }  );

      //  console.log( 'new order',this.OrdersTobeModified );

      // this.updateOrder(  );

this.invokePricePoints(  );

     } ,
    async getCandleDetails( symbol ) { 
      let currentDate = new Date(  );

      let hrs = currentDate.getHours(  );
      ///if on a market day after opening

      // console.log( hrs,'hrs' )
      if (( hrs ) => 9 && hrs < 16 ) { 
        var d1 = new Date(  );
        d1.setDate( d1.getDate(  ) - 2 );
        d1.setHours( 9 );
        d1.setMinutes( 15 );
        d1.setSeconds( 0 );
       }  else if ( hrs > 16 || hrs < 9 ) { 
        var d1 = new Date(  );
        d1.setDate( d1.getDate(  ) - 1 );
        d1.setHours( 9 );
        d1.setMinutes( 15 );
        d1.setSeconds( 0 );
       } 

      //if after closing market

      // console.log( 'd1',d1 )
      //   let lastTradingDay=d1.toISOString(  ).split( 'T' )[0];

      let lastTradingDay = d1.toLocaleString( "sv" );
      let FromDate = lastTradingDay.split( " " )[0];

      var d2 = new Date(  );
      d2.setDate( d2.getDate(  ) - 1 );
      d2.setHours( 15 );
      d2.setMinutes( 30 );
      d2.setSeconds( 0 );

      let ToDate = d2.toLocaleString( "sv" ).split( " " )[0];

      // console.log( 'astTradingDay',lastTradingDay )

      let intervel = "day";
      let candles = await this.getHistoricalData( 
        this.accessToken,
        symbol,
        FromDate,
        ToDate,
        intervel
       );

      // console.log( 'candles111',candles )

      return candles[0];
      this.previousDayCandle = candles[0];

      //   this.EntryPointShortSide= this.previousDayCandle.low
      //  this.EntryPointLongSide= this.previousDayCandle.high

      // this.rectangleRange=Math.min( Math.abs( this.EntryPointShortSide-this.EntryPointLongSide ),100 );

      //  this.targetShortSide=this.EntryPointShortSide-this.rectangleRange;

      // this.targetLongSide=this.EntryPointLongSide+this.rectangleRange;
      // console.log( 'candles',candles )
     } ,

    getHoldings(  ) { 
      const url = "/api/holdings/" + this.accessToken;

      return axios.get( url ).then(( res ) => { 
        this.holdings = res.data;

        //   .sort(( a,b )=>{ 
        //         return a.pnl-b.pnl
        //      }  )
       }  );
     } ,

    getHoldingsWithLtpBelowYesterdayCandle(  ) {  } ,

    placeOrder(  ) {  } ,
   } ,
 } ;
</script>

<style  scoped>
</style>