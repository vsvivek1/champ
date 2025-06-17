<template>
	<span
	  :class="{ 
		'text-danger': stopLossSwitchHealth,
		'text-primary': !stopLossSwitchHealth
	  }"
	  title="if This symbol changes color switches between red and blue system is connected to market"
	>
	  mdi-circle
	</span>
  </template>
  
  <script>
  export default {
	props: {
	  stopLossSwitchHealth: {
		type: Boolean,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  