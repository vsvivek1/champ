<template>
    <div>

        <div class="card card-primary">

<button class="btn btn-primary">Sell Target @ {{targets.level.support.level}} </button>
        <button class="btn btn-danger">Sell SL @ {{targets.level.ressistance.level}}  </button>

        </div>
        
    </div>
</template>

<script>
    export default {
        name:'QuickSellBuy',
        props:['targets']
    }
</script>

<style scoped>

</style>