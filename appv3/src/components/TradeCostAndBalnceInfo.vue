<template>
	<v-row>
	          <v-col>
	            <v-chip>
	              Live Position cost {{  livePositionTotalCost  }}  Live Buy order
	              Amount {{  liveBuyOrderAmount  }}  &nbsp; Live Tradable Balance
	              {{  liveTradablebalance  }} </v-chip
	            >
	          </v-col>
	        </v-row>
</template>

<script setup lang="ts">
defineProps<{ 
	livePositionTotalCost: number;
	liveBuyOrderAmount: number;
	liveTradablebalance: number;
}>()
</script>
