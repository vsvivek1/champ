<template>
  <div>
      <h1>CIS Data</h1>
   
     <h1>ip {{ ip }}    </h1>
      <h1 :style="{ color: engineLive ? '#16a34a' : '#dc2626' }">
        Engine: {{ engineLive ? 'Live' : 'OFFLINE' }}
      </h1>
      <h1>No Manual Trades</h1>
      <h1>MY ALL LOSSES ARE DUE TO HANGING ON TO LOOSING POSITIONS without STOP LOSS</h1>

         <h1>CHANGE IN SL STRATEGY . EITHER MA20 OR DAY OPEN. ENTRY ALSO FOR THE SAME </h1>

         {{  belowOpenSymbols.length }} symbols below open <br>
         {{  below20MaSymbols.length }} symbols below 20 MA <br>  


          <button @click="fetchInstruments">
            Fetch Instruments
            </button>


             <button @click="startMainfullJs">
            startMainfullJs
            </button>



 <table>

  <tbody>
                <tr v-for="(chunk, rowIndex) in belowOpenSymbols" :key="rowIndex">
                   
                    <td v-for="(item, index) in chunk" :key="index">
                        {{ item.tradingsymbol }} - LTP: {{ item.tick.last_price }} - Open: {{ item.tick.ohlc.open }}
                    </td>
                </tr>
            </tbody>
        </table>
      <table>
            <thead>
                <tr>
                    <th colspan="5">Key</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(chunk, rowIndex) in chunkArray(Object.entries(symbols[0] || {}), 5)" :key="rowIndex">
                   
                   
                    <td v-for="(key, index) in chunk" :key="index">
                        <input type="checkbox" :id="key[0]" v-model="selectedKeys" :value="key[0]">
                        <label :for="key[0]">{{ key[0] }}</label>
                    </td>
                </tr>
            </tbody>
        </table>

  

        <table v-if="symbols && symbols.length > 0">
            <thead>
                <tr>
                    <th>Sl No</th>
                    <th>Trading Symbol
                    
                    
                    
                    </th>
                    <th v-for="key in selectedKeys" :key="key">{{ key }}</th>
                </tr>
            </thead>
            <tbody>
             
              <tr
  v-for="(item, index) in symbols1"
  :key="index"
  
 
>
                    <td>                   <span v-if="item['isAboveOpen'] " class="green"> 

^ try trades
</span>

<span v-else class="red"> 
 Dont try trades
v
</span>

<span v-if=item.position && item.tick></span>
                        
                        {{ index + 1 }}
                        
                        
                      
                        
                        </td>
                    <td>
                      Lot MAX= {{ Math.max(0, Math.floor(item.margin/(item.tick.last_price* item.lot_size)   ) || 1) }} &nbsp;
                      QTY max= {{ Math.max(0, Math.floor(item.margin/(item.tick.last_price* item.lot_size)   )*item.lot_size || 1) }} &nbsp;
Margin={{ item.margin }} &nbsp;
                        <button @click="openLink(item.chart)" class="button-link">
                          {{ item.tradingsymbol || 'N/A' }}

                          <!-- full margin{{ item.fullMargin}}  -->



                      

                           <b v-if ="item.ma20  && item.tick.last_price>item.ma20"> Above Moving Avg 20</b>

                           <b v-if ="!item.ma20 || item.ma20>item.tick.last_price"> ma20 is {{item.ma20}} below  Moving Avg 20 no trade</b>



                        
                     

 
                      
                         
                   

     
</button> <br>

<span v-if="item.oiDropPercent>1 && item.ma20<item.tick.last_price && item.liveMinute.color =='bullish'">✅ OI Drop </span>

<b>item.OiDROp% {{ item.oiDropPercent }}</b> &nbsp;
 LTP {{ item.price }} &nbsp; 

 ma5h{{ item.ma5high }}
 ma5l{{ item.ma5low }}

<span v-if="item.minuteData">Minutes: {{ Object.keys(item.minuteData).length }}</span> <br>

&nbsp; 

<span v-if="item.tick">
    
    
    
    Day range: {{ item.tick.ohlc.high-item.tick.ohlc.low }}</span>

<!-- <button @click="toggleAvoid(true,item)"

v-if="!item.avoided">Avoid</button> -->


<button  @click="toggleAvoid(false,item)"

v-if="item.avoided">Include</button>

                        <span v-if="item['hasLivePosition'] " class="green"> 

<span>mdi-briefcase {{ item['position']['quantity'] }}</span> x
</span>

                    </td>
                    <td v-for="key in selectedKeys" :key="key">



      

                        <span v-if="key=='operatorBuyCandles' && item[key]">

                            <div>
    <p v-if="item[key]['fifteenMinutes'] ">✅ Fifteen Minutes</p>
    <p v-else>❌ Fifteen Minutes</p>
    <p v-if="item[key]['thirtyMinutes'] ">✅ Thirty Minutes</p>
    <p v-else>❌ Thirty Minutes</p>
    <p v-if="item[key]['oneHour']">✅ One Hour</p>
    <p v-else>❌ One Hour</p>
    <p v-if="item[key]['allCandles']">✅ All Candles</p>
    <p v-else>❌ All Candles</p>
  </div>


</span>


                        <span v-else-if="key=='tick'">
                        <TickDisplay :item="item" /> 
</span>


<span v-else-if="key=='signals'">

    <div>

        <!-- <StrategyStatus :strategyStatuses="item.signals" /> -->

    <div 
    
    style="{border:1px solid}"
    
    v-for="(value, key) in item.signals" :key="key" class="status-item">
      <span class="status-key">{{ formatKey(key) }}</span>:
      <span :class="value ? 'status-true' : 'status-false'">
        {{ value ? '✔️' : '❌' }}
        <hr>
      </span>
    </div>
  </div>


</span>

                        <span v-else="item[key]">
                        

      
                        {{ item[key] }}

                        
                        
                        </span>
                        <!-- <span v-else>N/A</span> -->

                        
                    </td>
                </tr>
            </tbody>
        </table>


      <!-- <table v-if="symbols && symbols.length>0">
          <thead>
              <tr>
                  <th>Sl No</th>
                  <th>Trading Symbol</th>
                  <th>Message</th>
                  <th>Return</th>
                  <th>Location</th>
                  <th>Tick</th>
                  <th>OHLC</th>
                  <th>Hourly High</th>
                  <th>Position</th>
                  <th>Order</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="(item, index) in symbols" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td :class="priceClass(item)">
                      <span v-if="item && item.hasPosition">
                          <i class="fas fa-briefcase"></i>
                      </span>
                      <span v-else>
                          <i class="fas fa-tree"></i>
                      </span>
                      <button @click="openLink(item.chart)" class="button-link">
                          {{ item?.tradingsymbol || 'N/A' }}
                      </button>
                  </td>
                  <td>
                      {{ item?.message || 'N/A' }}<br>
                      Live Minute: {{ item?.liveMinute || 'N/A' }}
                  </td>
                  <td>{{ item?.returns || 'N/A' }}</td>
                  <td>{{ item?.location || 'N/A' }}</td>
                  <td v-if="item?.tick">
                      LTP: {{ item.tick.last_price || 'N/A' }}<br>
                      OHLC: {{ item.tick.ohlc || 'N/A' }}
                  </td>
                  <td v-if="item">
                      Below Open Trade: {{ item?.belowOpenTrade || 'N/A' }}<br>
                      Entry Strategy: {{ item?.strategy || 'N/A' }}<br>
                      Target: {{ item?.target || 'N/A' }}<br>
                      StopLoss: {{ item?.stoploss || 'N/A' }}
                  </td>
                  <td>{{ item?.position?.buy_price || 'N/A' }}</td>
                  <td>{{ item?.order?.status || 'N/A' }}</td>
              </tr>
          </tbody>
      </table> -->
  </div>
</template>

<script>

</script>
<script>

document.addEventListener("click", () => {
   audioCtx.resume();

 //  beep();
}, { once: true });

const audioCtx = new AudioContext();

function beep() {

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.frequency.value = 200; // sound pitch
  oscillator.type = "sine";

  gainNode.gain.value = 0.1;

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
  }, 150);
}

import io from 'socket.io-client';
import sessionMixin from '../views/sessionMixin.js';
//import instruments from '../assets/instruments/instrumentsForMining';


import TickDisplay from './TickDisplay.vue'
import instruments  from '/shared/instruments/instrumentsForMining.json';// assert { type: "json" };
import StrategyStatus from "./StrategyStatus.vue";
import axios from 'axios';
export default {
  name: 'CisUpdates',
  components:[TickDisplay,StrategyStatus],
  mixins: [sessionMixin],



  computed: {
  averagehandleSize: function() {
    const sizes = this.symbols.map(item => item?.minuteData.map() || 0).filter(size => size > 0);
   
  },
symbols1: function() {
    return this.symbols.filter(item => 
    // item.tick.ohlc.open < item.tick.last_price 
    // ||

    
 item.tick?item.ma20<item.tick.last_price:false
    // true



    );
  }, 
   },   // You can add computed properties here if needed
  data() {
      return {
        ip:'',
        soundEnabled: false,
          cisList: [],
          symbols: instruments,
          selectedKeys: ['returnPoints','tick','signals'],
          lastTickReceivedAt: null,
          engineLive: false,
      };
  },
  created() {
      const socket = io('https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net');
      socket.connect();

this.getServerIp();

   //  console.log(socket)
      socket.on('sendCis', (cis) => {
    //  console.log(cis,'cias')
          this.lastTickReceivedAt = Date.now();
          this.updateSymbol(cis);
      });

      setInterval(() => {
          this.engineLive = !!this.lastTickReceivedAt && (Date.now() - this.lastTickReceivedAt) < 10000;
      }, 2000);
  },
  methods: {

    getServerIp(){  
        axios.get('https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net/api/public-ip')
            .then(response => {

                this.ip=response.data;
            console.log('Server IP:', response.data);
            })
            .catch(error => {
            console.error('Error fetching server IP:', error);
            });     


    },

    fetchInstruments() {
        console.log('Fetching instruments for mining...');
      axios.post('https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net/api/fetchInstrumentsForMining')
        .then(response => {
          console.log('Instruments fetched:', response.data);
        })
        .catch(error => {
          console.error('Error fetching instruments:', error);
        });
    },


     startMainfullJs() {
        console.log('Fetching instruments for mining...');
      axios.post('https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net/api/startMainfullJs')
        .then(response => {
          console.log('Instruments fetched:', response.data);
        })
        .catch(error => {
          console.error('Error fetching instruments:', error);
        });
    },

    formatKey(key) {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },

    updateCisInServer(instrumentToken, key,val) {
  axios.post('http://localhost:9090/update-buyAt', {
    instrument_token: instrumentToken,
    buyAt: buyAtValue,
  })
  .then(response => {
    console.log('BuyAt value sent:', response.data);
  })
  .catch(error => {
    console.error('Error sending BuyAt value:', error);
  });
},

    toggleAvoid(boo,item){


        alert(boo)


        this.symbols.find(i=>i.instrument_token==item.instrument_token).avoided=boo;

    },
    chunkArray(array, chunkSize) {
            const result = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                result.push(array.slice(i, i + chunkSize));
            }
            return result;
        },
      openLink(url) {
          if (url) {
              window.open(url, '_blank');
          } else {
              console.warn('URL is null or undefined.');
          }
      },
      priceClass(cis) {
          if (!cis) return '';

          if (cis?.aboveNoonOpening) {
              return 'pink';
          }

          if (!cis?.tick || !cis?.tick?.ohlc) {
              return 'grey';
          }

          return cis.tick.last_price < cis.tick.ohlc.open ? 'red' : 'green';
      },
      recursiveMerge(target, source) {
          for (const key in source) {
              if (source[key] && typeof source[key] == 'object') {
                  if (!target[key]) {
                      this.$set(target, key, {});
                  }
                  this.recursiveMerge(target[key], source[key]);
              } else {
                  this.$set(target, key, source[key]);
              }
          }
      },
  updateSymbol(cis) {

    // Basic validation
    if (!cis) {
      //  console.log("CASE 0: cis is null");
        return;
    }

    if (!cis.tradingsymbol) {
      //  console.log("CASE 0: tradingsymbol missing");
        return;
    }

    if (!cis.minuteData || cis.minuteData.length < 2) {
      //  console.log("CASE 0: minuteData missing");
        return;
    }

    // 9 AM filter
    if (
        cis.hours == 9 &&
        cis.tick?.last_price < cis.tick?.ohlc?.open
    ) {
        // console.log(
        //     "CASE 0: Not showing",
        //     cis.tradingsymbol,
        //     "Hour:", cis.hours,
        //     "Last:", cis.tick.last_price,
        //     "Open:", cis.tick.ohlc.open
        // );
        // return;
    }

    let shouldBeep = false;

    // ==========================
    // CASE 1 : OI Drop + Above MA20 + Bullish
    // ==========================
    if (
        cis.oiDropPercent > 1 &&
        cis.ma20 < cis.tick.last_price &&
        cis.liveMinute?.color === "bullish"
    ) {
        // console.log(
        //     "CASE 1 TRIGGERED",
        //     cis.tradingsymbol,
        //     "OI Drop:", cis.oiDropPercent,
        //     "MA20:", cis.ma20,
        //     "LTP:", cis.tick.last_price
        // );

        shouldBeep = true;
    }

    // ==========================
    // CASE 2 : Inside Bar Break Bullish
    // ==========================
    const current = cis.minuteData.at(-1);
    const previous = cis.minuteData.at(-2);

    if (
        current.low > previous.low &&
        previous.high > current.high &&
        cis.liveMinute?.color === "bullish"
    ) {
        // console.log(
        //     "CASE 2 TRIGGERED",
        //     cis.tradingsymbol,
        //     "Current Low:", current.low,
        //     "Previous Low:", previous.low,
        //     "Current High:", current.high,
        //     "Previous High:", previous.high
        // );

        shouldBeep = true;
    }

    // ==========================
    // CASE 3
    // ==========================
    if (
        false // your condition here
    ) {
        console.log(
            "CASE 3 TRIGGERED",
            cis.tradingsymbol
        );

        shouldBeep = true;
    }

     if (shouldBeep) {
    //     console.log(
    //         "ALERT >>>",
    //         cis.tradingsymbol
    //     );
        beep();
    }

    const index = this.symbols.findIndex(
        item => item?.tradingsymbol === cis.tradingsymbol
    );

    if (index !== -1) {
        this.recursiveMerge(this.symbols[index], cis);
    } else {
        this.symbols.push(cis);
    }
},
      belowOpenSymbols() {
          return this.symbols.filter(item => item.tick && item.tick.ohlc && item.tick.last_price < item.tick.ohlc.open);
      },
      below20MaSymbols() {
          return this.symbols.filter(item => item.tick && item.ma20 && item.tick.last_price < item.ma20);
      },
  },
};
</script>

<style>
.pink {
  color: rgb(212, 8, 137);


  border-style:groove;
  border-color: black;
}
.red {
  color: rgb(97, 21, 21);
  background-color: black;

  border-style:groove;
  border-color: black;
}
.green {
  color: rgb(65, 105, 65);
  border-style:groove;
  border-color: black;
}
.blue {
  color: rgb(40, 7, 229);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
  text-align: left;
}
tr:nth-child(even) {
  background-color: #f9f9f9;
}

.row-green {
  background-color: rgba(28, 129, 28, 0.12); /* light green tint */
}

.row-red {
  background-color: rgba(255, 0, 0, 0.12); /* light red tint */
}
</style>
