<template>
    <div class="tick-container">
      <!-- Conditional Rendering -->
      <div v-if="item.tick">
        <div class="last-price">
          Last Price: ₹<span class="highlight">{{ item.tick.last_price }}</span>
        </div>
        
        <div class="details">
          <strong>Change:</strong>
          <span :class="{'positive': item.tick.change > 0, 'negative': item.tick.change <= 0}">
            {{ item.tick.change.toFixed(2) }}%
          </span><br>
  
          <strong>Volume Traded:</strong> {{ formatNumber(item.tick.volume_traded) }}<br>
          <strong>Avg. Traded Price:</strong> ₹{{ item.tick.average_traded_price }}
        </div>
  
        <div class="ohlc">
          <strong>OHLC:</strong><br>
          Open: ₹{{ item.tick.ohlc.open }} | High: ₹{{ item.tick.ohlc.high }}<br>
          Low: ₹{{ item.tick.ohlc.low }} | Close: ₹{{ item.tick.ohlc.close }}
        </div>
  
        <div class="buy-sell">
          <strong>Total Buy Qty:</strong> {{ formatNumber(item.tick.total_buy_quantity) }}<br>
          <strong>Total Sell Qty:</strong> {{ formatNumber(item.tick.total_sell_quantity) }}
        </div>
      </div>
  
      <!-- If item.tick is not available -->
      <div v-else class="no-data">
        <strong>Tick Data Unavailable</strong><br>
        Please check the connection or try again later.
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "TickDisplay",
    props: {
      item: {
        type: Object,
        required: true
      }
    },
    methods: {
      formatNumber(value) {
        return value.toLocaleString(); // Adds commas to large numbers
      }
    }
  };
  </script>
  
  <style scoped>
  .tick-container {
    padding: 10px;
    font-family: Arial, sans-serif;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    width: 320px;
  }
  
  .last-price {
    font-weight: bold;
    font-size: 18px;
    color: #333;
  }
  
  .highlight {
    color: #007bff;
  }
  
  .details, .ohlc, .buy-sell {
    margin-top: 8px;
    font-size: 14px;
    color: #555;
  }
  
  .positive {
    color: #28a745;
    font-weight: bold;
  }
  
  .negative {
    color: #dc3545;
    font-weight: bold;
  }
  
  .no-data {
    font-weight: bold;
    font-size: 16px;
    color: #dc3545;
    margin-top: 10px;
  }
  </style>
  