import Vue from "vue";

const TradeEntryMixin = {

  data(){

    return{
belowDaysHighEntry:false,

    }
  },
  methods: {


    checkNumberInArray(arr, num) {
      // Calculate the ±2% range of the given number
      const lowerBound = num * 0.98;
      const upperBound = num * 1.02;
  
      // Check if any number in the array falls within the ±2% range
      return arr.some(n => n >= lowerBound && n <= upperBound);
  },
    setCis(cis,entry,entryStrategy,target,targetStrategy,stopLoss,stopLossStrategy){


      this.$set(cis,'entry',entry)
      this.$set(cis,'entryStrategy',entryStrategy)
      this.$set(cis,'entryStrategy',entryStrategy)
      this.$set(cis,'targetStrategy',targetStrategy)
      this.$set(cis,'target',target)
      this.$set(cis,'stopLoss',stopLoss)
      this.$set(cis,'stopLossStrategy',stopLossStrategy);

    },
    tradeEntry(instrument_token, inst = 'cis', cis, element) {
      try {

       

        if(element.last_price<1){

         // shouldProceed=false;
          return;
        }
          let shouldProceed = false;
  
          if (typeof cis.previous_last === 'undefined') {
            console.log(cis.previous_last,'pvs last error') 
            
            shouldProceed = false;
              return;
          }
  
          const isBefore15Minutes = this.checkTimeDifference(element.last_traded_time);
          if (isBefore15Minutes) {
              this.tradeEntryFlowStatus = 'LAST TRADED TIME IS BEFORE 15 MINUTES. IGNORING TRADE ENTRY for ' + cis.tradingsymbol;
              return false;
          }
  
          let metCriteria = [];

          if(cis.previous_last==0|| typeof cis.previous_last=='undefined' )

          {
            this.shouldProceed = false;
            return false;

          }


          let minuteSignalEntry=false;
          if(typeof cis.minuteCandle!='undefined' && cis.minuteCandle.signal!='noSignal'){

            //console.log(cis.minuteCandle.signal,'minute signal')

            

          }
          

        

if(element.ohlc.open>element.last_price){

this.flashMessage=`'NO BUYING BELOW OPENING POINT ${cis.tradingsymbol}`;
  //this.cl('NO BUYING BELOW OPENING POINT',cis.tradingsymbol)
  return;

}




if( typeof cis.minuteCandle =='undefined' || typeof cis.minuteCandle.signal=='undefined' || 
 typeof cis.minuteCandle.signal=='undefined' || cis.minuteCandle.signal=='EntryCheckForSignalFailed'){

  this.flashMessage=`${cis.minuteCandle},'minute candle signal issue before switch issue for',${cis.tradingsymbol}`;

  this.cl(cis.minuteCandle,'minute candle signal issue before switch issue for',cis.tradingsymbol)
  return;
}else 

if(cis.lastHigh>cis.last_price && cis.minuteCandle.signal.signal=='longTail'){


  this.flashMessage=`'longTail abouve last high',${cis.tradingsymbol}`;
  this.cl('longTail abouve last high',cis.tradingsymbol)

}

try {
  
  if( (this.hours>9  && (typeof cis.minuteCandle=='undefined' || cis.minuteCandle.lastHigh>element.last_price))){
  
    if(typeof cis.minuteCandle!='undefined' ){
    //this.cl('LAST HOUR HIGH GREATER THAN LAST PRICE FOR',cis.tradingsymbol,'last hour high',cis.minuteCandle.lastHigh , element.last_price,'is the last price so returning')


    this.shouldProceed=false;
    return;
    }
  
    this.shouldProceed=false;
    return;
  }else{


    this.flashMessage=`'LAST HOUR check ok',${cis.tradingsymbol},'last hour high'${cis.minuteCandle.lastHigh} , ${element.last_price},'is the last price so returning'`
       //console.log(`'LAST HOUR check ok',cis.tradingsymbol,'last hour high',cis.minuteCandle.lastHigh , element.last_price,'is the last price so returning'`)

  }
} catch (error) {
console.log(error,'here eror')
  this.shouldProceed=false;
    return;
  
}
//console.log('BEFORE ACTUAL TRADE SWITCH',cis.tradingsymbol)

/* if(this.seconds<40){

  ///check time 
  this.flashMessage='TIME LESS THAN 40 SECONDS '+cis.tradingsymbol;
  return;
}
 */
this.flashMessage='BEFORE ACTUAL TRADE SWITCH'+cis.tradingsymbol;

let  { highest, lowest }=this.findHighestAndLowest (cis.minuteCandle.data)




let lastPriceBelowDailyHigh=false;
if(element.last_price<highest){

if(cis.minuteCandle.lowerShadowPoints && 
  


this.checkNumberInArray(cis.minuteCandle.lowerShadowPoints, element.last_price)

){

  //alert('hi')
  this.flashMessage="Low candle entry";
  lastPriceBelowDailyHigh=false;
  shouldProceed=true;


  this.belowDaysHighEntry=true;
 // return;
}else{
  this.flashMessage="LAST PRICE BELOW DAILY HIGH";
  lastPriceBelowDailyHigh=true;
  shouldProceed=false;
  return;

}


//return;
}

          switch (true) { 
             /*  case !this.checkNiftyStatus("NIFTY 50"):
                  this.cl("Condition check for 'checkNiftyStatus' not met no proceeding from shouldProceed");
                  this.tradeEntryFlowStatus = 'Condition check for \'checkNiftyStatus\' not met no proceeding from shouldProceed ' + cis.tradingsymbol;
                  shouldProceed = false;
                  break; */

case this.belowDaysHighEntry:



console.log('LOW CANDLE ENTRY FOR ',cis.tradingsymbol)
let sl=cis.minuteCandle.lowerShadowPoints.filter(i=>i<element.last_price)[0];
let target=cis.minuteCandle.lowerShadowPoints.filter(i=>i>element.last_price)[0];
  this.$set(cis,'lowCandleEntry',true);
  this.$set(cis,'lowCandleEntryTarget',target);
  this.$set(cis,'lowCandleEntryStopLoss',sl);
  this.shouldProceed = true;
break;


case (
  
  !( typeof cis.minuteCandle =='undefined' || typeof cis.minuteCandle.signal=='undefined' || 
  typeof cis.minuteCandle.signal=='undefined' || cis.minuteCandle.signal=='EntryCheckForSignalFailed')
  && cis.minuteCandle.signal.signal=='longTail'
):

console.log('inside long Tail  candle signal')

if(cis.minuteCandle.lastHigh>element.last_price){

  break;
  return

}
  this.shouldProceed = true;
  this.$set(cis,'tradeEntrySignal','longTail');
  cis.minuteCandle.signal=='Signal Executed';

break;

              case (this.yesterDayHighCross(cis)):

              let exit={};
              exit.target=cis.dailyRangeBreakout;
              exit.stopLosss=cis.pricePoints.d1.low*1.1;
              this.$set(cis,'tradeEntrySignal','yesterdayHighCross');
              this.$set(cis,'exit',exit)


                  this.shouldProceed = true;
                  break;
              case this.dailyRangeBreakout(element, cis):
                  this.cl("Condition check for 'dailyRangeBreakout' not met");
                  this.tradeEntryFlowStatus = 'Condition check for \'dailyRangeBreakout\' not met' + cis.tradingsymbol;
                
                  this.$set(cis,'tradeEntrySignal','daiulyRangeBreakout');
                  shouldProceed = true;

                  this.$set(cis,'tradeEntrySignal','yesterdayHighBreakOut');
                
                  break;
              case this.yesterdayCloseStrategy(element, cis):
                  this.cl("Condition check for 'yesterdayCloseStrategy' not met");
                  shouldProceed = true;
                  break;

                 // case cis.minuteCandle.signal=='longTail':

                  this.$set(cis,'tradeEntrySignal','longTail');

                  shouldProceed==true;
                  break;
              default:
                  //console.log({ shouldProceed }, cis.tradingsymbol);

                  shouldProceed = false;
                  // metCriteria.push("yesterdayCloseStrategy");
                  break;

                  
          }
  

          //console.log('reached should proceed for entry',cis.tradingsymbol,cis.signal,this.shouldProceed)
          
          //debugger;
          if(typeof cis.minuteCandle==undefined ||this.hours>9 && cis.minuteCandle.lastHigh>element.last_price){

            //console.log('LAST HOUR HIGH GREATER THAN LAST PRICE FOR',cis.tradingsymbol,'last hour high',cis.minuteCandle.lastHigh , element.last_price,'is the last price so returning')
          
            this.shouldProceed=false;
            return;
          }


         // shouldProceed = false;
          if (this.shouldProceed) {

          //  this.updateInstrumentsFile(this.instruments,'./appv3/public/instruments/instrumentsForMining.json')

              var sellersLowestPrice = cis.last_price;


              var sellersLowestPrice=cis.last_price;


              this.$set( 
                this.instruments.filter( 
                  ( i )  => i.instrument_token  ==  instrument_token
                 )[0],
                "PlacedReverseOrderType",
                "nil"
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
                "latestBuyPrice",
                sellersLowestPrice
               );

              this.proceedForEntry(
                  instrument_token,
                  cis,
                  element,
                  sellersLowestPrice,
                  "long",
                  metCriteria
              );
          }
      } catch (error) {
          console.log("Error in trade entry function:", error);
          return false;
      }
  },
  

    checkTimeDifference(lastTradedTime) {
      const lastTradedDate = new Date(lastTradedTime);
      const currentTime = new Date();
      const timeDiffInMinutes = Math.floor((currentTime - lastTradedDate) / (1000 * 60));
      return timeDiffInMinutes > 15;
    },

    triggers(element, cis) {
      console.log('Triggers called');
      // Trigger logic from the original code
      // Example: Your original trigger logic here
    },

    checkNiftyStatus(index) {
        return true;
      console.log('Check Nifty status logic');
      // Check Nifty status logic from the original code
      // Example: Your original check Nifty status logic here
    },

    previousPriceCheck(cis){
      
if (typeof cis.previous_last=='undefined') {

  return false
  console.log(cis.previous_last,'pvs lst')
}


      if(cis.previous_last>cis.last_price){

        return false;
        this.cl('SEEMS PRICE IS COMING DOWN TO BREAK OUT POIINT FOR',cis.tradingsymbol,'pvs',cis.previous_last,'current',)
        return false;
      }else{

        return true
      }
    },

yesterDayHighCross(cis){

  if(!this.previousPriceCheck(cis)){

    return false;
  }

  if(cis.pricePoints.d1.high>cis.last_price){

    return true
  }

},

    dailyRangeBreakout(element, cis) {

      if(! this.previousPriceCheck(cis)){

        return false
      }
        // Calculate the percentage change from open to high
        const percentageChange = (element.ohlc.high - element.ohlc.open) / element.ohlc.open;
      
        // Check if the percentage change is less than 20%
        const isPercentageChangeLessThan20Percent = percentageChange < 0.2;
      
        // Check if the high price is less than or equal to the last traded price
        const isHighPriceLessThanOrEqualToLastPrice = element.ohlc.high <= element.last_price;
      
        // Check if the high price is greater than the open price
        const isHighPriceGreaterThanOpenPrice = element.ohlc.high > element.ohlc.open;
      
        // Check if the current time is after 9:25
        const isAfter925 = this.hours >= 9 && this.minutes >= 25;
      
        // Check if the open price is greater than yesterday's low
        const isOpenPriceGreaterThanYesterdayLow = element.ohlc.open > cis.pricePoints.d1.low;
      
        // Check if yesterday's high is not equal to yesterday's open
        const isYesterdayHighNotEqualToOpen = cis.pricePoints.d1.high !== cis.pricePoints.d1.open;
      
        // Check if the last traded price is greater than or equal to today's high
        const isLastPriceGreaterThanOrEqualToTodayHigh = element.last_price >= element.ohlc.high;
      
        // Check if today's high is not equal to 0
        const isTodayHighNotZero = cis.pricePoints.d0.high !== 0;
      
        // Combine all conditions to check for daily range breakout
        const isDailyRangeBreakout =
          isPercentageChangeLessThan20Percent &&
          isHighPriceLessThanOrEqualToLastPrice &&
          isHighPriceGreaterThanOpenPrice &&
          isAfter925 &&
          isOpenPriceGreaterThanYesterdayLow &&
          isYesterdayHighNotEqualToOpen &&
          isLastPriceGreaterThanOrEqualToTodayHigh &&
          isTodayHighNotZero;
      
        // Output the result and return it
        if (isDailyRangeBreakout) {

            // this.tradeEntry()
          console.log('Daily range breakout detected!');
          // Execute further actions for breakout
          return true;
        } else {
        //   console.log('No daily range breakout detected.');
          return false;
        }
      }
      ,

      yesterdayCloseStrategy(element, cis) {

        if(! this.previousPriceCheck(cis)){

          return false
        }
         

        // Check if the last traded price is greater than or equal to yesterday's high
        const isLastPriceGreaterThanOrEqualToYesterdayHigh = element.last_price >= cis.pricePoints.d1.high;
      
        // Check if the opening price is within yesterday's candle body
        const isOpenPriceWithinYesterdayCandleBody = this.isBetween(element.ohlc.open, cis.pricePoints.d1.close, cis.pricePoints.d1.open);
      
        // Check if yesterday's candle does not have a large body
        // const isNotLargeYesterdayBody = !largeYesterdayBody;
        const isNotLargeYesterdayBody = false;
      
        // Check if the high price is less than 5% above yesterday's high
        const isHighPriceLessThan5PercentAboveYesterdayHigh = element.ohlc.high < cis.pricePoints.d1.high * 1.05;
      
        // Check if yesterday's candle is not large
        // const isNotLargeYesterdayCandle = !largeYesterdayCandle;
        const isNotLargeYesterdayCandle = false;
      
        // Calculate the body and shadow sizes of yesterday's candle
        const d1Body = Math.abs(cis.pricePoints.d1.open - cis.pricePoints.d1.close);
        const d1LowerShadow = Math.abs(cis.pricePoints.d1.open - cis.pricePoints.d1.low);
        const d1UpperShadow = Math.abs(cis.pricePoints.d1.high - cis.pricePoints.d1.close);
      
        // Check if either the body is greater than a quarter of the lower shadow or greater than a quarter of the upper shadow
        const isBodyGreaterThanLowerShadowOrUpperShadow =
          d1Body > d1LowerShadow / 4 || d1Body > d1UpperShadow / 4;
      
        // Check if the current time is before 11:00
        const isBefore11 = this.hours < 11;
      
        // Combine all conditions to check for yesterday's close strategy
        const isYesterdayCloseStrategy =
          isLastPriceGreaterThanOrEqualToYesterdayHigh &&
          isOpenPriceWithinYesterdayCandleBody &&
          isNotLargeYesterdayBody &&
          isHighPriceLessThan5PercentAboveYesterdayHigh &&
          isNotLargeYesterdayCandle &&
          isBodyGreaterThanLowerShadowOrUpperShadow &&
          isBefore11;
      
        // Output the result and return it
        if (isYesterdayCloseStrategy) {
          console.log('Yesterday close strategy met!');
          // Execute further actions for the close strategy
          return true;
        } else {
        //   console.log('Yesterday close strategy not met.');
          return false;
        }
      },
      

    todayLastPriceHigh(element, cis) {
    //   console.log('Today last price high logic');
      // Today last price high logic from the original code
      // Example: Your original today last price high logic here
    },

    todayLastPriceClosing(element, cis) {
    //   console.log('Today last price closing logic');
      // Today last price closing logic from the original code
      // Example: Your original today last price closing logic here
    },

    isOpenLowStrategy(element, cis) {
    //   console.log('Is open low strategy logic');
      // Is open low strategy logic from the original code
      // Example: Your original is open low strategy logic here
    },

    closingMovingAverageCondition(element, cis) {
    //   console.log('Closing moving average condition logic');
      // Closing moving average condition logic from the original code
      // Example: Your original closing moving average condition logic here
    }
  }
};

Vue.mixin(TradeEntryMixin);

export default TradeEntryMixin;
