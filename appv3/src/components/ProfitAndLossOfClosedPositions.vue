<template>
	<v-chip
	  :color="closedTradesScriptsPnl > 0 ? 'green' : 'red'"
	  class="pb-2 mb-2"
	>
	  Profit and Loss of Closed positions {{ closedTradesScriptsPnl }}
	</v-chip>
  </template>
  
  <script>
  export default {
	props: {
	  closedTradesScriptsPnl: {
		type: Number,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  