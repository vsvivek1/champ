<template>
	<div class="row fixTableHead" v-if="false">
	  <div class="col">
		<table class="table table-bordered table-stripped">
		  <thead>
			<th>Slno</th>
			<th>Stock</th>
			<th>Strike</th>
			<th>tradingSymbol</th>
			<th>LTP</th>
			<th>Type</th>
			<th>Yesterday High</th>
			<th>Action</th>
		  </thead>
		  <tbody>
			<tr v-for="(i, index) in instrumentsFiltered" :key="i.instrument_token">
			  <!-- ... (your existing template content) ... -->
			</tr>
		  </tbody>
		</table>
	  </div>
	</div>
  </template>
  
  <script>
  export default {
	props: {
	  instrumentsFiltered: {
		type: Array,
		default: () => []
	  },
	  changeBuyingMethod: {
		type: Function,
		default: () => {}
	  },
	  buyingPoint: {
		type: Array,
		default: () => []
	  },
	  noTradingNow: {
		type: Function,
		default: () => {}
	  }
	}
  };
  </script>
  