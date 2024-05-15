import axios from 'axios';
import getCandlestickSignalMixin from './getCandleStickSignal';

export default {

  mixins:[getCandlestickSignalMixin],

  mounted(){

    this.instrumentTokens = this.instruments.map( i =>parseInt( i.instrument_token ));

   let  symbolList=[...this.instrumentTokens];
    this.initiateHistoricalDataFetch(symbolList);

    setInterval(()=>{


      this.date=new Date();

      this.minutes=this.date.getMinutes();
     this.hours=this.date.getHours();
     this.seconds=this.date.getSeconds();
      //console.log('completed',this.completed,'this.seconds,',this.seconds);
      

      if(this.completed && this.seconds%5==0){

        this.fetchingMinuteCandle=true
        this.instrumentTokens = this.instruments.map( i =>parseInt( i.instrument_token ));
        
       let  symbolList=[...this.instrumentTokens];
       this.initiateHistoricalDataFetch(symbolList);


       
       
      }


    },1000)


  },
    data() {
        return {

          date:'',
          seconds:0,
          minutes:0,
          hours:0,
          completed:false,
          historicalData: {}, // Object to store historical data
        };
      },
    methods: {

        async getHistoricalDataForCustomDuration( intervel='minute',symbol ){ 

            let start  = this.getRequiredTime( 9,15 );

            let date=new Date();

            let minute=date.getMinutes();
            let hour=date.getHours();


             let end  = this.getRequiredTime( hour,minute+2 );


              intervel = 'minute';
            let url = "/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+this.accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
      
    
let tradingsymbol=this.instruments.find(i=>i.instrument_token==symbol).tradingsymbol

    
            // console.log(this.instruments,'ins')
    
            //  console.log( url,'utl' )

      //  return;
      let resultPromise =  await  axios.get( url );

      
     
      let data=resultPromise.data;

    //  debugger;
     // console.log(data,'from minute candles');

      if(!data|| !symbol ){

        return -1;
      }

// console.log(symbol,'sym')
      let obj=this.instruments.find(i=>i.instrument_token==symbol);

      let tick=obj.tick


      
// console.log(obj.minuteCandle,'minc');

let minuteCandle={};
      this.historicalData[symbol]={};
      
      // this.historicalData[symbol]['ohlc'] = data;

      minuteCandle.data=data;
      minuteCandle.signal = this.getCandlestickSignal(data,obj.tradingsymbol)

      minuteCandle.lastHigh=this.calculateHighestPrice(data);

      //alert(minuteCandle.lastHigh);

      

     
      this.$set(obj,'minuteCandle',minuteCandle);
      this.fetchingMinuteCandle=false;

      if(minuteCandle.signal.signal!='No signal detected'){


       if(tick&& tick.ohlc.open<tick.last_price && minuteCandle.lastHigh<tick.last_price){
          console.log('MINUTE CANDLE HAS A SIGNAL FOR YOU with last high',obj.tick,minuteCandle.signal.signal,minuteCandle.signal.candleColor,obj.tradingsymbol, Date(),'last high',minuteCandle.lastHigh);


        }
      }

     
      

   

     

     
      

      // for(let i =0;i<data.lenght;i++){


      // }
      // this.historicalData[symbol].signals = data;


      // console.log(this.historicalData[symbol]['signal'],'from historical data')
      
           },
      
  
      initiateHistoricalDataFetch(symbolList) {

        this.completed=false;

       // console.log('initiateHistoricalDataFetch WORKING',symbolList)
        
        let index = 0;
        const interval = 1000 / 3; // 3 requests per second
  
        const makeRequest = () => {
          if (index < symbolList.length) {

           
            //console.log(index,symbolList[index]);
            this.getHistoricalDataForCustomDuration('minute',symbolList[index]);
            index++;
            setTimeout(makeRequest, interval);
          } else {

        
            
            this.completed=true;
            // All symbols processed, schedule the next batch at the 5th second of each minute
          /*   const now = new Date();
            const seconds = now.getSeconds();
            const millisecondsToNextMinute = (60 - seconds) * 1000; / *//// Time until next minute
           // setTimeout(() => this.initiateHistoricalDataFetch(symbolList), millisecondsToNextMinute + 50000);
          
        
          }
        };
  
        makeRequest();
      },
    },
  };
  