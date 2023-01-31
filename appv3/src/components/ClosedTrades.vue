<template>
    <div>


<table v-if="closedTradesScriptsDisplay.length>0"


class="table table-bordered table-compact">
    <thead>
        <th>#</th>
        <th>Symbol</th>
     
        <th>Buy Price</th>
        <th>Sell Price</th>
        <th>Qty</th>
        <th >last price</th>
        <th>for gone </th>
           <th>pnl</th>
    </thead>
    <tbody>
        <tr 
        
        
        v-for="(closedTradesScript,index) in closedTradesScriptsDisplay" :key="index" >
            <td>{{index+1}}</td>
    <td>
        <a :href="closedTradesScript.instrument.chart" target="_blank">

            {{closedTradesScript.tradingsymbol}}
        </a>
        
        
    
    </td>
    <td>{{closedTradesScript.buy_price}}</td>
    <td>{{closedTradesScript.sell_price}}</td>
    <td>{{closedTradesScript.sell_quantity}}</td>
    <td :class="{
        'text-success':closedTradesScript.postTradePrice<closedTradesScript.sell_price,
        'text-danger':closedTradesScript.postTradePrice>closedTradesScript.sell_price
        
        
        }"
    
    
    >{{closedTradesScript.postTradePrice}}</td>


    <td>
        
        {{(closedTradesScript.postTradePrice-closedTradesScript.sell_price)*closedTradesScript.sell_quantity}}
    
    
    </td>
    <td>{{closedTradesScript.pnl}}</td>
        </tr>
    </tbody>
</table>
    </div>
</template>

<script>
    export default {
        name:'ClosedTrades',
        props:{closedTradesScripts:Array},

        computed:{

            closedTradesScriptsDisplay(){


              return   this.closedTradesScripts.
                filter(i=>typeof i.instrument!='undefined')

            }
        }
    }
</script>

<style lang="scss" scoped>

</style>