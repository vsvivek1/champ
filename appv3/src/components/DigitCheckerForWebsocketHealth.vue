<template>
	<div>
	  <v-chip color="green" title="Current Check Digit">
		{{ CurrentCheckDigit }}
	  </v-chip>
	  <v-chip color="red" title="Lagging Check Digit">
		{{ laggingCheckDigit }}
	  </v-chip>
	  <v-chip color="orange" v-if="webSocketNotActive">
		Check Web Sockets
	  </v-chip>
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  CurrentCheckDigit: {
		type: Number,
		default: -1
	  },
	  laggingCheckDigit: {
		type: Number,
		default: -2
	  },
	  webSocketNotActive: {
		type: Boolean,
		default: false
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  