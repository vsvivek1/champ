<template>
<div>


	<span
    :class="['heart-icon', { 'text-danger': heartBeat, 'text-primary': !heartBeat }]"
    title="if This symbol changes color switches between red and blue system is connected to market"
  >
    mdi-heart
  </span>
</div>
	
  </template>
  
  <script>
  export default {
	props: {
	  heartBeat: {
		type: Boolean,
		required: true
	  }
	}
  }
  </script>


<style>
.heart-icon {
  transition: transform 0.3s ease;
}

.heart-icon.large {
  font-size: 5rem;
}

.heart-icon.small {
  font-size: 1rem;
}
</style>
  /* Add any scoped styles here if needed */

  