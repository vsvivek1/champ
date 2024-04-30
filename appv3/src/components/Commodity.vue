<template>
  <div>


{{ instruments.map( a =>a.tradingsymbol ) }} instruments


    <v-alert v-if = "loadingHourlyTradingLows" type = "info">
      Loaiding Hourly candles
    </v-alert>
    <div class = "row">
      <!-- <div class = "col" style = "width: 50px; overflow-y: 'auto'">
        <LiveTickView :liveScript = "liveScript"></LiveTickView>
      </div> -->

      <div class = "col" style = "width: 50px; overflow-y: 'auto'">
        <LiveOrders :liveOrders = "liveOrders"></LiveOrders>
      </div>


   <v-chip>FORGONE :{{ totalForgone.toFixed( 1 ) }} 
   FORGONE TARGET :{{ totalForgoneFortarget.toFixed( 1 ) }} 
   FORGONE SL :{{ totalForgoneForStopLoss.toFixed( 1 ) }} 
   </v-chip>
      <div class = "col" style = "height: 300px; overflow: auto">
        <v-btn @click = "getLatestPricesOfClosedScripts(  )"
          >get latest prices</v-btn
        >
        Closed Trades
        <v-chip :color = "closedTradesScriptsPnl  > 0 ? 'green' : 'red'" class = "pb-2 mb-2">
          Profit and Loss of Closed positions {{  closedTradesScriptsPnl  }} 
        </v-chip>

        Total :{{  closedTradesScripts.length  }} 
        <!-- <ClosedTrades :closedTradesScripts = "closedTradesScripts"></ClosedTrades> -->

   
      </div>
    </div>

    <v-chip color = "green" title = "Current Check Digit">
      {{  CurrentCheckDigit  }} </v-chip
    >
    <v-chip color = "red" title = "Lagging Check Digit">{{ 
      laggingCheckDigit
     }} </v-chip>

    <v-chip color = "orange" v-if = "webSocketNotActive">
      Check Web Sockets
    </v-chip>



    <v-btn @click = "showModalForSquareOff(  )">
      square off selected
      <v-icon></v-icon>
    </v-btn>

    <button @click = "review(  )">review</button>

    <v-btn @click = "getOrders(  )">Refresh orders</v-btn>
    <v-btn @click = "refreshTradeStatus(  )">Refresh trade status</v-btn>

    <v-row class = "mt-1">
      <v-col>
        <v-row>
          <v-col>
            <v-chip>
              Live Position cost {{  livePositionTotalCost  }}  Live Buy order
              Amount {{  liveBuyOrderAmount  }}  &nbsp; Live Tradable Balance
              {{  liveTradablebalance  }} </v-chip
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-icon
          color = "red"
          v-if = "heartBeat"
          title = "if This symbol changes color switches between red and blue system is conencted to market"
        >
          mdi-heart
        </v-icon>

        <v-icon
          color = "green"
          v-if = "!heartBeat"
          title = "if This symbol changes color switches between red and blue system is conencted to market"
        >
          mdi-heart
        </v-icon>
      </v-col>
      <v-col>
        <img
          v-if = "chat_id < -1"
          src = "https://img.icons8.com/color/48/000000/twitter--v2.png"
        />
      </v-col>

      <v-col>
        <v-icon color = "blue">mdi-clock</v-icon> {{  hours  }} : {{  minutes  }}  :
        {{  seconds  }} 
      </v-col>

      <v-col>
        <v-btn
          @clck = "resetUserMessages(  )"
          small
          color = "red"
          title = "reset user messages"
        >
          <v-icon>mdi-power-cycle</v-icon>
        </v-btn></v-col
      >

      <v-col>
        <input
          title = "Maximum Tradable Amount"
          type = "text"
          class = "form-control"
          v-model = "maxTradableAmount"
          placeholder = "Maximum Tradable Amount"
        />
      </v-col>

      <v-col>
        <v-btn
          v-if = "!AutoMode"
          @click = "AutoMode  =  true"
          title = "Switch to Auto"
          icon
          color = "green"
        >
          <v-icon>mdi-send-clock-outline</v-icon> </v-btn
        ><v-btn
          v-if = "AutoMode"
          @click = "AutoMode  =  false"
          title = " Switch to Manual"
          icon
          color = "red"
        >
          <v-icon>mdi-send-lock</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- <div class = "user-messages" v-if = "userMessages.length">

   

     
      
     
      <ul>
        <li v-for = '( msg,index ) in userMessages' :key = "index">

          {{ msg }} 
        </li>
      </ul>


    </div> -->

    {{  instrumentsFiltered.length  }}  out of {{  instrumentTokens.length  }} 

    <!-- <input
      type = "text"
      class = "form-control"
      v-model = "targetPc"
      placeholder = "Enter the Target %"
    /> -->

    <div class = "row">
      <div class = "col offset">
        Positions

        <v-chip :color = "totalpnl > 0 ? 'green' : 'red'" class = "pb-2 mb-2">
          Profit and Loss of Live positions {{  totalpnl  }} 
        </v-chip>

        <v-chip
          :color = "closedTradesScriptsPnl > 0 ? 'green' : 'red'"
          class = "pb-2 mb-2"
        >
          Profit and Loss of Closed positions {{  closedTradesScriptsPnl  }} 
        </v-chip>

        <v-chip
          :color = "closedTradesScriptsPnl + totalpnl > 0 ? 'green' : 'red'"
          class = "pb-2 mb-2"
        >
          Total Profit and Loss {{  closedTradesScriptsPnl + totalpnl  }} 
        </v-chip>

        <table class = "table" v-if = "livePositions.length > 0">
          <thead>
            <th>Sl#</th>
            <th>Symbol</th>

            <th>AVG/QTY</th>
            <th>YDAY Sl</th>
            <th>STATUS</th>
            <th>TRAILING STOP LOSS</th>
            <th>Last Price</th>
            <th>TARGET</th>
            <th>Cur PNL</th>

            <th>ACTION</th>
          </thead>
          <tbody v-if = "livePositions.length > 0">
            <tr
              :class = "{ 
                'bg-warning': pos.quantity < 0,

                'bg-danger': pos.trailingStopLoss > pos.last_price,

                'bg-success':
                  pos.last_price >
                  getMisPricePointofScript( 
                    pos.instrument_token,
                    pos.instrument.pricePoints.d1.high
                   ),
               } "
              v-for = "( pos, index ) in livePositions"
              :key = "index"
            >
              <td>{{  index + 1  }} </td>
              <td>
               <!-- {{  pos.instrument.pricePoints.d1.high  }}  -->
                <!-- pos.instrument.pricePoints.d1.high {{  pos.instrument.pricePoints.d1 }}  -->

                <a
                  v-if = "typeof pos.instrument !=  'undefined'"
                  target = "_blank"
                  :href = "pos.instrument.chart"
                >
                  {{  pos.tradingsymbol  }} 
                </a>

                <span v-else>{{  pos.tradingsymbol  }} </span>
              </td>

              <td>
                {{  pos.average_price  }}  <br>
                <small class = "text-danger">
                  <v-chip> Qty {{  pos.quantity  }} </v-chip>
                </small>
              </td>
              <TD>
                <span v-if = "typeof pos.instrument !=  'undefined'">
                  {{  getStopLoss( pos.instrument_token )  }} 
                </span>
              </TD>

              <td>
                {{  getStatus( pos.instrument_token )  }} 
              </td>

              <td
                :class = "{ 
                  'bg-warning':
                    pos.trailingStopLoss  ==  getStopLoss( pos.instrument_token ),
                 } "
              >
                <span v-if = "typeof pos.instrument !=  'undefined'">
                  {{  pos.trailingStopLoss  }} 
                </span>

                <small
                  :class = "{ 
                    'text-danger':
                      ( pos.trailingStopLoss - pos.average_price ) *
                        pos.quantity <
                      0,
                    'text-success':
                      ( pos.trailingStopLoss - pos.average_price ) *
                        pos.quantity >= 
                      0,
                   } "
                  >{{ 
                    ( pos.trailingStopLoss - pos.average_price ) * pos.quantity
                   }} </small
                >
              </td>

              <td>{{  pos.last_price  }} </td>

              <!-- <td>
                <input
                  type = "text"
                  size = "5"
                  name = ""
                  id = ""
                  v-model = "pos.targetPc"
                />
                <input
                  style = "width: fit-content"
                  type = "text"
                  name = ""
                  id = ""
                  v-model = "pos.rangeBreakOutTarget"
                />
              </td> -->

              <td>
                {{ 
                  getMisPricePointofScript( 
                    pos.instrument_token,
                    pos.instrument.pricePoints.d1.high
                   )
                 }} 

                <small>
                  {{ 
                    ( 
                      (( getMisPricePointofScript( 
                        pos.instrument_token,
                        pos.instrument.pricePoints.d1.high
                       ) -
                        pos.average_price ) *
                        100 ) /
                      pos.average_price
                     ).toFixed( 2 )
                   }} 
                  %
                </small>

                <!-- <small
                  :class = "{ 
                    'text-success':( getMisPricePointofScript( pos.instrument_token,
                     pos.instrument.pricePoints.d1.high )              
                   -pos.average_price )*pos.quantity
                    
                    
                   
 >=  0,
                    'text-danger':                 
                      
                      ( getMisPricePointofScript( pos.instrument_token,
                       pos.instrument.pricePoints.d1.high )
                      
                      
                      -pos.average_price )*pos.quantity
 < 0,
                   } "
                >
                  {{                 
                  ( getMisPricePointofScript( pos.instrument_token, pos.instrument.pricePoints.d1.high )
                   
                   
                   -pos.average_price )*
                   pos.quantity


  }}  Rs {{  ( 
  
 ( getMisPricePointofScript( pos.instrument_token, pos.instrument.pricePoints.d1.high )
 
 
 -pos.average_price )*
                   pos.quantity*100/pos.buy_value ).toFixed( 2 ) }}  %
                </small> -->
              </td>

              <td>
                {{  pos.pnl.toFixed( 0 )  }} 

                <small
                  :class = "{ 
                    'text-success': pos.pnl >=  0,
                    'text-danger': pos.pnl < 0,
                   } "
                >
                  {{  (( pos.pnl * 100 ) / pos.buy_value ).toFixed( 2 )  }}  %
                </small>
              </td>

              <td>
                <v-icon
                  color = "blue"
                  v-if = "pos.hasLiveTarget"
                  title = "Live Target Exist"
                  >mdi-star</v-icon
                >

                <v-btn @click = "enableForEditng(  )" v-if = "pos.hasLiveTarget">
                  <v-icon class = "text-yellow">mdi-pencil</v-icon>
                  {{ pos.targetPrice }} 
                </v-btn>

                <v-btn @click = "CancelOrder(  )" v-if = "pos.hasLiveTarget">
                  <v-icon>mdi-circle</v-icon>
                </v-btn>

                <v-btn
                  color = "green"
                  title = "Set Target"
                  @click = "setTarget( pos )"
                  v-if = "!pos.hasLiveTarget"
                >
                  <v-icon>mdi-cube-send</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
        <hr />

        <!-- {{ livePositions }}  -->
      </div>
    </div>

    <div class = "row fixTableHead">
      <div class = "col">
        <table class = "table table bordered table-stripped">
          <thead>
            <th>Slno</th>
            <th>Stock</th>
            <!-- <th>Spot</th> -->
            <th>Strike</th>

            <th>tradingSymbol</th>
            <th>LTP</th>
            <th>Type</th>
            <th>Yesterday High</th>

            <th>Action</th>
          </thead>
          <tbody>
            <tr
              v-for = "( i, index ) in instrumentsFiltered"
              :key = "i.instrument_tocken"
            >
          
                <td>
                  {{  index + 1  }} 
                </td>
                <td>
                  {{  i.name  }} 

                  <div class = "row mt-2">
                    <div class = "col-xs mr-2">
                      <small>SPOT {{  i.spot_price  }} </small>
                    </div>
                    <div class = "col-xs mr-2">
                      <small>LOT {{  i.lot_size  }} </small>
                    </div>
                    <div class = "col-xs mr-2"></div>
                  </div>
                </td>

                <td>{{  i.strike  }} </td>

                <td>
                  <a target = "_blank" :href = "i.chart">{{  i.tradingsymbol  }}  </a>
                </td>
                <td :class = "i.candle">
                  {{  i.last_price  }} 
                  <small> Amt {{  i.lot_size * i.last_price  }}  </small>
                  <!-- Live Profit if executed  <b>{{ i.lot_size *( i.last_price-i.SevenDayMaxMin.Max ) }} </b> -->
                </td>
                <td>{{  i.instrument_type  }} </td>
                <td>{{  i.pricePoints.yesterday.high  }} </td>

                <td>
                  <select
                    name = ""
                    id = ""
                    v-model = "i.seletedBuyingMethod"
                    @change = "changeBuyingMethod( i )"
                  >
                    <option v-for = "bp in buyingPoint" :value = "bp" :key = "bp">
                      {{  bp  }} 
                    </option>
                  </select>

                  <!-- {{ i.seletedBuyingMethod }}  -->
                  <small v-if = "i.SevenDayMaxMin"></small> &nbsp;

                  {{  i.pricePoints.d1.high  }} 
                  <v-btn
                    fab
                    small
                    :title = "`Buy Now for  Amt ${ 
                      i.SevenDayMaxMin.Max * i.lot_size
                     } `"
                    @click = "BuyNow( i )"
                    ><v-icon color = "green">mdi-cart</v-icon>
                  </v-btn>
                </td>
             
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- :class = "{  'red': pos.candle_color == 'red', 'green': pos.candle_color == 'green'  } " -->
    <!-- <ul>
      <li v-for = "i in instruments" :key = "i.instrument_tocken">
        {{  i  }}  
      </li>
    </ul> -->

    <b-modal v-model = "modalShow">
      <slot name = "header"> geader </slot>
      <slot name = "body">
        <table>
          <tr v-for = "( symbol, index ) in livePositionsSelected" :key = "index">
            <td>{{  index + 1  }} </td>
            <td>{{  symbol.tradingsymbol  }} </td>
            <td>{{  symbol.pnl  }} </td>
            <td>
              <input
                type = "checkbox"
                name = ""
                id = ""
                class = "form-control"
                v-model = "symbol.selected"
              />

              {{  symbol.selected  }} 
            </td>
          </tr>
        </table>
      </slot>

      <slot name = "footer">
        <v-btn @click = "squareoffAll(  )">Proceed </v-btn>
      </slot>
    </b-modal>
  </div>
</template>

<script>

 let moment = require( 'moment' );
import {  io  }  from "socket.io-client";
import axios from "axios";
import sessionMixin from "@/views/sessionMixin";
var Statistics  =  require( "statistics.js" );
const socket  =  io( "http://localhost:4000" );

import ClosedTrades from "./ClosedTrades.vue";
import LiveTickView from "./LiveTickView.vue";
import LiveOrders from "./LiveOrders.vue";
const hourlyPricePointsofLiveDay  =  require( "../../../instruments/hourlyCandleData.json" );

// let instru  =  require( "../instruments.json" );

let instrumentsForMining1  =  require( "../../../instruments/instrumentsForCommodity.json" );


let instrumentsForMining  =  instrumentsForMining1 .

filter( i =>i.instrument_type == 'FUT' && i.segment == 'MCX-FUT' && i.tradingsymbol.includes( 'SEP' ));

export default { 
  components: {  ClosedTrades, LiveTickView, LiveOrders  } ,

  mixins: [sessionMixin],

  watch: { 
    orderArray( n, o ) { 
      // console.log( n,o )

      let orderArrays  =  [...this.orderArray];

      if ( orderArrays.length > 0 ) { 
        orderArrays.forEach( async ( orderArray )  => { 
          // let a  =  await this.placeOrder( orderArray );
          // console.log( "place order result", a );
          console.log( "Actual Firing", JSON.stringify( orderArray ));
         }  );

        this.orderArray  =  [];
       } 
     } ,
   } ,

  mounted(  ) { 
  var d  =  new Date(  );
      this.hours  =  d.getHours(  );
      this.minutes  =  d.getMinutes(  );
      this.seconds  =  d.getSeconds(  );


    this.refreshTradeStatus(  );

    let TenMinutes  =  10 * 60 * 1000;
    let FiveMinutesTimer  =  setInterval((  )  => { 
      this.$router.go(  );
     } , TenMinutes );

    let thirtyMinute  =  5 * 60 * 1000;

    let thirtyMinuteTimer  =  setInterval((  )  => { 
      let thirtyMiniutesBefore  =  new Date(  );
      thirtyMiniutesBefore.setMinutes( thirtyMiniutesBefore.getMinutes(  ) - 2 );
      // let iso = now.toISOString(  )

      //  & lo.order_timestamp>0

      let order_ids  =  this.liveOrders
        .filter(( lo )  => { 
          return ( 
            lo.status  ==  "OPEN" &&
            lo.exchange  ==  "MCX" &&
            lo.transaction_type  ==  "BUY" &&
            thirtyMiniutesBefore - new Date( lo.order_timestamp ) > 0
           );
         }  )
        .map(( o )  => { 
          let ob  =  {  } ;
          ob.order_id  =  o.order_id;
          ob.variety  =  o.variety;

          return ob;
         }  );

      console.log( order_ids, "live orderss to be canceled" );

      if ( order_ids.length > 0 ) { 
        this.CancelOrders( order_ids );
       } 
     } , thirtyMinute );

    let fifteenSecTimer  =  setInterval( async (  )  => { 
      //fired if there is no hourly lows checking every 15sec
      if ( this.hourlyPricePointsofLiveDay.length  ==  0 ) { 
if( typeof this.livePositions == 'undefined' ){ 

let a = await this.refreshTradeStatus(  );

return ;
  
 } 

        // if ( this.livePositions.length > 0 ) { 
        //   // let r  =  this.getHourlyCandleLows(  );
        //  } 
       } 
     } , 15 * 1000 );

    let placingTimer  =  window.setInterval( async (  )  => { 
      let ln  =  this.orderArray.length;

      // console.log( 'order array length1',ln,JSON.stringify( this.orderArray ))

      // console.log( 'this.orderArray.',this.orderArray )

      // clock

      if ( this.laggingCheckDigit  ==  this.CurrentCheckDigit ) { 
        this.webSocketNotActive  =  true;

        //reload window

        // this.$router.go(  );
       }  else { 
        this.webSocketNotActive  =  false;
       } 
      this.laggingCheckDigit  =  this.CurrentCheckDigit;
      var d  =  new Date(  );
      this.hours  =  d.getHours(  );
      this.minutes  =  d.getMinutes(  );
      this.seconds  =  d.getSeconds(  );

      // if ( this.livePositions.length > 0 ) { 
      //   // let r  =  await this.getHourlyCandleLows(  );
      //  } 

      let hourlyhandleFetchingMinutes  =  [1, 16, 31, 46];
      if ( hourlyhandleFetchingMinutes.includes( this.minutes )) { 
        // if ( this.livePositions.length > 0 )
        if ( true ) { 
          // let r  =  await this.getHourlyCandleLows(  );
         } 

        //geting candle data in 31 st minutes of each hour
       } 
     } , 60 * 1000 );

    // *Math.max( this.orderArray.length,1 )

    if ( this.chat_id  ==  -1 ) { 
      this.getChatId(  ).then(( chat_id )  => { 
        var d  =  new Date(  );

        let today  =  d.toLocaleString(  ).slice( 0, 10 );

        var txt  =  "Welcome to Trading on " + today;
        this.sendToTelegramGroup( txt );
       }  );
     } 
    // this.triggerWebsocktsInServer(  );
    //  window.setInterval((  )  => { 
    //   console.clear(  );

    //     } ,250000 )

    // window. setInterval((  )  => { 
    //     var d  =  new Date(  );
    //     this.hours  =  d.getHours(  );
    //     this.minutes  =  d.getMinutes(  );
    //     this.seconds  =  d.getSeconds(  );

    //   } ,1000 )

    // this.getOrders(  );

    // if ( this.livePositions.length > 0 ) { 
    //   // this.getHourlyCandleLows(  );
    //  } 
    this.instruments  =  instrumentsForMining;

    //  let k = await
    this.setInstrumentTokens(  );


  
    //  let tmp = [...this.instrument_tokens,14523906]


// console.log( this.instrumentTokens );



    socket.emit( "subscribe-orders", JSON.stringify( this.instrumentTokens ));

    socket.on( "send-realtime-subscription", ( s )  => { 
      this.mutateWithLtp( s );

      this.CurrentTick  =  s;
     }  );

       socket.on( "order_update", async ( orderUpdates )  => { 

        if( this.refreshingStatus == true ) { 

           console.log( "update in progress" );
          return false;
         } 
this.refreshingStatus = true;


        let t = await  this.refreshTradeStatus(  );

        this.refreshingStatus = false;;
      console.log( "t %s",t );
      // this.getOrders(  );
     }  );

    //   setInterval( async (  )  => { 
    //  this.getOrders;

    //    } , 30000 );
   } ,

  computed: { 

    executedBuyOrdersTime(  ){ 


      return this.executedOrders.filter( r1 =>r1.transaction_type == 'BUY' ).map( r =>{ 

let {  instrument_token,exchange_update_timestamp }  = r;


return {  instrument_token,exchange_update_timestamp } 
       }  )
     } ,
    closedTradesScriptsPnl(  ) { 
      if ( this.closedTradesScripts.length > 0 ) { 
        return this.closedTradesScripts.reduce(( pvs, cur )  => { 
          return pvs + cur.pnl;
         } , 0 );
       } 
     } ,

    totalpnl(  ) { 

      if( this.livePositions.length == 0 ){ 

        return 0;
       } 
      return this.livePositions.reduce(( pvs, cur )  => { 
        return pvs + cur.pnl;
       } , 0 );
     } ,
    liveTradablebalance(  ) { 
      return ( 
        this.maxTradableAmount -
        this.liveBuyOrderAmount -
        this.livePositionTotalCost -
        this.totalBuyOrderLivePlacedBySoftware -
        this.proposedBuyAmount
       );
     } ,
    //  &&  typeof i.SevenDayMaxMin!= 'undefined'

    // &&  typeof i.SevenDayMaxMin!= 'undefined'
    totalLiveprofitIfExecuted(  ) { 
      return 0;

      let total  =  0;

      this.instruments
        .map(( i )  => i.liveprofitIfExecuted )
        .forEach(( e )  => { 
          // console.log( 'e',e )

          if ( isNaN( e )) { 
            e  =  0;
           } 

          total  =  total + e;
         }  );

      return total;

      return this.instruments
        .map(( i )  => i.liveprofitIfExecuted )
        .reduce(( c, p )  => { 
          if ( isNaN( p )) { 
            p  =  0;
           } 
          c  =  c + p;
         } , 0 );
     } ,

    instrumentsFiltered(  ) { 
      return this.instruments.filter(( i )  => i.buyNow  ==  true );

      // .sort(( a, b )  => { 
      //   return a.activatedTime - b.activatedTime;
      //  }  );
     } ,
   } ,

  methods: { 

    async cancelLiveOrders(  ){ 


     } ,

    async   updateSellorderWithDesiredPrice( CurrentInstrument,element,squaringOff,p = 0 ){ 
// this.SelectedSellorder = 


// console.log( 'firing squqring of ',CurrentInstrument.tradingsymbol )



/// check the current order price

if( CurrentInstrument.instrument_type == 'FUT' ){ 

  return;
 } 

let instrument_token = CurrentInstrument.instrument_token;



///was normally false but activating now for a while
if( squaringOff ){ 

let test = this.updatingInProgress.filter( u =>u == instrument_token ).length;

if( test>0 ){ 

// console.log( CurrentInstrument.tradingsymbol,'alrady upated' );
  return false;
 } 


this.updatingInProgress.push( instrument_token );


 } 



let CurrentOrderObj  = this.orders.
filter( o =>o.transaction_type == "SELL" && 
o.instrument_token == instrument_token )

if( CurrentOrderObj.length == 0 ){ 

console.log( ' curentorder not presnt for %s',CurrentInstrument.tradingsymbol )
  return false;
 } 


let price;
if( p == 0 ){ 



let targetPoint = CurrentInstrument.pricePoints.d1.low;

 let priceBuy  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
            .price;

          let priceSell  =  element.depth.sell.sort( 
            ( a, b )  => b.price - a.price
           )[0].price;

          let avg = (( priceBuy+priceSell )/2 ).toFixed( 1 )




 price = avg
 } else{ 


  price = p
 } 


// console.log( 'avg',avg,'low',CurrentInstrument.pricePoints.d1.low,'mispricePoints',this.getMisPricePointofScript( instrument_token, targetPoint ))
// let price = CurrentInstrument.pricePoints.d1.low;  // changed with some other logic


// let price = this.getMisPricePointofScript( instrument_token, targetPoint )  // not working this logic




if( CurrentOrderObj[0].price ==  price ){ 

  // console.log( 'new order already plaed' )

  return false
 } 
// console.log( CurrentInstrument,'CurrentInstrument' )




// console.log(  CurrentOrderObj,' CurrentOrderObj' )





this.newOrder = CurrentOrderObj.map( i =>{ 

let o = {  } ;
    // o.variety = i.variety;
  
  
  // o.variety = 'regular';


 if(( this.hours == 15 && this.minutes>30 ) || this.hours>15 || this.hours<9 || ( this.hours == 9 && this.minutes<15 )   )
 { 
o.variety  =  "amo";

       } else{ 

o.variety  =  "regular";

       } 


    o.order_id = i.order_id;
    let params = {  } ;
    // let qry = i.exchange+":"+i.tradingsymbol;
    // let newPrice = i.ltp;
    // params.price = i.last_price;
    params.price = price
    // params.order_type = i.last_price;
params.trigger_price = price
    o.params = params;

    // console.log( 'o',o )
    return o;

 }  );




this.updateOrder(  );


let t = await this.getOrders(  );
let tmp = this.updatingInProgress;

// this.updatingInProgress = tmp.filter( t =>t!= instrument_token );

  let t2 = await this.refreshTradeStatus(  );
  console.log( CurrentInstrument.tradingsymbol,
  'has hit stop loss inside hasLiveTarget new order is ',this.newOrder )




// .map( o =>{  }  );

           } ,




    updateOrder(  ){ 

  let ordersString = JSON.stringify( this.newOrder );
  // console.log( 'ordersString = ',ordersString )

  let params = {  } ;
  params.accessToken = this.accessToken;
  params.ordersString = ordersString;
let url = "/api/modifyOrders";

axios.post( url,params ).then( res =>{ 

  // console.log( 'orders modify reply',res.data )

  this.getOrders(  );//refreshing orders
 }  )

 } ,
    getLatestPricesOfClosedScripts(  ) { 
      if ( this.closedTradesScripts.length  ==  0 ) { 
        return false;
       } 

      let url  =  "/api/getLatestPricesOfClosedScripts";
      let ob  =  {  } ;
      ob.symbols  =  JSON.stringify( 
        this.closedTradesScripts.map(( c )  => c.instrument_token )
       );

      // console.log( ob.symbols, "ob.symbols" );
      ob.accessToken  =  this.accessToken;

      axios.post( url, ob ).then(( r )  => { 
        r.data.forEach(( e )  => { 
          // console.log( e, "e" );
          this.$set( 
            this.closedTradesScripts.filter( 
              ( e1 )  => e1.instrument_token  ==  e.instrument_token
             )[0],
            "postTradePrice",
            e.last_price
           );


this.totalForgone = this.closedTradesScripts.reduce(( pvs,closedTradesScript ) =>{ 


// console.log( closedTradesScript,'closedTradesScript' );
return pvs+( closedTradesScript.postTradePrice-closedTradesScript.sell_price )*closedTradesScript.sell_quantity
// console.log( pvs,'pvs' )
 } ,0 )

this.totalForgoneForStopLoss = this.closedTradesScripts.reduce(( pvs,closedTradesScript ) =>{ 


// console.log( closedTradesScript,'closedTradesScript' );

if( closedTradesScript.pnl<0 ){ 

  // console.log( closedTradesScript.pnl,'closedTradesScript.pnl totalForgoneForStopLoss' )
return pvs+( closedTradesScript.postTradePrice-closedTradesScript.sell_price )*closedTradesScript.sell_quantity


 } else{ 

  return pvs
 } 
// console.log( pvs,'pvs' )
 } ,0 )

// .tofixed( 1 )


this.totalForgoneFortarget = this.closedTradesScripts.reduce(( pvs,closedTradesScript ) =>{ 


// console.log( closedTradesScript,'closedTradesScript' );

if( closedTradesScript.pnl>0 ){ 

    // console.log( closedTradesScript.pnl,'closedTradesScript.pnl totalForgoneFortarget' )

return pvs+( closedTradesScript.postTradePrice-closedTradesScript.sell_price )*closedTradesScript.sell_quantity


 } else{ 

  return pvs
 } 
// console.log( pvs,'pvs' )
 } ,0 )
//.tofixed( 1 )


         }  );
       }  );
     } ,

    CancelOrders( ar ) { 
      let url  =  "/api/CancelOrders";

      let arr  =  JSON.stringify( ar );
      let accessToken  =  this.accessToken;
      let ob  =  {  arr, accessToken  } ;

      // console.log( arr );
      axios.post( url, ob ).then(( r )  => { 
        console.log( r.data, "r.data" );
       }  );
     } ,

    getStatus( instrument_token ) { 
      // return instrument_token

      try { 
        let PlacedReverseOrder  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0].PlacedReverseOrder;

        let hasLivetarget  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0].hasLivetarget;

        return {  PlacedReverseOrder, hasLivetarget  } ;
       }  catch ( e ) { 
        return instrument_token;
       } 
     } ,
    updateMissingScriptInInstrumetsFile( instrument_token ) { 
      let params  =  { 
        accessToken: this.accessToken,
        instrument_token: instrument_token,
       } ;

      let url  =  "/api/updateMissingScriptInInstrumetsFile/";

      axios.post( url, params ).then(( r )  => { 
        let instruments  =  require( "../../../instruments/instrumentsForMining.json" );

        this.$set( this.instruments, instruments );
        //  Object.assign( this.instruments, instruments )

        this.livePositions.forEach(( e )  => { 
          let instrument  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  e.instrument_token
           )[0];

          this.$set( e, "instrument", instrument );
         }  );

  this.setInstrumentTokens(  );
 socket.emit( "subscribe-orders", JSON.stringify( this.instrumentTokens ));

       }  );
     } ,

    getHourlySupportPointsBelowReference( instrument_token, ref ) { 

      return ref;
      if ( hourlyPricePointsofLiveDay.length > 0 )
        if ( 
          typeof hourlyPricePointsofLiveDay.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0]  ==  "undefined"
         ) { 
          return -111;
         } 

      //  console.log( hourlyPricePointsofLiveDay.filter( 
      //       ( i )  => i.instrument_token  ==  instrument_token
      //      )[0],'test' )
      //      return;

      if ( 
        typeof hourlyPricePointsofLiveDay.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0].prices  ==  "undefined"
       ) { 
        return -222;
       } 

      if ( 
        hourlyPricePointsofLiveDay.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0].prices.length > 0
       ) { 
        let prices1  =  hourlyPricePointsofLiveDay.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0].prices;

        // .prices;

        let p1  =  prices1.map(( a1 )  => a1.low );
        // .sort(( a, b )  => { 
        //   return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        //  }  )

        let p2  =  prices1.map(( a1 )  => a1.high );
        // .sort(( a, b )  => { 
        //   return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        //  }  )

        let points  =  [...p1, ...p2];

        //  return points;
        // //  .at( -2 );

        return points
          .filter(( a )  => a < ref )

          .sort(( a, b )  => b - a )[0];
       }  else { 
        return -2300;
       } 
     } ,
    getHourlyResistancePointsBelowReference( instrument_token, ref ) {  } ,

    getTrailingStopLoss( instrument_token, livePnl ) { 
      let sl  =  this.getStopLoss( instrument_token );
      // if( livePnl<= 0 )

      let ins  =  this.instruments.filter( 
        ( r )  => r.instrument_token  ==  instrument_token
       )[0];

      if ( typeof ins !=  "undefined" ) { 
        if ( ins.length !=  0 ) { 
          let ydayCloseOpenMin  =  Math.max( 
            ins.pricePoints.d1.close,
            ins.pricePoints.d1.open
           );
         } 
       }  else { 
        return sl;
       } 

      if ( this.hourlyPricePointsofLiveDay.length  ==  0 ) { 
        return sl;
       } 

      if ( 
        this.hourlyPricePointsofLiveDay.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         ).length  ==  0
       ) { 
        // return sl;
       } 

      // return instrument_token;

      if ( 
        typeof this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0]  ==  "undefined"
       ) { 
        // return 1000;
       } 

      let tick_size  =  this.instruments.filter( 
        ( i )  => i.instrument_token  ==  instrument_token
       )[0].tick_size;

      let mplr  =  3;

      if ( this.hourlyPricePointsofLiveDay.length > 0 )
        if ( 
          typeof this.hourlyPricePointsofLiveDay.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0] !=  "undefined"
         )
          if ( 
            typeof this.hourlyPricePointsofLiveDay.filter( 
              ( i )  => i.instrument_token  ==  instrument_token
             )[0].prices !=  "undefined"
           )
            if ( 
              this.hourlyPricePointsofLiveDay.filter( 
                ( i )  => i.instrument_token  ==  instrument_token
               )[0].prices.length > 0
             ) { 
              let prices1  =  this.hourlyPricePointsofLiveDay.filter( 
                ( i )  => i.instrument_token  ==  instrument_token
               )[0].prices;

              let p1  =  prices1
                .sort(( a, b )  => { 
                  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
                 }  )
                .map(( a1 )  => a1.low );

              let p2  =  prices1
                .sort(( a, b )  => { 
                  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
                 }  )
                .map(( a1 )  => a1.high );

              let points  =  [...p1, ...p2];
              //  .at( -2 );

              return p1
                .filter(( a )  => a < ins.pricePoints.d1.close )

                .sort(( a, b )  => b - a )[0];

              // .
              // sort(( a,b ) =>{ 
              // return a.date-b.date

              //  }  )

              // return 1;

              // return p1;

              // console.log( prices,'prices' )
              // return prices;
              // return '3333'
              // return prices
              let p  =  prices.low - tick_size * mplr;

              // return p.toFixed( 2 );
             }  else { 
              let sl  =  this.getStopLoss( instrument_token );
              // return sl;
             } 

      if ( true ) { 
        return sl;
       } 
     } ,

    getChart( instrument_token ) { 
      try { 
        // return 'https://kite.zerodha.com/chart/ext/ciq/MCX-OPT/'

        let chart  =  this.instruments.filter( 
          ( i )  => ( i.instrument_token  =  instrument_token )
         )[0].chart;
        return chart;
       }  catch ( e ) { 
        return "https://kite.zerodha.com/chart/ext/ciq/MCX-OPT/";
       } 
     } ,

    async getHourlyCandleLows(  ) { 
      return new Promise( async ( response, rej )  => { 
        this.loadingHourlyTradingLows  =  true;
        let url  =  "/api/getHourlyCandleLows";
        let accessToken  =  this.accessToken;

        let symbols_json  =  JSON.stringify( 
          this.livePositions.map(( a )  => a.instrument_token )
         );

        let ob  =  {  symbols_json, accessToken  } ;

        let res  =  await axios.post( url, ob ).then(( r )  => { 
          if ( r.data.length > 0 ) { 
            var tmp  =  r.data.sort(( a, b )  => { 
              return b.date < a.date ? -1 : b.date > a.date ? 1 : 0;
             }  );

            this.hourlyPricePointsofLiveDay  =  tmp;
           } 

          this.loadingHourlyTradingLows  =  false;
          response( tmp );
         }  );

        // console.log( this.hourlyPricePointsofLiveDay,'this.hourlyPricePointsofLiveDay' )

        return;
       }  );
     } ,

    getStopLoss( instrument_token ) { 
      try { 
        let CurrentInstrument  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0];

        return CurrentInstrument.pricePoints.d1.low - 0.05 * 3;
        return Math.max( 
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
          CurrentInstrument.pricePoints.d1.low
         );
       }  catch ( e ) { 
        return 1000;
       } 

      //  return this.instruments.filter( i =>i.instrument_token == instrument_token )[0].
      //  pricePoints.yesterday.low;;
     } ,
    getMisPricePointofScript( instrument_tocken, targetPoint ) { 
      try { 
        // return ;
        // return instrument_tocken;

        // return this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0].pricePoints.yesterday.high;;

        //console.log( instrument_tocken )
        //console.log( this.instruments.filter( i =>i.instrument_token == instrument_tocken ),'this.instruments.filter( i =>i.instrument_token == instrument_tocken )' )
        // console.log( this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0],
        // 'this.instruments.filter( i =>i.instrument_token == instrument_tocken )[0]' );

        if ( 
          this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_tocken
           ).length  ==  0
         ) { 
          return targetPoint;
         } 
        let yesterdayHigh  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_tocken
         )[0].pricePoints.yesterday.high;

        // return yesterdayHigh*1.2;
        let type  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_tocken
         )[0].instrument_type;
        let name  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_tocken
         )[0].name;

        //.hourlyPricePoints( h =>h.h.high>1.1*yesterdayHigh

        // return name+type;

        let offset  =  1
        let reference  =  targetPoint * offset;

        if ( type  ==  "CE" || type  ==  "PE" ) { 
          // return offset;

          // return 1000;
          if ( 
            typeof this.instruments.filter( 
              ( i )  => i.instrument_token  ==  instrument_tocken
             )[0] !=  "undefined"
           )
            if ( 
              typeof this.instruments.filter( 
                ( i )  => i.instrument_token  ==  instrument_tocken
               )[0].pricePoints !=  "undefined"
             )
              if ( 
                typeof this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  instrument_tocken
                 )[0].pricePoints.hourlyPricePoints !=  "undefined"
               )
                if ( 
                  typeof this.instruments
                    .filter(( i )  => i.instrument_token  ==  instrument_tocken )[0]
                    .pricePoints.hourlyPricePoints.filter( 
                      ( l )  => l.high > reference
                     )[0] !=  "undefined"
                 ) { 
                  // console.log( reference,'reference' )
                  let lows  =  this.instruments
                    .filter(( i )  => i.instrument_token  ==  instrument_tocken )[0]
                    .pricePoints.hourlyPricePoints.map(( a )  => a.low )
              
               

                  let highs  =  this.instruments
                    .filter(( i )  => i.instrument_token  ==  instrument_tocken )[0]
                    .pricePoints.hourlyPricePoints.map(( a )  => a.high )
                   
              

                  highs.concat( lows );
                

                  let out  =  highs
                    .filter(( h )  => h > reference )
                


                  let target  =  Math.min( ...out );

                  return target;
                  

                  if ( isNaN( target )) { 
                    if ( 
                      this.livePositions.filter( 
                        ( lp )  => lp.instrument_token  ==  instrument_tocken
                       )[0] !=  "undefined"
                     )
                      if ( 
                        typeof this.livePositions.filter( 
                          ( lp )  => lp.instrument_token  ==  instrument_tocken
                         )[0] !=  "undefined"
                       ) { 
                        return ( 
                          this.livePositions.filter( 
                            ( lp )  => lp.instrument_token  ==  instrument_tocken
                           )[0].average_price * ( 1.02 ).toFixed( 1 )
                         );

                        return ( 
                          this.livePositions.filter( 
                            ( lp )  => lp.instrument_token  ==  instrument_tocken
                           )[0].average_price * 1.2
                         );
                       }  else { 
                        return 22222;
                       } 
                   } 

                  // return 'lows'
                  return target.toFixed( 1 );

                  return this.instruments
                    .filter(( i )  => i.instrument_token  ==  instrument_tocken )[0]
                    .pricePoints.hourlyPricePoints.filter( 
                      ( l )  => l.high > reference
                     )[0].low;
                 }  else { 
                  if ( 
                    typeof this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_tocken
                     )[0].yesterday  ==  "undefined" ||
                    this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_tocken
                     )[0].yesterday.rangeBreakOutTarget  ==  "undefined"
                   ) { 
                    // return instrument_tocken+'it';

                    let bo  =  this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_tocken
                     )[0].pricePoints.yesterday.rangeBreakOutTarget;

                    return bo.toFixed( 2 );
                    return this.livePositionsSelected.filter( 
                      ( lp )  => lp.instrument_token  ==  instrument_tocken
                     );
                   }  else { 
                    let ret  =  this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_tocken
                     )[0].pricePoints;
                    yesterday.rangeBreakOutTarget;
                    if ( isNaN( ret )) { 
                      //return 'nan'

                      return ( 
                        this.livePositionsSelected.filter( 
                          ( lp )  => lp.instrument_token  ==  instrument_tocken
                         )[0].average_price * 1.2
                       );
                     }  else { 
                      return ret.tofixed( 1 );
                     } 

                    //return 'avg'
                   } 
                 } 
         } 
       }  catch ( e ) { 
        if ( 
          typeof this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_tocken
           )[0] !=  "undefined"
         ) { 
          let tradingsymbol  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_tocken
           )[0].tradingsymbol;
          console.log( 
            e,
            "mis target error for ",
            tradingsymbol,
            instrument_tocken
           );

          return 1000;
         }  else { 
          console.log( e, "mis target error for ", instrument_tocken );

          return 1000;
         } 
       } 
     } ,

    async getQuoteFromZerodha( livePositionsInstrumentTokens ) { 
      let url  =  "/api/getQuoteFromZerodha";

      let obj  =  {  } ;
      obj.accessToken  =  this.accessToken;

      let quoteData  =  [];
      obj.arryOfInstruments  =  livePositionsInstrumentTokens;

      return await axios.post( url, obj ).then(( r )  => { 
        return r.data;

        return 1;
       }  );
     } ,

    async review(  ) { 
      let livePositionsTmp  =  await this.getPositions(  );

      // console.log(  )

      // let pnl = 0

      this.livePositionScripts  =  livePositionsTmp.net.map(( i )  => { 
        i.name;
       }  );

      let itrator  =  livePositionsTmp.net.slice( 1, 200 );

      let livePositionsInstrumentTokens  =  instrumentsForMining

        .map(( m )  => "MCX:" + m.tradingsymbol )
        .slice( 1, 200 );

      let url  =  "/api/getQuoteFromZerodha";

      // console.log( livePositionsInstrumentTokens )

      let obj  =  {  } ;
      obj.accessToken  =  this.accessToken;

      let quoteData  =  [];
      obj.arryOfInstruments  =  livePositionsInstrumentTokens;

      let a  =  await axios.post( url, obj ).then(( r )  => { 
        quoteData  =  r.data;

        return 1;
       }  );

      // console.log( quoteData,'quoteData',a )
      let counter  =  0;

      Object.keys( quoteData ).forEach(( lp1 )  => { 
        let lp  =  quoteData[lp1];
        console.log( lp, "lp" );

        counter  =  counter + 1;
        let obj  =  instrumentsForMining.filter( 
          ( i )  => i.instrument_token  ==  lp.instrument_token
         )[0];
        lp.buy_quantity  =  obj.lot_size;

        // let tgt = obj.pricePoints.yesterday.rangeBreakOutTarget;
        let tgt  =  obj.pricePoints.yesterday.high * 1.05;

        let entry  =  obj.pricePoints.yesterday.high;
        // let sl = obj.pricePoints.yesterday.low;
        let sl  =  obj.pricePoints.yesterday.high * 0.95;

        if ( lp.last_price > tgt ) { 
          console.log( "profit" );
          let tmp  =  0;
          tmp  =  ( lp.last_price - tgt ) * lp.buy_quantity;

          console.log( "tmp", tmp, obj.tradingsymbol );

          this.pnl  =  this.pnl + tmp;
         }  else if ( lp.last_price < sl ) { 
          console.log( "stop loss" );
          let tmp  =  0;
          tmp  =  ( lp.last_price - sl ) * lp.buy_quantity;

          console.log( "tmp", tmp, lp.tradingsymbol );

          this.pnl  =  this.pnl + tmp;
         }  else { 
          console.log( "neither" );

          let tmp  =  0;
          tmp  =  ( lp.last_price - entry ) * lp.buy_quantity;

          console.log( "tmp", tmp, lp.tradingsymbol );

          this.pnl  =  this.pnl + tmp;
         } 

        // console.log( lp )
       }  );

      console.log( "total this.pnl", this.pnl, counter );
     } ,

    async showModalForSquareOff(  ) { 
      let livePositionsTmp  =  await this.getPositions(  );

      this.livePositionsSelected  =  livePositionsTmp.net.filter( 
        ( p )  => p.exchange  ==  "MCX" && p.quantity !=  0 && p.product  ==  "NRML"
       );

      this.livePositionsSelected.forEach(( lp )  =>
        this.$set( lp, "selected", true )
       );

      this.modalShow  =  true;
     } ,

    async squareoffAll(  ) { 
      // var y = confirm( 'do uwant to continue' );

      //get positions

      let livePositionsInstrumentTokens  =  this.livePositionsSelected
        .filter(( lp )  => lp.selected  ==  true )
        .map(( m )  => { 
          let pp1  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  m.instrument_token
           )[0].pricePoints;

          // console.log( pp1, "pricePoints" );

          return "MCX:" + m.tradingsymbol;
         }  );

      let urlGetQuoteFromZerodha  =  "/api/getQuoteFromZerodha";

      let obj  =  {  } ;
      obj.accessToken  =  this.accessToken;
      obj.arryOfInstruments  =  livePositionsInstrumentTokens;

      let marketQuotes  =  await axios
        .post( urlGetQuoteFromZerodha, obj )
        .then(( res )  => res.data );

      let keys  =  Object.keys( marketQuotes );

      let orderArray  =  keys
        .map(( k1 )  => { 
          let i  =  marketQuotes[k1];
          let tradingsymbol  =  k1.split( ":" )[1];
          let transaction_type  =  "SELL";

          let instrument_token  =  marketQuotes[k1].instrument_token;

          let PlacedReverseOrder  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].PlacedReverseOrder;

          let hasLivetarget  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].hasLivetarget;

          if ( PlacedReverseOrder  ==  true || hasLivetarget  ==  true ) { 
            console.log( "placed reverse order" );
            return false;
           }  else { 
            let lot_size  =  this.instruments.filter( 
              ( i )  => i.instrument_token  ==  instrument_token
             )[0].lot_size;
            let order_type  =  "LIMIT";
            let Price  =  i.depth.buy.sort(( a, b )  => b.price - a.price )[0].price;

            let product  =  "NRML";

            let arr  =  this.buildOrderArray( 
              tradingsymbol,
              transaction_type,

              lot_size,
              order_type,
              Price,
              product
             );

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
              "Day Exit"
             );

            // let a  =  [];

            // a.push( arr );

            return arr;
           } 
         }  )
        .filter(( n )  => !( n  ==  null || n  ==  false ));

      this.modalShow  =  true;

      // this.orderArray = orderArray;

      //  let orderArray  =  [arr];
      // console.log( orderArray,'orderArray' )

      let orderArray1  =  orderArray;
      let a  =  await this.placeOrder( orderArray1 );

      // console.log( "orderArray1", JSON.stringify( orderArray ));

      //return false;

      //check if reverse order exit

      ///till here
     } ,

    async getChatId(  ) { 
      return;
      this.chat_id  =  -1;
      if ( this.chat_id !=  1 ) { 
        let url  =  `https://api.telegram.org/bot${ this.token } /getUpdates`;

        return axios
          .get( url )
          .then(( r )  => { 
            this.chat_id  =  r.data.result[0].channel_post.chat.id;

            return this.chat_id;
           }  )
          .catch(( e )  => e );

        var txt  =  "First time";
       } 
     } ,

    sendToTelegramGroup( text ) { 
      return;
      if ( true ) { 
        let obj  =  {  } ;
        obj.chat_id  =  this.chat_id;
        obj.text  =  text;

        let urlToSendMessage  =  `https://api.telegram.org/bot${ this.token } /sendMessage`;

        axios
          .post( urlToSendMessage, obj )
          .then(( r )  => { 
            // console.log( 'from bot ',r.data.result[0] )
           }  )
          .catch(( e )  => e );
        // console.log( 'from bot ',r.data.result[0].channel_post.chat.id )
       } 
     } ,

    resetUserMessages(  ) { 
      this.userMessages  =  ["no msg"];
     } ,
    triggerWebsocktsInServer(  ) { 
      let url  =  "/api/triggerWebsocktsInServer/accessToken/" + this.accessToken;

      axios.get( url ).then(( r )  => { 
        console.log( "triggered" );
       }  );
     } ,
    CancelOrder(  ) {  } ,
    enableForEditng(  ) {  } ,
    async setTarget( i ) { 
      let tradingsymbol  =  i.tradingsymbol;
      let lot_size  =  i.quantity;
      let order_type  =  "LIMIT";
      let Price  =  i.target;
      let transaction_type  =  "SELL";

      let product  =  "NRML";
      let arr  =  this.buildOrderArray( 
        tradingsymbol,
        transaction_type,

        lot_size,
        order_type,
        Price,
        product
       );
      console.log( arr );

      let orderArray  =  [arr];

      let a  =  await this.placeOrder( orderArray );
      console.log( "place order result", a );
      this.refreshTradeStatus(  );
     } ,

    async getOrders(  ) { 
      let obj  =  {  } ;
      obj.accessToken  =  this.accessToken;
      let url  =  "/api/getOrdersPost";

      return axios.post( url, obj ).then(( res )  => { 
        if ( res.data.length  ==  0 ) { 
          this.liveOrders  =  ["no_live_orders"];
         } 

        // if( res.data.data == null ){ 

        //   return new Promise(( res,rej ) =>
        //   { 

        //     this.liveOrders = 0;
        //  res( [] )

        //    } 
        //   )
        //  } 

        if ( res.data.status  ==  "error" ) { 
          this.liveOrders  =  [0];
         } 

        if ( typeof res.data  ==  "undefined" ) { 
          this.liveOrders  = [0];
          return new Promise(( res, rej )  => res( [] ));
         } 

        if ( typeof res.data.error_type  ==  "string" ) { 
           this.liveOrders  =  [0];
          
          console.log( res.data.error_type, "@line 1283" );
          return false;
         } 
        // console.log( res.data,typeof res.data,'res.data @1284 line' )
// exchange_update_timestamp
this.executedOrders = res.data.filter( r =>r.transaction_type == 'BUY'
 && r.status == "COMPLETE" );
this. allOrders = res.data;
        let t  =  res.data.filter(( o )  => { 
      // console.log( o.status,'o.status' );
        let result  =  ( o.exchange  == 
            "MCX" && ( o.status == 'OPEN' 
            
            || o.status == 'AMO'
            || o.status == 'AMO REQ RECEIVED'
            
              )  )
           

          return result;
         }  );


//  !( 
//               o.status  ==  "COMPLETE" ||
//               o.status  ==  "CANCELLED" ||
//               o.status  ==  "REJECTED"
//              ));
        //  console.log( t,typeof t,'get orders' )
        this.liveOrders  =  t.filter(( tx )  => tx.exchange  ==  "MCX" );
        this.orders  =  t.filter(( tx )  => tx.exchange  ==  "MCX" );

        this.liveOrderScripts  =  t
          .filter(( t1 )  => t1.transaction_type  ==  "BUY" )
          .filter(( f )  => f.exchange  ==  "MCX" )

          .map(( a )  => { 
            // return 123
            // return a;
            return this.instruments.filter( 
              ( i2 )  => i2.tradingsymbol  ==  a.tradingsymbol
             )[0].name;
           }  );

        this.liveBuyOrderAmount  =  t
          .filter( 
            ( t1 )  =>
              t1.status  ==  "OPEN" &&
              t1.transaction_type  ==  "BUY" &&
              t1.exchange  ==  "MCX"
           )
          .map(( s )  => s.quantity * s.price )
          .reduce(( pv, cv )  => ( pv  =  pv + cv ), 0 );
        //console.log( 'orders',t )
       }  );
     } ,

    changeBuyingMethod( i ) {  } ,

    async getPositions(  ) { 
      if ( this.hourlyPricePointsofLiveDay.length  ==  0 ) { 
        // console.log( this.hourlyPricePointsofLiveDay.length,'this.hourlyPricePointsofLiveDay.length' )

        // if ( this.livePositions.length > 0 ) { 
        //   // let r  =  await this.getHourlyCandleLows(  );
        //  } 
        // console.log( r,'after ---this.hourlyPricePointsofLiveDay.length' )
       } 

      let url  =  "/api/getPositions";

      let obj  =  {  } ;
      obj.accessToken  =  this.accessToken;
      return axios.post( url, obj ).then(( res )  => { 
        if ( typeof res.data.net  ==  "undefined" ) return [];

        // console.log( res.data.net.length,'res.data.net.length' )
        if ( res.data.net.length > 0 ) { 
          this.livePositionScripts  =  res.data.net
            .filter(( n )  => n.exchange  ==  "MCX" && n.quantity !=  0 )
            .map(( i )  => { 
              if ( 
                this.instruments.filter( 
                  ( i2 )  => i2.tradingsymbol  ==  i.tradingsymbol
                 ).length !=  0
               ) { 
                return this.instruments.filter( 
                  ( i2 )  => i2.tradingsymbol  ==  i.tradingsymbol
                 )[0].name;
               }  else { 
                return i.tradingsymbol.split( "22" )[0];
               } 
             }  );
         } 

        res.data.net.forEach(( e )  => { 
          let tsl  =  this.getTrailingStopLoss( e.instrument_token, e.pnl );

          // console.log( tsl,'Trailing Stop Loss' )
          this.$set( e, "trailingStopLoss", tsl );
         }  );

        return res.data;
       }  );
     } ,

    async getLastPriceForClosedTrades(  ) { 
      let ar  =  this.closedTradesScripts.map(( cts )  => cts.instrument_token );

      let a  =  await this.getQuoteFromZerodha( ar );
     } ,

    async placeTargetsForLiveScripts(  ) { 
      let symbols  =  [...this.livePositions];

      //  console.log( symbols, "symbols" );
      if ( typeof symbols  ==  "undefined" ) return false;
      if ( symbols.length  ==  0 ) return false;

      return new Promise(( res, rej )  => { 
        let output  =  [];

        let timer  =  setInterval((  )  => { 
          // this.livePositions.forEach( e =>{ 



          let e  =  symbols.pop(  );

       

          
          if ( typeof e  ==  "undefined" ) { 
            res( output );


console.log( 'clearing target timer .. target is finishedd for %s number of scripts' );
            clearInterval( timer );
            return;
           } 

          // console.log( e, "e" );

          let CurrentInstrument  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  e.instrument_token
           )[0];

            //  console.log( CurrentInstrument,'e' )

            //  console.log( CurrentInstrument.otherCriteria,'CurrentInstrument.otherCriteria' )

          if ( typeof CurrentInstrument  ==  "undefined" ) { 
            return false;
           } 

          if ( typeof CurrentInstrument.otherCriteria  ==  "undefined" ) { 
            // return false;
           } 


  
          let instrument_token  =  e.instrument_token;

          ///if has liver order or has reverse order placed /// return

          /// fire a target

          let PlacedReverseOrder  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].PlacedReverseOrder;



         let count  =  this.liveOrders.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           ).length;

          

        // console.log( count,'live order count for',CurrentInstrument.tradingsymbol )

let hasLiveTarget;
if( count>0 ){ 
hasLiveTarget = true

 } else if( count == 0 ){ 

hasLiveTarget = false;

 } 
  
  

          
          
          // hasLiveTarget;///wromg check in live orrders

//  console.log( 'PlacedReverseOrder hasLiveTarge',PlacedReverseOrder, hasLiveTarget,'CurrentInstrument.tradingsymbol',
//  CurrentInstrument.tradingsymbol )

// console.log( CurrentInstrument.tradingsymbol,'PlacedReverseOrder',PlacedReverseOrder,'hasLiveTarget ',hasLiveTarget  )


          if (( PlacedReverseOrder  ==  true || 
          typeof PlacedReverseOrder !=  'undefined' ) || hasLiveTarget  ==  true ) { 
           

           
          //  console.log( 'here for ',CurrentInstrument.tradingsymbol )
           
           return false;
           }  else { 

            

                  // console.log( 'proceeding for here for ',CurrentInstrument.tradingsymbol )
            let element  =  0;

            let product  =  e.product;

            let livePnl  =  e.pnl;

            let quantity  =  e.quantity;
            let targetPoint;

            //  let high =  CurrentInstrument.pricePoints.d1.high - 0.15;
             let rangeBreakOut =  CurrentInstrument.pricePoints.d1.rangeBreakOutTarget - 0.15;

             let high = rangeBreakOut;
// console.log( e,'e' )

             let upper_circuit_limit = e.quotes.upper_circuit_limit;
             
            //  upper_circuit_limit;


// targetPoint = Math.max( high,upper_circuit_limit );
targetPoint = Math.max( rangeBreakOut,upper_circuit_limit );


// console.log( CurrentInstrument.qoute,'CurrentInstrument' )

            // let yesterdayCandleColor  = 
            //   CurrentInstrument.otherCriteria.candleColor;
            // let targetPoint;


            // if ( yesterdayCandleColor  ==  "green" ) { 
            //   targetPoint  =  CurrentInstrument.pricePoints.d1.high - 0.15;
            //  }  else if ( yesterdayCandleColor  ==  "red" ) { 
            //   targetPoint  =  CurrentInstrument.pricePoints.d1.high - 0.15; 
              
              
            //   ///yesterdays closing point

            //   // yesterday candle red
            //   //   buy at yesterday close and sell at yesterday open

            //   //trailing stop loss  price point at low of current candle
            //  } 


output.push( CurrentInstrument.tradingsymbol );

 console.log( 'palcing',CurrentInstrument.tradingsymbol,'high,upper_circuit_limit',high,upper_circuit_limit )
            this.placetargetAndStopLoss( 
              CurrentInstrument,
              instrument_token,
              element,
              product,
              quantity,
              targetPoint,
              livePnl,
              true
             );
           } 
         } ,1000  );
       }  );
     } ,
    async refreshTradeStatus(  ) { 
      try { 


         let a  =  await this.getOrders(  );
        let tmp;
        let livePositionsTmp  =  await this.getPositions(  );

    // console.log( 'livePositionsTmp',livePositionsTmp );
        
        if ( typeof livePositionsTmp  ==  "undefined" ) { 
          this.livePositions  =  "NOT_LOADED";

          this.livePositionTotalCost  =  -1;
          return false;
         } 

   
       
  // console.log( livePositionsTmp.net.length,
  //  'livePositionsTmp.net.length 1234',this.livePositions )
        // if ( this.livePositions.length > 0 ) { 
        //   // let r  =  await this.getHourlyCandleLows(  );
        //  } 


  

  //  console.log( livePositionsTmp,'livePositionsTmp',this.livePositions )

        if ( typeof livePositionsTmp.net  ==  "undefined" ) { 
          this.livePositions  =  [];

          this.livePositionTotalCost  =  -1;
          return false;
         } 



        if ( typeof livePositionsTmp.net !=  "undefined" )
          if ( livePositionsTmp.net.length  ==  0 ) { 
            tmp  =  [];

             this.livePositionTotalCost  =  -1;
     
           }  else { 

             
            tmp  =  livePositionsTmp.net
              .filter( 
                ( p )  =>
                  p.exchange  ==  "MCX"
                  
                  && ( p.name == 'NIFTY' || p.name == 'NIFTY BANK' )
                  
                  && p.quantity !=  0 && p.product  ==  "NRML"
               )
              .sort(( a, b )  => b.pnl - a.pnl );

let liveInstrumentSymbols = livePositionsTmp.net.map( a =>a.instrument_token );

var quotes = await this. getQuoteFromZerodha( liveInstrumentSymbols );

// console.log( quotes,'quotes' )





//  console.log( this.executedBuyOrdersTime,'this.executedBuyOrdersTime.' )
            tmp.forEach(( e )  => { 


            
             
             
             let instrument  =  this.instruments.filter( 
                ( i )  => i.instrument_token  ==  e.instrument_token
               )[0];

           

             

         



              let q = quotes[e.instrument_token]

              this.$set( e, "instrument", instrument );
              this.$set( e, "quotes", q );
          
             }  );

            let tmp2 = livePositionsTmp.net
              .filter( 
                ( p )  =>
                  p.exchange  ==  "MCX" && p.quantity  ==  0 && p.product  ==  "NRML"

                  && !p.tradingsymbol.includes( "FUT" )
               )
              
              .sort(( a, b )  => b.pnl - a.pnl ) ;
              
              
              tmp2
                  .
              
              forEach( e =>{ 

  let instrument  =  this.instruments.filter( 
                ( i )  => i.instrument_token  ==  e.instrument_token
               )[0];
 this.$set( e, "instrument", instrument );

               }  )
              
            

            this.closedTradesScripts  =  tmp2
              

              
         
              
              
              
              ;
           } 
        this.getLastPriceForClosedTrades(  );

        this.livePositions  =  tmp;

  if ( this.livePositions.length == 0 ) { 
          
          this.livePositionTotalCost  =  0;
          return false;
         } 


        let t  =  await this.placeTargetsForLiveScripts(  );
        this.livePositionTotalCost  =  0;

        this.totalBuyOrderLivePlacedBySoftware  =  0;
        this.livePositions
          .filter(( f )  => f.exchange  ==  "MCX" )
          .forEach( async ( l )  => { 
            this.livePositionTotalCost  =  Math.abs( 
              this.livePositionTotalCost + l.average_price * l.quantity
             );

            if ( 
              typeof this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               )[0] !==  "undefined"
             ) { 
              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  l.instrument_token
                 )[0],
                "average_price",
                l.average_price
               );
             } 

            this.$set( l, "targetPc", 1.2 );

            try { 
              let rangeBreakOutTarget  =  this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               )[0].pricePoints.d1.rangeBreakOutTarget;
              this.$set( l, "rangeBreakOutTarget", rangeBreakOutTarget );

              let ln  =  this.orders
                .filter(( o )  => o.tradingsymbol  ==  l.tradingsymbol )
                .filter(( t1 )  => t1.transaction_type  ==  "SELL" ).length;

              

                let targetPrice = this.orders
                .filter(( o )  => o.tradingsymbol  ==  l.tradingsymbol )
                .filter(( t1 )  => t1.transaction_type  ==  "SELL" )[0].price;

              if ( ln  ==  0 ) { 
                this.$set( 
                  this.instruments.filter( 
                    ( i )  => i.instrument_token  ==  l.instrument_token
                   )[0],
                  "hasLiveTarget",
                  false
                 );



               }  else if ( ln > 0 ) { 


                this.$set( l, "hasLiveTarget", true );

                    this.$set( l, "targetPrice", targetPrice );

// console.log( quotes[l.instrument_token],'quotes' );


let element = quotes[l.instrument_token];

// let last_price = element.last_price;


// let currentInstrument = this.instruments.filter( 
//                 ( i )  => i.instrument_token  ==  l.instrument_token
//                )[0];

              // console.log( currentInstrument,'currentInstrument' );


//   console.log( ln,l.tradingsymbol,'ln',last_price,CurrentInstrument.pricePoints.d1.low,
//   last_price<= CurrentInstrument.pricePoints.d1.low )
// if(  ( last_price<= CurrentInstrument.pricePoints.d1.low )){ 

//   if( !last_price == 0 ){ 

//   this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false )
//  } 
                   


//  } 

                this.$set( 
                  this.instruments.filter( 
                    ( i )  => i.instrument_token  ==  l.instrument_token
                   )[0],
                  "hasLiveTarget",
                  true
                 );

                this.$set( 
                  this.instruments.filter( 
                    ( i )  => i.instrument_token  ==  l.instrument_token
                   )[0],
                  "buyNow",
                  true
                 );






               } 
             }  catch ( error ) { 
              this.$set( l, "rangeBreakOutTarget", 9999 );
              this.$set( l, "hasLiveTarget", false );
             } 

            // this.$set( l, "target", Math.ceil( l.average_price * l.targetPc ), 1 );

            // no live target so set a live target

            if ( 
              typeof this.instruments.filter( 
                ( i )  => i.instrument_token  ==  l.instrument_token
               )[0]  ==  "undefined"
             ) { 
              this.updateMissingScriptInInstrumetsFile( l.instrument_token );

              console.log( 
                "l.instrument_token absent",
                l.tradingsymbol,
                l.instrument_token
               );

              return false;
             } 
           }  );
       }  catch ( e ) { 
        console.log( e );
       } 
     } ,

    writeTrades( trade ) { 
      return false;
      // console.log( "writing trade from write trade", trade );
      let obj  =  {  } ;
      obj.trade  =  trade;
      const url  =  "/api/WriteTrades";

      axios.post( url, obj );
     } ,

    FetchInstruments(  ) { 
      const url  =  "/api/FetchInstruments";

      let obj  =  {  } ;
      obj.accessToken  =  this.accessToken;

      axios.post( url, obj );
     } ,
    async BuyNow( i ) { 
      let tradingsymbol  =  i.tradingsymbol;
      let lot_size  =  i.lot_size;
      let order_type;
      let Price;

      switch ( i.seletedBuyingMethod ) { 
        case "MARKET":
          order_type  =  "MARKET";
          Price  =  i.last_price;

          break;

        case "LTP":
          Price  =  i.last_price;
          order_type  =  "LIMIT";
          break;

        case "MAX":
          // Price  =  i.SevenDayMaxMin.Max;
          Price  =  i.pricePoints.d1.high;
          order_type  =  "LIMIT";

          break;
       } 

      let transaction_type  =  "BUY";
      let product  =  "NRML";
      let arr  =  this.buildOrderArray( 
        tradingsymbol,
        transaction_type,

        lot_size,
        order_type,
        Price,
        product
       );

      console.log( arr, "orderarray" );

      let orderArray  =  [arr];

      let a  =  [];
      a.push( arr );

      this.orderArray.push( a );

      // let a  =  await this.placeOrder( orderArray );
      console.log( "place order result", arr );
     } ,

    buildOrderArray( 
      tradingsymbol,
      transaction_type,
      qty,
      order_type,
      Price,
      product  =  "NRML"
     ) { 
      let order  =  {  } ;
      let proposedStock;
      if ( transaction_type  ==  "SELL" ) { 
        this.$set( 
          this.instruments.filter(( i )  => i.tradingsymbol  ==  tradingsymbol )[0],
          "PlacedReverseOrder",
          true
         );

        proposedStock  =  this.instruments.filter( 
          ( i )  => i.tradingsymbol  ==  tradingsymbol
         )[0].name;

        //           const index  =  array.indexOf( 5 );
        // if ( index > -1 ) { 
        //   array.splice( index, 1 ); // 2nd parameter means remove one item only
        //  } 
       } 

      //   order.variety  =  this.selectedVariety;

      proposedStock  =  this.instruments.filter( 
        ( i )  => i.tradingsymbol  ==  tradingsymbol
       )[0].name;

      this.liveOrderPlacedScripts.push( proposedStock );


// console.log( 'hrs, min',this.hours,this.minutes )
 if(( this.hours == 15 && this.minutes>30 ) || this.hours>15 || this.hours<9 || ( this.hours == 9 && this.minutes<15 )   )
 { 
order.variety  =  "amo";

       }  else { 

order.variety  =  "regular";

       } 

      
      //  order.variety  =  "regular";

      order.params  =  {  } ;
      order.params.exchange  =  "MCX";
      order.params.tradingsymbol  =  tradingsymbol;
      order.params.transaction_type  =  transaction_type;

      order.params.quantity  =  qty;

      order.params.product  =  product;
      order.params.order_type  =  order_type;
      order.params.validity  =  "DAY";

      order.params.price  =  Price;

      return order;
     } ,

    setScriptTradedStatus( symbol, property, value ) { 
      let today  =  this.today(  );

      let trades;

      if ( localStorage.getItem( today )  ==  null ) { 
        trades  =  [];
       }  else { 
        if ( typeof ( localStorage.getItem( today )  ==  "string" )) { 
          trades  =  JSON.parse( localStorage.getItem( today ));
         }  else { 
          trades  =  localStorage.getItem( today );
         } 
       } 

      if ( typeof trades.filter(( t )  => t.symbol  ==  symbol )[0]  ==  "undefined" ) { 
        return false;
       } 

      trades.filter(( t )  => t.symbol  ==  symbol )[0][property]  =  value;

      console.log( "status updated", property, value, symbol );

      let ar2  =  trades.filter(( t )  => t.status  ==  "COMPLETE" );

      let strigified  =  JSON.stringify( trades );
      localStorage.removeItem( today );
      localStorage.setItem( today, strigified );

      // this.localStorage  =  this.setChart( 
      //   JSON.parse( localStorage.getItem( today ))
      //  );
     } ,

    async placeOrder( orderArray ) { 
      const url  =  "/api/PlaceTarget"; //temporary change

      // orderArray.forEach( e =>{ 
      // // this.tradingAlerts.push( ...e.params )

      //  }  )

      let data1  =  JSON.stringify( orderArray );

      let data  =  {  } ;

      data.accessToken  =  this.accessToken;
      data.ZerodhaParams  =  data1;

      // console.log( data1,'data1 of orders just before palcing order ' )

      return axios.post( url, data ).then(( res )  => { 
        // console.log( res,'return of palce order' )
        // this.resetPlacedReverseOrderForAllLiveScripts(  );
        //what about function to remove placed order to false for
        //everey thing and updating
        //live orders
       }  );
     } ,

    resetPlacedReverseOrderForAllLiveScripts(  ) { 
      return false;
      this.livePositions.forEach(( e )  => { 
        this.$set( 
          this.instruments.filter(( i )  => i.tradingsymbol  ==  e.tradingsymbol )[0],
          "PlacedReverseOrder",
          false
         );
       }  );
     } ,

    async proceedForBuy( 
      instrument_token,
      CurrentInstrument,
      element,
      entryPoint1
     ) { 
      // console.log( entryPoint1 );
      // return false

return false;

      let entryPoint  =  this.getHourlySupportPointsBelowReference( 
        instrument_token,
        entryPoint1
       );


          // console.log( 'before entry undefined',CurrentInstrument.tradingsymbol,CurrentInstrument.last_price ,entryPoint )

      if ( typeof entryPoint  ==  "undefined" ) { 
        return false;
       } 


          // console.log( 'before entry point 0a',CurrentInstrument.tradingsymbol,CurrentInstrument.last_price ,entryPoint )

      if ( entryPoint < 0 ) { 
        return false;
       } 
      let {  otherCriteriaCheck, message  }   =  this.otherCriteria( 
        element,
        CurrentInstrument
       );


          //  console.log( 'inside after other criteria',CurrentInstrument.tradingsymbol,CurrentInstrument.last_price ,entryPoint )


if( otherCriteriaCheck == true ){ 
      // console.log( otherCriteriaCheck,'otherCriteriaCheck for ',CurrentInstrument.tradingsymbol,'msg',message )


 } 
      // console.log( otherCriteriaCheck,'otherCriteriaCheck for ',message )

      if ( 
        otherCriteriaCheck  ==  false ||
        typeof otherCriteriaCheck  ==  "undefined"
       ) { 
        // console.log( otherCriteriaCheck,'otherCriteriaCheck' )

        return false;
       } 

      let hoursExcluded  =  [15];

      if ( hoursExcluded.includes( this.hours ) &&
       this.minutes > 0 ) { 
        console.log( "No buying after" + this.hours + 
        " hrs" );

        return false;
       } 

      if ( this.livePositionTotalCost  ==  -1 ) { 
       console.log( 'Positions not loaded properly',this.livePositionTotalCost )
        return false;
       } 

      if ( this.liveOrders[0]  ==  0 ) { 
      console.log( 'liver orders  not loaded properly returning', this.liveOrders )
        // let o = await this.getOrders(  );
        // console.log( o,'refreshing live orders' )
        // return false;
       } 

      let ln  =  this.liveOrders.filter( 
        ( lo )  => lo.instrument_token  ==  instrument_token
       ).length;

      if ( ln > 0 ) { 
        // console.log( 'live order palced already for this symbol',CurrentInstrument.tradingsymbol )
        return false;
       } 

      let proposedStock  =  this.instruments.filter( 
        ( i )  => i.instrument_token  ==  instrument_token
       )[0].name;
      // console.log( proposedStock,'proposedStock' );

      if ( this.liveOrderPlacedScripts.includes( proposedStock )) { 
        // console.log( proposedStock,
        // 'stock already holding ordered' )

        return false;
       } 

      // if( this.proosed )

      if ( this.liveOrderScripts.includes( proposedStock )) { 
        // console.log( proposedStock,'stock has live order ',CurrentInstrument.tradingsymbol )

        return false;
       } 

      if ( this.livePositionScripts.includes( proposedStock )) { 
        // console.log( proposedStock,'stock already holding' )

        return false;
       } 


      let hasHitStopLoss = this.hasAlreadyHitStopLossBefore( element,
        CurrentInstrument,
        instrument_token );

         if ( !hasHitStopLoss ) { 

console.log( 'stop loss not hit before for %s so not buying no', CurrentInstrument.tradingsymbol )
return false;
          } 

      let hasHit  =  this.hasAlreadyHitTargetBefore( 
        element,
        CurrentInstrument,
        instrument_token
       );
      if ( hasHit ) { 

        // console.log( element,'has hit' )
        // return false;
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
      let trade  =  `Buy instrument ${ CurrentInstrument.tradingsymbol }  at ${ 
        CurrentInstrument.pricePoints.yesterday.high
       }  . 
      Target ${ CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget }  
      Strict stop loss at ${ Math.max( 
        CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
        CurrentInstrument.pricePoints.d1.low
       ) }  ,
      TargetProfit ${ 
        ( CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget -
          CurrentInstrument.pricePoints.yesterday.high ) *
        CurrentInstrument.lot_size
       } 
      Possible Loss ${ 
        ( CurrentInstrument.pricePoints.yesterday.high -
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 )) *
        CurrentInstrument.lot_size
       } 
      `;

      let trade1  =  { 
        type: "Entry",

        tradingsymbol: CurrentInstrument.tradingsymbol,
        entry_price: CurrentInstrument.pricePoints.yesterday.high,
        target: CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
        stoploss: Math.max( 
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
          CurrentInstrument.pricePoints.d1.low
         ),
       } ;

      let trade2  =  JSON.stringify( trade1 );

      this.sendToTelegramGroup( trade );
      this.writeTrades( trade2 + "," );

      //checking the trade exeeds the maximum tradable regularunt   add live palced buy order in nfo

      // if( this.livePositionTotalCost<this.maxTradableAmount ){ 

      if ( 
        CurrentInstrument.instrument_type  ==  "CE" ||
        CurrentInstrument.instrument_type  ==  "PE"
       ) { 
        this.proposedBuyAmount  =  entryPoint * CurrentInstrument.lot_size;

        // console.log( 
        //   "Proposed regularunt ",
        //   this.proposedBuyAmount,
        //   "for",
        //   CurrentInstrument.tradingsymbol
        //  );
        if ( this.liveTradablebalance > 0 ) { 
          // var audio  =  new Audio( "/sounds/mixkit-sci-fi-confirmation-914.wav" );
          //audio.play(  );

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
          // let Price  =  CurrentInstrument.pricePoints.yesterday.high;
          let Price  =  entryPoint;

          let currentPrice  =  lot_size * Price;
          this.totalBuyOrderLivePlacedBySoftware  = 
            this.totalBuyOrderLivePlacedBySoftware + currentPrice;

          this.proposedBuyAmount  =  0;
          //  let Price = priceSell1;
          let product  =  "NRML";
          let arr  =  this.buildOrderArray( 
            tradingsymbol,
            transaction_type,

            lot_size,
            order_type,
            Price,
            product
           );

          // console.log( arr );

          let orderArray  =  [arr];
          // return;
          let a  =  await this.placeOrder( orderArray );
          // console.log( "place order result", a );

          this.counter  =  this.counter + 1;
          // console.log( 
          //   "Placing Buy Order for :",
          //   tradingsymbol,
          //   this.counter,
          //   CurrentInstrument.buyNow,
          //   CurrentInstrument
          //  );

          this.userMessages.push( 
            "firing of auto mode+ buy now false",
            this.counter,
            CurrentInstrument.buyNow,
            CurrentInstrument
           );
         }  else { 
          this.userMessages.push( "Maximum tradable regularut Exceeded" );
          console.log( 
            "Maximum tradable regularut Exceeded",
            this.liveTradablebalance
           );
         } 
       } 
     } ,

    setcandleColour( inst, instrument_token ) { 
      if ( inst.previousPrice < inst.last_price ) { 
        this.$set( 
          this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0],
          "candle",
          "green"
         );

        // console.log( `Pvs price of green ${ inst.tradingsymbol }  is ${ inst.previousPrice }  and last price is ${ inst.last_price } ` )
       }  else { 
        this.$set( 
          this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0],
          "candle",
          "red"
         );

        // console.log( `Pvs price of red ${ inst.tradingsymbol }  is ${ inst.previousPrice }  and last price is ${ inst.last_price } ` )
       } 
     } ,

    procedureForOptionsShortCovering( 
      CurrentInstrument,
      instrument_token,
      element,
      product,
      quantity
     ) { 
      // console.log( arguments,
      // 'arguments for procedureForOptionsShortCovering' )

      return false;
     } ,

    async placetargetAndStopLoss( 
      CurrentInstrument,
      instrument_token,
      element,
      product,
      quantity,
      targetPoint,
      livePnl,
      fireTargetDefault  =  false
     ) { 
      if ( fireTargetDefault  ==  false ) { 
        return false;
       } 

      // let targetPoint =  CurrentInstrument.pricePoints.d1.high;
      let misTarget  =  this.getMisPricePointofScript( 
        instrument_token,
        targetPoint
       );
      let trailingStopLoss  =  this.getTrailingStopLoss( 
        instrument_token,
        livePnl
       );
      let sl  =  Math.max( 
        CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
        CurrentInstrument.pricePoints.d1.low,
        trailingStopLoss
       );

      //   console.log( 'pl target',
      //   CurrentInstrument.tradingsymbol,
      //  ' misTarget',misTarget,'trailingStopLoss',trailingStopLoss,
      //  'last price',element.last_price
      //    )

      //// procedure for futures  end here

      // if ( 
      //   CurrentInstrument.last_price >
      //   CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget
      //  )

      if ( quantity < 0 ) { 
        this.procedureForOptionsShortCovering( 
          CurrentInstrument,
          instrument_token,
          ( element  =  0 ),
          product,
          quantity,
          ( fireTargetDefault  =  false )
         );
        return false;
       } 

      // console.log( 'fireTargetDefault',fireTargetDefault,CurrentInstrument.tradingsymbol )

      if ( CurrentInstrument.last_price >=  misTarget || fireTargetDefault ) { 
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

        let trade  =  `Target hit at  ${ CurrentInstrument.tradingsymbol }  at        ${ misTarget } `;

        let trade1  =  { 
          type: "Target",

          tradingsymbol: CurrentInstrument.tradingsymbol,
          entry_price: CurrentInstrument.pricePoints.yesterday.high,
          target: misTarget,
          stoploss: Math.max( 
            CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
            CurrentInstrument.pricePoints.d1.low
           ),
         } ;

        let trade2  =  JSON.stringify( trade1 );

        this.writeTrades( trade2 + "," );
        this.sendToTelegramGroup( trade );
        this.userMessages.push( trade );
        ////target buys

        //                                 var audio  =  new Audio( '/sounds/mixkit-sci-fi-confirmation-914.wav' );
        // //audio.play(  );

        let transaction_type  =  "SELL";

        let tradingsymbol  =  CurrentInstrument.tradingsymbol;

        let lot_size  =  CurrentInstrument.lot_size;
        let order_type  =  "LIMIT";

        let priceBuy2;
        if ( fireTargetDefault ) { 

          let p  =  CurrentInstrument.pricePoints.yesterday.high;
          priceBuy2  =  this.getMisPricePointofScript( instrument_token,p )

          let PlacedReverseOrder  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].PlacedReverseOrder;

          let hasLiveTarget  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].hasLiveTarget;



          if ( PlacedReverseOrder  ==  true || hasLiveTarget  ==  true ) { 
            return false;
           } 




         }  else { 


          priceBuy2  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
            .price;
         } 

        // console.log( 
        //   priceBuy2,
        //   "priceBuy2* avg*1.1",
        //   CurrentInstrument.average_price
        //  );

        let average_price = this.livePositions.filter( lp =>lp.instrument_token == 
        instrument_token )[0].average_price

          //  console.log( priceBuy2,'priceBuy2',
          // CurrentInstrument.tradingsymbol,'CurrentInstrument.average_price',average_price )


        // if ( priceBuy2 > average_price ) 
        if ( true ) 
        
        { 


       
          //  console.log( 'priceBuy1','priceBuy2',priceBuy2 )
          //  let Price = Math.round( CurrentInstrument.SevenDayMaxMin.Max*1.1,1 );
          let Price  =  priceBuy2;
          // let product = 'NRML'

          let arr  =  this.buildOrderArray( 
            tradingsymbol,
            transaction_type,

            lot_size,
            order_type,
            Price,
            product
           );

          this.$set( 
            this.instruments.filter( 
              ( i )  => i.instrument_token  ==  instrument_token
             )[0],
            "PlacedReverseOrder",
            true
           );

          let orderArray  =  [];

          // console.log( arr, "plain array" );
          orderArray.push( arr );

          // console.log( 
          //   "order array inside tgtsl fn",
          //   JSON.stringify( orderArray )
          //  );

          // console.log( trade, "firing target", "@", Price );

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
        Math.max( 
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed( 1 ),
          CurrentInstrument.pricePoints.d1.low,
          trailingStopLoss
         )
       ) { 
        if ( fireTargetDefault  ==  true ) { 
          return false;
         } 

        let trade  =  `Sl hit  ${ CurrentInstrument.tradingsymbol }  at 
      
      
      ${ sl } `;

        // this.sendToTelegramGroup( trade );

        //target sells

        //    var audio  =  new Audio( '/sounds/mixkit-sci-fi-confirmation-914.wav' );
        // //audio.play(  );

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

        // console.log( "stop loss array below" );
        // console.log( JSON.stringify( arr ));

        let orderArray  =  [arr];

        let a  =  await this.placeOrder( orderArray );

        // this.orderArray.push( orderArray );

        // console.log( 
        //   "order array inside tgtsl fn",
        //   JSON.stringify( this.orderArray )
        //  );

        // console.log( trade, "firing stop loss", "@", Price );

        let trade1  =  { 
          type: "stoploss",

          tradingsymbol: CurrentInstrument.tradingsymbol,
          entry_price: CurrentInstrument.pricePoints.yesterday.high,
          target: CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
          stoploss: sl,
         } ;

        let trade2  =  JSON.stringify( trade1 );

        this.writeTrades( trade2 + "," );

        // console.log( trade, "firing stop loss" );

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

    otherCriteria( s, CurrentInstrument ) { 
      try { 
        let element  =  s;

        if ( element.last_price < 2 ) { 
          let ob  =  {  } ;
          ob.otherCriteriaCheck  =  false;
          ob.message  =  "last price less than 2";
          return ob;
         } 

        let a  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0].price;

        let b  =  element.depth.sell.sort(( a, b )  => a.price - b.price )[0].price;

        let b1  =  element.depth.sell.sort(( a, b )  => a.price - b.price )[1].price;

        let b1b  =  b1 - b;

        let b1bpc  =  ( b1b / b ) * 100;

        if ( b1bpc > 50 ) { 
          let ob  =  {  } ;
          ob.otherCriteriaCheck  =  false;
          ob.message  =  "b1bpc greater than 50";
          return ob;
         } 

        let c  =  Math.abs( b - a );

        let lpPc  =  ( c / element.last_price ) * 100;

        if ( lpPc > 25 || !isFinite( lpPc )) { 
          // console.log( 'buy sell offers large diff or infinity ',CurrentInstrument.tradingsymbol,lpPc )
          // console.log( b1bpc,'b1bpc' )
          //  return false;
         } 

        if ( s.ohlc.open  ==  s.ohlc.high ) { 
          // console.log( 'open and high are same not buying',CurrentInstrument.tradingsymbol )

          let ob  =  {  } ;
          ob.otherCriteriaCheck  =  false;
          ob.message  =  "s.ohlc.open == s.ohlc.high";
          return ob;
          return false;
         } 

        if ( s.ohlc.open  ==  s.ohlc.high && s.ohlc.close  ==  s.ohlc.open ) { 
          let ob  =  {  } ;
          ob.otherCriteriaCheck  =  false;
          ob.message  =  "s.ohlc.open == s.ohlc.high && s.ohlc.close == s.ohlc.open";
          return ob;
          // console.log( 'open and high are same not buying',CurrentInstrument.tradingsymbol )
          return false;
         } 

        if ( s.ohlc.low <=  s.last_price && s.ohlc.high >=  s.last_price ) { 
          //verifying whether last price is in todays tick range  if failed no buying
          // console.log( CurrentInstrument.tradingsymbol,'l2' )
          // console.log( 'here4' )
          // return false
         } 

        if ( s.ohlc.open > CurrentInstrument.pricePoints.yesterday.high ) { 
          let ob  =  {  } ;
          ob.otherCriteriaCheck  =  false;
          ob.message  =  "s.ohlc.open > yesterday high";
          //  return ob;
          // return false;
         } 

        if ( s.ohlc.open < s.ohlc.close ) { 
          let ob  =  {  } ;
          ob.otherCriteriaCheck  =  false;
          ob.message  =  "s.ohlc.open < s.ohlc.close";
          return ob;
          return false;
         } 

        //       if( s.ohlc.open<CurrentInstrument.pricePoints.yesterday.low )
        //       { 

        // //i donet know why i puth this
        // console.log( 's.ohlc.open<CurrentInstrument.pricePoints.yesterday.low' )

        //         return false;
        //        } 

        try { 
          if ( 
            CurrentInstrument.pricePoints.d1.range >
            CurrentInstrument.pricePoints.d2.range
           ) { 
            // console.warn( CurrentInstrument.pricePoints.d1.range,
            // 'D1 range greater than',
            // CurrentInstrument.pricePoints.d2.range,' d2 range for :',
            // CurrentInstrument.tradingsymbol )

            let ob  =  {  } ;
            ob.otherCriteriaCheck  =  false;
            ob.message  =  "d1 range> d2 range";
            return ob;

            return false;
           } 
         }  catch ( e ) { 
          console.log( e );

          let ob  =  {  } ;
          ob.result  =  false;
          ob.message  =  "unkonown error";
          return ob;

          return false;
         } 

        //sma volume //price

        let ob  =  {  } ;
        ob.otherCriteriaCheck  =  true;
        ob.message  =  "perfect ok";
        return ob;
       }  catch ( error ) { 
        let ob  =  {  } ;
        ob.otherCriteriaCheck  =  false;
        ob.message  =  error;
        return ob;
       } 
     } ,

    hasAlreadyHitTargetBefore( element, CurrentInstrument, instrument_token ) { 
   
      let ts  =  this.instruments.filter( 
        ( i )  => i.instrument_token  ==  instrument_token
       )[0].tradingsymbol;



     
      let targetPoint  =  CurrentInstrument.pricePoints.d1.high;

      let misTarget  =  this.getMisPricePointofScript( 
        instrument_token,
        targetPoint
       );

      if ( element.ohlc.high > misTarget ) { 

        return true;
       }  else { 

        return false;
       } 
     } ,  
    
    hasAlreadyHitStopLossBefore( element, CurrentInstrument, instrument_token ) { 
   
      let ts  =  this.instruments.filter( 
        ( i )  => i.instrument_token  ==  instrument_token
       )[0].tradingsymbol;


      
//  let last_price  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
//             .price;
     
      let targetPoint  =  CurrentInstrument.pricePoints.d1.low;

//  console.log( 'inside stop loss fn for  %s and stop low is %s and current price is %s '
//  , CurrentInstrument.tradingsymbol,element.ohlc.low )

      if ( element.ohlc.low <=  targetPoint ) { 

        return true;
       }  else { 

        return false;
       } 
     } ,

    mutateWithLtp( s ) { 
      this.CurrentCheckDigit++;
      this.heartBeat  =  !this.heartBeat;

      // console.log( s.length )
      s.forEach(( element )  => { 
      

        let instrument_token  =  element.instrument_token;
       
      //  let last_price  =  element.last_price;
       let last_price  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
            .price;

       
       
       
       let average_price  =  element.average_price;

        // try { 
        let CurrentInstrument  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0];

        if ( typeof CurrentInstrument  ==  "undefined" ) { 
          // console.log( "CurrentInstrument == 'undefined" ,instrument_token );

          // this.updateMissingScriptInInstrumetsFile( instrument_token )
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
          // consooe.log(  )
          return false;
         } 

        this.$set( 
          this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0],
          "previousPrice",
          this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].last_price
         );


  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0].last_price  =  last_price;


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
          
console.log( 'current instrument is %s and entry point is %s and current price is %s',

CurrentInstrument.tradingsymbol,entryPoint,last_price
 )


          let hourlyPricePoints  =  this.hourlyPricePointsofLiveDay.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           );

          let yesterdayCandleColor  = 
            CurrentInstrument.otherCriteria.candleColor;

          if ( yesterdayCandleColor  ==  "green" ) { 
            // entryPoint  =  element.ohlc.close;
            // entryPoint  =  CurrentInstrument.pricePoints.d1.close;
            entryPoint  =  CurrentInstrument.pricePoints.d1.open;

            // targetPoint  =  CurrentInstrument.pricePoints.d1.high - 0.15;
            targetPoint  =  CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;
           }  else if ( yesterdayCandleColor  ==  "red" ) { 
            // entryPoint  =  element.ohlc.open;


            // entryPoint  =  CurrentInstrument.pricePoints.d1.high; break out logic
            entryPoint  =  CurrentInstrument.pricePoints.d1.close;


              

            // targetPoint  =  CurrentInstrument.pricePoints.d1.high - 0.15; ///yesterdays closing point
            targetPoint  =  CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;; ///yesterdays closing point

            // yesterday candle red
            //   buy at yesterday close and sell at yesterday open

            //trailing stop loss  price point at low of current candle
           } 
         }  catch ( error ) { 
          console.log( error, "error target entry " );
          return false;
         } 

        /////entry exit logic ends

      

        let ls  =  {  } ;

        ls.tradingsymbol  =  CurrentInstrument.tradingsymbol;
        ls.ltp  =  last_price;
        ls.buyPoint  =  CurrentInstrument.pricePoints.d1.high;
        ls.target  =  CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;
        ls.stopLoss  =  CurrentInstrument.pricePoints.d1.low;

        // console.log( ls.tradingsymbol )

        let inst  =  this.instruments.filter( 
          ( i )  => i.instrument_token  ==  instrument_token
         )[0];

        if ( inst.previousPrice  ==  0 ) { 
          return false;
         } 

        if ( inst.previousPrice !=  0 ) { 
           this.setcandleColour( inst,instrument_token )
         } 

        /////////////////////////////////////////////

        /////////////////////////////////////////////

        /////////////////auto mode false

        ////////////////////auto mode true

        // if ( this.AutoMode )

        // console.log( 'CurrentInstrument.buyNow',CurrentInstrument.buyNow )

        this.liveScript  =  ls;

        //////sl and target

        let ln  =  this.livePositions.filter( 
          ( lp )  => lp.instrument_token  ==  CurrentInstrument.instrument_token
         ).length;
if( !ln == 0 ){ 

        // console.log( 'this.live pos nit 0',CurrentInstrument.instrument_token,ln,CurrentInstrument.tradingsymbol )

 } 

        if ( ln > 0 ) { 
          let product  =  this.livePositions.filter( 
            ( lp )  => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].product;

          let livePnl  =  this.livePositions.filter( 
            ( lp )  => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].pnl;


       
let buy_price = this.livePositions.filter( 
            ( lp )  => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].buy_price;

          let buyQuantity = this.livePositions.filter( 
            ( lp )  => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].buy_quantity;
          



           let offerPrice  =  element.depth.buy.sort(( a, b )  => b.price - a.price )[0]
            .price;

            let p;



            let livePnlOffered = ( offerPrice-buy_price )*buyQuantity;

            

           





          let quantity  =  this.livePositions.filter( 
            ( lp )  => lp.instrument_token  ==  CurrentInstrument.instrument_token
           )[0].quantity;
          // this.userMessages.push( 'there is a live position',CurrentInstrument.tradingsymbol );
          // console.log( 
          //   "there is a live position",
          //   CurrentInstrument.tradingsymbol
          //  );

          //there is a live position

          //check whether already a reverse order placed

          let PlacedReverseOrder  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].PlacedReverseOrder;

          let hasLiveTarget  =  this.instruments.filter( 
            ( i )  => i.instrument_token  ==  instrument_token
           )[0].hasLiveTarget;


//  console.log( 'firing squqring of  ',CurrentInstrument.tradingsymbol )





          if ( PlacedReverseOrder  ==  true || hasLiveTarget  ==  true ) { 

          

//// update sell order if below stop loss

if ( hasLiveTarget  ==  true ) //double checking whther ther is a live sell order
{ 
 /// various cases of order modification 1. stop loss triggering

// console.log( 'befire switch' )




      let twoHoursBefore  =  new Date(  );
      twoHoursBefore .setHours( twoHoursBefore. getHours(  ) - 2 );
let executionTime;
   if( typeof this.executedBuyOrdersTime.
              filter( i =>i.instrument_token == CurrentInstrument.instrument_token )[0] == 'undefined' ){ 


executionTime = moment(  ).format( 'Y-MM-DD 09:15:00' )


               } else{ 

  executionTime = this.executedBuyOrdersTime.
              filter( i =>i.instrument_token == CurrentInstrument.instrument_token )[0].exchange_update_timestamp;



               } // if(( twoHoursBefore - new Date( executionTime )) > 0 ){ 

// // console.log( true,twoHoursBefore ,'twoHoursBefore ',new Date( executionTime ),'executionTime' )


//  } else{ 

// // console.log( false,twoHoursBefore ,'twoHoursBefore after  ',executionTime,'executionTime' )


//  } 

  // console.log( 'live pnl is %d and symbol is %s',livePnl,CurrentInstrument.tradingsymbol )


if( !this.holdingScripts.includes( CurrentInstrument.tradingsymbol )){ 
this.holdingScripts.push( CurrentInstrument.tradingsymbol )

 } 

// console.log( 'holding scripts length is %d',this.holdingScripts.length )

//  console.log( 'livePnl trigger for %s is %s  ',CurrentInstrument.tradingsymbol,livePnl );



console.log( 'live pnl is %s and offred pnl is $s for %s ',livePnl,livePnlOffered,
CurrentInstrument.tradingsymbol )



livePnl = livePnlOffered
switch( true ){ 

// case true:


// break;




case ( livePnl>2000 && (( this.hours == 14 && this.minutes>30  )|| this.hours>15 )   ):

 console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break;


  case ( livePnl>1000 && (( this.hours == 15 && this.minutes>1  ))   ):

 console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break; 
  
  case ( livePnl>0 && (( this.hours == 15 && this.minutes>10  ))   ):

 console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break;


  case (( ( this.hours == 15 && this.minutes>15  ))   ):

//  console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break;




  case ( livePnl>= 500 ):

//  console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,
  offerPrice )

  break;


    case ( this.hours == 15 && this.minutes>= 17 && this.hours == 15 && this.minutes<= 29 ):

    console.log( CurrentInstrument.tradingsymbol,'updating to latest price 15 hrs' )

this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true,offerPrice )


  break;


case ( livePnl<=  -2000 ):

 console.log( livePnl ,'loss trigering below 2 k ',CurrentInstrument.tradingsymbol );

  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false )

  break;


case ( livePnl>1000 ):

//  console.log( livePnl ,'livePnl trigger for 1000 profit ',CurrentInstrument.tradingsymbol );

//  this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice  )

  break;


  case ( livePnl>500 ):

//  console.log( livePnl ,'livePnl trigger for 500 profit ',CurrentInstrument.tradingsymbol );

  // this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,offerPrice )

  break;



case (( twoHoursBefore - new Date( executionTime )) > 0 ):

//  console.log( livePnl ,'livePnl trigger for 2 hr timer ',CurrentInstrument.tradingsymbol );

  // this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false )
break;




// case ( CurrentInstrument.last_price<= CurrentInstrument.pricePoints.d1.low ):
case ( CurrentInstrument.last_price<= ( element.ohlc.low-.05*4 )):

/// los bewlow todays low minus 4 ticks 


this. updateSellorderWithDesiredPrice( CurrentInstrument,element,false,element.ohlc.low-.05*4 )


  break;

  case ( this.hours == 15 && this.minutes>= 1 && this.hours == 15 && this.minutes<= 3 ):

    console.log( CurrentInstrument.tradingsymbol,'updating to latest price' )

this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true )


  break;

   case ( this.hours == 12 && this.minutes>= 25 && this.hours == 12 && this.minutes<= 28 ):

// this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true )


  break;


   case ( this.hours == 11 && this.minutes>= 5 && this.hours == 11 && this.minutes<= 8 ):

// this. updateSellorderWithDesiredPrice( CurrentInstrument,element,true )


  break;



 } 




 } 





            // console.log( 

            //   CurrentInstrument.tradingsymbol,
            //   "PlacedReverseOrder",
            //   PlacedReverseOrder,
            //   "has live target",
            //   hasLiveTarget
            //  );

            // this.userMessages.push( 'reverse order alredy placed',CurrentInstrument.tradingsymbol )

            // console.log( 
            //   "PlacedReverseOrder",
            //   PlacedReverseOrder,
            //   "hasLiveTarget",
            //   hasLiveTarget
            //  );
            // console.log( 
            //   "reverse order alredy placed",
            //   CurrentInstrument.tradingsymbol
            //  );

            return false;
           }  else { 
            // this.userMessages.push( 'going to place reverese order',CurrentInstrument.tradingsymbol );
            // console.log( 
            //   "going to place reverese order",
            //   CurrentInstrument.tradingsymbol
            //  );

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

          /// now checking whter stop loss or target

          ///
         } 

        //////sl and target

        if ( CurrentInstrument.buyNow  ==  false ) { 
          //not triggred earlier
          // if( inst.previousPrice<inst.last_price )

          // if ( 
          //   CurrentInstrument.last_price >
          //   CurrentInstrument.SevenDayMaxMin.Max && inst.previousPrice<= CurrentInstrument.SevenDayMaxMin.Max

          //  )

          //new range breakout yesterday

          // console.log( 'for' ,CurrentInstrument.tradingsymbol,'Entry price is',CurrentInstrument.pricePoints.yesterday.high ,'and last price is ',CurrentInstrument.last_price,'CurrentInstrument.buyNow',CurrentInstrument.buyNow,inst.previousPrice )

          //  inst.previousPrice <= 

          //             CurrentInstrument.pricePoints.yesterday.high
          // console.log( element.ohlc,'ohl',CurrentInstrument.tradingsymbol )

          ////////////////////////////////////

          /////////////////////

          // if ( 

          //     inst.previousPrice <= 

          //             CurrentInstrument.pricePoints.yesterday.close &&
          //   CurrentInstrument.last_price >= 
          //   CurrentInstrument.pricePoints.yesterday.close
          //  )
          //  entryPoint

          /// new logic

          //

          // &&
          //              inst.previousPrice <= entryPoint

          //  inst.previousPrice <=  entryPoint &&


  // inst.previousPrice <=  entryPoint && 

//      console.log( CurrentInstrument.tradingsymbol,
//             'here4','CurrentInstrument.buyNow range break out',
//             CurrentInstrument.buyNow, 'entry point is %s and last price is %s entry point higher than last price is %s',
//             entryPoint,CurrentInstrument.last_price,

//  entryPoint>= CurrentInstrument.last_price


//              );

            // 

          if ( 
           inst.previousPrice <=  entryPoint &&
         CurrentInstrument.last_price >=  entryPoint  
           ) 
          
          { 
            
            this.proceedForBuy( 
              instrument_token,
              CurrentInstrument,
              element,
              entryPoint
             );
            return true;
           } 
         }  ///already palced order .... so check whte there is live position


     




        

        //// checking whter there is live postions

        //measns already bought
        //    } 
        //  else { 
        //   this.$set( 
        //     this.instruments.filter( 
        //       ( i )  => i.instrument_token  ==  instrument_token
        //      )[0],
        //     "buyNow",
        //     false
        //    );
        //  } 

        return;
        //  }  catch ( error ) { 

        //   console.log( "some error has occured ", error );
        //  } 

        //////////////////////////
       }  );
     } ,

    setInstrumentTokens(  ) { 
      return new Promise(( res, rej )  => { 
        this.instrumentTokens  =  this.instruments.map(( i )  =>
          parseInt( i.instrument_token )
         );
        // this.instrumentTokens.push( 14523906 );

        res( true );
       }  );
     } ,

    mutateOrdersWithLtp( s ) { 
      s.forEach(( element )  => { 
        let instrument_token  =  element.instrument_token;
        let last_price  =  element.last_price;
        let average_price  =  element.average_price;




        console.log( 
          instru.filter(( e )  => e.instrument_token  ==  element.instrument_token )
         );
        return;
        this.instruments.filter( 
          ( e )  => e.instrument_token  ==  instrument_token
         )[0].last_price  =  last_price;

        this.symbols
          .filter(( o )  => o.instr  ==  instrument_token )
          .forEach(( e )  => { 
            this.$set( e, "previous_last", e.last_price );
            this.$set( e, "last_price", last_price );

            if ( e.previous_last < e.last_price ) { 
              this.$set( e, "candleColor", "green" );
             }  else if ( e.previous_last > e.last_price ) { 
              this.$set( e, "candleColor", "red" );
             }  else if ( e.previous_last  ==  e.last_price ) { 
              this.$set( e, "candleColor", "grey" );
             } 

            this.$set( e, "live_gain", last_price );
            this.$set( e, "average_price", average_price );
           }  );
       }  );
     } ,
   } ,

  watch: { 
    livePositions( o, n ) { 
    
     } ,

    hourlyPricePointsofLiveDay( n, o ) { 
      if ( o.length  ==  0 || n.length  ==  0 ) { 
        console.log( "calling hourly candles" );
        // if ( this.livePositions.length > 0 ) { 
          // this.getHourlyCandleLows(  );
        //  } 
       } 
     } ,
   } ,

  data(  ) { 
    return { 

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
      livePositionTotalCost: -2,
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
     } ;
   } ,

  name: "Mining",
 } ;
</script>

<style lang = "scss" scoped>
input { 
  border: 1px solid rgb( 147, 206, 221 );
  box-shadow: #327094;
 } 
.fixTableHead { 
  overflow-y: auto;
 } 
.fixTableHead thead th { 
  position: sticky;
  top: 0;
 } 
table { 
  border-collapse: collapse;
  width: 100%;
 } 
th,
td { 
  padding: 8px 15px;
  border: 2px solid #327094;
 } 
th { 
  background: #93cedd;
 } 
// .red { 
//   background: white;
//   color: rgb( 109, 86, 86 );

//  } 

// .green { 
//   background: white;
//  color: rgb( 94, 136, 94 );

//  } 
</style>