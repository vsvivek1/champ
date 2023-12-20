<template>
    <div>

        <v-btn @click = "getBtstOptions(  )">click</v-btn>
<p>Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy text ( Windows ).</p>
        <table class = "table table-bordered table-hover table-compact table-striped">
            <thead>
                <th>#</th>
                <th>Trading Symbol</th>
                <th>LTP</th>
                <th>LOT <small>Amount</small></th>
                <th>ACTION</th>
            </thead>
            <tbody>
                <tr v-for = "( script,index ) in scripts " :key = "index" >
                    <td>{{ index+1 }} </td>
                    <td>

                        <a  target = "_blank" :href = "script.chart">{{ script.tradingsymbol }} </a>
                        </td>
                    <td>{{ script.ohlc.last_price }} 
                    
                    {{ script.ohlc }} 
                    </td>
                    <td>{{ script.lot_size }} 
                    <small>{{ script.lot_size*script.ohlc.last_price }} </small>
                    </td>
                    <td>

                        <v-btn>
Buy Now
                            <v-icon color = "green">mdi-cart</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </tbody>
        </table>







<!-- {{ sessionMixin }}  -->


    </div>
</template>

<script>
import axios from "axios";
import sessionMixin from "@/views/sessionMixin";
    export default { 
        methods:{ 
getBtstOptions(  ){ 
let url = '/api/btstOptions'
axios.get( url ).then( res =>{ 
    
    
    this.scripts = res.data } 
    
    
     )

 } ,


         } ,

        data(  ){ 


            return{ 
scripts:[]

             } 
         } ,
mounted(  ){ 
this.getBtstOptions(  )

 } ,


        name:"BTST",
        mixins: [sessionMixin],
     } 
</script>

<style lang = "scss" scoped>

</style>