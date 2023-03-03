<template>
    <div>
        <h2> total scritps {{scriptsWithCondition.length}}scriptsWithCondition. gain  {{ scriptsWithConditionGain }}</h2>

        <h1>Gain ratio {{ gainRatio }}</h1>
        <vue-good-table :columns="columns" 
        
        :rows="scriptsWithCondition" :paginate="true" :lineNumbers="true" />



    </div>
</template>

<script>
import sessionMixin from "@/views/sessionMixin";
import { VueGoodTable } from 'vue-good-table';
import 'vue-good-table/dist/vue-good-table.css';

import { io } from "socket.io-client";
const socket = io("http://127.0.0.1:4000"

,
{
    transports: ['websocket'],

}
);

    export default {

        computed:{
            gainRatio() {
    const numObjects = this.scriptsWithCondition.length;
    const numGains = this.scriptsWithCondition.filter(object => object.gain >= 0).length;
    const ratio = (numGains / numObjects) * 100;
    return `${ratio}%`;
  }


        },
         mixins:[sessionMixin],
        name:'Tester',

        methods:{

            setInstrumentTokens() {

   

    
// return new Promise((res, rej) => {

//     this.instrumentTokens = this.hourlyPricePointsofLiveDay.map((i) =>
//     parseInt(i.instrument_token)
//   );


let tokn=this.instruments.map(i=>parseInt(i.instrument_token))

  socket.emit("subscribe-orders", JSON.stringify(tokn));

//   res(true);
//      return;


  
// });


},

            async fetchInstruments(){
                this.instruments =await this.requireJson("../../../instruments/instrumentsForMining.json");
                this.setInstrumentTokens();

            },
generateSignals(s){


    for(let l=0;l<s.length;l++){




        let element=s[l];
    
        let cis=this.instruments.find(i=>i.instrument_token==element.instrument_token)

let {d1,d2,d3,d4,d5,d6,d7}=cis.pricePoints;


let mao=
d1.open+
d2.open+
d3.open+
d4.open+
d5.open+
d6.open+
d7.open




let mac=
d1.close+
d2.close+
d3.close+
d4.close+
d5.close+
d6.close+
d7.close


let mah=
d1.high+
d2.high+
d3.high+
d4.high+
d5.high+
d6.high+
d7.high


let mal=
d1.low+
d2.low+
d3.low+
d4.low+
d5.low+
d6.low+
d7.low

let avg=mac/7;


    // let ep=cis.pricePoints.d1.high;
    let ep=avg
//  let exit=element.ohlc.high*1.1;
//  let exit1=element.last_price;
 let exit1=ep*1.2;

 let {low,close,high,open}=element.ohlc;

 let lp=element.last_price;


let exit=(exit1<high?exit1:lp);

if(element.last_price && !this.scriptsWithCondition.find(i=>i.tradingsymbol==cis.tradingsymbol)){


  if(


//  high>ep /// so that it means triggered

    
//      &&   element.ohlc.open<ep // opened below the entry so that it can be trigred

//     && element.ohlc.open!=element.ohlc.high 



// ||
 low==open && ( (lp-open)*cis.lot_size<2500 && (lp-open)*cis.lot_size>0 )

    
    ){


        if(low==open){

            let ob={};

ob.tradingsymbol=cis.tradingsymbol;


ob.gain=(open-lp)*cis.lot_size;

ob.entry=lp;
ob.last_price=element.last_price
ob.exit=lp*1.2
this.scriptsWithCondition.push(ob)

this.scriptsWithCondition = this.scriptsWithCondition //.filter(script => script.last_price !== undefined && script.last_price !== 0).

.sort((a,b)=>{

  b.gain-a.gain
});


        }

      
let ob={};

ob.tradingsymbol=cis.tradingsymbol;

if(low<d1.low){
    ob.gain=(d1.low-ep)*cis.lot_size;


}else{
    ob.gain=(exit-ep)*cis.lot_size;

}

ob.gain=(exit-ep)*cis.lot_size;

ob.entry=ep;
ob.last_price=element.last_price
ob.exit=exit;
this.scriptsWithCondition.push(ob)


this.scriptsWithCondition = this.scriptsWithCondition //.filter(script => script.last_price !== undefined && script.last_price !== 0).

.sort((a,b)=>{

  b.gain-a.gain
});




this.scriptsWithConditionGain=this.scriptsWithCondition.reduce( (pvs,cur)=>pvs+cur.gain,0


);
}


}
    }
}


        },
        components: {
            VueGoodTable,
  },
     data(){

        return{

            gainLoss:-1,
            scriptsWithCondition:[],
            scriptsWithConditionGain:-1,
CurrentTick:[], rows: [
        {
          tradingsymbol: 'AAPL',
          gain: 10.23,
          entry: 120.5,
          exit: 130.5,
          last_price: 132.0,
        },
        {
          tradingsymbol: 'GOOG',
          gain: 5.43,
          entry: 2200.0,
          exit: 2300.0,
          last_price: 2265.5,
        },
        {
          tradingsymbol: 'TSLA',
          gain: 15.67,
          entry: 600.0,
          exit: 700.0,
          last_price: 690.0,
        },
      ],
columns: [
        {
          label: 'SL No.',
          field: 'index',
          sortable: true
        },
        {
          label: 'Trading Symbol',
          field: 'tradingsymbol',
          sortable: true
        },
        {
          label: 'Gain',
          field: 'gain',
          sortable: true
        },
        {
          label: 'Entry',
          field: 'entry',
          sortable: true
        },
        {
          label: 'Exit',
          field: 'exit',
          sortable: true
        },
        {
          label: 'Last Price',
          field: 'last_price',
          sortable: true
        }
      ]
            
        }
     },
        mounted(){

            this.fetchInstruments(); 
             

 socket.on("send-realtime-subscription", (s) => {

this.generateSignals(s)
this.CurrentTick = [...s];
});
        }
    }
</script>


<style lang="scss" scoped>
 table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    text-align: left;
    padding: 8px;
    border: 1px solid #ddd;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #ddd;
  }
</style>