<template>
  <v-container fluid>
    <NetworkStatus />
    <v-alert
    v-if="flashMessage"
      color="primary"
    
    
    >

    {{ flashMessage}}
    </v-alert>

    <v-alert
    v-if="placingReverseOrderInProgress"
    
    title="Placing Reverse Orders"
    type="success"
  >
  Placing Reverse Orders
</v-alert>
 
    <v-system-bar class="mb-5 mt-15 pa-5">



      <ProfitAndLossView :totalpnl="totalpnl"  class="pa-5" :closedTradesScriptsPnl="closedTradesScriptsPnl" />
<h/>
<DigitCheckerForWebsocketHealth  class="pa-5" :CurrentCheckDigit="CurrentCheckDigit" :laggingCheckDigit="laggingCheckDigit" :webSocketNotActive="webSocketNotActive" />
<HeartBeatIcon :heartBeat="heartBeat" />

<softwareFlowStatus :tradeEntryFlowStatus="tradeEntryFlowStatus" />
      <h />
      </v-system-bar>

    <v-system-bar class="mb-5 mt-15 pa-5">
      
      
      <TotalInstruments :instruments="instruments" />
      <h />
      <MarginView v-if="liveMargin !== -1" :totalOptionPrice="totalOptionPrice" :liveMargin="liveMargin" />
      <h />
      <stopLossHealthIcon :stopLossSwitchHealth="stopLossSwitchHealth" />
      <h />
          <MarketConnectionHelthIcon :tradeEntrySwitchHealth="tradeEntrySwitchHealth" />
          <h />
          <TradeCostAndBalnceInfo :livePositionTotalCost="livePositionTotalCost" :liveBuyOrderAmount="liveBuyOrderAmount" :liveTradablebalance="liveTradablebalance" />


          <Clock :hours="hours" :minutes="minutes" :seconds="seconds" />

          <ForGoneProfitData :totalForgone="totalForgone" :totalForgoneFortarget="totalForgoneFortarget" :totalForgoneForStopLoss="totalForgoneForStopLoss" />

  <v-icon icon="mdi-wifi-strength-4"></v-icon>
  <v-icon icon="mdi-signal" class="ms-2">

    
  </v-icon>
  <v-icon icon="mdi-battery" class="ms-2"></v-icon>

 

</v-system-bar>

<v-row>
  <v-col cols="12">
    <minuteCandleAnalysis :instruments="instruments" />


  </v-col>
</v-row>

    <v-row>
      <v-col cols="7">
        <div class="section">
<v-row>
          <v-col cols="3">
            <label>

              

<input type="checkbox" v-model="showLogs">
Show logs
</label>
            <v-btn class="btn-primary">Toggle View Logs</v-btn>
          
            
          
      
          <stopLossTradeEntrySwitchHealth v-if="instruments.length !== 0 && instruments[0] && instruments[0].pricePoints && instruments[0].pricePoints.d1" :stopLossSwitchHealth="stopLossSwitchHealth" :tradeEntrySwitchHealth="tradeEntrySwitchHealth" />
      
            <TelegramStatus :chat_id="chat_id" />
           

          </v-col>
          <v-col cols="3">

           
         
         <LiveOrders :liveOrders="liveOrders" />
       <button @click="openWindow()">View Logs</button>
          </v-col>

          <v-col cols="2">
            <MaxTradableAmount :maxTradableAmount="maxTradableAmount" />


          </v-col>
        </v-row>
        </div>
      </v-col>
      <v-col cols="12">
        <div class="section">
         
         
          
        </div>
      </v-col>
    </v-row>
    <!-- <v-row>
      <v-col cols="6">
        <div class="section">
          </div>
      </v-col>
      <v-col cols="6">
        <div class="section">
        
        </div>
      </v-col>
    </v-row> -->

    <TrailingStopLossButton :trailingStopLossWithLtp="trailingStopLossWithLtp" />
    <v-row>
      <v-col cols="6">
        <div class="section">
          <v-alert>


            

                 <v-btn v-if="!AutoMode" @click="AutoMode = true" title="Switch to Auto" icon color="green">
              <v-icon>mdi-send-clock-outline</v-icon>
            </v-btn>
            <v-btn v-if="AutoMode" @click="AutoMode = false" title=" Switch to Manual" icon color="red">
              <v-icon>mdi-send-lock</v-icon>
            </v-btn>
          </v-alert>
          <v-btn color="red" prominent @click="exitPositions()">Exit all</v-btn>
          <DialogForAlerts :dialog="dialog" :alerts="alerts" />
          <v-btn color="green" @click="placeTargetsForLiveScripts('ho')">PLACE TARGETS FOR LIVE SCRIPTS</v-btn>
          <v-btn @click="forceUpdateMissingScripts()">Force update Missing scripts</v-btn>
          <v-alert v-if="loadingHourlyTradingLows" type="info">Loaiding Hourly candles</v-alert>
          <v-row>
            <v-col>
              <label>Force Manual reverseOrder</label>
              <input type="checkbox" v-model="manualReverseOrder" @change="forceManualReverseOrder">
            </v-col>
          </v-row>
          <ViewHourlyPricePointsOfLiveDay :hourlyPricePointsofLiveDay="hourlyPricePointsofLiveDay" :convertIsoDateToIST="convertIsoDateToIST" />
          <v-btn @click="showModalForSquareOff()">square off selected</v-btn>
          <button @click="review()">review</button>
          <v-btn @click="getOrders()">Refresh orders</v-btn>
          <v-btn @click="refreshTradeStatus()">Refresh trade status</v-btn>
          {{ instrumentsFiltered.length }} out of {{ instrumentTokens.length }}
        </div>
      </v-col>
      <v-col cols="6">
        <div class="section">
          <h1 class="text-success">Positions</h1>
          <LivePos @convertIsoDateToIST="convertIsoDateToISTChild"
           :convertIsoDateToISTResult="convertIsoDateToISTResultChild"
            @getReverseOrderAndHasLiveTargetStatusForChild="getReverseOrderAndHasLiveTargetStatusForChild"
             :getReverseOrderAndHasLiveTargetStatusForChildResult="getReverseOrderAndHasLiveTargetStatusForChildResult"
              @getStopLossFromChild="getStopLossFromChild" :livePositionsDisplay="livePositionsDisplay" 
              :getStopLossResult="stopLossForChild" />
          
          <InstrumentsAndActions :instrumentsFiltered="instrumentsFiltered" :changeBuyingMethod="changeBuyingMethod" :buyingPoint="buyingPoint" :noTradingNow="noTradingNow" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
 import NetworkStatus from './NetworkStatus.vue';
import NewFutureMining from './NewFutureMining.js'
import h from './h.vue'
import dataMixin from './dataMixinOfNewFutureMining.js'
import placeTargetsForLiveScripts from './placeTargetsForLiveScripts';

export default {
    mixins: [dataMixin,NewFutureMining,placeTargetsForLiveScripts],
    data() {
        return {

          flashMessage:'NOT SHOWING ANYTHING'
        // Your data properties here
        };
    },
    methods: {
        // Your methods here
        exitPositions() {
            // Define the exitPositions method if not already defined
        }
    },
    components: { h,NetworkStatus }
}
</script>

<style scoped>
.section {
  height:400px; /* Adjust height as needed */
  overflow-y: auto;
}
</style>
