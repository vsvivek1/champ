var KiteConnect  = require( "kiteconnect" ).KiteConnect;
var moment=require( 'moment' );
const FILE_LOCATION='./appv3/public/instruments'
const instruAll  = require( './'+FILE_LOCATION+'/instrumentsAll.json' );

var api_key_final = 'wkcurst2vu5obug7';
module.exports  = 
class pricePoint {

  
  constructor( stock_tocken, accessToken ) {
    require( 'dotenv' ).config(  )
    // dotenv.config(  );

    this.counter=0;


 

    this.stock_tocken  = stock_tocken;

    this.accessToken  = accessToken;

    // console.log( 'ACCESS TOKEN FROM PRICE POINTS', this.accessToken )

    this.pricePointData  = []
    // this.getPricePoints(  );
  }

 


  yNdays( yesterdayData ){


let yesterDay={};




if( typeof yesterdayData!='object' ){

  return yesterDay;
  // return false;
}
    
      yesterDay.date  = yesterdayData.date;

      yesterDay.normalDate=this.convertIsoDateToIST( yesterdayData.date )


// console.log( yesterdayData ,'yday date' )
   
      yesterDay.low  = yesterdayData.low;
      yesterDay.high  = yesterdayData.high;
      yesterDay.close  = yesterdayData.close;
      yesterDay.open  = yesterdayData.open;
      yesterDay.volume  = yesterdayData.volume;

      yesterDay.range  = Math.abs( yesterdayData.high - yesterdayData.low );

      yesterDay.rangeBreakOutTarget  = yesterdayData.high + yesterDay.range;
      yesterDay.rangeBreakDownTarget  = yesterdayData.low - yesterDay.range;

      return yesterDay;

  }


  convertIsoDateToIST( iso ) {
  

    return moment( iso ).format( "DD-MM HH:mm" );
  }
  

  dateBforeXMonths( monthsToAdvance ) {

    var d  = new Date(  );
    d.setMonth( d.getMonth(  ) - monthsToAdvance );

    return d.toISOString(  ).slice( 0, 10 );
  }



  dateBeforeXdays( daysToAdvance ){



    var d  = new Date(  );

let dayOfWeek=d.getDay(  );

daysToAdvance=daysToAdvance+5

// if( dayOfWeek = = 1 ||  dayOfWeek = = 5 ||  dayOfWeek = = 6 ){

//   daysToAdvance=daysToAdvance+2

// }

    d.setDate( d.getDay(  ) - daysToAdvance );

    return d.toISOString(  ).slice( 0, 10 );

  }

  today(  ) {


    // var d  = new Date(  );
    // d.setDate( d.getDate(  )+1 )
    // return d.toLocaleString( 'sv' ).slice( 0, 10 );


// moment(  ).add( 1,'day' )
    
    return moment(  ).add( 1,'day' ).format( 'Y-MM-DD' )
  }

  getHeikinAshiValues( dayBeforeYesterdayData,yesterdayData ){

    let Ha={}
    // Open  = ( open of previous bar + close of previous bar ) divided by 2
    // Close  = ( open + close + high + low of current bar ) divided by 4
    // High  = the maximum value from the high, open, or close of the current period
    // Low  = the minimum value from the low, open, or close of the current period
try{
    
    Ha.Open=( dayBeforeYesterdayData.open+dayBeforeYesterdayData.close )/2;
    Ha.Close=( yesterdayData.open+yesterdayData.close+yesterdayData.high+yesterdayData.low )/4;

    Ha.High=Math.max( yesterdayData.open,yesterdayData.close,yesterdayData.high,yesterdayData.low )
    Ha.Low=Math.min( yesterdayData.open,yesterdayData.close,yesterdayData.high,yesterdayData.low )

    return Ha;

  }catch( e ){


    return Ha;
  
  }

  }

  getPivotPoints( data ) {

    let high  = data.high;
    let low  = data.low;
    let close  = data.close;

    let pp  = Math.floor( ( high + low + close ) / 3 );

    let ob  = {};
    ob.r1  = Math.floor( 2 * pp - low );
    ob.s1  = Math.floor( 2 * pp - high );

    ob.r2  = Math.floor( pp + ( high - low ) );
    ob.s2  = Math.floor( pp - ( high - low ) );

    ob.r3  = Math.floor( high + 2 * ( pp - low ) );
    ob.s3  = Math.floor( low - 2 * ( high - pp ) );
    ob.pivotPoint  = pp;
    ob.high  = high;
    ob.low  = low;
    ob.close  = close;


    let bc1  = ( high + low ) / 2;

    let tc1  = ( pp - bc1 ) + pp;



    let bc  = Math.min( bc1, tc1, pp );
    let tc  = Math.max( bc1, tc1, pp );

    ob.bc  = bc;
    ob.tc  = tc;





    return ob;

    let pro  = new Promise( ( resolve, reject ) => {

      resolve( ob )
    } )

    return pro;


  }

async getHourlyPricePoints(  ){
let HourlyPricePoints=require( './class/misPricePoints' );


let interval='60minute';


let hPricePoints=new HourlyPricePoints( this.stock_tocken,this.accessToken,interval );



return new Promise( async ( res,rej )=>{

  let pp=await hPricePoints.getMisTargets(  );
  res( pp );
  return 
} )


  }


  getXmonthMaximum( arr, mon1 ) {




    let mon  = ( mon1 - 1 ) * 31;


    let XmonthData  = arr.slice( global.globalPrevious, mon )

   
    let maxValue  = Math.max.apply( Math, XmonthData.map( function ( o ) { return o.high; } ) )

    let max  = arr.filter( a => a.high  = =  maxValue )[0];

    global.globalPrevious  = mon1;
    return max;

  }
  getXmonthMinimum( arr, mon1 ) {


   // let mon  = ( mon1 - 1 ) * 7;
    let mon  = ( mon1 - 1 ) * 31;
    let XmonthData  = arr.slice( global.globalPreviousMin, mon )

 
    let minValue  = Math.min.apply( Math, XmonthData.map( function ( o ) { return o.low; } ) )

    let min  = arr.filter( a => a.low  = =  minValue )[0];

    global.globalPreviousMin  = mon1;
    return min;

  }

  

async getXDaysPricePoints( days,stock_tocken ){

  console.log( api_key_final,'api key fromgetXDaysPricePoints' )
  var kc2  = new KiteConnect( {
    api_key: api_key_final,
    access_token: this.accessToken
  } );

  let b  = await kc2.getHistoricalData( stock_tocken, 'day', 
  this.dateBforeXMonths( days ), this.today(  ), false ).then( 
    async res => {
      let sorted  = res.sort( ( a, b ) => {


        return new Date( a.date ) - new Date( b.date )
      } );



    }
   )



}


getNDayMaxAndMin( data,n ){


try {

  let ar1=data.map( d=>parseFloat( d.high ) );
  let ar2=data.map( d=>parseFloat( d.low ) );
  let max = Math.max( ...ar1 )

  let min=Math.min( ...ar2 );

  let obj={};
  obj.Max=max;
  obj.Min=min;
  
  return obj;

} catch ( error ) {
  console.log( 'some error',error )
}



 

}


// const sampleData  = [
//   {
//     date: '2023-01-23T18:30:00.000Z',
//     open: 11.5,
//     high: 11.65,
//     low: 10.5,
//     close: 10.85,
//     volume: 384000
//   },
//   // ...
// ];



// publicHolidays  = ["2023-01-26"];


get7DaysData1( data,today ){


// Sample array of holidays
const holidays  = [
  "2023-01-26",
  "2023-03-07",
  "2023-03-30",
  "2023-04-04",
  "2023-04-07",
  "2023-04-14",
  "2023-04-22",
  "2023-05-01",
  "2023-06-28",
  "2023-08-15",
  "2023-09-19",
  "2023-10-02",
  "2023-10-24",
  "2023-11-14",
  "2023-11-27",
  "2023-12-25"
  ]

// Get the current date and time
const now  = new Date(  );

// Check if it's a weekday and not a holiday
if ( now.getDay(  ) > = 1 && now.getDay(  ) < = 5 && !holidays.includes( now.toISOString(  ).substring( 0, 10 ) ) ) {
  // Check if it's within the allowed execution time
  const start  = new Date( now.toISOString(  ).substring( 0, 10 ) + 'T09:15:00.000Z' );
  const end  = new Date( now.toISOString(  ).substring( 0, 10 ) + 'T15:30:00.000Z' );
  if ( now > = start && now < = end ) {
    // Filter the data to get the last 7 entries by date

    console.log( data[0] );
    return
    const filteredData  = data.filter( ( item ) => item.date.substring( 0, 10 ) < = now.toISOString(  ).substring( 0, 10 ) ).sort( ( a, b ) => b.date.localeCompare( a.date ) ).slice( 0, 7 );

    // Assign the data to d0 to d7 variables
    const [d0, d1, d2, d3, d4, d5, d6]  = filteredData;

  console.log( {d0} ); // Latest data
    console.log( {d1} ); // Second latest data
    console.log( {d2} ); // Third latest data
    console.log( {d3} ); // ...
    console.log( {d4} );
    console.log( {d5} );
    console.log( {d6} );
  } else {
    // The execution time is not within the allowed range
   
    console.log( data[0],'elese' );
    return
   
    const [, d1, d2, d3, d4, d5, d6, d7]  = data.filter( ( item ) => item.date.substring( 0, 10 ) < = now.toISOString(  ).substring( 0, 10 ) ).sort( ( a, b ) => b.date.localeCompare( a.date ) ).slice( 0, 8 );

    console.log( d0 ); // undefined
    console.log( d1 ); // Latest data
    console.log( d2 ); // Second latest data
    console.log( d3 ); // ...
    console.log( d4 );
    console.log( d5 );
   



}
}
}



get7DaysData( data,today ){
  let ob={};

  let publicHolidays  = [
    "2023-01-26",
    "2023-03-07",
    "2023-03-30",
    "2023-04-04",
    "2023-04-07",
    "2023-04-14",
    "2023-04-22",
    "2023-05-01",
    "2023-06-28",
    "2023-08-15",
    "2023-09-19",
    "2023-10-02",
    "2023-10-24",
    "2023-11-14",
    "2023-11-27",
    "2023-12-25"
    ]


  let data1 =  data.sort(  ( a,b )=>{


    return b.date-a.date
  } )



  let date  = new Date(  );
let momentDate  = moment( date );
let formattedDate  = momentDate.format( 'YYYY-MM-DD HH:mm:ss' );
// console.log( formattedDate );
  let hrs  = date.getHours(  );
  let mnts  = date.getMinutes(  );

  let day=date.getDay(  );

  // console.log( date,hrs,day,'date hrs day' );

let isMarketTime=false;



  if( day!=0 && day!=6 && ( hrs>9 || ( hrs = = 9 && mnts>=15  ) ) && ( hrs<15 || ( hrs = = 15 && mnts<=30  ) )     ){

   
isMarketTime=true

  }else{

    isMarketTime=false
  }






  // console.log( {isMarketTime} )

  // return;


  for( let i=0;i<9;i++ ){


if( !isMarketTime ){

  let j=i+1

  if( i = = 0 ){

    ob.d0={}

  }

ob[( 'd'+j+'data' )]=data1[i];

}else if ( isMarketTime ){

  let j=i


 


  ob[( 'd'+j+'data' )]=data1[i];

  
}

    // console.log( ob );
 
 
 
  }

  // console.log( ob )

  return ob;

}



get7DaysData1x  = ( data, today ) => {



let refNo;
let refHr=16;
  let tradingsymbol=instruAll.find( i=>i.instrument_token = = this.stock_tocken ).tradingsymbol

  let publicHolidays  = [
    "2023-01-26",
    "2023-03-07",
    "2023-03-30",
    "2023-04-04",
    "2023-04-07",
    "2023-04-14",
    "2023-04-22",
    "2023-05-01",
    "2023-06-28",
    "2023-08-15",
    "2023-09-19",
    "2023-10-02",
    "2023-10-24",
    "2023-11-14",
    "2023-11-27",
    "2023-12-25"
    ]
  const result  = {};
  let currentDate  = moment( today );



  const currentHour  = moment(  ).format( 'HH' );

  let dummy ={
    date: '',
    open: -1,
    high: -1,
    low: -1,
    close: -1,
    volume: 0,
    normalDate: '',
    tradingsymbol: '',
    instrument_token: ''
  };
  


 
  if ( currentHour  < = refHr ) {
refNo=8
  }else{

    refNo=7
  }

  for ( let i  = 0; i < refNo; i++ ) {
    const currentDay  = currentDate.format( "YYYY-MM-DD" );
   
    if ( publicHolidays.includes( currentDay ) ) {
      currentDate.subtract( 1, "days" );
      i--;
      continue;
    }


    const dayOfWeek  = currentDate.day(  );
    if ( dayOfWeek  = =  = 0 ) {
      currentDate.subtract( 2, "days" );
    } else if ( dayOfWeek  = =  = 6 ) {
      currentDate.subtract( 1, "days" );
    }
    const dateToFind  = currentDate.format( "YYYY-MM-DD" );


    const matchingData  = data.find( item => {
      
item.tradingsymbol=tradingsymbol
item.instrument_token=this.stock_tocken
   
  
   
   
      let itemDate=moment( item.date ).format( "YYYY-MM-DD" );

      console.log( {itemDate},'itemdate' )
     
      return itemDate  = =  dateToFind
    
    } );

      if ( currentHour  < = refHr ) {
      
    result[`d${i}data`]  = matchingData;

    
    currentDate.subtract( 1, "days" );
     

      }else{



    result[`d${i + 1}data`]  = matchingData;

    result['d0data']=dummy;

   
    currentDate.subtract( 1, "days" );
      }

  }


  
 
  return result;
};





// const today  = new Date(  );
// const previousWeekData  = getPreviousWeekData( today, sampleData );

// console.log( "Previous week data:", previousWeekData );

getPreviousDate  = ( date, daysAgo ) => {
  const prevDate  = new Date( date );
  prevDate.setUTCDate( prevDate.getUTCDate(  ) - daysAgo );
  
  return prevDate;
};
  async getPricePoints( duration=34,durationType='month' ) {


    try{

    var kc2  = await this.initiateKiteConnect(  );

    // console.log( kc2 );

    return new Promise( async ( res,rej )  =>{


   

  


    let retOb  = {};
    let startDay;

    let sorted;
      ( { sorted, startDay }  = await this.fetchHistoricalData
        ( durationType, startDay, duration, kc2 ) );






     var today  = moment(  ).startOf( 'day' ).format( 'YYYY-MM-DDTHH:mm:ss.SSSZ' );

//  const sevenDaysData  = this.get7DaysData( sorted, today );


 let {d7data,d6data,d5data,d4data,d3data,d2data,d1data,d0data}=this.get7DaysData( sorted, today );
  
// console.log( {d7data,d6data,d5data,d4data,d3data,d2data,d1data,d0data},'decon' )
        


      let len  = sorted.length;
      let first  = sorted[len - 1];
      retOb.SevenDayMaxMin=this. getNDayMaxAndMin( sorted,7 )

     

      let date  = new Date(  );

      let hrs  = date.getHours(  );
      let minutes  = date.getMinutes(  )

  
      let yesterdayData;
      let dayBeforeYesterdayData;

 

      
      yesterdayData  = this.setReturnObjetDatas( retOb, d0data, d1data, d2data, d3data, d4data, d5data, d6data, d7data, yesterdayData );




      this.estaBlishNarrowranges( retOb );


      let heikinAshiValues=this.getHeikinAshiValues( dayBeforeYesterdayData,yesterdayData )
      retOb.heikinAshi=heikinAshiValues;


      try {
       
      yesterdayData.token  = this.stock_tocken;
    } catch ( error ) {
      yesterdayData={};
      yesterdayData.token  = this.stock_tocken;
    }
      
      let { pivotPoints, pivotPointJson, pivotPointObject }  = this.setPivotPoints( yesterdayData );

      await this.setYesterdayObjectToRetObj( yesterdayData, pivotPoints, len, kc2, retOb, pivotPointJson );
      


      retOb.pivotPointObject  = pivotPointObject;

 


      global.globalPrevious  = 0;

    
      let st  = new Set(  );

      let candles=Math.floor( sorted.length/31 );


      //candle valuye was 90 previos;y

      for ( let i  = 2; i < candles; i++ ) {

        let ob  = {};


let tmp=this.getXmonthMaximum( sorted, i );

if( typeof( tmp )!='undefined' ){
  ob.date  = tmp.date;

  

}else{
  console.log( 'xmont max  undefined',sorted,'i',i )

}

     
        let max  = this.getXmonthMaximum( sorted, i );
        if ( typeof ( max ) ! = 'undefined' ) {

          if ( max.hasOwnProperty( 'high' ) ) {

            ob.high  = max.high;
          }
        }






        let a  = JSON.stringify( ob );


        st.add( a )


      }



      let stMin  = new Set(  );
      global.globalPreviousMin  = 0;



      for ( let i  = 2; i < candles; i++ ) {

        let ob  = {};
        ob.date  = this.getXmonthMinimum( sorted, i ).date;
        ob.level  = this.getXmonthMinimum( sorted, i ).low;
        // ob.pivotPoints=pivotPointJson;
        // ob.yesterDay=yesterdayJson;

        let a  = JSON.stringify( ob );

        stMin.add( a )


      }


      //using sets to remove any duplicates if any

      let pricePointLocal  = []

      Array.from( st ).forEach( s => {
        // pricePointLocal.push( JSON.parse( s ) )
        this.pricePointData.push( JSON.parse( s ) );

      } )

      Array.from( stMin ).forEach( s => {
        // pricePointLocal.push( JSON.parse( s ) )
        this.pricePointData.push( JSON.parse( s ) );

      } )


      let pricePointFinal  = {};
      // pricePointFinal.prices=JSON.stringify( pricePointLocal );
      // pricePointLocal.pivotPoint=pivotPointJson;
      // pricePointLocal.yesterday=yesterdayJson;

      // this.pricePointData.push( pricePointFinal );



   
    // return this.pricePointData;




    let pp  = this.pricePointData.sort( ( a, b ) => {

      return a.level - b.level
    } );

    retOb.pricePoints  = pp;


    let hourlyPricePoints=await this.getHourlyPricePoints(  )
    

   retOb.hourlyPricePoints=hourlyPricePoints;
    
res( retOb )
    return retOb;



  } )//end of promise

    } catch( e ){

      
console.log( e,'ERROR AT LINE 859',e );

return new Promise.resolve( {} );

    }

  }



  async setYesterdayObjectToRetObj( yesterdayData, pivotPoints, len, kc2, retOb, pivotPointJson ) {
    let yesterDay  = {};

    yesterDay.date  = yesterdayData.date;
    yesterDay.low  = yesterdayData.low;
    yesterDay.high  = yesterdayData.high;
    yesterDay.close  = yesterdayData.close;
    yesterDay.open  = yesterdayData.open;

    yesterDay.range  = Math.abs( yesterdayData.high - yesterdayData.low );

    yesterDay.rangeBreakOutTarget  = yesterdayData.high + yesterDay.range;
    yesterDay.rangeBreakDownTarget  = yesterdayData.low - yesterDay.range;

    yesterDay.pivot  = pivotPoints.pivotPoint;
    yesterDay.pivotBc  = pivotPoints.bc;
    yesterDay.pivotTc  = pivotPoints.tc;
    yesterDay.pivotR1  = pivotPoints.r1;
    yesterDay.pivotR2  = pivotPoints.r2;
    yesterDay.pivotR3  = pivotPoints.r3;
    yesterDay.pivotS1  = pivotPoints.s1;
    yesterDay.pivotS2  = pivotPoints.s2;
    yesterDay.pivotS3  = pivotPoints.s3;


    yesterDay.length  = len;

    let yesterdayJson  = JSON.stringify( yesterDay );


    let qoute  = await kc2.getQuote( this.stock_tocken );



    yesterDay.qoute  = qoute[this.stock_tocken];



    retOb.pivotPoints  = pivotPointJson;

    if ( typeof ( yesterDay )  = =  'undefined' ) {

      retOb.yesterday  = {};
    } else {
      retOb.yesterday  = yesterDay;

    }
  }

  setPivotPoints( yesterdayData ) {
    let pivotPoints  = this.getPivotPoints( yesterdayData );
    let pivotPointJson  = JSON.stringify( pivotPoints );
    let pivotPointObject  = pivotPoints;
    return { pivotPoints, pivotPointJson, pivotPointObject };
  }

  estaBlishNarrowranges( retOb ) {
    if ( retOb.d1.range < Math.min( retOb.d2.range, retOb.d3.range, retOb.d4.range, retOb.d5.range, retOb.d6.range, retOb.d7.range ) ) {

      retOb.nr7  = true;
    } else {
      retOb.nr7  = false;

    }


    if ( retOb.d1.range < Math.min( retOb.d2.range, retOb.d3.range, retOb.d4.range ) ) {

      retOb.nr4  = true;
    } else {
      retOb.nr4  = false;

    }
  }

  setReturnObjetDatas( retOb, d0data, d1data, d2data, d3data, d4data, d5data, d6data, d7data, yesterdayData ) {
    retOb.d0  = this.yNdays( d0data );
    retOb.d1  = this.yNdays( d1data );
    retOb.d2  = this.yNdays( d2data );
    retOb.d3  = this.yNdays( d3data );
    retOb.d4  = this.yNdays( d4data );


    retOb.d5  = this.yNdays( d5data );

    retOb.d6  = this.yNdays( d6data );
    retOb.d7  = this.yNdays( d7data );

    yesterdayData  = d1data;
    return yesterdayData;
  }

  async fetchHistoricalData( durationType, startDay, duration, kc2 ) {
    
    
    
  try {
	  if ( durationType  = =  'month' ) {
	      startDay  = this.dateBforeXMonths( duration );
	
	    } else if ( durationType  = =  'day' ) {
	
	      startDay  = this.dateBeforeXdays( duration );
	
	    }
	
	
	
	    // 
	    let b  = await kc2.getHistoricalData( this.stock_tocken, 'day',
	      startDay, this.today(  ), false ).then( async ( res ) => {
	
	        return res;
	
	      } );
	
	
	
	    b.forEach( e => {
	
	      e.normalDate  = this.convertIsoDateToIST( e.date );
	
	    } );
	
	
      // console.log( b );
      // return;
	
	    let sorted  = b.sort( ( a, b ) => {
	
	
	      return new Date( a.date ) - new Date( b.date );
	    } );
	    return { sorted, startDay };
	
	
} catch ( error ) {
	

  console.log( 'error @ 785',error )
}

  }

  async initiateKiteConnect(  ) {

    let today=moment(  ).format( 'Y-MM-DD' );


    let AccesTocken=require( './models/AccessTokens' );
    let at1 = await AccesTocken.findOne( { 'date': today },'access_token' )//.
   // then( e=>e.access_token );

   let access_token=at1.access_token;
  //  let access_token='wz7YXDPa5N1t7yG2X5omHwLVTFV0UfXs'

   this.accessToken=at1.access_token;
  //  this.accessToken='wz7YXDPa5N1t7yG2X5omHwLVTFV0UfXs'

  //  console.log( access_token,'access token from price poits',today );

  //  return;

// console.log( `API KEY FROM `,api_key_final )

// console.log( api_key_final,'api key from initiate kite connect' )
    return new KiteConnect( {
      api_key: api_key_final,
      access_token: access_token
    } );
  }
}


