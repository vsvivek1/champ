import axios from 'axios';
import getCandlestickSignal from './getCandleStickSignal';

export default {
    data() {
        return {
          historicalData: {}, // Object to store historical data
        };
      },
    methods: {

        async getHistoricalDataForCustomDuration( intervel='minute',symbol ){ 

            let start  = this.getRequiredTime( 9,15 );
             let end  = this.getRequiredTime( 15,31 );
            //  let intervel = 'minute';
            let url = "/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+this.accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
      
      //  console.log( url,'utl' )

      //  return;
      let resultPromise =  await  axios.get( url );

      let data=resultPromise.data;


      if(!data|| !symbol ){

        return -1;
      }

      this.historicalData[symbol]={};
      
      this.historicalData[symbol]['ohlc'] = data;

    
      this.historicalData[symbol]['signal'] = getCandlestickSignal(data);;

      console.log(symbol,this.historicalData[symbol]['signal'],'signal')

      

      // for(let i =0;i<data.lenght;i++){


      // }
      // this.historicalData[symbol].signals = data;


      // console.log(this.historicalData[symbol]['signal'],'from historical data')
      
           },
      
  
      initiateHistoricalDataFetch(symbolList) {
        let index = 0;
        const interval = 1000 / 3; // 3 requests per second
  
        const makeRequest = () => {
          if (index < symbolList.length) {

            console.log(index,symbolList[index]);
            this.getHistoricalDataForCustomDuration('minute',symbolList[index]);
            index++;
            setTimeout(makeRequest, interval);
          } else {
            // All symbols processed, schedule the next batch at the 5th second of each minute
            const now = new Date();
            const seconds = now.getSeconds();
            const millisecondsToNextMinute = (60 - seconds) * 1000; // Time until next minute
            setTimeout(() => this.initiateHistoricalDataFetch(symbolList), millisecondsToNextMinute + 5000);
          }
        };
  
        makeRequest();
      },
    },
  };
  