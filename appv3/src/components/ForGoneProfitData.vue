<template>
	<div class="row">
	  <v-chip>
		FORGONE: {{ totalForgone.toFixed(1) }} FORGONE TARGET: {{ totalForgoneFortarget.toFixed(1) }} FORGONE SL: {{
		totalForgoneForStopLoss.toFixed(1)
		}}
	  </v-chip>
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  totalForgone: {
		type: Number,
		required: true
	  },
	  totalForgoneFortarget: {
		type: Number,
		required: true
	  },
	  totalForgoneForStopLoss: {
		type: Number,
		required: true
	  }
	}
  };
  </script>
  