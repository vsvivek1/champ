import axios from 'axios';
import getCandlestickSignal from './getCandleStickSignal';

export default {

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
      

      if(this.completed && [2,10,30,45,55].includes(this.seconds)){
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


            //  let intervel = 'minute';
            let url = "/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+this.accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
      
    
let tradingsymbol=this.instruments.find(i=>i.instrument_token==symbol).tradingsymbol

    
            // console.log(this.instruments,'ins')
    
            //  console.log( url,'utl' )

      //  return;
      let resultPromise =  await  axios.get( url );

      
     
      let data=resultPromise.data;
     // console.log(data,'from minute candles');

      if(!data|| !symbol ){

        return -1;
      }

// console.log(symbol,'sym')
      let obj=this.instruments.find(i=>i.instrument_token==symbol);


      
// console.log(obj.minuteCandle,'minc');

let minuteCandle={};
      this.historicalData[symbol]={};
      
      // this.historicalData[symbol]['ohlc'] = data;

      minuteCandle.data=data;
      minuteCandle.signal = getCandlestickSignal(data,obj.tradingsymbol)

      

     
      this.$set(obj,'minuteCandle',minuteCandle);

   

     

     
      

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
  