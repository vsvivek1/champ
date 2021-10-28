<template>
    <div>
 
daysHourlyData {{daysHourlyData}}
        <v-row>
            <v-row >
                <v-col cols=4 offset=4>
<v-alert  >Manikandan-Vivek Strategy </v-alert>

                </v-col>
            </v-row>
        </v-row>
<hr>

<v-container>

    <v-row>
        <v-col>Select Script
       


        </v-col>
        <v-col>
            
             <select  class="form-control" v-model="selectedInstrument" @change="getSymbolDetails">

<option v-for="instrument in instruments" :key="instrument.instrument_token" :value="instrument">

{{instrument.tradingsymbol}}
</option>

             </select>
        </v-col>    
        
        <v-col>
            <v-btn  @click="getSymbolDetails">
                <v-icon>mdi-circle</v-icon> Reload
            </v-btn>
        </v-col>
    </v-row>

    </v-container>
    <v-divider></v-divider>
    

   


    <v-row v-if="loadedOHLC" class="mt-2 pt-2">
        <v-col>Ys'day Close <hr> {{Ohlc.ohlc.close}} </v-col>
        <v-col>Today Open <hr> {{Ohlc.ohlc.open}}</v-col>
        <v-col>GAP <hr> {{absGap}}</v-col>
        <v-col>Strategy Name <hr> {{StrategyName}}</v-col>
        <v-col>Time <hr>{{time }}</v-col>
        <v-col>Live LTP <hr>
        
        <span :style="{color:this.CandleColour}"> LTP
{{this.LiveLtp}}
        </span>
      
        
        
        </v-col>
       
        <v-col v-if="StrategyName=='FLAT'" >Prv Day High <hr>
        
{{previousDayCandle.high}}
       
        
        </v-col>
        <v-col  v-if="StrategyName=='FLAT'">Prv Day LOW <hr>{{previousDayCandle.low}}</v-col>
       
       
        <v-col>Entry points <hr>
short side  <span class="bg-danger">{{EntryPointShortSide}}




</span>
&nbsp;
<v-btn  @click="PlaceBracketorder('SELL')" color="red" raised  v-if="EnableEntryPointShortSideButton">
    <v-icon>mdi-cart</v-icon> {{EntryPointShortSide}}
</v-btn>

<hr>
Long side <span class="bg-success">{{EntryPointLongSide}}</span> &nbsp;


<v-btn  @click="PlaceBracketorder('BUY')"  raised color="green" v-if="EnableEntryPointLongSideButton">
    <v-icon>mdi-cart</v-icon> {{EntryPointLongSide}}
</v-btn>

        </v-col>


        <v-col>Target <hr>

        
short side  <span class="bg-danger">{{Math.min(targetShortSide)}}</span>)
<hr>
Long side <span class="bg-success">{{Math.min(targetLongSide)}}</span>


        </v-col>
        <v-col>Stop Loss <hr>
short side  <span class="bg-danger">{{stopLossShort}}</span>
<hr>
Long side <span class="bg-success">{{stopLossShort}}</span>


        </v-col>
    </v-row>
<hr>
        

       

    </div>
</template>

<script>
import axios from 'axios';

import {io} from 'socket.io-client';

const socket=io('http://localhost:4000');


import ServerCallMixins from './ServerCallMixins';
 import sessionMixin from '@/views/sessionMixin';
    export default {
        name:"ManiKandanStrategy",
        mixins:[ServerCallMixins,sessionMixin],
        mounted(){





// return JSON.stringify(Array.from(st));



socket.on('ltp-of-script-for-mkv-strategy',s=>{

  



// this.mutateOrdersWithLtp(s)/// function for mutating orders with real time lTP

// this.UpdateSellOrderToTargetOnLtpTrigger(s)

let tmp=this.LiveLtp;
this.LiveLtp=s[0].last_price;

if(tmp>this.LiveLtp){
    this.CandleColour='green';
}else{

     this.CandleColour='red';
}



if(!this.entredbyStrategyToday){

//if not entred today 
        if(this.StrategyName=='FLAT'){
            //if flat 

            var d = new Date();
            var hour = d.getHours();
                    if(hour>10)
                    {
        //if time >10 am

                    if (this.LiveLtp>=this.EntryPointLongSide){
                        //if ltp >= entry point short or entry point 

                   var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
// audio.play();
/// play audio of entry 

 // enable button for bracket order

 this.EnableEntryPointLongSideButton=true
 this.EnableEntryPointShortSideButton=false;

        // set entred today true



                    }
                    else      if (this.LiveLtp<=this.EntryPointShortSide){
                        //if ltp >= entry point short or entry point 

                   var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
audio.play();
/// play audio of entry 

 // enable button for bracket order

this.EnableEntryPointLongSideButton=false;
 this.EnableEntryPointShortSideButton=true;;

        // set entred today true



                    }

       
        

       


                    }








            
        }


}






console.log('ltp-of-script-for-mkv-strategy',s[0].last_price);
console.clear();

   });

        },
          beforeDestroy() {
    // prevent memory leak
    clearInterval(this.interval)
  },
        created() {
    // update the time every second
    this.interval = setInterval(() => {
      // Concise way to format time according to system locale.
      // In my case this returns "3:48:00 am"
      this.time = Intl.DateTimeFormat(navigator.language, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format()
    }, 1000)
  },
        computed:{

stopLossShort(){

return this.EntryPointShortSide+this.definedStopLossPoints;

},stopLosslong(){
return this.EntryPointLongSide-this.definedStopLossPoints;
    
}
        },
        data(){


            return{
quantity:50,
selectedVariety:'regular',
EnableEntryPointLongSideButton:true,
EnableEntryPointShortSideButton:true,
                entredbyStrategyToday:false,

CandleColour:'',
LiveLtp:0,
                rectangleRange:0,

                targetShortSide:0,
                targetLongSide:0,
                definedStopLossPoints:50,
                EntryPointShortSide:0,
                EntryPointLongSide:0,
                daysHourlyData:0,
                gap:0,
                absGap:0,
                definedGapPoint:50,
                positveOpening:false,
                StrategyName:'',
                time:0,
                selectedInstrument:-1,
                Ohlc:{
                    "ohlc":{
'open':-1,
'close':-1

                    },
                    
                    },
                loadedOHLC:true,
                previousDayCandle:{},

            instruments:[ 
                {
"instrument_token": -1,
   "tradingsymbol": "select",

                },
                
    

 {
    "instrument_token": 13209858,
    "exchange_token": 51601,
    "tradingsymbol": "NIFTY21OCTFUT",
    "name": "NIFTY",
    "last_price": 0,
    "expiry": "2021-10-28",
    "strike": 0,
    "tick_size": 0.05,
    "lot_size": 50,
    "instrument_type": "FUT",
    "segment": "NFO-FUT",
    "exchange": "NFO"
  },
    {
    "instrument_token": 13720834,
    "exchange_token": 53597,
    "tradingsymbol": "NIFTY21NOVFUT",
    "name": "NIFTY",
    "last_price": 0,
    "expiry": "2021-11-25",
    "strike": 0,
    "tick_size": 0.05,
    "lot_size": 50,
    "instrument_type": "FUT",
    "segment": "NFO-FUT",
    "exchange": "NFO"
  },
  {
    "instrument_token": 18258178,
    "exchange_token": 71321,
    "tradingsymbol": "NIFTY21DECFUT",
    "name": "NIFTY",
    "last_price": 0,
    "expiry": "2021-12-30",
    "strike": 0,
    "tick_size": 0.05,
    "lot_size": 50,
    "instrument_type": "FUT",
    "segment": "NFO-FUT",
    "exchange": "NFO"
  },
  ],
            }
        },

        methods:{

PlaceBracketorder(type){
   

////////////////////////////place sl

           const url="/api/PlaceTarget";

        //    alert(this.selectedVariety);

          if(typeof(this.selectedVariety)=='undefined'){

              this.selectedVariety='regular';
          }   

let map=[];
// let map=this.holdingsForMarket.map(holding=>{

let order={};
// if(holding.targetSlYestLowSl){

order.variety=this.selectedVariety;
order.params={};
order.params.exchange='NFO'
order.params.tradingsymbol=this.selectedInstrument.tradingsymbol;
order.params.transaction_type=type;


// let total_quantity=(holding.quantity+holding.t1_quantity);
// let disclosed_quantity=Math.ceil(total_quantity/10)


order.params.quantity=this.quantity;

// order.params.disclosed_quantity=disclosed_quantity;


order.params.product='NRML';
order.params.order_type='LIMIT';
order.params.validity='DAY';
// order.params.trigger_price=holding.targetSlYestLowSl;


if(type=='BUY'){
order.params.price=this.EntryPointLongSide;

// order.squareoff=this.targetLongSide;
order.params.squareoff=100;

}else if(type=='SELL'){
order.params.price=this.EntryPointShortSide;
order.params.squareoff=100;


}

order.params.stoploss=50;

// }



// return order

// });

map.push(order);

let data1=JSON.stringify(map); 

let data={};

data.accessToken=this.accessToken;
data.ZerodhaParams=data1;

// console.log('mapy',data); //return false;

                axios.post(url,data).then(
res=>{
    // this.$router.push("/orders")

    // console.log('result')
}

                )
////////////////////////////place sl


            },
            emitSubscriptionOfInstrumentsForWebsockets(){



                
let subscription_array=[];
subscription_array.push(this.selectedInstrument.instrument_token);

let stringifiedArray=JSON.stringify(subscription_array);
 
console.log('stringifiedArray',stringifiedArray)
  socket.emit('subscribe-script-for-mkv-strategy', stringifiedArray) ;

            },


            dateToDateTime(date){

var today = date;
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

return dateTime;

            },

            async getCandleDetails(symbol){



               


///if on a market day after opening 
  var d1= new Date();
d1.setDate(d1.getDate()-1);
d1.setHours(9);
d1.setMinutes(15);
d1.setSeconds(0);

console.log('d1',d1)
//   let lastTradingDay=d1.toISOString().split('T')[0];




let lastTradingDay=d1.toLocaleString( 'sv' );;
let FromDate=lastTradingDay.split(' ')[0];


  var d2= new Date();
d2.setDate(d2.getDate()-1);
d2.setHours(15);
d2.setMinutes(30);
d2.setSeconds(0);

let ToDate=d2.toLocaleString( 'sv' ).split(' ')[0];;;



console.log('astTradingDay',lastTradingDay)

let intervel='day';

let candles=await this.getHistoricalData(this.accessToken,symbol,FromDate,ToDate,intervel);


 this.previousDayCandle =candles[0];

  this.EntryPointShortSide= this.previousDayCandle.low
 this.EntryPointLongSide= this.previousDayCandle.high


this.rectangleRange=Math.min(Math.abs(this.EntryPointShortSide-this.EntryPointLongSide),100);



 this.targetShortSide=this.EntryPointShortSide-this.rectangleRange;

this.targetLongSide=this.EntryPointLongSide+this.rectangleRange;
console.log('candles',candles)

            },

             async getCandleDetailsHourly(symbol){



               


///if on a market day after opening 
  var d1= new Date();

  let todaysData=d1.toISOString().split('T')[0];


var startingTime1= new Date();
startingTime1.setHours(9)
startingTime1.setMinutes(15)
// let startingTime=startingTime1.toISOString().split('T')[0]+" 9:15:00"
let startingTime=this.dateToDateTime(startingTime1)

var EndingTime1= new Date();
EndingTime1.setHours(11)
EndingTime1.setMinutes(0)
// let EndingTime=EndingTime1.toISOString().split('T')[0]+" 11:00:00";
let EndingTime=EndingTime1.this.dateToDateTime(EndingTime1)


let intervel='day';


let candles=await this.getHistoricalData(this.accessToken,symbol,startingTime,EndingTime,intervel);


 this.daysHourlyData =candles[0];

 this.EntryPointShortSide=this.daysHourlyData.low
 this.EntryPointLongSide=this.daysHourlyData.high



//pending
 this.targetShortSide=this.EntryPointShortSide-this.previousDayCandle.high

this.targetLongSide=this.EntryPointLongSide-this.previousDayCandle.low


            },



async getSymbolDetails(){

    // this.loadedOHLC=false;

      let arr=[];
    arr.push(this.selectedInstrument.exchange+":"+this.selectedInstrument.tradingsymbol);



    

    // let StrigifiedArray=JSON.stringify(arr)
    let StrigifiedArray=arr;


let res=await this.getOHLC(this.accessToken,StrigifiedArray);




    // this.loadedOHLC=true;
    this.Ohlc= res[this.selectedInstrument.exchange+":"+this.selectedInstrument.tradingsymbol]

    
    this.gap= Math.round(this.Ohlc.ohlc.open-this.Ohlc.ohlc.close);

    this.absGap=Math.abs(this.gap);

    console.log('this.gap',this.Ohlc,this.gap,this.Ohlc.open,this.Ohlc.close)
    if(this.gap>0){
        this.positveOpening=true;
    }else{
this.positveOpening=false;

    }
console.log('this.absGap<this.definedGapPoint',this.absGap,this.definedGapPoint,this.absGap<this.definedGapPoint)
    switch (true){

        case (this.absGap>this.definedGapPoint && this.gap>0) :
            this.StrategyName='GAP_UP';
            this.getCandleDetailsHourly(this.selectedInstrument.instrument_token)
            break;
            
            case (this.absGap>this.definedGapPoint && this.gap<0):
            this.StrategyName='GAP_DOWN'

            this.getCandleDetailsHourly(this.selectedInstrument.instrument_token)
            break;
           case (this.absGap<this.definedGapPoint ):
              this.StrategyName='FLAT' ;
              
            this.getCandleDetails(this.selectedInstrument.instrument_token);
              break;






    }



this.emitSubscriptionOfInstrumentsForWebsockets()


}


           
        }
        
    }
</script>

<style lang="scss" scoped>

</style>
