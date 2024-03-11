const mar = function checkMarubozo(element) {
  element.ohlc === element.ohlc.low &&
    (element.last_price * 1.1 <= element.ohlc.high || element.last_price === element.ohlc.high) &&
    this.hours >= 14;

  if (mar) {
    this.cl('MARUBOZU CANDLE FOR', cis.tradingsymbol);
  }
}

const mutateWithLtp = {
    methods: {
      async mutateWithLtp(s) {


        if(this.seconds!=58){


          this.cl('not 58')
          return ;
        }else{
          this.cl('yes its  58')

        }


       /*  if(!this.seconds<== ){

          //return;

        } */
        this.heartBeatAndCurrentCheckDigit();

  
        if (this.hasStartedGetOrders || this.hasStartedGetLivePositions || this.refreshingTradeStatus) {
          this.tradeEntryFlowStatus = 'updating various status on Mount 1';
          this.cl('UPDATING VARIOS STATUS  ... NO TRADE TIME');
          return false;
        }

      //  console.log(s);
        for (let element of s) {

                  // console.log(element)
          if (!element || !element.instrument_token) {
            this.tradeEntryFlowStatus = 'Element null 4';

            this.cl('ELEMENET EMPTY');
            
            return false;
          }
  
          

          this.tradeEntryFlowStatus = 'Inside mutate with ltp 3';
          const instrument_token = element.instrument_token;
         
         

          
          let cis = this.instruments.find(i => i.instrument_token == instrument_token);

          
  
          if (typeof cis == 'undefined') {
            // console.log(this.instruments,instrument_token,'42',cis)
            this.tradeEntryFlowStatus = 'CIS undefined 5';
            this.cl('CIS ELEMENT NOT FOUND ISSUE QUITING THIS TICK',instrument_token)
            await this.updateMissingScriptInInstrumetsFile(JSON.stringify([instrument_token]));
            return false;
          }
  //  checkMaru
       
  // checkMarubozo(element)
  
          this.currentTradingsymbol = cis.tradingsymbol;
          const lp1 = element.last_price;
  
          let ma = this.calculateMovingAverage(cis);
          let ep = ma;
          let exit = element.ohlc.high * 1.1;
  
          if (!cis) {
            this.tradeEntryFlowStatus = 'CIS undefined 6';
            this.cl('cur instru type undefined frpn s so I am return nign false @7071', instrument_token);
            return false;
          }
  
          this.$set(cis,'tick',element)

          //console.log(cis.tradingsymbol,cis.tick);
          const last_price = element.last_price;
          this.setPreviousPriceAndLastPrice(instrument_token, last_price);
  



          //// NOT REQUIRED SINCE BASIC CHECKERS USES EVERTY THING EXCEPT UPDATING INSTRUMENTS FILE
          // const { msg, bs } = this.basicCheckers(element, cis, instrument_token, last_price);
  
          // if (!bs) {
          //   this.tradeEntryFlowStatus = 'BASIC CHECKERS FALSE 6';
          //   if (msg !== 'cis.previousPrice') {
          //     this.cl('basic cehckes issue', cis.tradingsymbol, instrument_token, cis.last_price, cis.previousPrice, msg);
          //   }
          //   return false;
          // }
  
          let livePosObject = this.livePositions.find(lp => lp.instrument_token === instrument_token);
          let liveOrderObj = this.liveOrders.find(lo => lo.instrument_token === instrument_token);
  
          if (livePosObject !== undefined && liveOrderObj !== undefined) {
            this.$set(this.instruments.find(i => i.instrument_token === instrument_token), 'hasLivePosition', true);
            this.$set(this.instruments.find(i => i.instrument_token === instrument_token), 'hasLiveTarget', true);
            this.cl('SETTING OF LIVE TARGET LIVE POS');
          }
  
          let hasLivetargetFromcis = cis.hasLiveTarget;
          let hasLivePositionFromcis = cis.hasLivePosition;
  
          this.tradeEntryFlowStatus = 'HAS LIVE POSITION CHECK 7';
  
          if (hasLivePositionFromcis) {
            let lpCurrent = this.livePositions.find(lp => lp.instrument_token === cis.instrument_token);
  
            let average_price = -1;
  
            if (typeof lpCurrent !== 'undefined') {
              average_price = lpCurrent.quantity < 0 ? lpCurrent.sell_price : lpCurrent.buy_price;
            } else {
              this.cl('avaerage price not defined for', cis.tradingsymbol);
              average_price = cis.pricePoints.d1.high;
            }
  
            let tradingsymbol = cis.tradingsymbol;
            this.currentTradingsymbolAverage = { instrument_token, tradingsymbol, average_price };
  
            if (!this.livePositions.some(lp => lp.instrument_token === cis.instrument_token)) {
              this.cl('live postition for script is zero');
              return false;
            }
  
            let { bidPrice, offerPrice, count, stopLoss, target, lstPrice, livePnlOffered, quantity } =
              await this.setTargetPricesBasedOnQuantity(cis, element, low, high, instrument_token);
  
            let { high, low } = cis.pricePoints.d1;
  
            let hasLiveTarget = count > 0;
  
            let PlacedReverseOrder = this.instruments.find(i => i.instrument_token === instrument_token).PlacedReverseOrder;
  
            if (hasLivePositionFromcis && hasLivetargetFromcis) {
              this.stopLossTargetSwitch(quantity, last_price, high, low, bidPrice, offerPrice, cis, element, livePnlOffered, lpCurrent);
            } else {
              this.cl('NO LIVE TARGETS FOR ', cis.tradingsymbol);
  
              let lnLive = this.liveOrders.some(lo => lo.instrument_token === instrument_token);
  
              if (!lnLive) {
                if (PlacedReverseOrder !== true && hasLiveTarget !== true) {
                  this.cl('iam return ning false @7217');
                  if (this.manualReverseOrderStart === true) {
                    // let out  = await this.placeTargetsForSingleScript(instrument_token, quantity);
                  }
                  return false;
                }
              }
            }
          }
  
         this.cl('element here 142 from mutate with ltp mixin');
          if (cis.enterNowToTrade === false) {
            this.tradeEntryFlowStatus = 'INSIDE ENTER NOW TO TRADE 8';
            let inst = cis;
            
            // let isHigherLows = this.higherLowsCheck(cis);
  
            // if (!isHigherLows) {
            //   this.tradeEntryFlowStatus = 'HIGHER LOW CHECK FALSE 9';
            //   return false;
            // }
  
            // if (!(this.hours > 9 || (this.hours === 9 && this.minutes > 15))) {
            //   this.tradeEntryFlowStatus = 'LESS THAN 10 HOURS NO TRADE ZONE 10';
            //   this.cl('NO TRADING TIME');
            //   return;
            // }
  

            this.cl('BEFORE TRADE ENTRY MUTATE');
             this.tradeEntry(instrument_token, inst, cis, element);
          }
        }
      },
      mounted() {
        console.log('hello from mutate with ltp mixin mixin!');
      },
    },
  };
  
  export default mutateWithLtp;
  