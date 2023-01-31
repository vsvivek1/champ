<template>
    <div>
<table class="table bordered  table-compact">
 
 <caption style="caption-side: top;">
 Live orders
 </caption>
  <thead>
    
    <th>#</th>
    <th>Trading symbol</th>
    <th>Type</th>
    <th>Price/Qty</th>
    
   
  </thead>
  <tbody>
    <tr v-for="(lo,index) in liveOrders" :key="index"
    
    :class="{
      'text-danger': (lo.transaction_type=='SELL'),
      'text-success': (lo.transaction_type=='BUY')
    
    }"
    >
      <td>{{index+1}}</td>
      <td>{{lo.tradingsymbol}}</td>
      <td>{{lo.transaction_type}}</td>
      <td>{{lo.price}} /{{lo.quantity}} Qty </td>
     
    </tr>
  </tbody>
</table>

    </div>
</template>

<script>
    export default {
        name:'LiveOrders',
         props:{liveOrders:Array}
    }
</script>

<style lang="scss" scoped>

</style>