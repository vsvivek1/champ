<template>
	<div>
	    <table class="table">
	      <thead>
	        <tr>
	          <th>Trading Symbol</th>
	          <th>Last Price</th>
	          <th>LTP>YDAY HIGH</th>
	          <th>LTP > OPEN</th>
	          <th>candle details</th>
	        </tr>
	      </thead>
	      <tbody>
	        <tr v-for="(instrument, index) in instruments" :key="index">
	          <td>{{ instrument.tradingsymbol }}</td>
	          <td>{{ instrument.last_price }}
	          
	          <!-- {{ instrument.minuteCandle }} -->
	          </td>
	          <td>{{ instrument.last_price>instrument.pricePoints.d1.high }}</td>
	          
	          <td v-if="typeof instrument.minuteCandle!='undefined'">
	          
	          {{ instrument.minuteCandle.data[instrument.minuteCandle.data.length-1].IST }}ist
	          {{ instrument.minuteCandle.signal.CandleColor}}
	       </td>
	       </tr>
	      </tbody>
	    </table>
	  </div>
</template>

<script setup lang="ts">
defineProps<{ 
	instruments: any[];
}>()
</script>
