<template>
	<div>
	  <p v-if="logs.length && viewLogs">Logs:</p>
	  <ul v-if="viewLogs">
		<li v-for="log in logs" :key="log">{{ log }}</li>
	  </ul>
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  logs: {
		type: Array,
		default: () => []
	  },
	  viewLogs: {
		type: Boolean,
		required: true
	  }
	}
  };
  </script>
  