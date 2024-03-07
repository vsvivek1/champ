<template>
	<h2 style="color:red"> Soft ware flow status  Live{{  tradeEntryFlowStatus  }} </h2>
</template>

<script setup lang="ts">
defineProps<{ 
	tradeEntryFlowStatus: string;
}>()
</script>
