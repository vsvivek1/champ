<template>
  <div>


    <!-- {{ this.instrumentSlTargetlevels }} this.instrumentSlTargetlevels -->

    <!-- <v-btn @click = "getHoldings(  )" class = "btn-primary">holdings

      <v-icon>mdi-briefcase-download-outline</v-icon>

    </v-btn> -->


    <div class = "row">
      <div class = "col">Slno</div>
      <div class = "col" @click = "orderby( 'tradingsymbol' )">Symbol</div>
      <div class = "col" @click = "orderby( 'average_price' )">Average Price</div>
      <div class = "col" @click = "orderby( 'last_price' )">LAST Price</div>
      <div class = "col" @click = "orderby( 'quantity' )">Quantity</div>

      <div class = "col" @click = "orderby( 'pnl' )">Current P/L</div>


      <div class = "col">Levels</div>

      <div class = "col">Support/Ressistance</div>


      <div class = "col">P/L @ Support</div>
      <div class = "col">P/L @ Ressistance/div>
        <!-- <div class = "col">SL</div> -->
        <div class = "col">QuickAction</div>

      </div>
      <ul class = "list list-group">
        <li class = "list-group-item" v-for = "( holding,index ) in holdings" :key = "index">




          <div class = "row">
            <div class = "col">{{ index+1 }} </div>
            <div class = "col">{{ holding.tradingsymbol }} </div>
            <div class = "col">{{ holding.average_price }} </div>
            <div class = "col">{{ holding.last_price }} </div>
            <div class = "col">{{ holding.quantity }} </div>
            <div class = "col">{{ holding.pnl }} </div>
            <!-- <div class = col>{{ holding }} </div> -->

            <div class = "col">

              <!-- {{ holding }} vivek -->
              

            </div>

            <div class = "col">

              <div v-if = "holding.targets">

<p class = "lead" v-if = "holding.targets.level.hasOwnProperty( 'support' )">
     
       support {{ holding.targets.level.support.level }} 
       Ressistance {{ holding.targets.level.ressistance.level }} 
  <!-- {{ holding.targets.level.hasOwnProperty( 'support' ) }}  -->
  
  </p>

                <!-- {{ typeof( holding.targets ) }}  -->

           
                
                



                
                <!-- support {{ holding.targets.level.hasOwnProperty( 'support' ) }}  -->
              </div>

            </div>

            <!-- <div class = "col" v-if = "holding.targets">
              {{ holding.targets.level.support.level*holding.quantity-holding.quantity*holding.average_price }} 
            </div>
             -->
            
            <div class = "col" v-if = "holding.targets">
              {{ holding.targets.level.ressistance.level*holding.quantity-holding.quantity*holding.average_price }} 
            </div>

            <div class = "col" :class = "{ 'text-danger': holding.pnl<0,'text-success':holding.pnl>0 } ">{{ holding.pnl }} 

            </div>

            <div class = "col" :class = "{ 'text-danger': holding.pnl<0,'text-success':holding.pnl>0 } ">
              {{ holding.investments }} 

            </div>
            <div class = "col" :class = "{ 'text-danger': holding.pnl<0,'text-success':holding.pnl>0 } ">


              <div class = "form-group"> Target as Price

                <input type = "checkbox" value = true class = "form-control"
                  @change = "ChangeToPC( 'PcSl',holding.tradingsymbol )">
              </div>


              {{ holding.PcSl }} holding.PcSl
              <div class = "form-group" v-if = "!holding.PcSl">
                <label for = "">Target Price</label>
                <input type = "text" class = "form-control">

              </div>

              <div class = "form-group" v-if = "holding.PcSl">
                <label for = "">Target % </label>
                <input type = "text" class = "form-control">

              </div>



            </div>
            <div class = "col" :class = "{ 'text-danger': holding.pnl<0,'text-success':holding.pnl>0 } ">stop loss

            </div>

            <div class = "col">
              <!-- {{ getTargetPriceLevels( holding.instrument_token ) }}  -->
              <!-- <QuickSellBuy :targets = "getTargetPriceLevels( holding.instrument_token )"></QuickSellBuy> -->
            </div>


          </div>

          <div class = "row">
            <div class = "col">

              <SupportRessistacePoints @calculated = "ReflectCalculated" :ltp = "holding.last_price"
                :instrument_tocken = "holding.instrument_token"></SupportRessistacePoints>
            </div>
          </div>

        </li>
      </ul>

      <!-- 
        <template>
  <v-data-table
    :headers = "headers"
    :items = "holdings"
    :items-per-page = "200"
    class = "elevation-1"

    :footer-props = "footer_props"
  ></v-data-table> 
</template> -->

    </div>

  </div>
</template>

<script>
  import axios from 'axios';

  import sessionMixin from '@/views/sessionMixin';
  import store from '@/store';

  import SupportRessistacePoints from './SupportRessistacePoints.vue';
  import QuickSellBuy from './QuickSellBuy.vue';
  export default { 

    mixins: [sessionMixin],
    name: 'ListHoldings',

    components: { 
      SupportRessistacePoints,
      QuickSellBuy
     } ,
    computed: { 

      accessToken2(  ) { 

        return store.state.accessToken;
       } ,
      h(  ) { 
        return this.holdings
       } 
     } ,
    data(  ) { 
      return { 

        instrumentSlTargetlevels: [],
        ClickedParam: '',
        holdings: [],
        headers: [{ 
            text: 'Sl#',
            align: 'start',
            sortable: false,
            value: 'slno',
           } ,
          { 
            text: 'Symbol',
            value: 'tradingsymbol'
           } ,
          { 
            text: 'Avg Proice',
            value: 'average_price'
           } ,
          { 
            text: 'Qty',
            value: 'quantity'
           } ,
          { 
            text: 'pnl',
            value: 'pnl'
           } ,
          { 
            text: 'Total Investment',
            value: 'investments'
           } ,
        ],
        footer_props: { 
          showFirstLastPage: true,
          firstIcon: 'mdi-arrow-collapse-left',
          lastIcon: 'mdi-arrow-collapse-right',
          prevIcon: 'mdi-minus',
          nextIcon: 'mdi-plus'
         } 
       } 
     } ,

    mounted(  ) { 
      this.getHoldings(  )
     } ,


    methods: { 

      async getTargetPriceLevels( instrument_token ) { 


        return this.instrumentSlTargetlevels.filter( t  => t.instrument_tocken  ==  instrument_token )[0];

        // .filter( i =>i.instrument_token == instrument_token )[0]

       } ,
      ReflectCalculated( val ) { 
        let InsToken  =  val.instrument_tocken

        this.$set( this.holdings.filter( h  => h.instrument_token  ==  InsToken )[0], 'targets', val )

        this.instrumentSlTargetlevels.push( val );

       } ,

      orderby( param ) { 

        if ( this.ClickedParam  ==  param ) { 
          this.holdings  =  [...this.holdings.sort(( a, b )  => { 

            return a[param] - b[param]

           }  )]

         }  else { 
          this.holdings  =  [...this.holdings.sort(( a, b )  => { 

            return b[param] - a[param]

           }  )]

         } 



        this.ClickedParam  =  param

       } ,

      ChangeToPC( para, symbol ) { 



        this.holdings.filter( h  => h.tradingsymbol  ==  symbol )[0][para]  =  !this.holdings.filter( h  => h.tradingsymbol  == 
          symbol )[0][para];
        let pnl  =  this.holdings.filter( h  => h.tradingsymbol  ==  symbol )[0][para];

        let avg  =  this.holdings.filter( h  => h.tradingsymbol  ==  symbol )[0].PcSl;
        console.log( 'pnl', pnl, symbol, avg )

        // alert( pnl );

        // this.holdings.filter( h =>h.tradingsymbol = symbol )[0][para] = payload;

       } ,

      getHoldings(  ) { 
        const url  =  '/api/holdings/' + this.accessToken
        axios.get( url ).then( res  => { 
          this.holdings  =  res.data.sort(( a, b )  => { 
            return a.pnl - b.pnl
           }  )

          this.holdings.forEach( h  => { 


            h.investments  =  h.average_price * h.quantity;
            this.$set( h, 'PcSl', false );
            h.targetPc  =  false;

           }  )


         }  )

       } 



     } 
   } 

</script>

<style scoped>

</style>
