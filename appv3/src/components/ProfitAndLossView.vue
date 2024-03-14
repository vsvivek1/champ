<template>
	<div>
		<v-row>
			<v-chip :color="totalpnl > 0 ? 'green' : 'red'" class="pb-2 mb-2">
		Profit and Loss of Live positions {{ totalpnl }}
	  </v-chip>
  
	  <v-chip :color="closedTradesScriptsPnl > 0 ? 'green' : 'red'" class="pb-2 mb-2">
		Profit and Loss of Closed positions {{ closedTradesScriptsPnl }}
	  </v-chip>
  
	  <v-chip :color="(closedTradesScriptsPnl + totalpnl) > 0 ? 'green' : 'red'" class="pb-2 mb-2">
		Total Profit and Loss {{ closedTradesScriptsPnl + totalpnl }}
	  </v-chip>
			
		</v-row>
	 
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  totalpnl: {
		type: Number,
		required: true
	  },
	  closedTradesScriptsPnl: {
		type: Number,
		required: true
	  }
	}
  };
  </script>
  