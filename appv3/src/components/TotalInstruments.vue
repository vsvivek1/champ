<template>
	<div>
	  <h2 style="color:red">Total Instruments: {{ instruments.length }}</h2>
	  <table class="table">
		<thead>
		  <tr>
			<th>Trading Symbol</th>
			<th>Last Price</th>
			<th>LTP > YDAY HIGH</th>
			<th>LTP > OPEN</th>
			<th>candle details</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="(instrument, index) in instruments" :key="index">
			<td>{{ instrument.tradingsymbol }}</td>
			<td>{{ instrument.last_price }}</td>
			<td>{{ instrument.last_price > instrument.pricePoints.d1.high }}</td>
			<td v-if="instrument.minuteCandle && instrument.minuteCandle.data.length > 0">
			  {{ instrument.minuteCandle.data[instrument.minuteCandle.data.length - 1].IST }} IST
			  {{ instrument.minuteCandle.signal.CandleColor }}
			</td>
			<td v-else>N/A</td>
		  </tr>
		</tbody>
	  </table>
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  instruments: {
		type: Array,
		required: true
	  }
	}
  }
  </script>
  