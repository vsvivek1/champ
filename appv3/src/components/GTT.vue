<template>
    <div>
<!-- {{ CurrentGttList }} CurrentGttList -->

<!-- {{ CurrentGttSymbols }} -->

Showing {{stocksPricePointsFiltered.length  }}

<button @click = "deleteGTT( 1 )">Delete GTT</button>

    <input type = "text" v-model ="gttAmountPerManualOrder" name = "" id = "" class = "form-control">

    <v-chip>Total {{ stocksPricePointsFiltered.length }} </v-chip>   

     <button :color="'green'" 
     :loading = "getStockPricePointsLoader"
     @click = "getStockPricePoints(  )">GET GTT </button>
     
    <table
    v-if = "stocksPricePointsFiltered.length"
    class = "table table-bordered table-hover table-stripped">
    <thead>
        <th>#</th>
        <th>Script</th>
        <th>pC</th>
        <th>yday candle low</th>
        <th></th>
    </thead>
    <tbody>
        <tr v-for = "( stockPpItem,index ) in stocksPricePointsFiltered" :key = "index">
            <td>{{ index+1 }} </td>
            <td>
                {{ stockPpItem.tradingsymbol }} 
            <span class = "text-primary" v-if = "typeof stockPpItem.group!= 'undefined' ">{{ stockPpItem.group }} </span>
            <a target = "_blank" :href = "stockPpItem.chart">
            <hr>
            {{ stockPpItem.tradingsymbol }} </a> <hr>
            <span>{{ stockPpItem.last_price }}</span>
            
<span v-if = "typeof stockPpItem.gttData!== 'undefined' ">
            <b class = "bg-success" 
            
            v-if = "stockPpItem.gttData!= 'NO_GTT_PRESENT'">

            GTT @ {{ stockPpItem.gttData.condition.trigger_values[0] }} 
            <button @click = "deleteGTT( stockPpItem.gttData.id )"> <span color = "red">mdi-cancel</span></button>


            </b>
        </span>
            <span v-else>
                <!-- NO_GTT_PRESENT -->

            </span>

            </td>
            <!-- <td>{{ stockPpItem.profitPc }} </td> -->


           <!--  //stockPpItem[index].pricePoints.level
                   // .pricePoints.level-stockPpItem[index-1].pricePoints.leve -->l
            <td class = "text-left">
                

                
                    <b 
                    
                    
                    
                    style = "display:inline" :key = "index" :class = "{ 'bg-success': 
                    l.support,'text-default':!l.support,'text-left':true  } "


                    v-for = "( l,index ) in stockPpItem.supportLevels">
                  
                    <button class="my-btn"
                   @click = "PlaceGttOrderForThisPrice( stockPpItem,l.level )"
                   >{{ l.level }} 


        Diff=           
<b



v-if="index>0  && (stockPpItem.supportLevels[index].level-stockPpItem.supportLevels[index-1].level)*100/stockPpItem.supportLevels[index].level">SUP</b>
                   <b v-if = "typeof stockPpItem.pricePoints!== 'undefined' ">


                   ( {{ 

                    getPercentage( stockPpItem,l.level )
                  
                    
                    
                     }}  ) %
                  
                  
                     </b>
                   </button>  ,
                    
                    </b>
               
                {{ 
                
                
                 }} 
                
                </td>
            <td>


{{ stockPpItem.last_price }} 

            </td>
        </tr>
    </tbody>
</table>


    </div>
</template>

<script>
import sessionMixin from "@/views/sessionMixin";
import {  io  }  from "socket.io-client";
import axios from "axios";

import PlaceGttOrderForThisPrice  from './PlaceGttOrderForThisPrice';



export const socket  =  io( "http://localhost:4000" );




    export default { 

        mounted(){ 
            this.getGTTS()

         } ,

        computed:{ 

stocksPricePointsFiltered(  ){ 
return this.stocksPricePoints.filter( r =>{ 
    
 try{ 

if( r.pricePoints.pricePoints.length == 0 )
{ 

    return false
 } else{ 

    return true
 } 

  }  catch( error ){ 

    return false;
  } 
    
    
    
     } 
    
    
    
     )

 } ,

upperShadowGreaterThanBody(  ){ 
return this.stocksPricePoints.filter( r =>{ 
    
 try{ 

if( r.otherCriteria.upperShadow>r.otherCriteria.body )
{ 

    return true
 } else{ 

    return false
 } 

  }  catch( error ){ 

    return false;
  } 
    
    
    
     } 
    
    
    
     ).length

 } ,



reds(  ){ 
    // return 1
return this.stocksPricePoints.filter( r =>{ 
    
 try{ 

if( r.otherCriteria.candleColor == 'red' )
{ 

    return true
 } else{ 

    return false
 } 

  }  catch( error ){ 

    return false;
  } 
    
    
    
     } 
    
    
    
     ).length

 } ,greens(  ){ 

    // return 1



return  this.stocksPricePoints.filter( r =>{ 
    
     try{ 

if( r.otherCriteria.candleColor == 'green' )
{ 

    return true
 } else{ 

    return false
 } 

  }  catch( error ){ 

    return false;
  } 

 } 
    
     ).length

 } 

         } ,

         mixins: [sessionMixin],
data(  ){ 

    return { 
        CurrentGttSymbols:[],
        CurrentGttList:[],
        gttAmountPerManualOrder:100000,
        CurrentTick:[],
        instrumentTokens:[],
        getStockPricePointsLoader:false,
stocksPricePoints:[],
loserList:[]

     } 
 }  ,
        methods:{ 

            deleteGTT( trigger_id ){ 
                axios.defaults.headers.common  =  { 'Authorization': `bearer ${ this.accessToken } ` } 
                let url = "/api/deleteGTT/"+trigger_id;

                axios.delete( url ).then( r =>{ 


                    console.log( r,'gtt has been deleted' )
                 }  )

             } ,

            getPercentage( stockPpItem,level ){ 
  try {                   
                         return( 
                                                     ( stockPpItem.pricePoints.yesterday.close-level )*
                         -100/stockPpItem.pricePoints.yesterday.close ).toFixed( 0 )
                     } 
                    catch( e ){ 

                       return e;
                     } 

             } ,

            getGTTS( ){ 
                let ob = {  } ;



ob.accessToken = this.accessToken;
let url = "/api/getGTTs";
axios.post( url,ob ).then( r =>{ 

//console.log( r.data,'gtts' )
    
this.CurrentGttList = r.data;

this.CurrentGttSymbols=this.CurrentGttList.map(r=>r.condition.tradingsymbol);

/* this.stocksPricePoints.forEach( e =>{ 


    console.log( 'e.instrument_token',e.instrument_token )
let ln =  r.data.
        filter( r =>r.condition.instrument_token == e.instrument_token )

        // console.log( ln,'gtt' )
   
if( 
    this.CurrentGttList.
        filter( r =>e.instrument_token == r.condition.instrument_token ).length>0

 ){ 

    console.log( 'if' )
    this.$set( 

       e,
'gttData',

this.CurrentGttList.
        filter( r =>e.instrument_token == r.condition.instrument_token )[0]
     )

 } else{ 

    // console.log( 'else' )
    this.$set( 
       e
        
        
        ,'gttData',

        'NO_GTT_PRESENT'

     )

 } 




 } 
 
 ); */
    
 }  );


             } ,

             PlaceGttOrderForThisPrice( stockPpItem,level){

PlaceGttOrderForThisPrice(stockPpItem,level,this.gttAmountPerManualOrder,this.accessToken)

             } ,


            mutateWithLtp( s ){ 

                
s.forEach( s1 =>{ 

    if(typeof s1 =='undefined'|| typeof s1.last_price=='undefined') return

let instrument_token = s1.instrument_token;

this.stocksPricePoints.filter( sp =>sp.instrument_token == instrument_token )[0].last_price = s1.last_price

 }  )
// console.log( s )
             } ,

startSockets(  ){ 
socket.emit( "subscribe-GTT", JSON.stringify( this.instrumentTokens ));
// console.log( this.instrumentTokens,'i' );


    socket.on( "send-GTT", ( s )  => { 
      this.mutateWithLtp( s );

      this.CurrentTick  =  s;
     }  );


 } ,


            getLevels( stockPpItem ){ 

let ar = stockPpItem.pricePoints.pricePoints;




if (
    !stockPpItem.pricePoints ||
    !stockPpItem.pricePoints.d1 ||
    typeof stockPpItem.pricePoints.d1.close === 'undefined'
  ) {
    return false;
  }




let refPrice = stockPpItem.pricePoints.d1.close;

return ar.map( r =>r.high || r.level
 ).sort(( a,b ) =>a-b ) 
  .map(( r,index,ar ) =>{ 



if( typeof ar[index+1] == 'undefined' ){ 


 let ob = {  } 
 ob.level = r;
ob.support = false;

return ob

 } else{ 
// upperlevelCheck = refPrice<= ar[index+1]

if( ar[index-1]<= refPrice && ar[index+1]>= refPrice && ar[index]<= refPrice ){ 

 let ob = {  } 
 ob.level = r;
ob.support = true;

return ob;

 } else{ 
 let ob = {  } 
 ob.level = r;
ob.support = false;

return ob;
 } 
 } 
 }  )



             } ,

            getStockPricePoints(  ){ 


                this.getStockPricePointsLoader = true
let url = "/api/GTT"
let ob = {  } ;
ob.accessToken = this.accessToken;


axios.post( url,ob ).then(  ( r )  => { 

console.log(r,'r');
    r.data.forEach( r1 =>{ 
let a = this.getLevels( r1 );
r1.supportLevels = a;

     }  )
    this.stocksPricePoints = r.data.filter(r=>!this.CurrentGttSymbols.includes(r.tradingsymbol));

    this.instrumentTokens = this.stocksPricePoints.map( r =>parseInt( r.instrument_token ))
    
this.getStockPricePointsLoader = false;

this.startSockets(  )

// this.getGTTS(  )
    // console.log( r.data,'r.data' )
    // . 
    // sort(( a,b ) =>b.profitPc-a.profitPc )
    
    // this.loserList = r.data.losers.
    
    // sort(( a,b ) =>b.loserPc-a.loserPc )
 } 
     )
             } ,
        
        
     } ,
    name:'GTT'
     } 
</script>

<style lang = "scss" scoped>

td{ 

    max-width:100%;
//white-space:nowrap;
 } 
 .overflow-cell {
  /* Remove any height constraints to allow the cell to expand vertically */
  white-space: normal; /* Allow content to wrap to multiple lines */
}

.my-btn {
  margin: 10px;
}

</style>