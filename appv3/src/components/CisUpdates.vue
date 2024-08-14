<template>
    <div>
      <h1>CIS Data</h1>
      <h1>KPV legacy</h1>
      <h1>No manual Trades</h1>
      <h1>No Over trades. over trades uslaly results in loss dont do it</h1>
<!-- {{ symbols }} -->

      <table>
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Trading Symbol</th>
            <th>Message</th>
            <th>Return</th>
            <th>Location</th>
            <th>Returns</th>
            <th>TICK</th>
            <th>OHLC</th>
            <th>Hourly High</th>
            <th>Position</th>
            <th>Order</th>
           
          </tr>
        </thead>
        <tbody>

         <!--   -->
          <tr v-for="(item, index) in symbols" :key="index"
          


>
         
            <td >{{ index + 1 }}
            
            </td>
            <td
            :class="priceClass(item)"
            >
            <span v-if="item.hasPosition">
      <i class="fas fa-briefcase"></i>
    </span> 
    <span  v-else>
     <i class="fas fa-tree"></i>
    </span> 
    <button @click="openLink(item.chart)" class="button-link">{{ item.tradingsymbol }}</button>


               
            </td>

            <td>{{ item.message }}
              <br>
              Live Minute{{ item.liveMinute }}
            </td>
            <td>{{ item.returns}}</td>
           
            <td>{{ item.location }}</td>
            
            <td v-if="item.tick">LTP :{{ 
            
            item.tick.last_price}}
            OHLC: {{  item.tick.ohlc  }}
          </td>
            
            
            <td v-if="item">
              Below Open Trade :{{item.belowOpenTrade}}
              Entry Strategy :{{item.strategy}}
              Target :{{item.target}}
              StopLoss :{{item.stoploss}}
            
            
            </td>
           
            <td>{{ item.position }}</td>
            <td v-if="item.position">{{ item.position.buy_price }}</td>
            <td v-if="item.order">{{ item.order.status }}</td>
            


          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  import sessionMixin from '../views/sessionMixin.js'

import instruments from '../assets/instruments/instrumentsForMining'
  
  export default {

    computed: {
               
            },
    name: 'CisUpdates',
    mixins: [sessionMixin],
    data() {
      return {
        cisList: [],
        symbols:instruments,
      };
    },
    created() {
      const socket = io('http://localhost:4000');
      socket.on('sendCis', (cis) => {
        this.updateSymbol(cis)
      });
    },
    methods: {
      openLink(url) {
            window.open(url, '_blank');
        },
      priceClass(cis) {

      if(cis.aboveNoonOpening){

        return 'pink'
      }

/* if(!cis.tick || !cis.minuteData || !cis.minuteData[cis.minuteData.length-2]){

  return 'grey';
}
 */
/* if(cis.tick.last_price < cis.tick.ohlc.open && cis.minuteData[cis.minuteData.length-1].close>cis.minuteData[cis.minuteData.length-2].close)
return 'blue'; */
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
  const index = this.symbols.findIndex(item => item.tradingsymbol === cis.tradingsymbol);

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

  .pink{

    color: rgb(212, 8, 137);

  }

.red {
            color: rgb(171, 95, 95);
            background-color: black;
        }
        .green {
            color: rgb(65, 105, 65);
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
  