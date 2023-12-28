<template>
	<v-col>
	  <img
		v-if="chat_id < -1"
		:src="chat_id < -1 ? 'https://img.icons8.com/color/48/000000/twitter--v2.png' : ''"
	  />
	</v-col>
  </template>
  
  <script>
  export default {
	props: {
	  chat_id: {
		type: Number,
		required: true
	  }
	}
  };
  </script>
  