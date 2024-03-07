<template>
	<h2 style="color:red">Total Instruments:  {{  instruments.length  }} </h2>
</template>

<script setup lang="ts">
defineProps<{ 
	instruments: any[];
}>()
</script>
