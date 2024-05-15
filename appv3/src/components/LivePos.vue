<template>
    <div>

        <!-- {{ livePositionsDisplay }} livePositions -->
        <table class = "table">
          <thead>
            <th>Sl#</th>
            <th>Symbol</th>
            <th>Entry Criteria</th>

            <th>AVG/QTY</th>
            <th>YDAY Sl</th>
            <th>STATUS</th>
            <th>TRAILING STOP LOSS</th>
            <th>Last Price</th>
            <th>TARGET</th>
            <th>Cur PNL</th>

            <th>ACTION</th>
          </thead>
          <tbody v-if = "livePositionsDisplay.length > 0">
            <tr
              :class = "{ 
                'bg-warning': pos.quantity < 0,

                'bg-danger': pos.trailingStopLoss > pos.last_price,

                'text-success':
                  pos.last_price >pos.instrument.pricePoints.d1.rangeBreakOutTarget
                  
               } "
              v-for = "( pos, index ) in livePositionsDisplay"
              :key = "index"
            >

            <!-- pos.instrument.pricePoints.d1.high -->
              <td
              :class = "{ 'bg-secondary':pos.noScriptInHourlyCandle } "
              


              
              
              >{{  index + 1  }} 
            
            
            <span v-if = "pos.noScriptInHourlyCandle"
            >Script Missing</span> 
            
            
            </td>
              <td>
                <!-- {{  pos.instrument.pricePoints.d1.high  }}  -->
                <!-- pos.instrument.pricePoints.d1.high {{  pos.instrument.pricePoints.d1 }}  -->

                <a
                  v-if = "typeof pos.instrument !=  'undefined'"
                  target = "_blank"
                  :href = "pos.instrument.chart"
                >
                  {{  pos.tradingsymbol  }} 
                </a>

                <span v-else>{{  pos.tradingsymbol  }} </span>
              </td>


              <td>
                pos.instrument.entryCriteria
                {{ pos.instrument.entryCriteria }}
                </td>
              <td>
                {{  pos.average_price  }}  <br />
                <small class = "text-danger">
                  <v-chip> Qty {{  pos.quantity  }} </v-chip>
                </small>
              </td>
              <TD>
                <span v-if = "typeof pos.instrument !=  'undefined'">
                  {{  getStopLoss( pos.instrument_token )  }} 
                </span>
              </TD>

              <td>
               <span> <v-chip> Entry
                {{  pos.instrument.pricePoints.d1.high  }} 
                </v-chip>
                
                
                </span>
               
               
               
                {{  getReverseOrderAndHasLiveTargetStatus( pos.instrument_token )  }} 
              </td>

              <td
                :class = "{ 
                  'bg-warning':
                    pos.trailingStopLoss  ==  getStopLoss( pos.instrument_token ),
                 } "
              >


              Do Low =   {{  pos.instrument.pricePoints.d0.low  }}  {{  pos.instrument.pricePoints.d0.normalDate  }} 
              D1 Low =   {{  pos.instrument.pricePoints.d1.low  }}  {{  pos.instrument.pricePoints.d1.normalDate  }} 
              D0 high =   {{  pos.instrument.pricePoints.d0.high  }}  {{  pos.instrument.pricePoints.d1.normalDate  }} 
              D1 high =   {{  pos.instrument.pricePoints.d1.high  }}  {{  pos.instrument.pricePoints.d1.normalDate  }} 
               

                <small
                  :class = "{ 
                    'text-danger':
                      ( pos.trailingStopLoss - pos.average_price ) *
                        pos.quantity <
                      0,
                    'text-success':
                      ( pos.trailingStopLoss - pos.average_price ) *
                        pos.quantity >= 
                      0,
                   } "
                  >{{ 
                    ( pos.trailingStopLoss - pos.average_price ) * pos.quantity
                   }} </small
                >
              </td>

              <td>{{  pos.instrument.last_price  }} </td>

           

              <td>

                D1 range break out = {{ pos.instrument.pricePoints.d1.rangeBreakOutTaarget  }} 
             

                <small>
                  {{ 
                  (   ( 
                      pos.instrument.pricePoints.d1.rangeBreakOutTarget- pos.average_price
                       ) *   100 /
                      pos.average_price
                     ).toFixed( 2 )
                   }} 
                  %
                </small>

                <!-- <small
                  :class = "{ 
                    'text-success':( getMisPricePointofScript( pos.instrument_token,
                     pos.instrument.pricePoints.d1.high )              
                   -pos.average_price )*pos.quantity
                    
                    
                   
 >=  0,
                    'text-danger':                 
                      
                      ( getMisPricePointofScript( pos.instrument_token,
                       pos.instrument.pricePoints.d1.high )
                      
                      
                      -pos.average_price )*pos.quantity
 < 0,
                   } "
                >
                  {{                 
                  ( getMisPricePointofScript( pos.instrument_token, pos.instrument.pricePoints.d1.high )
                   
                   
                   -pos.average_price )*
                   pos.quantity


  }}  Rs {{  ( 
  
 ( getMisPricePointofScript( pos.instrument_token, pos.instrument.pricePoints.d1.high )
 
 
 -pos.average_price )*
                   pos.quantity*100/pos.buy_value ).toFixed( 2 ) }}  %
                </small> -->
              </td>

              <td>
                {{  pos.pnl.toFixed( 0 )  }} 

                <small
                  :class = "{ 
                    'text-success': pos.pnl >=  0,
                    'text-danger': pos.pnl < 0,
                   } "
                >
                  {{  (( pos.pnl * 100 ) / pos.buy_value ).toFixed( 2 )  }}  %
                </small>
              </td>

              <td>
                <v-icon
                  color = "blue"
                  v-if = "pos.hasLiveTarget"
                  title = "Live Target Exist"
                  >mdi-star</v-icon
                >

                <v-btn @click = "enableForEditng(  )" v-if = "pos.hasLiveTarget">
                  <v-icon class = "text-yellow">mdi-pencil</v-icon>
                  {{  pos.targetPrice  }} 
                </v-btn>

                <v-btn @click = "CancelOrder(  )" v-if = "pos.hasLiveTarget">
                  <v-icon>mdi-circle</v-icon>
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

        data(  ){ 

            return{ 

               
             } 
         } ,
        name:"LivePos",
        props:{ livePositionsDisplay:Array,
            getStopLossResult:Number,
            getReverseOrderAndHasLiveTargetStatusForChildResult:Object,
            convertIsoDateToISTResult:String
         } ,
        methods:{ 

            getReverseOrderAndHasLiveTargetStatus( val ){ 

return 0;
                this.$emit( 'getReverseOrderAndHasLiveTargetStatusForChild',val )
            
                return this.getReverseOrderAndHasLiveTargetStatusForChildResult
            
             } ,

            getStopLoss( val ){ 
              return 0;
this.$emit( 'getStopLOssForChild',val )
return this.getStopLossResult;


             } ,

            convertIsoDateToIST( val ){ 
              return 0;
this.$emit( 'convertIsoDateToIST',val )
return this.convertIsoDateToISTResult;


             } 

         } 
     } 
</script>

<style lang = "scss" scoped>

</style>
