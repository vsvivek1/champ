<template>
  <div>


<!-- {{ instrumentTokens }} instrumentTokens -->
<!-- <v-btn @click="getAllOrders()">get all orders</v-btn> -->

<!-- <h2>Executed Trades</h2> -->
    <!-- <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Buy Price</th>
          <th>Buy Time</th>
          <th>Sell Price</th>
          <th>Sell Time</th>
          <th>Profit/Loss</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(trade, index) in executedTrades" :key="index">
          <td>{{ trade.tradingsymbol }}</td>
          <td>{{ trade.buyPrice }}</td>
          <td>{{ trade.buyTime }}</td>
          <td>{{ trade.sellPrice }}</td>
          <td>{{ trade.sellTime }}</td>
          <td>{{ trade.profit }}</td>
        </tr>
      </tbody>
    </table> -->
    <!-- <vue-good-table :columns="columns" :rows="rows" :paginate="true" :lineNumbers="true" /> -->

    <!-- {{ currentTradingsymbolAverage}}currentTradingsymbolAverage= -->
    <!-- {{CurrentTick}} -->

    {{globalConsoleLogs.length}}globalConsoleLogs
    <!-- {{hourlyPricePointsofLiveDay.map(i=>i.instrument_token).length}}hourlyPricePointsofLiveDay length -->

  <!-- {{instrumentTokens}} -->
    <v-alert >Vikram

      <!-- <button @click="callFunction">Call Function</button> -->

      <ul>
      <li v-for="(instance,index) in instances" :key="index">{{ instance }}</li>
    </ul>
<!-- {{indices}}indices -->



<IndicesTable :indices="indices"></IndicesTable>





<label>
      <input type="checkbox" v-model="showLogs">
      Show logs
    </label>
<!-- <IronCondor :instruments="instruments"></IronCondor> -->

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

<v-icon>

</v-icon>


        <v-icon
          v-bind:class="{
            
            'text-danger':stopLossSwitchHealth,
            'text-white':!stopLossSwitchHealth,
        
        
        }"
          title="if This symbol changes color switches between red and blue system is conencted to market"
        >
        SLß
          mdi-circle
        </v-icon>


        <v-icon
          v-bind:class="{
            
            'text-primary':tradeEntrySwitchHealth,
            'text-white':!tradeEntrySwitchHealth,
        
        
        }"
          title="if This symbol changes color switches between red and blue system is conencted to market"
        >
        
        TE
          mdi-ci
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

import { tradingMixin } from './tadingMixin';
import VueGoodTable from "vue-good-table";
import "vue-good-table/dist/vue-good-table.css";


import store from '@/store';
 import LogWindow from './LogWindow.vue';
// let moment = require("moment");
import moment from 'moment';
 import { io } from "socket.io-client";
//import io  from "vue-socket.io"

import Margin from '@/components/Margin.vue'
import Messages from '@/components/Messages.vue'
import IronCondor from '@/components/IronCondor.vue'
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

  // this.cl(`connect_error due to ${err}`);
});


// const socket = new io({debug: true,
//             connection: 'http://127.0.0.1:9090'
//       });
    

// this.cl(socket,'start')

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
// import { timingSafeEqual } from 'crypto';



// appv3/public/instruments/instrumentsForMining.json









var hourlyPricePointsofLiveDay1 ;




// var hourlyPricePointsofLiveDay1 =
//        ("../../../instruments/hourlyCandleDataCommodity.json");

var cl;

import newFutureMiningMixin from './newFutureMiningMixin';

export default {
  
mounted(){
  const urlForMiningInstruments="../../../instruments/instrumentsForMining.json"
  fetch(urlForMiningInstruments).then(r=>r.json()).then(d=>
  {

    this.instruments=d;

    this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));

    socket.emit("subscribe-orders", JSON.stringify(this.instrumentTokens));

  }
 
  
  
  )

  var urlForHourlyCandles="../../../instruments/hourlyCandleData.json";

  fetch(urlForHourlyCandles)
  .then(response => response.json()) // Convert the response to a JSON object
  .then(data => {
    // Store the JSON data in a variable
     hourlyPricePointsofLiveDay1 = data;

    // Do something with the jsonData variable
    // console.log(instruments);
  })
  .catch(error => console.error(error));
       // this.cl('mounted')
       var cl=this.cl;
        
        
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
     
     
     
     
     
     
     
     
         var d = new Date();
         this.hours = d.getHours();
         this.minutes = d.getMinutes();
         this.seconds = d.getSeconds();
     
     
         (async()=>{
     
           await this.refreshTradeStatus();
     
           this. placeTargetsForLiveScripts()
     
         })()
     
     
     
         let fifteenSeconds = 15* 1000;
         let fifteenSecondsTimer = setInterval(() => {
     
     
           this.globalConsoleLogs=[];
           //this.$router.go();
         }, fifteenSeconds);
     
     
       
     
         let TenMinutes = 10 * 60 * 1000;
         let FiveMinutesTimer = setInterval(() => {
     
     
           this.globalConsoleLogs=[];
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
     
           this.cl(order_ids, "live orderss to be canceled");
     
           if (order_ids.length > 0) {
             // this.CancelOrders(order_ids);
           }
         }, thirtyMinute);
     
         let fifteenSecTimer = setInterval(async () => {
     
           let a = await this.refreshTradeStatus();
          
         }, 60 * 1000);
     
         let placingTimer = window.setInterval(async () => {
     
        
           
          
     
           let ln = this.orderArray.length;
     
           // this.cl('order array length1',ln,JSON.stringify(this.orderArray))
     
           // this.cl('this.orderArray.',this.orderArray)
     
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
                
     
                if (this.hours<16 & times.includes(this.minutes) && (this.seconds>56 && this.seconds<58)
                 
                 ){
     
                 ///procedureTocancelEntryOrdersIfAny
     
                 // this.$router.go()
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
     
         //  this.cl(this.instrumentTokens,111);
     
       
     // (async ()=>{
     
     
     //   // let instrumentsForMining1 =await this.requireJson("../../../instruments/" + this.setter)//.then(r=>r.json())
     //   let instrumentsForMining1 =await this.requireJson("../../../instruments/instrumentsForMining.json")//.then(r=>r.json())
     
     
     //   let instrumentsForMining = instrumentsForMining1
     //   .filter(
     //     (i) =>  true
         
     //   )
     //   .filter((item, index, arr) => arr.indexOf(item) === index);
     
     
     //   this.instruments=[...instrumentsForMining];
     //     this.instrumentTokens=this.instruments.map(i=>parseInt(i.instrument_token));
     
     
     
     // })()
         
     
       
     
         socket.on("send-realtime-subscription", (s) => {
     
     
           // this.cl('inside send-realtime-subscription');
           this.mutateWithLtp(s);
     
           this.CurrentTick = [...s];
         });
     
         socket.on("order_update", async (orderUpdates) => {
     
           let temp1,tmp2
           if(orderUpdates.status=="UPDATE" || orderUpdates.pending_quantity!==0 ){
     
     
             let temp1=JSON.stringify(orderUpdates);
         let tmp2=JSON.stringify(this.previousOrderUpdate);
     
         if(temp1==tmp2){
     
           // this.cl('same order update');
           this.previousOrderUpdate=orderUpdates;
           return false
         }
         this.previousOrderUpdate=orderUpdates
     
     
       let k=await  this.procedureTocancelEntryOrdersIfAny();
       cansole.log('cancelling orders',a)
             let a  = await this.refreshTradeStatus();
     
     this.cl('update order uodate',orderUpdates,{a});
     
     
     
     return false
           }
           
      temp1=JSON.stringify(orderUpdates);
          tmp2=JSON.stringify(this.previousOrderUpdate);
     
         if(temp1==tmp2){
     
           // this.cl('same order update');
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
     //           this.cl("update in progress");
     
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



  mixins: [newFutureMiningMixin,sessionMixin,tradingMixin],




 

  computed: {

    rows() {
      return this.executedTrades.map((trade) => {
        return {
          tradingsymbol: trade.tradingsymbol,
          buyPrice: trade.buyPrice,
          buyTime: trade.buyTime,
          sellPrice: trade.sellPrice,
          sellTime: trade.sellTime,
          profit: trade.profit,
        };
      });
    },

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
          // this.cl('e',e)

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


  components: { ClosedTrades, LiveTickView, LiveOrders,Margin,LivePos,IndicesTable,Messages,IronCondor , VueGoodTable, },
  methods: {

storeTradeDataInLocalStrorage(newTradingObj){
  let today = new Date().toISOString().slice(0, 10);

// Retrieve existing trading data from local storage
let tradingData = JSON.parse(localStorage.getItem('currentDay')) || [];
tradingData.push(newTradingObj);
let updatedDataString = JSON.stringify(tradingData);

// Save the updated trading data to local storage with the key 'currentDay'
localStorage.setItem(today, updatedDataString);

},


    evaluateConditions(element, entry, cis, ts) {
  let errorMessage = "";
  // if (element.ohlc.high >= entry) {
  //   errorMessage += "element.ohlc.high < entry is false. ";
  // }
  if (element.ohlc.open >= entry) {
    errorMessage += "element.ohlc.open < entry is false. ";
  }
  if (element.last_price < entry) {
    errorMessage += "element.last_price >= entry is false. ";
  }
  if (cis.previousPrice === 0) {
    errorMessage += "cis.previousPrice != 0 is false. ";
  }
  if (errorMessage === "") {
    errorMessage = "All conditions are true";
  }
  return errorMessage+' for '+ ts ;
},
    retrieveTradeDetailsInLocalStorage(tradingSymbol) {

try {
	
	      const today = new Date().toISOString().slice(0, 10)
	      const objectInStorage = localStorage.getItem(tradingSymbol)



	      if (objectInStorage && objectInStorage[today]) {
	        const parsedObject = JSON.parse(objectInStorage)
	
	        return parsedObject[today];
	     
	      
	      
	      } else {
	       return false
	      }
} catch (error) {
	
console.log(error,'storage retrival error in 1332')
  return false;
}
    
    
    
    },

    saveTradeDetailsInLocalStorage(tradingsymbol,entry,target,stopLoss,strategyName) {
      const today = new Date().toISOString().slice(0, 10)
      const objectToStore =
      
   {    [today]:
    
    {
        entry: entry,
        stopLoss: stopLoss,
        target: target,
        strategyName:strategyName
      }}
      let storedObjects = JSON.parse(localStorage.getItem(tradingsymbol)) || {}
      if (storedObjects[today]) {
        // alert(`Object for ${this.tradingSymbol} with date ${today} already exists.`)
        return
      }
      storedObjects[today] = objectToStore
      localStorage.setItem(tradingsymbol, JSON.stringify(storedObjects))

    },



    getAverageClosingValue(cis){
      let {d1,d2,d3,d4,d5,d6,d7}=cis.pricePoints;
      let mac=
d1.close+
d2.close+
d3.close+
d4.close

// +
// d5.close+
// d6.close+
// d7.close


let mal=
d1.low+
d2.low+
d3.low+
d4.low
// +
// d5.low+
// d6.low+
// d7.low

let entry1=mac/4;
let entry=entry1.toFixed(1)

let target1=entry*1.2;
let target=target1.toFixed(1)
let stopLoss1=mal/4;
let stopLoss=stopLoss1.toFixed(1)

return {entry,target,stopLoss};

    },

    callFunction() {
      const funcString = this.cl.toString(); // replace yourFunction with your function name
      const parameterNames = funcString.match(/function\s.*?\(([^)]*)\)/)[1].split(',').map((param) => param.trim());
      const instance = {};
      parameterNames.forEach((param) => {
        instance[param] = null; // initialize the instance with null values for each parameter
      });
      this.instances.push(instance);
    },

    cl(...args) {

      // console.log(childFunction.caller.name,'console.log(childFunction.caller.name)');
//       if(!this.showLogs){

// return false;

//       }

      const result = args
    .map((arg) => {
      if (typeof arg === "object") {
        return JSON.stringify(arg);
      } else if (arg !== null && arg !== undefined) {
        return arg.toString();
      } else {
        return "";
      }
    })
    .join(" ");

      if (this.globalConsoleLogs.includes(result)) {
        return true;
      } else {

      console.log(result)
        this.globalConsoleLogs.push(result);
        return false;
      }
    },


setD0WithCurrentDayOhlc(element){

if(!element){
this.cl('no lelemtn')
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
// this.cl(element.instrument_token)



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

this.cl('hi')
      let a=[...this.instruments];

      
let obFull={};
  let t=   setInterval(async ()=>{

        let ln=a.length;
        // this.cl(ln,'ln')
if(ln>0){
 let a500=a.slice(0,499).map(a=>a.instrument_token);
let q= await this.getQuoteFromZerodha(a500)
a.splice(0,499);



 obFull = Object.assign(obFull, q);

}else{
// this.cl(Object.keys(obFull).length,'objfull')
   a=[...this.instruments];


   Object.keys(obFull).forEach(e=>{

let q=obFull[e];

this.instruments.filter(i=>i.instrument_token==e)[0].pricePoints.d0.high=q.ohlc.high
this.instruments.filter( i=>i.instrument_token==e)[0].pricePoints.d0.low=q.ohlc.low


this.$set(this.instruments.filter(i=>i.instrument_token==e)[0],
'quote',q
)
// this.cl(q.ohlc.high,q.ohlc.low)


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

    orderCompleteProcedure(livePositions,liveOrders,cis,instrument_token,orderUpdates){


      let hasLivePosition=this.livePositions.filter(i=>i.instrument_token==instrument_token).
length>0;

let hasLiveOrder=this.liveOrders.filter(
        (lo) => lo.instrument_token == instrument_token
).length>0;

// this.cl({instrument_token},'from order omplete procedute')


// this.cl(this.instruments.filter(
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

  this.proceedForReverseOrderPlacement(cis,instrument_token,orderUpdates);


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

// this.cl(url)
axios.post(url,ob).then(res=>{


  //  this.cl(res.data,'res.data margin')
  this.liveMargin=res.data

  // this.cl(res.data.margins.equity.available.live_balance)

  // this.cl(this.liveMargin,'this.liveMargincd a')
// this. margins=res.data;

// this.marginLoaded=true;

// this.$emit('margin-updated',this.margins)

})

},

    marginUpdated(e){
      // margins.equity.available.live_balance

      // this.cl(e,'e margin')

      // this.liveMargin=e.margins.equity.available.live_balance
// alert(e);
    },

 async    forceUpdateMissingScripts(){

  let instru_arr=[];

      // let loCopy=[...this.liveOrders];

      this.cl('from force update')

      if(typeof this.livePositions=='undefined'){
this.cl(this.livePositions,'before');

let t=await this.getPositions()
this.cl(this.livePositions,'after');

        // return false
      }

      if(typeof this.livePositions=='undefined'){

        this.cl('still undefined')
return false
      }
      let loCopy=[...this.livePositions];


      this.cl(loCopy.length,'ln')

let i1=setInterval(async ()=>{

  this.cl(loCopy.length,'ln inside')
let cur=loCopy.pop();

console.log(cur,'cur')
if(typeof cur=='undefined'){

  this.cl('updating lo missing script')
let k=await this.updateMissingScriptInInstrumetsFile(JSON.stringify(instru_arr))
this.cl(k,'k')


this.cl('clearing live order missing script pupp after pushing')
clearInterval(i1)

return;
}


if(cur.instrument_token && this.instruments.filter(i=>i.instrument_token==cur.instrument_token).length==0){

  instru_arr.push(cur.instrument_token);
 


///  push new current instruments here

}
else{

  this.cl('not updating for t'),cur.tradingsymbol

}



    },400);

    },


    async setTradingType(){

  

      if(!instruments || !hourlyPricePointsofLiveDay1){

        return false;
      }



 
    
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
          
        
          this.hourlyPricePointsofLiveDay1[o].instrument.tradingsymbol.includes( "FEB" )
        ) {
          // this.cl(this.hourlyPricePointsofLiveDay1[o].instrument.instrument_type,'inst type')

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

  const urlForMiningInstruments="../../../instruments/instrumentsForMining.json"
var instruments=await requireJson(urlForMiningInstruments);

console.log(instruments,'inst')

// await fetch(urlForMiningInstruments)
//   .then(response => response.json()) // Convert the response to a JSON object
//   .then(data => {
//     // Store the JSON data in a variable

  
//     instruments = data;

//     // Do something with the jsonData variable
//     // console.log(instruments);
//   })
//   .catch(error => console.error(error));

// let instrumentsForMining1 =instruments;


  let instrumentsForMining = instruments
  .filter(
    (i) =>  true
    
  )
  .filter((item, index, arr) => arr.indexOf(item) === index);



  this.hourlyPricePointsofLiveDay1 =hourlyPricePointsofLiveDay1;

      // this.cl('this.hourlyPricePointsofLiveDay23',this.hourlyPricePointsofLiveDay)
  
  
  
  
      let hourlyPricePointsofLiveDay = Object.
      values(this.hourlyPricePointsofLiveDay1).
      
       filter((i) => i != -1);


      
      this.hourlyPricePointsofLiveDay=[...hourlyPricePointsofLiveDay]

      // this.cl(this.hourlyPricePointsofLiveDay)
    



this.instruments =instrumentsForMining;
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
          this.cl(this.hourlyPricePointsofLiveDay1[o].instrument.instrument_type,'inst type')

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
    getLatestPricePoints(instrument_token1) {      
      try {


     let   instrument_token=instrument_token1 ?? -1
        // console.log(typeof instrument_token);
	
	if(instrument_token ==-1){


    this.cl('empty instrument token',instrument_token)
    return false;
  }


  let cis1=this.instruments.find(i=>i.instrument_token==instrument_token);
let CurrentPricesOfScript=this.CurrentTick.find(i=>i.instrument_token==instrument_token);


if(!CurrentPricesOfScript){

  let d1=cis1.pricePoints.d1;

  let b={};

b.todaysHigh=d1.high
	b.todaysLow=d1.high
	b.yesterdayHigh=d1.high
	b.yesterdayLow=d1.low
	b.prices=[]
  b.dateIST='';//this.convertIsoDateToIST(last_trade_time);

}




if(!cis1 || !CurrentPricesOfScript ){
// if(!cis1 ){

  return false;
}


let {pricePoints}=cis1;
let {d1,d2,d3,d4,d5,d6,d7}=pricePoints;


let {hourlyPricePoints}=cis1;



const {
  tradable,
  mode,

  last_price,
  last_traded_quantity,
  average_traded_price,
  volume_traded,
  total_buy_quantity,
  total_sell_quantity,
  ohlc: { open, high, low, close },
  change,
  last_trade_time,
  exchange_timestamp,
  oi,
  oi_day_high,
  oi_day_low,

} =CurrentPricesOfScript;

// console.log(open, high, low, close,'ohlc');


let a={};

a.todaysHigh=CurrentPricesOfScript.ohlc.high
	a.todaysLow=CurrentPricesOfScript.ohlc.low
	a.yesterdayHigh=d1.high
	a.yesterdayLow=d1.low
	a.prices=hourlyPricePoints;
  a.dateIST=this.convertIsoDateToIST(last_trade_time);


	          return a;

     

	    
	    
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
console.log('get latestpricepoints errr @2294',error);
  this.cl(error,'@2128')
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
        this.cl("no prices hourly point set for %s", instrument_token);
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
      cis,
      element,
      squaringOff,
      p = 0
    ) {
      // this.SelectedSellorder=

      // this.cl('firing squqring of ',cis.tradingsymbol)

      /// check the current order price

      // if (cis.instrument_type != "FUT") {
      //   return;

      //   //comented
      // }

      let instrument_token = cis.instrument_token;

      ///was normally false but activating now for a while
      if (squaringOff) {
        let test = this.updatingInProgress.some(
          (u) => u == instrument_token
        );

        if (test) {
          // this.cl(cis.tradingsymbol,'alrady script updated upated');
          return false;
        }

        this.updatingInProgress.push(instrument_token);
      }

      // o.transaction_type == "SELL" &&
      let CurrentOrderObj = this.orders.filter(
        (o) => o.instrument_token == instrument_token
      );

      if (CurrentOrderObj.length == 0) {
        this.cl(
          " curentorder not presnt for %s",
          cis.tradingsymbol
        );
        return false;
      }

      let price;
      if (p == 0) {
        let targetPointLong = cis.pricePoints.d1.low;

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

      // this.cl('avg',avg,'low',cis.pricePoints.d1.low,'mispricePoints',this.getMisPricePointofScript(instrument_token, targetPointLong))
      // let price=cis.pricePoints.d1.low;  // changed with some other logic

      // let price=this.getMisPricePointofScript(instrument_token, targetPointLong)  // not working this logic

      if (CurrentOrderObj[0].price == price) {
        //  this.cl('new order already plaed')

        return false;
      }
 

      // this.cl( CurrentOrderObj,' CurrentOrderObj')

      

      // if(this.previousPriceUpdate==this.currentPriceUpdate){

      //    this.cl('switch price order already updated')
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

        o.tradingsymbol=cis.tradingsymbol
        let params = {};
        // let qry=i.exchange+":"+i.tradingsymbol;
        // let newPrice=i.ltp;
        // params.price=i.last_price;
        params.price = price;
        // params.order_type=i.last_price;
        params.trigger_price = price;
        o.params = params;

        // this.cl('o',o)
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

        o.tradingsymbol=cis.tradingsymbol
        let params = {};
        // let qry=i.exchange+":"+i.tradingsymbol;
        // let newPrice=i.ltp;
        // params.price=i.last_price;
        params.price = price;
        // params.order_type=i.last_price;
        params.trigger_price = price;
        o.params = params;

        // this.cl('o',o)
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

  async   updateSelectedSellorderWithLtp(){

      

    console.log('from this fumnction');
      await this.getOrders();
      await this.getPositions();
// this.SelectedSellorder=
// this.newOrder=
// o.selected==true &&

// console.log(this.liveOrders.length);
console.log(this.allOrders,'allorders');

this.newOrder =
this.liveOrders.filter(o=> o.transaction_type=="SELL").map(i=>{

// console.log(i,'i')
let lp =this.livePositions.find(j=>j.instrument_token==i.instrument_token)

// console.log(lp,'lp')

if(lp){

let {buy_price,buy_quantity,pnl}=lp;

if(true){

let o={};
    // o.variety=i.variety;
    o.variety='regular';
    o.order_id=i.order_id;
    let params={};
      params.price=lp.last_price-.15;

params.trigger_price=lp.last_price-15;
params.order_type="SL"
    o.params=params;
    // this.cl('o',o)
    return o;
}
 
}


}).filter(k=>k!=null);

this.cl(this.newOrder,'as2');

// this.updateOrder();

// let t = await this.getOrders();
//       let tmp = this.updatingInProgress;

// this.cl(a,'as');


// this.updateOrder();

// .map(o=>{});

          },



    updateOrder() {
      let ordersString = JSON.stringify(this.newOrder);
      // this.cl('ordersString for stop loss',ordersString)

      let params = {};
      params.accessToken = this.accessToken;
      params.ordersString = ordersString;
      let url = "/api/modifyOrders";

      axios.post(url, params).then((res) => {


      //  console.l
      
      // this.cl('orders modify reply',res.data)

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

      // this.cl(ob.symbols, "ob.symbols");
      ob.accessToken = this.accessToken;

      axios.post(url, ob).then((r) => {
        r.data.forEach((e) => {
          // this.cl(e, "e");
          this.$set(
            this.closedTradesScripts.filter(
              (e1) => e1.instrument_token == e.instrument_token
            )[0],
            "postTradePrice",
            e.last_price
          );

          this.totalForgone = this.closedTradesScripts.reduce(
            (pvs, closedTradesScript) => {
              // this.cl(closedTradesScript,'closedTradesScript');
              return (
                pvs +
                (closedTradesScript.postTradePrice -
                  closedTradesScript.sell_price) *
                  closedTradesScript.sell_quantity
              );
              // this.cl(pvs,'pvs')
            },
            0
          );

          this.totalForgoneForStopLoss = this.closedTradesScripts.reduce(
            (pvs, closedTradesScript) => {
              // this.cl(closedTradesScript,'closedTradesScript');

              if (closedTradesScript.pnl < 0) {
                // this.cl(closedTradesScript.pnl,'closedTradesScript.pnl totalForgoneForStopLoss')
                return (
                  pvs +
                  (closedTradesScript.postTradePrice -
                    closedTradesScript.sell_price) *
                    closedTradesScript.sell_quantity
                );
              } else {
                return pvs;
              }
              // this.cl(pvs,'pvs')
            },
            0
          );

          // .tofixed(1)

          this.totalForgoneFortarget = this.closedTradesScripts.reduce(
            (pvs, closedTradesScript) => {
              // this.cl(closedTradesScript,'closedTradesScript');

              if (closedTradesScript.pnl > 0) {
                // this.cl(closedTradesScript.pnl,'closedTradesScript.pnl totalForgoneFortarget')

                return (
                  pvs +
                  (closedTradesScript.postTradePrice -
                    closedTradesScript.sell_price) *
                    closedTradesScript.sell_quantity
                );
              } else {
                return pvs;
              }
              // this.cl(pvs,'pvs')
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

 
     return  axios.post(url, ob).then((r) => {

      return r.data
        this.cl(r.data, "r.data");
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

// console.log(instrument_token,'from update script')

      let params = {
        accessToken: this.accessToken,
        instrument_token: instrument_token,
      };

      // return; //some issue in fetching letc 

      let url = "/api/updateMissingScriptInInstrumetsFile";



     return  axios.post(url, params).then(async (r) => {

      
       let instruments = await fetch("../../../instruments/instrumentsForMining.json").then(r=>r.json());


       console.log(instruments,'from here')
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

        // this.cl(this.instrumentTokens,'this.instrumentTokens @2621')

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

      //  this.cl(hourlyPricePointsofLiveDay.filter(
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

              // this.cl(prices,'prices')
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

        // this.cl(this.hourlyPricePointsofLiveDay,'this.hourlyPricePointsofLiveDay')

        return;
      });
    },


    getStopLossFromChild(val){


let a=this.getStopLoss(val);

this.stopLossForChild=a;
      
    },


    getStopLoss(instrument_token) {
      try {
        let cis = this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0];

        return cis.pricePoints.d1.low - 0.05 * 3;
        return Math.max(
          cis.pricePoints.pivotPointObject.bc.toFixed(1),
          cis.pricePoints.d1.low
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

        //this.cl(instrument_tocken)
        //this.cl(this.instruments.filter(i=>i.instrument_token==instrument_tocken),'this.instruments.filter(i=>i.instrument_token==instrument_tocken)')
        // this.cl(this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0],
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
                  // this.cl(reference,'reference')
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
          this.cl(
            e,
            "mis target error for ",
            tradingsymbol,
            instrument_tocken
          );

          return 1000;
        } else {
          this.cl(e, "mis target error for ", instrument_tocken);

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
      obj.accessToken=this.accessToken;

      return await axios.post(url, obj).then((r) => {
        return r.data;

        // return 1;
      });
    },

    async review() {
      // let livePositionsTmp = await this.getPositions();

      let a1= await this.refreshTradeStatus()

      // this.cl()

      // let pnl=0

      this.livePositionScripts = livePositionsTmp.net.map((i) => {
        i.name;
      });

      let itrator = livePositionsTmp.net.slice(1, 200);

      let livePositionsInstrumentTokens = instrumentsForMining

        .map((m) => "this.itype:" + m.tradingsymbol)
        .slice(1, 200);

      let url = "/api/getQuoteFromZerodha";

      // this.cl(livePositionsInstrumentTokens)

      let obj = {};
      obj.accessToken = this.accessToken;

      let quoteData = [];
      obj.arryOfInstruments = livePositionsInstrumentTokens;

      let a = await axios.post(url, obj).then((r) => {
        quoteData = r.data;

        return 1;
      });

      // this.cl(quoteData,'quoteData',a)
      let counter = 0;

      Object.keys(quoteData).forEach((lp1) => {
        let lp = quoteData[lp1];
        this.cl(lp, "lp");

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
          this.cl("profit");
          let tmp = 0;
          tmp = (lp.last_price - tgt) * lp.buy_quantity;

          // this.cl("tmp", tmp, obj.tradingsymbol);

          this.pnl = this.pnl + tmp;
        } else if (lp.last_price < sl) {
          this.cl("stop loss");
          let tmp = 0;
          tmp = (lp.last_price - sl) * lp.buy_quantity;

          this.cl("tmp", tmp, lp.tradingsymbol);

          this.pnl = this.pnl + tmp;
        } else {
          this.cl("neither");

          let tmp = 0;
          tmp = (lp.last_price - entry) * lp.buy_quantity;

          this.cl("tmp", tmp, lp.tradingsymbol);

          this.pnl = this.pnl + tmp;
        }

        // this.cl(lp)
      });

      this.cl("total this.pnl", this.pnl, counter);
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

          // this.cl(pp1, "pricePoints");

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
            this.cl("placed reverse order");
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
      // this.cl(orderArray,'orderArray')

      let orderArray1 = orderArray;
      let a = await this.placeOrder(orderArray1);

      // this.cl("orderArray1", JSON.stringify(orderArray));

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
            // this.cl('from bot ',r.data.result[0])
          })
          .catch((e) => e);
        // this.cl('from bot ',r.data.result[0].channel_post.chat.id)
      }
    },

    resetUserMessages() {
      this.userMessages = ["no msg"];
    },
    triggerWebsocktsInServer() {
      let url = "/api/triggerWebsocktsInServer/accessToken/" + this.accessToken;

      axios.get(url).then((r) => {
        this.cl("triggered");
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
      // this.cl(arr);

      let orderArray = [arr];

      let a = await this.placeOrder(orderArray);
      this.cl("place order result", a);
      let {livePositions,liveOrders} =  this.refreshTradeStatus();
    },


    async getAllOrders(){

      this.hasStartedGetOrders=true;
      let obj = {};
      obj.accessToken = this.accessToken;
      let url = "/api/getOrdersPost";

      let res=await axios.post(url, obj).then(r=>r.data);

      let exeOrders=res.filter(o1=>o1.status=="COMPLETE");


    let buyExeOrders=exeOrders.filter(r2=>r2.transaction_type=="BUY");
    let sellExeOrders=exeOrders.filter(r2=>r2.transaction_type=="SELL");

let completeArray=sellExeOrders.map(se=>{

let {instrument_token,price,tradingsymbol,quantity,exchange_update_timestamp

}=se;


let ob={}

ob.buyTime=exchange_update_timestamp;

ob.buyPrice=se.price;
let buyPrice=se.price;

ob.tradingsymbol=se.tradingsymbol



let seo1=sellExeOrders.find(seo=>seo.instrument_token==instrument_token);


if(seo1){
 ob.sellPrice=seo1.price;
ob.sellTime=seo1.exchange_update_timestamp;

ob.profit=(ob.sellPrice-ob.buyPrice)*quantity

return ob
}






})

    this.executedTrades=completeArray;
      // console.log(completeArray,'completeArray');


      this.hasStartedGetOrders=false;
return false



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

     

        if (res.data.status == "error") {
          this.liveOrders = [0];
        }

        if (typeof res.data == "undefined") {
          this.liveOrders = [0];
          return new Promise((res, rej) => res([]));
        }

        if (typeof res.data.error_type == "string") {
          this.liveOrders = [0];

          this.cl(res.data.error_type, "@line 1283");

          // this.$router.go()
          return false;
        }
        
        this.executedOrders = res.data.filter(
          (r) => r.quantity==0
        );
       
       
        this.allOrders = res.data;


        let t = res.data.filter((o) => {
          // this.cl(o.status,'o.status');
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
this.cl('clearing live order missing script pupp')
clearInterval(i1);
return ;
}


if(typeof this.instruments.filter(i=>i.instrument_token==cur.instrument_token).length==0){
this.cl('updating lo missing script')

let tmp=JSON.stringify(e.instrument_token)
let k=await this.updateMissingScriptInInstrumetsFile(tmp)

///  push new current instruments here
}


        },5*1000);
  
}

      
       
       
        this.liveOrders.forEach(e=>{

if(this.instruments.some(i=>i.instrument_token==e.instrument_token)){

  this.instruments.find(i=>i.instrument_token==e.instrument_token).PlacedReverseOrder=false

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
        //this.cl('orders',t)

        this.hasStartedGetOrders=false;
        return this.liveOrders;
      
      
      });







    },

    changeBuyingMethod(i) {},

    getProductAndLivePnl(cis){
      let product,livePnl

if(this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
          ).length==0){

 return  { product,livePnl};


}

       product = this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
          )[0].product;

           livePnl = this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
          )[0].pnl;
          

          return {product,livePnl}

    },

    heartBeatAndCurrentCheckDigit(){
      this.CurrentCheckDigit++;
      this.heartBeat = !this.heartBeat;

    },

    checkNiftyStatus(index){


        //  this.cl({index},'index') 

let pp= this.indices.find(i=>i.tradingsymbol==index)

// return pp.pricePoints.d0;
// this.cl(pp.last_price);
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

        // this.cl(res,'from nifty status')

        this.$set(pp,'indexStatus',res)
return res

}else{



{
  
  // this.cl(res,'from nifty status');


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
// this.cl(ob);
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
// this.cl(ob);
return false;
}
}
},

calculateMarketVolatility(cis) {
  

  let element= cis.pricePoints

  if(
    
 ! (element.d0 &&
  element.d1 &&
  element.d2 &&
  element.d3 &&
  element.d4 &&
  element.d5 )
  
  
  ){

    this.cl('do points of cu instrument is invalid')
    return false
  }
  let d0 = element.d0;
  let d1 = element.d1;
  let d2 = element.d2;
  let d3 = element.d3;
  let d4 = element.d4;
  let d5 = element.d5;

  let previousDayRanges = [d1.range, d2.range, d3.range, d4.range, d5.range];
  let averageRange = previousDayRanges.reduce((a, b) => a + b) / previousDayRanges.length;

  let currentRange = d0.high - d0.low;

  let volatility = (currentRange > averageRange) ? true : false;

  return volatility;
},

 isMarketBullish(data) {
  if (data.total_buy_quantity > data.total_sell_quantity) {
        return true;
      } else {
        return false;
      }
 },

 estimateMarketTrend(element) {
  const { last_price, ohlc } = element;
  const { close } = ohlc;
  
  if (last_price > close) {
    return true;
  } else {
    return false;
  }
},
filterScripts(element){


  let res=false;
if(element && element.ohlc && element.ohlc.high && element.ohlc.open){

  if(element.ohlc.high == element.ohlc.open){

// this.cl('filtered out due to high ==open ',);
    res=false;
  }else{

    res=true;
  }

  // this.cl(res)
  // this.cl('not bcos this means filter true');
  return res;
}else{

  this.cl('not bcos this');
  return false;
}

},
checkCandlePattern(d0, d1) {
  let pattern = "";
  
  if (d0.close > d1.close && d0.open > d1.close && d0.close < d1.open && (d0.close - d0.low) > 2 * (d0.open - d0.close)) {
    pattern = "Shooting Star";
  } else if (d0.close < d1.close && d0.open > d1.close && d0.open < d1.open && (d0.open - d0.low) > 2 * (d0.close - d0.open)) {
    pattern = "Hanging Man";
  } else if (d0.close < d1.close && d0.open < d1.open && d0.open > d1.close && (d0.close - d0.low) > 2 * (d0.open - d0.close)) {
    pattern = "Dark Cloud Cover";
  }
  
  return pattern;
},
    tradeEntry(instrument_token,inst=cis,cis,element){
      try {

        // return;

if( !element  || !cis || !cis.pricePoints || !cis.pricePoints.d1 || !cis.pricePoints.d1.high){

  this.cl('cis or element undefined for',instrument_token);

  return false;
}


        // return;

        this.cl('inside trade entry')

// let utilisedMargin=liveMargin!=-1?liveMargin.equity.utilised.debits:-1;

// if(utilisedMargin==-1 ||utilisedMargin>4730000 ){

// this.cl('margin issue');
//   return false
// }
// this.cl('inside trade entry2')
        let ts=cis.tradingsymbol;
        // this.cl('reached starting')
       

        
        let filter=this.filterScripts(element);


        
        if(filter==false){
//  this.cl('filter false',ts)
          return false
        }
//  this.cl('after filter')
        // this.cl('inside trade entry1',ts)

//         if(!this.isMarketBullish(element)){

//           // this.cl('not bullish',ts)
// // return false;

//         }
        // this.cl('inside trade entry2',ts)

        // if(!this.estimateMarketTrend(element)){

        //   this.cl('trend not favorable',ts)
        //   return false;
        // }

        // this.cl('inside trade entry3',ts)
      //  if(!this.calculateMarketVolatility(cis)){

      //   // this.cl('volatality false',ts)
      //   // return false;
      //  }
      // this.cl('inside trade entry4')
// this.cl(element)
// return;


// let index;



// let proceed=this.checkProceedWithIndexChange(cis.tradingsymbol)
// this.cl(proceed,'proceed after nifty check',ts)
// proceed=true;

//  this.cl('inside trade entry5')
      
// if(proceed==false){

// // this.cl('proceed false',ts)
//   // return; 

// }

//  this.cl('inside trade entry6')

        // proceed=true;
         

// let list=[9,15]

          // if(list.includes(this.hours)){


          // }

          // this.cl('after hours ');
           this.cl('inside trade entry7')






// this.cl('condition 1 ',cis.pricePoints.d0.high<cis.pricePoints.d1.high)
// this.cl('connndition 2 ',cis.pricePoints.d0.open<cis.pricePoints.d1.high)
// this.cl('connndition 3 ',cis.previousPrice !=0)
//  this.cl('connndition 4 ',cis.last_price >= cis.pricePoints.d1.high)


//// program working till hhere no issues  feb 17 2023

let cond=cis.pricePoints.d0.high<cis.pricePoints.d1.high 
&& cis.pricePoints.d0.open<cis.pricePoints.d1.high
&& cis.previousPrice !=0 
&& cis.last_price >= cis.pricePoints.d1.high;


// this.cl('combined',ts,cond


// )

 this.cl('reached inside trade entry')



 let {entry,target,stopLoss}= this.getAverageClosingValue(cis);



//enterTrade
//tradeSwitch

///tradeEntrySwitch



// this.cl('here',ts)

let closingMovingAverageCondition=element.ohlc.open<entry &&
element.last_price>=entry && false;

this.cl(closingMovingAverageCondition,'closingMovingAverageCondition2')

// let a=this.evaluateConditions(element, entry, cis, ts);

// this.cl(a,element.last_price,closingMovingAverageCondition);

// let a=this.retrieveTradeDetailsInLocalStorage(cis.tradingsymbol);
// console.log(a,'retrieveTradeDetailsInLocalStorage @4031');






let ohlc=element.ohlc;
let lp1=element.last_price;
let isOpenLow=this.isOpenLow(ohlc,cis,lp1);



// let sells=element.depth.sell;
// this.cl(element,'element');


if(!element || !element.depth || !element.depth.buy )
{

return;
 

}


let buys=element.depth.buy;
// console.log('buys');

// let {highestOrdersPrice, secondHighestOrdersPrice}=this. getHighestOrdersPrice(sells);
let { secondLowestOrdersPrice}=this. getLowestOrdersPrice(buys);

if(secondLowestOrdersPrice==-1){
this.cl('issue with secondLowestOrdersPrice for',cis.tradingsymbol)
  return false;
}

// this.cl('below lowest price orders')

// console.log({secondHighestOrdersPrice},'secondHighestOrdersPrice')
// this.cl(isOpenLow,'isOpenLow',ts);

// let chk=secondLowestOrdersPrice<element.last_price;
// let o=`Second highset price is ${secondHighestOrdersPrice} and last price is ${element.last_price} and secondhighest price is less than last_price is ${chk} for ${ts}`;
// // this.cl(o)


let todayLastPriceHigh=false;

// console.log(this.hours)

if( (this.hours==15) && this.minutes>15 ){



// console.log(element.last_price==element.ohlc.high,ts)


if(element.last_price<element.ohlc.high*1.01 && element.last_price>element.ohlc.high*.99){

  // console.log(ts,'is seems to be at higest price close');

  todayLastPriceHigh=true
}


}

// this.cl('before yesterDayCloseStrategy')


let yesterDayCloseStrategy=(element.last_price>cis.pricePoints.d1.high && false ) //ned some other cond//&& element.last_price<element.ohlc.high)
// let newTradingObj=this.newTradingObj;
// newTradingObj.tradingsymbol=ts;
// newTradingObj.buyTime=new Date();
// newTradingObj.buyPrice=Math.min(secondLowestOrdersPrice,element.last_price);

this.cl('reaehed switch3331')

// console.log(typeof yesterDayCloseStrategy,ts)


this.tradeEntrySwitchHealth=!this.tradeEntrySwitchHealth;

switch(true){


  case yesterDayCloseStrategy:

 

  // newTradingObj.strategy='yesterDayCloseStrategy';

  // newTradingObj.targetPrice=cis.pricePoints.d1.rangeBreakOutTarget;

  // this.storeTradeDataInLocalStrorage(newTradingObj)

  this.cl('safe','yesterDayCloseStrategy')

  let e3=Math.min(secondLowestOrdersPrice,element.last_price,cis.pricePoints.d1.high);


this.cl('yester day yesterDayCloseStrategy ',ts)

this.proceedForEntry(
             instrument_token,
             cis,
             element,
             e3,
             "long"
           );



  break;



  case todayLastPriceHigh:


  // newTradingObj.strategy='todayLastPriceHigh';

  // newTradingObj.targetPrice=newTradingObj.buyPrice*1.2

  // this.storeTradeDataInLocalStrorage(newTradingObj)



  let e2=Math.min(secondLowestOrdersPrice,element.last_price);

this.cl('todayLastPriceHigh',ts)



this.proceedForEntry(
             instrument_token,
             cis,
             element,
             e2,
             "long"
           );

           this.cl('safe','todayLastPriceHigh')

  break;



case isOpenLow:

//  strategyName='openLowScriptFithFixedLoss';

// newTradingObj.strategy='isOpenLow';

// newTradingObj.targetPrice=newTradingObj.buyPrice*1.2

// this.storeTradeDataInLocalStrorage(newTradingObj)


// this.saveTradeDetailsInLocalStorage(ts,lp,lp*1.2,stopLoss,strategyName);
// // entry=lp;

// let e1=element.last_price;

// console.log({secondLowestOrdersPrice},secondLowestOrdersPrice)

let e1=Math.min(secondLowestOrdersPrice,element.last_price);
// console.log({e1},'e1')

 this.cl('openLowScriptFithFixedLoss strategy ',ts,e1,'e1')

// this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               e1,
//               "long"
//             );
//             this.cl('safe','todayLastPriceHigh')
break;






//entryswitch

// element.ohlc.high<entry &&

case  closingMovingAverageCondition:

this.cl('closingMovingAverageCondition')

// newTradingObj.strategy='isOpenLow';

// newTradingObj.targetPrice=newTradingObj.buyPrice*1.2

// this.storeTradeDataInLocalStrorage(newTradingObj)

//  strategyName='=closingMovingAverageMethod'

// this.saveTradeDetailsInLocalStorage(ts,entry,target,stopLoss,strategyName);

this.cl('entering  closingMovingAverageCondition',ts)

entry=Math.min(secondLowestOrdersPrice,element.last_price);

// this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               entry,
//               "long"
//             );
//             this.cl('safe','closingMovingAverageCondition')

break;


// case ( false &&
// //so run fetch instruments regularly
// cis.pricePoints.d0.high<cis.pricePoints.d1.high && ///so high not croseed before 
// cis.pricePoints.d0.open<cis.pricePoints.d1.high && ///so opened below yesterday high /// pvs case itself solve still

// cis.previousPrice !=0 &&
  



//  cis.last_price >= cis.pricePoints.d1.high
            
            
            
//             ) :


         

//             this.cl( 'y day high candle',cis.tradingsymbol)

//             let p1=cis.last_price;

//             this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               cis.pricePoints.d1.high,
//               "long"
//             );

//             break;


  // case ( inst.previousPrice < maxCandle &&
  //           cis.last_price >= maxCandle) :

  //           this.cl('max candle trade',cis.tradingsymbol)

  //           this.proceedForEntry(
  //             instrument_token,
  //             cis,
  //             element,
  //             maxCandle,
  //             "long"
  //           );

  //           break;



//  case ( inst.previousPrice < high &&
//             cis.last_price > high) :



//             let ep1=Math.max(open,close)
//             this.proceedForEntry(
//               instrument_token,
//               cis,
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
  //           cis.last_price <= close) :

  // ///closing point below sell

  // return;


  // if(this.instruments.
  //         filter(i=>i.instrument_token==instrument_token)[0].
  //         hasLivePosition){

  //           return false
  //         }
  // this.proceedForEntry(
  //             instrument_token,
  //             cis,
  //             element,
  //             close,
  //             "short"
  //           );

  // break;

  // case ( inst.previousPrice < close &&
  //           cis.last_price > close) :
  //           if(this.instruments.
  //         filter(i=>i.instrument_token==instrument_token)[0].
  //         hasLivePosition){

  //           return false
  //         }

  //         return;
///closing point abouve buy

// this.cl({close},cis.tradingsymbo,'hi')


// let close11=close*.95
// let close1=close11.toFixed(1)


// this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               close,
//               "short"
//             );
// //changed long to short
// break;


// case ( inst.previousPrice < open &&
//             cis.last_price > open) :
            
            
//             if(this.instruments.
//           filter(i=>i.instrument_token==instrument_token)[0].
//           hasLivePosition){

//             return false
//           }

//           return;
// ///opening point   abouve buy

// let open11=open*.95
// let open1=open11.toFixed(1)

// this.cl({open},cis.tradingsymbo,'hi')
// this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               open,
//               "short"
//             );

            //changed long to short

// break;


// case ( inst.previousPrice > open &&
//             cis.last_price < open) :
//             if(this.instruments.
//           filter(i=>i.instrument_token==instrument_token)[0].
//           hasLivePosition){

//             return false
//           }

//           return ;
///opening point below sell
// this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               open,
//               "short"
//             );

// break;



}






          
//           if (
//             inst.previousPrice <= entryLong &&
//             cis.last_price >= entryLong ///day entry
         
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
//               cis,
//               element,
//               entryLong,
//               "long"
//             );

//             // this.cl('trade entry  long for %s @ %s',cis.tradingsymbol,entryLong)
//             // return true;
//           } else if (
//             inst.previousPrice >= entryShort &&
//             cis.last_price <= entryShort
//           ) {
//             ///short entry

//             if(this.instruments.filter(i=>i.instrument_token==instrument_token)[0].hasLivePosition){

// return false
// }

           
           
//             this.proceedForEntry(
//               instrument_token,
//               cis,
//               element,
//               entryShort,
//               "short"
//             );

//             // this.cl('trade entry  short for %s @ %s',cis.tradingsymbol,entryShort)

//             // return true;
//           }


          


} catch (e) {
         console.log("trade entry function", e);
            return false;
          }

         

    },

async setTargetPricesBasedOnQuantity(cis,element,low,high,instrument_token){

  return new Promise(async (res,rej)=>{
    
    let offerPrice, bidPrice, count,livePnlOffered;
  let stopLoss, target, lstPrice,quantity;

  bidPrice=-1,offerPrice=-1,count=-1,stopLoss=-1, target=-1, lstPrice=-1,livePnlOffered=-1,quantity

    if(!element || !element.depth || !element.depth.buy || !element.depth.sell || cis.PlacedReverseOrder==true){

      bidPrice=-1,offerPrice=-1,count=-1,stopLoss=-1, target=-1, lstPrice=-1,livePnlOffered=-1,quantity

res( {offerPrice, bidPrice, count,livePnlOffered,stopLoss, target, lstPrice,quantity})
return
    }

  
 

//   if(cis.PlacedReverseOrder==true){



// }

  quantity = this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
          )[0].quantity;

          // let c1=await this.getOrders();
            
          // this.cl(c1,'out put of get orders in side set target prices fun @line number 2512')
            count = this.liveOrders.filter(
                          (i) =>
                            i.instrument_token == instrument_token 
                          
                        ).length


          if (quantity > 0) {


            let buy_price = this.livePositions.filter(
              (lp) => lp.instrument_token == cis.instrument_token
            )[0].buy_price;

            let buyQuantity = this.livePositions.filter(
              (lp) => lp.instrument_token == cis.instrument_token
            )[0].buy_quantity;

            offerPrice = element.depth.buy.sort((a, b) => b.price - a.price)[0]
              .price;

            lstPrice = offerPrice;
      

            livePnlOffered = (offerPrice - buy_price) * buyQuantity;

            stopLoss = low - 5;

;

            // this.cl('count of %s is $%s & quantity is %s ',count,
            // cis.tradingsymbol,quantity)
          } else if (quantity < 0) {
            stopLoss = high + 5;

            
            let sell_price = this.livePositions.filter(
              (lp) => lp.instrument_token == cis.instrument_token
            )[0].sell_price;

            let sellQuantity = this.livePositions.filter(
              (lp) => lp.instrument_token == cis.instrument_token
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



try {
	
	      if(isNaN(instrument_token)){
	
	
	        this.cl('is nan issue instriment token in setprevios and last price')
	        return  false;
	      }
	
	      if(this.instruments.filter(
	            (i) => i.instrument_token == instrument_token
	          ).length==0){
	
	            this.cl('is nan issue instriment token in setprevios and last price')
	
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
	
	     
	
	        return true;
} catch (error) {
	

  this.cl(error,'error of set previos price');

  return false
}


    },

    setLastPriceBasedOnTradeDirection(cis,element){
try{
return element.last_price;

      let qty1, qty11,last_price;
        if (
          typeof this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
          ) == "undefined" ||  typeof this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
          )[0]=='undefined'
        ) {
         
          last_price = element.last_price;
       
        } else {
          qty11 = this.livePositions.filter(
            (lp) => lp.instrument_token == cis.instrument_token
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

this.cl('error from function',setLastPriceBasedOnTradeDirection)

      }
    },

    setLiveScript(cis,last_price){
     try {
       let ls = {};
         ls.tradingsymbol = cis.tradingsymbol;
         ls.ltp = last_price;
        //  ls.buyPoint = cis.pricePoints.d1.high;
        //  ls.target = cis.pricePoints.d1.rangeBreakOutTarget;
        //  ls.stopLoss = cis.pricePoints.d1.low;
         this.liveScript = ls;
 
     } catch (error) {
      

      this.cl('error from setLiveScript ',error)
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
        this.cl('here one 2')
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
          // this.cl('here one 6')
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
            // this.cl('here one 7')
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

              // this.cl('e.instrument_token',e.instrument_token)

              let q = quotes[e.instrument_token];

              // this.cl(q,'q')

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


// this.cl(l.quantity,'tt',transaction_type,'ln',ln,this.orders)


        // this.cl({ln})

        
     

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

      // this.cl('has live target canoot be updated in intruments .. update instrument with the script')
    }

      this.hasStartedGetLivePositions=false
    } catch (error) {
      this.cl('here one 9',error)
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

      let tmp=JSON.stringify(l.instrument_token)
      let k=await this.updateMissingScriptInInstrumetsFile(tmp);

      this.cl(
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

    let cis = this.instruments.filter(
      (i) => i.instrument_token == instrument_token
    )[0];
    this.cl('order triggering from placeTargetsForSingleScript is %s and has livee target from current instrument is %s ',PlacedReverseOrder,cis.hasLiveTarget)
  

//  this.cl('placeTargetsForSingleScript')
let transaction_type;
  // let lo=await this.getOrders();s



let e1=this.livePositions.filter(i=>i.instrument_token==instrument_token)

if(e1.length==0){

  return false
}

let e=e1[0]

  // this.cl({lo})
      let liveReverseOrder=this.liveOrders.filter(i=>i.instrument_token==instrument_token 
 && i.quantity!=0
);


// this.cl({liveReverseOrder})
if (liveReverseOrder.length>0){
  // this.cl('reverse order tallied change lgic here')
   return false;
}
this.placingReverseOrderInProgress = true;


  let output = [];

  

    if (typeof cis == "undefined") {

      this.cl('cis == "undefined @2930"')
           return false;
    }

   
    if (quantity == 0) {

      this.cl('quantity == 0 @2939')
      return;
    }

    let count,
     
      rangeBreakOut,
      high,
      targetPoint
     

    let { upperBreakOutTarget, lowerBreakOutTarget } =
      this.getLatestPricePoints(instrument_token);

    


    // this.cl({quantity})

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
     
      // this.cl({count},{hasLiveTarget },{PlacedReverseOrder},'reverse order place d ')

      return false;
    }

//     let liveReverseOrder=this.liveOrders.filter(i=>i.instrument_token==instrument_token 
//  && i.quantity!=0
// );

    let element = 0;
    let product = e.product;
    let livePnl = e.pnl;



    output.push(cis.tradingsymbol);

    // this.cl(
    //   "palcing reverse1",
    //   cis.tradingsymbol,
    //   "high,upper_circuit_limit",
    //   high,
      
    // );

    let reverseOrder=true;
    let o=this.placetargetAndStopLoss(
      cis,
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
// this.cl(e.tradingsymbol,ln)

if(ln==0){

  noTargetArray.push(e.instrument_token)

}
// this.cl(e.tradingsymbol,ln,noTargetArray)

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


if(this.placingReverseOrderInProgress==true){

// this.cl('reverse order is being placed please wait...');

  let code='reverseOrderBeingPlaced';
  let msg='reverse order is being placed please wait...'
  this.triggerAlert(code,msg)
  
  return false;
}

this.placingReverseOrderInProgres=true;

//// reverseOrder //reverseorder
let o=await this.getOrders();




// console.log(o,'o')
let liveOrderInstruments=this.liveOrders.filter(o2=>o2.transaction_type=="SELL").map(o1=>o1.instrument_token);

// console.log(this.liveOrders,'live orders');

// return;
// console.log(liveOrderInstruments,'liveOrderInstruments');


// return;

let lp=await this.getPositions();


// console.log(lp,'lp');

      let liveInstrumentSymbols = this.livePositions.map(
              (a) => parseInt(a.instrument_token)
            ); 


      
            
          this.liveInstrumentSymbols = liveInstrumentSymbols



 let quotes=await this.getQuoteFromZerodha(liveInstrumentSymbols);




await this.getPositions();  




        
        let pos=this.livePositions.length;

        if(pos==0){
 this.cl('no live positions for the script')
          return false
        }


/// call after refreshordeStatus

   let {ReverseOrderPending,noTargetArray} =  
    this.checkReverseOrderTallyAndReturnNoTargetScripts()



      if (!ReverseOrderPending){



        ///checkStoplOss
this.cl('reverse order tallied')  /// change with oindividual
         return false;
      }

      // if (this.refreshingTradeStatus == true) {
      //    this.cl("trade status is being refreshe before placing order");
      //   this.placingReverseOrderInProgress=false;
      // return false
      // }


   

      

      let symbols = [...this.livePositions.filter(lp=>lp.quantity>0)];
// this.cl(symbols,'symbols here');
      let ln = symbols.length;

      if (ln == 0) {
        this.cl("livePositions symbol length 0 returning");
        this.placingReverseOrderInProgress == false;
        return false;
      }

      // this.cl(this.livePositions,'this.livePositions')

      //  this.cl(symbols, "symbols");
      if (typeof symbols == "undefined") return false;
     

      return new Promise((res, rej) => {
        let output = [];

        let timer = setInterval(() => {
   
            if(symbols.length==0){

            
return;
}
          let e = symbols.pop();


          // console.log(e,'e');

          let quote=quotes[e.instrument_token];

          // console.log(quote,'quote,e')
         




          if (typeof e == "undefined") {
          
            
            clearInterval(timer);
            this.placingReverseOrderInProgress = false;
            res(output);
            return;
          }

          let instrument_token = e.instrument_token;

          if(liveOrderInstruments.includes(instrument_token)){

//this.cl('alrady have reverse order',instrument_token)
          }

          if(!liveOrderInstruments.includes(instrument_token)){


         

   

          let cis = this.instruments.find(
            (i) => i.instrument_token == e.instrument_token
          );

          if (typeof cis == "undefined") {
            this.placingReverseOrderInProgress == false;
            return false;
          }

          // if (typeof cis.otherCriteria == "undefined") {
          //   // return false;
          // }

          let quantity = e.quantity;

          if (quantity == 0) {
            this.placingReverseOrderInProgress == false;
            return;
          }

          ///if has liver order or has reverse order placed /// return

          /// fire a target
          let
            transaction_type,
            rangeBreakOut,
            high,
            targetPoint,
            PlacedReverseOrder;



        

            // this.getLatestPricePoints(instrument_token);;

          let upperBreakOutTarget;

          PlacedReverseOrder = this.instruments.find(
            (i) => i.instrument_token == instrument_token
          ).PlacedReverseOrder;


          // let upper_circuit_limit = e.quotes.upper_circuit_limit
          ;

let uck=quote.upper_circuit_limit;

          // this.cl(e.quotes,'e.quotes');

          // return;
          let hasLiveTarget;

       if (quantity > 0) {
            transaction_type = "SELL";

            // upperBreakOutTarget=cis.pricePoints.d1.rangeBreakOutTarget;
            upperBreakOutTarget=Math.round(cis.pricePoints.d1.high*1.1,1);
           
            quantity = Math.abs(e.quantity);
           
       

            hasLiveTarget  = this.liveOrders.some(
              (i) =>
                i.instrument_token == instrument_token &&
                i.transaction_type == "SELL"
            );

            // rangeBreakOut = lowerBreakOutTarget ;
            // // (cis.pricePoints.d1.rangeBreakOutTarget) - 0.15;
            // high = rangeBreakOut;

            // this.cl({upperBreakOutTarget},'upperBreakOutTarget',{uck})





            if(typeof typeof upperBreakOutTarget!='undefined' && typeof uck!='undefined'  ){
              targetPoint =Math.min(upperBreakOutTarget,uck)


            }else 
if(typeof upperBreakOutTarget=='undefined'){

  targetPoint=uck
}else if(typeof uck=='undefined' ){

  targetPoint =upperBreakOutTarget

}



   
// this.cl(upperBreakOutTarget,cis.pricePoints.d0.high,'here dk uck todays high',uck,lck,cis.tradingsymbol)

            
            
          }

         

          if (
            PlacedReverseOrder == true ||
           
            hasLiveTarget == true
          ) {








            this.placingReverseOrderInProgress == false;

            // this.cl('has reverse order for %s',cis.tradingsymbol)





// this.cl('reverse order bening placed',{ReverseOrderPending},{PlacedReverseOrder },{hasLiveTarget })






            return false;
          }

let hasLivetgt=cis.hasLiveTarget;
let hasLivePos=cis.hasLivePosition;

if(hasLivetgt){

  // this.cl({hasLivetgt});
  return false
}

if(!hasLivePos){

// this.cl({hasLivePos});
return false
}



          let element = 0;
          let product = e.product;
          let livePnl = e.pnl;

     

          output.push(cis.tradingsymbol);

          // this.cl(
          //   "palcing reverse1 order from timer script",
          //   cis.tradingsymbol,
          //   "high,upper_circuit_limit",
          //   high
          
          // );


           let reverseOrder=true;

// this.cl({targetPoint})

// this.cl({targetPoint},'tpt')

let {target}=this.getAverageClosingValue(cis);

targetPoint=target;


try {
	let lo=this.livePositions.find(i=>i.instrument_token==instrument_token)
	let avg=lo.average_price;

  let tgt1
  if((this.hours==15 && this.minutes>30)|| this.hours>15 || this.hours<9 || (this.hours==9 && this.minutes<15)
  
  ){

    tgt1=avg*1.8;

  }else{

     tgt1=avg*1.5;

  }
 
  let tgt=tgt1.toFixed(1)
 

  // this.cl(uck,'uck');
  targetPoint=Math.min(tgt,uck);

} catch (error) {


  console.log('target error',error)
	


}



// let storedTarget=this.retrieveTradeDetailsInLocalStorage(cis.tradingsymbol);

// if(storedTarget!==false){

//   console.log("taking target from stored ");

// targetPoint=storedTarget.target;

// }

          this.placetargetAndStopLoss(
            cis,
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

this.cl('reverse order complete reseting plaxe reverorder abd nd ENTER NOW TO TRADE ')
this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
    PlacedReverseOrder=false;

         this.instruments.filter(i=>i.instrument_token==instrument_token)[0].
    enterNowToTrade=false; ///for getting new orders 

}



        }

        }, 333);
      });
    },
    async refreshTradeStatus() {

new Promise(async (res,rej)=>{





      if (this.refreshingTradeStatus == true) {
        // this.cl("trade stattus is being refreshed ples wait");

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
        this.cl(e ,'error ofrefresh order status');
      }

      return "trade status returning";


    })
    },

    writeTrades(trade) {
      return false;
      // this.cl("writing trade from write trade", trade);
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


      let orderArray = [arr];

      let a = [];
      a.push(arr);

      this.orderArray.push(a);

     
      this.cl("place order result", arr);
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

this.cl('build order array')

// this.cl(reverseOrder,'reverseOrder from build arrya ')

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

      // this.cl('hrs, min',this.hours,this.minutes)
      let exchange = this.itype;

      if (exchange != this.itype) {
        if (
          (this.hours == 15 && this.minutes > 30) ||
          this.hours > 15 ||
          this.hours < 9 ||
          (this.hours == 9 && this.minutes < 15)
        ) {


          order.variety = "amo";

          console.log(order.variety,'ov')
        } 
        
        else {
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

this.cl(this.hours,'hours');

      if((this.hours>15 || (this.hours==15 && this.minutes>35))){

        order.variety = "amo";

        this.cl('amo')

      }

      if(transaction_type=='BUY'){

        order.variety = "regular";// prevent buy amos 
      }

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

      this.cl("status updated", property, value, symbol);

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


      // this.cl({orderArray},'here1')
      let data1 = JSON.stringify(orderArray);

      let data = {};

      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // this.cl(data1,'data1 of orders just before palcing order ')

      return axios.post(url, data).then(async (res) => {



// this.cl(res,'result of order placement')

// this.$router.go();

      


        let a = await this.refreshTradeStatus();

        // this.getOrders();

        // this.cl(a, "result of refresh teade status");
        //this.$router.go();

        // this.cl(res,'return of palce order')
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

async proceedForReverseOrderPlacement(cis,instrument_token,orderUpdates){

let upper_circuit_limit
let lower_circuit_limit
//   if(this.instruments.filter(i=>i.instrument_token==instrument_token).length>0)
//   {

//     if(typeof this.instruments.filter(i=>i.instrument_token==instrument_token)[0].quote!=undefined)
//   {

//     let q= this.instruments.filter(i=>i.instrument_token==instrument_token)[0].quote;
//     upper_circuit_limit=q.upper_circuit_limit
//     lower_circuit_limit=q.lower_circuit_limit

//   }


// }



let e=orderUpdates;


  let livePosition= this.livePositions.
  filter(l=>l.instrument_token==instrument_token)[0];


  // this.cl({livePosition})
  if(typeof livePosition=='undefined'){

    return false
  }
  let quantity=livePosition.quantity


  // this.cl({quantity})
          if (quantity == 0) {
            this.placingReverseOrderInProgress == false;

            this.cl('this.placingReverseOrderInProgress ',this.placingReverseOrderInProgress,quantity  )
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

          let  upperBreakOutTarget, lowerBreakOutTarget ;
           
            lowerBreakOutTarget=cis.pricePoints.d1.rangeBreakDownTarget;
           
           
           
           upperBreakOutTarget=cis.pricePoints.d1.rangeBreakOutTarget;

            if(typeof lower_circuit_limit!=undefined){

              lowerBreakOutTarget=Math.min(
                cis.pricePoints.d1.rangeBreakDownTarget,
                
                lower_circuit_limit
              )
            }else{

              lowerBreakOutTarget=cis.pricePoints.d1.rangeBreakDownTarget;

            }   
            
            
            if(typeof upper_circuit_limit!=undefined){

              upperBreakOutTarget=Math.min(
                cis.pricePoints.d1.rangeBreakOutTarget,
                upper_circuit_limit
              )
            }else{

              upperBreakOutTarget= cis.pricePoints.d1.rangeBreakOutTarget;

            }
            

          PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

         

          // let upper_circuit_limit =livePosition.quotes.upper_circuit_limit;

          // let c1=await this.getOrders();

          // this.cl(c1,'ci get orders result at 3491')

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
            // this.cl('PlacedReverseOrder ',PlacedReverseOrder )
            // this.placingReverseOrderInProgress == false;
            return false;
          }


  let element = 0;
          // let product = orderUpdates.product
          let product = livePosition.product
          let livePnl = e.pnl; /// cehck this
 
          // upper_circuit_limit
          // this.cl(
          //   "palcing reverse order on order update",
          //   cis.tradingsymbol,
          //   "high,upper_circuit_limit",
          //   high
           
          // );



   this.placetargetAndStopLoss(
            cis,
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



async placeTargetOnCancelledOrderUpdate(cis,instrument_token,orderUpdates){

  // let livePositions1 =await this.getPositions();
 let lp=await this.refreshTradeStatus();
 
  let livePositions =this.livePositions;

  // this.livePositions=livePositions;

  if(typeof livePositions=='undefined'){

    this.cl(typeof livePositions,'livePositions undefined')   
    
     return false;
  }

  // this.cl(livePositions,'livePositions');

 let count= livePositions.filter(lp=>lp.instrument_token==instrument_token).length
// this.cl(count,'inside place target on cancelled order update triggering')
 if(count>0){

  
 this. proceedForReverseOrderPlacement()
 
 }else if(count==0){
  this.orderUpdateProcessing=false;


 }





  
},

async processOrderUpdate(orderUpdates){


  try{

  
let instrument_token=orderUpdates.instrument_token;
  let cis=this.instruments.filter(i=>i.instrument_token==instrument_token)[0];

  if(typeof cis=='undefined')
  {
 
    
    this.cl('seems order update from some other script')
    return false;
  }
let enterNowToTrade=cis.enterNowToTrade;
let PlacedReverseOrder=cis.PlacedReverseOrder;

let livePositions=await this.getPositions();
let liveOrders=await this.getOrders();




switch(true){

  case orderUpdates.status=="COMPLETE": 

// this.cl('COMPLETE trigger')

this.orderCompleteProcedure(livePositions,liveOrders,cis,instrument_token,orderUpdates)

break;

case orderUpdates.status=="CANCELLED": 


// this.cl('order cancelled switch ')

// this.refreshTradeStatus()
 this.placeTargetOnCancelledOrderUpdate(cis,instrument_token,orderUpdates);

break;




}




}catch(e){this.cl(e,'process order')}

},


    async proceedForEntry(
      instrument_token,
      cis,
      element,
      entryPrice,
      direction
    ) {



      // this.cl(direction,'direction')
      //  return;
      // this.cl(entryLong1);
      // return false

      // return false;

      // let entryLong = this.getHourlySupportPointsBelowReference(
      //   instrument_token,
      //   entryLong1
      // );

      // let entryPrice=entry
      // this.cl('before entry undefined',cis.tradingsymbol,cis.last_price ,entryLong)

      if (typeof entryPrice == "undefined") {
        return false;
      }

      // this.cl('before entry point 0a',cis.tradingsymbol,cis.last_price ,entryLong)

      if (entryPrice <= 0) {
        return false;
      }
      let { otherCriteriaCheck, message } = this.otherCriteria(
        element,
        cis
      );

      //  this.cl('inside after other criteria',cis.tradingsymbol,cis.last_price ,entryLong)

      if (otherCriteriaCheck == true) {
        // this.cl(otherCriteriaCheck,'otherCriteriaCheck for ',cis.tradingsymbol,'msg',message)
      }

      if (
        otherCriteriaCheck == false ||
        typeof otherCriteriaCheck == "undefined"
      ) {
        // this.cl(otherCriteriaCheck,'otherCriteriaCheck')
        // return false;
      }

      let hoursExcluded = [15];

      if (hoursExcluded.includes(this.hours) && this.minutes > 0) {
        // this.cl("No buying after" + this.hours + " hrs");

        // return false;
      }

      if (this.livePositionTotalCost == -1) {
        this.cl(
          "Positions not loaded properly",
          this.livePositionTotalCost
        );
        return false;
      }

      if (this.liveOrders[0] == 0) {
        this.cl(
          "liver orders  not loaded properly returning",
          this.liveOrders
        );
        // let o=await this.getOrders();
        // this.cl(o,'refreshing live orders')
        // return false;
      }

      let ln = this.liveOrders.filter(
        (lo) => lo.instrument_token == instrument_token
      ).length;

      if (ln > 0) {
        // this.cl('live order palced already for this symbol',cis.tradingsymbol)
        return false;
      }

      let proposedStock = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].name;
      // this.cl(proposedStock,'proposedStock');

      if (this.liveOrderPlacedScripts.includes(proposedStock)) {
        // this.cl(proposedStock,
        // 'stock already holding ordered')

      //  return false;
      }

      // if(this.proosed)

      if (this.liveOrderScripts.includes(proposedStock)) {
        // this.cl(proposedStock,'stock has live order ',cis.tradingsymbol)

       // return false;
      }

      if (this.livePositionScripts.includes(proposedStock)) {
        // this.cl(proposedStock,'stock already holding')

       // return false;
      }

      let hasHitStopLoss = this.hasAlreadyHitStopLossBefore(
        element,
        cis,
        instrument_token
      );

      if (!hasHitStopLoss) {
        // this.cl(
        //   "stop loss not hit before for %s so not buying no",
        //   cis.tradingsymbol
        // );
        // return false;
      }

      let hasHit = this.hasAlreadyHitTargetBefore(
        element,
        cis,
        instrument_token
      );
      // if (hasHit) {
      //   this.cl(element,'has hit')
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

      // let trade = `Buy instrument ${cis.tradingsymbol} at ${cis.SevenDayMaxMin.Max}`;
      let trade = `Buy instrument ${cis.tradingsymbol} at ${
        cis.pricePoints.yesterday.high
      } . 
      Target ${cis.pricePoints.yesterday.rangeBreakOutTarget} 
      Strict stop loss at ${Math.max(
        cis.pricePoints.pivotPointObject.bc.toFixed(1),
        cis.pricePoints.d1.low
      )} ,
      TargetProfit ${
        (cis.pricePoints.yesterday.rangeBreakOutTarget -
          cis.pricePoints.yesterday.high) *
        cis.lot_size
      }
      Possible Loss ${
        (cis.pricePoints.yesterday.high -
          cis.pricePoints.pivotPointObject.bc.toFixed(1)) *
        cis.lot_size
      }
      `;

      let trade1 = {
        type: "Entry",

        tradingsymbol: cis.tradingsymbol,
        entry_price: cis.pricePoints.yesterday.high,
        target: cis.pricePoints.yesterday.rangeBreakOutTarget,
        stoploss: Math.max(
          cis.pricePoints.pivotPointObject.bc.toFixed(1),
          cis.pricePoints.d1.low
        ),
      };

      let trade2 = JSON.stringify(trade1);

      // this.sendToTelegramGroup(trade);
      // this.writeTrades(trade2 + ",");

      //checking the trade exeeds the maximum tradable regularunt   add live palced buy order in nfo

      // if(this.livePositionTotalCost<this.maxTradableAmount){

      // if (cis.instrument_type == "FUT") {
      if (true) {


        this.proposedBuyAmount = entryPrice * cis.lot_size;

        // this.cl(
        //   "Proposed regularunt ",
        //   this.proposedBuyAmount,
        //   "for",
        //   cis.tradingsymbol
        // );

        // this.liveTradablebalance > 0 &&
        // if (cis.instrument_type == "FUT") {
        if (true) {


          // var audio = new Audio("/sounds/mixkit-sci-fi-confirmation-914.wav");
          //audio.play();
          let transaction_type;

          if (direction == "long") {
            transaction_type = "BUY";

      //       if (element.ohlc.high > cis.pricePoints.d1.high) {

      //         this.cl('hi hit already hit for %s, so no trade todayhigh %s yday-high %s ',
              
      //         cis.tradingsymbol,element.ohlc.high,cis.pricePoints.d1.high)
      //   return false;
      // }

          } else if (direction == "short") {
            transaction_type = "SELL";

            if (element.ohlc.low < cis.pricePoints.d1.low) {

this.cl('low hit already hit for %s, so no trade ',cis.tradingsymbol)
return false;
}



          }
         

          let tradingsymbol = cis.tradingsymbol;

          let lot_size = cis.lot_size*1;
          //let lot_size=0;
          let order_type = "LIMIT";

          //  let price1=  element.depth.sell.sort((a,b)=>a.price-b.price)[0]
          //  let price2=  element.depth.sell.sort((a,b)=>b.price-a.price)[0]

          //  this.cl('sell price 1',price1,'sell price 2',price2)

       

          //  this.cl(priceSell1,'priceSell1',priceSell2,'priceSell2');

          //  this.cl()

          //  let Price=priceSell1;
          // let Price = cis.pricePoints.yesterday.high;
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

      

          let orderArray = [arr];
          // return;
          let a = await this.placeOrder(orderArray);
          // this.cl("place order result", a);

          this.counter = this.counter + 1;
        

          const timestamp = new Date().getTime();
          // var text= "firing of auto mode+ ENTER NOW TO TRADE false",this.counter,cis.enterNowToTrade,cis";
          let ob={text,timestamp};

          this.userMessages.push(ob);

          this.userMessages.push(
            "firing of auto mode+ ENTER NOW TO TRADE false",
            this.counter,
            cis.enterNowToTrade,
            cis
          );
        } else {

          const timestamp = new Date().getTime();
          var text= "Maximum tradable regularut Exceeded";
          let ob={text,timestamp};

          this.userMessages.push(ob);


          this.userMessages.push("Maximum tradable regularut Exceeded");
          this.cl(
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

        // this.cl(`Pvs price of green ${inst.tradingsymbol} is ${inst.previousPrice} and last price is ${inst.last_price}`)
      } else {
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "candle",
          "red"
        );

        // this.cl(`Pvs price of red ${inst.tradingsymbol} is ${inst.previousPrice} and last price is ${inst.last_price}`)
      }
    },

    procedureForOptionsShortCovering(
      cis,
      instrument_token,
      element,
      product,
      quantity
    ) {
      // this.cl(arguments,
      // 'arguments for procedureForOptionsShortCovering')

      return false;
    },

    async placetargetAndStopLoss(
      cis,
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

      let tradingsymbol = cis.tradingsymbol;


      const targetPointLong = Math.round(targetPointLong1 * 10) / 10;


      if (fireTargetDefault == false) {

        this.cl({fireTargetDefault},'returnring')
        return false;
      }



      let PlacedReverseOrder=this.instruments.some(i => i.instrument_token === instrument_token && i.PlacedReverseOrder);

          if(PlacedReverseOrder){

            this.cl('placed reverse order');
            return false;
          }


          let livePosLen=this.livePositions.some(
          (lp) => lp.instrument_token == instrument_token
        );

if(!livePosLen){

  return false;
}
    
        let lot_size = Math.abs(quantity);
        let order_type = "LIMIT";

          
          await this.getOrders();

          let hasLiveTarget= this.liveOrders.some(
            (i) => i.instrument_token == instrument_token
          )

   

          if (hasLiveTarget == true || PlacedReverseOrder==true ) {
         
            return false;
          }
        
          let Price = targetPointLong;
          

          // let reverseOrder=true;
   
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



           await this.placeOrder(orderArray);

          this.$set(
            this.instruments.filter(
              (i) => i.instrument_token == instrument_token
            )[0],
            "PlacedReverseOrderType",
            "Target"
          );
     

      
     
   
   
    },

    otherCriteria(s, cis) {
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
          // this.cl('buy sell offers large diff or infinity ',cis.tradingsymbol,lpPc)
          // this.cl(b1bpc,'b1bpc')
          //  return false;
        }

        if (s.ohlc.open == s.ohlc.high) {
          // this.cl('open and high are same not buying',cis.tradingsymbol)

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
          // this.cl('open and high are same not buying',cis.tradingsymbol)
          return false;
        }

        if (s.ohlc.low <= s.last_price && s.ohlc.high >= s.last_price) {
          //verifying whether last price is in todays tick range  if failed no buying
       
          // this.cl('here4')
          // return false
        }

        if (s.ohlc.open > cis.pricePoints.yesterday.high) {
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

        //       if(s.ohlc.open<cis.pricePoints.yesterday.low)
        //       {

        // //i donet know why i puth this
        // this.cl('s.ohlc.open<cis.pricePoints.yesterday.low')

        //         return false;
        //       }

        try {
          if (
            cis.pricePoints.d1.range >
            cis.pricePoints.d2.range
          ) {
            // console.warn(cis.pricePoints.d1.range,
            // 'D1 range greater than',
            // cis.pricePoints.d2.range,' d2 range for :',
            // cis.tradingsymbol)

            let ob = {};
            ob.otherCriteriaCheck = false;
            ob.message = "d1 range> d2 range";
            return ob;

            return false;
          }
        } catch (e) {
          this.cl(e);

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

    hasAlreadyHitTargetBefore(element, cis, instrument_token) {
      let ts = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].tradingsymbol;

      let targetPointLong = cis.pricePoints.d1.high;

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

    hasAlreadyHitStopLossBefore(element, cis, instrument_token) {
      let ts = this.instruments.filter(
        (i) => i.instrument_token == instrument_token
      )[0].tradingsymbol;

      //  let last_price = element.depth.buy.sort((a, b) => b.price - a.price)[0]
      //             .price;

      let targetPointLong = cis.pricePoints.d1.low;

      //  this.cl('inside stop loss fn for  %s and stop low is %s and current price is %s '
      //  , cis.tradingsymbol,element.ohlc.low)

      if (element.ohlc.low <= targetPointLong) {
        return true;
      } else {
        return false;
      }
    },

  basicCheckers(element,cis,instrument_token,quantity,last_price ){

    let out={}
// this.cl(typeof  cis,'typeof cur instrument')

let ci=cis;
let ts=cis.tradingsymbol;
    if(typeof cis=='undefined' ){

      out.msg='cis undefined';
      out.bs=false;

      let tmp=JSON.stringify(instrument_token)

      this.updateMissingScriptInInstrumetsFile(tmp);
      return out;
// this.cl('issue inside bs @6683',ts )
//    
    }
      let inst=cis;

      if (cis.previousPrice != 0) {
          this.setcandleColour(inst, instrument_token);
        }

      if (cis.previousPrice == 0) {


      //   out.msg='cis.previousPrice';
      // out.bs=false
      // return out;
        // this.cl('issue inside bs pvs price 0 @6694')
          // this.cl("inst pvs price 0 line 3843");

          // this.cl('previos price issue',ts,)
          // return false;
        }

      // if (quantity == 0) {
      //       this.cl("quantity is zero returning line 3964");
      //       return;
      //     }

      if (typeof element == "undefined") {
        out.msg='element undefined';
      out.bs=false
      return out;

          // this.cl("element is not comming basic checkers 6705",ts);
          return false;
        }

   

        if(this.getLatestPricePoints(instrument_token)==false){


          out.msg='getLatestPricePoints false';
      out.bs=false
      return out;
    //       this.cl('latest price points issue @6717',ts)

    // return false;
             }


             this.setLiveScript(cis,last_price);



             out.msg='ok';
      out.bs=true;
      return out;

            //  return true;

    },


   
    stopLossTargetSwitch(quantity,last_price,high,low,bidPrice,offerPrice,cis,element,livePnlOffered){
       
      //stopLossSwitch
      //stoplossswitch
  //updateStopLossTarget





let lp=this.livePositions.find(i=>i.instrument_token==cis.instrument_token)



this.cl('inside stop loss switch fbefore return')
// console.log(lp);

// return;

let average_price=lp.average_price;

// let last_priceHere=


let qty=Math.abs(lp.quantity)

let livePnlHere=(last_price-average_price)*qty;
// return;


    let squareoffPrice1=(bidPrice+offerPrice)/2
    let squareoffPrice=squareoffPrice1.toFixed(1)




    let {stopLoss}=this.getAverageClosingValue(cis);




    let maxOfYdayTodayLow=last_price<=
Math.max(cis.pricePoints.d0.low,cis.pricePoints.d1.low);

let daySqOff=((this.hours==15) && (livePnlOffered>500) && false);


let quickProfit= (livePnlHere>500);



/// login last price less than yesterdays lows and todays opening price greater than yesterdays low this is to ensure that opening trade issues
let yesterDayLowStopLoss=(element.last_price<cis.pricePoints.d1.low && element.ohlc.open>cis.pricePoints.d1.low)


// this.cl(livePnlHere,'livePnlOffered');

// console.log({quickProfit})
// this.cl(quickProfit);


    // let exiPrice=

    // this.cl({livePnlOffered},cis.tradingsymbol)



    this.stopLossSwitchHealth=!this.stopLossSwitchHealth;

      switch (true) {


        case yesterDayLowStopLoss:

console.log('yesterDayLowStopLoss 5 sl at ',cis.tradingsymbol)

         this.updateSquareOfforderWithDesiredPrice(
           cis,
           element,
           false,
           last_price
         );
      


break;  



case daySqOff:

console.log('daySqOff 5 sl at ',cis.tradingsymbol)

         this.updateSquareOfforderWithDesiredPrice(
           cis,
           element,
           false,
           last_price
         );
      


break;


// case quickProfit:
// console.log('quickProfit  of %s for %s ',livePnlOffered,cis.tradingsymbol)

//          this.updateSquareOfforderWithDesiredPrice(
//            cis,
//            element,
//            false,
//            last_price
//          );

//   break;





        // case livePnlOffe<-500:
//         case (livePnlHere <- 500):

// console.log('-500 sl at ',cis.tradingsymbol)

//          this.updateSquareOfforderWithDesiredPrice(
//            cis,
//            element,
//            false,
//            last_price
//          );
      


// break;


//         case livePnlOffered<-2500:

// console.log('2500 sl at ',cis.tradingsymbol)

//          this.updateSquareOfforderWithDesiredPrice(
//            cis,
//            element,
//            false,
//            last_price
//          );
      


// break;




// case (element.last_price<=stopLoss):



// console.log('stopLoss sl at  for averagge stop loss @ %s for %s ',stopLoss,cis.tradingsymbol)

//          this.updateSquareOfforderWithDesiredPrice(
//            cis,
//            element,
//            false,
//            last_price
//          );
      


// break;






case (maxOfYdayTodayLow):


this.cl('sltrigger  trigger minimum of y day low todays low for  %s at squareoffPrice of %s',
cis.tradingsymbol,Math.max(cis.pricePoints.d0.low,cis.pricePoints.d1.low))
       

this.updateSquareOfforderWithDesiredPrice(
                   cis,
                   element,
                   false,
                   Math.max(cis.pricePoints.d0.low,cis.pricePoints.d1.low)
                 );
              

        break;








        case livePnlOffered>500 && false:

     


this.cl('1000 trigger')
        this.updateSquareOfforderWithDesiredPrice(
                   cis,
                   element,
                   false,
                   last_price
                 );
              

        break;



        // testForHasLivetarget
        case (this.hours==15 && this.minutes>10 && false):


        this.cl(
                   "Firing 15:10 square offf  order for %s bidprice is %s and high is %s ",
                   cis.tradingsymbol, bidPrice,
                   high
                 );

                 this.updateSquareOfforderWithDesiredPrice(
                   cis,
                   element,
                   false,
                   last_price
                 );
              

        break;
               




               case (quantity < 0 && last_price > high  && false):

              

               this.cl(
                  "Firing shortcover stop loss order for %s bidprice is %s and high is %s  and last price is %s",
                  cis.tradingsymbol,
                  offerPrice,
                   high,last_price
                 );
                 
                 this.updateSquareOfforderWithDesiredPrice(
                   cis,
                   element,
                   false,
                   squareoffPrice
                 );

                 break;

               case quantity > 0 && last_price < low && false:

                 this.cl(
                  "Firing long cover stop loss order for %s bidprice is %s and low  is %s  and last price is %s",
                  cis.tradingsymbol,
                  offerPrice,
                   low,last_price
                 );

                 //simple long covering
                //  this.updateSquareOfforderWithDesiredPrice(
                //    cis,
                //    element,
                //    false,
                //    offerPrice
                //  ); 
                 
                 this.updateSquareOfforderWithDesiredPrice(
                   cis,
                   element,
                   false,
                   squareoffPrice
                 );

                 break;

              
             }


    },

    proxyTradeExitProcedure(cis){
      if(this.proxyTrade==false){

        return 'PROXYTRADEFALSE'
      }
    

      if(typeof cis=='undefined'){

        this.cl('proxy cur instruy undefined')
        return "typeof cis=='undefined'";
      }

    
          let ppx=this.proxyPositions.filter(pp=>{ 
            return  pp.squaredOff==false &&
pp.instrument.instrument_token==cis.instrument_token 
});

if(ppx.length==0){

this.cl("pp1.length==0")
  return  "pp1.length==0"
}






switch(true){

  case (

cis.last_price>=cis.pricePoints.d1.rangeBreakOut


):


this.cl('case target ',cis.tradingsymbol)
this.proxyPositions.filter(pp1=>{ 

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==cis.instrument_token 



})[0].exitPrice=cis.last_price;

this.proxyPositions.filter(pp1=>{ 

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==cis.instrument_token 



})[0].exitType='target'



this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==cis.instrument_token 



})[0].squaredOff=true

break;



case (

cis.last_price<=cis.pricePoints.d1.low


):


this.cl('case sl ',cis.tradingsymbol)
this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==cis.instrument_token 



})[0].exitPrice=cis.last_price

this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==cis.instrument_token 



})[0].exitType='sl'



this.proxyPositions.filter(pp1=>{

  return  pp1.squaredOff==false &&
pp1.instrument.instrument_token==cis.instrument_token 



})[0].squaredOff=true




break;


default:


// this.cl('case default');

return 'default'

break;



}
return 'clean' ;




    


    },

    calculateMovingAverage(cis) {

      if(!cis){

        return false;
      }
  const { d1, d2, d3, d4, d5, d6, d7 } = cis.pricePoints;
  const sum = d1.close + d2.close + d3.close + d4.close + d5.close + d6.close + d7.close;
  return sum / 7;
},

isOpenLow(ohlc,cis,lp){


  // this.cl(lp,cis,ohlc,'inside isOpenLow');
  let {open,high,low,close}=ohlc;

let openLow=open==low;


let lossCheck= ((lp-low)*cis.lot_size)<1000

let hrsCheck=this.hours>=12;


if(openLow && lossCheck && hrsCheck){


  this.cl('for open low with 2500',cis.tradingsymbol)

  return true;

}else{


  return false;
}



},

getHighestOrdersPrice(sells) {

   let secondHighestOrdersPrice=-1;

  let highestOrdersPrice=-1;

  if(typeof sells =='undefined'){

    return {
      highestOrdersPrice,
      secondHighestOrdersPrice
    };
  }

  // this.cl('getHighestOrdersPrice 1')
    // Sort the array in descending order based on the "orders" property
    sells.sort((a, b) => b.orders - a.orders);
    // this.cl('getHighestOrdersPrice 2')
    // Get the price of the object with the highest orders
 highestOrdersPrice = sells[0].price;

    // Find the index of the first item with orders less than the highest orders
    let secondHighestOrdersIndex = sells.findIndex(sell => sell.orders < sells[0].orders);
    // this.cl('getHighestOrdersPrice 3')
    // If all items have the same number of orders, set the second highest orders index to -1
    if (secondHighestOrdersIndex === -1) {
      secondHighestOrdersIndex = sells.length;
    }

    // Get the price of the second highest orders item
    secondHighestOrdersPrice = sells[secondHighestOrdersIndex - 1].price;
    // this.cl('getHighestOrdersPrice 4')
    // Return an object with both prices
    return {
      highestOrdersPrice,
      secondHighestOrdersPrice
    };
  }
,


getLowestOrdersPrice(buys) {

// this.cl('insideget lowest order1')

  let secondLowestOrdersPrice=-1;

  let lowestOrdersPrice=-1;

  if(typeof buys =='undefined'){

    return {
      lowestOrdersPrice,
      secondLowestOrdersPrice
    };
  }

  // this.cl('insideget lowest order2')
  // this.cl('getHighestOrdersPrice 1')
    // Sort the array in acending order based on the "orders" property
    buys.sort((a, b) => b.quantity - a.quantity);


    // this.cl('getHighestOrdersPrice 2')
    // Get the price of the object with the highest orders
    lowestOrdersPrice = buys[0].price;


    // this.cl('insideget lowest order3',lowestOrdersPrice)
    // Find the index of the first item with orders less than the highest orders
    // let secondLowestOrdersIndex = sells.findIndex(buy => buy.orders < buys[0].orders);


    let  p=buys.filter(b=>b.price<lowestOrdersPrice ).map(a=>a.price);


      if (p.length==0){
        return {
      lowestOrdersPrice,
      secondLowestOrdersPrice
    };
        
      }

// console.log(p,'p')
   
      secondLowestOrdersPrice=Math.max(...p);
      // this.cl(p,'p',secondLowestOrdersPrice,'secondLowestOrdersPrice',lowestOrdersPrice,'lowestOrdersPrice')



   return  {
      lowestOrdersPrice,
      secondLowestOrdersPrice
    };
  }
,



    mutateWithLtp(s) {
//  return;
     
       this.heartBeatAndCurrentCheckDigit()


       if (this.hasStartedGetOrders || this.hasStartedGetLivePositions || this.refreshingTradeStatus) {
    return false;
  }
     
      s.forEach(async (element) => {

        if(!element || !element.instrument_token ){

          return false;
        }
        this.cl('inside s of mutate with  ltp');
        let last_price;
        let ohlc=element.ohlc;

        

        this.setD0WithCurrentDayOhlc(element);

        if(!element){

          return false;
        }

      

        this.cl('check point 3')

let instrument_token = element.instrument_token;

// this.cl(instrument_token)

// console.log(this.instruments.length)
let cis = this.instruments.filter(i => i.instrument_token == instrument_token)[0];
// this.cl(cis,'cis')
if(typeof cis=='undefined'){

  this.cl('cis undefined')

  return false;
}


this.cl('check point 4a')
this.currentTradingsymbol=cis.tradingsymbol


let lp1=element.last_price;
// this.isOpenLow(ohlc,cis,lp1);


// this.cl(element.depth.sell,'deph')


// let sells=element.depth.sell;




let ma=this. calculateMovingAverage(cis);


 let ep=ma;
 let exit=element.ohlc.high*1.1;






if (!cis) {
  this.cl('cur instru type undefined frpn s so i am return nign false @7071', instrument_token);
  return false;
}
             
    
this.cl('check[ point 3]')

        last_price=element.last_price;

this.setPreviousPriceAndLastPrice(instrument_token,last_price);

let {msg,bs}= this.basicCheckers(element,cis,instrument_token,last_price);



if(bs==false){

  if(!msg=='cis.previousPrice'){

    this.cl('basic cehckes issue',cis.tradingsymbol,instrument_token,cis.last_price,cis.previousPrice,msg)
  }
 return false
}


this.cl('checkpoint 4c');
          
        let hasLivetargetFromcis=cis.hasLiveTarget;
   let hasLivePositionFromcis=cis.hasLivePosition;

 this.cl('here after haslivepos')
        if ( hasLivePositionFromcis==true) {                            



          let lpCurrent=this.livePositions.find(
            (lp) => lp.instrument_token == cis.instrument_token
          );

let ln1=this.livePositions.some(
            (lp) => lp.instrument_token == cis.instrument_token
          )
          let average_price=-1

          if(lpCurrent){

            average_price=lpCurrent.average_price;

          }else{

            
            this.cl('avaerage price not defined for',cis.tradingsymbol)
            average_price=cis.pricePoints.d1.high;

          }
          let tradingsymbol=cis.tradingsymbol;
          this.currentTradingsymbolAverage={instrument_token,tradingsymbol,average_price}

          // console.log(this.currentTradingsymbolAverage);


          if(!ln1){


          this.cl('live postition for script is zero')

           return false;
          }

          let {bidPrice,offerPrice,count,stopLoss, target, lstPrice,livePnlOffered,quantity 
           }= await  this.setTargetPricesBasedOnQuantity(cis,element,low,high,instrument_token)
         

        
         

     



var {high,low}=cis.pricePoints.d1;
          

let hasLiveTarget;
          if (count > 0) {
            hasLiveTarget = true;
          } else if (count==0) {
            hasLiveTarget = false;
          }


                        //there is a live position

          //check whether already a reverse order placed


         


let PlacedReverseOrder = this.instruments.find(
            (i) => i.instrument_token == instrument_token
          ).PlacedReverseOrder;


        
         
          if (hasLivePositionFromcis== true && 
           hasLivetargetFromcis == true) {

                     
           
      


              // console.log(livePnlOffered,'livePnlOffered',cis.tradingsymbol)


              this.stopLossTargetSwitch(quantity,last_price,high,
              low,bidPrice,
              offerPrice,cis,element,livePnlOffered)
             
       

                       //return false;
          } else /// no live target or palced reverse order
          
          {
            //think about placing a reverse order 

            //check thoroughly 
            
            let lnLive=this.liveOrders.some(lo=>lo.instrument_token==instrument_token)
        //  this.cl('talakalam onnum cheyyunilla no reverse order placed evide etthiyittum')


         if (!lnLive) {

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




        if (cis.enterNowToTrade == false) {


          // this.cl('inside trade entry ')

//  this.cl('inside trade entry ');
let inst=cis;

let isHigherLows=this.higherLowsCheck(cis);



if(!isHigherLows){

  return false
}




if(this.hours<10){

  this.cl('no buying  before 10 am');

  return;
}
this.tradeEntry(instrument_token,inst,cis,element) 

// return ;
       
        }

     ///already palced order .... so check whte there is live position



        
      
      });
    },

    higherLowsCheck(cis) {

// console.log('from fn')
const pricePoints = cis.pricePoints;



this.cl('d0',cis.pricePoints.d0.normalDate)
this.cl('d1',cis.pricePoints.d1.normalDate)
this.cl('d2',cis.pricePoints.d2.normalDate)
let {d0,d1,d2,d3,d4,d5,d6,d7}=pricePoints;

if(
d1.low>d2.low &&
d0.low>d1.low

// &&
// d3.low>d4.low 


){

return true
}else{


return false;
}




},

    setInstrumentTokens() {

  //  console.log('inside set instrument token')
// this.cl('inside set instrument tokens');
    
      return new Promise((res, rej) => {

          this.instrumentTokens = this.hourlyPricePointsofLiveDay.map((i) =>
          parseInt(i.instrument_token)
        );


        let j=JSON.stringify(this.instrumentTokens);

        socket.emit("subscribe-orders", j);

        // console.log('inside set instrument token',j)
        // this.cl(j);
        res(true);
           return;
   

        
      });
    },

    mutateOrdersWithLtp(s) {
      s.forEach((element) => {

        this.cl('inside s of mutate with  ltp')
        if (typeof element == "undefined") {
          this.cl("element is not comming");
          return false;
        }
        let instrument_token = element.instrument_token;
        let last_price = element.last_price;
        let average_price = element.average_price;

        this.cl(
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
        // this.cl("calling hourly candles");
        // if (this.livePositions.length > 0) {
        // this.getHourlyCandleLows();
        // }
      }
    },
  },

  data() {
    return {
      stopLossSwitchHealth:false,
      tradeEntrySwitchHealth:false,
      columns: [
        {
          label: "Symbol",
          field: "tradingsymbol",
        },
        {
          label: "Buy Price",
          field: "buyPrice",
          type: "number",
          sortable: true,
        },
        {
          label: "Buy Time",
          field: "buyTime",
          sortable: true,
        },
        {
          label: "Sell Price",
          field: "sellPrice",
          type: "number",
          sortable: true,
        },
        {
          label: "Sell Time",
          field: "sellTime",
          sortable: true,
        },
        {
          label: "Profit/Loss",
          field: "profit",
          type: "number",
          sortable: true,
        },
      ],
      executedTrades:[],
      currentTradingsymbol:'',
      currentTradingsymbolAverage:-1,

      newTradingObj : {
    tradingsymbol: '',
    buyPrice: 0,
    sellPrice: 0,
    pnl: 0,
    strategy: '',
    hasTargetHit: false,
    hasStopLossHit: false,
    hasCycleCompleted: false,
    targetPrice: 0,
    stopLossPrice: 0,
    buyTime: '',
    sellTime: '',
    typeOfsquareOff: ''
},


      scriptsWithConditionGain:-1,
      scriptsWithCondition:[],
      instances: [],
      showLogs:true,
      globalConsoleLogs:[],
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
      ciss: [],
      displayingInstruments: [],
      instruments: [],
      ohlc: [],
    }
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