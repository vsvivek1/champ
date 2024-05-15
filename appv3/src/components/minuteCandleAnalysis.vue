<template>
	<div>

		<v-alert v-if="fetchingMinuteCandle==true">Fetching Minute candle Now {{ Date().now() }}</v-alert>
	
	  <table class="table">
		<thead>
		  <tr>
			<th>Trading Symbol</th>
			<th>Last Price</th>
			<th>Last High Price</th>
			<th>LTP > YDAY HIGH</th>
			<th>LTP > OPEN</th>
			<th>Last Updated time</th>
			<th>candle details</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="(instrument, index) in instruments" :key="index">
			<td>{{ instrument.tradingsymbol }}</td>
			<td>{{ instrument.last_price }}</td>
			<td v-if="typeof instrument.minuteCandle!='undefined'">{{ instrument.minuteCandle.lastHigh }}</td>
			<td>{{ instrument.last_price > instrument.pricePoints.d1.high }}</td>
			<td>{{ instrument.last_price > instrument.pricePoints.d0.open }}
			{{ instrument.pricePoints.d0.open }}
			</td>
			<td v-if="instrument.minuteCandle && instrument.minuteCandle.data.length > 0">
			    {{ instrument.minuteCandle.data[instrument.minuteCandle.data.length - 1].close}} price
				
				{{ instrument.minuteCandle.data[instrument.minuteCandle.data.length - 1].IST }} 

			  
			  
			</td>
			<td v-else>N/A</td>


			<td v-if="instrument.minuteCandle && instrument.minuteCandle.data.length > 0
				&& instrument.minuteCandle.signal && instrument.minuteCandle.signal.signal
				
				">
				{{ instrument.minuteCandle.signal.signal}}
			 
			  
			</td>
			<td v-else>N/A</td>

		  </tr>
		</tbody>
	  </table>
	</div>
  </template>
  
  <script>

  import getCandlestickSignalMixin from './getCandleStickSignal';
  export default {

	data(){


		return{

			fetchingMinuteCandle:false,
		}
	},

	mixins:[getCandlestickSignalMixin],
	props: {
	  instruments: {
		type: Array,
		required: true
	  }
	}
  }
  </script>
  