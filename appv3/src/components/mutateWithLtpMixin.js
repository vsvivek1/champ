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

     async stopLossprocedure(instrument_token,tradingsymbol,cis,element,hasLivePositionFromcis,last_price) {

   // console.log('from stop loss procedure ');
        //return ;  // have to write stop loss here switch
        let lpCurrent = this.livePositions.find(lp => lp.instrument_token == instrument_token);

       // console.log(lpCurrent,'current position')
        let average_price = -1;

        if (typeof lpCurrent=='undefined') {

          //this.cl('avaerage price not defined for', cis.tradingsymbol);
          average_price = cis.pricePoints.d1.high;
       
       
        } else {

         // console.log(lpCurrent,'lpcurrent')
          average_price = lpCurrent.quantity < 0 ? lpCurrent.sell_price : lpCurrent.buy_price;

        }

       
        this.currentTradingsymbolAverage = { instrument_token, tradingsymbol, average_price };

        if (!this.livePositions.some(lp => lp.instrument_token == cis.instrument_token)) {
         // this.cl('live postition for script is zero');
          return false;
        }

        

        let { high, low } = cis.pricePoints.d1;
        let { bidPrice, offerPrice, count, stopLoss, target, lstPrice, livePnlOffered, quantity } =
          await this.setTargetPricesBasedOnQuantity(cis, element, low, high, instrument_token);

        let hasLiveTarget = count > 0;

        let PlacedReverseOrder = this.instruments.find(i => i.instrument_token == instrument_token).PlacedReverseOrder;


        let hasLivetargetFromcis=cis.hasLiveTarget
      
       
        if (hasLivePositionFromcis && hasLivetargetFromcis) {

          ////proceed for stop losss 
          this.stopLossTargetSwitch(quantity, last_price, high, low, bidPrice, offerPrice, cis, element, livePnlOffered, lpCurrent);
        } else {



          this.cl('NO LIVE TARGETS FOR ', cis.tradingsymbol);

          let lnLive = this.liveOrders.some(lo => lo.instrument_token == instrument_token);

          if (!lnLive) {
            if (PlacedReverseOrder != true && hasLiveTarget != true) {
              this.cl('iam return ning false @7217 means no live targets');
              if (this.manualReverseOrderStart == true) {
                // let out  = await this.placeTargetsForSingleScript(instrument_token, quantity);
              }
              return false;
            }
          }
        }
    },
      setLiveTargetAndPosition(instrument_token, livePosObject, liveOrderObj) {
        if (typeof livePosObject != undefined && typeof liveOrderObj != undefined) {
            const instrumentToUpdate = this.instruments.find(i => i.instrument_token == instrument_token);
            if (instrumentToUpdate) {
                this.$set(instrumentToUpdate, 'hasLivePosition', true);
                this.$set(instrumentToUpdate, 'hasLiveTarget', true);
                this.$set(instrumentToUpdate, 'liveOrder', liveOrderObj);
                this.$set(instrumentToUpdate, 'livePosition', livePosObject);
                this.cl('SETTING OF LIVE TARGET LIVE POS');
            } else {
                this.cl('Instrument not found for token: ' + instrument_token);
            }
        } else {
            const instrumentToUpdate = this.instruments.find(i => i.instrument_token == instrument_token);
            if (instrumentToUpdate) {
                this.$set(instrumentToUpdate, 'hasLivePosition', false);
                this.$set(instrumentToUpdate, 'hasLiveTarget', false);
                this.$set(instrumentToUpdate, 'liveOrder', null);
                this.$set(instrumentToUpdate, 'livePosition', null);
            }
            this.cl('Live position or live order is not defined.');
        }
    },

      setPreviousPriceAndLastPrice( instrument_token,last_price ){ 



        try { 
          
                if( isNaN( instrument_token )){ 
          
          
                  this.cl( 'is nan issue instriment token in setprevios and last price' )
                  return  false;
                 } 
          
                if( this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     ).length == 0 ){ 
          
                      this.cl( 'is nan issue instriment token in setprevios and last price' )
          
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
                  

                   this.$set( 
                    this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     )[0],
          
                    "previous_last",
                              this.instruments.filter( 
                      ( i )  => i.instrument_token  ==  instrument_token
                     )[0].last_price
                   );
        
                  this.instruments.filter( 
                    ( i )  => i.instrument_token  ==  instrument_token
                   )[0].last_price = last_price;
                
          
          
               
          
                  return true;
         }  catch ( error ) { 
          
        
          this.cl( error,'error of set previos price' );
        
          return false
         } 
        
        
             } ,
      async mutateWithLtp(s) {

        this.heartBeatAndCurrentCheckDigit();
        if(this.seconds%3!=0){


         //this.cl('not 58')
          //return ;
        }else{
         // this.cl('yes its  58')

        }


       /*  if(!this.seconds<== ){

          //return;

        } */
        

  
        if (this.hasStartedGetOrders || this.hasStartedGetLivePositions || this.refreshingTradeStatus) {
          this.tradeEntryFlowStatus = 'updating various status on Mount 1';
          //this.cl('UPDATING VARIOS STATUS  ... NO TRADE TIME');
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

          let tradingsymbol = cis.tradingsymbol;
  //  checkMaru
       
  // checkMarubozo(element)

          this.currentTradingsymbol = cis.tradingsymbol;
          const lp1 = element.last_price;

          
  
          let ma = this.calculateMovingAverage(cis);
this.$set(cis,'movingAverage',ma)
          let ep = ma;
          let exit = element.ohlc.high * 1.1;
  
         
  
          this.$set(cis,'tick',element)

          //console.log(cis.tradingsymbol,cis.tick);
          const last_price = element.last_price;
          if(!this.setPreviousPriceAndLastPrice(instrument_token, last_price))
          {

            this.tradeEntryFlowStatus='Some issue with setting last price and previos last price'
            return false;
          }
          
          
  



          //// NOT REQUIRED SINCE BASIC CHECKERS USES EVERTY THING EXCEPT UPDATING INSTRUMENTS FILE
          // const { msg, bs } = this.basicCheckers(element, cis, instrument_token, last_price);
  
          // if (!bs) {
          //   this.tradeEntryFlowStatus = 'BASIC CHECKERS FALSE 6';
          //   if (msg !== 'cis.previousPrice') {
          //     this.cl('basic cehckes issue', cis.tradingsymbol, instrument_token, cis.last_price, cis.previousPrice, msg);
          //   }
          //   return false;
          // }
  
  
          if (typeof livePosObject != 'undefined' && typeof liveOrderObj != 'undefined') {
        this.setLiveTargetAndPosition(instrument_token, livePosObject, liveOrderObj);
          }

        
          let hasLivetargetFromcis = cis.hasLiveTarget;
          let hasLivePositionFromcis = cis.hasLivePosition;
  
          this.tradeEntryFlowStatus = 'HAS LIVE POSITION CHECK 7';
  
          if (hasLivePositionFromcis) {

         this.stopLossprocedure(instrument_token,tradingsymbol,cis,element,hasLivePositionFromcis,last_price);
          }
  
         //this.cl('cis.enterNowToTrade @142',cis.enterNowToTrade,cis.tradingsymbol);

          if (cis.enterNowToTrade == false) {
            
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

            this.tradeEntryFlowStatus = 'Reached before  trade Entry';
             this.tradeEntry(instrument_token, inst, cis, element);
          }
        }
      },
      mounted() {
        console.log('hello from mutatewithltpmixin mixin  yyy!');
      },
    },
  };
  
  export default mutateWithLtp;
  