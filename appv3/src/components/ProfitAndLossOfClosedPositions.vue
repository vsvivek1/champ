<template>
	<v-chip
	          :color = "closedTradesScriptsPnl > 0 ? 'green' : 'red'"
	          class = "pb-2 mb-2"
	        >
	          Profit and Loss of Closed positions {{  closedTradesScriptsPnl  }} 
	        </v-chip>
</template>

<script setup lang="ts">
const closedTradesScriptsPnl = defineModel<any>('closedTradesScriptsPnl', { required: true })
</script>
