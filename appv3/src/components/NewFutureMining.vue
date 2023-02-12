<template>
  <div>

    <!-- {{hourlyPricePointsofLiveDay.map(i=>i.instrument_token).length}}hourlyPricePointsofLiveDay length -->

  <!-- {{instrumentTokens}} -->
    <v-alert >Vikram


<!-- {{indices}}indices -->
<IndicesTable :indices="indices"></IndicesTable>

<!-- <Messages  :messages=userMessages ></Messages> -->


      <v-chip color="green" title="Current Check Digit">
      {{ CurrentCheckDigit }}</v-chip
    >
    <v-chip color="red" title="Lagging Check Digit">{{
      laggingCheckDigit
    }}</v-chip>

    <v-chip color="orange" v-if="webSocketNotActive">
      Check Web Sockets
    </v-chip>


    <v-btn @click="updateSelectedSellorderWithLtp()">Update Sell orders with LTP </v-btn>

    <v-row class="mt-1">
      <v-col>
        <v-row>
          <v-col>
            <v-chip>
              Live Position cost {{ livePositionTotalCost }} Live Buy order
              Amount {{ liveBuyOrderAmount }} &nbsp; Live Tradable Balance
              {{ liveTradablebalance }}</v-chip
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-icon
          color="red"
          v-if="heartBeat"
          title="if This symbol changes color switches between red and blue system is conencted to market"
        >
        1
          mdi-heart
        </v-icon>

        <v-icon
          color="green"
          v-if="!heartBeat"
          title="if This symbol changes color switches between red and blue system is conencted to market"
        >0
          mdi-heart
        </v-icon>
      </v-col>
      <v-col>
        <img
          v-if="chat_id < -1"
          src="https://img.icons8.com/color/48/000000/twitter--v2.png"
        />
      </v-col>

      <v-col>
        <v-icon color="blue">mdi-clock</v-icon> {{ hours }}: {{ minutes }} :
        {{ seconds }}
      </v-col>

      <v-col>
        <v-btn
          @clck="resetUserMessages()"
          small
          color="red"
          title="reset user messages"
        >
          <v-icon>mdi-power-cycle</v-icon>
        </v-btn></v-col
      >

      <v-col>
        <input
          title="Maximum Tradable Amount"
          type="text"
          class="form-control"
          v-model="maxTradableAmount"
          placeholder="Maximum Tradable Amount"
        />
      </v-col>

      <v-col>
        <v-btn
          v-if="!AutoMode"
          @click="AutoMode = true"
          title="Switch to Auto"
          icon
          color="green"
        >
          <v-icon>mdi-send-clock-outline</v-icon> </v-btn
        ><v-btn
          v-if="AutoMode"
          @click="AutoMode = false"
          title=" Switch to Manual"
          icon
          color="red"
        >
          <v-icon>mdi-send-lock</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <div class="col" style="height: 300px; overflow: auto">
        <v-btn @click="getLatestPricesOfClosedScripts()"
          >get latest prices</v-btn
        >
        Closed Trades
        <v-chip
          :color="closedTradesScriptsPnl > 0 ? 'green' : 'red'"
          class="pb-2 mb-2"
        >
          Profit and Loss of Closed positions {{ closedTradesScriptsPnl }}
        </v-chip>

        Total :{{ closedTradesScripts.length }}
        <ClosedTrades :closedTradesScripts="closedTradesScripts"></ClosedTrades>
      </div>
    </v-alert>

    <!-- {{liveMargin}} -->
<!-- {{hourlyPricePointsofLiveDay}}hourlyPricePointsofLiveDay -->



<!-- {{currentTick[0]}} -->


<v-btn @click="getProxyTotal()">get proxy total</v-btn>

proxyTotal {{ proxyTotal }}

{{hourlyPricePointsofLiveDay.length}}hourlyPricePointsofLiveDay.length

<Margin @margin-updated="marginUpdated"></Margin>

<div>


  <table class="table">
    <tr v-for ="(item,index) in proxyPositions1" :key="index">
      <td>{{index+1}}</td>
      <td> {{item.instrument.tradingsymbol}}</td>
      <td> {{item.entryPrice}}</td>
      <td> {{item.squaredOff}}</td>
      

      <td>
{{item.last_price}} /
{{item.exitPrice}} /
{{item.instrument.lot_size}} /
{{item.entryPrice}} /

{{item.squaredOff}}


      </td>
      <td v-if="item.squaredOff">

        {{
          
          
          
          (item.exitPrice-item.entryPrice)*item.instrument.lot_size}}

      </td>
       <td v-if="!item.squaredOff && !item.last_price==0">

        {{(item.last_price-item.entryPrice)*item.instrument.lot_size}}

      </td>

      <td v-else> 
        0
      </td>


      <td></td>
    </tr>
  </table>
 



</div>


<v-dialog
      v-model="dialog"
      max-width="290"
    >
<v-alert>
<ul>
  <li v-for="alert in alerts" :key="alert.code">
  {{alert.message}}
  </li>
</ul>

</v-alert>
  </v-dialog>

<v-btn color="green"

@click="placeTargetsForLiveScripts()"
>PLACE TARGETS FOR LIVE SCRIPTS</v-btn>

<v-btn @click="showStatusTable=!showStatusTable">Toggle Status table</v-btn>
<v-btn @click="showStrategiesTable=!showStrategiesTable">Toggle Strategies table</v-btn>
<v-btn @click="showLongtradeShortTradeTable=!showLongtradeShortTradeTable">Toggle Long trade Short Trade Table</v-btn>

<v-btn @click="forceUpdateMissingScripts()">Force update Missing scripts</v-btn>
   


    <v-alert v-if="loadingHourlyTradingLows" type="info">
      Loaiding Hourly candles
    </v-alert>
    <div class="row">
      <!-- <div class="col" style="width: 50px; overflow-y: 'auto'">
        <LiveTickView :liveScript="liveScript"></LiveTickView>
      </div> -->

      <!-- <div class="col" style="width: 50px; overflow-y: 'auto'">
       
      </div> -->

      <v-chip
        >FORGONE :{{ totalForgone.toFixed(1) }} FORGONE TARGET :{{
          totalForgoneFortarget.toFixed(1)
        }}
        FORGONE SL :{{ totalForgoneForStopLoss.toFixed(1) }}
      </v-chip>
   
    </div>

   

    <!-- {{hourlyPricePointsofLiveDay}}hourlyPricePointsofLiveDay -->
<!-- {{hourlyPricePointsofLiveDay}}hourlyPricePointsofLiveDay -->

<!-- {{livePositions}}livePositions -->


<!-- {{instrumentsDisplay}}instrumentsDisplay -->

<!-- {{instruments}}instruments -->



<v-row>
  <v-col>
    Force Manual reverseOrder

    {{manualReverseOrder}}
<input type="checkbox"
@change="forceManualReverseOrder" v-model="manualReverseOrder" 
 >

  </v-col>
</v-row>




<table v-if="showStatusTable && instruments.length>0">
  <tr v-for="(inst,index) in instruments" :key="index" >
    <td>{{inst.tradingsymbol}}</td>

    <td 
    :class="{
      'bg-danger':inst.hasLiveTarget==false,
      'bg-success':inst.hasLiveTarget==true,
  
  }"
    
    >

    hasLiveTarget
Has Live Target {{inst.hasLiveTarget}}

    </td>  <td 
    :class="{
      'bg-danger':inst.hasLivePosition==false,
      'bg-success':inst.hasLivePosition==true,
  
  }"
    
    >
Has Live Position {{inst.hasLivePosition}}

    </td>
    <td

   
    :class="{
      'bg-danger':inst.enterNowToTrade==false,
      'bg-success':inst.enterNowToTrade==true,
  
  }"
    > 
    <!-- {{inst.enterNowToTrade}}inst.enterNowToTrade -->
    
    ENTER NOW TO TRADE {{inst.enterNowToTrade}}</td>
    <td
    :class="{
      'bg-danger':inst.PlacedReverseOrder==false,
      'bg-success':inst.PlacedReverseOrder==true,
  
  }"
    
    > Placed Reverse order 
    {{inst.PlacedReverseOrder}}
  
  </td>
  </tr>
</table>

    <table v-if="typeof hourlyPricePointsofLiveDay=='object'">
      <table v-if="showStrategiesTable">
        <thead>
          <th>symbol</th>
          <th>Current long</th>
          <th>Currlong target</th>
          <th>Current long Stop loss</th>
          <th>Current short</th>
          <th>Curr short target</th>
          <th>Current short Stop loss</th>
        </thead>
        <tr
          v-for="(script, index) in hourlyPricePointsofLiveDay"
          :key="index"
          class="col-small"
        >
          <td>{{ script.instrument.tradingsymbol }}
         <v-chip>Time
            {{ getLatestPricePoints(script.instrument.instrument_token).dateIST}}</v-chip> 

            <!-- <v-chip>LTP{{instrumentsDisplay.filter(i=>i.tradingsymbol==script.instrument.tradingsymbol)[0].last_price}}</v-chip> -->


          </td>
          <td>
            {{ getLatestPricePoints(script.instrument.instrument_token).high }}
          </td>
          <td>
            {{
              getLatestPricePoints(script.instrument.instrument_token)
                .upperBreakOutTarget
            }}
          </td>
          <td>
            {{ getLatestPricePoints(script.instrument.instrument_token).low }}
          </td>

          <td>
            {{ getLatestPricePoints(script.instrument.instrument_token).low }}
          </td>
          <td>
            {{
              getLatestPricePoints(script.instrument.instrument_token)
                .lowerBreakOutTarget
            }}
          </td>
          <td>
            {{ getLatestPricePoints(script.instrument.instrument_token).high }}
          </td>
        </tr>
        <!-- <tr>
          <td>NIFTY</td>
          <td>{{ getLatestPricePoints(9604098).high }}</td>
          <td>{{ getLatestPricePoints(9604098).upperBreakOutTarget }}</td>
          <td>{{ getLatestPricePoints(9604098).low }}</td>

       <td>{{ getLatestPricePoints(9604098).low }}</td>
         <td>{{ getLatestPricePoints(9604098).lowerBreakOutTarget }}</td>
          <td>{{ getLatestPricePoints(9604098).high }}</td>
        </tr> 
      
      --></table>
    </table>

    <!-- NIFTY Current Long Entry {{ getLatestPricePoints(9604354).high }}

    {{ getLatestPricePoints(9604354) }}
    <hr />
    bank nifty
    {{ getLatestPricePoints(9604098) }} -->

    <!-- v-if="typeof hourlyPricePointsofLiveDay=='object'" -->

    <div >
      <table v-if="false">
        <tr
          v-for="(script, index) in hourlyPricePointsofLiveDay"
          :key="index"
          class="col-small"
        >
          <td
            v-for="(item, index2) in script.prices"
            :key="index2"
            class="col-xs"
          >


         
            <div class="text-primary">
              {{ script.instrument.tradingsymbol }}
              {{ script.instrument_token }}
              {{ convertIsoDateToIST(item.date) }}
            </div>

            <div
              :class="{
                'text-success': script.prices[index2].open == item.open,
              }"
            >
              O:{{ item.open }}
              ll
            </div>
            ; up {{ (item.high + (item.high - item.low) / 2).toFixed(1) }} H:{{
              item.high
            }}
            L:{{ item.low }}

            range {{ item.high - item.low }}

            bottom {{ (item.low - (item.high - item.low) / 2).toFixed(1) }} C:{{
              item.close
            }}
          </td>
        </tr>
      </table>
    </div>

    <div class="row">
      <div class="col"></div>
      <div class="col"></div>
    </div>
    <table class="table table-striped" v-if="showLongtradeShortTradeTable">
      <thead>
        <th>#</th>
        <th>Symbol</th>
        <th>LTP</th>
        <th>Long Trade</th>
        <th>Short trade</th>

       
     
      </thead>
      <tbody>
        <tr
          v-for="(script, index) in instrumentsDisplay"
          :key="script.instrument_token"
        >
          <td>
            {{ index + 1 }}
          </td>
          <td
            :class="{
              'bg-danger':
                script.last_price < script.pricePoints.d1.low &&
                script.last_price != 0,
              'bg-success': script.last_price > script.pricePoints.d1.high,
            }"
          >
            {{ script.tradingsymbol }}
          </td>

          <td>
            {{ script.last_price }}
            
           {{convertIsoDateToIST(getLatestPricePoints(script.instrument_token).date)}} 
            
            
          </td>
          <td>
            Entry <small>{{ getLatestPricePoints(script.instrument_token).high }}</small> Target
            <small>{{ getLatestPricePoints(script.instrument_token).rangeBreakOutTarget }}</small> SL
            <small>{{ getLatestPricePoints(script.instrument_token).low }}</small> 
            profit points
            <small>
              {{ getLatestPricePoints(script.instrument_token).range }}
            </small>
          </td>
          <td>
            Entry <small>{{ getLatestPricePoints(script.instrument_token).low }}</small> Target
            <small>{{
              getLatestPricePoints(script.instrument_token).low -getLatestPricePoints(script.instrument_token).range
            }}</small>
            SL <small>{{getLatestPricePoints(script.instrument_token).high }}</small>


          Loss Points  <small>
              {{ getLatestPricePoints(script.instrument_token).range }}
            </small>
          </td>
          
        </tr>
      </tbody>
    </table>

 

    <v-btn @click="showModalForSquareOff()">
      square off selected
      <v-icon></v-icon>
    </v-btn>

    <button @click="review()">review</button>

    <v-btn @click="getOrders()">Refresh orders</v-btn>
    <v-btn @click="refreshTradeStatus()">Refresh trade status</v-btn>

   

    <!-- <div class="user-messages" v-if="userMessages.length">

   

     
      
     
      <ul>
        <li v-for='(msg,index) in userMessages' :key="index">

          {{msg}}
        </li>
      </ul>


    </div> -->

    {{ instrumentsFiltered.length }} out of {{ instrumentTokens.length }}

    <!-- <input
      type="text"
      class="form-control"
      v-model="targetPc"
      placeholder="Enter the Target %"
    /> -->

    <div class="row">
      <div class="col offset">
       <h1 class="text-success">Positions</h1> 

        <v-chip :color="totalpnl > 0 ? 'green' : 'red'" class="pb-2 mb-2">
          Profit and Loss of Live positions {{ totalpnl }}
        </v-chip>

        <v-chip
          :color="closedTradesScriptsPnl > 0 ? 'green' : 'red'"
          class="pb-2 mb-2"
        >
          Profit and Loss of Closed positions {{ closedTradesScriptsPnl }}
        </v-chip>

        <v-chip
          :color="closedTradesScriptsPnl + totalpnl > 0 ? 'green' : 'red'"
          class="pb-2 mb-2"
        >
          Total Profit and Loss {{ closedTradesScriptsPnl + totalpnl }}
        </v-chip>

        <!-- <table class="table" v-if="livePositions.length > 0"> -->

<div class="row">
  <div class="col-10">
   
    <LivePos


    @convertIsoDateToIST="convertIsoDateToISTChild"
    :convertIsoDateToISTResult="convertIsoDateToISTResultChild"
@getReverseOrderAndHasLiveTargetStatusForChild="getReverseOrderAndHasLiveTargetStatusForChild"
:getReverseOrderAndHasLiveTargetStatusForChildResult="getReverseOrderAndHasLiveTargetStatusForChildResult"

    @getStopLossFromChild="getStopLossFromChild"
    
    :livePositionsDisplay="livePositionsDisplay"
    :getStopLossResult="stopLossForChild"
    ></LivePos>
  </div>
  <div class="col-2">
  
    <LiveOrders 
    
    
    :liveOrders="liveOrders"></LiveOrders>
  </div>
</div>


<div class="row fixTableHead" v-if="false">
      <div class="col">
        <table class="table table bordered table-stripped">
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
              v-for="(i, index) in instrumentsFiltered"
              :key="i.instrument_tocken"
            >
              <td>
                {{ index + 1 }}
              </td>
              <td>
                {{ i.name }}

                <div class="row mt-2">
                  <div class="col-xs mr-2">
                    <small>SPOT {{ i.spot_price }}</small>
                  </div>
                  <div class="col-xs mr-2">
                    <small>LOT {{ i.lot_size }}</small>
                  </div>
                  <div class="col-xs mr-2"></div>
                </div>
              </td>

              <td>{{ i.strike }}</td>

              <td>
                <a target="_blank" :href="i.chart">{{ i.tradingsymbol }} </a>
              </td>
              <td :class="i.candle">
                {{ i.last_price }}
                <small> Amt {{ i.lot_size * i.last_price }} </small>
                <!-- Live Profit if executed  <b>{{i.lot_size *(i.last_price-i.SevenDayMaxMin.Max)}}</b> -->
              </td>
              <td>{{ i.instrument_type }}</td>
              <td>{{ i.pricePoints.yesterday.high }}</td>

              <td>
                <select
                  name=""
                  id=""
                  v-model="i.seletedBuyingMethod"
                  @change="changeBuyingMethod(i)"
                >
                  <option v-for="bp in buyingPoint" :value="bp" :key="bp">
                    {{ bp }}
                  </option>
                </select>

                <!-- {{i.seletedBuyingMethod}} -->
                <small v-if="i.SevenDayMaxMin"></small> &nbsp;

                {{ i.pricePoints.d1.high }}
                <v-btn
                  fab
                  small
                  :title="`ENTER NOW TO TRADE for  Amt ${
                    i.SevenDayMaxMin.Max * i.lot_size
                  }`"
                  @click="enterNowToTrade(i)"
                  ><v-icon color="green">mdi-cart</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>



       
        <hr />

        <!-- {{livePositions}} -->
      </div>
    </div>

   
    <!-- :class="{ 'red': pos.candle_color=='red', 'green': pos.candle_color=='green' }" -->
    <!-- <ul>
      <li v-for="i in instruments" :key="i.instrument_tocken">
        {{ i }} 
      </li>
    </ul> -->

    <!-- <b-modal v-model="modalShow">
      <slot name="header"> geader </slot>
      <slot name="body">
        <table>
          <tr v-for="(symbol, index) in livePositionsSelected" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ symbol.tradingsymbol }}</td>
            <td>{{ symbol.pnl }}</td>
            <td>
              <input
                type="checkbox"
                name=""
                id=""
                class="form-control"
                v-model="symbol.selected"
              />

              {{ symbol.selected }}
            </td>
          </tr>
        </table>
      </slot>

      <slot name="footer">
        <v-btn @click="squareoffAll()">Proceed </v-btn>
      </slot>
    </b-modal> -->

    <!-- <LogWindow /> -->
  </div>
</template>

<script>
// const originalConsoleLog = console.log;
// console.log = (...args) => {
//   store.dispatch('addLog', args.join(', '));
//   // originalConsoleLog.apply(console, args);
// };

import store from '@/store';
 import LogWindow from './LogWindow.vue';
// let moment = require("moment");
import moment from 'moment';
 import { io } from "socket.io-client";
//import io  from "vue-socket.io"

import Margin from '@/components/Margin.vue'
import Messages from '@/components/Messages.vue'
// import axios from "axios";
import axios from 'redaxios';
import sessionMixin from "@/views/sessionMixin";
//import ThemeSwitcherVue from "../../../../theme/materio-free-v1.0.2/materio-vuetify-vuejs-admin-template-free/materio-vuetify-vuejs-admin-template-free-main/src/layouts/components/ThemeSwitcher.vue";
//import TypographyTextsVue from "../../../../theme/materio-free-v1.0.2/materio-vuetify-vuejs-admin-template-free/materio-vuetify-vuejs-admin-template-free-main/src/views/typography/TypographyTexts.vue";

const socket = io("http://127.0.0.1:4000"

,
{
    transports: ['websocket'],

}
);
socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err}`);
});


// const socket = new io({debug: true,
//             connection: 'http://127.0.0.1:9090'
//       });
    

// console.log(socket,'start')

var comF = "instrumentsForCommodity.json";
var shareF = "instrumentsForMining.json";
// var shareF = "instrumentsAll.json";
var NFOX = "NFO";
var MCXX = "MCX";

/// TO SET COMODITY OR SHAREE



import ClosedTrades from "./ClosedTrades.vue";
import LiveTickView from "./LiveTickView.vue";
import LiveOrders from "./LiveOrders.vue";
import LivePos from "./LivePos.vue";
import IndicesTable from "./IndicesTable.vue";


var cl;
// import { clearInterval } from "timers";






export default {
  components: { ClosedTrades, LiveTickView, LiveOrders,Margin,LivePos,IndicesTable,Messages  },

  mixins: [sessionMixin],

  watch: {
    orderArray(n, o) {
      // console.log(n,o)

      let orderArrays = [...this.orderArray];

      if (orderArrays.length > 0) {
        orderArrays.forEach(async (orderArray) => {
         
          // console.log("place order result", a);
          console.log("Actual Firing", JSON.stringify(orderArray));
        });

        this.orderArray = [];
      }
    },
  },



  mounted() {

    cl=this.cl;
    console.log(this.$methods,'met');

   this.setTradingType();

    this.itype = this.$route.params.itype;
    this.loopGetQuotesAndMutateInstruments();

    this.nifty=this.instruments.filter(i=>i.segment=='INDICES');


    this.getMargins();
    setInterval(()=>{

this.getMargins();


this.loopGetQuotesAndMutateInstruments();
this.nifty=this.instruments.filter(i=>i.segment=='INDICES');

},20*60*1000)  




    // console.log(this.itype ,'this.itype ')
// console.log(this.$route.params,'this.$route.params')




    var d = new Date();
    this.hours = d.getHours();
    this.minutes = d.getMinutes();
    this.seconds = d.getSeconds();


    (async()=>{

      let a =await this.refreshTradeStatus();

     let w=await this. placeTargetsForLiveScripts()

    })()
  

    let TenMinutes = 10 * 60 * 1000;
    let FiveMinutesTimer = setInterval(() => {
      //this.$router.go();
    }, TenMinutes);

    let thirtyMinute = 25 * 60 * 1000;

    let thirtyMinuteTimer = setInterval(async () => {
      let thirtyMiniutesBefore = new Date();
      thirtyMiniutesBefore.setMinutes(thirtyMiniutesBefore.getMinutes() - 2);

 
     
     
  
    

      return;
      // let iso=now.toISOString()

      //  & lo.order_timestamp>0

      let order_ids = this.liveOrders
        .filter((lo) => {
          return (
            lo.status == "OPEN" &&
            lo.exchange == this.itype &&
            // lo.tradingsymbol.includes("FUT") &&
            lo.transaction_type == "BUY" &&
            thirtyMiniutesBefore - new Date(lo.order_timestamp) > 0
          );
        })
        .map((o) => {
          let ob = {};
          ob.order_id = o.order_id;
          ob.variety = o.variety;

          return ob;
        });

      console.log(order_ids, "live orderss to be canceled");

      if (order_ids.length > 0) {
        // this.CancelOrders(order_ids);
      }
    }, thirtyMinute);

    let fifteenSecTimer = setInterval(async () => {

      let a = await this.refreshTradeStatus();
     
    }, 60 * 1000);

    let placingTimer = window.setInterval(async () => {

   
      
     

      let ln = this.orderArray.length;

      // console.log('order array length1',ln,JSON.stringify(this.orderArray))

      // console.log('this.orderArray.',this.orderArray)

      // clock

      if (this.laggingCheckDigit == this.CurrentCheckDigit) {
        this.webSocketNotActive = true;

        //reload window

        this.$router.go();
      } else {
        this.webSocketNotActive = false;
      }
      this.laggingCheckDigit = this.CurrentCheckDigit;
      var d = new Date();
      this.hours = d.getHours();
      this.minutes = d.getMinutes();
      this.seconds = d.getSeconds();

      let times=[17,47,37,2]
           

           if (this.hours<16 & times.includes(this.minutes) && this.seconds>56){

            ///procedureTocancelEntryOrdersIfAny

            this.$router.go()
           }


           this.placeTargetsForLiveScripts()

      // if (this.livePositions.length > 0) {
      //   // let r = await this.getHourlyCandleLows();
      // }

      let hourlyhandleFetchingMinutes = [1, 16, 31, 46];
      if (hourlyhandleFetchingMinutes.includes(this.minutes)) {
        // if (this.livePositions.length > 0)
        if (true) {
          // let r = await this.getHourlyCandleLows();
        }

        if ((this.hours < 15) & this.times.includes(this.minutes)) {
          //geting candle data in 31 st minutes of each hour
        }
      }
    }, 2*60 * 1000);

    // *Math.max(this.orderArray.length,1)

    if (this.chat_id == -1) {
      this.getChatId().then((chat_id) => {
        var d = new Date();

        let today = d.toLocaleString().slice(0, 10);

        var txt = "Welcome to Trading on " + today;
        this.sendToTelegramGroup(txt);
      });
    }
    // this.triggerWebsocktsInServer();

    //  window.setInterval(() => {
    //   console.clear();

    //    },250000)

    // window. setInterval(() => {
    //     var d = new Date();
    //     this.hours = d.getHours();
    //     this.minutes = d.getMinutes();
    //     this.seconds = d.getSeconds();

    //  },1000)

    // this.getOrders();

    // if (this.livePositions.length > 0) {
    //   // this.getHourlyCandleLows();
    // }
   

// (async ()=>{

//   let kk=await    this.setInstrumentTokens();

// })();


    

    //  let tmp=[...this.instrument_tokens,14523906]

    //  console.log(this.instrumentTokens,111);

  
(async ()=>{


  // let instrumentsForMining1 =await this.requireJson("../../../instruments/" + this.setter)//.then(r=>r.json())
  let instrumentsForMining1 =await this.requireJson("../../../instruments/instrumentsForMining.json")//.then(r=>r.json())


  let instrumentsForMining = instrumentsForMining1
  .filter(
    (i) =>  true
    
  )
  .filter((item, index, arr) => arr.indexOf(item) === index);


  this.instruments=[...instrumentsForMining];
    this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));


    // console.log(this.instruments.length ,'lm# 1172')
    // console.log(this.instrumentTokens,'this.instrumentTokens @ 1168')

// console.log(JSON.stringify(this.instrumentTokens));


// this.instrumentTokens=this.hourlyPricePointsofLiveDay.map(i=>i.instrument_token)
    // socket.emit("subscribe-orders", JSON.stringify(this.instrumentTokens));

    // this.setInstrumentTokens()

})()
    

  

    socket.on("send-realtime-subscription", (s) => {

      this.mutateWithLtp(s);

      this.CurrentTick = [...s];
    });

    socket.on("order_update", async (orderUpdates) => {

      let temp1,tmp2
      if(orderUpdates.status=="UPDATE" || orderUpdates.pending_quantity!==0 ){


        let temp1=JSON.stringify(orderUpdates);
    let tmp2=JSON.stringify(this.previousOrderUpdate);

    if(temp1==tmp2){

      // console.log('same order update');
      this.previousOrderUpdate=orderUpdates;
      return false
    }
    this.previousOrderUpdate=orderUpdates


  let k=await  this.procedureTocancelEntryOrdersIfAny();
  cansole.log('cancelling orders',a)
        let a  = await this.refreshTradeStatus();

console.log('update order uodate',orderUpdates,{a});



return false
      }
      
 temp1=JSON.stringify(orderUpdates);
     tmp2=JSON.stringify(this.previousOrderUpdate);

    if(temp1==tmp2){

      // console.log('same order update');
      this.previousOrderUpdate=orderUpdates;
      return false
    }
    this.previousOrderUpdate=orderUpdates;

    

this.processOrderUpdate(orderUpdates)

   

//// if entry order executed 
///placce reverse order

//if reverse order executed 

///rest everything 


//       if (true) {
       

//         if (this.refreshingStatus == true) {
//           console.log("update in progress");

//           return false;
//         }
//         this.refreshingStatus = true;

// // let t = await this.refreshTradeStatus();

// if(orderUpdates.status=="COMPLETE" || orderUpdates.status=="CANCELLED"){

// // let t = await this.placeTargetsForLiveScripts();
// }
        

//         this.refreshingStatus = false;
//       }


    });

    //   setInterval(async () => {
    //  this.getOrders;

    //   }, 30000);
  },

  computed: {

    indices(){

      return this.instruments.filter(i=>i.segment=='INDICES')

    },

    proxyPositions1(){

return this.proxyPositions.sort((a,b)=>{

 return  b.profit-a.profit

})

    },

    livePositionsDisplay(){
return this.livePositions.filter(lp=>typeof lp.instrument!='undefined')

    },
    instrumentsDisplay() {
      return this.instruments.filter(i=>typeof i.pricePoints!='undefined')
      
      // .filter(
      //   (i) => i.last_price != 0 && i.pricePoints.d1.range != 0
      // );
    },

    executedBuyOrdersTime() {
      return this.executedOrders
        .filter((r1) => r1.transaction_type == "BUY")
        .map((r) => {
          let { instrument_token, exchange_update_timestamp } = r;

          return { instrument_token, exchange_update_timestamp };
        });
    },
    closedTradesScriptsPnl() {
      if (this.closedTradesScripts.length > 0) {
        return this.closedTradesScripts.reduce((pvs, cur) => {
          return pvs + cur.pnl;
        }, 0);
      }
    },

    totalpnl() {
if(typeof this.livePositions =='undefined' ){

  return 0;
}

      if (this.livePositions.length == 0) {
        return 0;
      }
      return this.livePositions.reduce((pvs, cur) => {
        return pvs + cur.pnl;
      }, 0);
    },
    liveTradablebalance() {
      return (
        this.maxTradableAmount -
        this.liveBuyOrderAmount -
        this.livePositionTotalCost -
        this.totalBuyOrderLivePlacedBySoftware -
        this.proposedBuyAmount
      );
    },
    //  &&  typeof i.SevenDayMaxMin!='undefined'

    // &&  typeof i.SevenDayMaxMin!='undefined'
    totalLiveprofitIfExecuted() {
      return 0;

      let total = 0;

      this.instruments
        .map((i) => i.liveprofitIfExecuted)
        .forEach((e) => {
          // console.log('e',e)

          if (isNaN(e)) {
            e = 0;
          }

          total = total + e;
        });

      return total;

      return this.instruments
        .map((i) => i.liveprofitIfExecuted)
        .reduce((c, p) => {
          if (isNaN(p)) {
            p = 0;
          }
          c = c + p;
        }, 0);
    },

    instrumentsFiltered() {
      return this.instruments.filter((i) => i.enterNowToTrade == true);

      // .sort((a, b) => {
      //   return a.activatedTime - b.activatedTime;
      // });
    },
  },

  methods: {

setD0WithCurrentDayOhlc(element){

if(!element){
cl('no lelemtn')
  return
}

  let ohlc = {...element.ohlc};
let obj = { ...ohlc };


obj.normaldate = this.convertIsoDateToIST(ohlc.date);
obj.setFromFrontEnd = true;
let range = ohlc.high - ohlc.low;
obj.range = range;
obj.rangeBreakOutTarget = this.convertIsoDateToIST(ohlc.high + range);
obj.rangeBreakDownTarget = this.convertIsoDateToIST(ohlc.low - range);
// console.log(element.instrument_token)



let instrument = this.instruments.find(i => i.instrument_token == element.instrument_token);
if (instrument) {
  this.$set(instrument.pricePoints, 'd0', obj);

}




},


    getProxyTotal(){


let tot=0;
this.proxyPositions.forEach(cur=>{


// if(cur.sqaureOff){

  if(cur.last_price!=0){

    let t= (cur.last_price-cur.entryPrice)*cur.instrument.lot_size
    tot=tot+  t
    this.$set(cur,'profit',t)
   
  }


}

)

this.proxyTotal= tot;

},


    loopGetQuotesAndMutateInstruments(){

console.log('hi')
      let a=[...this.instruments];

      
let obFull={};
  let t=   setInterval(async ()=>{

        let ln=a.length;
        // console.log(ln,'ln')
if(ln>0){
 let a500=a.slice(0,499).map(a=>a.instrument_token);
let q= await this.getQuoteFromZerodha(a500)
a.splice(0,499);



 obFull = Object.assign(obFull, q);

}else{
// console.log(Object.keys(obFull).length,'objfull')
   a=[...this.instruments];


   Object.keys(obFull).forEach(e=>{

let q=obFull[e];

this.instruments.filter(i=>i.instrument_token==e)[0].pricePoints.d0.high=q.ohlc.high
this.instruments.filter( i=>i.instrument_token==e)[0].pricePoints.d0.low=q.ohlc.low


this.$set(this.instruments.filter(i=>i.instrument_token==e)[0],
'quote',q
)
// console.log(q.ohlc.high,q.ohlc.low)


   })
   obFull={}

}

      },1001)

    

     



    },
   

    triggerAlert(code,msg){


      let alert={};
          alert.code=code;
          alert.message=
          msg

          let ln=   this. alerts.filter(a=>a.code==alert.code).length;

      if(ln==0)

      this.alerts.push(alert)

      this.showAlert()


    },
    showAlert(){
this.dialog=true;

setInterval(()=>{
  this.dialog=false;


},2000)

    },

    orderCompleteProcedure(livePositions,liveOrders,CurrentInstrument,instrument_token,orderUpdates){


      let hasLivePosition=this.livePositions.filter(i=>i.instrument_token==instrument_token).
length>0;

let hasLiveOrder=this.liveOrders.filter(
        (lo) => lo.instrument_token == instrument_token
).length>0;

// console.log({instrument_token},'from order omplete procedute')


// console.log(this.instruments.filter(
//           (i) => i.instrument_token == instrument_token
//         )[0],'this.instruments.filter( (i) => i.instrument_token == instrument_token    )[0]from order omplete procedute')

switch(true){




  case (hasLivePosition && hasLiveOrder):
/// tjust set flags
this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "hasLivePosition",
        true
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "hasLiveTarget",
        true
      );

  break;

  case (hasLivePosition && !hasLiveOrder):

  /// proceed for reverse order 

  this.proceedForReverseOrderPlacement(CurrentInstrument,instrument_token,orderUpdates);


    break;


    case (!hasLivePosition && hasLiveOrder):

    // forward order not executed till now

    this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "hasLivePosition",
        false
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "hasLiveTarget",
       false
      );




    break;


    case (!hasLivePosition && !hasLiveOrder):

    // no pos and no  orders  //reset all


    if( this.instruments.filter(
          (i) => i.instrument_token == instrument_token
    ).length>0){

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "hasLivePosition",
        false
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "hasLiveTarget",
       false
      );
    }

 

      this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
      enterNowToTrade=false; 



    break;





}



    },

    writeToMongo(){


      let url="/api/writeToMongo";

      let ob={};
      ob.session=this.session;
      ob.time=moment()

    },


    getMargins(){
// this.marginLoaded=false;
let url="/api/getMargins/accessTocken/"

let ob={};
ob.access_token=this.accessToken;

// console.log(url)
axios.post(url,ob).then(res=>{


  //  console.log(res.data,'res.data margin')
  this.liveMargin=res.data

  // console.log(res.data.margins.equity.available.live_balance)

  // console.log(this.liveMargin,'this.liveMargincd a')
// this. margins=res.data;

// this.marginLoaded=true;

// this.$emit('margin-updated',this.margins)

})

},

    marginUpdated(e){
      // margins.equity.available.live_balance

      // console.log(e,'e margin')

      // this.liveMargin=e.margins.equity.available.live_balance
// alert(e);
    },

 async    forceUpdateMissingScripts(){

      // let loCopy=[...this.liveOrders];

      console.log('from force update')

      if(typeof this.livePositions=='undefined'){
console.log(this.livePositions,'before');

let t=await this.getPositions()
console.log(this.livePositions,'after');

        // return false
      }

      if(typeof this.livePositions=='undefined'){

        console.log('still undefined')
return false
      }
      let loCopy=[...this.livePositions];


      console.log(loCopy.length,'ln')

let i1=setInterval(async ()=>{

  console.log(loCopy.length,'ln inside')
let cur=loCopy.pop();
if(typeof cur=='undefined'){
console.log('clearing live order missing script pupp')
clearInterval(i1)
}

console.log(cur,'cur')
if(this.instruments.filter(i=>i.instrument_token==cur.instrument_token).length==0){

 

console.log('updating lo missing script')
let k=await this.updateMissingScriptInInstrumetsFile(cur.instrument_token)
console.log(k,'k')
///  push new current instruments here

}
else{

  console.log('not updating for t'),cur.tradingsymbol

}



    },400);

    },


    async setTradingType(){

      // return new Promise((res,rej)=>{



        try{
    
          this.itype = this.$route.params.itype;







     if(this.itype=="MCX"){
      this.setter = comF;
      let instrumentsForMining1 = 
await this.requireJson("../../../instruments/" + this.setter);
   
let instrumentsForMining = instrumentsForMining1
  .filter(
    (i) => 
    // i.instrument_type == "FUT" &&
     i.tradingsymbol
  )
  .filter((item, index, arr) => arr.indexOf(item) === index);
      
     this.hourlyPricePointsofLiveDay1 =
       require("../../../instruments/hourlyCandleDataCommodity.json");
       
       
       let   hourlyPricePointsofLiveDay = Object.keys(this.hourlyPricePointsofLiveDay1)
      .map((o) => {

    
        if (
          // this.hourlyPricePointsofLiveDay1[o].          instrument.instrument_type == "FUT"   &&
          
        
          this.hourlyPricePointsofLiveDay1[o].instrument.tradingsymbol.includes( "NOV"       )
        ) {
          // console.log(this.hourlyPricePointsofLiveDay1[o].instrument.instrument_type,'inst type')

          return this.hourlyPricePointsofLiveDay1[o];
        } else {
          return -1;
        }
      })
      .filter((i) => i != -1);


      this.hourlyPricePointsofLiveDay=hourlyPricePointsofLiveDay


this.instruments = instrumentsForMining;
this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));

// let kk=await    this.setInstrumentTokens();

}else if(this.itype=="NFO"){
  this.setter = shareF;



let instrumentsForMining1 =await this.requireJson("../../../instruments/" + this.setter)//.then(r=>r.json())


  let instrumentsForMining = instrumentsForMining1
  .filter(
    (i) =>  true
    
  )
  .filter((item, index, arr) => arr.indexOf(item) === index);



  this.hourlyPricePointsofLiveDay1 =await this.requireJson("../../../instruments/hourlyCandleData.json");

      // console.log('this.hourlyPricePointsofLiveDay23',this.hourlyPricePointsofLiveDay)
  
  
  
  
      let hourlyPricePointsofLiveDay = Object.
      values(this.hourlyPricePointsofLiveDay1).
      
       filter((i) => i != -1);


      
      this.hourlyPricePointsofLiveDay=[...hourlyPricePointsofLiveDay]

      // console.log(this.hourlyPricePointsofLiveDay)
    


this.instruments = [...instrumentsForMining];
this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));

this.setInstrumentTokens()

// let kk=await    this.setInstrumentTokens();

} else if (this.itype=="NSE"){
  let instrumentsForMining1 = 
await this.requireJson("../../../instruments/" + this.setter);


  let instrumentsForMining = instrumentsForMining1
  .filter(
    (i) => i.instrument_type == "EQ" 
  )
  .filter((item, index, arr) => arr.indexOf(item) === index);
  this.hourlyPricePointsofLiveDay1 =
  await  this.requireJson("../../../instruments/hourlyCandleData.json");


  this.hourlyPricePointsofLiveDay1 =
    await  this.requireJson("../../../instruments/hourlyCandleDataCommodity.json");
       let   hourlyPricePointsofLiveDay = Object.keys(this.hourlyPricePointsofLiveDay1)
      .map((o) => {

    

        if(true)
        // if (
        //   this.hourlyPricePointsofLiveDay1[o].
        //   // instrument.instrument_type == "FUT" &&
        //   this.hourlyPricePointsofLiveDay1[o].instrument.tradingsymbol.includes(
        //     "NOV"
        //   )
        // )
         {
          console.log(this.hourlyPricePointsofLiveDay1[o].instrument.instrument_type,'inst type')

          return this.hourlyPricePointsofLiveDay1[o];
        } else {
          return -1;
        }
      })
      .filter((i) => i != -1);



      this.hourlyPricePointsofLiveDay=hourlyPricePointsofLiveDay


    this.instruments = instrumentsForMining;
    this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));
}
    


  //   res(true)

}

    catch(e){
console.log('error',e)
      // rej(false)
    }
  // }) 
    },

  async   forceManualReverseOrder(){


  // let a=await this.getPositions()

  let a= await this.refreshTradeStatus()
if(this.forceManualReverseOrder==true){

  let a= await this.refreshTradeStatus()
  this.manualReverseOrderStart=true;
}else{


  this.manualReverseOrderStart=false;
}
}

    ,
    procedureTocancelEntryOrdersIfAny(){
//check whether the order is not reverse
return new Promise(async (res,rej)=>{



let liveOrdersInstruAndOrderId=this.liveOrders.map(a=>{

  
if(typeof this.livePositions=='undefined'){

  return -1
}

if(this.livePositions .length==0){

  return -1
}
  let pos=this.livePositions .filter(b=>a.instrument_token==b.instrument_token)

  if(pos.length>0){
return -1

  }
let ob={};
ob.instrument_token=a.instrument_token
ob.order_id=a.order_id

          ob.variety = a.variety;

}).filter(a=>a!=-1).filter(b=>b!=null)


;
if(liveOrdersInstruAndOrderId.length==0) return false;

let a =await this.CancelOrders(liveOrdersInstruAndOrderId);
return a;
///get order id

//canel order

})

    },
    getLatestPricePoints(instrument_token) {try {
	
	  
	/// xyz
	
	
	        
	        let CurrentInstrument=this.instruments.find(i=>i.instrument_token==instrument_token)
	        
	        let todaysHigh=CurrentInstrument.pricePoints.d0.high;
	        let todaysLow=CurrentInstrument.pricePoints.d0.low;
	        
	        let yesterdayHigh=CurrentInstrument.pricePoints.d1.high;
	        let yesterdayLow=CurrentInstrument.pricePoints.d1.low;
	
	        //  this.hourlyPricePointsofLiveDay = hourlyPricePointsofLiveDay;
	
	
	        if(typeof CurrentInstrument=='undefined'){
	  
	
	          console.log("typeof CurrentInstrument=='undefined'")
	           return false;
	
	        }
	        



	
	        if (
	          typeof this.hourlyPricePointsofLiveDay.filter(
	            (h) => h.instrument_token == instrument_token
	          )[0] == "undefined"
	        ) {
	
            cl('undefined houlpy price ',CurrentInstrument.tradingsymbol,instrument_token)
	
	          // cl('this.hourlyPricePointsofLiveDay. missing @1878', instrument_token);
	        
	// if(this.livePositions.filter(a=>a.instrument_token==instrument_token).length>0){
	
	// }     
	
	
	return false
	}
	        
	        
	        
	        
	        
	         
	
	          
	          let prices = this.hourlyPricePointsofLiveDay.filter(
	            (h) => h.instrument_token == instrument_token
	          )[0].prices;
	
	
	                   
	
	
	
	        
	          if (typeof prices == "undefined") {
	// 
	            // console.log('prices undefined')
	            return false;
	            // this.$router.go()
	          }
	
	          if (prices.length < 3) {
	
	          //  cl('prices length less than 3');
	            // return false;
	
	     
	          }
	          
	
	          let p=prices[0];
	
	    
	
	          let ln = prices.length;
	          // let a = prices[ln];
	        
	          let a;
	// console.log(prices[ln-1])
	
	if(typeof prices[ln-1]=='undefined'){
	
	  console.log(prices[ln-1],'prices[ln-1]=',ln)
	
	  a= prices[ln-1];
	}else{
	
	  a=prices[ln-2]
	 
	          
	
	}
	a=prices[ln-1]
	
	
	          // a.high=a.high+5
	          // a.low=a.low-5
	
	          // console.log({prices},{ln})
	
	          // console.log({a},'a prices')
	
	
	
	        //  a.previousVolume=b.volume
	        //  a.previousVolume=0;
	        
	          let range = a.high - a.low; 
	          a.range = Number(range).toFixed(1); 
	          
	          
	          //.toFixed(1);
	
	          let halfrange=range/ 2;
	          a.halfRange = halfrange //.toFixed(1)
	
	          let upperBreakOutTarget1 = a.high + a.range;
	          // a.upperBreakOutTarget = upperBreakOutTarget1.toFixed(1);
	          let lowerBreakOutTarget1 = a.low - a.range;
	          a.lowerBreakOutTarget = lowerBreakOutTarget1.toFixed(1);
	
	
	
	          
	          if(CurrentInstrument.instrument_type=="FUT"){
	
	            if(CurrentInstrument.tradingsymbol.includes('BANK')){
	
	
	
	a.upperBreakOutTarget = a.high+ 40;
	
	a.lowerBreakOutTarget = a.low-40;  
	  
	}else{
	
	
	a.upperBreakOutTarget = a.high+20;
	a.lowerBreakOutTarget = a.low-20;
	}
	
	
	          }
	
	          else{
	
	
	let percentage;
	switch(true){
	
	  case this.hours>9 && this.hours<10:
	  percentage=.12
	  break;
	  case this.hours>10 && this.hours<11:
	  percentage=.11
	  break;
	
	  case this.hours>11 && this.hours<12:
	  percentage=.10
	  break;
	
	   case this.hours>12 && this.hours<13:
	  percentage=.09
	  break;
	
	  case this.hours>13 && this.hours<14:
	  percentage=.08
	  break;
	case this.hours>14 && this.hours<15:
	  percentage=.07
	  break;
	case this.hours>11 && this.hours<16:
	  percentage=.04
	  break;
	
	  default:
	  percentage=.02
	  break;
	
	
	
	
	}
	percentage=.9;
	
	            let tmpUpper=a.high+ a.high*percentage
	
	            // console.log(a.high, a.high*percentage,'a.high, a.high*percentage,',CurrentInstrument.tradingsymbol)
	
	            let tmpLower=a.low-a.low*percentage
	
	
	            let uck=CurrentInstrument          
	            // let lck=CurrentInstrument.pricePoints.quote.lower_circuit_limit;
	            
	            //console.log(uck,'uck-lck')
	
	            a.upperBreakOutTarget = tmpUpper.toFixed(1)
	
	a.lowerBreakOutTarget = tmpLower.toFixed(1) 
	
	// console.log(a.upperBreakOutTarget,a.lowerBreakOutTarget ,'prices',{percentage})
	
	          }
	
	       
	          
	          
	
	
	a.dateIST=this.convertIsoDateToIST(a.date)
	
	// console.log({a},'a')
	
	if(this.livePositions.filter(a=>a.instrument_token==instrument_token).length>0){
	
	  this.$set(
	  this.livePositions.filter(a=>a.instrument_token==instrument_token)[0],
	'noScriptInHourlyCandle',false
	
	
	)
	}
	
	
	
	a.todaysHigh=todaysHigh
	a.todaysLow=todaysLow
	a.yesterdayHigh=yesterdayHigh
	a.yesterdayLow=yesterdayLow
	a.prices=prices
	
	          return a;
	
	
	    
	    
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}},
    convertIsoDateToISTChild(val){

      this.convertIsoDateToISTResultChild=
      this.convertIsoDateToIST(val)

    },
    convertIsoDateToIST(iso) {
  

      return moment(iso).format("DD-MM HH:mm");
    },
    sortArrayByDateDesc(arr) {
      return arr.prices.sort((a, b) =>
        a.date < b.date ? -1 : (a.date > b.date ? 1 : 0)[0]
      );
    },

    getHourlyEntryPointsOfDay(instrument_token) {
      if (this.hourlyPricePointsofLiveDay.length > 0)
        if (
          typeof this.hourlyPricePointsofLiveDay.filter(
            (i) => i.instrument_token == instrument_token
          )[0] == "undefined"
        ) {
          return -111;
        }

      if (
        typeof this.hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0] == "undefined"
      ) {
        return false;
      }

      if (
        typeof this.hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0].prices == "undefined"
      ) {
        console.log("no prices hourly point set for %s", instrument_token);
        return -222;
      }

      if (
        this.hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0].prices.length > 0
      ) {
        let prices1 = this.hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0].prices;

        let p1 = prices1.map((a1) => a1.low);

        let p2 = prices1.map((a1) => a1.high);

        let points = [...p1, ...p2];

        return points
          .filter((a) => true)

          .sort((a, b) => b - a)[0];
      } else {
        return -2300;
      }
    },

    async cancelLiveOrders() {},

    async updateSquareOfforderWithDesiredPrice(
      CurrentInstrument,
      element,
      squaringOff,
      p = 0
    ) {
      // this.SelectedSellorder=

      // console.log('firing squqring of ',CurrentInstrument.tradingsymbol)

      /// check the current order price

      // if (CurrentInstrument.instrument_type != "FUT") {
      //   return;

      //   //comented
      // }

      let instrument_token = CurrentInstrument.instrument_token;

      ///was normally false but activating now for a while
      if (squaringOff) {
        let test = this.updatingInProgress.filter(
          (u) => u == instrument_token
        ).length;

        if (test > 0) {
          console.log(CurrentInstrument.tradingsymbol,'alrady script updated upated');
          return false;
        }

        this.updatingInProgress.push(instrument_token);
      }

      // o.transaction_type == "SELL" &&
      let CurrentOrderObj = this.orders.filter(
        (o) => o.instrument_token == instrument_token
      );

      if (CurrentOrderObj.length == 0) {
        console.log(
          " curentorder not presnt for %s",
          CurrentInstrument.tradingsymbol
        );
        return false;
      }

      let price;
      if (p == 0) {
        let targetPointLong = CurrentInstrument.pricePoints.d1.low;

        let priceBuy = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          .price;

        let priceSell = element.depth.sell.sort((a, b) => b.price - a.price)[0]
          .price;

        let avg1 = ((priceBuy + priceSell) / 2);
        let avg=avg1.toFixed(1);

        price = avg;
      } else {
        price = p;
      }

      if(isNaN(price )){

price=element.last_price;

      }

      // console.log('avg',avg,'low',CurrentInstrument.pricePoints.d1.low,'mispricePoints',this.getMisPricePointofScript(instrument_token, targetPointLong))
      // let price=CurrentInstrument.pricePoints.d1.low;  // changed with some other logic

      // let price=this.getMisPricePointofScript(instrument_token, targetPointLong)  // not working this logic

      if (CurrentOrderObj[0].price == price) {
        //  console.log('new order already plaed')

        return false;
      }
      // console.log(CurrentInstrument,'CurrentInstrument')

      // console.log( CurrentOrderObj,' CurrentOrderObj')

      

      // if(this.previousPriceUpdate==this.currentPriceUpdate){

      //    console.log('switch price order already updated')
      //   return false
      // }
      
       this.currentPriceUpdate= JSON.stringify(
      
      CurrentOrderObj.map((i) => {
        let o = {};
        // o.variety=i.variety;

        // o.variety='regular';

        if (
          (this.hours == 15 && this.minutes > 30) ||
          this.hours > 15 ||
          this.hours < 9 ||
          (this.hours == 9 && this.minutes < 15)
        ) {
          o.variety = "amo";
        } else {
          o.variety = "regular";
        }

        o.order_id = i.order_id;

        o.tradingsymbol=CurrentInstrument.tradingsymbol
        let params = {};
        // let qry=i.exchange+":"+i.tradingsymbol;
        // let newPrice=i.ltp;
        // params.price=i.last_price;
        params.price = price;
        // params.order_type=i.last_price;
        params.trigger_price = price;
        o.params = params;

        // console.log('o',o)
        return o;
      })
      
       );



       this.previousPriceUpdate=this.currentPriceUpdate;

       this.newOrder =

       CurrentOrderObj.map((i) => {
        let o = {};
        // o.variety=i.variety;

        // o.variety='regular';

        if (
          (this.hours == 15 && this.minutes > 30) ||
          this.hours > 15 ||
          this.hours < 9 ||
          (this.hours == 9 && this.minutes < 15)
        ) {
          o.variety = "amo";
        } else {
          o.variety = "regular";
        }

        o.order_id = i.order_id;

        o.tradingsymbol=CurrentInstrument.tradingsymbol
        let params = {};
        // let qry=i.exchange+":"+i.tradingsymbol;
        // let newPrice=i.ltp;
        // params.price=i.last_price;
        params.price = price;
        // params.order_type=i.last_price;
        params.trigger_price = price;
        o.params = params;

        // console.log('o',o)
        return o;
      })

      this.updateOrder();

      let t = await this.getOrders();
      let tmp = this.updatingInProgress;

      // this.updatingInProgress=tmp.filter(t=>t!=instrument_token);

      let a  = await this.refreshTradeStatus();

      this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
      PlacedReverseOrder=false;
      
      
    

      // .map(o=>{});
    },

    updateSelectedSellorderWithLtp(){


      
// this.SelectedSellorder=
// this.newOrder=
// o.selected==true &&

let a=
this.liveOrders.filter(o=> o.transaction_type=="SELL").map(i=>{

let o={};
    // o.variety=i.variety;
    o.variety='regular';
    o.order_id=i.order_id;
    let params={};
    // let qry=i.exchange+":"+i.tradingsymbol;
    // let newPrice=i.ltp;
    params.price=i.last_price;
    // params.order_type=i.last_price;
params.trigger_price=i.last_price;
    o.params=params;

    // console.log('o',o)
    return o;

});
// console.log(a,'as')
console.log(this.liveOrders,'as')
// this.updateOrder();

// .map(o=>{});

          },



    updateOrder() {
      let ordersString = JSON.stringify(this.newOrder);
      // console.log('ordersString for stop loss',ordersString)

      let params = {};
      params.accessToken = this.accessToken;
      params.ordersString = ordersString;
      let url = "/api/modifyOrders";

      axios.post(url, params).then((res) => {


      //  console.l
      
      // console.log('orders modify reply',res.data)

        this.getOrders(); //refreshing orders
      });
    },
    getLatestPricesOfClosedScripts() {
      if (this.closedTradesScripts.length == 0) {
        return false;
      }

      let url = "/api/getLatestPricesOfClosedScripts";
      let ob = {};
      ob.symbols = JSON.stringify(
        this.closedTradesScripts.map((c) => c.instrument_token)
      );

      // console.log(ob.symbols, "ob.symbols");
      ob.accessToken = this.accessToken;

      axios.post(url, ob).then((r) => {
        r.data.forEach((e) => {
          // console.log(e, "e");
          this.$set(
            this.closedTradesScripts.filter(
              (e1) => e1.instrument_token == e.instrument_token
            )[0],
            "postTradePrice",
            e.last_price
          );

          this.totalForgone = this.closedTradesScripts.reduce(
            (pvs, closedTradesScript) => {
              // console.log(closedTradesScript,'closedTradesScript');
              return (
                pvs +
                (closedTradesScript.postTradePrice -
                  closedTradesScript.sell_price) *
                  closedTradesScript.sell_quantity
              );
              // console.log(pvs,'pvs')
            },
            0
          );

          this.totalForgoneForStopLoss = this.closedTradesScripts.reduce(
            (pvs, closedTradesScript) => {
              // console.log(closedTradesScript,'closedTradesScript');

              if (closedTradesScript.pnl < 0) {
                // console.log(closedTradesScript.pnl,'closedTradesScript.pnl totalForgoneForStopLoss')
                return (
                  pvs +
                  (closedTradesScript.postTradePrice -
                    closedTradesScript.sell_price) *
                    closedTradesScript.sell_quantity
                );
              } else {
                return pvs;
              }
              // console.log(pvs,'pvs')
            },
            0
          );

          // .tofixed(1)

          this.totalForgoneFortarget = this.closedTradesScripts.reduce(
            (pvs, closedTradesScript) => {
              // console.log(closedTradesScript,'closedTradesScript');

              if (closedTradesScript.pnl > 0) {
                // console.log(closedTradesScript.pnl,'closedTradesScript.pnl totalForgoneFortarget')

                return (
                  pvs +
                  (closedTradesScript.postTradePrice -
                    closedTradesScript.sell_price) *
                    closedTradesScript.sell_quantity
                );
              } else {
                return pvs;
              }
              // console.log(pvs,'pvs')
            },
            0
          );
          //.tofixed(1)
        });
      });
    },

    CancelOrders(ar) {

      
      let url = "/api/CancelOrders";

      let arr = JSON.stringify(ar);
      let accessToken = this.accessToken;
      let ob = { arr, accessToken };

      // console.log(arr);
     return  axios.post(url, ob).then((r) => {

      return r.data
        console.log(r.data, "r.data");
      });
    },

    getReverseOrderAndHasLiveTargetStatusForChild(instrument_token){


      this.getReverseOrderAndHasLiveTargetStatusForChildResult=
     this. getReverseOrderAndHasLiveTargetStatus(instrument_token)

    },

    getReverseOrderAndHasLiveTargetStatus(instrument_token) {
      // return instrument_token

      try {
        let PlacedReverseOrder = this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0].PlacedReverseOrder;

        let hasLivetarget = this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0].hasLivetarget;

        return { PlacedReverseOrder, hasLivetarget };
      } catch (e) {
        return instrument_token;
      }
    },
    async updateMissingScriptInInstrumetsFile(instrument_token) {
      let params = {
        accessToken: this.accessToken,
        instrument_token: instrument_token,
      };

      let url = "/api/updateMissingScriptInInstrumetsFile";



     return  axios.post(url, params).then(async (r) => {
        let instruments = await this.requireJson("../../../instruments/" + this.setter);

        this.$set(this.instruments, instruments);
        //  Object.assign(this.instruments, instruments)

        this.livePositions.forEach((e) => {
          let instrument = this.instruments.filter(
            (i) => i.instrument_token == e.instrument_token
          )[0];

          this.$set(e, "instrument", instrument);
        });

        this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));

        // let kk1=await   this.setInstrumentTokens();

        // console.log(this.instrumentTokens,'this.instrumentTokens @2621')

        // this.instrumentTokens=this.hourlyPricePointsofLiveDay.map(i=>i.instrument_token)

        // this.setInstrumentTokens()

        // socket.emit("subscribe-orders", JSON.stringify(this.instrumentTokens));
      });
    },

    getHourlySupportPointsBelowReference(instrument_token, ref) {
      return ref;
      if (hourlyPricePointsofLiveDay.length > 0)
        if (
          typeof hourlyPricePointsofLiveDay.filter(
            (i) => i.instrument_token == instrument_token
          )[0] == "undefined"
        ) {
          return -111;
        }

      //  console.log(hourlyPricePointsofLiveDay.filter(
      //       (i) => i.instrument_token == instrument_token
      //     )[0],'test')
      //      return;

      if (
        typeof hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0].prices == "undefined"
      ) {
        return -222;
      }

      if (
        hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0].prices.length > 0
      ) {
        let prices1 = hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        )[0].prices;

        // .prices;

        let p1 = prices1.map((a1) => a1.low);
        // .sort((a, b) => {
        //   return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        // })

        let p2 = prices1.map((a1) => a1.high);
        // .sort((a, b) => {
        //   return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        // })

        let points = [...p1, ...p2];

        //  return points;
        // //  .at(-2);

        return points
          .filter((a) => a < ref)

          .sort((a, b) => b - a)[0];
      } else {
        return -2300;
      }
    },
    getHourlyResistancePointsBelowReference(instrument_token, ref) {},

    getTrailingStopLoss(instrument_token, livePnl) {
      let sl = this.getStopLoss(instrument_token);
      // if(livePnl<=0)

      let ins = this.instruments.filter(
        (r) => r.instrument_token == instrument_token
      )[0];

      if (typeof ins != "undefined") {
        if (ins.length != 0) {
          let ydayCloseOpenMin = Math.max(
            ins.pricePoints.d1.close,
            ins.pricePoints.d1.open
          );
        }
      } else {
        return sl;
      }

      if (this.hourlyPricePointsofLiveDay.length == 0) {
        return sl;
      }

      if (
        this.hourlyPricePointsofLiveDay.filter(
          (i) => i.instrument_token == instrument_token
        ).length == 0
      ) {
        // return sl;
      }

      // return instrument_token;

      if (
        typeof this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0] == "undefined"
      ) {
        // return 1000;
      }

      let tick_size = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].tick_size;

      let mplr = 3;

      if (this.hourlyPricePointsofLiveDay.length > 0)
        if (
          typeof this.hourlyPricePointsofLiveDay.filter(
            (i) => i.instrument_token == instrument_token
          )[0] != "undefined"
        )
          if (
            typeof this.hourlyPricePointsofLiveDay.filter(
              (i) => i.instrument_token == instrument_token
            )[0].prices != "undefined"
          )
            if (
              this.hourlyPricePointsofLiveDay.filter(
                (i) => i.instrument_token == instrument_token
              )[0].prices.length > 0
            ) {
              let prices1 = this.hourlyPricePointsofLiveDay.filter(
                (i) => i.instrument_token == instrument_token
              )[0].prices;

              let p1 = prices1
                .sort((a, b) => {
                  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
                })
                .map((a1) => a1.low);

              let p2 = prices1
                .sort((a, b) => {
                  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
                })
                .map((a1) => a1.high);

              let points = [...p1, ...p2];
              //  .at(-2);

              return p1
                .filter((a) => a < ins.pricePoints.d1.close)

                .sort((a, b) => b - a)[0];

              // .
              // sort((a,b)=>{
              // return a.date-b.date

              // })

              // return 1;

              // return p1;

              // console.log(prices,'prices')
              // return prices;
              // return '3333'
              // return prices
              let p = prices.low - tick_size * mplr;

              // return p.toFixed(2);
            } else {
              let sl = this.getStopLoss(instrument_token);
              // return sl;
            }

      if (true) {
        return sl;
      }
    },

    getChart(instrument_token) {
      try {
        // return 'https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/'

        let chart = this.instruments.filter(
          (i) => (i.instrument_token = instrument_token)
        )[0].chart;
        return chart;
      } catch (e) {
        return "https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/";
      }
    },

    async getHourlyCandleLows() {
      return new Promise(async (response, rej) => {
        this.loadingHourlyTradingLows = true;
        let url = "/api/getHourlyCandleLows";
        let accessToken = this.accessToken;

        let symbols_json = JSON.stringify(
          this.livePositions.map((a) => a.instrument_token)
        );

        let ob = { symbols_json, accessToken };

        let res = await axios.post(url, ob).then((r) => {
          if (r.data.length > 0) {
            var tmp = r.data.sort((a, b) => {
              return b.date < a.date ? -1 : b.date > a.date ? 1 : 0;
            });

            // this.hourlyPricePointsofLiveDay = tmp;
          }

          this.loadingHourlyTradingLows = false;
          response(tmp);
        });

        // console.log(this.hourlyPricePointsofLiveDay,'this.hourlyPricePointsofLiveDay')

        return;
      });
    },


    getStopLossFromChild(val){


let a=this.getStopLoss(val);

this.stopLossForChild=a;
      
    },


    getStopLoss(instrument_token) {
      try {
        let CurrentInstrument = this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0];

        return CurrentInstrument.pricePoints.d1.low - 0.05 * 3;
        return Math.max(
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),
          CurrentInstrument.pricePoints.d1.low
        );
      } catch (e) {
        return 1000;
      }

      //  return this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
      //  pricePoints.yesterday.low;;
    },
    getMisPricePointofScript(instrument_tocken, targetPointLong) {
      try {
        // return ;
        // return instrument_tocken;

        // return this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.yesterday.high;;

        //console.log(instrument_tocken)
        //console.log(this.instruments.filter(i=>i.instrument_token==instrument_tocken),'this.instruments.filter(i=>i.instrument_token==instrument_tocken)')
        // console.log(this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0],
        // 'this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0]');

        if (
          this.instruments.filter(
            (i) => i.instrument_token == instrument_tocken
          ).length == 0
        ) {
          return targetPointLong;
        }
        let yesterdayHigh = this.instruments.filter(
          (i) => i.instrument_token == instrument_tocken
        )[0].pricePoints.yesterday.high;

        // return yesterdayHigh*1.2;
        let type = this.instruments.filter(
          (i) => i.instrument_token == instrument_tocken
        )[0].instrument_type;
        let name = this.instruments.filter(
          (i) => i.instrument_token == instrument_tocken
        )[0].name;

        //.hourlyPricePoints(h=>h.h.high>1.1*yesterdayHigh

        // return name+type;

        let offset = 1;
        let reference = targetPointLong * offset;

        if (type == "CE" || type == "PE") {
          // return offset;

          // return 1000;
          if (
            typeof this.instruments.filter(
              (i) => i.instrument_token == instrument_tocken
            )[0] != "undefined"
          )
            if (
              typeof this.instruments.filter(
                (i) => i.instrument_token == instrument_tocken
              )[0].pricePoints != "undefined"
            )
              if (
                typeof this.instruments.filter(
                  (i) => i.instrument_token == instrument_tocken
                )[0].pricePoints.hourlyPricePoints != "undefined"
              )
                if (
                  typeof this.instruments
                    .filter((i) => i.instrument_token == instrument_tocken)[0]
                    .pricePoints.hourlyPricePoints.filter(
                      (l) => l.high > reference
                    )[0] != "undefined"
                ) {
                  // console.log(reference,'reference')
                  let lows = this.instruments
                    .filter((i) => i.instrument_token == instrument_tocken)[0]
                    .pricePoints.hourlyPricePoints.map((a) => a.low);

                  let highs = this.instruments
                    .filter((i) => i.instrument_token == instrument_tocken)[0]
                    .pricePoints.hourlyPricePoints.map((a) => a.high);

                  highs.concat(lows);

                  let out = highs.filter((h) => h > reference);

                  let target = Math.min(...out);

                  return target;

                  if (isNaN(target)) {
                    if (
                      this.livePositions.filter(
                        (lp) => lp.instrument_token == instrument_tocken
                      )[0] != "undefined"
                    )
                      if (
                        typeof this.livePositions.filter(
                          (lp) => lp.instrument_token == instrument_tocken
                        )[0] != "undefined"
                      ) {
                        return (
                          this.livePositions.filter(
                            (lp) => lp.instrument_token == instrument_tocken
                          )[0].average_price * (1.02).toFixed(1)
                        );

                        return (
                          this.livePositions.filter(
                            (lp) => lp.instrument_token == instrument_tocken
                          )[0].average_price * 1.2
                        );
                      } else {
                        return 22222;
                      }
                  }

                  // return 'lows'
                  return target.toFixed(1);

                  return this.instruments
                    .filter((i) => i.instrument_token == instrument_tocken)[0]
                    .pricePoints.hourlyPricePoints.filter(
                      (l) => l.high > reference
                    )[0].low;
                } else {
                  if (
                    typeof this.instruments.filter(
                      (i) => i.instrument_token == instrument_tocken
                    )[0].yesterday == "undefined" ||
                    this.instruments.filter(
                      (i) => i.instrument_token == instrument_tocken
                    )[0].yesterday.rangeBreakOutTarget == "undefined"
                  ) {
                    // return instrument_tocken+'it';

                    let bo = this.instruments.filter(
                      (i) => i.instrument_token == instrument_tocken
                    )[0].pricePoints.yesterday.rangeBreakOutTarget;

                    return bo.toFixed(2);
                    return this.livePositionsSelected.filter(
                      (lp) => lp.instrument_token == instrument_tocken
                    );
                  } else {
                    let ret = this.instruments.filter(
                      (i) => i.instrument_token == instrument_tocken
                    )[0].pricePoints;
                    yesterday.rangeBreakOutTarget;
                    if (isNaN(ret)) {
                      //return 'nan'

                      return (
                        this.livePositionsSelected.filter(
                          (lp) => lp.instrument_token == instrument_tocken
                        )[0].average_price * 1.2
                      );
                    } else {
                      return ret.tofixed(1);
                    }

                    //return 'avg'
                  }
                }
        }
      } catch (e) {
        if (
          typeof this.instruments.filter(
            (i) => i.instrument_token == instrument_tocken
          )[0] != "undefined"
        ) {
          let tradingsymbol = this.instruments.filter(
            (i) => i.instrument_token == instrument_tocken
          )[0].tradingsymbol;
          console.log(
            e,
            "mis target error for ",
            tradingsymbol,
            instrument_tocken
          );

          return 1000;
        } else {
          console.log(e, "mis target error for ", instrument_tocken);

          return 1000;
        }
      }
    },

    async getQuoteFromZerodha(livePositionsInstrumentTokens) {
      let url = "/api/getQuoteFromZerodha";

      let obj = {};
      obj.accessToken = this.accessToken;

      let quoteData = [];
      obj.arryOfInstruments = livePositionsInstrumentTokens;

      return await axios.post(url, obj).then((r) => {
        return r.data;

        return 1;
      });
    },

    async review() {
      // let livePositionsTmp = await this.getPositions();

      let a1= await this.refreshTradeStatus()

      // console.log()

      // let pnl=0

      this.livePositionScripts = livePositionsTmp.net.map((i) => {
        i.name;
      });

      let itrator = livePositionsTmp.net.slice(1, 200);

      let livePositionsInstrumentTokens = instrumentsForMining

        .map((m) => "this.itype:" + m.tradingsymbol)
        .slice(1, 200);

      let url = "/api/getQuoteFromZerodha";

      // console.log(livePositionsInstrumentTokens)

      let obj = {};
      obj.accessToken = this.accessToken;

      let quoteData = [];
      obj.arryOfInstruments = livePositionsInstrumentTokens;

      let a = await axios.post(url, obj).then((r) => {
        quoteData = r.data;

        return 1;
      });

      // console.log(quoteData,'quoteData',a)
      let counter = 0;

      Object.keys(quoteData).forEach((lp1) => {
        let lp = quoteData[lp1];
        console.log(lp, "lp");

        counter = counter + 1;
        let obj = instrumentsForMining.filter(
          (i) => i.instrument_token == lp.instrument_token
        )[0];
        lp.buy_quantity = obj.lot_size;

        // let tgt=obj.pricePoints.yesterday.rangeBreakOutTarget;
        let tgt = obj.pricePoints.yesterday.high * 1.05;

        let entry = obj.pricePoints.yesterday.high;
        // let sl=obj.pricePoints.yesterday.low;
        let sl = obj.pricePoints.yesterday.high * 0.95;

        if (lp.last_price > tgt) {
          console.log("profit");
          let tmp = 0;
          tmp = (lp.last_price - tgt) * lp.buy_quantity;

          console.log("tmp", tmp, obj.tradingsymbol);

          this.pnl = this.pnl + tmp;
        } else if (lp.last_price < sl) {
          console.log("stop loss");
          let tmp = 0;
          tmp = (lp.last_price - sl) * lp.buy_quantity;

          console.log("tmp", tmp, lp.tradingsymbol);

          this.pnl = this.pnl + tmp;
        } else {
          console.log("neither");

          let tmp = 0;
          tmp = (lp.last_price - entry) * lp.buy_quantity;

          console.log("tmp", tmp, lp.tradingsymbol);

          this.pnl = this.pnl + tmp;
        }

        // console.log(lp)
      });

      console.log("total this.pnl", this.pnl, counter);
    },

    async showModalForSquareOff() {

      let a= await this.refreshTradeStatus()
      let livePositionsTmp = await this.getPositions();

      this.livePositionsSelected = livePositionsTmp.net.filter(
        (p) =>
          // p.tradingsymbol.includes("FUT") &&
          p.exchange == this.itype &&
          p.quantity != 0 &&
          p.product == "NRML"
      );

      this.livePositionsSelected.forEach((lp) =>
        this.$set(lp, "selected", true)
      );

      this.modalShow = true;
    },

    async squareoffAll() {
      // var y=confirm('do uwant to continue');

      //get positions

      let livePositionsInstrumentTokens = this.livePositionsSelected
        .filter((lp) => lp.selected == true)
        .map((m) => {
          let pp1 = this.instruments.filter(
            (i) => i.instrument_token == m.instrument_token
          )[0].pricePoints;

          // console.log(pp1, "pricePoints");

          return this.itype + ":" + m.tradingsymbol;
        });

      let urlGetQuoteFromZerodha = "/api/getQuoteFromZerodha";

      let obj = {};
      obj.accessToken = this.accessToken;
      obj.arryOfInstruments = livePositionsInstrumentTokens;

      let marketQuotes = await axios
        .post(urlGetQuoteFromZerodha, obj)
        .then((res) => res.data);

      let keys = Object.keys(marketQuotes);

      let orderArray = keys
        .map((k1) => {
          let i = marketQuotes[k1];
          let tradingsymbol = k1.split(":")[1];
          let transaction_type = "SELL";

          let instrument_token = marketQuotes[k1].instrument_token;

          let PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

          let hasLivetarget = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].hasLivetarget;

          if (PlacedReverseOrder == true || hasLivetarget == true) {
            console.log("placed reverse order");
            return false;
          } else {
            let lot_size = this.instruments.filter(
              (i) => i.instrument_token == instrument_token
            )[0].lot_size;
            let order_type = "LIMIT";
            let Price = i.depth.buy.sort((a, b) => b.price - a.price)[0].price;

            let product = "NRML";
            let reverseOrder=true;

            let arr = this.buildOrderArray(
              tradingsymbol,
              transaction_type,

              lot_size,
              order_type,
              Price,
              product,
              reverseOrder
            );

           

            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == instrument_token
              )[0],
              "PlacedReverseOrderType",
              "Day Exit"
            );

            // let a = [];

            // a.push(arr);

            return arr;
          }
        })
        .filter((n) => !(n == null || n == false));

      this.modalShow = true;

      // this.orderArray=orderArray;

      //  let orderArray = [arr];
      // console.log(orderArray,'orderArray')

      let orderArray1 = orderArray;
      let a = await this.placeOrder(orderArray1);

      // console.log("orderArray1", JSON.stringify(orderArray));

      //return false;

      //check if reverse order exit

      ///till here
    },

    async getChatId() {
      return;
      this.chat_id = -1;
      if (this.chat_id != 1) {
        let url = `https://api.telegram.org/bot${this.token}/getUpdates`;

        return axios
          .get(url)
          .then((r) => {
            this.chat_id = r.data.result[0].channel_post.chat.id;

            return this.chat_id;
          })
          .catch((e) => e);

        var txt = "First time";
      }
    },

    sendToTelegramGroup(text) {
      return;
      if (true) {
        let obj = {};
        obj.chat_id = this.chat_id;
        obj.text = text;

        let urlToSendMessage = `https://api.telegram.org/bot${this.token}/sendMessage`;

        axios
          .post(urlToSendMessage, obj)
          .then((r) => {
            // console.log('from bot ',r.data.result[0])
          })
          .catch((e) => e);
        // console.log('from bot ',r.data.result[0].channel_post.chat.id)
      }
    },

    resetUserMessages() {
      this.userMessages = ["no msg"];
    },
    triggerWebsocktsInServer() {
      let url = "/api/triggerWebsocktsInServer/accessToken/" + this.accessToken;

      axios.get(url).then((r) => {
        console.log("triggered");
      });
    },
    CancelOrder() {},
    enableForEditng() {},
    async setTarget(i) {
      let tradingsymbol = i.tradingsymbol;
      let lot_size = i.quantity;
      let order_type = "LIMIT";
      let Price = i.target;
      let transaction_type = "SELL";

      let product = "NRML";

      let reverseOrder=true;
      let arr = this.buildOrderArray(
        tradingsymbol,
        transaction_type,

        lot_size,
        order_type,
        Price,
        product,
        reverseOrder
      );
      console.log(arr);

      let orderArray = [arr];

      let a = await this.placeOrder(orderArray);
      console.log("place order result", a);
      let {livePositions,liveOrders} =  this.refreshTradeStatus();
    },

    async getOrders() {

      this.hasStartedGetOrders=true;
      let obj = {};
      obj.accessToken = this.accessToken;
      let url = "/api/getOrdersPost";

      return axios.post(url, obj).then((res) => {


        if (res.data.length == 0) {
          this.liveOrders = ["no_live_orders"];
        }

        // if(res.data.data==null){

        //   return new Promise((res,rej)=>
        //   {

        //     this.liveOrders=0;
        //  res([])

        //   }
        //  )
        // }

        if (res.data.status == "error") {
          this.liveOrders = [0];
        }

        if (typeof res.data == "undefined") {
          this.liveOrders = [0];
          return new Promise((res, rej) => res([]));
        }

        if (typeof res.data.error_type == "string") {
          this.liveOrders = [0];

          console.log(res.data.error_type, "@line 1283");

          this.$router.go()
          return false;
        }
        // console.log(res.data,typeof res.data,'res.data @1284 line')
        // exchange_update_timestamp
        this.executedOrders = res.data.filter(
          (r) => r.quantity==0
        );
       
       
        this.allOrders = res.data;
        let t = res.data.filter((o) => {
          // console.log(o.status,'o.status');
          let result =
            o.exchange == this.itype &&
            (o.status == "OPEN" ||
              o.status == "AMO" ||
              o.status == "AMO REQ RECEIVED");

          return result;
        });

    
        this.liveOrders = t.filter(
          (tx) => tx.exchange == this.itype 
          // && tx.tradingsymbol.includes("FUT")Ent
        );
        this.orders = t.filter(
          (tx) => tx.exchange == this.itype 
          // &&          tx.tradingsymbol.includes("FUT")
        );




        ///remove PlacedReverseorder if live order is set. this is to prevent false live order status for next time trade
       
       
if(typeof this.liveOrder!='undefined'){
  let loCopy=[...this.liveOrders];


    let i1=    setInterval(async ()=>{
let cur=loCopy.pop();
if(typeof cur=='undefined'){
console.log('clearing live order missing script pupp')
clearInterval(i1);
return ;
}


if(typeof this.instruments.filter(i=>i.instrument_token==cur.instrument_token).length==0){
console.log('updating lo missing script')
let k=await this.updateMissingScriptInInstrumetsFile(e.instrument_token)

///  push new current instruments here
}


        },5*1000);
  
}

      
       
       
        this.liveOrders.forEach(e=>{

if(this.instruments.filter(i=>i.instrument_token==e.instrument_token).length!=0){

  this.instruments.filter(i=>i.instrument_token==e.instrument_token)[0].PlacedReverseOrder=false

  this.liveOrderScripts = t
          .filter((t1) => t1.transaction_type == "BUY")
          .filter((f) => f.exchange == this.itype 
          // &&           f.tradingsymbol.includes("FUT")
          
          )

          .map((a) => {
            // return 123
            // return a;

            if( this.instruments.filter(
              (i2) => i2.tradingsymbol == a.tradingsymbol
            ).length!=0){

 return this.instruments.filter(
              (i2) => i2.tradingsymbol == a.tradingsymbol
            )[0].name;
          }else{

            return -1
          }
        }
            

          ).filter(a=>a!=-1)
           
}
  


})



      

        this.liveBuyOrderAmount = t
          .filter(
            (t1) =>
              t1.status == "OPEN" &&
              t1.transaction_type == "BUY" &&
              t1.exchange == this.itype 
              
              // &&               t1.tradingsymbol.includes("FUT")
          )
          .map((s) => s.quantity * s.price)
          .reduce((pv, cv) => (pv = pv + cv), 0);
        //console.log('orders',t)

        this.hasStartedGetOrders=false;
        return this.liveOrders;
      });







    },

    changeBuyingMethod(i) {},

    getProductAndLivePnl(CurrentInstrument){
      let product,livePnl

if(this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          ).length==0){

 return  { product,livePnl};


}

       product = this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          )[0].product;

           livePnl = this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          )[0].pnl;
          

          return {product,livePnl}

    },

    heartBeatAndCurrentCheckDigit(){
      this.CurrentCheckDigit++;
      this.heartBeat = !this.heartBeat;

    },

    checkNiftyStatus(index){


        //  console.log({index},'index') 

let pp= this.indices.find(i=>i.tradingsymbol==index)

// return pp.pricePoints.d0;
// cl(pp.last_price);
if(pp.last_price!=0){

  
        
        
        // pp.pricePoints.d0.close
 let change=(pp.last_price-pp.pricePoints.d0.close)
       
 let changePc1=Math.abs(
(change/pp.pricePoints.d0.close)
        )*100  

        let changePc=changePc1.toFixed(2)


        let res={};

        res.changePc=changePc
        res.change=change
        res.open=pp.pricePoints.d0.open
        res.low=pp.pricePoints.d0.low
        res.high=pp.pricePoints.d0.high
        res.close=pp.pricePoints.d0.close

        // console.log(res,'from nifty status')

        this.$set(pp,'indexStatus',res)
return res

}else{



{
  
  // console.log(res,'from nifty status');


  let o=
   {



    changePc:'na',
    change:'na',

}
this.$set(pp,'indexStatus',o)


return ob;

}

}

},


checkProceedWithIndexChange(symbol) {
let index;
if (symbol.includes('BANK')) {
index = "BANK NIFTY";
if (Math.abs(this.checkNiftyStatus(index).change) > 200) {
return true;
} else {
const timestamp = new Date().getTime();
let text = "bank Nifty change less than 200";
let ob = {text, timestamp};
this.userMessages.push(ob);
// console.log(ob);
return false;
}
} else {

index = "NIFTY 50";
if (Math.abs(this.checkNiftyStatus(index).change) > 100) {
return true;
} else {
const timestamp = new Date().getTime();
let text = "bank Nifty change less than 200";
let ob = {text, timestamp};
this.userMessages.push(ob);
// console.log(ob);
return false;
}
}
},
    tradeEntry(instrument_token,inst=CurrentInstrument,CurrentInstrument,element){
      try {





let index;



let proceed=this.checkProceedWithIndexChange(CurrentInstrument.tradingsymbol)

proceed=true;


      
if(proceed==false){
  return; 

}


        proceed=true;
         

let list=[9,15]

          if(list.includes(this.hours)){


          }





//  console.log(CurrentInstrument.pricePoints.d0,'do reached here')

cl('reaehed switch')

console.log('condition 1 ',CurrentInstrument.pricePoints.d0.high<CurrentInstrument.pricePoints.d1.high)
console.log('connndition 2 ',CurrentInstrument.pricePoints.d0.open<CurrentInstrument.pricePoints.d1.high)
console.log('connndition 3 ',CurrentInstrument.previousPrice !=0)
console.log('connndition 4 ',CurrentInstrument.last_price >= CurrentInstrument.pricePoints.d1.high)


switch(true){

//entryswitch




case ( 
//so run fetch instruments regularly
CurrentInstrument.pricePoints.d0.high<CurrentInstrument.pricePoints.d1.high && ///so high not croseed before 
CurrentInstrument.pricePoints.d0.open<CurrentInstrument.pricePoints.d1.high && ///so opened below yesterday high /// pvs case itself solve still

CurrentInstrument.previousPrice !=0 &&
  



 CurrentInstrument.last_price >= CurrentInstrument.pricePoints.d1.high
            
            
            
            ) :


         

            console.log( 'y day high candle',CurrentInstrument.tradingsymbol)

            let p1=CurrentInstrument.last_price;

            this.proceedForEntry(
              instrument_token,
              CurrentInstrument,
              element,
              CurrentInstrument.pricePoints.d1.high,
              "long"
            );

            break;


  // case ( inst.previousPrice < maxCandle &&
  //           CurrentInstrument.last_price >= maxCandle) :

  //           console.log('max candle trade',CurrentInstrument.tradingsymbol)

  //           this.proceedForEntry(
  //             instrument_token,
  //             CurrentInstrument,
  //             element,
  //             maxCandle,
  //             "long"
  //           );

  //           break;



//  case ( inst.previousPrice < high &&
//             CurrentInstrument.last_price > high) :



//             let ep1=Math.max(open,close)
//             this.proceedForEntry(
//               instrument_token,
//               CurrentInstrument,
//               element,
//               ep1,
//               "long"
//             );

//             //entry above candle high 

//             //entry point 5 % less

//   ///closing point below sell

//   return;

//   break;





  // case ( inst.previousPrice > close &&
  //           CurrentInstrument.last_price <= close) :

  // ///closing point below sell

  // return;


  // if(this.instruments.
  //         filter(i=>i.instrument_token==instrument_token)[0].
  //         hasLivePosition){

  //           return false
  //         }
  // this.proceedForEntry(
  //             instrument_token,
  //             CurrentInstrument,
  //             element,
  //             close,
  //             "short"
  //           );

  // break;

  // case ( inst.previousPrice < close &&
  //           CurrentInstrument.last_price > close) :
  //           if(this.instruments.
  //         filter(i=>i.instrument_token==instrument_token)[0].
  //         hasLivePosition){

  //           return false
  //         }

  //         return;
///closing point abouve buy

// console.log({close},CurrentInstrument.tradingsymbo,'hi')


// let close11=close*.95
// let close1=close11.toFixed(1)


// this.proceedForEntry(
//               instrument_token,
//               CurrentInstrument,
//               element,
//               close,
//               "short"
//             );
// //changed long to short
// break;


// case ( inst.previousPrice < open &&
//             CurrentInstrument.last_price > open) :
            
            
//             if(this.instruments.
//           filter(i=>i.instrument_token==instrument_token)[0].
//           hasLivePosition){

//             return false
//           }

//           return;
// ///opening point   abouve buy

// let open11=open*.95
// let open1=open11.toFixed(1)

// console.log({open},CurrentInstrument.tradingsymbo,'hi')
this.proceedForEntry(
              instrument_token,
              CurrentInstrument,
              element,
              open,
              "short"
            );

            //changed long to short

// break;


// case ( inst.previousPrice > open &&
//             CurrentInstrument.last_price < open) :
//             if(this.instruments.
//           filter(i=>i.instrument_token==instrument_token)[0].
//           hasLivePosition){

//             return false
//           }

//           return ;
///opening point below sell
// this.proceedForEntry(
//               instrument_token,
//               CurrentInstrument,
//               element,
//               open,
//               "short"
//             );

// break;



}






          
//           if (
//             inst.previousPrice <= entryLong &&
//             CurrentInstrument.last_price >= entryLong ///day entry
         
//             ) {
//             ///long entry

//             entryLong = high;


//           if(this.instruments.
//           filter(i=>i.instrument_token==instrument_token)[0].
//           hasLivePosition){

//             return false
//           }


//             this.proceedForEntry(
//               instrument_token,
//               CurrentInstrument,
//               element,
//               entryLong,
//               "long"
//             );

//             // console.log('trade entry  long for %s @ %s',CurrentInstrument.tradingsymbol,entryLong)
//             // return true;
//           } else if (
//             inst.previousPrice >= entryShort &&
//             CurrentInstrument.last_price <= entryShort
//           ) {
//             ///short entry

//             if(this.instruments.filter(i=>i.instrument_token==instrument_token)[0].hasLivePosition){

// return false
// }

           
           
//             this.proceedForEntry(
//               instrument_token,
//               CurrentInstrument,
//               element,
//               entryShort,
//               "short"
//             );

//             // console.log('trade entry  short for %s @ %s',CurrentInstrument.tradingsymbol,entryShort)

//             // return true;
//           }


          


} catch (e) {
            // console.log("trade entry function", e);
            return false;
          }

         

    },

async setTargetPricesBasedOnQuantity(CurrentInstrument,element,low,high,instrument_token){

  return new Promise(async (res,rej)=>{
    


  
  let offerPrice, bidPrice, count,livePnlOffered;
  let stopLoss, target, lstPrice,quantity;

  if(CurrentInstrument.PlacedReverseOrder==true){


bidPrice=-1,offerPrice=-1,count=-1,stopLoss=-1, target=-1, lstPrice=-1,livePnlOffered=-1,quantity

res( {offerPrice, bidPrice, count,livePnlOffered,stopLoss, target, lstPrice,quantity})
return
}

  quantity = this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          )[0].quantity;

          // let c1=await this.getOrders();
            
          // console.log(c1,'out put of get orders in side set target prices fun @line number 2512')
            count = this.liveOrders.filter(
                          (i) =>
                            i.instrument_token == instrument_token 
                          
                        ).length


          if (quantity > 0) {


            let buy_price = this.livePositions.filter(
              (lp) => lp.instrument_token == CurrentInstrument.instrument_token
            )[0].buy_price;

            let buyQuantity = this.livePositions.filter(
              (lp) => lp.instrument_token == CurrentInstrument.instrument_token
            )[0].buy_quantity;

            offerPrice = element.depth.buy.sort((a, b) => b.price - a.price)[0]
              .price;

            lstPrice = offerPrice;
            let p;

            livePnlOffered = (offerPrice - buy_price) * buyQuantity;

            stopLoss = low - 5;

;

            // console.log('count of %s is $%s & quantity is %s ',count,
            // CurrentInstrument.tradingsymbol,quantity)
          } else if (quantity < 0) {
            stopLoss = high + 5;

            
            let sell_price = this.livePositions.filter(
              (lp) => lp.instrument_token == CurrentInstrument.instrument_token
            )[0].sell_price;

            let sellQuantity = this.livePositions.filter(
              (lp) => lp.instrument_token == CurrentInstrument.instrument_token
            )[0].sell_quantity;

            bidPrice = element.depth.sell.sort((a, b) => b.price - a.price)[0]
              .price;

            lstPrice = bidPrice;
            let p;

            livePnlOffered = (bidPrice - sell_price) * sellQuantity;
            stopLoss = high + 5;

            count = this.liveOrders.filter(
              (i) =>
                i.instrument_token == instrument_token &&
                i.transaction_type == "BUY"
            ).length;

          
          }

          res( {offerPrice, bidPrice, count,livePnlOffered,stopLoss, target, lstPrice,quantity})

        })
},

    setPreviousPriceAndLastPrice(instrument_token,last_price){


// console.log({last_price})

      if(isNaN(instrument_token)){


        cl('is nan issue instriment token in setprevios and last price')
        return  false;
      }

      if(this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          ).length==0){

            cl('is nan issue instriment token in setprevios and last price')

            return false;
          }




      this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],

          "previousPrice",
                    this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].last_price
        );
        
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0].last_price = last_price;

     


    },

    setLastPriceBasedOnTradeDirection(CurrentInstrument,element){
try{
return element.last_price;

      let qty1, qty11,last_price;
        if (
          typeof this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          ) == "undefined" ||  typeof this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          )[0]=='undefined'
        ) {
         
          last_price = element.last_price;
       
        } else {
          qty11 = this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          )[0];

          if (typeof qty11 != 'undefined') {
            qty1 = qty11.quantity;
          }

          if (qty1 > 0) {
            last_price = element.depth.buy.sort((a, b) => b.price - a.price)[0]
              .price;
          } else if (qty1 < 0) {
            last_price = element.depth.sell.sort((a, b) => b.price - a.price)[0]
              .price;
          }
        }

return last_price;

      } catch(e){

console.log('error from function',setLastPriceBasedOnTradeDirection)

      }
    },

    setLiveScript(CurrentInstrument,last_price){
     try {
       let ls = {};
         ls.tradingsymbol = CurrentInstrument.tradingsymbol;
         ls.ltp = last_price;
        //  ls.buyPoint = CurrentInstrument.pricePoints.d1.high;
        //  ls.target = CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;
        //  ls.stopLoss = CurrentInstrument.pricePoints.d1.low;
         this.liveScript = ls;
 
     } catch (error) {
      

      console.log('error from setLiveScript ',error)
     }
    },


    setClosedTradesScripts(pos){
      let tmp2 = pos
              .filter(
                (p) =>
                  p.exchange == this.itype &&
                  p.quantity == 0 &&
                  p.product == "NRML"
                  
                  // &&          p.tradingsymbol.includes("FUT")
              )

              .sort((a, b) => b.pnl - a.pnl);

              tmp2.forEach((e) => {
              let instrument = this.instruments.filter(
                (i) => i.instrument_token == e.instrument_token
              )[0];
              this.$set(e, "instrument", instrument);
            });

      this.closedTradesScripts = tmp2;

    },
    setLivePositionScripts(data){
      
          this.livePositionScripts = data
            .filter((n) => n.exchange == this.itype && n.quantity != 0)
            .map((i) => {
              if (
                this.instruments.filter(
                  (i2) => i2.tradingsymbol == i.tradingsymbol
                ).length != 0
              ) {
                return this.instruments.filter(
                  (i2) => i2.tradingsymbol == i.tradingsymbol
                )[0].name;
              } else {
                return i.tradingsymbol.split("22")[0];
              }
            });

    },

    async getPositions() {


      // call after get live orders

      if(this.hasStartedGetLivePosition==true){
        console.log('here one 2')
        return false
      }
      this.hasStartedGetLivePositions=true;
     
      let url = "/api/getPositions";

      let obj = {};
      obj.accessToken = this.accessToken;
      return axios.post(url, obj).then(async (res) => {


        this.hasStartedGetLivePositions=false;
  
        if (typeof res.data.net == "undefined") return [];

       
        if (res.data.net.length > 0) {
                  this.setLivePositionScripts(res.data.net) 
           
          }
        let tmp;
        let livePositionsTmp =res.data;
        if (typeof livePositionsTmp == "undefined") {
          this.livePositions = "NOT_LOADED";

          this.livePositionTotalCost = -1;
          // console.log('here one 6')
          return []
          // return false;
        }
        if (typeof livePositionsTmp.net == "undefined") {
          this.livePositions = [];

          this.livePositionTotalCost = -1;
          return true;
        }

        tmp = livePositionsTmp.net
              .filter(
                (p) =>
                  p.exchange == this.itype &&
                  // p.tradingsymbol.includes("FUT") &&
                  p.quantity != 0
              )
              .sort((a, b) => b.pnl - a.pnl);

         

        if (livePositionsTmp.net.length == 0) {
            tmp = [];

            this.livePositionTotalCost = -2;
            // console.log('here one 7')
            return  tmp;
          }


          let liveInstrumentSymbols = livePositionsTmp.net.map(
              (a) => a.instrument_token
            ); 
            
          this.liveInstrumentSymbols = liveInstrumentSymbols


            var quotes = await this.getQuoteFromZerodha(liveInstrumentSymbols);
     
            tmp.forEach((e) => {
              let instrument = this.instruments.filter(
                (i) => i.instrument_token == e.instrument_token
              )[0];

              // console.log('e.instrument_token',e.instrument_token)

              let q = quotes[e.instrument_token];

              // console.log(q,'q')

              this.$set(e, "instrument", instrument);
              this.$set(e, "quotes", q);


            
            });

            



           

            this.setClosedTradesScripts(livePositionsTmp.net)
            
           
           
           
            this.livePositions = tmp;

            this.livePositionTotalCost = 0;

this.totalBuyOrderLivePlacedBySoftware = 0;
this.livePositions

  .filter((f) => f.exchange == this.itype 
  // && f.tradingsymbol.includes("FUT")
  )
  .forEach(async (l) => {


    this.livePositionTotalCost = Math.abs(
      this.livePositionTotalCost + l.average_price * l.quantity
    );

    if (
      typeof this.instruments.filter(
        (i) => i.instrument_token == l.instrument_token
      )[0] !== "undefined"
    ) {
      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == l.instrument_token
        )[0],
        "average_price",
        l.average_price
      );


      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == l.instrument_token
        )[0],
        "hasLivePosition",
        true
      );



    }else{


      if(this.instruments.filter(
          (i) => i.instrument_token == l.instrument_token
        ).length!=0){

          this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == l.instrument_token
        )[0],
        "hasLivePosition",
        false
      );
        }
    

    }

    this.$set(l, "targetPc", 1.2);

    try {

      if(this.instruments.filter(
        (i) => i.instrument_token == l.instrument_token
      ).length!=0){
        let rangeBreakOutTarget = this.instruments.filter(
        (i) => i.instrument_token == l.instrument_token
      )[0].pricePoints.d1.rangeBreakOutTarget;

      
      this.$set(l, "rangeBreakOutTarget", rangeBreakOutTarget);


      }


   
      // let t=await this.getOrders();


let transaction_type;

if(l.quantity>0){
  transaction_type="SELL"

}
if(l.quantity<0){

  transaction_type="BUY"
}

      let ln = this.orders
        .filter((o) => 
        
        o.tradingsymbol == l.tradingsymbol && 
        o.quantity== Math.abs(l.quantity)
        
        && o.transaction_type==transaction_type
        
        )
      .length;


// console.log(l.quantity,'tt',transaction_type,'ln',ln,this.orders)


        // console.log({ln})

        
     

if(   this.instruments.filter(
            (i) => i.instrument_token == l.instrument_token
          ).length!=0){

          

      if (ln == 0) {


        
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == l.instrument_token
          )[0],
          "hasLiveTarget",
          false
        );
      } else if (ln > 0) {



        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == l.instrument_token
          )[0],
          "hasLiveTarget",
          true
        );

        this.$set(l, "hasLiveTarget", true);


        if(this.orders
        .filter((o) => o.tradingsymbol == l.tradingsymbol)
       .length!=0){

        let targetPrice = this.orders
        .filter((o) => o.tradingsymbol == l.tradingsymbol)
       [0].price

       this.$set(l, "targetPrice", targetPrice);
       }

      

     

        let element = quotes[l.instrument_token];

          

        
      }

    } else{

      // console.log('has live target canoot be updated in intruments .. update instrument with the script')
    }

      this.hasStartedGetLivePositions=false
    } catch (error) {
      console.log('here one 9',error)
      this.$set(l, "rangeBreakOutTarget", 9999);
      this.$set(l, "hasLiveTarget", false);

      this.hasStartedGetLivePositions=false;
    }

    // this.$set(l, "target", Math.ceil(l.average_price * l.targetPc), 1);

    // no live target so set a live target

    if (
      typeof this.instruments.filter(
        (i) => i.instrument_token == l.instrument_token
      )[0] == "undefined"
    ) {
      let k=await this.updateMissingScriptInInstrumetsFile(l.instrument_token);

      console.log(
        "l.instrument_token absent",
        l.tradingsymbol,
        l.instrument_token
      );
      this.hasStartedGetLivePositions=false;
      return false;
    }
  });


  this.hasStartedGetLivePositions=false;
        return this.livePositions;
        res.data.net.forEach((e) => {
          // let tsl = this.getTrailingStopLoss(e.instrument_token, e.pnl);

          // console.log(tsl,'tsl')
          this.$set(e, "trailingStopLoss", tsl);
        });

  
      });
    
    
    },

    async getLastPriceForClosedTrades() {
      let ar = this.closedTradesScripts.map((cts) => cts.instrument_token);

      let a = await this.getQuoteFromZerodha(ar);
    },

    
    
    async placeTargetsForSingleScript(instrument_token,quantity) {


      //fetch live orders


return new Promise(async (res,rej)=>{





try{



 let  PlacedReverseOrder = this.instruments.filter(
      (i) => i.instrument_token == instrument_token
    )[0].PlacedReverseOrder;

    if(PlacedReverseOrder==true){

      return false
    }

    let CurrentInstrument = this.instruments.filter(
      (i) => i.instrument_token == instrument_token
    )[0];
    console.log('order triggering from placeTargetsForSingleScript is %s and has livee target from current instrument is %s ',PlacedReverseOrder,CurrentInstrument.hasLiveTarget)
  

//  console.log('placeTargetsForSingleScript')
let transaction_type;
  // let lo=await this.getOrders();s



let e1=this.livePositions.filter(i=>i.instrument_token==instrument_token)

if(e1.length==0){

  return false
}

let e=e1[0]

  // console.log({lo})
      let liveReverseOrder=this.liveOrders.filter(i=>i.instrument_token==instrument_token 
 && i.quantity!=0
);


// console.log({liveReverseOrder})
if (liveReverseOrder.length>0){
  // console.log('reverse order tallied change lgic here')
   return false;
}
this.placingReverseOrderInProgress = true;


  let output = [];

  

    if (typeof CurrentInstrument == "undefined") {

      console.log('CurrentInstrument == "undefined @2930"')
           return false;
    }

   
    if (quantity == 0) {

      console.log('quantity == 0 @2939')
      return;
    }

    let count,
     
      rangeBreakOut,
      high,
      targetPoint
     

    let { upperBreakOutTarget, lowerBreakOutTarget } =
      this.getLatestPricePoints(instrument_token);

    


    // console.log({quantity})

    if (quantity < 0) {
      transaction_type = "BUY";
      quantity = Math.abs(quantity);

   

      count = this.liveOrders.filter(
        (i) =>
          i.instrument_token == instrument_token &&
          i.transaction_type == "BUY"
      ).length;


      rangeBreakOut = lowerBreakOutTarget;

      high = rangeBreakOut;

      targetPoint = Number(rangeBreakOut).toFixed(1); //rangeBreakOutMath.max(rangeBreakOut,upper_circuit_limit);
    } else if (quantity > 0) {
      transaction_type = "SELL";

    
      quantity = Math.abs(quantity);
      count = this.liveOrders.filter(
        (i) =>
          i.instrument_token == instrument_token &&
          i.transaction_type == "SELL"
      ).length;
      rangeBreakOut = upperBreakOutTarget;
            high = rangeBreakOut;
      targetPoint = Number(rangeBreakOut).toFixed(1);;
    }

    let hasLiveTarget;
    if (count > 0) {
      hasLiveTarget = true;
    } else if (count == 0) {
      hasLiveTarget = false;
    }

    
// typeof PlacedReverseOrder != "undefined" ||
if (
      PlacedReverseOrder == true ||
   
      hasLiveTarget == true
    ) {
     
      // console.log({count},{hasLiveTarget },{PlacedReverseOrder},'reverse order place d ')

      return false;
    }

//     let liveReverseOrder=this.liveOrders.filter(i=>i.instrument_token==instrument_token 
//  && i.quantity!=0
// );

    let element = 0;
    let product = e.product;
    let livePnl = e.pnl;



    output.push(CurrentInstrument.tradingsymbol);

    // console.log(
    //   "palcing reverse1",
    //   CurrentInstrument.tradingsymbol,
    //   "high,upper_circuit_limit",
    //   high,
      
    // );

    let reverseOrder=true;
    let o=this.placetargetAndStopLoss(
      CurrentInstrument,
      instrument_token,
      element,
      product,
      quantity,
      targetPoint,
      livePnl,
      true,
      transaction_type,reverseOrder
    );

    // this.instruments.filter(
    //   (i) => i.instrument_token == instrument_token
    // )[0].PlacedReverseOrder=false;

    res(o)

  }catch(e){

    rej(e)
  }

})
},

checkReverseOrderTallyAndReturnNoTargetScripts(){

  let noTargetArray=[];

  let ReverseOrderPending=false;

  //livePositions. not updating
  this.livePositions.forEach(e=>{

   

let instruments=this.liveOrders.filter(i=>e.instrument_token==i.instrument_token && e.status=="OPEN" );
let ln=instruments.length;
// console.log(e.tradingsymbol,ln)

if(ln==0){

  noTargetArray.push(e.instrument_token)

}
// console.log(e.tradingsymbol,ln,noTargetArray)

if(noTargetArray.length==0){

  ReverseOrderPending=false
}else{

  ReverseOrderPending=true;

}


  })


  return {ReverseOrderPending,noTargetArray}
},

    async placeTargetsForLiveScripts() {
// return ;
      let liveOrders = await this.getOrders();

      let liveInstrumentSymbols = this.livePositions.map(
              (a) => a.instrument_token
            ); 
            
          this.liveInstrumentSymbols = liveInstrumentSymbols

      var quotes = await this.getQuoteFromZerodha(liveInstrumentSymbols);

// this.$set(e, "quotes", q);
        let tmp;
        let livePositions = await this.getPositions();  
        
        let pos=this.livePositions.length;

        if(pos==0){
 console.log('no live positions for the script')
          return false
        }


/// call after refreshordeStatus

   let {ReverseOrderPending,noTargetArray} =  
    this.checkReverseOrderTallyAndReturnNoTargetScripts()



      if (!ReverseOrderPending){



        ///checkStoplOss
console.log('reverse order tallied')  /// change with oindividual
         return false;
      }

      // if (this.refreshingTradeStatus == true) {
      //    console.log("trade status is being refreshe before placing order");
      //   this.placingReverseOrderInProgress=false;
      // return false
      // }


      if(this.placingReverseOrderInProgress==true){

        // console.log('reverse order is being placed please wait...');

        let code='reverseOrderBeingPlaced';
        let msg='reverse order is being placed please wait...'
        this.triggerAlert(code,msg)
        
        return false;
      }

      this.placingReverseOrderInProgress = true;

      let symbols = [...this.livePositions];
// console.log(symbols,'symbols here');
      let ln = symbols.length;

      if (ln == 0) {
        console.log("livePositions symbol length 0 returning");
        this.placingReverseOrderInProgress == false;
        return false;
      }

      // console.log(this.livePositions,'this.livePositions')

      //  console.log(symbols, "symbols");
      if (typeof symbols == "undefined") return false;
     

      return new Promise((res, rej) => {
        let output = [];

        let timer = setInterval(() => {
          // this.livePositions.forEach(e=>{
            if(symbols.length==0){

            
return;
}
          let e = symbols.pop();

         




          if (typeof e == "undefined") {
          
            this.placingReverseOrderInProgress = false;
            clearInterval(timer);

            res(output);
            return;
          }
          let instrument_token = e.instrument_token;



        //   let tickData=this.CurrentTick.filter(c=>c.instrument_token==instrument_token)
        //  if(tickData.length){


        //   // console.log({tickData})
        //  }

          let CurrentInstrument = this.instruments.filter(
            (i) => i.instrument_token == e.instrument_token
          )[0];

          if (typeof CurrentInstrument == "undefined") {
            this.placingReverseOrderInProgress == false;
            return false;
          }

          if (typeof CurrentInstrument.otherCriteria == "undefined") {
            // return false;
          }

          let quantity = e.quantity;

          if (quantity == 0) {
            this.placingReverseOrderInProgress == false;
            return;
          }

          ///if has liver order or has reverse order placed /// return

          /// fire a target
          let count,
            transaction_type,
            rangeBreakOut,
            high,
            targetPoint,
            PlacedReverseOrder;

          let { upperBreakOutTarget, lowerBreakOutTarget } =
            this.getLatestPricePoints(instrument_token);


            let a=this.getLatestPricePoints(instrument_token);;

          

          PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

          quantity = e.quantity;

          // let upper_circuit_limit = e.quotes.upper_circuit_limit;

let uck=e.quotes.upper_circuit_limit;
let lck=e.quotes.lower_circuit_limit;
          // console.log(e.quotes,'e.quotes');

          // return;

          if (quantity < 0) {
            transaction_type = "BUY";
            quantity = Math.abs(e.quantity);


            count = this.liveOrders.filter(
              (i) =>
                i.instrument_token == instrument_token &&
                i.transaction_type == "BUY"
            ).length;

            //  rangeBreakOut=
            // (CurrentInstrument.pricePoints.d1.low-CurrentInstrument.pricePoints.d1.range) - 0.15;

            // rangeBreakOut= CurrentInstrument.pricePoints.d1.low-20
            // rangeBreakOut = lowerBreakOutTarget; //???

            // high = rangeBreakOut;



            lowerBreakOutTarget=CurrentInstrument.pricePoints.d1.rangeBreakDownTarget;
            


           


            // console.log(lowerBreakOutTarget,upperBreakOutTarget)
            if(typeof lowerBreakOutTarget=='undefined'){



targetPoint=lck
}else {

  
targetPoint =Math.min(lowerBreakOutTarget)

}





            // targetPoint =Math.max(lowerBreakOutTarget,lck)  ;
             //rangeBreakOutMath.max(rangeBreakOut,upper_circuit_limit);




          } else if (quantity > 0) {
            transaction_type = "SELL";

            upperBreakOutTarget=CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;
           
            quantity = Math.abs(e.quantity);
            count = this.liveOrders.filter(
              (i) =>
                i.instrument_token == instrument_token &&
                i.transaction_type == "SELL"
            ).length;

            // rangeBreakOut = lowerBreakOutTarget ;
            // // (CurrentInstrument.pricePoints.d1.rangeBreakOutTarget) - 0.15;
            // high = rangeBreakOut;

            // console.log({upperBreakOutTarget},'upperBreakOutTarget',{uck})





            if(typeof typeof upperBreakOutTarget!='undefined' && typeof uck!='undefined'  ){
              targetPoint =Math.min(upperBreakOutTarget,uck)


            }else 
if(typeof upperBreakOutTarget=='undefined'){

  targetPoint=uck
}else if(typeof uck=='undefined' ){

  targetPoint =upperBreakOutTarget

}

// console.log(CurrentInstrument.pricePoints.d1,'CurrentInstrument.pricePoints.d1')       
// console.log(upperBreakOutTarget,CurrentInstrument.pricePoints.d0.high,'here dk uck todays high',uck,lck,CurrentInstrument.tradingsymbol)

            
            
          }

          let hasLiveTarget;
          if (count > 0) {
            hasLiveTarget = true;
          } else if (count == 0) {
            hasLiveTarget = false;
          }

          if (
            PlacedReverseOrder == true ||
           
            hasLiveTarget == true
          ) {








            this.placingReverseOrderInProgress == false;

            console.log('has reverse order for %s',CurrentInstrument.tradingsymbol)



  


// this.stopLossTargetSwitch(quantity,last_price,high,
//       low,bidPrice,
//       offerPrice,CurrentInstrument,element,livePnlOffered)
     


console.log('reverse order bening placed',{ReverseOrderPending},{PlacedReverseOrder },{hasLiveTarget })






            return false;
          }

let hasLivetgt=CurrentInstrument.hasLiveTarget;
let hasLivePos=CurrentInstrument.hasLivePosition;

if(hasLivetgt){

  // console.log({hasLivetgt});
  return false
}

if(!hasLivePos){

// console.log({hasLivePos});
return false
}



          let element = 0;
          let product = e.product;
          let livePnl = e.pnl;

     

          output.push(CurrentInstrument.tradingsymbol);

          // console.log(
          //   "palcing reverse1 order from timer script",
          //   CurrentInstrument.tradingsymbol,
          //   "high,upper_circuit_limit",
          //   high
          
          // );


           let reverseOrder=true;

// console.log({targetPoint})

// console.log({targetPoint},'tpt')

          this.placetargetAndStopLoss(
            CurrentInstrument,
            instrument_token,
            element,
            product,
            quantity,
            targetPoint,
            livePnl,
            true,
            transaction_type
          );


          if(PlacedReverseOrder==true){

console.log('reverse order complete reseting plaxe reverorder abd nd ENTER NOW TO TRADE ')
this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
    PlacedReverseOrder=false;

         this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
    enterNowToTrade=false; ///for getting new orders 

}



        }, 333);
      });
    },
    async refreshTradeStatus() {

new Promise(async (res,rej)=>{





      if (this.refreshingTradeStatus == true) {
        // console.log("trade stattus is being refreshed ples wait");

         return false;
      }
      try {
        this.refreshingTradeStatus = true;
        let liveOrders = await this.getOrders();
        let tmp;
        let livePositions = await this.getPositions();

       
        this.refreshingTradeStatus = false;

       

        res({livePositions,liveOrders} )
      
        } catch (e) {
          this.refreshingTradeStatus=false;
          rej(e)
        console.log(e ,'error ofrefresh order status');
      }

      return "trade status returning";


    })
    },

    writeTrades(trade) {
      return false;
      // console.log("writing trade from write trade", trade);
      let obj = {};
      obj.trade = trade;
      const url = "/api/WriteTrades";

      axios.post(url, obj);
    },

    FetchInstruments() {
      const url = "/api/FetchInstruments";

      let obj = {};
      obj.accessToken = this.accessToken;

      axios.post(url, obj);
    },
    async enterNowToTrade(i) {
      let tradingsymbol = i.tradingsymbol;
      let lot_size = i.lot_size;
      let order_type;
      let Price;

      switch (i.seletedBuyingMethod) {
        case "MARKET":
          order_type = "MARKET";
          Price = i.last_price;

          break;

        case "LTP":
          Price = i.last_price;
          order_type = "LIMIT";
          break;

        case "MAX":
          // Price = i.SevenDayMaxMin.Max;
          Price = i.pricePoints.d1.high;
          order_type = "LIMIT";

          break;
      }

      let transaction_type = "BUY";
      let product = "NRML";
      let reverseOrder=false;
      let arr = this.buildOrderArray(
        tradingsymbol,
        transaction_type,

        lot_size,
        order_type,
        Price,
        product,reverseOrder
      );

      console.log(arr, "orderarray");

      let orderArray = [arr];

      let a = [];
      a.push(arr);

      this.orderArray.push(a);

     
      console.log("place order result", arr);
    }


   ,


    buildOrderArray(
      tradingsymbol,
      transaction_type,
      qty,
      order_type,
      Price,
      product = "NRML",reverseOrder
    ) {

// console.log(reverseOrder,'reverseOrder from build arrya ')

if(reverseOrder==false){
//for diableing entry
  //return;
}


if(reverseOrder==true){

  let PlacedReverseOrder=this.instruments.filter(
              (i) => i.tradingsymbol == tradingsymbol
            )[0].PlacedReverseOrder

            if(PlacedReverseOrder==true){

              return false;
            }

}
 

      let order = {};
      let proposedStock;


     

      //   proposedStock = this.instruments.filter(
      //     (i) => i.tradingsymbol == tradingsymbol
      //   )[0].name;

      
      // }

      //   order.variety = this.selectedVariety;

      proposedStock = this.instruments.filter(
        (i) => i.tradingsymbol == tradingsymbol
      )[0].name;

      this.liveOrderPlacedScripts.push(proposedStock);

      // console.log('hrs, min',this.hours,this.minutes)
      let exchange = this.itype;

      if (exchange != this.itype) {
        if (
          (this.hours == 15 && this.minutes > 30) ||
          this.hours > 15 ||
          this.hours < 9 ||
          (this.hours == 9 && this.minutes < 15)
        ) {
          order.variety = "amo";
        } else {
          order.variety = "regular";
        }
      } else if (exchange == this.itype) {
        if (
          (this.hours == 23 && this.minutes >= 30) ||
          this.hours == 0 ||
          this.hours < 9 ||
          (this.hours == 9 && this.minutes < 15)
        ) {
          order.variety = "amo";
        } else {
          order.variety = "regular";
        }
      }

      //  order.variety = "regular";

      order.params = {};
      order.params.exchange = this.itype;
      order.params.tradingsymbol = tradingsymbol;
      order.params.transaction_type = transaction_type;

      order.params.quantity = qty;

      order.params.product = product;
      order.params.order_type = order_type;
      order.params.validity = "DAY";

      order.params.price = Price;



      if(reverseOrder==true){
        this.$set(
            this.instruments.filter(
              (i) => i.tradingsymbol == tradingsymbol
            )[0],
            "PlacedReverseOrder",
            true
          );

          

      }
       

      return order;
    },

    setScriptTradedStatus(symbol, property, value) {
      let today = this.today();

      let trades;

      if (localStorage.getItem(today) == null) {
        trades = [];
      } else {
        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }

      if (typeof trades.filter((t) => t.symbol == symbol)[0] == "undefined") {
        return false;
      }

      trades.filter((t) => t.symbol == symbol)[0][property] = value;

      console.log("status updated", property, value, symbol);

      let ar2 = trades.filter((t) => t.status == "COMPLETE");

      let strigified = JSON.stringify(trades);
      localStorage.removeItem(today);
      localStorage.setItem(today, strigified);

      // this.localStorage = this.setChart(
      //   JSON.parse(localStorage.getItem(today))
      // );
    },

    async placeOrder(orderArray) {
      const url = "/api/PlaceTarget"; //temporary change

      // orderArray.forEach(e=>{
      // // this.tradingAlerts.push(...e.params)

      // })


      // console.log({orderArray},'here1')
      let data1 = JSON.stringify(orderArray);

      let data = {};

      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // console.log(data1,'data1 of orders just before palcing order ')

      return axios.post(url, data).then(async (res) => {



// console.log(res,'result of order placement')

// this.$router.go();

      


        let a = await this.refreshTradeStatus();

        // this.getOrders();

        // console.log(a, "result of refresh teade status");
        //this.$router.go();

        // console.log(res,'return of palce order')
        // this.resetPlacedReverseOrderForAllLiveScripts();
        //what about function to remove placed order to false for
        //everey thing and updating
        //live orders
      });
    },

    resetPlacedReverseOrderForAllLiveScripts() {
      return false;
      this.livePositions.forEach((e) => {
        this.$set(
          this.instruments.filter((i) => i.tradingsymbol == e.tradingsymbol)[0],
          "PlacedReverseOrder",
          false
        );
      });
    },

async proceedForReverseOrderPlacement(CurrentInstrument,instrument_token,orderUpdates){

let upper_circuit_limit
let lower_circuit_limit
  if(this.instruments.filter(i=>i.instrument_token==instrument_token).length>0)
  {

    if(typeof this.instruments.filter(i=>i.instrument_token==instrument_token)[0].quote!=undefined)
  {

    let q= this.instruments.filter(i=>i.instrument_token==instrument_token)[0].quote;
    upper_circuit_limit=q.upper_circuit_limit
    lower_circuit_limit=q.lower_circuit_limit

  }


}



let e=orderUpdates;


  let livePosition= this.livePositions.
  filter(l=>l.instrument_token==instrument_token)[0];


  // console.log({livePosition})
  if(typeof livePosition=='undefined'){

    return false
  }
  let quantity=livePosition.quantity


  // console.log({quantity})
          if (quantity == 0) {
            this.placingReverseOrderInProgress == false;

            console.log('this.placingReverseOrderInProgress ',this.placingReverseOrderInProgress,quantity  )
            return;
          }

          ///if has liver order or has reverse order placed /// return

          /// fire a target
          let count,
            transaction_type,
            rangeBreakOut,
            high,
            targetPoint,
            PlacedReverseOrder;

          let { upperBreakOutTarget, lowerBreakOutTarget } =
            this.getLatestPricePoints(instrument_token);

            lowerBreakOutTarget=CurrentInstrument.pricePoints.d1.rangeBreakDownTarget;
           
           
           
           upperBreakOutTarget=CurrentInstrument.pricePoints.d1.rangeBreakOutTarget;

            if(typeof lower_circuit_limit!=undefined){

              lowerBreakOutTarget=Math.min(
                CurrentInstrument.pricePoints.d1.rangeBreakDownTarget,
                
                lower_circuit_limit
              )
            }   
            
            
            if(typeof upper_circuit_limit!=undefined){

              upperBreakOutTarget=Math.min(
                CurrentInstrument.pricePoints.d1.rangeBreakOutTarget,
                upper_circuit_limit
              )
            }
            

          PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

         

          // let upper_circuit_limit =livePosition.quotes.upper_circuit_limit;

          // let c1=await this.getOrders();

          // console.log(c1,'ci get orders result at 3491')

          if (quantity < 0) {
            transaction_type = "BUY";
            quantity = Math.abs(e.quantity);

        

            count = this.liveOrders.filter(
              (i) =>
                i.instrument_token == instrument_token &&
                i.transaction_type == "BUY"
            ).length;

        
                     
           
   

           

            targetPoint = lowerBreakOutTarget //rangeBreakOutMath.max(rangeBreakOut,upper_circuit_limit);

           


          } else if (quantity > 0) {
            transaction_type = "SELL";

    
            quantity = Math.abs(e.quantity);


            count = this.liveOrders.filter(
              (i) =>
                i.instrument_token == instrument_token &&
                i.transaction_type == "SELL"
            ).length;

          
            targetPoint =  upperBreakOutTarget;



            //attack uck and loc for target points 
          }
  let hasLiveTarget;

  
          if (count > 0) {
            hasLiveTarget = true;
          } else if (count == 0) {
            hasLiveTarget = false;
          }



  if (
            PlacedReverseOrder == true ||
            hasLiveTarget == true
          ) {


            this.orderUpdateProcessing=false;
            // console.log('PlacedReverseOrder ',PlacedReverseOrder )
            // this.placingReverseOrderInProgress == false;
            return false;
          }


  let element = 0;
          // let product = orderUpdates.product
          let product = livePosition.product
          let livePnl = e.pnl; /// cehck this
 
          // upper_circuit_limit
          // console.log(
          //   "palcing reverse order on order update",
          //   CurrentInstrument.tradingsymbol,
          //   "high,upper_circuit_limit",
          //   high
           
          // );



   this.placetargetAndStopLoss(
            CurrentInstrument,
            instrument_token,
            element,
            product,
            quantity,
            targetPoint,
            livePnl,
            true,
            transaction_type
          );

          this.orderUpdateProcessing=false;
},



async placeTargetOnCancelledOrderUpdate(CurrentInstrument,instrument_token,orderUpdates){

  // let livePositions1 =await this.getPositions();
 let lp=await this.refreshTradeStatus();
 
  let livePositions =this.livePositions;

  // this.livePositions=livePositions;

  if(typeof livePositions=='undefined'){

    console.log(typeof livePositions,'livePositions undefined')   
    
     return false;
  }

  // console.log(livePositions,'livePositions');

 let count= livePositions.filter(lp=>lp.instrument_token==instrument_token).length
// console.log(count,'inside place target on cancelled order update triggering')
 if(count>0){

  
 this. proceedForReverseOrderPlacement()
 
 }else if(count==0){
  this.orderUpdateProcessing=false;


 }





  
},

async processOrderUpdate(orderUpdates){


  try{

  
let instrument_token=orderUpdates.instrument_token;
  let CurrentInstrument=this.instruments.filter(i=>i.instrument_token==instrument_token)[0];

  if(typeof CurrentInstrument=='undefined')
  {
 
    
    console.log('seems order update from some other script')
    return false;
  }
let enterNowToTrade=CurrentInstrument.enterNowToTrade;
let PlacedReverseOrder=CurrentInstrument.PlacedReverseOrder;

let livePositions=await this.getPositions();
let liveOrders=await this.getOrders();




switch(true){

  case orderUpdates.status=="COMPLETE": 

// console.log('COMPLETE trigger')

this.orderCompleteProcedure(livePositions,liveOrders,CurrentInstrument,instrument_token,orderUpdates)

break;

case orderUpdates.status=="CANCELLED": 


// console.log('order cancelled switch ')

// this.refreshTradeStatus()
 this.placeTargetOnCancelledOrderUpdate(CurrentInstrument,instrument_token,orderUpdates);

break;




}




}catch(e){console.log(e,'process order')}

},


    async proceedForEntry(
      instrument_token,
      CurrentInstrument,
      element,
      entryPrice,
      direction
    ) {



      // console.log(direction,'direction')
      //  return;
      // console.log(entryLong1);
      // return false

      // return false;

      // let entryLong = this.getHourlySupportPointsBelowReference(
      //   instrument_token,
      //   entryLong1
      // );

      // let entryPrice=entry
      // console.log('before entry undefined',CurrentInstrument.tradingsymbol,CurrentInstrument.last_price ,entryLong)

      if (typeof entryPrice == "undefined") {
        return false;
      }

      // console.log('before entry point 0a',CurrentInstrument.tradingsymbol,CurrentInstrument.last_price ,entryLong)

      if (entryPrice <= 0) {
        return false;
      }
      let { otherCriteriaCheck, message } = this.otherCriteria(
        element,
        CurrentInstrument
      );

      //  console.log('inside after other criteria',CurrentInstrument.tradingsymbol,CurrentInstrument.last_price ,entryLong)

      if (otherCriteriaCheck == true) {
        // console.log(otherCriteriaCheck,'otherCriteriaCheck for ',CurrentInstrument.tradingsymbol,'msg',message)
      }

      if (
        otherCriteriaCheck == false ||
        typeof otherCriteriaCheck == "undefined"
      ) {
        // console.log(otherCriteriaCheck,'otherCriteriaCheck')
        // return false;
      }

      let hoursExcluded = [15];

      if (hoursExcluded.includes(this.hours) && this.minutes > 0) {
        // console.log("No buying after" + this.hours + " hrs");

        // return false;
      }

      if (this.livePositionTotalCost == -1) {
        console.log(
          "Positions not loaded properly",
          this.livePositionTotalCost
        );
        return false;
      }

      if (this.liveOrders[0] == 0) {
        console.log(
          "liver orders  not loaded properly returning",
          this.liveOrders
        );
        // let o=await this.getOrders();
        // console.log(o,'refreshing live orders')
        // return false;
      }

      let ln = this.liveOrders.filter(
        (lo) => lo.instrument_token == instrument_token
      ).length;

      if (ln > 0) {
        // console.log('live order palced already for this symbol',CurrentInstrument.tradingsymbol)
        return false;
      }

      let proposedStock = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].name;
      // console.log(proposedStock,'proposedStock');

      if (this.liveOrderPlacedScripts.includes(proposedStock)) {
        console.log(proposedStock,
        'stock already holding ordered')

      //  return false;
      }

      // if(this.proosed)

      if (this.liveOrderScripts.includes(proposedStock)) {
        // console.log(proposedStock,'stock has live order ',CurrentInstrument.tradingsymbol)

       // return false;
      }

      if (this.livePositionScripts.includes(proposedStock)) {
        // console.log(proposedStock,'stock already holding')

       // return false;
      }

      let hasHitStopLoss = this.hasAlreadyHitStopLossBefore(
        element,
        CurrentInstrument,
        instrument_token
      );

      if (!hasHitStopLoss) {
        // console.log(
        //   "stop loss not hit before for %s so not buying no",
        //   CurrentInstrument.tradingsymbol
        // );
        // return false;
      }

      let hasHit = this.hasAlreadyHitTargetBefore(
        element,
        CurrentInstrument,
        instrument_token
      );
      // if (hasHit) {
      //   console.log(element,'has hit')
      //   return false;
      // }

      this.proposedBuyAmount = 0;
      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "enterNowToTrade",
        true
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "PlacedReverseOrder",
        false
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "seletedBuyingMethod",
        "MAX"
      );

      let date = new Date();
      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "activatedTime",
        date
      );

      /// trigger buy

      // let trade = `Buy instrument ${CurrentInstrument.tradingsymbol} at ${CurrentInstrument.SevenDayMaxMin.Max}`;
      let trade = `Buy instrument ${CurrentInstrument.tradingsymbol} at ${
        CurrentInstrument.pricePoints.yesterday.high
      } . 
      Target ${CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget} 
      Strict stop loss at ${Math.max(
        CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),
        CurrentInstrument.pricePoints.d1.low
      )} ,
      TargetProfit ${
        (CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget -
          CurrentInstrument.pricePoints.yesterday.high) *
        CurrentInstrument.lot_size
      }
      Possible Loss ${
        (CurrentInstrument.pricePoints.yesterday.high -
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1)) *
        CurrentInstrument.lot_size
      }
      `;

      let trade1 = {
        type: "Entry",

        tradingsymbol: CurrentInstrument.tradingsymbol,
        entry_price: CurrentInstrument.pricePoints.yesterday.high,
        target: CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
        stoploss: Math.max(
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),
          CurrentInstrument.pricePoints.d1.low
        ),
      };

      let trade2 = JSON.stringify(trade1);

      // this.sendToTelegramGroup(trade);
      // this.writeTrades(trade2 + ",");

      //checking the trade exeeds the maximum tradable regularunt   add live palced buy order in nfo

      // if(this.livePositionTotalCost<this.maxTradableAmount){

      // if (CurrentInstrument.instrument_type == "FUT") {
      if (true) {


        this.proposedBuyAmount = entryPrice * CurrentInstrument.lot_size;

        // console.log(
        //   "Proposed regularunt ",
        //   this.proposedBuyAmount,
        //   "for",
        //   CurrentInstrument.tradingsymbol
        // );

        // this.liveTradablebalance > 0 &&
        // if (CurrentInstrument.instrument_type == "FUT") {
        if (true) {


          // var audio = new Audio("/sounds/mixkit-sci-fi-confirmation-914.wav");
          //audio.play();
          let transaction_type;

          if (direction == "long") {
            transaction_type = "BUY";

            if (element.ohlc.high > CurrentInstrument.pricePoints.d1.high) {

              console.log('hi hit already hit for %s, so no trade todayhigh %s yday-high %s ',
              
              CurrentInstrument.tradingsymbol,element.ohlc.high,CurrentInstrument.pricePoints.d1.high)
        return false;
      }

          } else if (direction == "short") {
            transaction_type = "SELL";

            if (element.ohlc.low < CurrentInstrument.pricePoints.d1.low) {

console.log('low hit already hit for %s, so no trade ',CurrentInstrument.tradingsymbol)
return false;
}



          }
         

          let tradingsymbol = CurrentInstrument.tradingsymbol;

          let lot_size = CurrentInstrument.lot_size*1;
          //let lot_size=0;
          let order_type = "LIMIT";

          //  let price1=  element.depth.sell.sort((a,b)=>a.price-b.price)[0]
          //  let price2=  element.depth.sell.sort((a,b)=>b.price-a.price)[0]

          //  console.log('sell price 1',price1,'sell price 2',price2)

          let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
            .price;

          let priceSell1 = element.depth.sell.sort(
            (a, b) => a.price - b.price
          )[0].price;

          //  console.log(priceSell1,'priceSell1',priceSell2,'priceSell2');

          //  console.log()

          //  let Price=priceSell1;
          // let Price = CurrentInstrument.pricePoints.yesterday.high;
          let Price = entryPrice;

          let currentPrice = lot_size * Price;
          this.totalBuyOrderLivePlacedBySoftware =
            this.totalBuyOrderLivePlacedBySoftware + currentPrice;

          this.proposedBuyAmount = 0;
          //  let Price=priceSell1;
          let product = "NRML";

          let reverseOrder=false;
          let arr = this.buildOrderArray(
            tradingsymbol,
            transaction_type,

            lot_size,
            order_type,
            Price,
            product,reverseOrder
          );

          // console.log(arr);

          let orderArray = [arr];
          // return;
          let a = await this.placeOrder(orderArray);
          // console.log("place order result", a);

          this.counter = this.counter + 1;
        

          const timestamp = new Date().getTime();
          // var text= "firing of auto mode+ ENTER NOW TO TRADE false",this.counter,CurrentInstrument.enterNowToTrade,CurrentInstrument";
          let ob={text,timestamp};

          this.userMessages.push(ob);

          this.userMessages.push(
            "firing of auto mode+ ENTER NOW TO TRADE false",
            this.counter,
            CurrentInstrument.enterNowToTrade,
            CurrentInstrument
          );
        } else {

          const timestamp = new Date().getTime();
          var text= "Maximum tradable regularut Exceeded";
          let ob={text,timestamp};

          this.userMessages.push(ob);


          this.userMessages.push("Maximum tradable regularut Exceeded");
          console.log(
            "Maximum tradable regularut Exceeded",
            this.liveTradablebalance
          );
        }
      }
    },

    setcandleColour(inst, instrument_token) {
      if (inst.previousPrice < inst.last_price) {
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "candle",
          "green"
        );

        // console.log(`Pvs price of green ${inst.tradingsymbol} is ${inst.previousPrice} and last price is ${inst.last_price}`)
      } else {
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "candle",
          "red"
        );

        // console.log(`Pvs price of red ${inst.tradingsymbol} is ${inst.previousPrice} and last price is ${inst.last_price}`)
      }
    },

    procedureForOptionsShortCovering(
      CurrentInstrument,
      instrument_token,
      element,
      product,
      quantity
    ) {
      // console.log(arguments,
      // 'arguments for procedureForOptionsShortCovering')

      return false;
    },

    async placetargetAndStopLoss(
      CurrentInstrument,
      instrument_token,
      element,
      product,
      quantity,
      targetPointLong1,
      livePnl,
      fireTargetDefault = false,
      transaction_type = "SELL",
     reverseOrder=true
    ) {

      let targetPointLong=Number(targetPointLong1).toFixed(1);
      if (fireTargetDefault == false) {

        console.log({fireTargetDefault},'returnring')
        return false;
      }

      let PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

          if(PlacedReverseOrder==true){


            console.log('placed reverse order');

            return false;
          }


          let livePosLen=this.livePositions.filter(
          (lp) => lp.instrument_token == instrument_token
        ).length;
if(livePosLen==0){

  return false;
}




      // let targetPointLong= CurrentInstrument.pricePoints.d1.high;
      let misTarget = this.getMisPricePointofScript(
        instrument_token,
        targetPointLong
      );
      let trailingStopLoss = this.getTrailingStopLoss(
        instrument_token,
        livePnl
      );
      let sl = Math.max(
        CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),
        CurrentInstrument.pricePoints.d1.low,
        trailingStopLoss
      );


  


      if (fireTargetDefault) {
        let trade = `Target hit at  ${CurrentInstrument.tradingsymbol} at        ${misTarget}`;

        let trade1 = {
          type: "Target",

          tradingsymbol: CurrentInstrument.tradingsymbol,
          entry_price: CurrentInstrument.pricePoints.yesterday.high,
          target: misTarget,
          stoploss: Math.max(
            CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),
            CurrentInstrument.pricePoints.d1.low
          ),
        };

        let trade2 = JSON.stringify(trade1);

        this.writeTrades(trade2 + ",");
        this.sendToTelegramGroup(trade);
        this.userMessages.push(trade);
        ////target buys

        //                                 var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
        // //audio.play();

        let tradingsymbol = CurrentInstrument.tradingsymbol;

        // let lot_size = CurrentInstrument.lot_size;
        let lot_size = Math.abs(quantity);
        let order_type = "LIMIT";

        let priceBuy2;
        if (fireTargetDefault) {
          let p = CurrentInstrument.pricePoints.yesterday.high;
          // priceBuy2 = this.getMisPricePointofScript(instrument_token,p)
          priceBuy2 = targetPointLong;

         


          let testForHasLivetarget=await this.getOrders();

          let ln= this.liveOrders.filter(
            (i) => i.instrument_token == instrument_token
          ).length;

let  hasLiveTarget;
        
if(ln==0){
  hasLiveTarget =false;

  // return false

}else{
  hasLiveTarget =true

}
        

          if (hasLiveTarget == true || PlacedReverseOrder==true ) {

            // console.log({hasLiveTarget},'returnring')
            return false;
          }
        } else {
          // sel depending upon transaction currently no
          // priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          //   .price;
        }


    
if(this.livePositions.filter(
          (lp) => lp.instrument_token == instrument_token
).length!=0){

  let average_price = this.livePositions.filter(
          (lp) => lp.instrument_token == instrument_token
        )[0].average_price;
}
        

        if (true) {
          let Price = priceBuy2;
          

          let reverseOrder=true;

          let arr = this.buildOrderArray(
            tradingsymbol,
            transaction_type,

            lot_size,
            order_type,
            Price,
            product,
           reverseOrder
          );

         

          let orderArray = [];

          orderArray.push(arr);

          // console.log(trade, "firing target", "@",orderArray);

          let a = await this.placeOrder(orderArray);

          this.userMessages.push(trade);

          this.$set(
            this.instruments.filter(
              (i) => i.instrument_token == instrument_token
            )[0],
            "PlacedReverseOrderType",
            "Target"
          );
        }
      }    
      
      else if (
        CurrentInstrument.last_price <
        Math.max(
          CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),
          CurrentInstrument.pricePoints.d1.low,
          trailingStopLoss
        )
      ) {
        if (fireTargetDefault == true) {
          return false;
        }

        let trade = `Sl hit  ${CurrentInstrument.tradingsymbol} at 
      
      
      ${sl}`;

        // this.sendToTelegramGroup(trade);

        //target sells

        //    var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
        // //audio.play();

        let transaction_type = "SELL";

        let tradingsymbol = CurrentInstrument.tradingsymbol;

        let lot_size = CurrentInstrument.lot_size;
        // lot_size=0;
        let order_type = "LIMIT";

        let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          .price;

        //  let Price=Math.round(CurrentInstrument.SevenDayMaxMin.Max*.9,1);
        let Price = priceBuy2;

        // let product='NRML'

        let reverseOrder=true;

        let product="NRML"
        let arr = this.buildOrderArray(
          tradingsymbol,
          transaction_type,

          lot_size,
          order_type,
          Price,product,
         reverseOrder)

        // console.log("stop loss array below");
        // console.log(JSON.stringify(arr));

        let orderArray = [arr];

        let a = await this.placeOrder(orderArray);

        // this.orderArray.push(orderArray);

        // console.log(
        //   "order array inside tgtsl fn",
        //   JSON.stringify(this.orderArray)
        // );

        // console.log(trade, "firing stop loss", "@", Price);

        let trade1 = {
          type: "stoploss",

          tradingsymbol: CurrentInstrument.tradingsymbol,
          entry_price: CurrentInstrument.pricePoints.yesterday.high,
          target: CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
          stoploss: sl,
        };

        let trade2 = JSON.stringify(trade1);

        this.writeTrades(trade2 + ",");

        // console.log(trade, "firing stop loss");

      

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrderType",
          "Stop Loss"
        );
      } else {
        // console.warn(
        //   "No target or stop for",
        //   CurrentInstrument.tradingsymbol,
        //   "stop loss",
        //    sl,
        //   "Target",
        //  misTarget,
        //   "Last price",
        //   CurrentInstrument.last_price
        // );
        // this.userMessages.push('No target or stop for ',CurrentInstrument.tradingsymbol,'stop loss',CurrentInstrument.pricePoints.yesterday.high*.9 )
      }
    },

    otherCriteria(s, CurrentInstrument) {
      try {
        let element = s;

        if (element.last_price < 2) {
          let ob = {};
          ob.otherCriteriaCheck = false;
          ob.message = "last price less than 2";
          return ob;
        }

        let a = element.depth.buy.sort((a, b) => b.price - a.price)[0].price;

        let b = element.depth.sell.sort((a, b) => a.price - b.price)[0].price;

        let b1 = element.depth.sell.sort((a, b) => a.price - b.price)[1].price;

        let b1b = b1 - b;

        let b1bpc = (b1b / b) * 100;

        if (b1bpc > 50) {
          let ob = {};
          ob.otherCriteriaCheck = false;
          ob.message = "b1bpc greater than 50";
          return ob;
        }

        let c = Math.abs(b - a);

        let lpPc = (c / element.last_price) * 100;

        if (lpPc > 25 || !isFinite(lpPc)) {
          // console.log('buy sell offers large diff or infinity ',CurrentInstrument.tradingsymbol,lpPc)
          // console.log(b1bpc,'b1bpc')
          //  return false;
        }

        if (s.ohlc.open == s.ohlc.high) {
          // console.log('open and high are same not buying',CurrentInstrument.tradingsymbol)

          let ob = {};
          ob.otherCriteriaCheck = false;
          ob.message = "s.ohlc.open==s.ohlc.high";
          return ob;
          return false;
        }

        if (s.ohlc.open == s.ohlc.high && s.ohlc.close == s.ohlc.open) {
          let ob = {};
          ob.otherCriteriaCheck = false;
          ob.message = "s.ohlc.open==s.ohlc.high && s.ohlc.close==s.ohlc.open";
          return ob;
          // console.log('open and high are same not buying',CurrentInstrument.tradingsymbol)
          return false;
        }

        if (s.ohlc.low <= s.last_price && s.ohlc.high >= s.last_price) {
          //verifying whether last price is in todays tick range  if failed no buying
          // console.log(CurrentInstrument.tradingsymbol,'l2')
          // console.log('here4')
          // return false
        }

        if (s.ohlc.open > CurrentInstrument.pricePoints.yesterday.high) {
          let ob = {};
          ob.otherCriteriaCheck = false;
          ob.message = "s.ohlc.open > yesterday high";
          //  return ob;
          // return false;
        }

        if (s.ohlc.open < s.ohlc.close) {
          let ob = {};
          ob.otherCriteriaCheck = false;
          ob.message = "s.ohlc.open < s.ohlc.close";
          return ob;
          return false;
        }

        //       if(s.ohlc.open<CurrentInstrument.pricePoints.yesterday.low)
        //       {

        // //i donet know why i puth this
        // console.log('s.ohlc.open<CurrentInstrument.pricePoints.yesterday.low')

        //         return false;
        //       }

        try {
          if (
            CurrentInstrument.pricePoints.d1.range >
            CurrentInstrument.pricePoints.d2.range
          ) {
            // console.warn(CurrentInstrument.pricePoints.d1.range,
            // 'D1 range greater than',
            // CurrentInstrument.pricePoints.d2.range,' d2 range for :',
            // CurrentInstrument.tradingsymbol)

            let ob = {};
            ob.otherCriteriaCheck = false;
            ob.message = "d1 range> d2 range";
            return ob;

            return false;
          }
        } catch (e) {
          console.log(e);

          let ob = {};
          ob.result = false;
          ob.message = "unkonown error";
          return ob;

          return false;
        }

        //sma volume //price

        let ob = {};
        ob.otherCriteriaCheck = true;
        ob.message = "perfect ok";
        return ob;
      } catch (error) {
        let ob = {};
        ob.otherCriteriaCheck = false;
        ob.message = error;
        return ob;
      }
    },

    hasAlreadyHitTargetBefore(element, CurrentInstrument, instrument_token) {
      let ts = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].tradingsymbol;

      let targetPointLong = CurrentInstrument.pricePoints.d1.high;

      let misTarget = this.getMisPricePointofScript(
        instrument_token,
        targetPointLong
      );

      if (element.ohlc.high > misTarget) {
        return true;
      } else {
        return false;
      }
    },

    hasAlreadyHitStopLossBefore(element, CurrentInstrument, instrument_token) {
      let ts = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].tradingsymbol;

      //  let last_price = element.depth.buy.sort((a, b) => b.price - a.price)[0]
      //             .price;

      let targetPointLong = CurrentInstrument.pricePoints.d1.low;

      //  console.log('inside stop loss fn for  %s and stop low is %s and current price is %s '
      //  , CurrentInstrument.tradingsymbol,element.ohlc.low)

      if (element.ohlc.low <= targetPointLong) {
        return true;
      } else {
        return false;
      }
    },

  basicCheckers(element,CurrentInstrument,instrument_token,quantity,last_price ){
// console.log(typeof  CurrentInstrument,'typeof cur instrument')

    if(typeof CurrentInstrument=='undefined' ){
this.cl('issue inside bs @6683')
      return false;
    }
      let inst=CurrentInstrument;

      if (CurrentInstrument.previousPrice != 0) {
          this.setcandleColour(inst, instrument_token);
        }

      if (CurrentInstrument.previousPrice == 0) {

        // this.cl('issue inside bs pvs price 0 @6694')
          // console.log("inst pvs price 0 line 3843");
          return false;
        }

      // if (quantity == 0) {
      //       console.log("quantity is zero returning line 3964");
      //       return;
      //     }

      if (typeof element == "undefined") {
          console.log("element is not comming basic checkers 6705");
          return false;
        }

        if (typeof CurrentInstrument == "undefined") {
          console.log("CurrentInstrument=='undefined basic checkers 6710", instrument_token);

          return false;
        }

        if(this.getLatestPricePoints(instrument_token)==false){

          this.cl('latest price points issue @6717')

    return false;
             }


             this.setLiveScript(CurrentInstrument,last_price);

             return true;

    },


   
    stopLossTargetSwitch(quantity,last_price,high,low,bidPrice,offerPrice,CurrentInstrument,element,livePnlOffered){
   //stoplossswitch 

   //stopLossSwitch
  //  console.log('sl switch')
   
      // console.log({quantity,last_price,high,low,
    //   bidPrice,offerPrice,CurrentInstrument,element},'some isue')

    if(
      typeof high=='undefined' ||
      typeof low=='undefined' ||
      typeof last_price=='undefined'
      
      
      ){

        console.log('abnormality pls check',{high},{low},{last_price},CurrentInstrument.tradingsymbol)
      }
     
  

    // console.log('just near swithd @4538')

    let squareoffPrice1=(bidPrice+offerPrice)/2
    let squareoffPrice=squareoffPrice1.toFixed(1)

    // console.log({livePnlOffered},CurrentInstrument.tradingsymbol)

      switch (true) {

        case livePnlOffered<-2500:

// && false

         this.updateSquareOfforderWithDesiredPrice(
           CurrentInstrument,
           element,
           false,
           last_price
         );
      


break;





        //stoploss switch

  //       case (
  
  // last_price<=
  // Math.max(CurrentInstrument.pricePoints.d0.low,CurrentInstrument.pricePoints.d1.low
  
  
  // )):


  // break;



case (
  
last_price<=
Math.max(CurrentInstrument.pricePoints.d0.low,CurrentInstrument.pricePoints.d1.low


)):


console.log('sltrigger  trigger for  %s at squareoffPrice of %s',
CurrentInstrument.tradingsymbol,Math.max(CurrentInstrument.pricePoints.d0.low,CurrentInstrument.pricePoints.d1.low))
       

this.updateSquareOfforderWithDesiredPrice(
                   CurrentInstrument,
                   element,
                   false,
                   Math.max(CurrentInstrument.pricePoints.d0.low,CurrentInstrument.pricePoints.d1.low)
                 );
              

        break;








        case livePnlOffered>500 && false:

     


console.log('1000 trigger')
        this.updateSquareOfforderWithDesiredPrice(
                   CurrentInstrument,
                   element,
                   false,
                   last_price
                 );
              

        break;



        // testForHasLivetarget
        case (this.hours==15 && this.minutes>10 && false):


        console.log(
                   "Firing 15:10 square offf  order for %s bidprice is %s and high is %s ",
                   CurrentInstrument.tradingsymbol, bidPrice,
                   high
                 );

                 this.updateSquareOfforderWithDesiredPrice(
                   CurrentInstrument,
                   element,
                   false,
                   last_price
                 );
              

        break;
               

        case livePnlOffered<-2500:

        // && false

                 this.updateSquareOfforderWithDesiredPrice(
                   CurrentInstrument,
                   element,
                   false,
                   last_price
                 );
              


        break;


               case (quantity < 0 && last_price > high  && false):

              

               console.log(
                  "Firing shortcover stop loss order for %s bidprice is %s and high is %s  and last price is %s",
                  CurrentInstrument.tradingsymbol,
                  offerPrice,
                   high,last_price
                 );
                 
                 this.updateSquareOfforderWithDesiredPrice(
                   CurrentInstrument,
                   element,
                   false,
                   squareoffPrice
                 );

                 break;

               case quantity > 0 && last_price < low && false:

                 console.log(
                  "Firing long cover stop loss order for %s bidprice is %s and low  is %s  and last price is %s",
                  CurrentInstrument.tradingsymbol,
                  offerPrice,
                   low,last_price
                 );

                 //simple long covering
                //  this.updateSquareOfforderWithDesiredPrice(
                //    CurrentInstrument,
                //    element,
                //    false,
                //    offerPrice
                //  ); 
                 
                 this.updateSquareOfforderWithDesiredPrice(
                   CurrentInstrument,
                   element,
                   false,
                   squareoffPrice
                 );

                 break;

              
             }


    },

    proxyTradeExitProcedure(CurrentInstrument){
      if(this.proxyTrade==false){

        return 'PROXYTRADEFALSE'
      }
    

      if(typeof CurrentInstrument=='undefined'){

        console.log('proxy cur instruy undefined')
        return "typeof CurrentInstrument=='undefined'";
      }

    
          let ppx=this.proxyPositions.filter(pp=>{ 
            return  pp.squaredOff==false &&
pp.instrument.instrument_token==CurrentInstrument.instrument_token 
});

if(ppx.length==0){

console.log("pp1.length==0")
  return  "pp1.length==0"
}






switch(true){

  case (

CurrentInstrument.last_price>=CurrentInstrument.pricePoints.d1.rangeBreakOut


):


console.log('case target ',CurrentInstrument.tradingsymbol)
this.proxyPositions.filter(pp1=>{ 

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==CurrentInstrument.instrument_token 



})[0].exitPrice=CurrentInstrument.last_price;

this.proxyPositions.filter(pp1=>{ 

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==CurrentInstrument.instrument_token 



})[0].exitType='target'



this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==CurrentInstrument.instrument_token 



})[0].squaredOff=true

break;



case (

CurrentInstrument.last_price<=CurrentInstrument.pricePoints.d1.low


):


console.log('case sl ',CurrentInstrument.tradingsymbol)
this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==CurrentInstrument.instrument_token 



})[0].exitPrice=CurrentInstrument.last_price

this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==CurrentInstrument.instrument_token 



})[0].exitType='sl'



this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==CurrentInstrument.instrument_token 



})[0].squaredOff=true




break;


default:


// console.log('case default');

return 'default'

break;



}
return 'clean' ;




    


    },

    mutateWithLtp(s) {

     
       this.heartBeatAndCurrentCheckDigit()


       if (this.hasStartedGetOrders || this.hasStartedGetLivePositions || this.refreshingTradeStatus) {
    return false;
  }
     
      s.forEach(async (element) => {

        let last_price;

        this.setD0WithCurrentDayOhlc(element);


    //  console.log(element.instrument_token,element.last_price);

// if(element.instrument_token==260105){


// //  console.log(element)
// }
      // cl(element.find(i=>i.instrument_token=="260105").last_price);

let instrument_token = element.instrument_token;
let CurrentInstrument = this.instruments.find(i => i.instrument_token == instrument_token);

if (!CurrentInstrument) {
  console.log('cur instru type undefined frpn s so i am return nign false @7071', instrument_token);
  return false;
}
             
    

        last_price=element.last_price;

this.setPreviousPriceAndLastPrice(instrument_token,last_price);

let bs= this.basicCheckers(element,CurrentInstrument,instrument_token,last_price);

if(bs==false){

 // cl('basic cehckes issue',CurrentInstrument.tradingsymbol,instrument_token,)
 return false
}



        let hasCurrentPosition = this.livePositions.filter(
          (lp) => lp.instrument_token == CurrentInstrument.instrument_token
        ).length;

           
        let hasLivetargetFromCurrentInstrument=CurrentInstrument.hasLiveTarget;
   let hasLivePositionFromCurrentInstrument=CurrentInstrument.hasLivePosition;


// console.log({hasLivePositionFromCurrentInstrument},{hasLivetargetFromCurrentInstrument})
       

//  console.log({hasLivePositionFromCurrentInstrument},'hasLivePositionFromCurrentInstrument')
 
        if ( hasLivePositionFromCurrentInstrument==true) {
  
          let {product ,livePnl }=this.getProductAndLivePnl(CurrentInstrument)
           

                   


let ln1=this.livePositions.filter(
            (lp) => lp.instrument_token == CurrentInstrument.instrument_token
          ).length;


          if(ln1==0){


          //  console.log('live postition for script is zero')

           return false;
          }

          let {bidPrice,offerPrice,count,stopLoss, target, lstPrice,livePnlOffered,quantity 
           }= await  this.setTargetPricesBasedOnQuantity(CurrentInstrument,element,low,high,instrument_token)
         

        
         

           if(bidPrice==-1){
// console.log('some issue with setTargetPricesBasedOnQuantity PlacedReverseOrder seems true',CurrentInstrument.tradingsymbol);
 this.$router.go();
            return false
           }


           var { high, low, upperBreakOutTarget, lowerBreakOutTarget } = 
           this.getLatestPricePoints(instrument_token);

// console.log('count for %s is %s @4649',CurrentInstrument.tradingsymbol,count);

          let hasLiveTarget;
          if (count > 0) {
            hasLiveTarget = true;
          } else if (count==0) {
            hasLiveTarget = false;
          }

                        //there is a live position

          //check whether already a reverse order placed


         


let PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;




        
          // if (PlacedReverseOrder == true || hasLiveTarget == true) {
          if (hasLivePositionFromCurrentInstrument== true && 
           hasLivetargetFromCurrentInstrument == true) {
                    //  if (hasLiveTarget == true) {
                     if ( true) {

                      // console.log('has live tgt for trading symbol %s',CurrentInstrument.tradingsymbol,{PlacedReverseOrder},{hasLiveTarget})

                        ///modification of placed orders here            
              livePnl = livePnlOffered;


              this.stopLossTargetSwitch(quantity,last_price,high,
              low,bidPrice,
              offerPrice,CurrentInstrument,element,livePnlOffered)
             
            }

                       //return false;
          } else /// no live target or palced reverse order
          
          {
            //think about placing a reverse order 

            //check thoroughly 
            
            let lnLive=this.liveOrders.filter(lo=>lo.instrument_token==instrument_token).length
        //  console.log('talakalam onnum cheyyunilla no reverse order placed evide etthiyittum')


         if (lnLive==0) {

if((PlacedReverseOrder!=true  &&  hasLiveTarget != true)){

  this.cl('iam return ning false @7217')

  if(this.manualReverseOrderStart==true){



    // let out =await    this.placeTargetsForSingleScript(instrument_token,quantity)

  }
 return false;
}
         
        
          
          }

         
          }

       
        }


        // console.log(CurrentInstrument.enterNowToTrade,'CurrentInstrument.enterNowToTrade');

        if (CurrentInstrument.enterNowToTrade == false) {

 cl('inside trade entry ');
let inst=CurrentInstrument;
this.tradeEntry(instrument_token,inst,CurrentInstrument,element) 

// return ;
       
        }

     ///already palced order .... so check whte there is live position



        
      
      });
    },

    setInstrumentTokens() {

   

    
      return new Promise((res, rej) => {

          this.instrumentTokens = this.hourlyPricePointsofLiveDay.map((i) =>
          parseInt(i.instrument_token)
        );


        socket.emit("subscribe-orders", JSON.stringify(this.instrumentTokens));

        res(true);
           return;
   

        
      });
    },

    mutateOrdersWithLtp(s) {
      s.forEach((element) => {
        if (typeof element == "undefined") {
          console.log("element is not comming");
          return false;
        }
        let instrument_token = element.instrument_token;
        let last_price = element.last_price;
        let average_price = element.average_price;

        console.log(
          script.filter((e) => e.instrument_token == element.instrument_token)
        );
        // return;
        this.instruments.filter(
          (e) => e.instrument_token == instrument_token
        )[0].last_price = last_price;

        this.symbols
          .filter((o) => o.instr == instrument_token)
          .forEach((e) => {
            this.$set(e, "previous_last", e.last_price);
            this.$set(e, "last_price", last_price);

            if (e.previous_last < e.last_price) {
              this.$set(e, "candleColor", "green");
            } else if (e.previous_last > e.last_price) {
              this.$set(e, "candleColor", "red");
            } else if (e.previous_last == e.last_price) {
              this.$set(e, "candleColor", "grey");
            }

            this.$set(e, "live_gain", last_price);
            this.$set(e, "average_price", average_price);
          });
      });
    },
  },

  watch: {
    $route(to, from) { // react to route changes... 
      if(to !== from){ location.reload();
       } },

    livePositions(o, n) {},

    hourlyPricePointsofLiveDay(n, o) {
      if (o.length == 0 || n.length == 0) {
        // console.log("calling hourly candles");
        // if (this.livePositions.length > 0) {
        // this.getHourlyCandleLows();
        // }
      }
    },
  },

  data() {
    return {


      nifty:-1,

      banknifty:-1,
      convertIsoDateToISTResultChild:'',
      getReverseOrderAndHasLiveTargetStatusForChildResult:{},
      stopLossForChild:-1,
      liveInstrumentSymbols:[],
      proxyTotal:0,
      proxyPositions:[],
      proxyTrade:false,
      dialog:false,
      alerts:[],
      liveMargin:-1,
      showLongtradeShortTradeTable:false,
      showStrategiesTable:false,
      showStatusTable:false,
  hourlyPricePointsofLiveDay1:'',
       hourlyPricePointsofLiveDay:'',
      itype:'',
      setter:'',
     manualReverseOrder:false,
     manualReverseOrderStart:false,
      hasStartedGetLivePositions:false,
      hasStartedGetOrders:false,
      currentPriceUpdate:'x',
      previousPriceUpdate:'y',
      previousOrderUpdate:{},
      orderUpdateProcessing:false,
      times: [0, 16, 31, 46],
      refreshingTradeStatus: false,
      placingReverseOrderInProgress: false,
      refreshingStatus: false,

      holdingScripts: [],

      allOrders: [],
      executedOrders: [],
      totalForgoneForStopLoss: 0,
      totalForgoneFortarget: 0,
      totalForgone: 0,
      updatingInProgress: [],
      newOrder: [],
      loadingHourlyTradingLows: false,
      closedTradesScripts: [],
      tradingAlerts: [],
      liveScript: {},
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
    };
  },

  name: "Mining",
};
</script>



<style lang="scss" scoped>


input {
  border: 1px solid rgb(147, 206, 221);
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
//   color: rgb(109, 86, 86);

// }

// .green {
//   background: white;
//  color: rgb(94, 136, 94);

// }
</style>