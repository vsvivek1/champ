<template>
  <div>
    symbols : {{ symbols.length }} 
   current instruments : {{ currentInstruments.length }} 
   instruments : {{ instruments.length }} 

    HI
    <hr />

    <!-- {{ohlc}} -->

    <hr>

    <ul>
      <li v-for="i in instruments" :key="i.instrument_tocken">
        {{ i }} 
      </li>
    </ul>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import axios from "axios";
import sessionMixin from "@/views/sessionMixin";

const socket = io("http://localhost:4000");

let instru = require("../instruments.json");


let instrumentsForMining=require("../instrumentsForMining.json")
export default {
  mixins: [sessionMixin],

  mounted() {
      this.instruments = instru  
      .filter(      (i) =>        i.exchange == "NFO" &&  i.segment == "NFO-OPT"  );



this.instruments=instrumentsForMining;


// this.getSymbols() ;



    socket.on("send-realtime-subscription", (s) => {

      console.log('getting ltp',s)
      this.mutateOrdersWithLtp(s);
    });

  
  
  },

  computed: {

instrumentTokens(){


return instru.map(i=>i.instrument_token)

},






  },

  methods: {



    getNearestStrikes(){


return new Promise((resolve,reject)=>{







      // console.log('from neearest strikeds with ohlc1',this.ohlc)

this.currentInstruments=[];
Object.keys(this.ohlc).forEach(item=>{
// console.log('item',item)
let symbol=item.split(':')[1];

//console.log('symbol',symbol)
let  last_price_max=this.ohlc[item].last_price*1.03
let  last_price_min=this.ohlc[item].last_price*.97

let curInstrument=this.instruments.filter(i=>i.name==symbol).filter(i=>{


// console.log('i.instrument_type',i.instrument_type)
if(i.instrument_type=='CE'){

  if(i.strike<last_price_max && i.strike>last_price_min){

    return true
  }
}

else if(i.instrument_type=='PE'){

  if(i.strike>last_price_max && i.strike<last_price_min){

    return true
  }
}  

})
// console.log('curInstrument',curInstrument)

this.currentInstruments.push(...curInstrument);
resolve(true);

})

})

},
    getLtpCosestStrikes() {

      return false;
      // Object.keys(this.ohlc).forEach((e) => {

        let e='NSE:NIFTY'
        let symbol = e.split(":")[1];

        console.log(symbol,'symbol')
        // let symbol='NIFTY';

        let optionsArray = this.instruments
          .filter((i) => i.name == symbol)
          .forEach((o) => {
            let spotStrikeDiff = this.ohlc[e].last_price - o.strike;

            if (spotStrikeDiff < 0) {
              if (o.instrument_type == "PE")

              this.$set(o,'moneyness','ITM');
              this.$set(o,'spotStrikeDiff',spotStrikeDiff);
              
            }

            if (spotStrikeDiff > 0) {
              if (o.instrument_type == "PE")

 this.$set(o,'moneyness','OTM');
              this.$set(o,'spotStrikeDiff',spotStrikeDiff);

               
            }

            if (spotStrikeDiff > 0) {
              if (o.instrument_type == "CE")

              this.$set(o,'moneyness','ITM');
              this.$set(o,'spotStrikeDiff',spotStrikeDiff);
              
            }

            if (spotStrikeDiff > 0) {
              if (o.instrument_type == "CE")


               this.$set(o,'moneyness','OTM');
              this.$set(o,'spotStrikeDiff',spotStrikeDiff);
              
            }
          });

      //  console.log(optionsArray, "optionsArray");

      this.displayingInstruments=this.instruments;

        //console.log(this.ohlc[e],'with key')

      // });
    },

    getOHLC(accessToken, instruList) {


      if (instruList.length == 0) {
        console.log("symbol array is empty");
        return false;
      }

      console.log(instruList, instruList.length, "ohlc1");

      //return false;
      let arr = JSON.stringify(instruList);

      let obj = {};
      obj.accessToken = accessToken;
      obj.symbols = arr;
      let url = "/api/postOHLC/";

      console.log("url,", url);

      return axios.post(url, obj).then((res) => {
        this.ohlc = res.data;

        console.log("ohlc2", this.ohlc, "ohlc2");

        // this.getLtpCosestStrikes();

        

        return false;

        this.StrategicStocks.forEach((s) => {
          console.log("s.exchange", s);

         

          console.log(
            "this.phlc",
            "s.symbol",
            s.symbol,
            this.Ohlc["NSE:" + s.symbol]
          );

          this.$set(s, "ohlc", this.Ohlc["NSE:" + s.symbol]);

          let w = `https://kite.zerodha.com/chart/ext/ciq/${s.instrument_token.exchange}/${s.symbol}/${s.instrument_token.instrument_token}/`;

          this.$set(s, "website", w);

          // console.log("s.ohlc", 'ohlc',this.Ohlc["NSE:" + s.symbol]);;
        });
      });
    },

    mutateOrdersWithLtp(s) {
      s.forEach((element) => {
        //console.log('element',element)

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
symbols:[],
      currentInstruments:[],
      displayingInstruments:[],
      instruments: [],
      ohlc: [],
    };
  },

  name: "Mining",
};
</script>

<style lang="scss" scoped>
</style>