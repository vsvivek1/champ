<template>
	<v-col>
	        {{  instruments[0].tradingsymbol  }} 
	        
	        D0 
	        
	        
	        &nbsp;{{ instruments[0].pricePoints.d1.normalDate }}
	      
	        D1 &nbsp;
	
	{{ instruments[0].pricePoints.d2.normalDate }} </v-col>
</template>

<script setup lang="ts">
defineProps<{ 
	instruments: any[];
}>()
</script>
