<template>
    <div>
      <button @click="showCondors = !showCondors">{{ showCondors ? 'Hide' : 'Show' }} Iron Condors</button>
      <ul v-if="showCondors">
        <li v-for="(condor, index) in ironCondors" :key="index">
          <span>Stock: {{ condor.underlying }}</span>
          <button :style="{ background: condor.buying ? 'green' : 'transparent' }" @click="buy(index)">Buy</button>
          <button :style="{ background: condor.selling ? 'red' : 'transparent' }" @click="sell(index)">Sell</button>
          <ul>
            <li>Sell: {{ condor.sellInstrument }}</li>
            <li>Buy: {{ condor.buyInstrument }}</li>
            <li>Max profit: {{ condor.maxProfit }}</li>
            <li>Max loss: {{ condor.maxLoss }}</li>
            <li>Profit-to-risk ratio: {{ condor.pToRRatio }}</li>
          </ul>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      instruments: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        filteredOptions: [], // Options filtered by name
        ironCondors: [], // Iron condors created from filtered options
        showCondors: false // Flag to show/hide the iron condors
      }
    },
    methods: {
      // Filters options by name and assigns the result to filteredOptions
      filterOptionsByName(name) {
        this.filteredOptions = this.instruments.filter(
          (instrument) => instrument.name.toLowerCase().includes(name.toLowerCase())
        );
      },
  
      // Generates iron condors from filtered options
      generateIronCondors() {
        this.ironCondors = [];
        for (let i = 0; i < this.filteredOptions.length; i++) {
          const sellOption = this.filteredOptions[i];
          for (let j = 0; j < this.filteredOptions.length; j++) {
            const buyOption = this.filteredOptions[j];
            if (sellOption.strike < buyOption.strike) {
             
             
                const strikes = [sellOption.strike, buyOption.strike];
              const buyInstrument = buyOption.instrument;
              const sellInstrument = sellOption.instrument;
              const underlying = sellOption.underlying;
              const maxProfit = sellOption.price - buyOption.price;
              const maxLoss = buyOption.strike - sellOption.strike - maxProfit;
              const pToRRatio = maxProfit / maxLoss;
  
              this.ironCondors.push({
                strikes,
                buyInstrument,
                sellInstrument,
                underlying,
                maxProfit,
                maxLoss,
                pToRRatio,
                buying: false,
                selling: false
              });
            }
          }
        }
      },
  
      // Toggles the sell/buy button
      toggleCondor(type, index) {
        if (type === "buy") {
          this.ironCondors[index].buying = !this.ironCondors[index].buying;
        } else if (type === "sell") {
          this.ironCondors[index].selling = !this.ironCondors[index].selling;
        }
      },
  
      // Handles the click event of the buy button
      buy(index) {
        this.toggleCondor("buy", index);
      },
  
      // Handles the click event of the sell button
      sell(index) {
      this.toggleCondor("sell", index);
    }
  },
  watch: {
    instruments: {
      handler() {
        this.filterOptionsByName("nifty"); // Change this to "banknifty" to filter by Bank Nifty
        this.generateIronCondors();
      },
      immediate: true
    }
  }
};
  