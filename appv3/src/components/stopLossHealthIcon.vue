<template>
	<v-icon
	          v-bind:class = "{ 
	            
	            'text-danger':stopLossSwitchHealth,
	            'text-primary':!stopLossSwitchHealth,
	        
	        
	         } "
	          title = "if This symbol changes color switches between red and blue system is conencted to market"
	        >
	        
	          mdi-circle
	        </v-icon>
</template>

<script setup lang="ts">
defineProps<{ 
	stopLossSwitchHealth: boolean;
}>()
</script>
