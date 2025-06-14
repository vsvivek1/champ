<template>
  <div>
      <h1>CIS Data</h1>
   
      <h1>No Manual Trades</h1>
      <h1>MY ALL LOSSES ARE DUE TO HANGING ON TO LOOSING POSITIONS without STOP LOSS</h1>

         <h1>CHANGE IN SL STRATEGY . EITHER MA20 OR DAY OPEN. ENTRY ALSO FOR THE SAME </h1>


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
             
                <tr v-for="(item, index) in symbols" :key="index"
                
                
             
                
                >
                    <td>                   <span v-if="item['isAboveOpen'] " class="green"> 

^
</span>

<span v-else class="red"> 

v
</span>

<span v-if=item.position></span>
                        
                        {{ index + 1 }}</td>
                    <td>
                        cccc
                        <button @click="openLink(item.chart)" class="button-link">
                          {{ item.tradingsymbol || 'N/A' }}



                      

                           <b v-if ="item.ma20  && item.tick.last_price>item.ma20"> Above Moving Avg 20</b>

                           <b v-if ="!item.ma20 || item.ma20>item.tick.last_price"> ma20 is {{item.ma20}} below  Moving Avg 20 no trade</b>


                        
                     

 
                      
                         
                   

     
</button> <br>
 LTP {{ item.price }} &nbsp; 

 ma5h{{ item.ma5high }}
 ma5l{{ item.ma5low }}

<span v-if="item.minuteData">Minutes: {{ Object.keys(item.minuteData).length }}</span> <br>

&nbsp; 

<span v-if="item.tick">
    
    
    
    Day range: {{ item.tick.ohlc.high-item.tick.ohlc.low }}</span>

<!-- <v-btn @click="toggleAvoid(true,item)"

v-if="!item.avoided">Avoid</v-btn> -->


<v-btn  @click="toggleAvoid(false,item)"

v-if="item.avoided">Include</v-btn>

                        <span v-if="item['hasLivePosition'] " class="green"> 

<v-icon>mdi-briefcase {{ item['position']['quantity'] }}</v-icon> x
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
                        <span v-else>N/A</span>
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
import io from 'socket.io-client';
import sessionMixin from '../views/sessionMixin.js';
//import instruments from '../assets/instruments/instrumentsForMining';


import TickDisplay from './TickDisplay.vue'
import instruments  from '/public/instruments/instrumentsForMining.json';// assert { type: "json" };

export default {
  name: 'CisUpdates',
  components:[TickDisplay],
  mixins: [sessionMixin],
  data() {
      return {
          cisList: [],
          symbols: instruments,
          selectedKeys: ['returnPoints','tick','entryHealth','operatorBuyCandles','signals','buyCriteria'],
      };
  },
  created() {
      const socket = io('http://localhost:4000');

    //  console.log(socket)
      socket.on('sendCis', (cis) => {
     // console.log(cis,'cias')
          this.updateSymbol(cis);
      });
  },
  methods: {

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
              if (source[key] && typeof source[key] === 'object') {
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
          if (!cis || !cis.tradingsymbol) return;

          const index = this.symbols.findIndex(item => item?.tradingsymbol === cis.tradingsymbol);

          if (index !== -1) {
              this.recursiveMerge(this.symbols[index], cis);
          } else {
              this.symbols.push(cis);
          }
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
</style>
