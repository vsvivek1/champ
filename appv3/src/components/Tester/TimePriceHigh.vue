<template>
    <div>

        <table class = "table table-bordered">
  <tr>
    <td>Description</td>
    <td>Value</td>
    <td>Value</td>
    <td>Value</td>
    <td>Has Wick</td>
  </tr>
  <tr>
    <td>Highest price till 11 am</td>
    <td> {{  highestPrice  }}  </td>
    <td>{{  this.highestPriceAfterRefTime  }} </td>
    <td>{{  this.highestPriceAfterRefTime  }} </td>
    <td :style = "{  backgroundColor: closedAbove ? 'lightgreen' : 'transparent'  } ">{{  closedAbove ? 'Yes' : 'No'  }} </td>
  </tr>
</table>

<!-- {{  ohlcData  }}  -->

<table class = "table table-bordered" border = "1">

  <tr :style="getRowStyle"

  v-for = "( ohlc,index1 ) in ohlcData" :key = "index1 +'-' + ohlc.instrument_token">


  
  <td v-if=" readyForEntry">
    <span v-if="readyForEntry"> ready For Entry @ {{ buyPrice }}</span>
  </td>
    <td v-if="hasPosition ">
     
      <span v-if="ohlc.high>buyPrice">
      Hit Target
      </span>

      <span v-if="ohlc.low<stopLossPrice" style="color:red">
      Hit Stop loss
      </span>


    buyPrice:{{  buyPrice }}
    targetPrice:{{ targetPrice }}
    stopLossPrice:{{ stopLossPrice }}

    targetPoints {{targetPrice-buyPrice }}
    Sl Points {{stopLossPrice-buyPrice }}

    

  <span v-if ="targetHit">Target Hit   {{(targetPrice-buyPrice)*1800  }}</span>
  <span v-if ="stopLossHit">Stop loss Hit {{(stopLossPrice-buyPrice)*1800  }} </span>
    
    
    </td>
    
    
    
    <td>{{  index1+1  }} </td>

    <td>SL {{ stopLossPrice }}
    Target {{ targetPrice }}
    
  </td>
    <td>high {{  ohlc.high  }}  </td>
    <td>low {{  ohlc.low  }}  </td>

    
    <td>{{  ohlc }}  {{}} </td>
    <td>{{  ohlc.entryPrice  }} </td>
    <td>{{  hasWick( ohlc,(index1+1) )  }} </td>
    <td>
      {{ currentStatus(ohlc) }}</td>
  </tr>


</table>

{{ total }}
    </div>
  </template>

<style>

table { 
      border-collapse: collapse;
     } 
    th, td { 
      border: 1px solid black;
      padding: 8px;
      text-align: left;
     } 
    .highlight { 
      background-color: lightgreen;
     } </style>
  
  <script>

  import sessionMixin from '@/views/sessionMixin';
//   import WraperForInstruments from './WraperForInstruments.vue'
  import axios from 'axios';
  export default { 
    name:'TimePriceHigh',
    props:['symbol'],

    mixins:[sessionMixin],

    data(  ) { 
      return { 
        total:0,
        buyPrice:0,
        sellPrice:0,
        targetPrice:0,
        stopLossPrice:0,
        readyForEntry:false,
        targetHit:false,
        stopLossHit:false,
        hasPosition:false,
    
        ohlcData: [
          // Your OHLC data here
        ],
        highestPrice: null,
        highestPriceAfterRefTime:null,
        highestPriceAfter: null,
        closedAbove: null,
        closingPrice:0
       } ;
     } ,
    computed: { 

      getRowStyle() {
      return {
        backgroundColor: this.hasPosition ? 'lightBlue' : 'white',
        color: this.targetHit ? 'green' : this.stopLossHit ? 'red' : 'black',
        // Add more conditions and styles as needed
      };
    },
      filteredData(  ) { 
        return this.ohlcData.filter( entry  => {  return true
          // Filter data till 11 am
          // Assuming timestamp is in milliseconds, adjust as needed
          // return entry.timestamp < 11 * 60 * 60 * 1000;
         }  );
       } 
     } ,
    methods: { 

      currentStatus(ohlc){


      },

      hasWick( ohlc,idx ){ 

        // this.stopLossHit=false;

        if(this.stopLossHit || this.stopLossHit || idx==375){
          this.stopLossHit=false;
          this.targetHit=false;
          this.stopLossPrice=0;
          this.targetPrice=0;
          this.hasPosition=false;
          this.readyForEntry=false;

          // return;


          
        }

        if(idx==375){

          return;
        }

        // if(this.targetHit) this.targetHit=false;

        let body1=ohlc.open-ohlc.close;

        let body=Math.abs(body1);

        let candleColour=ohlc.open-ohlc.close<0?'green':'red';

        let lowerShadow=Math.min(ohlc.open,ohlc.close)-ohlc.low
        let upperShadow=ohlc.high-Math.max(ohlc.open,ohlc.close);



        if(this.hasPosition && ohlc.low<=this.stopLossPrice && this.stopLossPrice!=0){






this.hasPosition=false;
this.readyForEntry=false;

this.targetHit=false;

this.stopLossHit=true;
this.total+this.stopLossPrice-this.buyPrice

 return;

}

        if(this.hasPosition && ohlc.high>=this.targetPrice  && this.targetPrice!=0){

          this.total+this.targetPrice-this.buyPrice
          this.targetHit=true;
            this.stopLossHit=false
            this.hasPosition=false;
            this.readyForEntry=false;

             return;

        }


       console.log(this.total,'<<Total',idx,'this.hasPosition',this.hasPosition,'this.readyForEntry',this.readyForEntry,'ohlc.high>this.buyPrice',ohlc.high,this.buyPrice)
        if((!this.hasPosition) && this.readyForEntry==true  && ohlc.high>this.buyPrice  && this.buyPrice!=0){


          console.log('has position')
          this.hasPosition=true

          this.readyForEntry=false;

          // return;
        }

        if( !this.readyForEntry && !this.hasPosition && lowerShadow>body*2){

          //entry

          this.buyPrice=ohlc.high;
          this.readyForEntry=true;
          this.targetPrice=this.buyPrice+Math.abs(ohlc.high-ohlc.low)
          this.stopLossPrice=ohlc.low;

          



// return true
        }else{

          this.readyForEntry=false
          return false;
        }


        return;
// let body=Math.abs(body1);

        
      return  ( Math.min( ohlc.open-ohlc.close ))-  ohlc.low>( Math.abs( ohlc.open-ohlc.close )*2 ) 

       } ,
        getRequiredTime( h,m ) { 
  const today  =  new Date(  ); // Current date

//   console.log( today );
  const dayOfWeek  =  today.getDay(  ); // Get current day of the week ( 0 - Sunday, 6 - Saturday )

  // Calculate the difference between today and last Friday
  const daysDiff  =  ( dayOfWeek + 7 - 5 ) % 7; // 5 represents Friday

  // Calculate the date of last Friday
 const lastFriday  =  new Date( today + daysDiff );
//   lastFriday.setDate( today.getDate(  ) - daysDiff );

  // Set the time to 9:15 AM
  lastFriday.setHours( h );
  lastFriday.setMinutes( m );
  lastFriday.setSeconds( 0 );

  // Format the date in YYYY-MM-DD hh:MM:SS


const options  =  { 
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Kolkata' // Set the timezone to Indian Standard Time ( IST )
 } ;

// console.log( lastFriday );


const date  =  new Date( lastFriday );

const year  =  date.getFullYear(  );
const month  =  String( date.getMonth(  ) + 1 ).padStart( 2, '0' ); // Month is zero-indexed
const day  =  String( date.getDate(  )).padStart( 2, '0' );
const hours  =  String( date.getHours(  )).padStart( 2, '0' );
const minutes  =  String( date.getMinutes(  )).padStart( 2, '0' );
const seconds  =  String( date.getSeconds(  )).padStart( 2, '0' );

const formattedDateTime  =  `${ year }-${ month }-${ day } ${ hours }:${ minutes }:${ seconds } `;
// console.log( formattedDateTime );

// const formattedDateTime  =  lastFriday.toLocaleString( 'en-IN', options ).replace( /\//g, '-' ).replace( /\,/g, '' );
return formattedDateTime
 } ,
      async  getHistoricalData( accessToken,symbol,start,end,intervel ){ 

        await  fetch( "../../../../instruments/instrumentsForMining.json" )
      .then(( response )  => response.json(  ))
      .then(( data )  => 
      { 


        //  console.log( data,'data1' )
        this.instruments  =  data;
       } 
    
      
      
      
       );

    //   console.log( this.instruments,'this.instruments' );

    start ='2023-12-19 09:15:00';
    end ='2023-12-19 15:30:00';
let url = "/api/getHistoricalData/symbol/"+ this.symbol+'/accessToken/'+accessToken+'/start/'+start+'/end/'+end+'/intervel/'+intervel;

 console.log( url )
let resultPromise =  await  axios.get( url );

this.ohlcData = resultPromise.data;

// console.log(this.ohlcData,'ohlcdata');

// Assuming you have an array of OHLC data


// Marking flags for entry

return;
/*
for ( let i  =  1; i < this.ohlcData.length; i++ ) { 
  const currentCandle  =  this.ohlcData[i];
  const previousCandle  =  this.ohlcData[i - 1];

  if ( currentCandle.high > previousCandle.high ) { 
    currentCandle.flagEntry  =  true;
   } 

  if ( i > 1 && currentCandle.low < ohlcData[i - 2].low ) { 
    currentCandle.flagLow  =  true;
   } 
 } 


// Calculating and setting entry price, exit price, and price difference on OHLC data
for ( let i  =  0; i < this.ohlcData.length; i++ ) { 
  if ( this.ohlcData[i].flagEntry ) { 
    let entryPrice  =  this.ohlcData[i].high * 1800;
    let j  =  i + 1;

    while ( j < this.ohlcData.length && !this.ohlcData[j].flagLow ) { 
      j++;
     } 

    if ( j < this.ohlcData.length && this.ohlcData[j].flagLow ) { 
      let exitPrice  =  this.ohlcData[j].low * 1800;
      let priceDifference  =  entryPrice - exitPrice;

      this.ohlcData[i].entryPrice  =  entryPrice;
      this.ohlcData[j].exitPrice  =  exitPrice;
      this.ohlcData[i].priceDifference  =  priceDifference;

      console.log( `Entry Time: ${ this.ohlcData[i].time } , Exit Time: ${ this.ohlcData[j].time } , Price Difference: ${ priceDifference } ` );
     } 
   } 
 } 


 */
// Printing OHLC data with entry price, exit price, and price difference
console.log( this.ohlcData );

// console.log( this.ohlcData )

this.findHighestPrice(  );

// .then( res  => {     
//                 return res.data;                  
     
//       }  );

     return resultPromise;

 } ,

findHighestPrice(  ) { 
  // Filter data till 11 am

  let inputTime = 10;
  let istInputTime = inputTime+5
  const dataTill11AM  =  this.ohlcData.filter( entry  => { 

    // console.log( new Date( entry.date ).getUTCHours(  ),'hrs before ' )

    return new Date( entry.date ).getUTCHours(  ) < istInputTime;
   }  );


//   console.log( dataTill11AM,'dataTill11AM' );

  // Find highest price till 11 am
  this.highestPrice  =  Math.max( ...dataTill11AM.map( entry  => entry.high ));



var dt = new Date(  );

let utcHrNow = dt.getUTCHours(  );
let utcMntsNow = dt.getUTCMinutes(  );

let closingHr = Math.min( utcHrNow,20 )


let closingMnts = closingHr == 20?0:utcMntsNow;

console.log( { closingMnts } ,closingHr )
  this.closingPrice = this.ohlcData.filter( entry  => { 

console.log( new Date( entry.date ).getUTCHours(  ),'now ' )



return ( 
    
new Date( entry.date ).getUTCHours(  )  == closingHr
&& new Date( entry.date ).getMinutes  == closingMnts
 ) ;
 }  )//.map( entry =>entry.high );

//   print(  )

  // Find the entry where the price crossed after 11 am


  const dataAfterRefTime = this.ohlcData.filter( entry  =>

{ 


//   console.log( new Date( entry.date ).getUTCHours(  ),'new Date( entry.date ).getUTCHours(  )' )
return   new Date( entry.date ).getUTCHours(  ) >=  istInputTime
 }  );



// console.log( dataAfterRefTime,'dataAfterRefTime' )

var crossedAfter11AM  =  dataAfterRefTime.filter( entry  =>

  { 


    // console.log( new Date( entry.date ).getUTCHours(  ),'new Date( entry.date ).getUTCHours(  )' )
return  entry.high > this.highestPrice 
   } 
  
 
  
   );


 this. highestPriceAfterRefTime = Math.max( ...dataAfterRefTime.map( entry  => entry.high ));

//   console.log( this.highestPriceAfterRefTime,'highestPriceAfterRefTime' )
  crossedAfter11AM =  this.highestPriceAfterRefTime>this.highestPrice;

//   console.log( crossedAfter11AM,'crossedAfter11AM' );
  // Check if there's a price crossed after 11 am
  if ( crossedAfter11AM ) { 
    this.highestPriceAfter  =  crossedAfter11AM.high;
    const lastEntry  =  this.ohlcData[this.ohlcData.length - 1];
    this.closedAbove  =  lastEntry.close > this.highestPrice;
   }  else { 
    this.highestPriceAfter  =  null;
    this.closedAbove  =  false;
   } 
 } 

     } ,
    mounted(  ) { 



       let start  = this.getRequiredTime(9,15 );
       let end  = this.getRequiredTime( 15,31 );
       let intervel = 'minute';

       console.log({start},{end},{intervel},'mounted')
       

        this.getHistoricalData( this.accessToken,this.symbol,start,end,intervel );
      
     } 
   } ;
  </script>
  