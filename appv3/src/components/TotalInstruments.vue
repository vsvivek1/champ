<template>
	<div>
	  <h2 style="color:red">Total Instruments: {{ instruments.length }}</h2>
	
	</div>
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
  