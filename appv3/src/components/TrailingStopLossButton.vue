<template>
	<v-btn @click="trailingStopLossWithLtp()">TRAILING STOP LOSS</v-btn>
  </template>
  
  <script>
  export default {
	props: {
	  trailingStopLossWithLtp: {
		type: Function,
		required: true
	  }
	},
	methods: {
	  // You can directly define methods here, or use a separate methods object
	  // Example:
	  // trailingStopLossWithLtp() {
	  //   this.$emit('trailingStopLossWithLtp');
	  // }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  