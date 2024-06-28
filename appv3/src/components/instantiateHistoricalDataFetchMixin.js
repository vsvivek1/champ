import axios from 'axios';
import getCandlestickSignalMixin from './getCandleStickSignal';

export default {

  mixins:[getCandlestickSignalMixin],

  mounted(){

    this.fetchingMinuteCandle=true
        this.instrumentTokens = this.instruments.map( i =>parseInt( i.instrument_token ));
        
       let  symbolList=[...this.instrumentTokens];
       this.initiateHistoricalDataFetch(symbolList);
       this.fetchingMinuteCandle=false;

       this.loopingAndFetching(symbolList,1);
    setInterval(()=>{


      this.date=new Date();

      this.minutes=this.date.getMinutes();
     this.hours=this.date.getHours();
     this.seconds=this.date.getSeconds();
      //console.log('completed',this.completed,'this.seconds,',this.seconds);
      

      if(this.completed && this.seconds%2==0){

        this.fetchingMinuteCandle=true
        this.instrumentTokens = this.instruments.map( i =>parseInt( i.instrument_token ));
        
       let  symbolList=[...this.instrumentTokens];
       this.initiateHistoricalDataFetch2(symbolList);
       this.fetchingMinuteCandle=false

       
       
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

      async getHourlyData(symbol){
        let start  = this.getRequiredTime( 9,15 );

        let date=new Date();

        let minute=date.getMinutes();
        let hour=date.getHours();
        let end
        if(hour==9 || (hour==10 && minute<15)){

          end  = this.getRequiredTime( hour,15 );
        }else{

          if(minute<15){

            hour=hour-1;
            minute=15
            
          }else{

            //hour=hour

            minute=15
          }

          end  = this.getRequiredTime( hour,minute );
        }

          


        let  intervel = '60minute';
          let url = "/api/getHistoricalData/symbol/"+ symbol+'/accessToken/'+this.accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;
          let resultPromise
          
         try {
           resultPromise =  await  axios.get( url );
         } catch (error) {
          
          console.log(error,'hourly data @97 instatmtiitate')
          //this.$router.go()
         }

      
     
          let data=resultPromise.data;
          let lastHour=data[data.length-1];
//debugger;
          if(lastHour){

           
            let close=lastHour.close
            let open=lastHour.open
  let high=Math.max(close,open)

high=lastHour.high;

let out=data.reduce((max, obj) => obj.high > max ? obj.high : max, -Infinity);


//debugger;
            return out;
           // return high;
          }else{

            return false
          }
          

      },

      async getHistoricalDataForCustomDuration(intervel = 'minute', symbol) {

        if(typeof symbol=='undefined'){

          return false;
        }
        let start = this.getRequiredTime(9, 15);
        let date = new Date();
        let minute = date.getMinutes();
        let hour = date.getHours();
        let end = this.getRequiredTime(hour, minute + 2);
        intervel = 'minute';
        
        // Construct the URL and encode components
        let url = `/api/getHistoricalData/symbol/${encodeURIComponent(symbol)}/accessToken/${encodeURIComponent(this.accessToken)}/start/${encodeURIComponent(start)}/end/${encodeURIComponent(end)}/intervel/${encodeURIComponent(intervel)}`;
        
        let cs = this.instruments.find(i => i.instrument_token == symbol) || this.instruAll.find(i => i.instrument_token == symbol);
    
        if (!cs) {
            console.warn(`Symbol ${symbol} not found in instruments or instruAll from historic data fetch`);
            return;
        }
    
        let tradingsymbol = cs.tradingsymbol;
        let resultPromise;
        
        try {
            resultPromise = await axios.get(url);
            if (typeof resultPromise === 'undefined') {
                throw new Error('axios error');
            }
        } catch (error) {

          
            console.error('Error fetching historical data:', error);
            console.log('Issue URL:', url);
            // Optional: additional error handling logic here
            return;
        }
    
        let data = resultPromise.data;
    
        if (!data || !symbol) {
            return -1;
        }
    
        let obj = this.instruments.find(i => i.instrument_token == symbol);
        if (!obj) {
            console.warn(`Instrument for symbol ${symbol} not found`);
            return -1;
        }
    
        let minuteCandle = {};
        this.historicalData[symbol] = {};
        
        minuteCandle.data = data;
        minuteCandle.signal = this.getCandlestickSignal(data, obj.tradingsymbol);
    

        if((typeof obj.minuteCandle==='undefined') || !obj.minuteCandle.lastHigh || (this.minutes==0 && this.seconds==1)){
//console.log('FETCHING HOURL CANDLE FOR ',obj.tradingsymbol,'at', Date(),obj.minuteCandle)
          let h1 = this.calculateHighestPrice(data);
          let h2 = await this.getHourlyData(symbol);
          let { lowest, highest, highestClose } = this.findHighestAndLowest(data);
      
          minuteCandle.lastHigh = h2 || h1;

        }
        
      
      
        minuteCandle.lowerShadowPoints = this.getCandleSupportResistancePoints(data);
    
        this.$set(obj, 'minuteCandle', minuteCandle);
        this.fetchingMinuteCandle = false;
    },
    loopingAndFetching(symbolList,mounted){



      let ln=symbolList.length;
      let endloop=false;
       
      
      let sec=0
      let pvsSymbol;
      let symbol;
       setInterval(()=>{

sec=new Date().getSeconds();


let intervel = 'minute';


if(mounted==1){

  sec=0
}
symbol=symbolList[sec];

if(!symbol){

  return;
}


if(pvsSymbol===symbol){

  return false;

}
   
pvsSymbol=symbol;


if(symbol){

  this.getHistoricalDataForCustomDuration(intervel, symbol)
}

if(mounted==1){

  sec=sec+1;
}

       },2*1000)




    },
    initiateHistoricalDataFetch(symbolList) {
      this.loopingAndFetching(symbolList);
      
      
    


    

      
    },
  
  

     
    },
  };
  