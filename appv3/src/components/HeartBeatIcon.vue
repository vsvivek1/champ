<template>
	<v-icon
	  :class="{ 'text-success': heartBeat }"
	  title="if This symbol changes color switches between red and blue system is connected to market"
	>
	  mdi-heart
	</v-icon>
  </template>
  
  <script>
  export default {
	props: {
	  heartBeat: {
		type: Boolean,
		required: true
	  }
	}
  }
  </script>
  
  <style scoped>
  /* Add any scoped styles here if needed */
  </style>
  