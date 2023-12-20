<template>
  <div>
    <div style = "display: hidden"></div>

    <!-- {{ strategies }}  123 -->
    <!-- {{ StrategicStockes }}  -->
    <!-- <div v-show = "false">

  {{ StrategicStocks }}  StrategicStocks
</div> -->

    <!-- {{ returnedSymbolsForOHLC }} returnedSymbolsForOHLC -->
    <!-- StrategicStocks {{ StrategicStocks }}  -->
    <!-- {{ StrategicStocks }}  StrategicStocks -->

    <!-- {{  StrategicStocks  }}  -->
    <hr />
    <Margin></Margin>

    <hr />
    <!-- Ohlc {{ Ohlc }}  -->

    <!-- {{ StrategicStocks }}  -->

    <div class = "row">
      <div class = "col">Select Strategies</div>
      <div class = "col">
        <select
          name = ""
          id = ""
          v-model = "strategyType"
          class = "form-control x"
          @change = "getStrategy(  )"
        >
          <option
            v-for = "( stragey, index ) in strategies"
            :value = "stragey.href"
            :key = "index"
          >
            {{  stragey.text  }} 
            <!-- {{ JSON.parse( stragey.name ) }}   -->
            <!-- {{ JSON.parse( stragey.name ) }}  -->
          </option>
        </select>
      </div>

      <div class = "col">
        <button @click = "getStrategy(  )" class = "btn btn-success">
          Scan Again
        </button>
      </div>
    </div>
    <hr />

    <div class = "loading" v-if = "loadingContent">
      <div>
        <v-progress-linear indeterminate color = "green"></v-progress-linear>
        <br />
      </div>

      <!-- loading... {{ holdingLength }}  -->
    </div>

    <div class = "nodata" v-if = "noData">
      <v-alert color = "green" dark dense icon = "mdi-school" prominent>
        No Long Build Up Found
      </v-alert>
    </div>

    <div v-if = "!loadingContent">
      <v-row>
        
        <v-col>
          <v-chip class = "ma-2" color = "primary" text-color = "white">
            Number of Shares
            {{  numberOfShares  }} 
            <v-icon right> mdi-cake-variant </v-icon>
          </v-chip>
        </v-col>
        <v-col>
          <v-chip class = "ma-2" color = "primary" text-color = "white">
            Amount Per Share
            {{  amountPerShare  }} 
            <v-icon right> mdi-cake-variant </v-icon>
          </v-chip>
        </v-col>
        <v-col>
          <v-chip class = "ma-2" color = "primary" text-color = "white">
            Total Amount
            {{  TotalAmount  }} 
            <v-icon right> mdi-cake-variant </v-icon>
          </v-chip>
        </v-col>
      </v-row>

      <v-row>
        
        <v-col>
          <v-btn
            v-if = "selectedVariety !=  ''"
            color = "green"
            @click = "PlaceOrderOnSelectedBuyingMethod(  )"
          >
            <v-icon>mdi-arrow-down</v-icon> Order By Buying Method
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            v-if = "selectedVariety !=  ''"
            color = "primary"
            @click = "PlaceBuyLongBuldUp(  )"
          >
            <v-icon>mdi-arrow-down</v-icon> Buy Strategy ohlc low
          </v-btn>
        </v-col>

        <v-col>
          <div class = "form-group">
            <label for = "">Select variety</label>
            <select
              name = ""
              id = ""
              class = "form-control"
              v-model = "selectedVariety"
            >
              <option v-for = "( variety, index ) in varieties" :key = "index">
                {{  variety.text  }} 
              </option>
            </select>
          </div>
        </v-col>

        <v-col>
          <div class = "form-group">
            <label for = "">Amount Per share</label>
            <input
              type = "text"
              @keyup = "CalculateTotalAmount(  )"
              class = "form-control"
              v-model = "amountPerShare"
            />
          </div>
        </v-col>

        <v-col>
          <div class = "form-group">
            <label for = "">Total Amount</label>
            <input
              type = "text"
              @keyup = "CalculateAmountperShare(  )"
              class = "form-control"
              v-model = "TotalAmount"
            />
          </div>
        </v-col>

        <v-col>
          <div class = "form-group">
            <label for = "">Select Buying Method</label>
            <select
              name = ""
              id = ""
              class = "form-control"
              v-model = "selectedBuyingMethod"
              @change = "calculatePricesAndQuantityAsPerBuyingMethod(  )"
            >
              <option
                v-for = "( BuyingMethod, index ) in BuyingMethods"
                :key = "index"
                :value = "BuyingMethod.id"
              >
                {{  BuyingMethod.text  }} 
              </option>
            </select>
          </div>
        </v-col>

<v-col>
{{ selectedProduct }}  selectedProduc
  <label for = "ProductType"> Product Type
    <select name = "ProductType" id = "ProductType" class = "form-control" v-model = "selectedProduct">
      <option v-for = "prod in product" :key = "prod" :value = "prod">
        {{ prod }} 
      </option>
    </select>
  </label>
</v-col>


      </v-row>
      <hr />

      <v-row>
        <v-col cols = "12">
      
            <v-card>
              <v-card-title>
                <v-text-field
                  v-model = "search"
                  append-icon = "mdi-magnify"
                  label = "Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-data-table
                :headers = "headers"
                :items = "StrategicStocks"
                :search = "search"
                class = "elevation-1"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>Buy Orders CNC</v-toolbar-title>
                    <v-spacer></v-spacer>
                  </v-toolbar>
                </template>

                <template v-slot:item.selected = "{  item  } ">
                  <v-simple-checkbox v-ripple
                    v-model = "item.selected"
                  ></v-simple-checkbox>
                </template>
 <template #item.website = "{  item  } ">
    <a target = "_blank" :href = "item.website" >
    Chart  <v-icon>mdi-link</v-icon>
    </a>
  </template>

              </v-data-table>
            </v-card>
            
          
            
            
            </v-col
      ></v-row>
    </div>
  </div>





  
</template>

<script>
import axios from "axios";
import strategiesFile from "./strategies.json";
import sessionMixin from "@/views/sessionMixin";
import Margin from "./Margin.vue";
export default { 
  name: "Strategies",
  components: {  Margin  } ,

  computed: { 
    strategies(  ) { 
      return this.strategies1.map(( s )  => { 
        return s;
       }  );
     } ,

    headers1(  ) { 
      return [];
      //     let ob1 = this.StrategicStocks;

      //     console.log( 'ob1',ob1 );
      //     return [];
      //     return false;
      // let keys = Object.keys( ob1 );

      // let h = key.map( k =>{ 

      // let ob = {  } ;
      // ob.text = k.toUpperCase(  );
      // ob.value = k

      //  }  )
      // return h;
     } ,
   } ,

  data(  ) { 
    return { 
      product:['CNC','NRML','MIS'],
      selectedProduct:'',
      orders: [],
      BuyingMethods: [
        { 
          id: -1,
          text: "Select",
         } ,
       
        { 
          id: 1,
          text: "Five point Buying",
         } ,
      ],
      selectedBuyingMethod: "",
      numberOfShares: 0,
      TotalAmount: 0,
      Ohlc: [],
      strategyType: "",
      strategies1: strategiesFile,
      loadingContent: true,
      amountPerShare: 0,
      varieties: [
        { 
          text: "amo",
         } ,
        { 
          text: "bo",
         } ,
        { 
          text: "co",
         } ,
        { 
          text: "regular",
         } ,
      ],
      headers: [
        { 
          text: "#",
          align: "start",
          filterable: false,
          value: "name",
         } ,
        {  text: "Symbol (  )", value: "symbol"  } ,

        {  text: "open", value: "ohlc.ohlc.open"  } ,
        {  text: "high", value: "ohlc.ohlc.high"  } ,
        {  text: "low", value: "ohlc.ohlc.low"  } ,
        {  text: "close", value: "ohlc.ohlc.close"  } ,
        {  text: "avg", value: "avg"  } ,
         {  text: 'Link', value: 'website'  } ,

        {  text: "CHANGEpc", value: "changePc"  } ,

        {  text: "Selected", value: "selected"  } ,
      ],

      // {  text: 'oi', value: 'oi'  } ,
      //  {  text: 'vol', value: 'vol'  } ,
      search: "",
      StrategicStocks: [],
      selectedVariety: "",
      noData: false,
      returnedSymbolsForOHLC: [],
     } ;
   } ,
  name: "Strategies",
  mixins: [sessionMixin],
  mounted(  ) { 
    // this.getStrategy(  );
   } ,
  methods: { 
    CalculateTotalAmount(  ) { 
      this.TotalAmount  =  this.amountPerShare * this.numberOfShares;
     } ,
    CalculateAmountperShare(  ) { 
      if ( this.numberOfShares !=  0 ) { 
        this.amountPerShare  =  this.TotalAmount / this.numberOfShares;
       }  else { 
        this.amountPerShare  =  0;
       } 
     } ,

    calculatePricesAndQuantityAsPerBuyingMethod(  ) { 
      // switch ( this.selectedBuyingMethod ) 

      switch ( true ) 
      
      { 
        case true:

         
          this.orders  =  [];
          ///lowpriceand avg
          // let arry = []

          //  typeof longbuildup.instrument_token  ==  "undefined";
          this.StrategicStocks.forEach(( longbuildup )  => { 
            let test  = 
              longbuildup.symbol  ==  "" ||
              longbuildup.selected  ==  false 
             

            if ( !test ) { 
              let price;

              ///low
              let order  =  {  } ;
              order.tag  =  this.strategyType;

            // order.variety  =  this.selectedVariety;


              
              order.variety  =  'regular'
              order.params  =  {  } ;
              order.params.exchange  =  "NSE";
              order.params.tradingsymbol  = longbuildup.symbol;
               
               
              //  longbuildup.instrument_token.tradingsymbol;    order.params.tradingsymbol  = 
              //   longbuildup.instrument_token.tradingsymbol;



              order.params.transaction_type  =  "BUY";
              let avg1  =  0;
              if ( typeof longbuildup.ohlc  ==  "undefined" ) { 
                avg1  =  0;
               }  else { 
                avg1  =  parseFloat( longbuildup.ohlc.ohlc.low );
               } 
              order.params.quantity  =  Math.round( 
                this.amountPerShare / ( avg1 * 5 )
               );
              order.params.product  =  "CNC";
              // order.params.product  =  this.selectedProduct;
              
              order.params.order_type  =  "LIMIT";
              order.params.validity  =  "DAY";

              if ( avg1  ==  0 ) { 
                price  =  0;
               }  else { 
                price  =  Math.round( avg1 * 10 ) / 10;
               } 

              order.params.price  =  price;
              this.orders.push( order );

              console.log( 
                "-low-order",
                order.params.tradingsymbol,
                order.params.price,
                order.params.quantity
               );
              ///yester day closing
              order  =  {  } ;
              order.tag  =  this.strategyType;
              order.variety  =  'regular'
              order.params  =  {  } ;
              order.params.exchange  =  "NSE";
              // order.params.tradingsymbol  = 
              //   longbuildup.instrument_token.tradingsymbol;
                
                 order.params.tradingsymbol  = 
              longbuildup.symbol;


              order.params.transaction_type  =  "BUY";
              let avg2  =  0;
              if ( typeof longbuildup.ohlc  ==  "undefined" ) { 
                avg2  =  0;
               }  else { 
                avg2  =  parseFloat( longbuildup.ohlc.ohlc.close );
               } 
              order.params.quantity  =  Math.round( 
                this.amountPerShare / ( avg2 * 5 )
               );
              order.params.product  =  "CNC";
              // order.params.product  =  this.selectedProduct;
              order.params.order_type  =  "LIMIT";
              order.params.validity  =  "DAY";
              if ( avg2  ==  0 ) { 
                price  =  0;
               }  else { 
                price  =  Math.round( avg2 * 10 ) / 10;
               } 

              // console.log( 'qty',price,this.amountPerShare/avg2 )
              order.params.price  =  price;
              this.orders.push( order );
              console.log( 
                "closing-order",
                order.params.tradingsymbol,
                order.params.price,
                order.params.quantity
               );
              ///today open
              order  =  {  } ;
              order.tag  =  this.strategyType;
              order.variety  =  'regular'
              order.params  =  {  } ;
              order.params.exchange  =  "NSE";
              // order.params.tradingsymbol  = 
              //   longbuildup.instrument_token.tradingsymbol;

                   order.params.tradingsymbol  = 
              longbuildup.symbol;


              order.params.transaction_type  =  "BUY";
              let avg3  =  0;
              if ( typeof longbuildup.ohlc  ==  "undefined" ) { 
                avg3  =  0;
               }  else { 
                avg3  =  parseFloat( longbuildup.ohlc.ohlc.open );
               } 
              order.params.quantity  =  Math.round( 
                this.amountPerShare / ( avg3 * 5 )
               );
              order.params.product  =  "CNC";
              // order.params.product  =  this.selectedProduct;
              order.params.order_type  =  "LIMIT";
              order.params.validity  =  "DAY";
              if ( avg3  ==  0 ) { 
                price  =  0;
               }  else { 
                price  =  Math.round( avg3 * 10 ) / 10;
               } 

              // console.log( 'qty',price,this.amountPerShare/avg3 )
              order.params.price  =  price;
              this.orders.push( order );
              console.log( 
                "open-order",
                order.params.tradingsymbol,
                order.params.price,
                order.params.quantity
               );

              ///average
              order  =  {  } ;
              order.tag  =  this.strategyType;
              order.variety  =  'regular'
              order.params  =  {  } ;
              order.params.exchange  =  "NSE";
              // order.params.tradingsymbol  = 
              //   longbuildup.instrument_token.tradingsymbol;

                   order.params.tradingsymbol  = 
              longbuildup.symbol;
              order.params.transaction_type  =  "BUY";
              let avg4  =  0;
              if ( typeof longbuildup.ohlc  ==  "undefined" ) { 
                avg4  =  0;
               }  else { 
                avg4  = 
                  parseFloat( 
                    longbuildup.ohlc.ohlc.open +
                      longbuildup.ohlc.ohlc.high +
                      longbuildup.ohlc.ohlc.low +
                      longbuildup.ohlc.ohlc.close
                   ) / 4;
               } 
              order.params.quantity  =  Math.round( 
                this.amountPerShare / ( avg4 * 5 )
               );
              order.params.product  =  "CNC";
              // order.params.product  =  this.selectedProduct;
              order.params.order_type  =  "LIMIT";
              order.params.validity  =  "DAY";
              if ( avg4  ==  0 ) { 
                price  =  0;
               }  else { 
                price  =  Math.round( avg4 * 10 ) / 10;
               } 

              // console.log( 'qty',price,this.amountPerShare/avg3 )
              order.params.price  =  price;
              this.orders.push( order );

              /// last price
              order  =  {  } ;
              order.tag  =  this.strategyType;
              order.variety  =  'regular'
              order.params  =  {  } ;
              order.params.exchange  =  "NSE";
              // order.params.tradingsymbol  = 
              //   longbuildup.instrument_token.tradingsymbol;

                 order.params.tradingsymbol  = 
              longbuildup.symbol;
              order.params.transaction_type  =  "BUY";
              let avg5  =  0;
              if ( typeof longbuildup.ohlc  ==  "undefined" ) { 
                avg5  =  0;
               }  else { 
               
               
              //  avg5  =  parseFloat( longbuildup.ohlc.last_price );

              //last price replaced by ohlc avg
               avg5  =  

                parseFloat( 
                    longbuildup.ohlc.ohlc.open +
                      longbuildup.ohlc.ohlc.high +
                      longbuildup.ohlc.ohlc.low +
                      longbuildup.ohlc.ohlc.close
                   ) / 4;
             
             
             
              } 
              order.params.quantity  =  Math.round( 
                this.amountPerShare / ( avg5 * 5 )
               );
              order.params.product  =  "CNC";
              // order.params.product  =  this.selectedProduct;
              order.params.order_type  =  "LIMIT";
              order.params.validity  =  "DAY";
              if ( avg5  ==  0 ) { 
                price  =  0;
               }  else { 
                price  =  Math.round( avg5 * 10 ) / 10;
               } 

              // console.log( 'qty',price,this.amountPerShare/avg3 )
              order.params.price  =  price;
              this.orders.push( order );

              console.log( 
                "avg-order-last price",
                order.params.tradingsymbol,
                order.params.price,
                order.params.quantity
               );
             } 
           }  );

          ///avg price

          //ltp

          break;
       } 
     } ,

    PlaceOrderOnSelectedBuyingMethod(  ) { 
      const url  =  "/api/PlaceTarget";
      let data1  =  JSON.stringify( this.orders );

      let data  =  {  } ;

      data.accessToken  =  this.accessToken;
      data.sessionString  =  JSON.stringify( this.session );
      data.ZerodhaParams  =  data1;

      console.log( data,'data' );
      axios.post( url, data ).then(( res )  => { 
        // this.selectedBuyingMethod  =  ''
       // this.selectedBuyingMethod  =  [];
        // this.$router.push( "/orders" )
       }  );
     } ,
    PlaceBuyLongBuldUp(  ) { 
      ////////////////////////////place sl

      const url  =  "/api/PlaceTarget";

      //    alert( this.selectedVariety );

      if ( typeof this.selectedVariety  ==  "undefined" ) { 
        this.selectedVariety  =  "regular";
       } 

      let map  =  this.StrategicStocks.map(( longbuildup )  => { 
        if ( 
          longbuildup.symbol  ==  "" ||
          longbuildup.selected  ==  false ||
          typeof longbuildup.instrument_token  ==  "undefined"
         ) { 
          return {  } ;
         } 

        let order  =  {  } ;
        if ( true ) { 
          order.tag  =  this.strategyType;
          order.variety  =  'regular'
          order.params  =  {  } ;
          order.params.exchange  =  "NSE";

          order.params.tradingsymbol  = 
            longbuildup.instrument_token.tradingsymbol;


order.params.tradingsymbol =  longbuildup.symbol;
           

          order.params.transaction_type  =  "BUY";

          // let total_quantity = ( longbuildup.quantity+longbuildup.t1_quantity );
          // let disclosed_quantity = Math.ceil( total_quantity/10 )

          // let total_quantity = 1;

          // order.params.quantity = ( longbuildup.quantity+longbuildup.t1_quantity );
          // order.params.quantity = Math.round( this.amountPerShare/longbuildup.avg );

          // let avg = parseFloat( longbuildup.avg );
          // let avg = parseFloat( longbuildup.price );

          // this.calculatePricesAndQuantityAsPerBuyingMethod( longbuildup.ohlc.ohlc )

          // return false;

          let avg  =  0;

          if ( typeof longbuildup.ohlc  ==  "undefined" ) { 
            avg  =  0;
           }  else { 
            avg  =  parseFloat( longbuildup.ohlc.ohlc.low );
           } 

          // console.log( 'longbuildup ohlc',longbuildup.ohlc.ohlc.low );

          order.params.quantity  =  Math.round( this.amountPerShare / avg );

          // order.params.disclosed_quantity = disclosed_quantity;
          // order.params.disclosed_quantity = 1;

          order.params.product  =  "CNC";
          // order.params.product  =  this.selectedProduct;
          order.params.order_type  =  "LIMIT";
          order.params.validity  =  "DAY";
          // order.params.trigger_price = longbuildup.targetSlYestLowSl;

          let price  =  Math.round( avg * 10 ) / 10;

          console.log( "qty", price, this.amountPerShare / avg );

          order.params.price  =  price;
         } 

        return order;
       }  );

      let data1  =  JSON.stringify( map );

      let data  =  {  } ;

      data.accessToken  =  this.accessToken;
      data.sessionString  =  JSON.stringify( this.session );
      data.ZerodhaParams  =  data1;
      // return false;
      console.log( "mapy", data ); //return false;

      axios.post( url, data ).then(( res )  => { 
        this.selectedBuyingMethod  =  '';
        // this.$router.push( "/orders" )
       }  );
      ////////////////////////////place sl
     } ,

    getOHLC( accessToken ) { 
      let arr  =  JSON.stringify( this.returnedSymbolsForOHLC );
      let url  =  "/api/getOHLC/symbols/" + arr + "/accessToken/" + accessToken;


      let url2 = "/api/postOHLC";
      let ob = {  } ;
      ob.symbols = arr;
      ob.accessToken = this.accessToken;

      axios.post( url2,ob ).then(( res )  => { 
        // console.log( "ohlc fired", this.returnedSymbolsForOHLC );
        // res.data.forEach( ohlc =>{ 

        //   ( ohlc.ohlc.close+ohlc.ohlc.open+ohlc.ohlc.high+ohlc.ohlc.low )/4
        //  }  )


// console.log( res.data,'res.data' );

// return ;
        this.Ohlc  =  res.data;

      
// console.log( 'strat stocks',this.Ohlc,'this.Ohlc' )

// return ;
        this.StrategicStocks.forEach(( s )  => { 
          // console.log( "s.exchange", s );

// return false
          

          // s.ohlc  =  this.Ohlc["NSE:" + s.symbol];

            // console.log( "this.phlc",'s.symbol',s.symbol, this.Ohlc["NSE:" + s.symbol] );

          this.$set( s,'ohlc',this.Ohlc["NSE:" + s.symbol] )

          //let w = `https://kite.zerodha.com/chart/ext/ciq/${ s.instrument_token.exchange } /${ s.symbol } /${ s.instrument_token.instrument_token } /`;
let w = 'w';
          // this.$set( s,'website',w )

          // console.log( "s.ohlc", 'ohlc',this.Ohlc["NSE:" + s.symbol] );;
         }  );
   
   
   this.calculatePricesAndQuantityAsPerBuyingMethod(  )
    }  );


     } ,

   async  getStrategy(  ) { 
      this.loadingContent  =  true;
      this.noData  =  false;

      let accessToken  =  this.accessToken;
      const url  = 
        "/api/getStrategy" + this.strategyType + "/accessToken/" + accessToken;

      // alert( accessToken );

      
    let t = await   axios
        .get( url )
        .then(( res )  => { 
          this.StrategicStocks  =  res.data;

          if ( this.StrategicStocks.length  ==  0 ) { 
            return false;
           } 
console.log( this.StrategicStocks,'this.StrategicStocks.' );



          this.numberOfShares  =  this.StrategicStocks.length;

          this.returnedSymbolsForOHLC  =  this.StrategicStocks.map(( s )  => { 
            if ( false )
            // if ( typeof s.instrument_token  ==  "undefined" )
            
            { 
              return "NSE:";
             }  else { 
              return "NSE:" + s.symbol;
             } 
            // console.log( s.instrument_token.tradingsymbol )
           }  );

          // console.log( this.StrategicStocks );
          this.loadingContent  =  false;

          if ( this.StrategicStocks.length  ==  0 ) { 
            this.noData  =  true;
           } 

          return this.returnedSymbolsForOHLC;
         }  )


        //  .then(( r )  => { 
        //   this.getOHLC( accessToken );
        //  }  );

console.log( t,'t' )
        this.getOHLC( accessToken );
       
     } ,
   } ,
 } ;
</script>

<style scoped>
</style>