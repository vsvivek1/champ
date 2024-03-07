<template>
	<v-col>
	
	    {{ stopLossSwitchHealth  }}  stopLossSwitchHealth
	
	  {{  tradeEntrySwitchHealth  }}  tradeEntrySwitchHealth
	      </v-col>
</template>

<script setup lang="ts">
defineProps<{ 
	stopLossSwitchHealth: boolean;
	tradeEntrySwitchHealth: boolean;
}>()
</script>
