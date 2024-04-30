<template>
    <div>

      <!-- not used now -->
  <table class = "table" v-if = "livePositions.length>0">
          <thead>
            <th>Sl#</th>
            <th>Symbol</th>
            <th>PNL</th>
            <th>AVG/QTY</th>
             <th>YDAY Sl</th>
             <th>STATUS</th>
             <th>TRAILING STOP LOSS</th>
            <th>Last Price</th>
            <th>TARGET</th>
            <th>signal</th>
           

            <th>ACTION</th>
          </thead>
          <tbody  v-if = "livePositions.length>0">
            <tr 
            
            :class = "{ 'bg-warning': pos.quantity<0 ,
                         
             'bg-danger':pos.trailingStopLoss>pos.last_price,

             'bg-success':pos.last_price>
             getMisPricePointofScript( pos.instrument_token )
              } "
            
            
            v-for = "( pos, index ) in livePositions" :key = "index">
              <td>{{  index + 1  }} </td>
              <td  >

             
                <a v-if = "typeof pos.instrument!= 'undefined'" 
                target = "_blank" :href = "pos.instrument.chart"
               >
                {{  pos.tradingsymbol  }} 
                </a>

                <span v-else>{{  pos.tradingsymbol  }} </span>
                </td>
              <td>{{  pos.pnl  }} 

              <small :class = "{ 'text-success':pos.pnl>= 0,
              'text-danger':pos.pnl<0,
              
               } ">
                {{ ( pos.pnl*100/pos.buy_value ).toFixed( 2 ) }}  %
              </small>
              
              </td>
              <td>{{  pos.average_price  }} 
              <small class = "text-danger"> 
                
                <v-chip>     Qty {{  pos.quantity  }} </v-chip>
                
            </small>
              </td>
                                       <TD  >

                      <span v-if = "typeof pos.instrument!= 'undefined'">
                       
                       
                       {{ getStopLoss( pos.instrument_token ) }} 
                     
                     
                     </span>

</TD>

<td>
 {{ getStatus( pos.instrument_token ) }} 

</td>



<td 
:class = "{ 'bg-warning':( pos.trailingStopLoss == getStopLoss( pos.instrument_token )) }  "

>
<span v-if = "typeof pos.instrument!= 'undefined'" >
{{ pos.trailingStopLoss }} 


</span>


<small
:class = "{ 
  
  'text-danger': ( pos.trailingStopLoss-pos.average_price )*pos.quantity<0,
  'text-success': ( pos.trailingStopLoss-pos.average_price )*pos.quantity>= 0,


 } "

>{{ ( pos.trailingStopLoss-pos.average_price )*pos.quantity }} </small>


</td>

              <td>{{  pos.last_price  }} </td>

   
              <!-- <td>
                <input
                  type = "text"
                  size = "5"
                  name = ""
                  id = ""
                  v-model = "pos.targetPc"
                />
                <input
                  style = "width: fit-content"
                  type = "text"
                  name = ""
                  id = ""
                  v-model = "pos.rangeBreakOutTarget"
                />
              </td> -->

                        <td>

  {{  getMisPricePointofScript( pos.instrument_token ) }} 
</td>


<td>
  {{ pos.instrument.exit }} i
</td>

              <td>
                <v-icon
                  color = "blue"
                  v-if = "pos.hasLiveTarget"
                  title = "Live Target Exist"
                  >mdi-star</v-icon
                >

                <v-btn @click = "enableForEditng(  )" v-if = "pos.hasLiveTarget">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>

                <v-btn @click = "CancelOrder(  )" v-if = "pos.hasLiveTarget">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>

                <v-btn
                  color = "green"
                  title = "Set Target"
                  @click = "setTarget( pos )"
                  v-if = "!pos.hasLiveTarget"
                >
                  <v-icon>mdi-cube-send</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>

    </div>
</template>

<script>
    export default { 
        name:'LivePositions',
         props:{ liveOrders:Array } ,
         methods:{ 


          } 
     } 
</script>

<style lang = "scss" scoped>

</style>