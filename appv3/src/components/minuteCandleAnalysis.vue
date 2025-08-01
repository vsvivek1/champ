<template>
	<div>
	  <v-alert v-if="fetchingMinuteCandle" color="info">Fetching Minute candle Now {{ new Date().toLocaleString() }}</v-alert>
  
	  <table class="table">
		<thead>
		  <tr>
			<th>Trading Symbol</th>
			<th>Last High Price</th>
			<th>Day Open</th>
			<th>Yesterday High</th>
			<th>Moving Average</th>
			<th>Has Live Position</th>
			<th>No Trading Now</th>
			<th>Candle Details</th>
			<th>Lower tail points</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="(instrument, index) in instruments" :key="index">
			<td :style="{ backgroundColor: calculateBackgroundColor(instrument) }">
				

<!-- 				<a :href="instrument.chart">india india</a> -->
<button @click="gotoChart(instrument.chart)">{{ instrument.tradingsymbol }}</button>
			
		
			</td>
			<td v-if="instrument.minuteCandle">
			  <div>Last Price High: {{ instrument.minuteCandle.lastHigh }}</div>
			  <div>Open: <span :class="{'text-yellow': instrument.last_price > instrument.pricePoints.d0.open, 'text-danger': instrument.last_price < instrument.pricePoints.d0.open}">{{ instrument.pricePoints.d0.open }}</span></div>
			  <div>Low: {{ instrument.pricePoints.d0.low }}</div>
			  <div>High: {{ instrument.pricePoints.d0.high }}</div>
			  <div>Last Price: 
				<span :class="{'text-green': instrument.last_price > instrument.pricePoints.d0.open && instrument.last_price > instrument.minuteCandle.lastHigh, 'text-brown': instrument.last_price > instrument.pricePoints.d0.open && instrument.last_price <= instrument.minuteCandle.lastHigh, 'text-danger': instrument.last_price <= instrument.pricePoints.d0.open}">{{ instrument.last_price }}</span>
			  </div>
			</td>
			<td v-else>N/A</td>
			<td>
				
				Yday High: {{ instrument.pricePoints.d1.high }} <hr>
				LAst high :{{instrument.minuteCandle?instrument.minuteCandle.lastHigh:-1 }}
			LP>Do Open :{{ instrument.last_price > instrument.pricePoints.d0.open }}
			</td>
		
		
			<td>
				{{ instrument.livePositions }}
				{{ instrument.liveOrders }}

			</td>
			<td v-if="instrument.minuteCandle && instrument.minuteCandle.data.length > 0">
			  {{ instrument.minuteCandle.data[instrument.minuteCandle.data.length - 1].close }} price
			  {{ instrument.minuteCandle.data[instrument.minuteCandle.data.length - 1].IST }}
			</td>
			<td v-else>N/A</td>
			<td><span v-if="instrument.hasLivePositionFromcis" class="text-success">Yes</span><span v-else class="text-danger">No</span></td>
			<td>{{ instrument.noTradingNow }}</td>
			<td v-if="instrument.minuteCandle && instrument.minuteCandle.data.length > 0 && instrument.minuteCandle.signal && instrument.minuteCandle.signal.signal">
			  {{ instrument.minuteCandle.signal.signal }}


			Sp  {{ 	instrument.minuteCandle.lowerShadowPoints }}
			</td>

			<td v-else>N/A</td>
			<td 
			
			
			colspan="8" class="text-center">
			
		<span v-if="instrument.minuteCandle">	{{ 
			
			instrument.minuteCandle.lowerShadowPoints
			
			
			}}
			</span>
			
		
		</td>

		  </tr>
		  <tr v-if="instruments.length == 0">
			<td colspan="8" class="text-center">No data available</td>
		  </tr>
		</tbody>
	  </table>
	</div>
  </template>
  
  <script>
  import getCandlestickSignalMixin from './getCandleStickSignal';
  //import mutateWithLtp from './mutateWithLtpMixin';
  
  export default {
	data() {
	  return {
		fetchingMinuteCandle: false,
	  };
	},
	mixins: [getCandlestickSignalMixin],
	props: {
	  instruments: {
		type: Array,
		required: true,
	  },
	},
	methods: {
		gotoChart(chart){

			window.open(chart, '_blank');
	
		},
	  calculateBackgroundColor(instrument) {

		if(typeof instrument.minuteCandle =='undefined'){

			return
		}
		if (instrument.minuteCandle && instrument.last_price > instrument.pricePoints.d0.open && instrument.last_price > instrument.minuteCandle.lastHigh) {
		  return 'green';
		} else if (instrument.last_price > instrument.pricePoints.d0.open && instrument.last_price <= instrument.minuteCandle.lastHigh) {
		  return 'yellow';
		} else {
		  return 'red';
		}
	  }
	}
  };
  </script>
  
  <style scoped>
  .text-success {
	color: green;
  }
  .text-danger {
	color: red;
  }
  .text-yellow {
	color: orange;
	background-color: black;
  }
  .text-green {
	color: green;
  }
  .text-brown {
	color: brown;
  }
  </style>
  