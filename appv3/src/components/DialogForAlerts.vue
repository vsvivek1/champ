<template>
	<v-dialog v-model="dialog" max-width="290">
	  <v-alert v-if="alerts.length">
		<ul>
		  <li v-for="alert in alerts" :key="alert.code">
			{{ alert.message }}
		  </li>
		</ul>
	  </v-alert>
	</v-dialog>
  </template>
  
  <script>
  export default {
	data() {
	  return {
		dialog: false,
		alerts: []
	  };
	}
  };
  </script>
  