import Vue from "vue";

const TradeEntryMixin = {
  methods: {
    tradeEntry(instrument_token, inst = 'cis', cis, element) {
      try {
         console.log('from trade entry mixin');

        this.triggers(element, cis);

        const isBefore15Minutes = this.checkTimeDifference(element.last_traded_time);

        if (isBefore15Minutes) {
          console.log('LAST TRADED TIME IS BEFORE 15 MINUTES. IGNORING TRADE ENTRY');
         // return false;
        }

        let shouldProceed = true; // Flag to determine whether to proceed
let metCriteria = []; // Array to store names of conditions that were met

//if (!this.checkNiftyStatus("NIFTY 50")) {
if (false) {
    this.cl("Condition check for 'checkNiftyStatus' not met no proceeding from shouldProceed");
    shouldProceed = false;
} else {
    metCriteria.push("checkNiftyStatus");
}
if (!this.dailyRangeBreakout(element, cis)) {
     this.cl("Condition check for 'dailyRangeBreakout' not met");
    shouldProceed = false;
} else {
    metCriteria.push("dailyRangeBreakout");
}
if (!this.yesterdayCloseStrategy(element, cis)) {
     this.cl("Condition check for 'yesterdayCloseStrategy' not met");
    shouldProceed = false;
} else {
    // metCriteria.push("yesterdayCloseStrategy");
}
// Add similar blocks for other conditions...

// If any condition is true, execute the function
if(shouldProceed)
console.log({shouldProceed});
shouldProceed=true
//should
let sellersLowestPrice=cis.last_price;
if (shouldProceed) {
    // Execute the function with the specified parameters
    this.proceedForEntry(
        instrument_token,
        cis,
        element,
        sellersLowestPrice,
        "long",
        metCriteria // Pass the array of met criteria
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

    dailyRangeBreakout(element, cis) {
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
