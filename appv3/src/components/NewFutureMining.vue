<template>
  <div>

    <v-btn color = "red" prominent @click = "exitPositions()"> Exit all</v-btn>

    <!-- <sideWiseAlerts :checkSidewaysMovementTime="checkSidewaysMovementTime" /> -->

    
    <MarginView  v-if="liveMargin!=-1" :totalOptionPrice="totalOptionPrice" :liveMargin="liveMargin" />

    <!-- <button @click = "downloadLogs">Download Logs</button> -->
    <button @click = "openWindow()">View Logs</button>
    <!-- <a :href = "logFileUrl" target = "_blank" v-if = "logFileUrl">View Logs</a> -->
    <button class = "btn-primary" > toggle  view logs</button>
   
   
    <!-- <LogsView :logs="logs" :viewLogs="viewLogs" /> -->

<!-- {{ instruments[0].minuteCandle.data}} -->
    
    <minuteCandleAnalysis :instruments="instruments" />

   <!--  <InstrumentsStatusView :instruments="instruments"></InstrumentsStatusView> -->
   
   <TotalInstruments :instruments="instruments" />
   
   

  <softwareFlowStatus :tradeEntryFlowStatus="tradeEntryFlowStatus" />

    

    <v-row v-if = "instruments.length!= 0 && instruments[0] && 
    instruments[0].pricePoints &&
    instruments[0].pricePoints.d1">
      <DoD1Dates :instruments="instruments" />

      <stopLossTradeEntrySwitchHealth :stopLossSwitchHealth="stopLossSwitchHealth" :tradeEntrySwitchHealth="tradeEntrySwitchHealth" />
  
    </v-row>


    <v-row>
      <stopLossHealthIcon :stopLossSwitchHealth="stopLossSwitchHealth" />


     <MarketConnectionHelthIcon :tradeEntrySwitchHealth="tradeEntrySwitchHealth" />

        <HeartBeatIcon :heartBeat="heartBeat" />
    </v-row>




    {{ globalConsoleLogs.length }} globalConsoleLogs
   


    <v-alert >


  




<!-- <IndicesTable :indices = "indices"></IndicesTable> -->





<label>
      <input type = "checkbox" v-model = "showLogs">
      Show logs
    </label>
<!-- <IronCondor :instruments = "instruments"></IronCondor> -->





     
<DigitCheckerForWebsocketHealth :CurrentCheckDigit="CurrentCheckDigit" :laggingCheckDigit="laggingCheckDigit" :webSocketNotActive="webSocketNotActive" />

    <TrailingStopLossButton :trailingStopLossWithLtp="trailingStopLossWithLtp" />

    <v-row class = "mt-1">
      <v-col>
        <TradeCostAndBalnceInfo :livePositionTotalCost="livePositionTotalCost" :liveBuyOrderAmount="liveBuyOrderAmount" :liveTradablebalance="liveTradablebalance" />
      </v-col>
      <v-col>

<v-icon>

</v-icon>


     
      </v-col>
      <TelegramStatus :chat_id="chat_id" />

      <Clock :hours="hours" :minutes="minutes" :seconds="seconds" />

      <v-col>
        <v-btn
          @clck = "resetUserMessages()"
          small
          color = "red"
          title = "reset user messages"
        >
          <v-icon>mdi-power-cycle</v-icon>
        </v-btn>
        
        </v-col
      >

      <MaxTradableAmount :maxTradableAmount="maxTradableAmount" />

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

    <div class = "col" style = "height: 300px; overflow: auto">
        <v-btn @click = "getLatestPricesOfClosedScripts()"
          >get latest prices</v-btn
        >
        Closed Trades
        <ProfitAndLossOfClosedPositions :closedTradesScriptsPnl="closedTradesScriptsPnl" />

        Total :{{  closedTradesScripts.length  }} 
        <ClosedTrades :closedTradesScripts = "closedTradesScripts"></ClosedTrades>
      </div>
    </v-alert>








<Margin @margin-updated = "marginUpdated"></Margin>

<div>




</div>


<DialogForAlerts :dialog="dialog" :alerts="alerts" />

<v-btn color = "green"

@click = "placeTargetsForLiveScripts()"
>PLACE TARGETS FOR LIVE SCRIPTS</v-btn>


<v-btn @click = "forceUpdateMissingScripts()">Force update Missing scripts</v-btn>
   


    <v-alert v-if = "loadingHourlyTradingLows" type = "info">
      Loaiding Hourly candles
    </v-alert>
   
    <ForGoneProfitData :totalForgone="totalForgone" :totalForgoneFortarget="totalForgoneFortarget" :totalForgoneForStopLoss="totalForgoneForStopLoss" />

   




<v-row>
  <v-col>
    Force Manual reverseOrder

    {{ manualReverseOrder }} 
<input type = "checkbox"
@change = "forceManualReverseOrder" v-model = "manualReverseOrder" 
 >

  </v-col>
</v-row>







    <ViewHourlyPricePointsOfLiveDay :hourlyPricePointsofLiveDay="hourlyPricePointsofLiveDay" :convertIsoDateToIST="convertIsoDateToIST" />

  

    <v-btn @click = "showModalForSquareOff()">
      square off selected
      <v-icon></v-icon>
    </v-btn>

    <button @click = "review()">review</button>

    <v-btn @click = "getOrders()">Refresh orders</v-btn>
    <v-btn @click = "refreshTradeStatus()">Refresh trade status</v-btn>

   


    {{  instrumentsFiltered.length  }}  out of {{  instrumentTokens.length  }} 



    <div class = "row">
      <div class = "col offset">
       <h1 class = "text-success">Positions</h1> 


       <ProfitAndLossView
       
       
       :totalpnl="totalpnl" :closedTradesScriptsPnl="closedTradesScriptsPnl" />
        <!-- <table class = "table" v-if = "livePositions.length > 0"> -->

<div class = "row">
  <div class = "col-10">
   
    <LivePos


    @convertIsoDateToIST = "convertIsoDateToISTChild"
    :convertIsoDateToISTResult = "convertIsoDateToISTResultChild"
@getReverseOrderAndHasLiveTargetStatusForChild = "getReverseOrderAndHasLiveTargetStatusForChild"
:getReverseOrderAndHasLiveTargetStatusForChildResult = "getReverseOrderAndHasLiveTargetStatusForChildResult"

    @getStopLossFromChild = "getStopLossFromChild"
    
    :livePositionsDisplay = "livePositionsDisplay"
    :getStopLossResult = "stopLossForChild"
    ></LivePos>
  </div>
  <div class = "col-2">
  
    <LiveOrders 
    
    
    :liveOrders = "liveOrders"></LiveOrders>
  </div>
</div>


<InstrumentsAndActions :instrumentsFiltered="instrumentsFiltered" :changeBuyingMethod="changeBuyingMethod" :buyingPoint="buyingPoint" :enterNowToTrade="enterNowToTrade" />



       
        <hr />

        <!-- {{ livePositions }}  -->
      </div>
    </div>

   
  </div>
</template>

<script>

import NewFutureMining from './NewFutureMining.js'
    export default {
        mixins: [NewFutureMining],
    }
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