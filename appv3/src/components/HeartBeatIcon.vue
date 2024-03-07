<template>
	<v-icon
	          :class = "{ 'text-success':heartBeat } "
	      
	          title = "if This symbol changes color switches between red and blue system is conencted to market"
	        >
	          mdi-heart
	        </v-icon>
</template>

<script setup lang="ts">
defineProps<{ 
	heartBeat: boolean;
}>()
</script>
