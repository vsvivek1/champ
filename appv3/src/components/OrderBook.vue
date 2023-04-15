<template>
    <div>
 <v-app>
<!-- {{orders}} -->
   <!-- <v-container fluid> -->
      <v-row>
       
        <v-col>
          <v-btn @click="updateSelectedSellorderWithLtp()">Update Sell orders with LTP </v-btn>
        </v-col>   <v-col>
          <v-btn  color="cyan" @click="updateSelectedBuyorderWithAvg()">Update BUY orders with AVG </v-btn>
        </v-col>
        
        
        
        <v-col>
        
        <v-btn @click="reclaimSoldStocks()">reclaimSoldStocks</v-btn>
          <v-btn @click="SellHoldingsWithCondition()">Sell Holdings  with Condition</v-btn>
        </v-col>
         <v-col>  <v-btn @click="getLTP()" color="cyan">Retry Buy Orders with LTPS <v-icon>mdi-rotate-left </v-icon>
      </v-btn>
         </v-col>
         <v-col>

<v-btn @click="StartTimer()">Start Timer {{timeInSecondsToTargetTime}} </v-btn>




    </v-col>

    <v-col>  <v-btn  @click="cancelSelectedOrders()" color="red">CAncel Selected Order
      <v-icon> mdi-close-circle-multiple-outline</v-icon>
    </v-btn>
    </v-col>
      </v-row>

      <!-- {{cancellScripts}} -->

<div v-show="false">{{instrumentTokens}} </div>


      

       
<div >
            <v-row  style="padding-top:-1%;background-color:'#EEEEEE'" >

                <v-col cols=6>
            <template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table

    :item-class="itemRowBackground"
      :headers="headers"
      :items="buyOrders"
      :search="search"
      class="elevation-1"
    >


     <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Buy Orders CNC</v-toolbar-title>
        <v-spacer></v-spacer>

      </v-toolbar>

      
    </template>




    <!-- <template #item.candleColor="{ item }">
   
   
    <div :style="color:item.candleColor"  >
    Chart  
    </div>


  </template> -->



 <template #item.website="{ item }">
    <a target="_blank" :href="item.website" >
    Chart  <v-icon>mdi-link</v-icon>
    </a>
  </template>

   <template v-slot:item.selected="{ item }">
        <v-simple-checkbox
          v-model="item.selected"
          :ripple="false"
         
        ></v-simple-checkbox>
      </template>

   
    
    
    </v-data-table>
  </v-card>
</template>

</v-col>
                <v-col cols=6 >
            <template>
  <v-card>




    <v-card-title>
     <v-row>
      <v-col cols=5>
 <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>

      </v-col>
    </v-row>
   
    
     


    </v-card-title>



    <v-data-table
      :headers="headers"
      :items="sellOrders"
      :search="search"
      class="elevation-1"
      :item-class="itemRowBackground"
    >
    
        <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Sell Orders CNC</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- <v-switch
          v-model="singleExpand"
          label="Single expand"
          class="mt-2"
        ></v-switch> -->
      </v-toolbar>
    </template>




    

    <template v-slot:item.selected="{ item }">
        <v-simple-checkbox
          v-model="item.selected"
          :ripple="false"
       
         
        ></v-simple-checkbox>
      </template>
    
    </v-data-table>
  </v-card>

</template>
 


</v-col>
            </v-row>
           

            </div>
          
        </v-app>

      
        <hr>




    </div>
</template>

<script>

import {io} from 'socket.io-client';

// import instruments from "../../../instruments/instrumentsAll.json" assert {type: 'json'};;


const socket=io('http://localhost:4000')

//npm install socket..io/admin-ui

import axios from 'axios'
 import sessionMixin from '@/views/sessionMixin';


//  import websocketMixin from '@/views/websocketMixin';
// ,websocketMixin
import store from '@/store';

    export default {
        name:'OrderBook',mixins:[sessionMixin],
        mounted(){


          setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      if (hours === 3 && ((minutes === 20) || (minutes === 26))) {
        this.getLTP(); //function to execute retry orders
      }
    }, 1000)


         this. clock();

         this.retryOrdersDayEndWithLtps();


let tenMinutesTimerForReclaiming= setInterval(()=>{

 this.reclaimSoldStocks();

},10*10*1000)



   socket.on('send-realtime-subscription',s=>{

// console.log('real time subscription',s);
// console.clear();

this.mutateOrdersWithLtp(s)/// function for mutating orders with real time lTP

// this.UpdateSellOrderToTargetOnLtpTrigger(s)





// console.log('sunbscription',s)

   });

            socket.on('connect',skt=>{

            // console.log('id',skt);

        
          })

          // console.log('socket ',socket )

          socket.on('send-order',(msg,room)=>{

if(room===''){

  socket.broadcast.emit('receive-order',msg)
}else{

  socket.to(room).emit('receive-order',msg)
}
            // console.log('loop back',e)
          });




          socket.on('order_update',(orderUpdates)=>{

// console.log('orderUpdates.order_id',orderUpdates.order_id)



let currentUpdate=this.orders.filter(o=>o.order_id==orderUpdates.order_id)[0]

if(typeof this.orders!='undefiined'){

  Object.assign(this.orders.filter(o=>o.order_id==orderUpdates.order_id)[0],orderUpdates);

}




// console.log('o','currentUpdat',currentUpdate)
  
          })

        

         

//           setInterval(function() {

//             // this.timeout
//     // console.log('Time left: '+this.getTimeLeft(this.timeout)+'s');
// }, 1000);
this.getOrders();



        },
   computed:{

     instrumentTokens(){

       let st=new Set();

       this.orders.forEach(o=>{
st.add(o.instrument_token)

       })

  socket.emit('subscribe-orders', JSON.stringify(Array.from(st))) ;
return JSON.stringify(Array.from(st));

     },

stringifiedInstruments(){

return JSON.stringify(this.NotCompletedBuyInstruments)

},

NotCompletedBuyInstruments(){

return this.NotCompletedBuyOrders.map(o=>o.exchange+":"+o.tradingsymbol)
},

NotCompletedBuyOrders(){
return this.orders.filter(o=>{

  //console.log(o,'o');
  
  return o.transaction_type=='BUY' && o.exchange=='NSE'   && o.status=='OPEN'
  }
  );

},

// NotCompletedSellOrdersAbovePc(a=5){

// return this.orders.filter(o=>{
  

//   // && o.status=='TRIGGER_PENDING'
//   return o.transaction_type=='SELL' && o.status=='TRIGGER PENDING'
//   }
//   );

// },



NotCompletedSellOrders(){
return this.orders.filter(o=>{
  

  // && o.status=='TRIGGER_PENDING'
  return o.transaction_type=='SELL' && (o.status=='TRIGGER PENDING' || o.status=='OPEN' || o.status=="AMO REQ RECEIVED") 
  }
  );

},

buyOrders(){

return this.orders.filter(o=>o.transaction_type=='BUY' && (o.exchange=='NSE'||o.exchange=='BSE')

&& (o.status=="OPEN" ||o.status=="AMQ RECEIVED" || o.status=="TRIGGER PENDING")


); 

},
                
sellOrders(){

return this.orders.filter(o=>o.transaction_type=='SELL' && (o.status=="OPEN" ||
  o.status=="TRIGGER PENDING") 
  
  && (o.exchange=='NSE'||o.exchange=='BSE')

&& (o.status=="OPEN" ||o.status=="AMQ RECEIVED")
  
  );

}
                
            },
            watch:{

              timeout(n,o){


              }
            },


        data(){

         

            return{
              hours:0,
              minutes:0,
              livePositions:[],
              SelectedSellorder:[],
              cancellScripts:[],
              timeout:0,
              timeInSecondsToTargetTime:0,
              newOrder:[],
              ltps:[],
              orders:[]  ,

              search: '',
        headers: [
          {
            text: '#',
            align: 'start',
            filterable: false,
            value: 'name',
          },
          { text: 'Symbol ()', value: 'tradingsymbol' },
          { text: 'S. Price', value: 'price' },
          { text: 'AVG', value: 'holding_details.average_price' },
           { text: 'LTP', value: 'last_price' },
          { text: 'TYPE', value: 'order_type' },
          { text: 'LIVE GAIN', value: 'live_gain' },
          { text: 'chart', value: 'live_gain' },
         
          { text: 'Gain', value: 'gain' },
          { text: 'Status', value: 'status' },
          { text: 'Link', value: 'website' },
          { text: 'candleColor', value: 'candleColor' },
          { text: 'Selected', value: 'selected' },
        ],
            }



        },
        methods:{

retryOrdersDayEndWithLtps(){
  


  if(this.hours==15 && (this.minutes>20 && this.minutes<25)){


    this.getLTP();
  }


},


clock(){


  setInterval(()=>{
    this.hours=new Date().getHours();

this.minutes=new Date().getMinutes()
    
  },2000)



},

         async  getOHLC(accessToken,ar) {

          



            
      let arr = JSON.stringify(ar);
     
      let url2="/api/postOHLC";
      let ob={};
      ob.symbols=arr;
      ob.accessToken=this.accessToken;

    return   axios.post(url2,ob).then((res) => {
      return res.data

        })
       
        
        },

          playSound(){

                   var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
                  audio.play();
          },


           async getPositions() {
   

      let url = "/api/getPositions";

      let obj = {};
      obj.accessToken = this.accessToken;
      return axios.post(url, obj).then((res) => {
        if (typeof res.data.net == "undefined") return [];

      

        return res.data.net.filter(p=>p.exchange=='NSE' && p.quantity<0);
      });
    },

        async   reclaimSoldStocks(){

            //check there is already the reclaim live order  order



          this.orders=await this.getOrdersAsync();
        let liveOrderStocks= 
        this.orders        
        .filter(          
          o=>o.transaction_type=="BUY" 
    && o.status=="OPEN"        
        && o.exchange=="NSE"        
        )
         .map(r=>r.instrument_token)


        let alreadyExecuted=
          this.orders        
        .filter(          
          o=>o.transaction_type=="BUY" 
    && o.status=="COMPLETE"        
        && o.exchange=="NSE"        
        )
         .map(r=>r.instrument_token)
        
        
        // console.log(liveOrderStocks,'liveOrderStocks Buy');
            
//get sold and completed stocks

 let soldStocks1=        this.orders        
        .filter(          
          o=>o.transaction_type=="SELL" 
        
        && o.exchange=="NSE"   
        && o.status=="COMPLETE"      
        )



        let soldStocks=await this.getPositions() ;

        // console.log(soldStokcks,'soldStokcks');

        // return false;
        
        // .map(r=>r.instrument_token)
        //    
// console.log(soldStocks,'soldStocks')

let finalSoldStock=soldStocks.filter(r=> !(
  
  liveOrderStocks.includes(r.instrument_token)

  
  ));

let finalSoldStocksTokens=finalSoldStock
.map(i=>i.instrument_token)

    

//  console.log(finalSoldStocks,'final soldStocks');

// console.log(this.accessToken,'this.accessToken')

let ohlc=await this.getOHLC(this.accessToken,finalSoldStocksTokens);

// if(oh)

// console.log(ohlc,'ohlc')






/////////////////////////////////new
 ////////////////////////////place sl

      const url = "/api/PlaceTarget";

  

      // let map = this.StrategicStocks.map((longbuildup) => {
let map = Object.keys(ohlc).map(r=>{

let tradingsymbol=instruments.
filter(i=>i.instrument_token==r)[0].tradingsymbol;

let quantity=finalSoldStock.filter(i=>i.instrument_token==r)[0].quantity*-1
let price=finalSoldStock.filter(i=>i.instrument_token==r)[0].average_price
let exchange=finalSoldStock.filter(i=>i.instrument_token==r)[0].exchange

// console.log(finalSoldStock.filter(i=>i.instrument_token==r)[0])

      

        let order = {};
        if (true) {
          
          
          order.variety = 'regular'
          order.params = {};
          order.params.exchange = exchange;
          order.params.tradingsymbol =
            tradingsymbol

order.params.tradingsymbol= tradingsymbol
                     order.params.transaction_type = "BUY";
          order.params.quantity = quantity
                 order.params.product = "CNC";
              order.params.order_type = "LIMIT";
          order.params.validity = "DAY";
       
     
          order.params.price = (price*.98).toFixed(1);
          order.params.tag = 'buyBack';
        }

        return order;
      });

    
    //  alert(map.length);

    // return false;

      let data1 = JSON.stringify(map);

      let data = {};

      data.accessToken = this.accessToken;
      data.sessionString = JSON.stringify(this.session);
      data.ZerodhaParams = data1;
     
     

      axios.post(url, data).then((res) => {
     
      console.log(res.data,'res.data')
      });
      ////////////////////////////place sl



/////////////////////////////////new

/// get days low or choosen re order point 

// set the reclaim qty

//place reverse order 




          },

          updateSelectedSellorderWithLtp(){
// this.SelectedSellorder=
this.newOrder=
this.orders.filter(o=>o.selected==true && o.transaction_type=="SELL").map(i=>{

let o={};
    // o.variety=i.variety;
    o.variety='regular';
    o.order_id=i.order_id;
    let params={};
    // let qry=i.exchange+":"+i.tradingsymbol;
    // let newPrice=i.ltp;
    params.price=i.last_price;
    // params.order_type=i.last_price;
params.trigger_price=i.last_price;
    o.params=params;

    // console.log('o',o)
    return o;

});

this.updateOrder();

// .map(o=>{});

          },  
          
          updateSelectedBuyorderWithAvg(){
// this.SelectedSellorder=
this.newOrder=
this.orders.filter(o=>o.status=="OPEN" && o.transaction_type=="BUY").map(i=>{

let o={};
    // o.variety=i.variety;
    o.variety='regular';
    o.order_id=i.order_id;
    let params={};
    // let qry=i.exchange+":"+i.tradingsymbol;
    // let newPrice=i.ltp;
    params.price=i.last_price;
    // params.order_type=i.last_price;
params.trigger_price=i.last_price;
    o.params=params;

    console.log('orders2',o)
    return o;

});

this.updateOrder();

// .map(o=>{});

          },

          cancelSelectedOrders(){


            ///get orders to cancel

  ///send axios

  // cancelOrder(variety, order_id, paramsopt)


this.cancellScripts=this.orders.filter(o=>o.selected==true).map(o=>{
  
  let ob={};
  
  ob.order_id=o.order_id;
  ob.variety='regular';

  return ob;
  
  
  });

  let StrigifiedArray=JSON.stringify(this.cancellScripts);

  let url="/api/CancelOrders";

  let params={};
  params.accessToken=this.accessToken;
  params.arr=StrigifiedArray;


  axios.post(url,params).then(r=>console.log('cancelled orders',r))

          },

          SellHoldingsWithCondition(){

            


          },

          UpdateSellOrderToTargetOnLtpTrigger(s){
            
let hours=new Date().getHours();

let minutes=new Date().getMinutes()


var targetPerCentage;
switch (hours){
case (hours>9 && hours<11):
targetPerCentage=19;
  break;
  
  case (hours>11 && hours<13):
 targetPerCentage=15;
  break;
 case (hours>13 && hours<14):
targetPerCentage=12;
  break;
case (hours>14 && hours<16):
targetPerCentage=10;
  break;

default:
   targetPerCentage=15;
  break;

}




this.newOrder=[];

let counter=0;
        s.forEach(element => {
  let instrument_token=element.instrument_token;
  let last_price=element.last_price;
  let ohlc=element.ohlc;

let pcChange1=(last_price-ohlc.close)/ohlc.close
let pcChange=pcChange1*100


counter=counter+1



  //find instrument token

  

  ///get order number

  // console.log('instrument_token',instrument_token)

  
 let order= this.NotCompletedSellOrders.filter(o=>
 o.instrument_token==instrument_token && (o.status=="OPEN" ||
  o.status=="TRIGGER PENDING")
    )[0];
// console.log('order',order );
// return false;
// && (o.status=="AMO REQ RECEIVED" || 
//  o.status=="OPEN" || o.status=="TRIGGER PENDING")



// console.log('ohlc',ohlc.open,ohlc.high,ohlc.low,ohlc.close,'pcchange',pcChange)

// console.log('hours',hours,minutes,'targetPerCentage1',targetPerCentage,'pcChange=',pcChange,'counter',counter);

while(counter<5){
// console.log('order3',order);

}

if(order.hasownProperty('live_order_triggered'))
if(order.live_order_triggered==true){

if(pcChange>targetPerCentage){
// console.log('order',order)


this.$set(this.NotCompletedSellOrders.filter(o=>
 o.instrument_token==instrument_token && (o.status=="OPEN" ||
  o.status=="TRIGGER PENDING")
    )[0],'live_order_triggered',true)
 let o={};
    o.variety='regular';
    o.order_id=order.order_id;
    let params={};
    let qry=order.exchange+":"+order.tradingsymbol;
      params.price=last_price
    params.order_type='NRML'
    o.params=params;

this.newOrder.push(o);


this.playSound();
}

}



  // update the order to sell





});
let c=0;
if(this.newOrder.length>0){
c++;
if(c==1)
  console.log('this.newOrder',this.newOrder)

// this.updateOrder();
}

// console.clear();
          },

          mutateOrdersWithLtp(s){

            s.forEach(element => {

              // console.log('element',element)
  let instrument_token=element.instrument_token;
  let last_price=element.last_price;
  let average_price=element.average_price;
//  console.log('this.orders.filter(o=>o.instrument_token==instrument_token)[0]',
//  this.orders.filter(o=>o.instrument_token==instrument_token));

this.orders.filter(o=>o.instrument_token==instrument_token).forEach(e=>{

  // console.log('e',e)

  // let holding=e.holding_details;
  // console.log('holding_details',e);

  this.$set(e,'previous_last',e.last_price)
this.$set(e,'last_price',last_price);

if(e.previous_last<e.last_price){
this.$set(e,'candleColor','green');

}else if (e.previous_last>e.last_price){

this.$set(e,'candleColor','red');
}else if (e.previous_last==e.last_price){

this.$set(e,'candleColor','grey');
}

this.$set(e,'live_gain',last_price);
this.$set(e,'average_price',average_price);


// console.log('last_price',average_price);



})


//  this.$set(this.orders.filter(o=>o.instrument_token==instrument_token)[0],'last_price',last_price)
//  this.$set(this.orders.filter(o=>o.instrument_token==instrument_token)[0],'live_gain',
 
//  last_price* this.orders.filter(o=>o.instrument_token==instrument_token)[0]*holding_details.average_price
 
 
 
//  )

});


          },
          getTimeLeft(timeout) {
    return Math.ceil((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
},

StartTimer(){
let currentTime=new Date();
let TargetTimeToday=new Date();
TargetTimeToday.setHours(15);
TargetTimeToday.setMinutes(28);
this. timeInSecondsToTargetTime=(TargetTimeToday-currentTime);

// alert(timeInSecondsToTargetTime);
// this.timeInSecondsToTargetTime=2000;

let vue=this;

this.timeout=setTimeout( this.getLTP, this.timeInSecondsToTargetTime);

},


getLTP(){

// alert('or');
// false;

// let url="/api/getLTP/accessToken/"+this.accessToken+"/instruments/"+this.stringifiedInstruments;
let url="/api/getLTP/accessToken";
// console.log(url);

let ob={};
ob.accessToken=this.accessToken;
ob.instruments=this.stringifiedInstruments;

console.log(ob)
axios.post(url,ob).then(
// axios.get(url).then(

res=>{

  // console.log(res,'res')
  this.ltps=res.data;

  // console.log(this.ltps,'ltps')
  this.newOrder=[];
this.newOrder=this.NotCompletedBuyOrders.map(

  i=>{
// console.log('i',i)
    let o={};
    o.variety=i.variety;
    o.order_id=i.order_id;
    let params={};
    let qry=i.exchange+":"+i.tradingsymbol;
    let newPrice=this.ltps[qry];
    params.price=newPrice.last_price;

    o.params=params;

    // console.log('o',o)
    return o;

  }
);


  // res.data.forEach(r=>r.selected=false);
return this.newOrder;
}
).then(r=>{

  console.log(this.newOrder,'new order')
this.updateOrder();

})

},

itemRowBackground(item){


switch(item.candleColor){

case 'red':

return 'light-red';
break;
case 'green':

return 'green';
break;

case 'grey':

return 'white';
break;


}

// return item.candleColor == 'red' ? 'red' : 'green'

},

updateOrder(){

  let ordersString=JSON.stringify(this.newOrder);
  // console.log('ordersString=',ordersString)

  let params={};
  params.accessToken=this.accessToken;
  params.ordersString=ordersString;
let url="/api/modifyOrders";

axios.post(url,params).then(res=>{

  // console.log('orders modify reply',res.data)

  this.getOrders();//refreshing orders
})

},

async getOrdersAsync(){

let url="/api/getOrders/"+this.accessToken;

return axios.get(url).then(

res=>{
  
  res.data.forEach(r=>{
    
    r.selected=false;
    r.website=`https://kite.zerodha.com/chart/ext/ciq/${r.exchange}/${r.tradingsymbol}/${r.instrument_token}/`
    
  });

  return res.data;


}
)

},
     
getOrders(){

let url="/api/getOrders/"+this.accessToken;

axios.get(url).then(

res=>{
  

  res.data.forEach(r=>{
    
    r.selected=false;
    // r.website=`https://kite.zerodha.com/chart/ext/ciq/$/`
    r.website=`https://kite.zerodha.com/chart/ext/ciq/${r.exchange}/${r.tradingsymbol}/${r.instrument_token}/`
    
  });
  this.orders=res.data
  
  // .forEach(e=>{

  //   e.website=`https://kite.zerodha.com/chart/ext/ciq/${holding.exchange}/${holding.tradingsymbol}/${holding.instrument_token}/`
  // })
}
)

},
cancelOrders(){

  ///get orders to cancel

  ///send axios

  // cancelOrder(variety, order_id, paramsopt)
}

        }
    }
</script>

<style scoped>

.red{

  background-color:'red';
}.green{

  background-color:'green';
}
</style>