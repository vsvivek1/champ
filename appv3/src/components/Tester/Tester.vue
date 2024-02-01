<template>
    <div>

  <!-- {{  shortCovering  }}  -->

      <!-- {{  scriptsWithCondition  }}  -->
        <!-- <h2> total scritps {{ scriptsWithCondition.length }} scriptsWithCondition. gain  {{  scriptsWithConditionGain  }} </h2> -->
    
    
    
    
        <!-- <h2> total scritps {{ scriptsWithCondition.length }} scriptsWithCondition. gain  {{  scriptsWithConditionGain  }} </h2> -->

        <!-- <h1>Gain ratio {{  gainRatio  }} </h1>
        <vue-good-table :columns = "columns" 
        
        :rows = "scriptsWithCondition" :paginate = "true" :lineNumbers = "true" /> -->


<!-- {{  winners  }}  -->

<!-- totalGain {{  totalGain  }}  -->
<hr>

<!-- inverstiment {{  investment }}  -->

<!-- count {{  count }}  -->


{{  winners  }} 

        <table>
          <tr v-for = "( win,index ) in winners1" :key = "index">
            <td>
{{  index+1  }} 

            </td>

            <td>

              {{  win.pricePoints.d2.normalDate  }} 
            </td>

            <td>

            d2 volume  {{  win.pricePoints.d2.volume  }}  
            d0 volume {{  win.volume  }} 

            voloume up {{  win.volume >win.pricePoints.d2.volume  }} 


            </td>

            <td>

              d2 close{{  win.pricePoints.d2.close  }} 
              d2 open{{  win.pricePoints.d2.open  }} 
              d2 date{{  win.pricePoints.d2.normalDate  }} 
            </td>
            <td>

              <a v-bind:style = "{  color: linkColor  } " v-on:click = "changeColor"
              
              :href = "win.chart" target = "_blank">{{  win.tradingsymbol  }} </a>
              
            </td>
            
            <td>

              <a v-bind:style = "{  color: linkColor  } " v-on:click = "changeColor"
              
               :href = "win.stockChart" target = "_blank">{{ win.name   }} </a>
              
            </td>

            <td>
              {{  win.closeTimes  }}  close times
            </td>
            
            <td>
              {{  win.highTimes  }}  times of yday high
            </td>

            <td>

              {{  win.highestpc  }}  hi pc 
            </td>
            <td>

              {{  win.ohlc.close  }}  close

            </td>  
            
            <td>

              {{  win.ohlc.open  }}  open

            </td><td>

              {{  win.ohlc.high  }}  high

            </td>
            <td>
              {{  win.last_price  }}  lp


            </td>


            <td>

{{  ( win.last_price-win.cis.pricePoints.d0.high )*win.lot_size  }} 

            </td>
          </tr>
        </table>

    </div>
</template>

<script>
import sessionMixin from "@/views/sessionMixin";
import {  VueGoodTable  }  from 'vue-good-table';
import 'vue-good-table/dist/vue-good-table.css';

import {  io  }  from "socket.io-client";
const socket  =  io( "http://127.0.0.1:4000"

,
{ 
    transports: ['websocket'],

 } 
 );


var instruments;

var instrumentsAll;


      




    export default { 

        computed:{ 

count(  ){ 


  return this.winners1.length;

 } ,


          investment(  ){ 


            // let count;
            return     this.winners1.reduce(( prv,cur,index ) =>{ 

            // console.log( cur.pricePoints.d1.high,index )

return prv+( cur.pricePoints.d1.high )*cur.lot_size

             } ,0 )

           } ,

          totalGain(  ){ 

            if( this.winners.length == 0 ){ 

              return 0
             } 
        return     this.winners1.reduce(( prv,cur ) =>{ 

return prv+cur.gain

             } ,0 )

           } ,
          winners1(  ){ 

            return this.winners//.sort(( a,b ) =>b.gain-a.gain )//.filter( win =>win.volume >win.pricePoints.d2.volume )


           } ,
            gainRatio(  ) { 
    const numObjects  =  this.scriptsWithCondition.length;
    const numGains  =  this.scriptsWithCondition.filter( object  => object.gain >=  0 ).length;
    const ratio  =  ( numGains / numObjects ) * 100;
    return `${ ratio } %`;
   } 


         } ,
         mixins:[sessionMixin],
        name:'Tester',

        methods:{ 

          subscribeToTicks(){
            socket.on( "send-realtime-subscription", ( s )  => { 

// this.generateSignals( s )

this.gainers( s );
this.CurrentTick  =  [...s];
 }  );

          },

       async  initialFetch(){

        await  fetch( "../../../instruments/instrumentsForMining.json" )
      .then(( response )  => response.json(  ))
      .then(( data )  => 
      { 
        this.fetchInstruments(  );
        this.subscribeToTicks();
        // console.log( data,'data1' )
       } 
    
      
      
      
       ); 


      await  fetch( "../../../instruments/instrumentsAll.json" )
      .then(( response )  => response.json(  ))
      .then(( data )  => 
      { 


        // console.log( data,'data1' )
        instrumentsAll  =  data;
       } 
    
      
      
      
       );   instruments  =  data;
        },

          changeColor(  ) { 
      this.linkColor  =  "red";
     } ,

gainers( s ){ 

s.forEach( e =>{ 

  let element = e;

// console.log( e,'s' )


  let cis = this.instruments.filter( i =>i.instrument_token == e.instrument_token )[0];;



  if( typeof cis == 'undefined' ){ 

    console.log( 'cis not defoined for ',e.tradingsymbol )

    return 
   } 




if( this.minuteEnd ){ 

  

if( this.minuteCounter == 4 ){ 

  this.minuteCounter = 0;

  console.log( 'here2' )
for ( let k = 0;k<4;k++ ){ 

  console.log( 'here3' )

  // this.$set( this.instruments.filter( i =>i.instrument_token == e.instrument_token )[0],
  // `m${ k } `,0
  //  )

  // this.$set( this.instruments.filter( i =>i.instrument_token == e.instrument_token )[0],
  // `OI-${ k } `,0
  //  )

 } 


 } 



// this.$set( this.instruments.filter( i =>i.instrument_token == e.instrument_token )[0],
//   `m${ this.minuteCounter } `,e.ohlc.last_price
//    )

  // this.$set( this.instruments.filter( i =>i.instrument_token == e.instrument_token )[0],
  // `OI-${ this.minuteCounter } `,e.oi



  //  )


  // let { m0,m1,m2,m3,OI1,OI2,OI3,OI4 }  = this.instruments.filter( i =>i.instrument_token == e.instrument_token )[0];


  // let zeroCheck = ( m0 !==  0 && m1 !==  0 && m2 !==  0 && m3 !==  0 );

  // let priceChk = m3 > m2 && m2 > m1 && m1 > m0;

  // let oiCheck = OI-0<OI-1<OI-2<OI-3<OI4;

  // && oiCheck

  // if( zeroCheck &&   priceChk  ){ 


  //   this.shortCovering.push( ci );

  //   console.log( cis.tradingsymbol,'is short covering' )
  //  } 


 } 


  let { d2 }  = cis.pricePoints;
  if( !d2 ){ 

    return false;
   } 
 

  //  console.log( cis.pricePoints.d2.high,e.last_price, cis.pricePoints.d2.high<e.last_price,d2.normalDate )

  if( typeof this.instrumentsAll.find( i =>i.tradingsymbol == cis.name ) == 'undefined' ){ 

return ;
 } 

  // console.log( e )
 
  let { d1 }  = cis.pricePoints;

  let d2Body = Math.abs( d2.close-d2.open );

  let body = Math.abs( d1.close-d1.open )
  let upper = Math.abs( Math.max( d1.close,d1.open )-d1.high );
  let lower = Math.abs( Math.min( d1.close,d1.open )-d1.low );


  // console.log( d1,'d1.volume' )


  // console.log( 'element', e.ohlc.low<d1.low && 
  // e.last_price> d1.high &&
  // d2.close-d2.open>0 &&
  // body<d2Body &&

//   ( body<d2Body*2 ) &&
// body>upper && body>lower &&
//   d1.open<d1.close &&
//   e.ohlc.open<d1.close

//  )

let neWEntryLogic = body>upper && body>lower &&
  d1.open<d1.close &&
  e.ohlc.open<d1.close &&  e.ohlc.low<d1.low && 
  e.last_price> d1.high 

let currentLogic =  e.ohlc.high> d1.high  &&  e.ohlc.open!= 0 

&& e.ohlc.open<d1.high 

&&  ( body<d2Body*2 )

&&
body>upper && body>lower &&
d1.open<d1.close &&
e.ohlc.open<d1.close


// e.ohlc.high>d1.high 

//   && e.ohlc.open<d1.high 


//   && e.last_price>d1.high



let  c = e.ohlc.high>cis.pricePoints.d1.high 

   && e.ohlc.open<cis.pricePoints.d1.high

  &&  e.last_price>cis.pricePoints.d1.high   // stocks are less than Do high


  && e.volume_traded>cis.pricePoints.d1.volume


  && body>upper*1.5

  &&  ( body<d2Body )



  && d2.high<d1.high;


let a = 
  ( element.last_price>= cis.pricePoints.d1.high   /// break todays high at reference time
  
  
  
  //  &&  (( element.last_price-cis.pricePoints.d1.low )*cis.lot_size )<2500   // even if it broke just check  whether it have moved too much 
  

  // && element.volume_traded>cis.pricePoints.d1.volume && cis.pricePoints.d1.volume!= 0   //  have a volume greater than yesterday



  && element.ohlc.open<element.last_price   /// must be above todays open price 


  // && cis.pricePoints.d0.high>element.ohlc.high  what is this 

   && body>upper*1.5   ///yesterdays bodys must be greater than atleast 1.5 times  upper shadow

  //  && d2Body>body   /// yesterdays body less than   day befores yesterdays body
 
 
   && d2.high<d1.high /// d2 high less than d1 high 

  // && NoTradeForLtpBelowOpenPrice // no entry below entry
  
   );
  

  // console.log( e )

  let { d0,d3 }  = cis.pricePoints;

  let entry = d0.high,target = d0.rangeBreakOutTarget,stoploss = d0.low;

  if( 


  e.last_price>e.ohlc.open
  // e.ohlc.high>cis.pricePoints.d1.high

  // && 

  // &&
  
  // e.last_price>e.ohlc.open &&

  


   
  // element.last_price>= cis.pricePoints.d0.high   /// break todays high at reference time
  
  
  
  // // &&  (( element.last_price-cis.pricePoints.d0.low )*cis.lot_size )<2500   // even if it broke just check  whether it have moved too much 
  

  // && element.volume_traded>cis.pricePoints.d1.volume && cis.pricePoints.d1.volume!= 0   //  have a volume greater than yesterday



  // && element.ohlc.open<element.last_price   /// must be above todays open price 


  // e.ohlc.close>e.ohlc.open 

  // &&

  // ( e.ohlc.open<e.ohlc.close 
  
  // // && e.ohlc.open>cis.pricePoints.d2.low
  
  
  //  )

  // e.ohlc.open<e.ohlc.close 

  // e.ohlc.open<entry

  // && e.last_price == entry
  
  // && e.ohlc.open<e.last_price

  // && e.last_price<cis.pricePoints.d2.low  // measns last prcie bewlow yda y low
 
 
  // && e.last_price>cis.pricePoints.d2.high
      
  
//  && e.ohlc.high>cis.pricePoints.d2.high/// all triggered for y day high bo


  




//  &&  d2.low>d3.low   //higger lows

//  && ( d1.open>d1.close   ) // y day not  gap dowbn
  


//  && !( d3.close>d2.open && d2.open>d2.close  ) // not of  yday gap down  and red candle

  // && !( d2.open>d2.close && d1.open<d2.close )   //not of y day red and today gap down



  // &&



// e.ohlc.high>cis.pricePoints.d0.high

// && cis.

  // && body>upper*1.5   ///yesterdays bodys must be greater than atleast 1.5 times  upper shadow

  // && d2Body>body   /// yesterdays body less than   day befores yesterdays body
  // && d2.high<d1.high /// d2 high less than d1 high 

  // && NoTradeForLtpBelowOpenPrice // no entry below entry

 // && cis.pricePoints.d0.high>element.ohlc.high  what is this 

  // e.ohlc.open
  // d1.open!= d1.close &&

  // d1.volume!= 0 &&
   

    // && d1.open<d1.close  /// yesterday green candle
   
  //  e.ohlc.open>e.ohlc.close*2
  //  && e.last_price>= e.ohlc.high


  // e.ohlc.open>e.ohlc.close*1.5
  // e.ohlc.open>e.ohlc.close*1.5

//  &&  e.ohlc.low< e.ohlc.open*.8

//  && e.ohlc.close>e.ohlc.low*1.2

  // && e.ohlc.open == e.ohlc.high
  

  


  // && d3.open!= d3.close
  
  // && cis.pricePoints.d3.volume<cis.pricePoints.d2.volume
  
  
//   &&

//  cis.pricePoints.d2.high<e.last_price
   ){ 


  
    let present;

    // if( ! this.instrumentsAll.some( i =>i.tradingsymbol == cis.name )){ 

    //   return false;
    //  } 


try{ 



  
  

  // console.log( cis )

  cis.volume = e.volume_traded;
    cis.ohlc = e.ohlc;
    cis.last_price = e.last_price

    cis.highestpc = ( e.ohlc.high-e.ohlc.close )*100/e.ohlc.close
    // cis.gain = ( e.last_price-d1.close ) *cis.lot_size
    // cis.gain = ( e.last_price-cis.pricePoints.d2.high ) *cis.lot_size


// if( e.last_price>( target )){ 

//   cis.gain = ( target-entry ) *cis.lot_size

//  } 


//     if( e.last_price<stoploss ){ 

//       cis.gain = ( stoploss-entry ) *cis.lot_size

//      } else { 


//       cis.gain = ( e.last_price-entry ) *cis.lot_size
//      } 
    

    let name = cis.name
    cis.closeTimes = e.ohlc.high/e.ohlc.close
    cis.highTimes = e.ohlc.high/d1.high

    
    let nameinstrumentToken = this.instrumentsAll.find( i =>i.tradingsymbol == cis.name ).instrument_token;
    let stockChart = `https://kite.zerodha.com/chart/ext/ciq/NSE/${ name } /${ nameinstrumentToken } `;
    cis.stockChart = stockChart;

    this.winners.push( cis )
    

     present = this.winners.some( w =>w.instrument_token == cis.instrument_token )

 } catch( e ){ 

  console.log( e,'error at 222' );
 } 
    if( !present ){ 

      
      

// 
        this.winners.push( cis )

      


     } 


   } 


 }  )


 } ,
  
            setInstrumentTokens(  ) { 

   

    


let tokn = this.instruments.map( i =>parseInt( i.instrument_token ))

  socket.emit( "subscribe-orders", JSON.stringify( tokn ));

 } ,

            async fetchInstruments(  ){ 
                this.instruments  = instruments;

                this.instrumentsAll = instrumentsAll;
                this.setInstrumentTokens(  );



             } ,



            checkPricePoints( cis ) { 

// console.log( 'from fn' )
const pricePoints  =  cis.pricePoints;


let { d0,d1,d2,d3,d4,d5,d6,d7 }  = pricePoints;

if( 
d1.low>d2.low 

// &&
// d2.low>d3.low &&
// d3.low>d4.low 


 ){ 

return true
 } else{ 


return false;
 } 




 } ,


async generateSignals( s ){ 









   

  if( s.length == 0 ){ 

    this.scriptsWithCondition = this.instruments.filter( cis =>{ 
// console.log( this.checkPricePoints( cis ),'cis11' )

let currentTick = s.find( s1 =>s1.instrument_token == cis.instrument_token );

if( currentTick && currentTick.ohlc.high == currentTick.last_price ){ 

return true

 } else{ 


  return false;
 } 

return  this.checkPricePoints( cis );

     }  )

// console.log( this.scriptsWithCondition,'this.scriptsWithCondition' )
   } 

// console.log( s )

if( typeof this.instruments == 'undefined' || this.instruments.length == 0 ){ 
return;

         } 

    for( let l = 0;l<s.length;l++ ){ 



        let element = s[l];

    //  console.log( element,'element' )
    
        let cis = this.instruments.find( i =>i.instrument_token == element.instrument_token )

        debugger;
        if( !cis ){ 

          continue;
         } 

        if( !cis.pricePoints ){ 

continue;
 } 
        
if( !cis ){ 

  // return false;
 } 

        const allGreater  =  this.checkPricePoints( cis );


// console.log( { allGreater } ,cis.tradingsymbol ); // true


if( allGreater  == false ){ 


  return false
 } 


let { d1,d2,d3,d4,d5,d6,d7 }  = cis.pricePoints;


let mao = 
d1.open+
d2.open+
d3.open+
d4.open+
d5.open+
d6.open+
d7.open




let mac = 
d1.close+
d2.close+
d3.close+
d4.close+
d5.close+
d6.close+
d7.close


let mah = 
d1.high+
d2.high+
d3.high+
d4.high+
d5.high+
d6.high+
d7.high


let mal = 
d1.low+
d2.low+
d3.low+
d4.low+
d5.low+
d6.low+
d7.low

let avg = mac/7;


    // let ep = cis.pricePoints.d2.high;
    // let ep = avg
    let ep = d1.close
//  let exit = element.ohlc.high*1.1;
//  let exit1 = element.last_price;
 let exit1 = ep*1.2;

 let { low,close,high,open }  = element.ohlc;

 let lp = element.last_price;


// let exit = ( exit1<high?exit1:lp );
let exit = lp;


if( element.ohlc.close<element.ohlc.open 
     
     && element.last_price>element.ohlc.open
     
      ){ 

      let ob = {  } ;

ob.tradingsymbol = cis.tradingsymbol;


ob.gain = ( open-lp )*cis.lot_size;

ob.entry = lp;
ob.last_price = element.last_price
ob.exit = lp*1.2
this.scriptsWithCondition.push( ob )


      } 

return;
// if( element.last_price && !this.scriptsWithCondition.find( i =>i.tradingsymbol == cis.tradingsymbol ))


{ 

  // !( open == high ) &&
  if( 


  low<ep &&
allGreater
    
     )
    // low == open && (  ( lp-open )*cis.lot_size<2500 && ( lp-open )*cis.lot_size>0  )
    { 


        if( low == open ){ 

            let ob = {  } ;

ob.tradingsymbol = cis.tradingsymbol;


ob.gain = ( open-lp )*cis.lot_size;

ob.entry = lp;
ob.last_price = element.last_price
ob.exit = lp*1.2
this.scriptsWithCondition.push( ob )

this.scriptsWithCondition  =  this.scriptsWithCondition //.filter( script  => script.last_price !==  undefined && script.last_price !==  0 ).

.sort(( a,b ) =>{ 

  b.gain-a.gain
 }  );


         } 

      
let ob = {  } ;

ob.tradingsymbol = cis.tradingsymbol;

if( low<d1.low ){ 
    ob.gain = ( d1.low-ep )*cis.lot_size;


 } else{ 
    ob.gain = ( exit-ep )*cis.lot_size;

 } 

ob.gain = ( exit-ep )*cis.lot_size;

ob.entry = ep;
ob.last_price = element.last_price
ob.exit = exit;
this.scriptsWithCondition.push( ob )


this.scriptsWithCondition  =  this.scriptsWithCondition //.filter( script  => script.last_price !==  undefined && script.last_price !==  0 ).

.sort(( a,b ) =>{ 

  b.gain-a.gain
 }  );




this.scriptsWithConditionGain = this.scriptsWithCondition.reduce(  ( pvs,cur ) =>pvs+cur.gain,0


 );
 } 


 } 
     } 
 } 


         } ,
        components: { 
            VueGoodTable,
   } ,
     data(  ){ 

        return{ 

          shortCovering:[],
          minuteCounter:0,
linkColor:'grey',
          instrumentsAll:[],
          winners:[],

            gainLoss:-1,
            scriptsWithCondition:[],
            scriptsWithConditionGain:-1,
CurrentTick:[], rows: [
        { 
          tradingsymbol: 'AAPL',
          gain: 10.23,
          entry: 120.5,
          exit: 130.5,
          last_price: 132.0,
         } ,
        { 
          tradingsymbol: 'GOOG',
          gain: 5.43,
          entry: 2200.0,
          exit: 2300.0,
          last_price: 2265.5,
         } ,
        { 
          tradingsymbol: 'TSLA',
          gain: 15.67,
          entry: 600.0,
          exit: 700.0,
          last_price: 690.0,
         } ,
      ],
columns: [
        { 
          label: 'SL No.',
          field: 'index',
          sortable: true
         } ,
        { 
          label: 'Trading Symbol',
          field: 'tradingsymbol',
          sortable: true
         } ,
        { 
          label: 'Gain',
          field: 'gain',
          sortable: true
         } ,
        { 
          label: 'Entry',
          field: 'entry',
          sortable: true
         } ,
        { 
          label: 'Exit',
          field: 'exit',
          sortable: true
         } ,
        { 
          label: 'Last Price',
          field: 'last_price',
          sortable: true
         } 
      ]
        , hours:0,
        seconds:0,
        minutes:0,
        minuteEnd:false, 
        
        counter:0,
         } 
       
      } ,
        mounted(  ){ 


          initialFetch();

          setInterval(( i ) =>{ 

            var d  =  new Date(  );
         this.hours  =  d.getHours(  );
         this.minutes  =  d.getMinutes(  );
         this.seconds  =  d.getSeconds(  );


         this.counter++

         if( this.counter == 58 ){ 

this.counter = 0;
this.minuteEnd = true;



          } else{ 
          this.minuteEnd = true;


          } 

         

           } ,1000 )


          setInterval(( i ) =>{ 




 } ,60*1000 )

           
          // this.generateSignals( [] )
       
             


         } 
     } 
</script>


<style lang = "scss" scoped>
 table { 
    border-collapse: collapse;
    width: 100%;
   } 

  th, td { 
    text-align: left;
    padding: 8px;
    border: 1px solid #ddd;
   } 

  th { 
    background-color: #f2f2f2;
   } 

  tr:nth-child( even ) { 
    background-color: #f2f2f2;
   } 

  tr:hover { 
    background-color: #ddd;
   } 
</style>