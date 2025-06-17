<template>

	<div>
	<v-alert color = "red" v-if = "checkSidewaysMovementTime()">
	
	SIDE WISE TIME
	
	      </v-alert>
	
	      <v-alert color = "green" v-if = "!checkSidewaysMovementTime()">
	
	ACTION TIME
	
	      </v-alert>
		</div>
</template>

<script >
export default {
		props: {
			checkSidewaysMovementTime: {
				type: Function,
				default: ()=>true
			},
		},
	}
</script>

<template>
	<div>

	</div>
</template>



<style  scoped>

</style>
