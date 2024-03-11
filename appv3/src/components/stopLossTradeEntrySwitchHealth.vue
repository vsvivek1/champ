<template>
	<v-col>
	  {{ stopLossSwitchHealth }} stopLossSwitchHealth
	  {{ tradeEntrySwitchHealth }} tradeEntrySwitchHealth
	</v-col>
  </template>
  
  <script>
  export default {
	props: {
	  stopLossSwitchHealth: {
		type: Boolean,
		required: true
	  },
	  tradeEntrySwitchHealth: {
		type: Boolean,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  