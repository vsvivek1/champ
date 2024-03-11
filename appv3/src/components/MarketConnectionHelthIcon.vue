<template>
	<v-icon
	  :class="{ 
		'text-primary': tradeEntrySwitchHealth,
		'text-secondary': !tradeEntrySwitchHealth
	  }"
	  title="if This symbol changes color switches between red and blue system is connected to market"
	>
	  mdi-circle
	</v-icon>
  </template>
  
  <script>
  export default {
	props: {
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
  