<template>
    <div>

      <!-- {{ scriptsWithCondition }} -->
        <!-- <h2> total scritps {{scriptsWithCondition.length}}scriptsWithCondition. gain  {{ scriptsWithConditionGain }}</h2> -->
    
    
    
    
        <!-- <h2> total scritps {{scriptsWithCondition.length}}scriptsWithCondition. gain  {{ scriptsWithConditionGain }}</h2> -->

        <!-- <h1>Gain ratio {{ gainRatio }}</h1>
        <vue-good-table :columns="columns" 
        
        :rows="scriptsWithCondition" :paginate="true" :lineNumbers="true" /> -->


<!-- {{ winners }} -->

        <table>
          <tr v-for="(win,index) in winners1" :key="index">
            <td>
{{ index+1 }}

            </td>

            <td>

              {{ win.pricePoints.d2.normalDate }}
            </td>
            <td>

              <a :href="win.chart" target="_blank">{{ win.tradingsymbol }}</a>
              
            </td>
            <td>

              {{ win.ohlc.open }}

            </td>
            <td>
              {{ win.last_price }}


            </td>
            <td>

{{ (win.last_price-win.ohlc.open)*win.lot_size }}

            </td>
          </tr>
        </table>

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


var instruments;
await  fetch("../../../instruments/instrumentsForMining.json")
      .then((response) => response.json())
      .then((data) => 
      {


        // console.log(data,'data1')
        instruments = data;
      }
    
      
      
      
      ); 


    export default {

        computed:{


          winners1(){

            return this.winners.sort((a,b)=>a.gain-b.gain)


          },
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

gainers(s){

s.forEach(e=>{

// console.log(s,'s')
  let cis=this.instruments.filter(i=>i.instrument_token==e.instrument_token)[0];

  let {d2}=cis.pricePoints;
  if(!d2){

    return false;
  }
 

 


  //  console.log(cis.pricePoints.d2.high,e.last_price, cis.pricePoints.d2.high<e.last_price,d2.normalDate)

  let {d1,d3}=cis.pricePoints;
  if(
    
  //  e.last_price<e.ohlc.open  &&


  e.ohlc.open>e.ohlc.close*1.2

//  &&  e.ohlc.low< e.ohlc.open*.8

//  && e.ohlc.close>e.ohlc.low*1.2

  // && e.ohlc.open==e.ohlc.high
  
 &&
  e.ohlc.open!=0  


  && d3.open!=d3.close
  
  // && cis.pricePoints.d3.volume<cis.pricePoints.d2.volume
  
  
//   &&

//  cis.pricePoints.d2.high<e.last_price
  ){


console.log(e)
    cis.ohlc=e.ohlc;
    cis.last_price=e.last_price
    cis.gain=(e.last_price-e.ohlc.open) *cis.lot_size
    

    // this.winners.push(cis)
    

    let present=this.winners.some(w=>w.instrument_token==cis.instrument_token)
    if(!present){

      
      

// 
        this.winners.push(cis)

      


    }


  }


})


},
  
            setInstrumentTokens() {

   

    


let tokn=this.instruments.map(i=>parseInt(i.instrument_token))

  socket.emit("subscribe-orders", JSON.stringify(tokn));

},

            async fetchInstruments(){
                this.instruments =instruments;
                this.setInstrumentTokens();

            },



            checkPricePoints(cis) {

// console.log('from fn')
const pricePoints = cis.pricePoints;


let {d0,d1,d2,d3,d4,d5,d6,d7}=pricePoints;

if(
d1.low>d2.low 

// &&
// d2.low>d3.low &&
// d3.low>d4.low 


){

return true
}else{


return false;
}




},


async generateSignals(s){



      // console.log(this.instruments,'this.instruments')






   

  if(s.length==0){

    this.scriptsWithCondition=this.instruments.filter(cis=>{
// console.log(this.checkPricePoints(cis),'cis11')

let currentTick=s.find(s1=>s1.instrument_token==cis.instrument_token);

if(currentTick && currentTick.ohlc.high==currentTick.last_price){

return true

}else{


  return false;
}

return  this.checkPricePoints(cis);

    })

console.log(this.scriptsWithCondition,'this.scriptsWithCondition')
  }

// console.log(s)

if(typeof this.instruments=='undefined' || this.instruments.length==0){
return;

        }

    for(let l=0;l<s.length;l++){



        let element=s[l];

     console.log(element,'element')


 
    
        let cis=this.instruments.find(i=>i.instrument_token==element.instrument_token)
if(!cis){

  // return false;
}

        const allGreater = this.checkPricePoints(cis);


console.log({allGreater},cis.tradingsymbol); // true


if(allGreater ==false){


  return false
}


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


    // let ep=cis.pricePoints.d2.high;
    // let ep=avg
    let ep=d1.close
//  let exit=element.ohlc.high*1.1;
//  let exit1=element.last_price;
 let exit1=ep*1.2;

 let {low,close,high,open}=element.ohlc;

 let lp=element.last_price;


// let exit=(exit1<high?exit1:lp);
let exit=lp;


if(element.ohlc.close<element.ohlc.open 
     
     && element.last_price>element.ohlc.open
     
     ){

      let ob={};

ob.tradingsymbol=cis.tradingsymbol;


ob.gain=(open-lp)*cis.lot_size;

ob.entry=lp;
ob.last_price=element.last_price
ob.exit=lp*1.2
this.scriptsWithCondition.push(ob)


     }

return;
// if(element.last_price && !this.scriptsWithCondition.find(i=>i.tradingsymbol==cis.tradingsymbol))


{

  // !(open==high) &&
  if(


  low<ep &&
allGreater
    
    )
    // low==open && ( (lp-open)*cis.lot_size<2500 && (lp-open)*cis.lot_size>0 )
    {


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

          winners:[],

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
          // this.generateSignals([])
       
             

 socket.on("send-realtime-subscription", (s) => {

// this.generateSignals(s)

this.gainers(s);
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