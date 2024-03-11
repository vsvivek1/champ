<template>
	<h2 style="color:red">Soft ware flow status Live {{ tradeEntryFlowStatus }}</h2>
  </template>
  
  <script>
  export default {
	props: {
	  tradeEntryFlowStatus: {
		type: String,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  