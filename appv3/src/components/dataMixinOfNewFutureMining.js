import Vue from 'vue';
var dataMixin=
{

    data() { 
        return { 
          instruAll:[],
          ohlcData:[],
          allPositions:[],
          exitNow:false,
          viewLogs:false,
          logs: [],
          tradeEntryFlowStatus:'Ticker not Started 0',
          missingScriptUpdating:false,
          stopLossSwitchHealth:false,
          tradeEntrySwitchHealth:false,
          columns: [
            { 
              label: "Symbol",
              field: "tradingsymbol",
             } ,
            { 
              label: "Buy Price",
              field: "buyPrice",
              type: "number",
              sortable: true,
             } ,
            { 
              label: "Buy Time",
              field: "buyTime",
              sortable: true,
             } ,
            { 
              label: "Sell Price",
              field: "sellPrice",
              type: "number",
              sortable: true,
             } ,
            { 
              label: "Sell Time",
              field: "sellTime",
              sortable: true,
             } ,
            { 
              label: "Profit/Loss",
              field: "profit",
              type: "number",
              sortable: true,
             } ,
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
     } ,
    
    
          scriptsWithConditionGain:-1,
          scriptsWithCondition:[],
          instances: [],
          showLogs:true,
          globalConsoleLogs:[],
          nifty:-1,
    
          banknifty:-1,
          convertIsoDateToISTResultChild:'',
          getReverseOrderAndHasLiveTargetStatusForChildResult:{  } ,
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
          previousOrderUpdate:{  } ,
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
          ciss: [],
          displayingInstruments: [],
          instruments: [],
          ohlc: [],
         } 
       } ,

}

export default dataMixin;