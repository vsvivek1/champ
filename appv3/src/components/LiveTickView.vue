<template>
    <div>
<table class="table table-bordered table-compact">
  <thead>
    <th>symbol</th>
    <th>LTP</th>
    <th>Buying point</th>
    <th>Target</th>
  </thead>
  <tbody>
    <tr>
      <td class="text-warning">Below buy point</td>
      <td class="text-primary">Above buy point</td>
      <td class="text-success">Above  target</td>
      <td class="text-danger">Below stop loss</td>
    </tr>
    <tr :class="{ 'text-warning':liveScript.ltp<liveScript.buyPoint,
    'text-primary':liveScript.ltp>liveScript.buyPoint,
    'text-success':liveScript.ltp>liveScript.target,
    'text-danger':liveScript.ltp<=liveScript.stopLoss
    }">
      <td >{{liveScript.tradingsymbol}}</td>
      <td>{{liveScript.ltp}}</td>
      <td>{{liveScript.buyPoint}}</td>
      <td>{{liveScript.target}}</td>
    </tr>
  </tbody>
</table>
    </div>
</template>

<script>
    export default {
        name:'LiveTickView',
         props:{liveScript:Object}
    }
</script>

<style lang="scss" scoped>

</style>