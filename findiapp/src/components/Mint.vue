<template>
  <div>

<v-row>
  <v-col>

 <v-icon
      color="red"
      v-if="heartBeat"
      title="if This symbol changes color switches between red and blue system is conencted to market"
    >
      mdi-heart
    </v-icon>

    <v-icon
      color="blue"
      v-if="!heartBeat"
      title="if This symbol changes color switches between red and blue system is conencted to market"
    >
      mdi-heart
    </v-icon>

  </v-col>
  <v-col>
<img  v-if="chat_id<-1" src="https://img.icons8.com/color/48/000000/twitter--v2.png"/>


  </v-col>

  <v-col>
<v-icon color="blue">mdi-clock</v-icon> {{ hours }}: {{ minutes }} :
    {{ seconds }}


  </v-col>
</v-row>


    
<v-btn v-if="!showSignals" @click="showSignals = true"> show Signals </v-btn>
    <v-btn v-if="showSignals" @click="showSignals = false"> Hide signals </v-btn>

    <table CLASS="table table-compact" v-if="showSignals">
      <thead>
        <th>INDEX</th>
        <th>Symbol</th>
        <th>Entry</th>
        <th>Qty</th>
        <th>Entry Price</th>
        <th>Exit price</th>
        <th>STATUS</th>
        <th>PL</th>
        <th>CHART</th>
      </thead>
      <tbody>
        <tr v-for="(generatedSignal, index) in generatedSignals" :key="index">
          <td>{{ index }}</td>
          <td>{{ generatedSignal.symbol }}</td>
          <td>{{ generatedSignal.entry }}</td>
          <td>{{ generatedSignal.quantity }}</td>

          <td>{{ generatedSignal.longPrice }}</td>
          <td>{{ generatedSignal.shortPrice }}</td>
          <td>{{ generatedSignal.status }}</td>
          <td v-if="generatedSignal.entry == 'SHORT'">
            {{ generatedSignal.shortPrice - trade.longPrice }}
          </td>
          <td v-if="generatedSignal.entry == 'LONG'">
            {{ generatedSignal.longPrice - tgeneratedSignal.shortPrice }}
          </td>

          <td>
            <a target="_blank" :href="generatedSignal.website">
              Chart <v-icon>mdi-link</v-icon>
            </a>
          </td>
        </tr>
      </tbody>
    </table>

&nbsp;
    
    
     

    <v-btn v-if="!showTrades" @click="showTrades = true"> show trades </v-btn>
    <v-btn v-if="showTrades" @click="showTrades = false"> Hide trades </v-btn>

    <table CLASS="table table-compact" v-if="showTrades">
      <thead>
        <th>INDEX</th>
        <th>Symbol</th>
        <th>Entry</th>
        <th>Qty</th>
        <th>Entry Price</th>
        <th>Exit price</th>
        <th>STATUS</th>
        <th>PL</th>
        <th>CHART</th>
      </thead>
      <tbody>
        <tr v-for="(trade, index) in dayTrades" :key="index">
          <td>{{ index }}</td>
          <td>{{ trade.symbol }}</td>
          <td>{{ trade.entry }}</td>
          <td>{{ trade.quantity }}</td>

          <td>{{ trade.longPrice }}</td>
          <td>{{ trade.shortPrice }}</td>
          <td>{{ trade.status }}</td>
          <td v-if="trade.entry == 'SHORT'">
            {{ trade.shortPrice - trade.longPrice }}
          </td>
          <td v-if="trade.entry == 'LONG'">
            {{ trade.longPrice - trade.shortPrice }}
          </td>

          <td>
            <a target="_blank" :href="trade.website">
              Chart <v-icon>mdi-link</v-icon>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <hr />

    <!-- {{instrumentTokenList}} -->
    

    <v-col cols=5 offset=4>
    <v-alert border="left"
      elevation="2"
      colored-border

       icon="mdi-twitter"
    
    
     type="info"> Long buy above tc target r1 sl bc & short below bc target s2 sl tc</v-alert>

     </v-col>

    <hr />

    <v-row align="center" class="mb-2">
      <v-col cols="2" offset="4">


<label for="sel">Select the Index</label>
 <select
      name=""
      id="sel"
      class="form-control"
      v-model="selectedCategory"
      @change="fetchSymbolsForTheCategory"
    >
      <option
        v-for="category in categories"
        :key="category.category"
        :value="category.category"
      >
        {{ category.category }}
      </option>
    </select>

      </v-col>

       <v-col cols="3">
        <label for="sel">Amount per stock</label>
        <input type="text" class="form-control" v-model="amountPerStock" placeholder="Amount Per Stock">
      </v-col>
     
      <v-col cols="1" >

        <v-btn color="green" icon title="Refresh" @click="fetchSymbolsForTheCategory"> 
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
      
      <v-col cols="1">

        <v-btn color="red" icon title="Refresh trade status" @click="refreshTradeStatus"> 
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>

   


    <div class="loading" v-if="loadingContent">

  <div>
   
    <v-progress-linear
      indeterminate
      color="green"
    ></v-progress-linear>
    <br>
    
  </div>

loading... {{ScriptLength}}
</div>

    <div class="container" style="position: relative">
      <!-- <ul style="position: absolute; height: 100%; width :100%">
    <li v-for ="index  in 100" :key="index" style="margin-top:1.5cm;border-bottom:1px solid grey;height:40px" >

  
    </li>
</ul> -->

      <ul v-if="scriptLoaded" style="position: absolute; height: 100%">
        <li v-for="script in scripts" :key="script.symbol">
          <div v-if="typeof(script.pricePoints)!='undefined' ">
            <v-row>
              <v-col>{{ script.symbol }}</v-col>

              <v-col>LTP {{ script.ltP }}</v-col>

              <v-col>
                R1
                {{ JSON.parse(script.pricePoints.pivotPoints).r1 }}
              </v-col>
              <v-col>
                R2
                {{ JSON.parse(script.pricePoints.pivotPoints).r2 }}
              </v-col>
              <v-col>
                R3

                {{ JSON.parse(script.pricePoints.pivotPoints).r3 }}
              </v-col>
              <v-col>
                Pivot

                {{ JSON.parse(script.pricePoints.pivotPoints).pivotPoint }}
              </v-col>

              <v-col>
                BC

                {{ JSON.parse(script.pricePoints.pivotPoints).bc }}
              </v-col>

              <v-col>
                BC-S1/BC %

                {{
                  ((JSON.parse(script.pricePoints.pivotPoints).bc -
                    JSON.parse(script.pricePoints.pivotPoints).s1) *
                    100) /
                  JSON.parse(script.pricePoints.pivotPoints).bc
                }}

                Stop loss =
                {{
                  ((JSON.parse(script.pricePoints.pivotPoints).bc -
                    JSON.parse(script.pricePoints.pivotPoints).tc) *
                    100) /
                  JSON.parse(script.pricePoints.pivotPoints).bc
                }}
              </v-col>

              <v-col>
                TC

                {{ JSON.parse(script.pricePoints.pivotPoints).tc }}
              </v-col>

              <v-col>
                S1

                {{ JSON.parse(script.pricePoints.pivotPoints).s1 }}
              </v-col>
              <v-col>
                s2

                {{ JSON.parse(script.pricePoints.pivotPoints).s2 }}
              </v-col>
              <v-col>
                S3

                {{ JSON.parse(script.pricePoints.pivotPoints).s3 }}
              </v-col>
            </v-row>

            
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

import axios from "axios";
import sessionMixin from "@/views/sessionMixin";

const MintTradeModel = require("../../../models/MintTrade");
const Order = require("../../../models/Orders");

const categories = require("./../../../scraping/stockSymbolCategories.json");
// ../scraping/stockSymbolCategories.json

export default {
  destroyed() {
    // console.clear()
    socket.emit("forceDisconnect", this.symbolList);
  },

  updated() {},

  computed: {

    dayTrades(){


return this.localStorage.sort((a,b)=>{


if(a.symbol<b.symbol){

return -1;
}if(a.symbol>b.symbol){

return 1;
}


})

    },
    instrumentTokenList() {
      return this.scripts.map((s) => s.instrument_token);
    },
  },
  name: "mint",
  mixins: [sessionMixin],
  methods: {

    sendSquareOffAlertToTelegram(){
 let trades;

      let today = this.today();

      if (localStorage.getItem(today) == null) {
        trades = [];

        //console.log(symbol, 'has not been traded today -inside get scritps')
      } else {
        //console.log(symbol, 'hAS been traded today-inside get scritps')

        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }



     let openTrades= trades.filter(t1=>t1.status=='COMPLETE')
         
     
     .forEach(t=>{

let entryPrice;
let last_price;
let b;
//console.log('this.LatestQuotes',this.LatestQuotes.length)
  if(this.LatestQuotes.length>0){


last_price=this.LatestQuotes.filter(lq=>lq.tradingsymbol==t.symbol)[0].last_price;





let result='';
let pl=0;
let b='';
        if(t.transaction_type=='BUY'){


entryPrice=t.longPrice;
if((last_price-entryPrice)<0){
result='LOSS';

pl=(last_price-entryPrice)*-1

}else{

result='PROFIT';

pl=(last_price-entryPrice);

}


        }else{
entryPrice=t.shortPrice;




if((entryPrice-last_price)<0){
result='LOSS';

pl=(last_price-entryPrice)*-1

}else{

result='PROFIT';

pl=(entryPrice-last_price);

}

        }

b=` ,Book ${result} of ${pl} per share`;

}



var text=`Neither target or stop loss hit for the ${t.transaction_type} trade of ${t.symbol} at ${entryPrice} .
Please Square off your possitions now @ ${last_price} ${b} `;

console.log(text)

this.sendToTelegramGroup(text);




      })


    },

    getChatId(){
    this.chat_id=-1;
    if(this.chat_id!=1){
        let url= `https://api.telegram.org/bot${this.token}/getUpdates`;

        

     return    axios.get(url).then(r=>{
            this.chat_id=r.data.result[0].channel_post.chat.id;


return this.chat_id;
          
            
                }).catch(e=>e) 

                var txt="First time";

               

    }

},


    sendToTelegramGroup(text){
      

if(true){

    let obj={};
obj.chat_id=this.chat_id;
obj.text=text;


    let urlToSendMessage=`https://api.telegram.org/bot${this.token}/sendMessage`;

    axios.post(urlToSendMessage,obj).then(r=>{

       // console.log('from bot ',r.data.result[0])

        
    }).catch(e=>e)
       // console.log('from bot ',r.data.result[0].channel_post.chat.id)


    }








    },

updateSignalFromLocalStorageToVaraible(){
let today = this.today();
let key='signal-'+this.selectedCategory+"-"+today;

if(localStorage.getItem(key)!=null){

    this.generatedSignals=JSON.parse(localStorage.getItem(key))

}else{
this.generatedSignals=[]

}


},

    
    setChart(array) {
      array.forEach((s) => {
        //let w = `https://kite.zerodha.com/chart/ext/ciq/${s.instrument_token.exchange}/${s.symbol}/${s.instrument_token.instrument_token}/`;

        let w=1;
        this.$set(s, "website", w);
      });

      return array;
    },


    async refreshTradeStatus(){


let livePositionsTmp=await this.getPositions();

this.livePositions=livePositionsTmp.net;

let today=this.today();

let tmp;
  if (localStorage.getItem(today) == null) {
        tmp = [];
      } else {
        tmp = JSON.parse(localStorage.getItem(today));
        localStorage.removeItem(today);
      }

tmp.forEach(

t=>{

let trade=this.livePositions.filter(lp=>lp.tradingsymbol==t.symbol)[0];

if(typeof trade=='undefined'){

  return false
}

if(trade.quantity!=0){

t.status='COMPLETE'
t.quantity=trade.quantity;
t.average_price=trade.average_price
}


  

     
     



console.log('t of storage',t)


}

)



      
      let tmp2 = JSON.stringify(tmp);
     localStorage.setItem(today, tmp2);

     this.localStorage=JSON.parse(localStorage.getItem(today));

  

      
    },

    async getPositions() {
      let url = "/api/getPositions";

      let obj = {};
      obj.accessToken = this.accessToken;
      return axios.post(url, obj).then((res) => {
        return res.data;
      });
    },

    async getCurrentPositionsAndSquareOff() {
      //get live possitions

      this.livePositions = await this.getPositions();

      let orderArray = this.livePositions.day
        .filter((l) => l.product == "MIS")
        .map((lp) => {
          let transaction_type;

          let entry;
          if (lp.quantity < 0) {
            entry = "SHORT";

            // -ve qty so short --> to cover buy
            transaction_type = "BUY";
          } else if (lp.quantity <= 0) {
            transaction_type = "SELL";
            entry = "LONG";
          }

          let qty = lp.quantity * -1;

          //console.log("quantity", lp);

          let order_type = "MARKET";
          let Price = lp.last_price;
          let trigPrice = lp.last_price;

          let longPrice = lp.day_buy_price;
          let shortPrice = lp.day_sell_price;

          return this.buldOrderArray(
            lp.tradingsymbol,
            transaction_type,
            qty,
            order_type,
            Price,
            trigPrice,
            entry,
            longPrice,
            shortPrice
          );
        });

     // this.placeOrder(orderArray); //impotant
      console.log(
        "orderArray",
        orderArray,
        "orderArray lenght",
        orderArray.length
      );
      console.log(
        "this.livePositions",
        this.livePositions,
        "this.livePositions.lenght",
        this.livePositions.day.length
      );

      ///reverese buy to seell

      // set price as ltp

      //place order
    },

    buldOrderArray(
      tradingsymbol,
      transaction_type,
      qty,
      order_type,
      Price,
      trigPrice,
      entry,
      longPrice,
      shortPrice
    ) {
      //console.log('from build order array')

      let order = {};

      //   order.variety = this.selectedVariety;

      order.entry = entry;
      order.longPrice = longPrice;
      order.shortPrice = shortPrice;

      order.variety = "regular";
      /// order.variety = 'amo';
      order.params = {};
      order.params.exchange = "NSE";
      order.params.tradingsymbol = tradingsymbol;
      order.params.transaction_type = transaction_type;

      order.params.quantity = qty;

      let total_quantity = qty;
      let disclosed_quantity = Math.ceil(total_quantity / 10);

      order.params.disclosed_quantity = disclosed_quantity;

      // order.params.quantity=1;
      order.params.product = "MIS";
      order.params.order_type = order_type;
      order.params.validity = "DAY";

      order.params.trigger_price = trigPrice;
      order.params.price = Price;

      return order;
    },

    updateTradeStatusInLocalStroage(orderArray) {
      //let status=orderUpdates.status;
      //this.setScriptTradedStatus(tradingsymbol,'status',status);

      //let quantity=orderUpdates.quantity;
      //this.setScriptTradedStatus(tradingsymbol,'quantity',quantity);

      //let average_price=orderUpdates.average_price;
      //this.setScriptTradedStatus(tradingsymbol,'average_price',average_price);

      let today = this.today();

      let obj = {};
      obj.symbol = orderArray[0].params.tradingsymbol;
      obj.price = orderArray[0].params.price;
      obj.transaction_type = orderArray[0].params.transaction_type;
      obj.quantity = orderArray[0].params.quantity;

      obj.entry = orderArray[0].entry;
      obj.longPrice = orderArray[0].longPrice;
      obj.shortPrice = orderArray[0].shortPrice;

      let tmp;

      if (localStorage.getItem(today) == null) {
        tmp = [];
      } else {
        tmp = JSON.parse(localStorage.getItem(today));
        localStorage.removeItem(today);
      }

      tmp.push(obj);
      let tmp2 = JSON.stringify(tmp);
      localStorage.setItem(today, tmp2);

      //this.once=false;

      this.localStorage = this.setChart(
        JSON.parse(localStorage.getItem(today))
      );
    },

    today() {
      var d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toLocaleString("sv").slice(0, 10);
    },
    placeOrder(orderArray) {

      //return false;
      ////////////////////////////place sl

      //       let MintTradeModel1= new MintTradeModel({
      // session:this.session,
      //  script:orderArray[0].symbol,
      //                          instrument_token:'1',
      //                         date:this.today(),
      //                         orderDetail:orderArray[0],
      //                         order_id:-1,
      //                         status:'init',

      //       });

      if (this.once) {
        //console.log(orderArray,'orderArray')
        this.once = false;
      }

      // has updated ??

      let hasUpdated = this.hasScriptTraded(orderArray[0].tradingsymbol);

      if (hasUpdated) {
        //console.log(orderArray[0].tradingsymbol, 'has been already traded -- from place order function')
        return false;
      }

      //return false;

      const url = "/api/PlaceTarget"; //temporary change
      //return false;

      let data1 = JSON.stringify(orderArray);

      let data = {};

      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      //console.log('data',data)

      ///// update in local storage

      this.updateTradeStatusInLocalStroage(orderArray);

      //////////////////

      axios.post(url, data).then((res) => {
        //  console.log('result',res.data)
      });

      ///// update

      ////////////////////////////place sl
    },

    getScriptTradedStatus(symbol) {
      let trades;

      let today = this.today();

      if (localStorage.getItem(today) == null) {
        trades = [];

        //console.log(symbol, 'has not been traded today -inside get scritps')
      } else {
        //console.log(symbol, 'hAS been traded today-inside get scritps')

        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }

      let arr = trades.filter((t) => t.symbol == symbol); //mistake
      return arr;
    },



    checkTradingScriptOrderCompleted(symbol){
let trades;
      let today = this.today();

      if (localStorage.getItem(today) == null) {
        trades = [];

      } else {

        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }
let ln =trades.filter((t) => (t.symbol == symbol && t.status=='COMPLETE' )).length;


console.log(`from inside checkTradingScriptOrderCompleted for symbol ${symbol} and boolean for ln ${ln}` )
if(ln>0){

  return true
}else{

  return false
}
    },   
    
     checkTradingScriptOrderCycleCompleted(symbol){
let trades;
      let today = this.today();

      if (localStorage.getItem(today) == null) {
        trades = [];

      } else {

        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }


let ln =trades.filter((t) => (t.symbol == symbol && t.status=='CYCLE FINISHED' )).length;

console.log(`inside from checkTradingScriptOrderCycleCompleted function for symbol ${symbol} and ln to find boolean is ${ln} `)
if(ln>0){

  return true
}else{

  return false
}
    },

    setScriptTradedStatus(symbol, property, value) {
      let today = this.today();

      let trades;

      if (localStorage.getItem(today) == null) {
        trades = [];

        //console.log(symbol, 'has not been traded today -inside get scritps')
      } else {
        //console.log(symbol, 'hAS been traded today-inside get scritps')

        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }

      //console.log(trades,'trades');

      if (typeof (trades.filter((t) => t.symbol == symbol)[0]) == "undefined") {
        //console.log('unknown trade updates ',symbol);

        return false;
      }

      trades.filter((t) => t.symbol == symbol)[0][property] = value;

      console.log("status updated", property, value, symbol);

      let ar2 = trades.filter((t) => t.status == "COMPLETE");

      //console.log('complteed',ar2)

      let strigified = JSON.stringify(trades);
      localStorage.removeItem(today);
      localStorage.setItem(today, strigified);

      this.localStorage = this.setChart(
        JSON.parse(localStorage.getItem(today))
      );
    },

    hasScriptTraded(symbol) {
      if (typeof (symbol) == "undefined") return false;

      let today = this.today();

      let trades;

      if (localStorage.getItem(today) == null) {
        trades = [];

        //console.log(symbol, 'has not been traded today -inside get scritps')
      } else {
        //console.log(symbol, 'hAS been traded today-inside get scritps')

        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }

      let arr1 = trades //filter(t=>t.status!='CYCLE COMPLETED').
        .filter((t) => t.symbol == symbol);

      let arr = arr1.length;

      //console.log('inside has traded arr1',arr1)

      ///  1 ensures that one trade is only active  

      console.log('from has traded function ar lenght for symbol',symbol,arr);
      if (arr > 0) {



        return true;
      } else {
        return false;
      }
    },


    setSignalsInLocalStorage(signal){

        //stk,long or short,long/short entry-sl-target //qty // //time
 let today = this.today();

 let key='signal-'+this.selectedCategory+"-"+today;


let pvs=localStorage.getItem(key);

localStorage.removeItem(key)


let arr;
if(pvs==null){
 arr=[];

}else{

 arr=JSON.parse(pvs)   
}





 var d = new Date();
      this.hours = d.getHours();
      this.minutes = d.getMinutes();
      this.seconds = d.getSeconds();

      let obj={};
      obj.symbol=signal.symbol;
      obj.transaction_type=signal.transaction_type;
      obj.qty=signal.qty;
      obj.price=signal.price;
      obj.signalType=signal.signalType;
      obj.time=d;


arr.push(obj);


let tmp =JSON.stringify(arr);

localStorage.setItem(key,tmp);




if(localStorage.getItem(key)!=null){

    this.generatedSignals=JSON.parse(localStorage.getItem(key))

}else{
this.generatedSignals=[]

}




    },

    mutateSymbolsWithLTP(skt) {


      if (!this.scripts.length > 0) {
        console.log("NO SCRIPT LIST LOADED FOR TRADING ");

        return false;
      }


      this.LatestQuotes=skt;

      let LongProfit = 0;
      let ShortProfit = 0;

      let ln = skt.length;


      skt.forEach((symbol) => {
        /// check stok in script list
        if (!this.instrumentTokenList.includes(symbol.instrument_token)) {
          /// to avoid ticks not in watch list
          console.log("TICK DO NOT INCLUDE THE SELECTED SCRIPT ");
          return false;
        }

        //check whether a propersymbol
        if (!symbol.instrument_token > 0) {
          return false;
        }


//console.log(symbol)
        //real mutation

        this.$set(
          this.scripts.filter(
            (s) => s.instrument_token == symbol.instrument_token
          )[0],
          "pvs_ltP",
          this.scripts.filter(
            (s) => s.instrument_token == symbol.instrument_token
          )[0].ltP
        );

        this.scripts.filter(
          (s) => s.instrument_token == symbol.instrument_token
        )[0].ltP = symbol.last_price; //readl  mutation
        //real mutation

        //check the symbol has been traded

        // traded

        /// target

        // long side
        // short side

        ///stop loss

        //long side
        // short side

        //not traded

        /// entry

        // traded

        let CurScript = this.scripts.filter(
          (s) => s.instrument_token == symbol.instrument_token
        )[0];

        //console.log('symbo, near 521 has traded',CurScript.symbol)
        let hasTraded = this.hasScriptTraded(CurScript.symbol);

        if (!hasTraded)
        
        
       // if (true)
        
        
         {
          /// not traded


let chkPricePoints=this.scripts.filter(
              (s) => s.instrument_token == symbol.instrument_token
            )[0].pricePoints;

            if(typeof(chkPricePoints)=='undefined'){

              console.log('PRICE POINT NOT SET FOR THE SCRIPT ',symbol.instrument_token);
              return false;
            }





          let stock = this.scripts.filter(
            (s) => s.instrument_token == symbol.instrument_token
          )[0];

          let pivotPoints = JSON.parse(
            this.scripts.filter(
              (s) => s.instrument_token == symbol.instrument_token
            )[0].pricePoints.pivotPoints
          );

          let bc = Math.round(pivotPoints.bc, 1);
          let tc = Math.round(pivotPoints.tc, 1);

          let s1 = Math.round(pivotPoints.s1, 1);
          let s2 = Math.round(pivotPoints.s2, 1);
          let s3 = Math.round(pivotPoints.s2, 1);

          let r1 = Math.round(pivotPoints.r1, 1);
          let r2 = Math.round(pivotPoints.r2, 1);
          let r3 = Math.round(pivotPoints.r3, 1);
          let noStoksFor10k = Math.floor(10000 / parseFloat(bc));

          ////buy order
          //&& symbol.last_price<r1

          //<r1 symbol.pvs_ltP<=tc


          /// CASE WHEN LTP IS ABOVE TC WE TRIGGER BUY 

          console.log('&& symbol.pvs_ltP<=tc &',symbol.pvs_ltP,symbol)
          if (symbol.last_price > tc && symbol.last_price  < r1) {
            let tentativeProfit = (r3 - tc) * noStoksFor10k;
            if (!isNaN(tentativeProfit)){

LongProfit = LongProfit + tentativeProfit;
            }
              
            let tradingsymbol = stock.symbol;
            let transaction_type = "BUY";
            let qty = Math.floor(this.amountPerStock/tc)
            let order_type = "LIMIT";
            let Price = tc;
            let trigPrice = tc;

            let entry = "LONG";
            let longPrice = tc;
            let shortPrice = r2;

            let orderObj = this.buldOrderArray(
              tradingsymbol,
              transaction_type,
              qty,
              order_type,
              Price,
              trigPrice,
              entry,
              longPrice,
              shortPrice
            );
            let orderObjArray = [];

            orderObjArray.push(orderObj);

            this.placeOrder(orderObjArray); //important


let obj={};
      obj.symbol=tradingsymbol;
      obj.transaction_type='BUY';
      obj.qty=qty;
      obj.signalType='LONG';
      obj.price=tc;
      this.setSignalsInLocalStorage(obj)


var txt= `LONG ${tradingsymbol}, @ ${tc}, LTP ${stock.ltP}.Stop loss  ${bc},TARGET 1 ${pivotPoints.r1} TARGET 2  ${pivotPoints.r2} TARGET 3 ${pivotPoints.r3}`



this.sendToTelegramGroup(txt)

       
          }

          ///sell order
          //&& symbol.last_price>s1
          //&& symbol.pvs_ltP>=bc      
          
          
         // console.log('&& symbol.pvs_ltP>=bc'symbol.pvs_ltP)                 //else
          if (symbol.last_price < bc    && symbol.last_price > s1 ) {
            let tentativeProfit = (s3 - bc) * noStoksFor10k;
            if (!isNaN(tentativeProfit))
              LongProfit = LongProfit + tentativeProfit;

            let tradingsymbol = stock.symbol;
            let transaction_type = "SELL";
           let qty = Math.floor(this.amountPerStock/bc)
            let order_type = "LIMIT";
            let Price = bc;
            let trigPrice = bc;

            let entry = "SHORT";
            let longPrice = bc;
            let shortPrice = s2;

            let orderObj = this.buldOrderArray(
              tradingsymbol,
              transaction_type,
              qty,
              order_type,
              Price,
              trigPrice,
              entry,
              longPrice,
              shortPrice
            );
            let orderObjArray = [];

            orderObjArray.push(orderObj);

            this.placeOrder(orderObjArray); //important





///storing signals
 let obj={};
      obj.symbol=tradingsymbol;
      obj.transaction_type='SELL';
      obj.qty=qty;
      obj.price=bc;
      obj.signalType='SHORT';
      this.setSignalsInLocalStorage(obj)

var txt= `SHORT ${tradingsymbol} @ ${bc}, LTP ${stock.ltP}.Stop loss   ${tc},TARGET 1 ${pivotPoints.s1} TARGET 2  ${pivotPoints.s2} TARGET 3 ${pivotPoints.s3}`

           

this.sendToTelegramGroup(txt)

          

            if (!isNaN(tentativeProfit))
              ShortProfit = ShortProfit + tentativeProfit;
          }
        } /// end of has not traded


//check has cycle completed tooo


//for targets and sl  

// check has traded //check order is completed, checck cycle is completed


//check trading scripts order has been completed

let hasTradingScriptOrderCompleted=this.checkTradingScriptOrderCompleted(CurScript.symbol)

let hasTradingScriptOrderCycleCompleted=this.checkTradingScriptOrderCycleCompleted(CurScript.symbol)

//let hasReverseOrderPlaced=this. hasReverseOrderPlaced(CurScript.symbol)


        if (hasTraded && hasTradingScriptOrderCompleted && !hasTradingScriptOrderCycleCompleted) {
          /// or time greater than




let chkPricePoints=this.scripts.filter(
              (s) => s.instrument_token == symbol.instrument_token
            )[0].pricePoints;

            if(typeof(chkPricePoints)=='undefined'){

              console.log('PRICE POINT NOT SET FOR THE SCRIPT ',symbol);
              return false;
            }
          

          let stock = this.scripts.filter(
            (s) => s.instrument_token == symbol.instrument_token
          )[0];

          let pivotPoints = JSON.parse(
            this.scripts.filter(
              (s) => s.instrument_token == symbol.instrument_token
            )[0].pricePoints.pivotPoints
          );

          let bc = Math.round(pivotPoints.bc, 1);
          let tc = Math.round(pivotPoints.tc, 1);

          let s1 = Math.round(pivotPoints.s1, 1);
          let s2 = Math.round(pivotPoints.s2, 1);
          let s3 = Math.round(pivotPoints.s2, 1);

          let r1 = Math.round(pivotPoints.r1, 1);
          let r2 = Math.round(pivotPoints.r2, 1);
          let r3 = Math.round(pivotPoints.r3, 1);
          let noStoksFor10k = Math.floor(10000 / parseFloat(bc));

          let CurTraded = this.getScriptTradedStatus(CurScript.symbol);


          console.log('this.getScriptTradedStatus(CurScript.symbol)',this.getScriptTradedStatus(CurScript.symbol)[0])

          
let statuss=CurTraded.filter(c=>c.status=='COMPLETE').length;
let CurTradedStatus;
if(statuss>0){
CurTradedStatus=true

}else{
CurTradedStatus=false;

}

          let transaction_type = CurTraded[0].transaction_type;


if(typeof transaction_type=='undefined'){
console.log('undedfined triggered')
  return false;

  
}

//console.log('undedfined triggered loop outside')
//console.log(` 3 truesfor CurTraded.transaction_type ${CurTraded[0].transaction_type} CurScript.symbol ${CurScript.symbol}, hasTraded  is ${hasTraded} && hasTradingScriptOrderCompleted  is ${hasTradingScriptOrderCompleted }&& !hasTradingScriptOrderCycleCompleted is ${!hasTradingScriptOrderCycleCompleted }`)


          if (CurTradedStatus) {
            /// set as cycle over

            switch (transaction_type) {
              case "BUY":
                if (symbol.last_price >= r1) {
                  /// targets


                  this.setScriptTradedStatus(
                    stock.symbol,
                    "status",
                    "CYCLE FINISHED"
                  );

                  let tradingsymbol = stock.symbol;
                  let transaction_type = "SELL";
                  let qty = CurTraded[0].quantity;
                  let order_type = "LIMIT";
                  let Price = r1;
                  let trigPrice = r1;
                  let orderObj = this.buldOrderArray(
                    tradingsymbol,
                    transaction_type,
                    qty,
                    order_type,
                    Price,
                    trigPrice,
                    entry,
                    longPrice,
                    shortPrice
                  );
                  let orderObjArray = [];

                  let entry = "LONG";
                  let longPrice = tc;
                  let shortPrice = r1;







                  orderObjArray.push(orderObj);

                  
                  this.placeOrder(orderObjArray); //important


let obj={};
      obj.symbol=tradingsymbol;
      obj.transaction_type='SELL';
      obj.qty=qty;
       obj.price=r1;
      obj.signalType='TARGET';
      this.setSignalsInLocalStorage(obj)




                console.log("placed target order for ",tradingsymbol);

var txt=`Target hit for symbol ${tradingsymbol} , Squareoff  @ ${obj.price}. Advise to ${CurTraded[0].transaction_type} given @ Price ${tc} .Profit Per stock is ${obj.price-tc}`;
this.sendToTelegramGroup(txt)


                }

                if (symbol.last_price <= bc) {
                  ///stop loss

                   this.setScriptTradedStatus(
                    stock.symbol,
                    "status",
                    "CYCLE FINISHED"
                  );

                  let tradingsymbol = stock.symbol;
                  let transaction_type = "SELL";
                  let qty = CurTraded[0].quantity;
                  let order_type = "LIMIT";
                  let Price = bc;
                  let trigPrice = bc;
                  let orderObj = this.buldOrderArray(
                    tradingsymbol,
                    transaction_type,
                    qty,
                    order_type,
                    Price,
                    trigPrice,
                    entry,
                    longPrice,
                    shortPrice
                  );
                  let orderObjArray = [];

                  let entry = "LONG";
                  let longPrice = tc;
                  let shortPrice = bc;

                  orderObjArray.push(orderObj);

                 
                  this.placeOrder(orderObjArray); //important

let obj={};
      obj.symbol=tradingsymbol;
      obj.transaction_type='SELL';
      obj.qty=qty;
      obj.signalType='STOP LOSS';
      obj.price=bc;
      this.setSignalsInLocalStorage(obj)


//var txt=`Stop Loss hit for symbol ${tradingsymbol}  @  ${obj.price}, ${obj.transaction_type} @ ${obj.price}. Advise given at Price ${tc} .Loss Per stock is ${obj.price-tc}`;

var txt=`Stop Loss hit for symbol ${tradingsymbol} , Squareoff  @ ${obj.price}. Advise to ${CurTraded[0].transaction_type} given @ Price ${tc} .Loss Per stock  is ${tc-obj.price}`;
this.sendToTelegramGroup(txt)


                }

                break;

              case "SELL":
                if (symbol.last_price >= s1) {
                  /// targets

                    this.setScriptTradedStatus(
                    stock.symbol,
                    "status",
                    "CYCLE FINISHED"
                  );

                  let tradingsymbol = stock.symbol;
                  let transaction_type = "BUY";
                  let qty = CurTraded[0].quantity;
                  let order_type = "LIMIT";
                  let Price = s1;
                  let trigPrice = s1;
                  let orderObj = this.buldOrderArray(
                    tradingsymbol,
                    transaction_type,
                    qty,
                    order_type,
                    Price,
                    trigPrice,
                    entry,
                    longPrice,
                    shortPrice
                  );
                  let orderObjArray = [];

                  let entry = "SHORT";
                  let longPrice = bc;
                  let shortPrice = s1;

                  orderObjArray.push(orderObj);

                
                  this.placeOrder(orderObjArray); //important


                  let obj={};
      obj.symbol=tradingsymbol;
      obj.transaction_type='BUY';
      obj.qty=qty;
      obj.signalType='TARGET';
      obj.price=s1;
      this.setSignalsInLocalStorage(obj)

                  console.log("placed target order short covering ",tradingsymbol);

var txt=`Target hit for symbol ${tradingsymbol} , Squareoff  @ ${obj.price}. Advise to ${CurTraded[0].transaction_type} given @ Price ${bc} .Profit Per stock is ${obj.price-bc}`;

                 // var txt=`Target  hit for symbol ${tradingsymbol} , ${obj.transaction_type} @ ${obj.price}. Advise given at Price ${bc} .Profit Per stock is ${bc-obj.price}`;
this.sendToTelegramGroup(txt)
                }

                if (symbol.last_price >= tc) {
                  ///stop loss

                   this.setScriptTradedStatus(
                    stock.symbol,
                    "status",
                    "CYCLE FINISHED"
                  );

                  let tradingsymbol = stock.symbol;
                  let transaction_type = "BUY";
                  let qty = CurTraded[0].quantity;
                  let order_type = "LIMIT";
                  let Price = tc;
                  let trigPrice = tc;
                  let orderObj = this.buldOrderArray(
                    tradingsymbol,
                    transaction_type,
                    qty,
                    order_type,
                    Price,
                    trigPrice,
                    entry,
                    longPrice,
                    shortPrice
                  );
                  let orderObjArray = [];

                  let entry = "SHORT";
                  let longPrice = bc;
                  let shortPrice = tc;

                  orderObjArray.push(orderObj);

                 
                  this.placeOrder(orderObjArray); //important


                           let obj={};
      obj.symbol=tradingsymbol;
      obj.transaction_type='BUY';
      obj.qty=qty;
      obj.signalType='STOP LOSS';
      obj.price=tc;
      this.setSignalsInLocalStorage(obj)

                  console.log("placed stop losss order short covering ",tradingsymbol);

  //var txt=`Stop Loss hit for symbol ${tradingsymbol} , ${obj.transaction_type} @ ${obj.price}. Advise given at Price ${bc} .Profit Per stock is ${bc-obj.price}`;

  var txt=`Stop Loss hit for symbol ${tradingsymbol} , Squareoff  @ ${obj.price}. Advise to ${CurTraded[0].transaction_type} given @ Price ${bc} .Loss Per stock  is ${obj.price-tc}`;

this.sendToTelegramGroup(txt)


                }

                //let tradingsymbol=stock.symbol;

                break;
            }

            //if short
          }

          //check order is complete
        }

        //if long  target and sl

        //if short target and stop loss

        ln--;
        if (ln == 0) {
          // console.log('short',ShortProfit,'long',LongProfit,'total',ShortProfit+LongProfit)
        }

        // console.log('this.scripts.filter(s=>{s.instrument_token==skt.instrument_token;})[0]' ,)
      }); //for each
    },

    // })

    //}
    getPricePoints(inst_token, acces_token) {
      // let inst_token1=1207553;

      const url =
        "/api/pricePoints/" + inst_token + "/accessToken/" + acces_token;

      return axios.get(url).then((res) => {
        return res.data;
        this.pricePoints = res.data.pricePoints;

        this.pivotPoints = res.data.pivotPoints; //json

        this.heikinAshi = res.data.heikinAshi;

        this.pivotPointObject = res.data.pivotPointObject;
        this.yesterday = res.data.yesterday;
        // console.log('price point from mixin',this.pricePoints);
      });
    },

    mutateWithPricePointsPop() {
      this.scriptLoaded = false;
      //console.log('this.scripts.length',this.scripts.length)
      if (this.scripts.length == 0) {
        console.log("no scripts");
          this.scriptLoaded = false;;
        return false;
      
      }

      this.symbolList = [];

      let copyOfScripts = [...this.scripts];

      let ln = copyOfScripts.length;

      
      var timeInt = setInterval(async () => {

 if (copyOfScripts.length == 0) {
          clearInterval(timeInt);

          // console.clear();

         // console.log("this.symbolList", this.symbolList);

          this.scriptLoaded = true;
          socket.emit(
            "subscribe-scripts-for-mint",
            JSON.stringify(this.symbolList)
          );



this.loadingContent=false;
return ;
          
        }

        ln--;
        

        let CurrentScript = copyOfScripts.pop();
        this. ScriptLength=ln;

        

        let pp = await this.getPricePoints(
          CurrentScript.instrument_token,
          this.accessToken
        );

        //console.log('loading ...',ln,CurrentScript.symbol,pp)

        this.symbolList.push(CurrentScript.instrument_token);

        this.$set(
          this.scripts.filter(
            (s) => s.instrument_token == CurrentScript.instrument_token
          )[0],
          "pricePoints",
          pp
        );


//console.log('copyOfScripts.length',this.scripts.filter(            (s) => s.instrument_token == CurrentScript.instrument_token          )[0].pricePoints)



       
      }, 300);
    },

    mutateWithPricePointNormal() {
      let ln = this.scripts.length;

      this.symbolList = [];


let tmpScript=[...this.scripts]

let ti=setInterval(async ()=>{


let CurScript=tmpScript.pop();

 let pp = await this.getPricePoints(
            CurScript.instrument_token,
            this.accessToken
          );

          this.symbolList.push(CurScript.instrument_token);


 this.$set( this.scripts.filter(s=>s.instrument_token==s.CurScript.instrument_token)[0] , "pricePoints", pp);


 if (tmpScript.length == 0) {
  socket.emit("subscribe-scripts-for-mint", JSON.stringify(this.symbolList) );
  
    clearInterval(ti)
  }
 


},200)

 


      // this.scripts.forEach(async (r) => {
      //   let timeout = 333;

      //   let index = 1;
      //   setTimeout(async () => {
      //     console.log("request");

      //     index++;

      //     let pp = await this.getPricePoints(
      //       r.instrument_token,
      //       this.accessToken
      //     );

      //     this.symbolList.push(r.instrument_token);

      //     // console.log('pp',pp)

      //     this.$set(r, "pricePoints", pp);

      //     ln--;
      //     if (ln == 0) {
      //       socket.emit(
      //         "subscribe-scripts-for-mint",
      //         JSON.stringify(this.symbolList)
      //       );
      //     }
      //   }, timeout * index);
      // });
    },

    fetchSymbolsForTheCategory() {

      this.updateSignalFromLocalStorageToVaraible()
      let url = "/api/fetchSymbolsForTheCategory";

      let ob = {};
      ob.accessToken = this.accessToken;

      ob.category = this.selectedCategory;
      axios
        .post(url, ob)
        .then((r) => {
          this.scripts = r.data;
        })
        .then((n) => {
          // this.mutateWithPricePointNormal()

          this.mutateWithPricePointsPop();

          // console.clear();

          // scriptLoaded:
        });
    },
  },

  data() {
    return {
amountPerStock:1000,
      CurrentCycleStatus1:-1,
      LatestQuotes:[],
      previousOrderUpdate:{},
chat_id:-1,
      token : '2042279965:AAGudvLvwhEzbiz2G8f-RmeeADvzk0aY8YE',
      showSignals:false,
      ScriptLength:-1,
      loadingContent:true,

      livePositions: [],
      hours: 0,
      minutes: 0,
      seconds: 0,
      showTrades: false,
      heartBeat: false,
      localStorage: [],
      generatedSignals:[],
      symbolList: [],
      once: true,
      scriptLoaded: false,
      scripts: [],
      categories: [],
      selectedCategory: "",
    }
  },

  watch:{
selectedCategory(n,o){


}


  },
  
  mounted() {


   window.setInterval(() => {

      
      var d = new Date();
      this.hours = d.getHours();
      this.minutes = d.getMinutes();
      this.seconds = d.getSeconds();


//
 

 

      if (this.hours == 15 && this.minutes < 59 && this.seconds<55) {

        //cancel all orders

this.sendSquareOffAlertToTelegram()

        this.getCurrentPositionsAndSquareOff();
        //function to fetch mis trades in eq, reverese and sqaureoff
       // console.log("time triggered", this.hours, this.minutes);
      }
    }, 1000);





if(this.chat_id==-1){

 this.getChatId().then(

   chat_id=>{

var d = new Date();

     
let today=d.toLocaleString().slice(0, 10);



var txt="Welcome to Trading on "+today;
 this.sendToTelegramGroup(txt)
   }
 )


}


 //let t=this.today();

 



 




    let today = this.today();

    if(localStorage.getItem(today)!=null){

this.localStorage = this.setChart(JSON.parse(localStorage.getItem(today)));
    }else{

      this.localStorage =[]  
    }
    


this.updateSignalFromLocalStorageToVaraible();




    setInterval(() => {
      console.log("clearing console");
    //   console.clear()
    }, 600000);

    socket.on("order_update", (orderUpdates) => {



this.previousOrderUpdate=orderUpdates;
      
   // console.log('orderUpdates.order_id',orderUpdates)

     

      let sameOrderUpdate=Object.entries(this.previousOrderUpdate).toString() === Object.entries(orderUpdates).toString();

      if(sameOrderUpdate){

        //console.log('same order update');
       // return false;
      }

      let tradingsymbol = orderUpdates.tradingsymbol;

      let status = orderUpdates.status;



///if order current status is cycle finisheied do not update status


let CurrentCycleStatus=this.getScriptTradedStatus(tradingsymbol).filter(t=>t.status=="CYCLE FINISHED").length;
//this.CurrentCycleStatus1=this.getScriptTradedStatus(tradingsymbol)

//.filter(t=>t.status=="CYCLE FINISHED");

if(CurrentCycleStatus>0){

  console.log('cycle finished status for CurrentCycleStatus ',CurrentCycleStatus,tradingsymbol,CurrentCycleStatus1)

  // there is an entry of cycle finished do not update status
}else{

this.setScriptTradedStatus(tradingsymbol, "status", status);

console.log('cycle finished status for CurrentCycleStatus ',CurrentCycleStatus,tradingsymbol,CurrentCycleStatus1)


}


      




      let quantity = orderUpdates.quantity;
      this.setScriptTradedStatus(tradingsymbol, "quantity", quantity);

      let average_price = orderUpdates.average_price;
      this.setScriptTradedStatus(tradingsymbol, "average_price", average_price);

      ///order update  //qty avg price

      //mutate with order updates

      //let currentUpdate=this.orders.filter(o=>o.order_id==orderUpdates.order_id)[0]

      //Object.assign(this.orders.filter(o=>o.order_id==orderUpdates.order_id)[0],orderUpdates);

      // console.log('o','currentUpdat',currentUpdate)


      this.previousOrderUpdate=orderUpdates;
    });

    this.scriptLoaded = false;
    this.categories = categories;

    socket.on("ltp-for-mint", (skt) => {


var d = new Date();
      this.hours = d.getHours();
      this.minutes = d.getMinutes();
      this.seconds = d.getSeconds();

      if (this.hours == 15 && this.minutes == 14 && this.seconds == 0) {


// no intraday trade after 3 :14 PM
        return false;

      }

      this.heartBeat = true;



      if (this.scriptLoaded) {
        this.mutateSymbolsWithLTP(skt);
      }

      setTimeout(() => {
        this.heartBeat = false;
      }, 200);

      // console.log('skt',skt)
    });
  },
};
</script>

<style lang="scss" scoped>
</style>