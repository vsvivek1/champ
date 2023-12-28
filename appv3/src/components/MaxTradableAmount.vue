<template>
	<v-col>
	  <input
		title="Maximum Tradable Amount"
		type="text"
		class="form-control"
		v-model="maxTradableAmount"
		placeholder="Maximum Tradable Amount"
	  />
	</v-col>
  </template>
  
  <script>
  export default {
	props: {
	  maxTradableAmount: Number
	},
	
  };
  </script>
  