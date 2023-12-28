<template>
	<v-col>
	        <v-icon color = "blue">mdi-clock</v-icon> {{  hours  }} : {{  minutes  }}  :
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

<style lang="scss" scoped>

</style>


