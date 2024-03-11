<template>
	<v-col>
	  {{ instruments[0].tradingsymbol }} D0 {{ instruments[0].pricePoints.d1.normalDate }}
	  D1 {{ instruments[0].pricePoints.d2.normalDate }}
	</v-col>
  </template>
  
  <script>
  export default {
	props: {
	  instruments: {
		type: Array,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  