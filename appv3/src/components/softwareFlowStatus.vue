<template>
	<div style="color:red">Soft ware flow status Live {{ tradeEntryFlowStatus }}</div>
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
  