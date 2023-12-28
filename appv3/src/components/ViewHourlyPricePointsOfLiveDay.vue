<template>
	<div>
	  <table v-if="false">
		<tr v-for="(script, index) in hourlyPricePointsofLiveDay" :key="index" class="col-small">
		  <td v-for="(item, index2) in script.prices" :key="index2" class="col-xs">
			<div class="text-primary">
			  {{ script.instrument.tradingsymbol }}
			  {{ script.instrument_token }}
			  {{ convertIsoDateToIST(item.date) }}
			</div>
			<div
			  :class="{
				'text-success': script.prices[index2].open === item.open
			  }"
			>
			  O:{{ item.open }} ll
			</div>
			; up {{ (item.high + (item.high - item.low) / 2).toFixed(1) }} H:{{ item.high }} L:{{ item.low }} range
			{{ item.high - item.low }} bottom {{ (item.low - (item.high - item.low) / 2).toFixed(1) }} C:{{ item.close }}
		  </td>
		</tr>
	  </table>
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  hourlyPricePointsofLiveDay: {
		type: Array,
		default: () => []
	  },
	  convertIsoDateToIST: {
		type: Function,
		default: () => {}
	  }
	}
  };
  </script>
  