<template>
  <div class="container-fluid">
    <!-- Top action row -->
    <div class="row g-2 align-items-center mb-3">
      <div class="col-auto">
        <button class="btn btn-outline-primary"
                @click="updateSelectedSellorderWithLtp()">
          Update Sell orders with LTP
        </button>
      </div>

      <div class="col-auto">
        <button class="btn btn-info text-white"
                @click="updateSelectedBuyorderWithAvg()">
          Update BUY orders with AVG
        </button>
      </div>

      <div class="col-auto d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="reclaimSoldStocks()">reclaimSoldStocks</button>
        <button class="btn btn-outline-warning" @click="SellHoldingsWithCondition()">Sell Holdings with Condition</button>
      </div>

      <div class="col-auto">
        <button class="btn btn-info text-white" @click="getLTP()">
          Retry Buy Orders with LTPS <span class="ms-1">mdi-rotate-left</span>
        </button>
      </div>

      <div class="col-auto">
        <button class="btn btn-success" @click="StartTimer()">
          Start Timer {{ timeInSecondsToTargetTime }}
        </button>
      </div>

      <div class="col-auto">
        <button class="btn btn-danger" @click="cancelSelectedOrders()">
          Cancel Selected Order <span class="ms-1">mdi-close-circle-multiple-outline</span>
        </button>
      </div>
    </div>

    <div v-show="false">{{ instrumentTokens }}</div>

    <!-- Tables area -->
    <div class="row">
      <!-- BUY side -->
      <div class="col-12 col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="mb-0">Buy Orders CNC</h5>
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text">🔎</span>
              <input type="text" class="form-control" v-model="search" placeholder="Search">
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-striped table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 44px;">#</th>
                  <th>Symbol</th>
                  <th>S. Price</th>
                  <th>AVG</th>
                  <th>LTP</th>
                  <th>TYPE</th>
                  <th>LIVE GAIN</th>
                  <th>Gain</th>
                  <th>Status</th>
                  <th>Link</th>
                  <th>Color</th>
                  <th>Selected</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in filteredBuyOrders" :key="item.order_id"
                    :class="rowClass(item)">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ item.tradingsymbol }}</td>
                  <td>{{ item.price }}</td>

                  <!-- CHANGED: no optional chaining -->
                  <td>{{ item.holding_details && item.holding_details.average_price }}</td>

                  <td>{{ item.last_price }}</td>
                  <td>{{ item.order_type }}</td>
                  <td>{{ item.live_gain }}</td>
                  <td>{{ item.gain }}</td>
                  <td>{{ item.status }}</td>
                  <td>
                    <a :href="item.website" target="_blank" rel="noopener">
                      Chart <span>mdi-link</span>
                    </a>
                  </td>
                  <td>
                    <span :style="{color: item.candleColor}">{{ item.candleColor }}</span>
                  </td>
                  <td class="text-center">
                    <input type="checkbox" v-model="item.selected" />
                  </td>
                </tr>
                <tr v-if="filteredBuyOrders.length === 0">
                  <td colspan="12" class="text-center text-muted py-3">No matching buy orders.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SELL side -->
      <div class="col-12 col-lg-6 mt-3 mt-lg-0">
        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="mb-0">Sell Orders CNC</h5>
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text">🔎</span>
              <input type="text" class="form-control" v-model="search" placeholder="Search">
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-striped table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 44px;">#</th>
                  <th>Symbol</th>
                  <th>S. Price</th>
                  <th>AVG</th>
                  <th>LTP</th>
                  <th>TYPE</th>
                  <th>LIVE GAIN</th>
                  <th>Gain</th>
                  <th>Status</th>
                  <th>Link</th>
                  <th>Color</th>
                  <th>Selected</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in filteredSellOrders" :key="item.order_id"
                    :class="rowClass(item)">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ item.tradingsymbol }}</td>
                  <td>{{ item.price }}</td>

                  <!-- CHANGED: no optional chaining -->
                  <td>{{ item.holding_details && item.holding_details.average_price }}</td>

                  <td>{{ item.last_price }}</td>
                  <td>{{ item.order_type }}</td>
                  <td>{{ item.live_gain }}</td>
                  <td>{{ item.gain }}</td>
                  <td>{{ item.status }}</td>
                  <td>
                    <a :href="item.website" target="_blank" rel="noopener">
                      Chart <span>mdi-link</span>
                    </a>
                  </td>
                  <td>
                    <span :style="{color: item.candleColor}">{{ item.candleColor }}</span>
                  </td>
                  <td class="text-center">
                    <input type="checkbox" v-model="item.selected" />
                  </td>
                </tr>
                <tr v-if="filteredSellOrders.length === 0">
                  <td colspan="12" class="text-center text-muted py-3">No matching sell orders.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4" />
  </div>
</template>

<script>
import { io }  from 'socket.io-client';
const socket = io('http://localhost:4000');
import axios from 'axios'
import sessionMixin from '@/views/sessionMixin';
import store from '@/store';

export default {
  name: 'OrderBook',
  mixins: [sessionMixin],
  mounted() {
    setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      if (hours == 3 && ((minutes == 20) || (minutes == 26))) {
        this.getLTP(); // retry orders
      }
    }, 1000)

    this.clock();
    this.retryOrdersDayEndWithLtps();

    let tenMinutesTimerForReclaiming = setInterval(() => {
      this.reclaimSoldStocks();
    }, 10 * 10 * 1000)

    socket.on('send-realtime-subscription', s => {
      this.mutateOrdersWithLtp(s)
    });

    socket.on('connect', skt => {});

    socket.on('send-order', (msg, room) => {
      if (room == '') {
        socket.broadcast.emit('receive-order', msg)
      } else {
        socket.to(room).emit('receive-order', msg)
      }
    });

    socket.on('order_update', (orderUpdates) => {
      let currentUpdate = this.orders.filter(o => o.order_id == orderUpdates.order_id)[0]
      if (typeof this.orders != 'undefiined') {
        Object.assign(this.orders.filter(o => o.order_id == orderUpdates.order_id)[0], orderUpdates);
      }
    })

    this.getOrders();
  },
  computed: {
    instrumentTokens() {
      let st = new Set();
      this.orders.forEach(o => { st.add(o.instrument_token) })
      socket.emit('subscribe-orders', JSON.stringify(Array.from(st)));
      return JSON.stringify(Array.from(st));
    },

    stringifiedInstruments() {
      return JSON.stringify(this.NotCompletedBuyInstruments)
    },

    NotCompletedBuyInstruments() {
      return this.NotCompletedBuyOrders.map(o => o.exchange + ":" + o.tradingsymbol)
    },

    NotCompletedBuyOrders() {
      return this.orders.filter(o => {
        return o.transaction_type == 'BUY' && o.exchange == 'NSE' && o.status == 'OPEN'
      });
    },

    NotCompletedSellOrders() {
      return this.orders.filter(o => {
        return o.transaction_type == 'SELL' &&
               (o.status == 'TRIGGER PENDING' || o.status == 'OPEN' || o.status == "AMO REQ RECEIVED")
      });
    },

    buyOrders() {
      return this.orders.filter(o =>
        o.transaction_type == 'BUY' &&
        (o.exchange == 'NSE' || o.exchange == 'BSE') &&
        (o.status == "OPEN" || o.status == "AMQ RECEIVED" || o.status == "TRIGGER PENDING")
      );
    },

    sellOrders() {
      return this.orders.filter(o =>
        o.transaction_type == 'SELL' &&
        (o.status == "OPEN" || o.status == "TRIGGER PENDING") &&
        (o.exchange == 'NSE' || o.exchange == 'BSE') &&
        (o.status == "OPEN" || o.status == "AMQ RECEIVED")
      );
    },

    filteredBuyOrders() {
      const q = (this.search || '').toLowerCase().trim();
      if (!q) return this.buyOrders;
      return this.buyOrders.filter(it =>
        (it.tradingsymbol || '').toLowerCase().includes(q) ||
        (it.status || '').toLowerCase().includes(q) ||
        (it.order_type || '').toLowerCase().includes(q)
      );
    },
    filteredSellOrders() {
      const q = (this.search || '').toLowerCase().trim();
      if (!q) return this.sellOrders;
      return this.sellOrders.filter(it =>
        (it.tradingsymbol || '').toLowerCase().includes(q) ||
        (it.status || '').toLowerCase().includes(q) ||
        (it.order_type || '').toLowerCase().includes(q)
      );
    },
  },
  watch: {
    timeout(n, o) {}
  },
  data() {
    return {
      hours: 0,
      minutes: 0,
      livePositions: [],
      SelectedSellorder: [],
      cancellScripts: [],
      timeout: 0,
      timeInSecondsToTargetTime: 0,
      newOrder: [],
      ltps: [],
      orders: [],
      search: '',
    }
  },
  methods: {
    retryOrdersDayEndWithLtps() {
      if (this.hours == 15 && (this.minutes > 20 && this.minutes < 25)) {
        this.getLTP();
      }
    },

    clock() {
      setInterval(() => {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes()
      }, 2000)
    },

    async getOHLC(accessToken, ar) {
      let arr = JSON.stringify(ar);
      let url2 = "/api/postOHLC";
      let ob = {};
      ob.symbols = arr;
      ob.accessToken = this.accessToken;
      return axios.post(url2, ob).then((res) => res.data)
    },

    playSound() {
      var audio = new Audio('/sounds/mixkit-sci-fi-confirmation-914.wav');
      audio.play();
    },

    async getPositions() {
      let url = "/api/getPositions";
      let obj = {};
      obj.accessToken = this.accessToken;
      return axios.post(url, obj).then((res) => {
        if (typeof res.data.net == "undefined") return [];
        return res.data.net.filter(p => p.exchange == 'NSE' && p.quantity < 0);
      });
    },

    async reclaimSoldStocks() {
      this.orders = await this.getOrdersAsync();
      let liveOrderStocks =
        this.orders
          .filter(o => o.transaction_type == "BUY" && o.status == "OPEN" && o.exchange == "NSE")
          .map(r => r.instrument_token)

      let alreadyExecuted =
        this.orders
          .filter(o => o.transaction_type == "BUY" && o.status == "COMPLETE" && o.exchange == "NSE")
          .map(r => r.instrument_token)

      let soldStocks = await this.getPositions();

      let finalSoldStock = soldStocks.filter(r => !(liveOrderStocks.includes(r.instrument_token)));
      let finalSoldStocksTokens = finalSoldStock.map(i => i.instrument_token)

      let ohlc = await this.getOHLC(this.accessToken, finalSoldStocksTokens);

      const url = "/api/PlaceTarget";
      let map = Object.keys(ohlc).map(r => {
        let fs = finalSoldStock.find(i => i.instrument_token == r);
        if (!fs) return null;

        let tradingsymbol = fs.tradingsymbol || fs.trading_symbol || fs.symbol || '';
        let quantity = fs.quantity * -1;
        let price = fs.average_price;
        let exchange = fs.exchange;

        let order = {};
        order.variety = 'regular'
        order.params = {};
        order.params.exchange = exchange;
        order.params.tradingsymbol = tradingsymbol;
        order.params.transaction_type = "BUY";
        order.params.quantity = quantity;
        order.params.product = "CNC";
        order.params.order_type = "LIMIT";
        order.params.validity = "DAY";
        order.params.price = (price * .98).toFixed(1);
        order.params.tag = 'buyBack';
        return order;
      }).filter(function(x){ return !!x; });

      let data1 = JSON.stringify(map);
      let data = {};
      data.accessToken = this.accessToken;
      data.sessionString = JSON.stringify(this.session);
      data.ZerodhaParams = data1;

      axios.post(url, data).then((res) => {
        console.log(res.data, 'res.data')
      });
    },

    updateSelectedSellorderWithLtp() {
      this.newOrder =
        this.orders
          .filter(o => o.selected === true && o.transaction_type == "SELL")
          .map(i => {
            let o = {};
            o.variety = 'regular';
            o.order_id = i.order_id;
            let params = {};
            params.price = i.last_price;
            params.trigger_price = i.last_price;
            o.params = params;
            return o;
          });
      this.updateOrder();
    },

    updateSelectedBuyorderWithAvg() {
      this.newOrder =
        this.orders
          .filter(o => o.status == "OPEN" && o.transaction_type == "BUY")
          .map(i => {
            let o = {};
            o.variety = 'regular';
            o.order_id = i.order_id;
            let params = {};
            params.price = i.last_price;
            params.trigger_price = i.last_price;
            o.params = params;
            return o;
          });
      this.updateOrder();
    },

    cancelSelectedOrders() {
      this.cancellScripts = this.orders
        .filter(o => o.selected == true)
        .map(o => ({ order_id: o.order_id, variety: 'regular' }));

      let StrigifiedArray = JSON.stringify(this.cancellScripts);
      let url = "/api/CancelOrders";
      let params = {};
      params.accessToken = this.accessToken;
      params.arr = StrigifiedArray;

      axios.post(url, params).then(r => console.log('cancelled orders', r))
    },

    SellHoldingsWithCondition() { },

    UpdateSellOrderToTargetOnLtpTrigger(s) {
      var targetPerCentage = 15;
      var hours = new Date().getHours();

      if (hours > 9 && hours < 11) targetPerCentage = 19;
      else if (hours > 11 && hours < 13) targetPerCentage = 15;
      else if (hours > 13 && hours < 14) targetPerCentage = 12;
      else if (hours > 14 && hours < 16) targetPerCentage = 10;

      this.newOrder = [];
      var counter = 0;
      s.forEach(element => {
        var instrument_token = element.instrument_token;
        var last_price = element.last_price;
        var ohlc = element.ohlc;

        var pcChange1 = (last_price - ohlc.close) / ohlc.close;
        var pcChange = pcChange1 * 100;
        counter = counter + 1;

        var order = this.NotCompletedSellOrders.filter(function(o){
          return o.instrument_token == instrument_token && (o.status == "OPEN" || o.status == "TRIGGER PENDING");
        })[0];

        // CHANGED: safe hasOwnProperty check without optional chaining
        if (order && Object.prototype.hasOwnProperty.call(order, 'live_order_triggered')) {
          if (order.live_order_triggered === true && pcChange > targetPerCentage) {
            let targetOrder = this.NotCompletedSellOrders.filter(function(o){
              return o.instrument_token == instrument_token && (o.status == "OPEN" || o.status == "TRIGGER PENDING");
            })[0];
            if (targetOrder) {
              this.$set(targetOrder, 'live_order_triggered', true);
            }

            let o = {};
            o.variety = 'regular';
            o.order_id = order.order_id;
            let params = {};
            params.price = last_price;
            params.order_type = 'NRML';
            o.params = params;

            this.newOrder.push(o);
            this.playSound();
          }
        }
      });
      // if (this.newOrder.length > 0) { this.updateOrder(); }
    },

    mutateOrdersWithLtp(s) {
      s.forEach(element => {
        let instrument_token = element.instrument_token;
        let last_price = element.last_price;
        let average_price = element.average_price;

        this.orders.filter(o => o.instrument_token == instrument_token).forEach(e => {
          this.$set(e, 'previous_last', e.last_price)
          this.$set(e, 'last_price', last_price);

          if (e.previous_last < e.last_price) {
            this.$set(e, 'candleColor', 'green');
          } else if (e.previous_last > e.last_price) {
            this.$set(e, 'candleColor', 'red');
          } else if (e.previous_last == e.last_price) {
            this.$set(e, 'candleColor', 'grey');
          }

          this.$set(e, 'live_gain', last_price);
          this.$set(e, 'average_price', average_price);
        })
      });
    },

    getTimeLeft(timeout) {
      return Math.ceil((timeout._idleStart + timeout._idleTimeout - Date.now()) / 1000);
    },

    StartTimer() {
      let currentTime = new Date();
      let TargetTimeToday = new Date();
      TargetTimeToday.setHours(15);
      TargetTimeToday.setMinutes(28);
      this.timeInSecondsToTargetTime = (TargetTimeToday - currentTime);

      this.timeout = setTimeout(this.getLTP, this.timeInSecondsToTargetTime);
    },

    getLTP() {
      let url = "/api/getLTP/accessToken";
      let ob = {};
      ob.accessToken = this.accessToken;
      ob.instruments = this.stringifiedInstruments;

      axios.post(url, ob).then(res => {
        this.ltps = res.data;
        this.newOrder = this.NotCompletedBuyOrders.map(i => {
          let o = {};
          o.variety = i.variety;
          o.order_id = i.order_id;
          let params = {};
          let qry = i.exchange + ":" + i.tradingsymbol;
          let newPrice = this.ltps[qry];
          params.price = newPrice.last_price;
          o.params = params;
          return o;
        });
        return this.newOrder;
      }).then(() => {
        this.updateOrder();
      })
    },

    rowClass(item) {
      switch (item.candleColor) {
        case 'red': return 'row-light-red';
        case 'green': return 'row-green';
        case 'grey': return 'row-white';
        default: return '';
      }
    },

    updateOrder() {
      let ordersString = JSON.stringify(this.newOrder);
      let params = {};
      params.accessToken = this.accessToken;
      params.ordersString = ordersString;
      let url = "/api/modifyOrders";
      axios.post(url, params).then(res => {
        this.getOrders(); // refresh
      })
    },

    async getOrdersAsync() {
      let url = "/api/getOrders/" + this.accessToken;
      return axios.get(url).then(res => {
        res.data.forEach(r => {
          r.selected = false;
          r.website = "https://kite.zerodha.com/chart/ext/ciq/" + r.exchange + "/" + r.tradingsymbol + "/" + r.instrument_token + "/";
        });
        return res.data;
      })
    },

    getOrders() {
      let url = "/api/getOrders/" + this.accessToken;
      axios.get(url).then(res => {
        res.data.forEach(r => {
          r.selected = false;
          r.website = "https://kite.zerodha.com/chart/ext/ciq/" + r.exchange + "/" + r.tradingsymbol + "/" + r.instrument_token + "/";
        });
        this.orders = res.data
      })
    },

    cancelOrders() {}
  }
}
</script>

<style scoped>
.row-light-red { background-color: #ffe5e5 !important; }
.row-green     { background-color: #e8ffea !important; }
.row-white     { background-color: #ffffff !important; }
.table td, .table th { vertical-align: middle; }
</style>
