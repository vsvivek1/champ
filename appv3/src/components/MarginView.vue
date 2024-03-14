<template>
	<div v-if="liveMargin && liveMargin.equity && liveMargin.equity.utilised && liveMargin.equity.utilised.debits">
	  Margin: {{ liveMargin.equity.utilised.margin }} TOTAL OPTION PRICE: {{ totalOptionPrice }} OPTION PREMIUM :{{ liveMargin.equity.utilised.option_premium }}
	</div>
	<div v-else>
	  Margin is not available yet.
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  liveMargin: {
		type: Object,
		default: () => ({})
	  },
	  totalOptionPrice: {
		type: Number,
		default: 0
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  