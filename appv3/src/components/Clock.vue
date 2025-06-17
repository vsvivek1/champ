<template>
	<v-col>
	        <span color = "blue">mdi-clock</span> {{  hours  }} : {{  minutes  }}  :
	        {{  seconds  }} 
	      </v-col>
</template>

<template>
	<div>

	</div>
</template>

<script>
	export default {
		props:['hours','minutes','seconds'],
	}
</script>

<style  scoped>

</style>


