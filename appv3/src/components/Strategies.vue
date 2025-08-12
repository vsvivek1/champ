<template>
  <div class="container mt-4">
    <hr />
    <div class="row mb-3">
      <div class="col-md-3">Select Strategies</div>
      <div class="col-md-4">
        <select class="form-control" v-model="strategyType" @change="getStrategy()">
          <option v-for="(stragey, index) in strategies" :key="index" :value="stragey.href">
            {{ stragey.text }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <button class="btn btn-success" @click="getStrategy()">Scan Again</button>
      </div>
    </div>

    <div v-if="loadingContent" class="alert alert-info">Loading...</div>
    <div v-if="noData" class="alert alert-warning">No Long Build Up Found</div>

    <div v-if="!loadingContent">
      <div class="row mb-3">
        <div class="col">
          <div class="badge bg-primary">Number of Shares: {{ numberOfShares }}</div>
        </div>
        <div class="col">
          <div class="badge bg-primary">Amount Per Share: {{ amountPerShare }}</div>
        </div>
        <div class="col">
          <div class="badge bg-primary">Total Amount: {{ TotalAmount }}</div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col">
          <button v-if="selectedVariety !== ''" class="btn btn-outline-success" @click="PlaceOrderOnSelectedBuyingMethod()">Order By Buying Method</button>
        </div>
        <div class="col">
          <button v-if="selectedVariety !== ''" class="btn btn-outline-primary" @click="PlaceBuyLongBuldUp()">Buy Strategy OHLC Low</button>
        </div>
        <div class="col">
          <label>Select Variety
            <select class="form-control" v-model="selectedVariety">
              <option v-for="(variety, index) in varieties" :key="index">{{ variety.text }}</option>
            </select>
          </label>
        </div>
        <div class="col">
          <label>Amount Per Share
            <input type="text" class="form-control" v-model="amountPerShare" @keyup="CalculateTotalAmount()" />
          </label>
        </div>
        <div class="col">
          <label>Total Amount
            <input type="text" class="form-control" v-model="TotalAmount" @keyup="CalculateAmountperShare()" />
          </label>
        </div>
        <div class="col">
          <label>Select Buying Method
            <select class="form-control" v-model="selectedBuyingMethod" @change="calculatePricesAndQuantityAsPerBuyingMethod()">
              <option v-for="(BuyingMethod, index) in BuyingMethods" :key="index" :value="BuyingMethod.id">{{ BuyingMethod.text }}</option>
            </select>
          </label>
        </div>
        <div class="col">
          <label>Product Type
            <select class="form-control" v-model="selectedProduct">
              <option v-for="prod in product" :key="prod" :value="prod">{{ prod }}</option>
            </select>
          </label>
        </div>
      </div>

      <div class="mb-3">
        <input type="text" class="form-control mb-2" placeholder="Search" v-model="search" />
        <table class="table table-bordered table-hover">
          <thead class="table-dark">
            <tr>
              <th>#</th>
              <th>Symbol</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Avg</th>
              <th>Link</th>
              <th>Change%</th>
              <th>Selected</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in StrategicStocks" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.symbol }}</td>
              <td>{{ item.ohlc && item.ohlc.ohlc ? item.ohlc.ohlc.open : '-' }}</td>
              <td>{{ item.ohlc && item.ohlc.ohlc ? item.ohlc.ohlc.high : '-' }}</td>
              <td>{{ item.ohlc && item.ohlc.ohlc ? item.ohlc.ohlc.low : '-' }}</td>
              <td>{{ item.ohlc && item.ohlc.ohlc ? item.ohlc.ohlc.close : '-' }}</td>
              <td>{{ item.avg || '-' }}</td>
              <td><a :href="item.website" target="_blank">Chart</a></td>
              <td>{{ item.changePc || '-' }}</td>
              <td><input type="checkbox" v-model="item.selected" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import strategiesFile from "./strategies.json";
import sessionMixin from "@/views/sessionMixin";

export default {
  name: "Strategies",
  mixins: [sessionMixin],
  data() {
    return {
      product: ['CNC', 'NRML', 'MIS','MTF'],
      selectedProduct: '',
      BuyingMethods: [
        { id: -1, text: "Select" },
        { id: 1, text: "Five point Buying" }
      ],
      selectedBuyingMethod: "",
      selectedVariety: "",
      varieties: [
        { text: "amo" },
        { text: "bo" },
        { text: "co" },
        { text: "regular" }
      ],
      strategies1: strategiesFile,
      strategyType: "",
      StrategicStocks: [],
      numberOfShares: 0,
      amountPerShare: 0,
      TotalAmount: 0,
      orders: [],
      returnedSymbolsForOHLC: [],
      loadingContent: false,
      noData: false,
      search: "",
      Ohlc: [],
    };
  },
  computed: {
    strategies() {
      return this.strategies1.map(s => s);
    },
  },
  methods: {
    CalculateTotalAmount() {
      this.TotalAmount = this.amountPerShare * this.numberOfShares;
    },
    CalculateAmountperShare() {
      this.amountPerShare = this.numberOfShares !== 0 ? this.TotalAmount / this.numberOfShares : 0;
    },
    async getStrategy() {
      this.loadingContent = true;
      this.noData = false;
      const url = `/api/getStrategy${this.strategyType}/accessToken/${this.accessToken}`;

      try {
        const res = await axios.get(url);
        this.StrategicStocks = res.data;
        this.numberOfShares = this.StrategicStocks.length;
        this.returnedSymbolsForOHLC = this.StrategicStocks.map(s => `NSE:${s.symbol}`);
        this.noData = this.StrategicStocks.length === 0;
        this.getOHLC(this.accessToken);
      } catch (e) {
        console.error("Error fetching strategy", e);
      } finally {
        this.loadingContent = false;
      }
    },
    getOHLC(accessToken) {
      const arr = JSON.stringify(this.returnedSymbolsForOHLC);
      axios.post("/api/postOHLC", {
        symbols: arr,
        accessToken: this.accessToken
      }).then(res => {
        this.Ohlc = res.data;
        this.StrategicStocks.forEach(s => {
          this.$set(s, 'ohlc', this.Ohlc[`NSE:${s.symbol}`]);
        });
        this.calculatePricesAndQuantityAsPerBuyingMethod();
      });
    },
    calculatePricesAndQuantityAsPerBuyingMethod() {
      this.orders = [];
      this.StrategicStocks.forEach(stock => {
        if (!stock.symbol || !stock.selected) return;

        const prices = [
          stock.ohlc && stock.ohlc.ohlc ? stock.ohlc.ohlc.low : 0,
          stock.ohlc && stock.ohlc.ohlc ? stock.ohlc.ohlc.close : 0,
          stock.ohlc && stock.ohlc.ohlc ? stock.ohlc.ohlc.open : 0,
          stock.ohlc && stock.ohlc.ohlc
            ? (stock.ohlc.ohlc.open + stock.ohlc.ohlc.high + stock.ohlc.ohlc.low + stock.ohlc.ohlc.close) / 4
            : 0,
        ];

        prices.forEach(price => {
          if (!price) return;
          const order = {
            tag: this.strategyType,
            variety: 'regular',
            params: {
              exchange: "NSE",
              tradingsymbol: stock.symbol,
              transaction_type: "BUY",
              quantity: Math.round(this.amountPerShare / (price * 5)),
              product: "CNC",
              order_type: "LIMIT",
              validity: "DAY",
              price: Math.round(price * 10) / 10
            }
          };
          this.orders.push(order);
        });
      });
    },
    PlaceOrderOnSelectedBuyingMethod() {
      axios.post("/api/PlaceTarget", {
        accessToken: this.accessToken,
        sessionString: JSON.stringify(this.session),
        ZerodhaParams: JSON.stringify(this.orders),
      }).then(() => {
        console.log("Orders placed.");
      });
    },
    PlaceBuyLongBuldUp() {
      const orders = this.StrategicStocks.map(stock => {
        if (!stock.symbol || !stock.selected || !(stock.ohlc && stock.ohlc.ohlc)) return null;
        const price = parseFloat(stock.ohlc.ohlc.low || 0);
        return {
          tag: this.strategyType,
          variety: 'regular',
          params: {
            exchange: "NSE",
            tradingsymbol: stock.symbol,
            transaction_type: "BUY",
            quantity: Math.round(this.amountPerShare / price),
            product: "CNC",
            order_type: "LIMIT",
            validity: "DAY",
            price: Math.round(price * 10) / 10
          }
        };
      }).filter(Boolean);

      axios.post("/api/PlaceTarget", {
        accessToken: this.accessToken,
        sessionString: JSON.stringify(this.session),
        ZerodhaParams: JSON.stringify(orders),
      }).then(() => {
        this.selectedBuyingMethod = '';
      });
    }
  }
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
