<template>
    <div>
<!-- {{longBuildUps}} -->

<v-chip>Long Build ups {{longBuildUps.length}} </v-chip>



<div class="loading" v-if="loadingContent">



  <div>
   
    <v-progress-linear
      indeterminate
      color="green"
    ></v-progress-linear>
    <br>
    
  </div>

<!-- loading... {{holdingLength}} -->
</div>

<div class="nodata" v-if="noData">


    <v-alert
      color="green"
      dark
      dense
      icon="mdi-school"
      prominent
    >
    No Long Build Up Found
    </v-alert>
</div>


<div v-if="!loadingContent">
{{amountPerShare}}
        <v-row>
          <v-col cols=4>
<v-btn v-if="selectedVariety!=''" color="primary" @click="PlaceBuyLongBuldUp()">
    <v-icon>mdi-arrow-down</v-icon> Buy Long Build Up  
</v-btn>
</v-col>

<v-col  cols=4>
<select name="" id="" class="form-control" v-model="selectedVariety">
    <option v-for="(variety,index) in varieties" :key="index">
{{variety.text}}

    </option>
</select>
       </v-col> 

       <v-col>
<div class="form-group">
  <label for="">Amount Per share</label>
  <input type="text" class="form-control" v-model="amountPerShare">
</div>

       </v-col>

       <v-col  >
        <div class="form-group">
        <label for="">Select Buying Method</label>
      <select name="" id="" class="form-control" v-model="selectedBuyingMethod" @change="calculatePricesAndQuantityAsPerBuyingMethod()">
          <option v-for="(BuyingMethod,index) in BuyingMethods" :key="index" :value="BuyingMethod.id">
      {{BuyingMethod.text}}
      
          </option>
      </select>
      </div>
             </v-col> 
       
       </v-row>   
       <v-row>
            <v-col cols=12>
            <template>
  <v-card>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="longBuildUps"
      :search="search"
      class="elevation-1"
    >


     <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Buy Orders CNC</v-toolbar-title>
        <v-spacer></v-spacer>

      </v-toolbar>

      
    </template>

     <template v-slot:item.selected="{ item }">
        <v-simple-checkbox
          v-model="item.selected"
         
        ></v-simple-checkbox>
      </template>
    
    
    </v-data-table>
  </v-card>
</template>

</v-col>
</v-row>
</div>
    </div>
</template>

<script>
import axios from 'axios'
  import sessionMixin from '@/views/sessionMixin';
    export default {

        computed:{

headers1(){

return [];
//     let ob1=this.longBuildUps;

//     console.log('ob1',ob1);
//     return [];
//     return false;
// let keys=Object.keys(ob1);

// let h=key.map(k=>{

// let ob={};
// ob.text=k.toUpperCase();
// ob.value=k
    
// })
// return h;

},
        },

        data(){
return{

  BuyingMethods:[

{
  'id':-1,
  'text': 'Select'


},
{
  'id':1,
  'text': 'Three point Buying'


}
],
selectedBuyingMethod:'',
  loadingContent:true,
amountPerShare:0,
                varieties:[
{
    'text':'amo'
},
{
    'text':'bo'
},
{
    'text':'co'
},
{
    'text':'regular'
},],
  headers: [
          {
            text: '#',
            align: 'start',
            filterable: false,
            value: 'name',
          },
          { text: 'Symbol ()', value: 'symbol' },
          { text: 'EXPIRY', value: 'expiry' },
          { text: 'LTP', value: 'ltp' },
           { text: 'CHANGE', value: 'change' },
           { text: 'CHANGEpc', value: 'changePc' },
          { text: 'HIGH', value: 'high' },
          { text: 'LOW', value: 'low' },
         
          { text: 'avg', value: 'avg' },
          
          { text: 'oiPc', value: 'oiPc' },
         
          { text: 'volPc', value: 'volPc' },
          { text: 'Selected', value: 'selected' },
        ],

        // { text: 'oi', value: 'oi' },
        //  { text: 'vol', value: 'vol' },
search:'',
    longBuildUps:[],
    selectedVariety:'',
    noData:false,
}

        },
        name:"LongBuildUp",
         mixins:[sessionMixin],
              mounted(){

this.getLongBuldUps();
        },
           methods:{
            calculatePricesAndQuantityAsPerBuyingMethod(){
switch(this.selectedBuyingMethod){
case 1:
this.orders=[];
  ///lowpriceand avg
// let arry=[]
this.StrategicStocks.forEach(

longbuildup=>{
let test=longbuildup.symbol=='' || longbuildup.selected==false || (typeof(longbuildup.instrument_token) == "undefined");


if(!test){
  let price;

///low
                let order={};
                order.tag=this.strategyType;
                order.variety=this.selectedVariety;
                order.params={};
                order.params.exchange='NSE'
                order.params.tradingsymbol=longbuildup.instrument_token.tradingsymbol;
                order.params.transaction_type='BUY'; 
                let avg1=0;
                if (typeof(longbuildup.ohlc) == "undefined"){
                avg1=0;
                }else{
                avg1=parseFloat(longbuildup.ohlc.ohlc.low);

                }
                order.params.quantity=Math.round(this.amountPerShare/(avg1*3));
                order.params.product='CNC';
                order.params.order_type='LIMIT';
                order.params.validity='DAY';

                if(avg1==0){

                  price=0
                }else{
 price=Math.round(avg1 * 10) / 10;

                }
              
                order.params.price=price;
              this.orders.push(order)

 console.log('-low-order',order.params.tradingsymbol,order.params.price,order.params.quantity)
///closing
                 order={};
                order.tag=this.strategyType;
                order.variety=this.selectedVariety;
                order.params={};
                order.params.exchange='NSE'
                order.params.tradingsymbol=longbuildup.instrument_token.tradingsymbol;
                order.params.transaction_type='BUY'; 
                let avg2=0;
                if (typeof(longbuildup.ohlc) == "undefined"){
                avg2=0;
                }else{
                avg2=parseFloat(longbuildup.ohlc.ohlc.close);

                }
                order.params.quantity=Math.round(this.amountPerShare/(avg2*3));
                order.params.product='CNC';
                order.params.order_type='LIMIT';
                order.params.validity='DAY';
                    if(avg2==0){

                  price=0
                }else{
 price=Math.round(avg2 * 10) / 10;

                }
              
                // console.log('qty',price,this.amountPerShare/avg2)
                order.params.price=price;
              this.orders.push(order)
               console.log('closing-order',order.params.tradingsymbol,order.params.price,order.params.quantity)
///open
                 order={};
                order.tag=this.strategyType;
                order.variety=this.selectedVariety;
                order.params={};
                order.params.exchange='NSE'
                order.params.tradingsymbol=longbuildup.instrument_token.tradingsymbol;
                order.params.transaction_type='BUY'; 
                let avg3=0;
                if (typeof(longbuildup.ohlc) == "undefined"){
                avg3=0;
                }else{
                avg3=parseFloat(longbuildup.ohlc.ohlc.open);

                }
                order.params.quantity=Math.round(this.amountPerShare/(avg3*3));
                order.params.product='CNC';
                order.params.order_type='LIMIT';
                order.params.validity='DAY';
                   if(avg3==0){

                  price=0
                }else{
 price=Math.round(avg3 * 10) / 10;

                }
              
                // console.log('qty',price,this.amountPerShare/avg3)
                order.params.price=price;
              this.orders.push(order)
                             console.log('open-order',order.params.tradingsymbol,order.params.price,order.params.quantity)

///average
                 order={};
                order.tag=this.strategyType;
                order.variety=this.selectedVariety;
                order.params={};
                order.params.exchange='NSE'
                order.params.tradingsymbol=longbuildup.instrument_token.tradingsymbol;
                order.params.transaction_type='BUY'; 
                let avg4=0;
                if (typeof(longbuildup.ohlc) == "undefined"){
                avg4=0;
                }else{
              avg4=parseFloat(longbuildup.ohlc.ohlc.open+longbuildup.ohlc.ohlc.high+longbuildup.ohlc.ohlc.low+longbuildup.ohlc.ohlc.close)/4;

                }
                order.params.quantity=Math.round(this.amountPerShare/(avg4*3));
                order.params.product='CNC';
                order.params.order_type='LIMIT';
                order.params.validity='DAY';
                   if(avg4==0){

                  price=0
                }else{
 price=Math.round(avg4 * 10) / 10;

                }
              
                // console.log('qty',price,this.amountPerShare/avg3)
                order.params.price=price;
              this.orders.push(order)


              ///average
                 order={};
                order.tag=this.strategyType;
                order.variety=this.selectedVariety;
                order.params={};
                order.params.exchange='NSE'
                order.params.tradingsymbol=longbuildup.instrument_token.tradingsymbol;
                order.params.transaction_type='BUY'; 
                let avg5=0;
                if (typeof(longbuildup.ohlc) == "undefined"){
                avg5=0;
                }else{
              avg5=parseFloat(longbuildup.ohlc.last_price);

                }
                order.params.quantity=Math.round(this.amountPerShare/(avg5*3));
                order.params.product='CNC';
                order.params.order_type='LIMIT';
                order.params.validity='DAY';
                   if(avg5==0){

                  price=0
                }else{
 price=Math.round(avg5* 10) / 10;

                }
              
                // console.log('qty',price,this.amountPerShare/avg3)
                order.params.price=price;
              this.orders.push(order)

              



               console.log('avg-order-last price',order.params.tradingsymbol,order.params.price,order.params.quantity)

}
})

  ///avg price


  //ltp

  break;



}


             },

            PlaceOrderOnSelectedBuyingMethod(){
                  const url="/api/PlaceTarget";
                  let data1=JSON.stringify(this.orders); 

                  let data={};

                  data.accessToken=this.accessToken;
                  data.sessionString=JSON.stringify(this.session);
                  data.ZerodhaParams=data1;
                axios.post(url,data).then(
                            res=>{
                              this.selectedBuyingMethod=[]
                                // this.$router.push("/orders")
                            }               )

             },
PlaceBuyLongBuldUp(){

////////////////////////////place sl

           const url="/api/PlaceTarget";

        //    alert(this.selectedVariety);

          if(typeof(this.selectedVariety)=='undefined'){

              this.selectedVariety='regular';
          }   

let map=this.longBuildUps.map(longbuildup=>{

if(longbuildup.symbol=='' || longbuildup.selected==false){

  return {};
}


let order={};
if(true){

order.variety=this.selectedVariety;
order.params={};
order.params.exchange='NSE'

// console.log('ongbuildup.instrument_token.tradingsymbol',longbuildup)
order.params.tradingsymbol=longbuildup.instrument_token.tradingsymbol;

order.params.transaction_type='BUY';


// let total_quantity=(longbuildup.quantity+longbuildup.t1_quantity);
// let disclosed_quantity=Math.ceil(total_quantity/10)

// let total_quantity=1;



// order.params.quantity=(longbuildup.quantity+longbuildup.t1_quantity);
// order.params.quantity=Math.round(this.amountPerShare/longbuildup.avg);


let avg=parseFloat(longbuildup.avg);

order.params.quantity=Math.round(this.amountPerShare/avg);
order.tag='LONG BUILDUP';

// order.params.disclosed_quantity=disclosed_quantity;
// order.params.disclosed_quantity=1;


order.params.product='CNC';
order.params.order_type='LIMIT';
order.params.validity='DAY';
// order.params.trigger_price=longbuildup.targetSlYestLowSl;

let price=Math.round(avg * 10) / 10;

console.log('qty',price,this.amountPerShare/avg)

order.params.price=price;
}



return order

});

let data1=JSON.stringify(map); 

let data={};

data.accessToken=this.accessToken;
data.ZerodhaParams=data1;
data.sessionString=JSON.stringify(this.session);
// return false;
console.log('mapy',data); //return false;

                axios.post(url,data).then(
res=>{

    console.log('result')

    // this.$router.push("/orders")
}

                )
////////////////////////////place sl


            },
            getOHLC(accessToken){


let arr=JSON.stringify(this.returnedSymbolsForOHLC)
let url="/api/getOHLC/symbols/"+ arr+'/accessToken/'+accessToken;
 axios.get(url).then(res => {
console.log('ohlc fired',this.returnedSymbolsForOHLC)
// res.data.forEach(ohlc=>{

//   (ohlc.ohlc.close+ohlc.ohlc.open+ohlc.ohlc.high+ohlc.ohlc.low)/4
// })

   this.Ohlc=res.data;

   console.log('this.phlc',this.Ohlc)



    this.StrategicStocks.forEach(s=>{

s.ohlc=this.Ohlc['NSE:'+s.symbol]

    })

 



 });

},



               getLongBuldUps(){
                 this.loadingContent=true;
                 this.noData=false;
const url = '/api/longBuildUp';
        axios.get(url).then(res => {

            
          this.longBuildUps = res.data
           this.loadingContent=false;

           if(this.longBuildUps.length==0){
             this.noData=true;
           }
          
       

        })

               }
    }
    }
</script>

<style scoped>

</style>