<template>
	<v-btn @click = "trailingStopLossWithLtp()">TRAILING STOP LOSS </v-btn>
</template>

<script setup lang="ts">
defineProps<{ 
	trailingStopLossWithLtp: () => Promise<void>;
}>()
</script>
