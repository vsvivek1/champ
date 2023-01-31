<template>
  <div>
    <div class="loading" v-if="loadingContent">
      <div>
        <v-progress-linear indeterminate color="green"></v-progress-linear>
      </div>

      loading... {{ holdingLength }}
    </div>

    <div class="container1" v-show="!loadingContent">
      <div class="row">
        <div class="row mb-2 pb-2">
          <div class="col">
            <select
              name=""
              id=""
              class="form-control"
              v-model="selectedVariety"
            >
              <option v-for="(variety, index) in varieties" :key="index">
                {{ variety.text }}
              </option>
            </select>

            Order type
            <select
              name=""
              id=""
              class="form-control"
              v-model="selectedOrderType"
            >
              <option v-for="(orderType, index) in orderTypes" :key="index">
                {{ orderType }}
              </option>
            </select>
          </div>

          <div class="col">
            <v-btn
              color="blue accent-4"
              @click="CancelSlOrderIfAnyAndSetTarget()"
            >
              <v-icon></v-icon> Cancel SL orders if any and set target to LTP
            </v-btn>
          </div>
          <!-- <div class="col">
            <v-btn
              v-if="selectedVariety != ''"
              color="blue accent-3"
              @click="PlaceStopLoss()"
            >
              <v-icon>mdi-arrow-down</v-icon> Stop Loss
            </v-btn>
          </div> -->

          <div class="col">
            Filtering criteria
            <select
              name=""
              id=""
              class="form-control"
              @change="filterBasedOnSelectedCriteria()"
              v-model="selectedFilteringCriteria"
            >
              <option
                v-for="FilteringCriteria in FilteringCriterias"
                :key="FilteringCriteria"
                :value="FilteringCriteria"
              >
                {{ FilteringCriteria }}
              </option>
            </select>
          </div>

          <div class="col">
            <select
              name=""
              id=""
              class="form-control"
              v-model="selectedStopLossPoint"
            >
              <option
                v-for="stopLossPoint in stopLossPoints"
                :key="stopLossPoint"
                :value="stopLossPoint"
              >
                {{ stopLossPoint }}
              </option>
            </select>

            StopLossQuantty
            <select
              name=""
              id=""
              class="form-control"
              v-model="selectedStopLossQuantity"
            >
              <option
                v-for="StopLossQuantity in StopLossQuantities"
                :key="StopLossQuantity"
                :value="StopLossQuantity"
              >
                {{ StopLossQuantity }}
              </option>
            </select>

            <v-btn
              v-if="selectedVariety != ''"
              color="blue accent-2"
              @click="PlaceStopLossYesterdayLow()"
            >
              <v-icon>mdi-arrow-down</v-icon> Stop Loss YESTERDAY LOW based on choice
            </v-btn>
          </div>
<!-- 
          <div class="col">
            <v-btn
              v-if="selectedVariety != ''"
              color="blue accent-1"
              @click="PlaceTarget()"
            >
              <v-icon>mdi-arrow-up</v-icon> Target
            </v-btn>
          </div> -->

          <!-- <div class="col">
            <v-btn
              v-if="selectedVariety != ''"
              color="blue accent-1"
              @click="PlaceTargetR2()"
            >
              <v-icon>mdi-arrow-up</v-icon> Target R2
            </v-btn>
          </div> -->
          <div class="col">
            <v-btn
              v-if="selectedVariety != ''"
              color="blue accent-1"
              @click="PlaceTargetPricePointNext()"
            >
              <v-icon>mdi-arrow-up</v-icon> Target Price Point Next
            </v-btn>
          </div>
        </div>

        <table v-if="loadedPricePoints"
        
        class="table table-striped table-hover">
          <th>#.</th>
          <th @click="orderby('tradingsymbol')">Symbol</th>
          <th>Qty/Avg/Yday Sl</th>
          <th>LIVE LTP</th>
          <th>PIVOT POINTS</th>
          <th>Target</th>
          <th>Target-Gain & %</th>
          <th>SL</th>
          <th>SL-Gain & %</th>

          <tr v-for="(holding, index) in holdingsForMarket1" :key="index">
            <td>
              {{ index + 1 }} of {{ selected }}
              <div class="form-control-group">
                <input
                  type="checkbox"
                  @click="ToggleSelec(holding.instrument_token, $event)"
                  :id="holding.instrument_token"
                  v-model="holding.selected"
                  class="form-control"
                />
              </div>
            </td>

            <td>
              <!-- <SupportRessistacePoints @calculated1="ReflectCalculated" 
    :ltp="holding.last_price" 
:instrument_tocken="holding.instrument_token">


</SupportRessistacePoints> -->

              {{ holding.tradingsymbol }}

              <v-chip class="ma-2">
                LTP&nbsp; {{ holding.last_price }} &nbsp;
              </v-chip>
            </td>

            <td>
              <v-chip class="ma-2">
                QTY &nbsp; {{ holding.quantity + holding.t1_quantity }} &nbsp;
              </v-chip>

              <span class="text-danger">
                <v-chip class="ma-2">
                  Avg &nbsp; {{ holding.average_price }} &nbsp;
                </v-chip>
              </span>
              &nbsp;

              <span
                :class="{
                  'text-success':
                    holding.targetSlYestLow > holding.average_price,
                }"
              >
                <v-chip class="ma-2">
                  Yesterday Low&nbsp; {{ holding.targetSlYestLow }} &nbsp;
                </v-chip>
              </span>
              <!-- <span :class="{'text-success' 
:holding.targetSlYestLow>holding.average_price}">
{{(holding.targetSlYestLow-holding.average_price)*(holding.quantity+holding.t1_quantity) }} </span> -->
            </td>

            <td>
              {{ holding.live_ltp }}
            </td>

            <td>
              <v-chip class="ma-2">
                TC &nbsp;
                {{ JSON.parse(holding.targets.pivotPoints).tc }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                BC&nbsp; {{ JSON.parse(holding.targets.pivotPoints).bc }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                R1 &nbsp;
                {{ JSON.parse(holding.targets.pivotPoints).r1 }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                R2 &nbsp;
                {{ JSON.parse(holding.targets.pivotPoints).r2 }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                R3 &nbsp;
                {{ JSON.parse(holding.targets.pivotPoints).r3 }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                Pivot &nbsp;
                {{ JSON.parse(holding.targets.pivotPoints).pivotPoint }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                <!-- {{holding.targets.heikinAshi}} -->
                Heikin Ashi OPEN &nbsp;
                {{ holding.targets.heikinAshi.Open }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                Heikin Ashi close &nbsp;
                {{ holding.targets.heikinAshi.Close }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                Heikin Ashi low &nbsp;
                {{ holding.targets.heikinAshi.Low }} &nbsp;
              </v-chip>

              <v-chip class="ma-2">
                Heikin Ashi High &nbsp;
                {{ holding.targets.heikinAshi.High }} &nbsp;
              </v-chip>

              price pointss real target =<span class="bg-primary">{{
                holding.targets.realtarget
              }}</span>
              &nbsp;<span class="bg-success">{{
                holding.targets.realtargetType
              }}</span>

              quote uper circuitlimit
              {{ holding.targets.quote.upper_circuit_limit }} &nbsp;
              yesterdayHigh5pc {{ holding.targets.yesterdayHigh5pc }} &nbsp;
              yesterdayHigh5pc {{ holding.targets.yesterdayHigh5pc }}
              <hr />
            </td>
            <td
              style="width: 20%"
              v-if="typeof holding.targets.level != 'undefined'"
            >
              Target gain :{{
                holding.targets.realtarget - holding.average_price
              }}
              &nbsp; Target gain %:{{
                ((holding.targets.realtarget - holding.average_price) * 100) /
                holding.average_price
              }}
              &nbsp; Target Sl Yday :{{ holding.targetSlYestLowSl }} &nbsp;
              Yesterday Low {{ holding.targetSlYestLow }} &nbsp; Yesterday
              {{ holding.targets.yesterday.date }} &nbsp;

              <!-- benefit if sold on yesterday low{{ (holding.targetSlYestLow-holding.last_price)*(holding.quantity+holding.t1_quantity)}} -->

              <a
                target="_blank"
                :href="`https://kite.zerodha.com/chart/ext/ciq/${holding.exchange}/${holding.tradingsymbol}/${holding.instrument_token}/`"
              >
                chart <v-icon>mdi-link</v-icon>
              </a>

              order status
              <v-chip v-if="!(typeof holding.order_detail == 'undefined')">{{
                holding.order_detail.status
              }}</v-chip>
            </td>

            <td v-if="holding.targets.level">
              Resistance
              {{ holding.targets.level.ressistance.high }}
            </td>

            <td
              v-if="holding.targets.level"
              :class="{
                'bg-danger': holding.targetGain < 0,
                'bg-success': holding.targetGain > 0,
              }"
            >
              {{ holding.targetGain }} &nbsp;&nbsp; {{ holding.targetGainPc }}
            </td>

            <td
              v-if="holding.targets"
              :class="{
                'bg-danger': holding.targetSlYestLow < 0,
                'bg-success': holding.targetSlYestLow > 0,
              }"
            >
              {{ holding.targetSlYestLow }} &nbsp;&nbsp;

              <small>Net Gain</small> {{ holding.targetSlYestLowGain }}

              LOW

              <small>{{
                (holding.targets.yesterday.low - holding.last_price) *
                (holding.quantity + holding.t1_quantity)
              }}</small>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
//   mixins:[supportRessistace],
// import supportRessistace from './supportRessistance'
import SupportRessistacePoints from "./SupportRessistacePoints.vue";
import axios from "axios";
import store from "@/store";
import sessionMixin from "@/views/sessionMixin";
import pricePointMixin from "./pricePointMixin";

import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default {
  name: "PlaceQuickOrderForHoldings",
  components: { SupportRessistacePoints },
  mixins: [sessionMixin, pricePointMixin],
  computed: {

    holdingsForMarket1(){
// if(this.loadedPricePoints==true){
  return this.holdingsForMarket.filter(r=>
  {
console.log(r.targets,typeof r.targets,'typeof r.targets')

   if(typeof r.targets=='object') {

return true;
   }

  }
   )
  
  // .filter(hm=>!typeof hm.targets=='undefined')


// }
    },

    selected() {
      return this.holdingsForMarketSelected.length;
    },

    holdingsForMarket: {
      get() {
        let h1 = [...this.holdingsForMarketSelected];
        // let h1=[...this.holdings];

        let bene = 0;
        h1.forEach((holding,index) => {

         

          if (!typeof holding.targets == "undefined") {
            let targetGain = 0;
            let targetGainPc = 0;
            let targetGainPcNumber = 0;
            let targetSl = 0;
            let targetStopLossPc = 0;

            let targetSlYestLow = 0;
            let targetSlYestLowSl = 0;
            let lastgainSl = 0;
            let targetSlYestLowGain =0

   
              if (typeof holding.targets.level == "undefined") {
                let targetGain = 0;
                targetGainPc = 0;
                targetGainPcNumber = 0;
                targetSl = 0;
                targetStopLossPc = 0;
                targetSlYestLowGain =0

                 targetSlYestLowGain = 0;
              } else {
                targetStopLossPc =
                  Math.round(
                    ((holding.targets.level.support.level -
                      holding.average_price) /
                      holding.average_price) *
                      100,
                    2
                  ) + " % ";

                targetGain = Math.floor(
                  holding.targets.level.ressistance.high *
                    (holding.quantity + holding.t1_quantity) -
                    holding.average_price *
                      (holding.quantity + holding.t1_quantity)
                );

                targetGainPc =
                  Math.round(
                    ((holding.targets.level.ressistance.high -
                      holding.average_price) /
                      holding.average_price) *
                      100,
                    2
                  ) + " % ";
                targetGainPcNumber = Math.round(
                  ((holding.targets.level.ressistance.high -
                    holding.average_price) /
                    holding.average_price) *
                    100,
                  2
                );

                targetSl = Math.floor(
                  holding.targets.level.support.level *
                    (holding.quantity + holding.t1_quantity) -
                    holding.average_price *
                      (holding.quantity + holding.t1_quantity)
                );

                targetSlYestLow = holding.targets.yesterday.low;
                targetSlYestLowSl = Math.floor(holding.targets.yesterday.low); //holding.targets.yesterday.low
                lastgainSl =
                  (holding.targets.yesterday.low - holding.last_price) *
                  (holding.quantity + holding.t1_quantity);

                targetSlYestLowGain = Math.floor(
                  (holding.targets.yesterday.low - holding.last_price) *
                    (holding.quantity + holding.t1_quantity) *
                    0.99
                );
              }

            if (isNaN(targetGain)) {
              //get price point again and mutate
              targetGain = -1;
            }

            this.$set(holding, "targetGain", targetGain);
            this.$set(holding, "targetGainPc", targetGainPc);
            this.$set(holding, "targetGainPcNumber", targetGainPcNumber);

            // if(targetGain<0){

            //     holding.selected=false;
            // }
            // if(targetGainPcNumber<5){

            //     holding.selected=false;
            // }

            this.totalTargetGain = this.totalTargetGain + targetGain;

            if (isNaN(targetSl)) {
              //get price point again and mutate
              targetSl = -1;
            }

            //  let targetSlYestLow= this.getParsedJson(holding.targets.level.support.yesterDay).low
            //  let targetSlYestLow= this.getParsedJson(holding.targets.yesterday).low
            //  let targetSlYestLow= JSON.parse(holding.targets.yesterday).low
            //holding.targets.yesterday.low

            // console.log('holding.targets.yesterday',holding.targets.yesterday)

            // let targetSlYestLowSl= Math.floor(holding.targets.yesterday.high*1.03) //holding.targets.yesterday.low

            // let lastgainSl=(holding.targets.yesterday.low-holding.last_price)*(holding.quantity+holding.t1_quantity)

            // let yesterdayRange

            this.$set(holding, "targetSl", targetSl);
            this.$set(holding, "targetStopLossPc", targetStopLossPc);
            this.$set(holding, "targetSlYestLow", targetSlYestLow);
            this.$set(holding, "targetSlYestLowGain", targetSlYestLowGain);
            this.$set(holding, "targetSlYestLowSl", targetSlYestLowSl);

            // this.totalStopLossGain=this.totalStopLossGain+targetSl;

            this.totalStopLossGain = this.totalStopLossGain + lastgainSl;

            // (this.getParsedJson(holding.targets.yesterday.low).low-holding.last_price)*(holding.quantity+holding.t1_quantity)

            let ben =
              (holding.targetSlYestLow - holding.last_price) *
              (holding.quantity + holding.t1_quantity);
            if (ben > 0) {
              bene = bene + ben;
              //   console.log(bene)  ;
              this.benefit = this.benefit + ben;
              // console.log('ben',ben)
            } else {
              // console.log('minus ben',ben)
            }


            // h1.splice(index,1);
          }
        });


        return h1;
        // return h1.filter(holding1=>! typeof holding1.targets == "undefined");
        // return h1.filter(holding=>! typeof holding.targets.pivotPoints == "undefined");
      },
      set(val) {
        this.holdingsForMarket = val;
      },
    },

    holdingsForMarketSelectedLength() {
      return this.holdingsForMarketSelected.length;
    },

    holdingsSelectedInstruments() {
      return this.holdingsForMarketSelected.map((h) => h.instrument_token);
    },

    holdingsForMarketSelected() {
      // return this.holdings.filter(h=>h.selected==true)
      return this.holdings.filter((h) => h.quantity + h.t1_quantity != 0);
    },

    accessToken3() {
      return store.state.accessToken;
    },
  },

  mounted() {
    // console.clear();

    //////////////////webscokets

    socket.on("order_update", (orderUpdates) => {

if(typeof orderUpdates=='undefined'){

  return false;
}

      // console.log('orderUpdates.order_id',orderUpdates.order_id)

      let currentUpdate = this.holdings.filter(
        (o) => o.instrument_token == orderUpdates.instrument_token
      )[0];

      if (this.holdings.length > 0) {

        // console.log(orderUpdates,'orderUpdates')

        return;
        this.$set(
          this.holdings.filter(
            (o) => o.instrument_token == orderUpdates.instrument_token
          )[0],
          "order_detail",
          orderUpdates
        );
      }

      // Object.assign(this.orders.filter(o=>o.order_id==orderUpdates.order_id)[0],orderUpdates);

      // console.log('o','currentUpdat',currentUpdate)
    });

    socket.on("send-realtime-subscription2", (s) => {
      this.holdings.forEach((holding) => {
        let live_ltp = s.filter((s1) => {
          s1.instrument_token == h.instrument_token;
        })[0].last_price;
        this.$set(holding, "live_ltp", live_ltp);
      });

      // console.clear();

      // this.$set(holding,'targetSlYestLowSl',targetSlYestLowSl);
      // this.mutateOrdersWithLtp(s)/// function for mutating orders with real time lTP

      // this.UpdateSellOrderToTargetOnLtpTrigger(s)

      // console.log('sunbscription',s)
    });
    //////////////////webscokets

    if (this.accessToken == null) {
      this.$router.push("/login");
    }

    this.getHoldings();
  },
  data() {
    return {
       holdingsForMarket2:[],
      loadedPricePoints:false,
      CurrentLevelIndex: -1,
      selectedFilteringCriteria: "",
      FilteringCriterias: [
        "NO CURRENT ORDER",
        "ALL",
        "NO CURRENT ORDER OR COMPLETED ORDER",
      ],
      StopLossQuantities: ["HALF", "FULL", "QUARTER", "ONE THIRD"],
      selectedStopLossQuantity: "",
      selectedOrderType: "",

      orderTypes: ["SL", "NRML", "SL-M", "MARKET"],
      selectedStopLossPoint: "",

      stopLossPoints: [
        "Heikin-Ashi-low",
        "yesterday-low",
        "pivot-point",
        "pivot-point-bc",
        "pivot-point-tc",
        "pivot-point-r1",
        "pivot-point-r2",
        "pivot-point-r3",
        "pivot-point-s1",
        "pivot-point-s2",
        "pivot-point-s3",
      ],
      selectedAll: true,
      holdingsWithCurrentOrder: [],

      benefit: 0,
      holdingLength: -1,
      loadingContent: true,
      selectedVariety: "",

      varieties: [
        {
          text: "amo",
        },
        {
          text: "bo",
        },
        {
          text: "co",
        },
        {
          text: "regular",
        },
      ],
      totalTargetGain: 0,
      totalStopLossGain: 0,
      SelectAll: false,
      ClickedParam: "",
      holdings: [],
      instrumentSlTargetlevels: [],
      CurrentOrders: [],
    };
  },
  methods: {
    filterBasedOnSelectedCriteria() {
      switch (this.selectedFilteringCriteria) {
        case "ALL":
          this.holdingsForMarket.forEach((h) => {
            h.selected = true;
          });

          break;

        case "NO CURRENT ORDER":
          //   console.log("NO CURRENT ORDER",this.holdingsForMarket);

          //   return false;
          this.holdingsForMarket.forEach((h) => {
            if (h.order_detail.status == "NO CURRENT ORDER") {
              h.selected = true;
            } else {
              h.selected = false;
            }
          });
          break;

        case "NO CURRENT ORDER OR COMPLETED ORDER":
          //   console.log("NO CURRENT ORDER",this.holdingsForMarket);

          //   return false;
          this.holdingsForMarket.forEach((h) => {
            if (
              h.order_detail.status == "NO CURRENT ORDER" ||
              h.order_detail.status == "COMPLETE"
            ) {
              h.selected = true;
            } else {
              h.selected = false;
            }
          });
          break;
      }
    },

    ToggleSelectAll() {
      // console.clear();
      this.selectedAll = !this.selectedAll;

      if (this.selectedAll == true) {
        console.log("this.selectedAll", this.selectedAll);
        this.holdingsForMarket.forEach((e) => (e.selected = true));
      } else if (this.selectedAll == false) {
        this.holdingsForMarket.forEach((e) => (e.selected = false));
        console.log("this.selectedAll", this.selectedAll);
      }
    },

    getOrders() {
      let url = "/api/getOrders/" + this.accessToken;

      return axios.get(url).then((res) => {
        console.log("triggeded get orders");
        return res.data;
      });
    },

    async CancelSlOrderIfAnyAndSetTarget() {
      //get selected scripts

      // filter(o=>o.transaction_type=='SELL' && (o.status=='OPEN' && o.status=='TRIGGER PENDING')).
      let curOrder = await this.getOrders();
      this.CurrentOrders = curOrder
        .filter((o) => o.transaction_type == "SELL") //&& (o.status=='OPEN' && o.status=='TRIGGER PENDING')
        .map((o) => {
          if (this.holdingsSelectedInstruments.includes(o.instrument_token)) {
            let ob = {};

            ob.order_id = o.order_id;
            ob.variety = o.variety;

            return ob;
          }
        })
        .filter((n) => n != null);

      // check if there is ay current order

      // cancel the current order

      //cancelataion of orders ////
      let StrigifiedArray = JSON.stringify(this.CurrentOrders);

      let url = "/api/CancelOrders";

      let params = {};
      params.accessToken = this.accessToken;
      params.arr = StrigifiedArray;

      axios.post(url, params).then((r) => console.log("cancelled orders", r));

      //cancelataion of orders  end  ////

      console.log("this.CurrentOrders", this.CurrentOrders);

      this.holdingsForMarketSelected.forEach((e) => {});

      this.holdingsWithCurrentOrder;

      //get ltp of the script

      //place order for ltp
    },

    getParsedJson(js) {
      if (typeof js == "string") {
        return JSON.parse(js);
      } else {
        return "";
      }
    },

    getLTPStatusforPivotPoints(ltp, pivotPoints) {
      return typeof pivotPoints;
      let pivotPointsJson = JSON.parse(pivotPoints);

      return pivotPointsJson;

      if (ltp < pivotPointsJson.s3) {
        return `LTP ${ltp} Below s3 ${pivotPointsJson.s3}`;
      } else if (ltp < pivotPointsJson.s2) {
        return `LTP ${ltp} Below s2 ${pivotPointsJson.s2}`;
      } else if (ltp < pivotPointsJson.s1) {
        return `LTP ${ltp} Below s1 ${pivotPointsJson.s1}`;
      } else
        return `s3 - ${pivotPointsJson.s3} s2 ${pivotPointsJson.s2}  s1 ${pivotPointsJson.s1} `;
    },

    orderby(param) {
      return false;

      // console.log('param',param,'this.ClickedParam',this.ClickedParam)
      if (this.ClickedParam == param) {
        this.holdings = [
          ...this.holdingsForMarket.sort((a, b) => {
            console.log("a[param]", a[param]);
            return a[param] - b[param];
          }),
        ];
      } else {
        this.holdings = [
          ...this.holdingsForMarket.sort((a, b) => {
            return b[param] - a[param];
          }),
        ];
      }

      this.ClickedParam = param;
    },

    PlaceTargetPricePointNext() {
      const url = "/api/PlaceTarget";

      alert(this.holdingsForMarket.length, "total");
      let ln = 0;
      let map = this.holdingsForMarket.map((holding) => {
        let order = {};

        ln = ln + 1;

        // let pivotPoints = JSON.parse(holding.targets.pivotPoints);

        order.variety = this.selectedVariety;
        order.params = {};
        order.params.exchange = "NSE";
        order.params.tradingsymbol = holding.tradingsymbol;
        order.params.transaction_type = "SELL";

        // if(holding.targetGainPcNumber>5){
        if (true) {
          let total_quantity = holding.quantity + holding.t1_quantity;
          let disclosed_quantity = Math.ceil(total_quantity / 10);

          order.params.disclosed_quantity = disclosed_quantity;
          order.params.quantity = holding.quantity + holding.t1_quantity;
        } else {
          order.params.quantity = 0;
        }

        order.params.product = "CNC";
        order.params.order_type = "LIMIT";
        order.params.validity = "DAY";
        // order.params.price=holding.targets.level.ressistance;

        if (typeof holding.targets !== "undefined") {
          order.params.price = holding.targets.realtarget;
        } else {
          order.params.price = (holding.average_price * 1.1).toFixed(1);
        }

        return order;
      });

      let con = confirm(ln);

      if (!con) {
        return false;
      }
      let data1 = JSON.stringify(map);

      let data = {};
      data.sessionString = JSON.stringify(this.session);
      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // console.log('mapy',data,'url',url);
      // return false;

      axios.post(url, data).then((res) => {
        // console.log('result')
        this.$router.push("/orders");
      });
    },
    PlaceTargetR2() {
      const url = "/api/PlaceTarget";

      let ln = 0;
      let map = this.holdingsForMarket.map((holding) => {
        let order = {};

        ln = ln + 1;

        if (holding.pivotPoints) {
          let pivotPoints = JSON.parse(holding.targets.pivotPoints);

          order.variety = this.selectedVariety;
          order.params = {};
          order.params.exchange = "NSE";
          order.params.tradingsymbol = holding.tradingsymbol;
          order.params.transaction_type = "SELL";

          // if(holding.targetGainPcNumber>5){
          if (true) {
            let total_quantity = holding.quantity + holding.t1_quantity;
            let disclosed_quantity = Math.ceil(total_quantity / 10);

            order.params.disclosed_quantity = disclosed_quantity;
            order.params.quantity = holding.quantity + holding.t1_quantity;
          } else {
            order.params.quantity = 0;
          }

          order.params.product = "CNC";
          order.params.order_type = "LIMIT";
          order.params.validity = "DAY";
          // order.params.price=holding.targets.level.ressistance;
          order.params.price = pivotPoints.r3;
        }

        return order;
      });

      let con = confirm(ln);

      if (!con) {
        return false;
      }
      let data1 = JSON.stringify(map);

      let data = {};
      data.sessionString = JSON.stringify(this.session);
      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // console.log('mapy',data,'url',url);
      // return false;

      axios.post(url, data).then((res) => {
        // console.log('result')
        this.$router.push("/orders");
      });
    },

    async reflectorders() {
      return false;
      let orders = await this.getOrders();

      orders.forEach((o) => {
        this.$set(
          this.holdingsForMarket.filter((h) => {
            h.instrument_token == o.instrument_token;
          })[0],
          "order_detail",
          o
        );
      });
    },

    PlaceTarget() {
      const url = "/api/PlaceTarget";

      let ln = 0;
      let map = this.holdingsForMarket.map((holding) => {
        let order = {};

        // console.log('holding.targetGainPc',holding.targetGainPcNumber)

        ln = ln + 1;

        if (holding.targets.level.ressistance) {
          order.variety = this.selectedVariety;
          order.params = {};
          order.params.exchange = "NSE";
          order.params.tradingsymbol = holding.tradingsymbol;
          order.params.transaction_type = "SELL";

          if (holding.targetGainPcNumber > 5) {
            let total_quantity = holding.quantity + holding.t1_quantity;
            let disclosed_quantity = Math.ceil(total_quantity / 10);

            order.params.disclosed_quantity = disclosed_quantity;
            order.params.quantity = holding.quantity + holding.t1_quantity;
          } else {
            order.params.quantity = 0;
          }

          order.params.product = "CNC";
          order.params.order_type = "LIMIT";
          order.params.validity = "DAY";
          order.params.price = holding.targets.level.ressistance.high;
        }

        return order;
      });

      let con = confirm("Do you want to place order for " + ln + "items");

      if (!con) {
        return false;
      }
      let data1 = JSON.stringify(map);

      let data = {};
      data.sessionString = JSON.stringify(this.session);
      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // console.log('mapy',data,'url',url);
      // return false;

      axios.post(url, data).then(async (res) => {
        // console.log('result')

        this.reflectorders();

        // this.$router.push("/orders")
      });
    },

    PlaceStopLoss() {
      ////////////////////////////place sl

      const url = "/api/PlaceTarget";

      let map = this.holdingsForMarket.map((holding) => {
        let order = {};
        if (holding.targets.level.support) {
          order.variety = this.selectedVariety;
          order.params = {};
          order.params.exchange = "NSE";
          order.params.tradingsymbol = holding.tradingsymbol;
          order.params.transaction_type = "SELL";

          order.params.quantity = holding.quantity + holding.t1_quantity;

          let total_quantity = holding.quantity + holding.t1_quantity;
          let disclosed_quantity = Math.ceil(total_quantity / 10);

          order.params.disclosed_quantity = disclosed_quantity;

          // order.params.quantity=1;
          order.params.product = "CNC";
          order.params.order_type = "SL";
          order.params.validity = "DAY";
          order.params.trigger_price =
            holding.targets.level.support.level * 0.98;
          order.params.price = holding.targets.level.support.level * 0.98;
        }

        return order;
      });

      let data1 = JSON.stringify(map);

      let data = {};

      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // console.log('mapy',data); //return false;

      axios.post(url, data).then((res) => {
        this.$router.push("/orders");

        // console.log('result')
      });
      ////////////////////////////place sl
    },

    roundToOneDigit(val) {
      return Math.round(val * 10) / 10;
    },
    PlaceStopLossYesterdayLow() {
      ////////////////////////////place sl

      const url = "/api/PlaceTarget";

         alert(this.selectedVariety);

      if (typeof this.selectedVariety == "undefined") {
        this.selectedVariety = "regular";
      }
      // .filter((f) => f.selected == true)
      let map = this.holdingsForMarket

    

        .map((holding) => {
          let order = {};
          if (holding.targetSlYestLowSl) {
            order.variety = this.selectedVariety;
            order.params = {};
            order.params.exchange = "NSE";
            order.params.tradingsymbol = holding.tradingsymbol;
            order.params.transaction_type = "SELL";

            let total_quantity = holding.quantity + holding.t1_quantity;

            // let total_quantity=1;
            // let disclosed_quantity=Math.ceil(total_quantity/10)
            // let disclosed_quantity=Math.ceil(total_quantity/10)

            let avoidArray = ["SGBMAR25-GB", "EBBETF0423"];
            if (avoidArray.includes(order.params.tradingsymbol)) {
              order.params.quantity = 0;

              order.params.disclosed_quantity = 0;
            }

            let disclosed_quantity = 1;
            let qty;
            switch (this.selectedStopLossQuantity) {
              case "FULL":
                let disclosed_quantity = Math.ceil(total_quantity / 10);
                order.params.quantity = holding.quantity + holding.t1_quantity;

                order.params.disclosed_quantity = disclosed_quantity;

                break;

              case "HALF":
                qty = holding.quantity + holding.t1_quantity;

                order.params.quantity = Math.max(Math.floor(qty / 2), 1);
                disclosed_quantity = Math.max(
                  Math.ceil(order.params.quantity / 10),
                  1
                );

                order.params.disclosed_quantity = disclosed_quantity;

                break;
              case "QUARTER":
                qty = holding.quantity + holding.t1_quantity;

                order.params.quantity = Math.max(Math.floor(qty / 4), 1);

                disclosed_quantity = Math.max(
                  Math.ceil(order.params.quantity / 10),
                  1
                );

                order.params.disclosed_quantity = disclosed_quantity;

                break;
              case "ONE THIRD":
                qty = holding.quantity + holding.t1_quantity;

                order.params.quantity = Math.max(Math.floor(qty / 3), 1);

                disclosed_quantity = Math.max(
                  Math.ceil(order.params.quantity / 10),
                  1
                );

                order.params.disclosed_quantity = disclosed_quantity;

                break;
            }

            order.params.product = "CNC";

            if (this.selectedOrderType != "") {
              order.params.order_type = this.selectedOrderType;
            } else {
              order.params.order_type = "SL";
            }

            // order.params.order_type='LIMIT';
            order.params.validity = "DAY";

            switch (this.selectedStopLossPoint) {
              case "Heikin-Ashi-low":
                order.params.trigger_price = this.roundToOneDigit(
                  holding.targets.heikinAshi.Low
                );
                order.params.price = this.roundToOneDigit(
                  holding.targets.heikinAshi.Low * 0.99
                );
                break;

              case "":
                order.params.trigger_price = this.roundToOneDigit(
                  holding.targetSlYestLowSl
                );
                order.params.price = this.roundToOneDigit(
                  holding.targetSlYestLowSl * 0.99
                );
                break;
              case "yesterday-low":
                order.params.trigger_price = this.roundToOneDigit(
                  holding.targets.yesterday.low
                );
                order.params.price = this.roundToOneDigit(
                  holding.targetSlYestLowSl * 0.99
                );
                break;

              //    TC-> &nbsp; <span class="bg-primary"> {{JSON.parse(holding.targets.pivotPoints).tc}} </span> &nbsp;
              //     BC-> &nbsp; <span class="bg-primary"> {{JSON.parse(holding.targets.pivotPoints).bc}} </span> &nbsp;
              //     R1-> &nbsp; <span class="bg-primary"> {{JSON.parse(holding.targets.pivotPoints).r1}} </span> &nbsp;
              //     R2-> &nbsp; <span class="bg-primary"> {{JSON.parse(holding.targets.pivotPoints).r2}} </span> &nbsp;
              //     R3-> &nbsp; <span class="bg-primary"> {{JSON.parse(holding.targets.pivotPoints).r3}} </span> &nbsp;
              //     pivot -> &nbsp; <span class="bg-primary"> {{JSON.parse(holding.targets.pivotPoints).pivotPoint}} </span> &nbsp;

              case "pivot-point":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).pivotPoint
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).pivotPoint
                  );
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl * 0.99
                  );
                }

                break;
              case "pivot-point-bc":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).bc
                ) {
                  order.params.trigger_price = this.roundToOneDigit(
                    holding.targets.yesterday.low
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).bc
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).bc
                  );
                }
                break;
              case "pivot-point-tc":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).tc
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).tc
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).tc
                  );
                }
                break;
              case "pivot-point-r1":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).r1
                ) {
                  order.params.price = holding.targetSlYestLowSl;
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).r1
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).r1
                  );
                }
                break;
              case "pivot-point-r2":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).r2
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).r2
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).r2
                  );
                }
                break;
              case "pivot-point-r3":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).r3
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).r3
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).r3
                  );
                }
                break;
              case "pivot-point-s1":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).s1
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).s1
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).s1
                  );
                }
                break;
              case "pivot-point-s2":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).s2
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).s2
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).s2
                  );
                }
                break;
              case "pivot-point-s3":
                if (
                  holding.last_price <=
                  JSON.parse(holding.targets.pivotPoints).s3
                ) {
                  order.params.price = this.roundToOneDigit(
                    holding.targetSlYestLowSl
                  );
                } else {
                  order.params.trigger_price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).s3
                  );
                  order.params.price = this.roundToOneDigit(
                    JSON.parse(holding.targets.pivotPoints).s3
                  );
                }
                break;
            }
          }

          return order;
        });

      // alert(this.selectedStopLossPoint);

      // return false;

      //   alert(map.length);
      //   return false;

      let data1 = JSON.stringify(map);

      let data = {};

      data.accessToken = this.accessToken;
      data.ZerodhaParams = data1;

      // console.clear();
      //
       console.log("mapy", data);
      // return false;

      axios.post(url, data).then(async (res) => {
        let orders = await this.getOrders();

        console.log(orders,'orders here');
        orders.forEach((o) => {
          this.$set(
            this.holdingsForMarket.filter((h) => {
              h.instrument_token == o.instrument_token;
            })[0],
            "status",
            o
          );
        });
        this.$router.push("/orders");

        // console.log('result')
      });
      ////////////////////////////place sl
    },

    ToggleSelec(instrument_token, evt) {
      // console.log('unchecking',instrument_token)

      //   let conf=  confirm('do u realyy want to uncjeck the')

      if (true) {
        if (!evt.target.checked) {
          this.$nextTick(() => {
            this.holdings.filter(
              (h) => h.instrument_token == instrument_token
            )[0].selected = false;
          });
        }
      }
    },

    SelectAllHoldings() {
      this.totalTargetGain = 0;
      this.totalStopLossGain = 0;

      if (this.SelectAll == true) {
        this.holdings.forEach((h) => (h.selected = false));
      } else {
        this.holdings.forEach((h) => (h.selected = true));
      }

      // console.log('selected',this.holdings[0].selected)
    },

    calculatePricePoints(
      ltp,
      instrument_token,
      pp1,
      average_price,
      currentScript
    ) {
      let pp = pp1.pricePoints;

      let arryOfInstruments = [];

      arryOfInstruments.push(instrument_token);
      let ln = pp.length;
      pp.forEach((p, index, arry) => {
        let ln = arry.length;

        if (index + 1 < ln) {
          if (p.level < this.ltp && pp[index + 1]["level"] > ltp) {
            p.Currentlevel = true;

            this.CurrentLevelIndex = index;
          } else {
            p.Currentlevel = false;
          }
        }
      });

      var s;
      if (this.CurrentLevelIndex < ln) {
        if (typeof pp[this.CurrentLevelIndex] === "undefined") {
          // console.log('undefined so ',this.prices,'current index',this.CurrentLevelIndex)
          s = pp[0];
        } else {
          s = pp[this.CurrentLevelIndex];
        }

        var t;

        if (typeof pp[this.CurrentLevelIndex + 1] === "undefined") {
          t = pp[pp.length - 1];

          //  console.log('undefiend',t)
        } else {
          t = pp[this.CurrentLevelIndex + 1];
        }
      }

      let yesterday = pp1.yesterday;

      let toc = {};
      toc.instrument_tocken = instrument_token;

      let l = {};
      l.support = s;
      l.ressistance = t;

      // l.support=0;
      // l.ressistance=0;

      toc.level = l;

      if (typeof yesterday == "undefined") {
        return false;
      } else {
        toc.yesterday = yesterday;
        let yesterdayHigh5pc = yesterday.high * 1.02;
        toc.quote = yesterday.qoute;

        let pricePointAbove5pcYesterdayHigh = pp.filter(
          (p) => p.high > yesterdayHigh5pc
        );
        toc.yesterdayHigh5pc = yesterdayHigh5pc;

        let ref=Math.max(yesterday.high,average_price * 1.05);

        let PricePointAboveAveragePrice = pp.filter(
          (p) => p.high > ref
        );

        //////////////////////////////

        // if(pricePointAbove5pcYesterdayHigh.length>0)
        if (PricePointAboveAveragePrice.length > 0) {
          // if(toc.quote.upper_circuit_limit>pricePointAbove5pcYesterdayHigh[0].high)
          if (
            toc.quote.upper_circuit_limit > PricePointAboveAveragePrice[0].high
          ) {
            // toc.realtarget=pricePointAbove5pcYesterdayHigh[0].high
            toc.realtarget = PricePointAboveAveragePrice[0].high;
            // toc.realtargetType='pricePointAbove5pcYesterdayHigh'
            toc.realtargetType = "PricePointAboveAveragePrice[0].high";
          }
          
          
          // else if (
          //   toc.quote.upper_circuit_limit > (average_price * 1.05).toFixed(1)
          // ) {
          //   toc.realtarget = Math.min((average_price * 1.05).toFixed(1));

          //   toc.realtargetType = "rangeBreakOutTarget";
          // } 
          
          
          else {
            toc.realtarget = toc.quote.upper_circuit_limit-.05*3;
          }
        }
        
        
        else {

          toc.realtarget = toc.quote.upper_circuit_limit-.05*3;
          // toc.realtarget = Math.min((average_price * 1.05).toFixed(1));

          // console.log(
          //   "zero length",
          //   average_price,
          //   "average_price",
          //   currentScript.tradingsymbol,
          //   toc.realtarget,
          //   "toc.realtarget"
          // );
        }

        // console.log(
        //   average_price,
        //   "average_price",
        //   currentScript.tradingsymbol,
        //   "td",
        //   toc.realtarget,
        //   "toc.realtarget",
        //   "PricePointAboveAveragePrice=",
        //   PricePointAboveAveragePrice
        // );

        if (typeof toc.realtarget == "undefined")
          if (toc.quote.upper_circuit_limit > yesterday.rangeBreakOutTarget) {
            toc.realtarget = yesterday.rangeBreakOutTarget;

            toc.realtargetType = "rangeBreakOutTarget";
          }
        //////////////////////////////
      }

      toc.pivotPoints = pp1.pivotPoints;

      toc.heikinAshi = pp1.heikinAshi;

      toc.pivotPointObject = pp1.pivotPointObject;

      toc.prices = pp;
      if (typeof toc.realtarget == "undefined")
        if (toc.quote.upper_circuit_limit > toc.pivotPointObject.r3)
          if (toc.pivotPoints != "hi") {
            toc.realtarget = toc.pivotPointObject.r3;

            toc.realtargetType = "toc.pivotPoints.r3";
          }

      if (typeof toc.realtarget == "undefined")
        if (toc.pivotPoints != "hi")
          if (toc.quote.upper_circuit_limit > toc.pivotPointObject.r2) {
            toc.realtarget = toc.pivotPointObject.r2;

            toc.realtargetType = "toc.pivotPoints.r2";
          }

      if (typeof toc.realtarget == "undefined")
        if (toc.pivotPoints != "hi")
          if (toc.quote.upper_circuit_limit > toc.pivotPointObject.r1) {
            toc.realtarget = toc.quote.upper_circuit_limit;
            // toc.realtarget=toc.pivotPointObject.r1

            toc.realtargetType = "toc.pivotPoints.r1";
          }

      return toc;
    },

    // else{
    // let toc={};
    // toc.instrument_tocken=instrument_tocken;

    //     let l={};
    // l.support=-1;
    // l.ressistance=-1;

    // toc.level=l;

    // return toc;
    // }

    ReflectCalculated(val, tkn) {
      // console.log('ReflectCalculated(',val)

      if (typeof val !== "object") {
        console.log('val',val,'typeofval',typeof val,tkn)

        this.$set(
          this.holdings.filter((h) => h.instrument_token == tkn)[0],
          "targets",
          {}
        );
        this.$set(
          this.holdings.filter((h) => h.instrument_token == tkn)[0],
          "selected",
          true
        );

        this.holdingLength = this.holdingLength - 1;

        // if (this.holdingLength == 0) {
        //   this.loadingContent = false;
        // } else {
        //   this.loadingContent = true;
        // }

        // if(this.holdingLength <-1){

        //    this.loadingContent = false;
        // }

        return;
      }
      // let tkn = val.instrument_token;

      try {
        this.$set(
          this.holdings.filter((h) => h.instrument_token == tkn)[0],
          "targets",
          val
        );

        this.$set(
          this.holdings.filter((h) => h.instrument_token == tkn)[0],
          "selected",
          true
        );

        this.holdingLength = this.holdingLength - 1;

        if (this.holdingLength == 0) {
          this.loadingContent = false;
        } else {
          this.loadingContent = true;
        }

        if (this.holdingLength < -1) {
          this.loadingContent = false;
        }
      } catch (error) {
        this.holdingLength = this.holdingLength - 1;

        if (this.holdingLength == 0) {
          this.loadingContent = false;
        } else {
          this.loadingContent = true;
        }

        if (this.holdingLength < -1) {
          this.loadingContent = false;
        }

        console.log("error", error);
      }

      return;

      this.holdings.forEach((holding) => {
        if (holding.targets == "undefined") {
          console.log("holding.targets.level.support undefined", holding);
        } else {
          // console.log('holding.targets.level.support true',holding.tradingsymbol)
        }
      });

      // ,'selected1',true
      this.$set(
        this.holdings.filter((h) => h.instrument_token == tkn)[0],
        "selected",
        true
      );

      this.instrumentSlTargetlevels.push(val);
    },

    async getPricePoints(instrument_tocken, accessToken, average_price) {
      // let inst_token1=1207553;

      const url =
        "/api/pricePoints/" + instrument_tocken + "/accessToken/" + accessToken;

      return axios.get(url).then((res) => res.data);

      //    .then(res=>{
      //         this.pricePoints=res.data.pricePoints;
      //         this.pivotPoints=res.data.pivotPoints;
      //         yesterday=res.data.yesterday;
      //         console.log('price point from olace order',this.pricePoints);

      //     }).catch(e=>console.log('price point function some error',e))
    },

    getHoldingsForCrossCheck() {
      const url = "/api/holdings/" + this.accessToken;

      axios.get(url).then((res) => {
        this.holdings = res.data.sort((a, b) => {
          return a.pnl - b.pnl;
        });
      });
    },

    getHoldings() {
      const url = "/api/holdings/" + this.accessToken;

      axios
        .get(url)
        .then((res) => {
          this.holdings = res.data.sort((a, b) => {
            return a.pnl - b.pnl;
          });

          let holdings = [...this.holdings];

          let holdingsLength = holdings.length;

          let interval = 700;

          let currentScript;

          this.loadedPricePoints=false;
          let itrationTimer = setInterval(async () => {
            holdingsLength = holdings.length;

            currentScript = holdings.pop();

            // console.log('currentScript123',currentScript)

            if (typeof currentScript == "undefined") {
              clearInterval(itrationTimer);
              console.log("cleared intreval2",
              
              this.holdingsForMarket1
              
              
              );

              this.loadedPricePoints=true;
              this.loadingContent = false;
              return false;

              //return false;
            }

            if (typeof currentScript == "undefined") {
              return false;
            }

            if (typeof currentScript !== "undefined") {
              let investments =
                currentScript.average_price * currentScript.quantity;
            }

            let pp = await this.getPricePoints(
              currentScript.instrument_token,
              this.accessToken,
              currentScript.average_price
            );
            // console.log('pp',currentScript.average_price)

            let ltp = 0;

            if (typeof currentScript !== "undefined")
              if (
                typeof currentScript.instrument_token != "undefined" &&
                typeof pp.yesterday != "undefined"
              ) {
                let val = this.calculatePricePoints(
                  ltp,
                  currentScript.instrument_token,
                  pp,
                  currentScript.average_price,
                  currentScript
                );

                this.ReflectCalculated(val, currentScript.instrument_token);
              }
          }, interval);

          this.holdings.forEach(async (h) => {
            h.investments = h.average_price * h.quantity;
            this.$set(h, "PcSl", false);
            h.targetPc = false;

            //     let orders=await this.getOrders();

            // orders.forEach(o=>{

            // this.$set(this.holdingsForMarket.filter(h=>{h.instrument_token==o.instrument_token})[0],'order_status',o)

            // }   )

            // console.log('h',h.instrument_token)

            // let r=await new Promise(
            // (res,rej)=>{

            // setTimeout(r=>{

            //     console.log('after 3s')
            // },3000)

            // }

            // )

            // let pricePoints=await this.getPricePoints(h.instrument_token,this.accessToken);

            // console.log('h1',h);
            // console.log('pricePoints',pricePoints);

            // this.$set( h, 'targets', pricePoints);

            // console.log('h2',h);

            //  this.$set(h, 'selected',true);

            //         this.holdingLength=this.holdingLength-1;

            //         if(this.holdingLength==0){

            //             this.loadingContent=false;
            //         }else{
            // this.loadingContent=true;

            //         }

            // this.ReflectCalculated(pricePoints);

            // setTimeout(async ()=>{

            // },1)
          }); //end of foe each

          this.holdingLength = this.holdings.length;

          this.reflectorders();
        })
        .then((r) => {
          let subscriptionSymbols = this.holdings.map(
            (h) => h.instrument_token
          );

          socket.emit("subscribe-orders", JSON.stringify(subscriptionSymbols));
        })
        .then(async (e) => {
          let orders = await this.getOrders();

          //   console.log("orders", orders);

          this.holdings.forEach((h) => {
            // console.log('o.instrument_token',o.instrument_token,'order',o,'holdings',this.holdings )

            let test = orders.filter(
              (o) => o.instrument_token == h.instrument_token
            )[0];
            if (typeof test == "undefined") {
              return false;
            }
            // console.log(
            //   "this.holdingsForMarket.filter(h=>{h.instrument_token==o.instrument_token})[0]",

            //   orders.filter((o) => o.instrument_token == h.instrument_token)[0]
            // );

            let o = orders.filter(
              (o) =>
                o.instrument_token == h.instrument_token &&
                o.status != "CANCELLED" &&
                o.status != "CANCELLED AMO"
            )[0];
            if (typeof o == "undefined") {
              o = {};
              o.status = "NO CURRENT ORDER";
              this.$set(h, "order_detail", o);
            } else {
              this.$set(h, "order_detail", o);
            }
          });
        });
    },
  },
};
</script>

<style scoped>
</style>