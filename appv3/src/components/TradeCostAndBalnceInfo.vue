<template>
	<v-row>
	  <v-col>
		<v-chip>
		  Live Position cost {{ livePositionTotalCost }} Live Buy order Amount {{ liveBuyOrderAmount }} &nbsp; Live Tradable Balance {{ liveTradablebalance }}
		</v-chip>
	  </v-col>
	</v-row>
  </template>
  
  <script>
  export default {
	props: {
	  livePositionTotalCost: {
		type: Number,
		required: true
	  },
	  liveBuyOrderAmount: {
		type: Number,
		required: true
	  },
	  liveTradablebalance: {
		type: Number,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  