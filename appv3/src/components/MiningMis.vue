<template>
  <div>

{{livePositions}}livePositions
<hr>
  



<!-- {{instrumentTokens}} -->




<hr>

{{instruments.filter(t=>t.tradingSymbol=='NIFTY22JUNFUT')}}
<!-- {{instruments[0].pricePoints.hourlyPricePoints}}instruments -->

    <v-btn @click="showModalForSquareOff()">
      square off selected
      <v-icon></v-icon>
    </v-btn>

    <button @click="review()">review</button>

    <v-btn @click="getOrders()">Refresh orders</v-btn>
    <v-btn @click="refreshTradeStatus()">Refresh trade status</v-btn>

    <v-row class="mt-1">
      <v-col>
        <v-row>
          <v-col>
            <v-chip>
              Live Position cost {{ livePositionTotalCost }} Live Buy order
              Amount {{ liveBuyOrderAmount }} &nbsp; Live Tradable Balance
              {{ liveTradablebalance }}</v-chip
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-icon
          color="red"
          v-if="heartBeat"
          title="if This symbol changes color switches between red and blue system is conencted to market"
        >
          mdi-heart
        </v-icon>

        <v-icon
          color="green"
          v-if="!heartBeat"
          title="if This symbol changes color switches between red and blue system is conencted to market"
        >
          mdi-heart
        </v-icon>
      </v-col>
      <v-col>
        <img
          v-if="chat_id < -1"
          src="https://img.icons8.com/color/48/000000/twitter--v2.png"
        />
      </v-col>

      <v-col>
        <v-icon color="blue">mdi-clock</v-icon> {{ hours }}: {{ minutes }} :
        {{ seconds }}
      </v-col>

      <v-col>
        <v-btn
          @clck="resetUserMessages()"
          small
          color="red"
          title="reset user messages"
        >
          <v-icon>mdi-power-cycle</v-icon>
        </v-btn></v-col
      >

      <v-col>
        <input
          title="Maximum Tradable Amount"
          type="text"
          class="form-control"
          v-model="maxTradableAmount"
          placeholder="Maximum Tradable Amount"
        />
      </v-col>

      <v-col>
        <v-btn
          v-if="!AutoMode"
          @click="AutoMode = true"
          title="Switch to Auto"
          icon
          color="green"
        >
          <v-icon>mdi-send-clock-outline</v-icon> </v-btn
        ><v-btn
          v-if="AutoMode"
          @click="AutoMode = false"
          title=" Switch to Manual"
          icon
          color="red"
        >
          <v-icon>mdi-send-lock</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- <div class="user-messages" v-if="userMessages.length">

   

     
      
     
      <ul>
        <li v-for='(msg,index) in userMessages' :key="index">

          {{msg}}
        </li>
      </ul>


    </div> -->

    {{ instrumentsFiltered.length }} out of {{ instrumentTokens.length }}

    <input
      type="text"
      class="form-control"
      v-model="targetPc"
      placeholder="Enter the Target %"
    />

    <div class="row">
      <div class="col offset-1">
        Positions
        <table class="table">
          <thead>
            <th>Sl#</th>
            <th>Symbol</th>
            <th>PNL</th>
            <th>AVG</th>
            <th>Last Price</th>
         
            <th>TARGET </th>

            <th>ACTION</th>
          </thead>
          <tbody>
            <tr v-for="(pos, index) in livePositions" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ pos.tradingsymbol }}</td>
              <td>{{ pos.pnl }}</td>
              <td>{{ pos.average_price }}</td>
              <td>{{ pos.last_price }}</td>
              <!-- <td>
                <input
                  type="text"
                  size="5"
                  name=""
                  id=""
                  v-model="pos.targetPc"
                />
                <input
                  style="width: fit-content"
                  type="text"
                  name=""
                  id=""
                  v-model="pos.rangeBreakOutTarget"
                />
              </td> -->

              <td>
<!-- {{pos.instrument_token}} -->
  <!-- {{ getMisPricePointofScript(pos.instrument_token)}} -->
</td>

              <td>
                <v-icon
                  color="blue"
                  v-if="pos.hasLiveTarget"
                  title="Live Target Exist"
                  >mdi-star</v-icon
                >

                <v-btn @click="enableForEditng()" v-if="pos.hasLiveTarget">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn @click="CancelOrder()" v-if="pos.hasLiveTarget">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>

                <v-btn
                  color="green"
                  title="Set Target"
                  @click="setTarget(pos)"
                  v-if="!pos.hasLiveTarget"
                >
                  <v-icon>mdi-cube-send</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
        <hr />

        <!-- {{livePositions}} -->
      </div>
      <div class="col-6"></div>
    </div>

    <div class="row fixTableHead">
      <div class="col">
        <table class="table table bordered table-stripped">
          <thead>
            <th>Slno</th>
            <th>Stock</th>
            <!-- <th>Spot</th> -->
            <th>Strike</th>

            <th>tradingSymbol</th>
            <th>LTP</th>
            <th>Type</th>
            <th>Yesterday High</th>

            <th>Action</th>
          </thead>
          <tbody>
            <tr
              v-for="(i, index) in instrumentsFiltered"
              :key="i.instrument_tocken"
            >
              <template v-if="true">
                <td>
                  {{ index + 1 }}
                </td>
                <td>
                  {{ i.name }}

                  <div class="row mt-2">
                    <div class="col-xs mr-2">
                      <small>SPOT {{ i.spot_price }}</small>
                    </div>
                    <div class="col-xs mr-2">
                      <small>LOT {{ i.lot_size }}</small>
                    </div>
                    <div class="col-xs mr-2"></div>
                  </div>
                </td>

                <td>{{ i.strike }}</td>

                <td>
                  <a target="_blank" :href="i.chart">{{ i.tradingsymbol }} </a>
                </td>
                <td :class="i.candle">
                  {{ i.last_price }}
                  <small> Amt {{ i.lot_size * i.last_price }} </small>
                  <!-- Live Profit if executed  <b>{{i.lot_size *(i.last_price-i.SevenDayMaxMin.Max)}}</b> -->
                </td>
                <td>{{ i.instrument_type }}</td>
                <td>{{ i.pricePoints.yesterday.high }}</td>

                <td>
                  <select
                    name=""
                    id=""
                    v-model="i.seletedBuyingMethod"
                    @change="changeBuyingMethod(i)"
                  >
                    <option v-for="bp in buyingPoint" :value="bp" :key="bp">
                      {{ bp }}
                    </option>
                  </select>

                  <!-- {{i.seletedBuyingMethod}} -->
                  <small v-if="i.SevenDayMaxMin"></small> &nbsp;

                  {{i.pricePoints.d1.high}}
                  <v-btn
                    fab
                    small
                    :title="`Buy Now for  Amt ${
                      i.SevenDayMaxMin.Max * i.lot_size
                    }`"
                    @click="BuyNow(i)"
                    ><v-icon color="green">mdi-cart</v-icon>
                  </v-btn>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- :class="{ 'red': pos.candle_color=='red', 'green': pos.candle_color=='green' }" -->
    <!-- <ul>
      <li v-for="i in instruments" :key="i.instrument_tocken">
        {{ i }} 
      </li>
    </ul> -->

    <b-modal v-model="modalShow">
      <slot name="header"> geader </slot>
      <slot name="body">
        <table>
          <tr v-for="(symbol, index) in livePositionsSelected" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ symbol.tradingsymbol }}</td>
            <td>{{ symbol.pnl }}</td>
            <td>
              <input
                type="checkbox"
                name=""
                id=""
                class="form-control"
                v-model="symbol.selected"
              />

              {{ symbol.selected }}
            </td>
          </tr>
        </table>
      </slot>

      <slot name="footer">
        <v-btn @click="squareoffAll()">Proceed </v-btn>
      </slot>
    </b-modal>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import axios from "axios";
import sessionMixin from "@/views/sessionMixin";
// import ThemeSwitcherVue from "../../../../theme/materio-free-v1.0.2/materio-vuetify-vuejs-admin-template-free/materio-vuetify-vuejs-admin-template-free-main/src/layouts/components/ThemeSwitcher.vue";
// import TypographyTextsVue from "../../../../theme/materio-free-v1.0.2/materio-vuetify-vuejs-admin-template-free/materio-vuetify-vuejs-admin-template-free-main/src/views/typography/TypographyTexts.vue";

const socket = io("http://localhost:4000");

// let instru = require("../instrumentsMIS.json");

// let instrumentsForMining = require("../../../instruments/instrumentsMIS.json");
let instrumentsForMining = require("../../instrumentsMIS.json");

// let instrumentsForMining = require("../../../instruments/instrumentsForMining.json");
export default {
  mixins: [sessionMixin],

  beforeMount() {},
  watch: {
    orderArray(n, o) {
      // console.log(n,o)

      let orderArrays = [...this.orderArray];

      if (orderArrays.length > 0) {
        orderArrays.forEach(async (orderArray) => {
          let a = await this.placeOrder(orderArray);
          console.log("place order result", a);
          console.log("Actual Firing", JSON.stringify(orderArray));
        });

        this.orderArray = [];
      }
    },
  },

  mounted() {
    let placingTimer = window.setInterval(() => {
      let ln = this.orderArray.length;

      // console.log('order array length1',ln,JSON.stringify(this.orderArray))

      // console.log('this.orderArray.',this.orderArray)

      // clock
      var d = new Date();
      this.hours = d.getHours();
      this.minutes = d.getMinutes();
      this.seconds = d.getSeconds();
      // order status

      this.getOrders();
      this.refreshTradeStatus();
    }, 30000);

    // *Math.max(this.orderArray.length,1)

    if (this.chat_id == -1) {
      this.getChatId().then((chat_id) => {
        var d = new Date();

        let today = d.toLocaleString().slice(0, 10);

        var txt = "Welcome to Trading on " + today;
        this.sendToTelegramGroup(txt);
      });
    }
    // this.triggerWebsocktsInServer();

    socket.on("order_update", (orderUpdates) => {
      this.getOrders();
      this.refreshTradeStatus();
    });

    //  window.setInterval(() => {
    //   console.clear();

    //    },250000)

    // window. setInterval(() => {
    //     var d = new Date();
    //     this.hours = d.getHours();
    //     this.minutes = d.getMinutes();
    //     this.seconds = d.getSeconds();

    //  },1000)

    this.getOrders();
    this.refreshTradeStatus();
    this.instruments = instrumentsForMining;

 
    this.setInstrumentTokens();

    socket.emit("subscribe-orders", JSON.stringify(this.instrumentTokens));

    socket.on("send-realtime-subscription", (s) => {
      this.mutateWithLtp(s);

      this.CurrentTick = s;
    });

 
  },

  computed: {
    liveTradablebalance() {
      return (
        this.maxTradableAmount -
        this.liveBuyOrderAmount -
        this.livePositionTotalCost -
        this.totalBuyOrderLivePlacedBySoftware -
        this.proposedBuyAmount
      );
    },
    //  &&  typeof i.SevenDayMaxMin!='undefined'

    // &&  typeof i.SevenDayMaxMin!='undefined'
    totalLiveprofitIfExecuted() {
      return 0;

      let total = 0;

      this.instruments
        .map((i) => i.liveprofitIfExecuted)
        .forEach((e) => {
          // console.log('e',e)

          if (isNaN(e)) {
            e = 0;
          }

          total = total + e;
        });

      return total;

      return this.instruments
        .map((i) => i.liveprofitIfExecuted)
        .reduce((c, p) => {
          if (isNaN(p)) {
            p = 0;
          }
          c = c + p;
        }, 0);
    },

    instrumentsFiltered() {
      return this.instruments.filter((i) => i.buyNow == true);

      // .sort((a, b) => {
      //   return a.activatedTime - b.activatedTime;
      // });
    },
  },

  methods: {


    getMisPricePointofScript(instrument_tocken){



let yesterdayHigh=this.instruments.
filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.yesterday.high;


// return yesterdayHigh*1.2;
let type=this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].instrument_type;
let name=this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].name;

//.hourlyPricePoints(h=>h.h.high>1.1*yesterdayHigh

// return name+type;

if(name=='BANKNIFTY' && type=='FUT'){

  let offset=90;
 let reference= yesterdayHigh+offset


return this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.hourlyPricePoints.filter(l=>l.high>reference)[0].high



}


if(name=='NIFTY' && type=='FUT'){

  let offset=45;
 let reference= yesterdayHigh+offset


return this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.hourlyPricePoints.filter(l=>l.high>reference)[0].high






}

if(name=='NIFTY' && type=='FUT'){

  let offset=45;
 let reference= yesterdayHigh+offset


return this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.hourlyPricePoints.filter(l=>l.high>reference)[0].high






} else if((type=='CE' ||type=='PE' )){

  let offset=1.2;
 let reference= yesterdayHigh*1.2

// return offset;

if(typeof this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0]!='undefined')
if(typeof this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints!='undefined')
if(typeof this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.hourlyPricePoints!='undefined')
return this.instruments.filter(i=>i.instrument_token==instrument_tocken)[0].pricePoints.hourlyPricePoints.filter(l=>l.high>reference)[0].high

}







},
    async review() {
      let livePositionsTmp = await this.getPositions();

      // console.log()

      // let pnl=0



      this.livePositionScripts=livePositionsTmp.net.map(i=>{

i.name

      })

      let itrator = livePositionsTmp.net.slice(1, 200);

      let livePositionsInstrumentTokens = instrumentsForMining


        .map((m) => "NFO:" + m.tradingsymbol)
        .slice(1, 200);

      let url = "/api/getQuoteFromZerodha";

      // console.log(livePositionsInstrumentTokens)

      let obj = {};
      obj.accessToken = this.accessToken;

      let quoteData = [];
      obj.arryOfInstruments = livePositionsInstrumentTokens;

      let a = await axios.post(url, obj).then((r) => {
        quoteData = r.data;

        return 1;
      });

      // console.log(quoteData,'quoteData',a)
      let counter = 0;

      Object.keys(quoteData).forEach((lp1) => {
        let lp = quoteData[lp1];
        console.log(lp, "lp");

        counter = counter + 1;
        let obj = instrumentsForMining.filter(
          (i) => i.instrument_token == lp.instrument_token
        )[0];
        lp.buy_quantity = obj.lot_size;

        // let tgt=obj.pricePoints.yesterday.rangeBreakOutTarget;
        let tgt = obj.pricePoints.yesterday.high * 1.05;

        let entry = obj.pricePoints.yesterday.high;
        // let sl=obj.pricePoints.yesterday.low;
        let sl = obj.pricePoints.yesterday.high * 0.95;

        if (lp.last_price > tgt) {
          console.log("profit");
          let tmp = 0;
          tmp = (lp.last_price - tgt) * lp.buy_quantity;

          console.log("tmp", tmp, obj.tradingsymbol);

          this.pnl = this.pnl + tmp;
        } else if (lp.last_price < sl) {
          console.log("stop loss");
          let tmp = 0;
          tmp = (lp.last_price - sl) * lp.buy_quantity;

          console.log("tmp", tmp, lp.tradingsymbol);

          this.pnl = this.pnl + tmp;
        } else {
          console.log("neither");

          let tmp = 0;
          tmp = (lp.last_price - entry) * lp.buy_quantity;

          console.log("tmp", tmp, lp.tradingsymbol);

          this.pnl = this.pnl + tmp;
        }

        // console.log(lp)
      });

      console.log("total this.pnl", this.pnl, counter);
    },

    async showModalForSquareOff() {
      let livePositionsTmp = await this.getPositions();

      this.livePositionsSelected = livePositionsTmp.net.filter(
        (p) => p.exchange == "NFO" && p.quantity > 0 && p.product=='MIS'
      );

      this.livePositionsSelected.forEach((lp) =>
        this.$set(lp, "selected", false)
      );

      this.modalShow = true;
    },

    async squareoffAll() {
      // var y=confirm('do uwant to continue');

      //get positions

      let livePositionsInstrumentTokens = this.livePositionsSelected
        .filter((lp) => lp.selected == true)
        .map((m) => {
          let pp1 = this.instruments.filter(
            (i) => i.instrument_token == m.instrument_token
          )[0].pricePoints;

          console.log(pp1, "pricePoints");

          return "NFO:" + m.tradingsymbol;
        });

      let urlGetQuoteFromZerodha = "/api/getQuoteFromZerodha";

      let obj = {};
      obj.accessToken = this.accessToken;
      obj.arryOfInstruments = livePositionsInstrumentTokens;

      let marketQuotes = await axios
        .post(urlGetQuoteFromZerodha, obj)
        .then((res) => res.data);

      let keys = Object.keys(marketQuotes);

      let orderArray = keys
        .map((k1) => {
          let i = marketQuotes[k1];
          let tradingsymbol = k1.split(":")[1];
          let transaction_type = "SELL";

          let instrument_token = marketQuotes[k1].instrument_token;

          let PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

          let hasLivetarget = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].hasLivetarget;

          if (PlacedReverseOrder == true || hasLivetarget == true) {
            console.log("placed reverse order");
            return false;
          } else {
            let lot_size = this.instruments.filter(
              (i) => i.instrument_token == instrument_token
            )[0].lot_size;
            let order_type = "LIMIT";
            let Price = i.depth.buy.sort((a, b) => b.price - a.price)[0].price;

            let product='MIS';

            let arr = this.buildOrderArray(
              tradingsymbol,
              transaction_type,

              lot_size,
              order_type,
              Price,
              product
            );

            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == instrument_token
              )[0],
              "PlacedReverseOrder",
              true
            );

            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == instrument_token
              )[0],
              "PlacedReverseOrderType",
              "Day Exit"
            );

            let a = [];

            a.push(arr);

            return a;
          }
        })
        .filter((n) => !(n == null || n == false));

      this.modalShow = true;

      this.orderArray=orderArray;

      console.log("orderArray", JSON.stringify(orderArray));

      //return false;

      //check if reverse order exit

      ///till here
    },

    getChatId() {
      this.chat_id = -1;
      if (this.chat_id != 1) {
        let url = `https://api.telegram.org/bot${this.token}/getUpdates`;

        return axios
          .get(url)
          .then((r) => {
            this.chat_id = r.data.result[0].channel_post.chat.id;

            return this.chat_id;
          })
          .catch((e) => e);

        var txt = "First time";
      }
    },

    sendToTelegramGroup(text) {
      if (true) {
        let obj = {};
        obj.chat_id = this.chat_id;
        obj.text = text;

        let urlToSendMessage = `https://api.telegram.org/bot${this.token}/sendMessage`;

        axios
          .post(urlToSendMessage, obj)
          .then((r) => {
            // console.log('from bot ',r.data.result[0])
          })
          .catch((e) => e);
        // console.log('from bot ',r.data.result[0].channel_post.chat.id)
      }
    },

    resetUserMessages() {
      this.userMessages = ["no msg"];
    },
    triggerWebsocktsInServer() {
      let url = "/api/triggerWebsocktsInServer/accessToken/" + this.accessToken;

      axios.get(url).then((r) => {
        console.log("triggered");
      });
    },
    CancelOrder() {},
    enableForEditng() {},
    async setTarget(i) {
      let tradingsymbol = i.tradingsymbol;
      let lot_size = i.quantity;
      let order_type = "LIMIT";
      let Price = i.target;
      let transaction_type = "SELL";

      let product='MIS'
      let arr = this.buildOrderArray(
        tradingsymbol,
        transaction_type,

        lot_size,
        order_type,
        Price,
        product
      );
      console.log(arr);

      let orderArray = [arr];

      let a = await this.placeOrder(orderArray);
      console.log("place order result", a);
      this.refreshTradeStatus();
    },

    async getOrders() {
      let obj = {};
      obj.accessToken = this.accessToken;
      let url = "/api/getOrdersPost";

      return axios.post(url, obj).then((res) => {
        // console.log(res.data,'11')

        if(typeof res=='undefined') return [];
        let t = res.data.filter(
          (o) =>{



let result=(o.exchange =
              "NFO" &&
              !(
                o.status == "COMPLETE" ||
                o.status == "CANCELLED" ||
                o.status == "REJECTED"
              ))



              return result;

          }


         
            
        );

        this.orders = t;



this.liveOrderScripts=t.filter(t1=>t1.transaction_type=='BUY').filter(f=>f.exchange=='NFO')

.map(a=>{

 // return 123
// return a;
return   this.instruments.filter(i2=>i2.tradingsymbol==a.tradingsymbol)[0].name

})

        this.liveBuyOrderAmount = t
          .filter(
            (t1) =>
              t1.status == "OPEN" &&
              t1.transaction_type == "BUY" &&
              t1.exchange == "NFO"
          )
          .map((s) => s.quantity * s.price)
          .reduce((pv, cv) => (pv = pv + cv), 0);
        //console.log('orders',t)
      });
    },

    changeBuyingMethod(i) {},

    async getPositions() {
      let url = "/api/getPositions";

      let obj = {};
      obj.accessToken = this.accessToken;
      return axios.post(url, obj).then((res) => {



console.log(res.data.net.length,'res.data.net.length')
if(res.data.net.length>0){

  
       this.livePositionScripts=res.data.net.filter(n=>n.exchange=='NFO' && 
        n.product=='MIS').
       
       map(i=>{


if(this.instruments.filter(i2=>i2.tradingsymbol==i.tradingsymbol).length!=0){

 return   this.instruments.filter(i2=>i2.tradingsymbol==i.tradingsymbol)[0].name

}else{

  return i.tradingsymbol.split('22')[0]
}


      

      })

  
}
       
        return res.data;
      });


  
    },

    async refreshTradeStatus() {
      let livePositionsTmp = await this.getPositions();

      let a = await this.getOrders();

      this.livePositions = livePositionsTmp.net.filter(
        (p) => p.exchange == "NFO"   && p.quantity != 0 &&  p.product=='MIS'
      );

      // && p.product=='MIS'

      this.livePositionTotalCost = 0;

      this.totalBuyOrderLivePlacedBySoftware = 0;
      this.livePositions
        .filter((f) => f.exchange == "NFO")
        .forEach(async (l) => {
          this.livePositionTotalCost =
            this.livePositionTotalCost + l.average_price * l.quantity;

          if (
            typeof this.instruments.filter(
              (i) => i.instrument_token == l.instrument_token
            )[0] !== "undefined"
          ) {
            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == l.instrument_token
              )[0],
              "average_price",
              l.average_price
            );
          }

          this.$set(l, "targetPc", 1.2);

try{


let rangeBreakOutTarget=this.instruments.filter(
                (i) => i.instrument_token == l.instrument_token
              )[0].pricePoints.d1.rangeBreakOutTarget;

}catch ( e){

console.error('some error',e)

}




         

          this.$set(l, "rangeBreakOutTarget", rangeBreakOutTarget);
          this.$set(l, "target", Math.ceil(l.average_price * l.targetPc), 1);

          let ln = this.orders
            .filter((o) => o.tradingsymbol == l.tradingsymbol)
            .filter((t1) => t1.transaction_type == "SELL").length;

          if (ln == 0) {
            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == l.instrument_token
              )[0],
              "hasLiveTarget",
              false
            );
          } else if (ln > 0) {
            this.$set(l, "hasLiveTarget", true);

            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == l.instrument_token
              )[0],
              "hasLiveTarget",
              true
            );

            this.$set(
              this.instruments.filter(
                (i) => i.instrument_token == l.instrument_token
              )[0],
              "buyNow",
              true
            );
          }

          // no live target so set a live target

          if (
            typeof this.instruments.filter(
              (i) => i.instrument_token == l.instrument_token
            )[0] == "undefined"
          ) {
            console.log("l.instrument_token absent", l.tradingsymbol);

            return false;
          }
        });
    },

    writeTrades(trade) {
      console.log("writing trade from write trade", trade);
      let obj = {};
      obj.trade = trade;
      const url = "/api/WriteTrades";

      axios.post(url, obj);
    },

    FetchInstruments() {
      const url = "/api/FetchInstruments";

      let obj = {};
      obj.accessToken = this.accessToken;

      axios.post(url, obj);
    },
    async BuyNow(i) {
      let tradingsymbol = i.tradingsymbol;
      let lot_size = i.lot_size;
      let order_type;
      let Price;

      switch (i.seletedBuyingMethod) {
        case "MARKET":
          order_type = "MARKET";
          Price = i.last_price;

          break;

        case "LTP":
          Price = i.last_price;
          order_type = "LIMIT";
          break;

        case "MAX":
          // Price = i.SevenDayMaxMin.Max;
          Price = i.pricePoints.d1.high
          order_type = "LIMIT";

          break;
      }

      let transaction_type = "BUY";
let product='MIS'
      let arr = this.buildOrderArray(
        tradingsymbol,
        transaction_type,

        lot_size,
        order_type,
        Price,product
      );

      console.log(arr, "orderarray");

      let orderArray = [arr];

      let a = [];
      a.push(arr);

      this.orderArray.push(a);

      // let a = await this.placeOrder(orderArray);
      console.log("place order result", arr);
    },

    buildOrderArray(tradingsymbol, transaction_type, qty, order_type, Price,product='MIS') {
      let order = {};

      //   order.variety = this.selectedVariety;

      order.variety = "regular";
      //  order.variety = "amo";

      order.params = {};
      order.params.exchange = "NFO";
      order.params.tradingsymbol = tradingsymbol;
      order.params.transaction_type = transaction_type;

      order.params.quantity = qty;

      order.params.product = product
      order.params.order_type = order_type;
      order.params.validity = "DAY";

      order.params.price = Price;

      return order;
    },

    setScriptTradedStatus(symbol, property, value) {
      let today = this.today();

      let trades;

      if (localStorage.getItem(today) == null) {
        trades = [];
      } else {
        if (typeof (localStorage.getItem(today) == "string")) {
          trades = JSON.parse(localStorage.getItem(today));
        } else {
          trades = localStorage.getItem(today);
        }
      }

      if (typeof trades.filter((t) => t.symbol == symbol)[0] == "undefined") {
        return false;
      }

      trades.filter((t) => t.symbol == symbol)[0][property] = value;

      console.log("status updated", property, value, symbol);

      let ar2 = trades.filter((t) => t.status == "COMPLETE");

      let strigified = JSON.stringify(trades);
      localStorage.removeItem(today);
      localStorage.setItem(today, strigified);

      // this.localStorage = this.setChart(
      //   JSON.parse(localStorage.getItem(today))
      // );
    },

    placeOrder(orderArray) {
      const url = "/api/PlaceTarget"; //temporary change

      let data1 = JSON.stringify(orderArray);

      let data = {};

      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      return axios.post(url, data).then((res) => res.data);
    },

    async proceedForBuy(instrument_token, CurrentInstrument, element) {


      if(this.hours>=15 && this.minutes>10){


        console.log('No buying after 15:10 hrs');

        // return false;
      }


      if(this.livePositionTotalCost==-1){

console.log('Positions not loaded properly')
        return false;
      }

let proposedStock=this.instruments.filter(i=>i.instrument_token==instrument_token)[0].name
console.log(proposedStock,'proposedStock');


if(this.liveOrderPlacedScripts.includes(proposedStock)){

  console.log(proposedStock,'stock already holding ordered')

return false
}

this.liveOrderPlacedScripts.push(proposedStock)

// if(this.proosed)


if(this.liveOrderScripts.includes(proposedStock)){

console.log(proposedStock,'stock has live order ')

return false

}

if(this.livePositionScripts.includes(proposedStock)){

  

console.log(proposedStock,'stock already holding')

return false

}
     
      this.proposedBuyAmount = 0;
      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "buyNow",
        true
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "PlacedReverseOrder",
        false
      );

      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "seletedBuyingMethod",
        "MAX"
      );

      let date = new Date();
      this.$set(
        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0],
        "activatedTime",
        date
      );

      /// trigger buy

      // let trade = `Buy instrument ${CurrentInstrument.tradingsymbol} at ${CurrentInstrument.SevenDayMaxMin.Max}`;
      let trade = `Buy instrument ${CurrentInstrument.tradingsymbol} at ${CurrentInstrument.pricePoints.yesterday.high} . 
      Target ${CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget} 
      Strict stop loss at ${
        

        Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low)
       
        
        
        } ,
      TargetProfit ${(CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget-CurrentInstrument.pricePoints.yesterday.high)*CurrentInstrument.lot_size}
      Possible Loss ${(CurrentInstrument.pricePoints.yesterday.high-CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1))
      
      *CurrentInstrument.lot_size}
      `;

      
      let trade1={

        'type':'Entry',
        
        'tradingsymbol':CurrentInstrument.tradingsymbol,
        'entry_price':CurrentInstrument.pricePoints.yesterday.high,
        'target':CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
        'stoploss': Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low)
      
      }

      let trade2=JSON.stringify(trade1)

      this.sendToTelegramGroup(trade);
      this.writeTrades(trade2+',');

      //checking the trade exeeds the maximum tradable amount   add live palced buy order in nfo

      // if(this.livePositionTotalCost<this.maxTradableAmount){

      if (CurrentInstrument.instrument_type == "FUT") {
        console.log("its a future");
        var audio1 = new Audio("/sounds/mixkit-sci-fi-confirmation-914.wav");
        audio1.play();

        let transaction_type = "BUY";
        let tradingsymbol = CurrentInstrument.tradingsymbol;

        let lot_size = CurrentInstrument.lot_size;

        let order_type = "LIMIT";

        let Price = CurrentInstrument.pricePoints.yesterday.high;
        let priceSell1 = element.depth.sell.sort((a, b) => a.price - b.price)[0]
          .price;
let product='MIS'
        let arr = this.buildOrderArray(
          tradingsymbol,
          transaction_type,

          lot_size,
          order_type,
          Price,product
        );

        console.log(arr, "FUTURE");

        let orderArray = [arr];

        let a = await this.placeOrder(orderArray);
        console.log("place order result", a);

        this.counter = this.counter + 1;
        console.log(
          "Placing Buy Order for :",
          tradingsymbol,
          this.counter,
          CurrentInstrument.buyNow,
          CurrentInstrument
        );
      } else if (
        CurrentInstrument.instrument_type == "CE" ||
        CurrentInstrument.instrument_type == "PE"
      ) {
        this.proposedBuyAmount =
          CurrentInstrument.pricePoints.yesterday.high *
          CurrentInstrument.lot_size;

        console.log(
          "Proposed amount ",
          this.proposedBuyAmount,
          "for",
          CurrentInstrument.tradingsymbol
        );
        if (this.liveTradablebalance > 0) {
          var audio = new Audio("/sounds/mixkit-sci-fi-confirmation-914.wav");
          audio.play();

          let transaction_type = "BUY";

          let tradingsymbol = CurrentInstrument.tradingsymbol;

          let lot_size = CurrentInstrument.lot_size;
          //let lot_size=0;
          let order_type = "LIMIT";

          //  let price1=  element.depth.sell.sort((a,b)=>a.price-b.price)[0]
          //  let price2=  element.depth.sell.sort((a,b)=>b.price-a.price)[0]

          //  console.log('sell price 1',price1,'sell price 2',price2)

          let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
            .price;

          let priceSell1 = element.depth.sell.sort(
            (a, b) => a.price - b.price
          )[0].price;

          //  console.log(priceSell1,'priceSell1',priceSell2,'priceSell2');

          //  console.log()

          //  let Price=priceSell1;
          let Price = CurrentInstrument.pricePoints.yesterday.high;

          let currentPrice = lot_size * Price;
          this.totalBuyOrderLivePlacedBySoftware =
            this.totalBuyOrderLivePlacedBySoftware + currentPrice;

          this.proposedBuyAmount = 0;
          //  let Price=priceSell1;
let product='MIS'
          let arr = this.buildOrderArray(
            tradingsymbol,
            transaction_type,

            lot_size,
            order_type,
            Price,product
          );

          // console.log(arr);

          let orderArray = [arr];

          let a = await this.placeOrder(orderArray);
          console.log("place order result", a);

          this.counter = this.counter + 1;
          console.log(
            "Placing Buy Order for :",
            tradingsymbol,
            this.counter,
            CurrentInstrument.buyNow,
            CurrentInstrument
          );

          this.userMessages.push(
            "firing of auto mode+ buy now false",
            this.counter,
            CurrentInstrument.buyNow,
            CurrentInstrument
          );
        } else {
          this.userMessages.push("Maximum tradable amout Exceeded");
          console.log("Maximum tradable amout Exceeded");
        }
      }
    },

    setcandleColour(inst, instrument_token) {
      if (inst.previousPrice < inst.last_price) {
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "candle",
          "green"
        );

        // console.log(`Pvs price of green ${inst.tradingsymbol} is ${inst.previousPrice} and last price is ${inst.last_price}`)
      } else {
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "candle",
          "red"
        );

        // console.log(`Pvs price of red ${inst.tradingsymbol} is ${inst.previousPrice} and last price is ${inst.last_price}`)
      }
    },

    ProcedureForFuturesTargetAndStopLoss(
      CurrentInstrument,
      instrument_token,
      element
    ) {
      console.log(
        `Target for ${CurrentInstrument.tradingsymbol} is ${
          CurrentInstrument.average_price + 90
        } and Stop loss is ${CurrentInstrument.average_price - 45} and cmp is ${
          CurrentInstrument.last_price
        }`
      );


 let misTarget=this.getMisPricePointofScript(instrument_token)

      // if (CurrentInstrument.last_price > CurrentInstrument.average_price + 90)
      if (CurrentInstrument.last_price >= misTarget)
      
      
      {
        let trade = `Target hit at  ${CurrentInstrument.tradingsymbol} at ${
          CurrentInstrument.average_price * 90
        }`;
        //  this.writeTrades(trade);










        let transaction_type = "SELL";

        let tradingsymbol = CurrentInstrument.tradingsymbol;

        let lot_size = CurrentInstrument.lot_size;
        let order_type = "LIMIT";

        let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          .price;
        let Price = priceBuy2;
        let product='MIS'

        let arr = this.buildOrderArray(
          tradingsymbol,
          transaction_type,

          lot_size,
          order_type,
          Price,product
        );

        // console.log(arr);

        let orderArray = [arr];

        this.orderArray.push(orderArray);
        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrder",
          true
        );

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrderType",
          "Target"
        );

        //target
      }

      if (CurrentInstrument.last_price < CurrentInstrument.average_price - 45) {
        //stop loss
        this.writeTrades(trade);

        /////////////////////////sl

        let trade = `Sl hit  ${CurrentInstrument.tradingsymbol} at ${
          CurrentInstrument.average_price - 45
        }`;

        // this.sendToTelegramGroup(trade);

        //target sells

        //    var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
        // audio.play();

        let transaction_type = "SELL";

        let tradingsymbol = CurrentInstrument.tradingsymbol;

        let lot_size = CurrentInstrument.lot_size;
        let order_type = "LIMIT";

        let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          .price;

        let Price = priceBuy2;

        let product='MIS'

        let arr = this.buildOrderArray(
          tradingsymbol,
          transaction_type,

          lot_size,
          order_type,
          Price,product
        );

        console.log("stop loss array below");
        console.log(JSON.stringify(arr));

        let orderArray = [arr];

        this.orderArray.push(orderArray);

        //  console.log('order array inside tgtsl fn',JSON.stringify(this.orderArray))

        console.log(trade, "firing stop loss", "@", Price);

        this.writeTrades(trade);

        console.log(trade, "firing stop loss");

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrder",
          true
        );

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrderType",
          "Stop Loss"
        );

        /////////////////////////sl
      }
    },

    placetargetAndStopLoss(CurrentInstrument, instrument_token, element,product) {
      if (CurrentInstrument.instrument_type == "FUT") {
        this.ProcedureForFuturesTargetAndStopLoss(
          CurrentInstrument,
          instrument_token,
          element
        );

        return true;
      } //// procedure for futures  end here





      // if (
      //   CurrentInstrument.last_price >
      //   CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget 
      // )


      let misTarget=this.etMisPricePointofScript(instrument_token)
      //  if (
      //   CurrentInstrument.last_price >
      //   CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget 
      // )
      if (
        CurrentInstrument.last_price >=misTarget
      )
      
      
      
      {
        // if (
        //   CurrentInstrument.last_price >
        //   CurrentInstrument.average_price*1.12
        // )

        //  if (
        //              true
        //             )
        // if (
        //               CurrentInstrument.last_price >
        //               CurrentInstrument.pricePoints.yesterday.high*1.02
        //             )

        let trade = `Target hit at  ${CurrentInstrument.tradingsymbol} at ${CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget}`;


 let trade1={

        'type':'Target',
        
        'tradingsymbol':CurrentInstrument.tradingsymbol,
        'entry_price':CurrentInstrument.pricePoints.yesterday.high,
        'target':CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
        'stoploss': Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low)
      
      }

      let trade2=JSON.stringify(trade1)



         this.writeTrades(trade2+',');
        this.sendToTelegramGroup(trade);
        this.userMessages.push(trade);
        ////target buys

        //                                 var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
        // audio.play();

        let transaction_type = "SELL";

        let tradingsymbol = CurrentInstrument.tradingsymbol;

        let lot_size = CurrentInstrument.lot_size;
        let order_type = "LIMIT";

        let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          .price;

        // console.log(priceBuy2, "priceBuy2");

        if (priceBuy2 > CurrentInstrument.average_price * 1.1) {
          //  console.log('priceBuy1','priceBuy2',priceBuy2)
          //  let Price=Math.round(CurrentInstrument.SevenDayMaxMin.Max*1.1,1);
          let Price = priceBuy2;

          // let product='MIS'

          let arr = this.buildOrderArray(
            tradingsymbol,
            transaction_type,

            lot_size,
            order_type,
            Price,product
          );

          // console.log(arr);

          let orderArray = [arr];

          this.orderArray.push(orderArray);

          console.log(
            "order array inside tgtsl fn",
            JSON.stringify(this.orderArray)
          );

          console.log(trade, "firing target", "@", Price);

          console.log(JSON.stringify(arr), "target  array");

          this.userMessages.push(trade);
          this.$set(
            this.instruments.filter(
              (i) => i.instrument_token == instrument_token
            )[0],
            "PlacedReverseOrder",
            true
          );

          this.$set(
            this.instruments.filter(
              (i) => i.instrument_token == instrument_token
            )[0],
            "PlacedReverseOrderType",
            "Target"
          );
        }
      } else if (
        CurrentInstrument.last_price <  Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low)
        // CurrentInstrument.pricePoints.yesterday.low
      ) {
        let trade = `Sl hit  ${CurrentInstrument.tradingsymbol} at 
      
      
      ${ Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low)}`;

        // this.sendToTelegramGroup(trade);

        //target sells

        //    var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
        // audio.play();

        let transaction_type = "SELL";

        let tradingsymbol = CurrentInstrument.tradingsymbol;

        let lot_size = CurrentInstrument.lot_size;
        // lot_size=0;
        let order_type = "LIMIT";

        let priceBuy2 = element.depth.buy.sort((a, b) => b.price - a.price)[0]
          .price;

        //  let Price=Math.round(CurrentInstrument.SevenDayMaxMin.Max*.9,1);
        let Price = priceBuy2;

        // let product='MIS'

        let arr = this.buildOrderArray(
          tradingsymbol,
          transaction_type,

          lot_size,
          order_type,
          Price
        );

        console.log("stop loss array below");
        console.log(JSON.stringify(arr));

        let orderArray = [arr];

        this.orderArray.push(orderArray);

        console.log(
          "order array inside tgtsl fn",
          JSON.stringify(this.orderArray)
        );

        console.log(trade, "firing stop loss", "@", Price);


         let trade1={

        'type':'stoploss',
        
        'tradingsymbol':CurrentInstrument.tradingsymbol,
        'entry_price':CurrentInstrument.pricePoints.yesterday.high,
        'target':CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
        'stoploss': Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low)
      
      }

      let trade2=JSON.stringify(trade1)

        this.writeTrades(trade2+',');

        console.log(trade, "firing stop loss");

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrder",
          true
        );

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "PlacedReverseOrderType",
          "Stop Loss"
        );
      } else {
        console.log(
          "No target or stop for",
          CurrentInstrument.tradingsymbol,
          "stop loss",
           Math.min( CurrentInstrument.pricePoints.pivotPointObject.bc.toFixed(1),CurrentInstrument.pricePoints.d1.low),
          "Target",
          CurrentInstrument.pricePoints.yesterday.rangeBreakOutTarget,
          "Last price",
          CurrentInstrument.last_price
        );

        // this.userMessages.push('No target or stop for ',CurrentInstrument.tradingsymbol,'stop loss',CurrentInstrument.pricePoints.yesterday.high*.9 )
      }
    },


    otherCriteria(s,CurrentInstrument ){

      if(s.ohlc.open> CurrentInstrument.pricePoints.yesterday.high){


        return false;
      }  
      
      if(s.ohlc.open<CurrentInstrument.pricePoints.yesterday.low){


        return false;
      }

      //sma volume //price


      return true

      console.warn(s.ohlc,'s.ohlc')
      console.info(CurrentInstrument,'CurrentInstrumentc')


    },

    mutateWithLtp(s) {
      //////////////////////////
      // console.clear();

      // return true
// console.log(s);
      this.heartBeat = !this.heartBeat;
      s.forEach((element) => {

        console.log(element,'hi')
        let a = element.depth.buy.sort((a, b) => b.price - a.price)[0].price;

        let b = element.depth.sell.sort((a, b) => a.price - b.price)[0].price;

        let b1 = element.depth.sell.sort((a, b) => a.price - b.price)[1].price;

        let b1b = b1 - b;

        let b1bpc = (b1b / b) * 100;

        // if (isNaN(b1bpc)) {
        //   return false;
        // }

        // if (b1bpc > 1) {

        //   return false;
        // }

        // let c = b - a;

        // let lpPc = (c / s[0].last_price) * 100;

        // if (lpPc > 5 || lpPc < -5) {

        //   return false;
        // } else {

        // }

        // if (lpPc < 0) {
        //   console.log("negative");

        // }

        if (element.volume < 100000) {
        }

        let instrument_token = element.instrument_token;
        let last_price = element.last_price;
        let average_price = element.average_price;

        // try {
        let CurrentInstrument = this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0];

        if (typeof CurrentInstrument == "undefined") {
          // console.log("CurrentInstrument=='undefined");
          return false;
        }

        if (typeof CurrentInstrument.SevenDayMaxMin == "undefined") {
          console.log(
            typeof CurrentInstrument.SevenDayMaxMin,
            "typeof CurrentInstrument.SevenDayMaxMin1"
          );
          return false;
        }

        if (typeof CurrentInstrument.SevenDayMaxMin.Max == "undefined") {
          return false;
        }

        this.$set(
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0],
          "previousPrice",
          this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].last_price
        );

        this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0].last_price = last_price;

        /*

this.$set(
                  this.instruments.filter(
                    (i) => i.instrument_token == instrument_token
                  )[0],
                  "liveprofitIfExecuted",
                  ( this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].last_price - this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].SevenDayMaxMin.max) *this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].lot_size
                );

         
*/

        // i.lot_size *(i.last_price-i.SevenDayMaxMin.Max)

        let inst = this.instruments.filter(
          (i) => i.instrument_token == instrument_token
        )[0];

        if (inst.previousPrice == 0) {
          return false;
        }

        if (inst.previousPrice != 0) {
          // this.setcandleColour(inst,instrument_token)
        }

        if (CurrentInstrument.buyNow == true) {
          //   let priceBuy1=  element.depth.buy.sort((a,b)=>a.price-b.price)[0].price
          //  let priceBuy2=  element.depth.buy.sort((a,b)=>b.price-a.price)[0].price;
        }

        /////////////////////////////////////////////

        /////////////////////////////////////////////

        /////////////////auto mode false

        ////////////////////auto mode true

        // if (this.AutoMode)

        // console.log('CurrentInstrument.buyNow',CurrentInstrument.buyNow)

        if (CurrentInstrument.buyNow == false) {
          //not triggred earlier
          // if(inst.previousPrice<inst.last_price)

          // if (
          //   CurrentInstrument.last_price >
          //   CurrentInstrument.SevenDayMaxMin.Max && inst.previousPrice<=CurrentInstrument.SevenDayMaxMin.Max

          // )

          //new range breakout yesterday

          // console.log('for' ,CurrentInstrument.tradingsymbol,'Entry price is',CurrentInstrument.pricePoints.yesterday.high ,'and last price is ',CurrentInstrument.last_price,'CurrentInstrument.buyNow',CurrentInstrument.buyNow,inst.previousPrice)


if(this.otherCriteria(element,CurrentInstrument )==false){

  // console.warn('other criteria is false for : ',CurrentInstrument.tradingsymbol)

  return false
}


          if (
            CurrentInstrument.last_price >
              CurrentInstrument.pricePoints.yesterday.high &&
            inst.previousPrice <= CurrentInstrument.pricePoints.yesterday.high
          ) {
            this.proceedForBuy(instrument_token, CurrentInstrument, element);
            return true;
          }
        } ///already palced order .... so check whte there is live position

        //// checking whter there is live postions

        let ln = this.livePositions.filter(
          (lp) => lp.instrument_token == CurrentInstrument.instrument_token
        ).length;

        if (ln > 0) {


          let product=this.livePositions.filter(
          (lp) => lp.instrument_token == CurrentInstrument.instrument_token
        )[0].product;
          // this.userMessages.push('there is a live position',CurrentInstrument.tradingsymbol);
          console.log(
            "there is a live position",
            CurrentInstrument.tradingsymbol
          );

          //there is a live position

          //check whether already a reverse order placed

          let PlacedReverseOrder = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].PlacedReverseOrder;

          let hasLiveTarget = this.instruments.filter(
            (i) => i.instrument_token == instrument_token
          )[0].hasLiveTarget;

          if (PlacedReverseOrder == true || hasLiveTarget == true) {
            console.log(
              "PlacedReverseOrder",
              PlacedReverseOrder,
              "has live target",
              hasLiveTarget
            );

            // this.userMessages.push('reverse order alredy placed',CurrentInstrument.tradingsymbol)

            console.log(
              "PlacedReverseOrder",
              PlacedReverseOrder,
              "hasLiveTarget",
              hasLiveTarget
            );
            console.log(
              "reverse order alredy placed",
              CurrentInstrument.tradingsymbol
            );

            return false;
          } else {
            // this.userMessages.push('going to place reverese order',CurrentInstrument.tradingsymbol);
            console.log(
              "going to place reverese order",
              CurrentInstrument.tradingsymbol
            );
            this.placetargetAndStopLoss(
              CurrentInstrument,
              instrument_token,
              element,product
            );
          }

          /// now checking whter stop loss or target

          ///
        } else {
          // console.log('there No live position',ln,'ln',CurrentInstrument.tradingsymbol,'CurrentInstrument.tradingsymbol')
        }

        //measns already bought
        //   }
        //  else {
        //   this.$set(
        //     this.instruments.filter(
        //       (i) => i.instrument_token == instrument_token
        //     )[0],
        //     "buyNow",
        //     false
        //   );
        // }

        return;
        // } catch (error) {

        //   console.log("some error has occured ", error);
        // }

        //////////////////////////
      });
    },

    setInstrumentTokens() {
      return new Promise((res, rej) => {
        this.instrumentTokens = this.instruments.map((i) =>
          parseInt(i.instrument_token)
        );

        res(true);
      });
    },

    mutateOrdersWithLtp(s) {
      s.forEach((element) => {
        let instrument_token = element.instrument_token;
        let last_price = element.last_price;
        let average_price = element.average_price;

        //console.log(element.instrument_token)

        console.log(
          instru.filter((e) => e.instrument_token == element.instrument_token)
        );
        return;
        this.instruments.filter(
          (e) => e.instrument_token == instrument_token
        )[0].last_price = last_price;

        this.symbols
          .filter((o) => o.instr == instrument_token)
          .forEach((e) => {
            this.$set(e, "previous_last", e.last_price);
            this.$set(e, "last_price", last_price);

            if (e.previous_last < e.last_price) {
              this.$set(e, "candleColor", "green");
            } else if (e.previous_last > e.last_price) {
              this.$set(e, "candleColor", "red");
            } else if (e.previous_last == e.last_price) {
              this.$set(e, "candleColor", "grey");
            }

            this.$set(e, "live_gain", last_price);
            this.$set(e, "average_price", average_price);
          });
      });
    },
  },

  data() {
    return {
      livePositionScripts:[],
      liveOrderScripts:[],
      liveOrderPlacedScripts:[],
      livePositionsSelected: [],
      modalShow: false,
      proposedBuyAmount: 0,
      pnl: 0,
      totalBuyOrderLivePlacedBySoftware: 0,

      CurrentTick: [],
      orderArray: [],
      chat_id: -1,
      token: "2042279965:AAGudvLvwhEzbiz2G8f-RmeeADvzk0aY8YE",
      hours: 0,
      minutes: 0,
      seconds: 0,
      heartBeat: false,
      liveBuyOrderAmount: 0,
      userMessages: [],
      maxTradableAmount: 25000,
      placedAmountbyMining: 0,
      livePositionTotalCost: -1,
      counter: 0,
      AutoMode: false,
      orders: [],
      buyingPoint: ["LTP", "MARKET", "MAX"],

      targetPc: 1.1,
      livePositions: [],
      instrumentTokens: [],
      symbols: [],
      currentInstruments: [],
      displayingInstruments: [],
      instruments: [],
      ohlc: [],
    };
  },

  name: "Mining",
};
</script>

<style lang="scss" scoped>
input {
  border: 1px solid rgb(147, 206, 221);
  box-shadow: #327094;
}
.fixTableHead {
  overflow-y: auto;
}
.fixTableHead thead th {
  position: sticky;
  top: 0;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th,
td {
  padding: 8px 15px;
  border: 2px solid #327094;
}
th {
  background: #93cedd;
}
// .red {
//   background: white;
//   color: rgb(109, 86, 86);

// }

// .green {
//   background: white;
//  color: rgb(94, 136, 94);

// }
</style>