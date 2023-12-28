process.stdout.write( '\033c' );
const Fs  =  require( 'fs' )
const mongoose  =  require( 'mongoose' );
const Path  =  require( 'path' )
const Axios  =  require( 'axios' );

const Fetch  =  require( './fetch.js' ) /// to download instruments from zerodha

const csvToJson  =  require( "csvtojson" );

let moment =  require( 'moment' );
// const FILE_LOCATION = './appv3/public/instruments'

const scriptDirectory  =  Path.dirname( process.argv[1] );
const FILE_LOCATION  =  Path.join( scriptDirectory, 'appv3', 'public', 'instruments' );
exports.FILE_LOCATION = FILE_LOCATION;


let ce_upper_percentage = 1.02;
exports.ce_upper_percentage = ce_upper_percentage;
let ce_lower_percentage = 1;
exports.ce_lower_percentage = ce_lower_percentage;

let pe_upper_percentage = 1;
exports.pe_upper_percentage = pe_upper_percentage;
let pe_lower_percentage = .98;
exports.pe_lower_percentage = pe_lower_percentage;
const TIMER  = 200 ;
let today  =  new Date(  ).toISOString(  ).slice( 0,10 )

// console.log( today );
// return;



main();
process.on( 'unhandledRejection', ( reason, p )  => { 
  console.log( 'Unhandled Rejection at:', p, 'reason:', reason );
  // application specific logging, throwing an error, or other logic here
 }  );


function main(  ) { 

	try{ 
  
		const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
		mongoose.connect( uri, {  useNewUrlParser: true, useUnifiedTopology: true  }  ).then( r  => { 
    // console.log( r )
    return AccesTocken.findOne( {  'date': today  } , 'access_token' ).then( async ( e )  => { 

      access_token  =  e.access_token;


	  console.log( access_token,'access token from here' )
      await fetchInstrumentsForMining( access_token );




     }  );

    ;


   }  );
 } catch( e ){ 

	console.log( 'ERROR AT MAIN FUNCTION ',e )
 } 
 } 

function printProgress( progress ){ 
 try { 
	 process.stdout.write( progress  );
	  process.stdout.clearLine( 0 );
	  process.stdout.cursorTo( 0 );
	  process.stdout.write( "\n" );
	 
 }  catch ( error ) { 
  const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
  const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
  
  console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
 } 
 } 

function cl( i ){ 

  console.log( i )
 } 



var overAllTimer;




var KiteConnect  =  require( "kiteconnect" ).KiteConnect;
exports.KiteConnect = KiteConnect;




require( 'dotenv' ).config(  )
let access_token;
let AccesTocken  =  require( './models/AccessTokens' );
// const api_key  =  process.env.api_key;
const api_key  =  'wkcurst2vu5obug7';
exports.api_key = api_key;



const pricePoint  =  require( './pricePoints' );

const ZerodhaAPI  =  require( './ZerodhaAPI' );

const ohlc  =  require( './scraping/ohlc' );
const {  getNextThursday  }   =  require( './getNextThursday.js' );
const { secondsToHms } = require('./fetchInstrumentsFunctions.js');
const { getHoldingInstruments } = require('./getHoldings.js');
const { otherCriteria } = require('./otherCriteria.js');
const { getNearestStrikes_unoptimized } = require('./getNearestStrikes_unoptimized.js');
// let today  =  new Date(  ).toISOString(  )//.slice( 0, 10 );
// const fetchInstrumentsForNewMint = require( './FetchInstrumentsForNewMint.js' )

const instruAll  =  FILE_LOCATION+'/instrumentsAll.json';

const EXPIRY  =  getCurrentExpiryDate(  );
console.log( EXPIRY,'EXPIRY' )




async function fetchInstrumentsForMining( accessToken ) { try { 
	

	
	  let dl  =  await Fetch.downloadInstruments(  );
	
	
	
	
	
	  let fileInputName  =  Path.resolve( __dirname, FILE_LOCATION, 'instruments.csv' )
	
	
	
	  let csvresult  =  await csvToJson(  ).fromFile( fileInputName )
	
	
	  Fs.unlink( fileInputName ,function( err ){ 
	    if( err ) return console.log( err );
	    // console.log( 'file deleted successfully' );
	 }  )
	
	
	 let filterByExpiryLessThanOrEqualToNextThursday=require('./filterByExpiryLessThanOrEqualToNextThursday')
	  
	 
	 let jsonObjMultiple  =  filterByExpiryLessThanOrEqualToNextThursday(csvresult)
	  
	
	//   console.log(jsonObjMultiple,'jsonObjMultiple')
	//   debugger;
	 
	//   csvresult.filter( j  => ( 
	//     ( 
	      
	//       j.exchange  ==  'NFO' && ( j.expiry  ==  EXPIRY 
	// 		// || j.expiry  ==  getBankNiftyExpiry(  )
	// 	   ) 

	// 	   || j.exchange=='NSE'
	      
	   
	//        )
	    
	    
	//      ))
	

	  let jsonObj1 = jsonObjMultiple;
	
	  let jsonObjAll  =  csvresult//.filter( j  => (( j.exchange  ==  'NFO' ) || j.exchange  ==  'NSE' ));
	  
	  
	  let jsonObjCommodity  =  csvresult.filter( j  => (( j.exchange  ==  'MCX' ) 
	   ));
	
	
	
	
	
	
	
	//   let fileOutputName  =  Path.resolve( __dirname, FILE_LOCATION,
	//    'instruments.json' )
	   
	 
	   let fileOutputName  =  Path.resolve(  FILE_LOCATION,
	   'instruments.json' )
	  
	  
	//   let jsonObjCommodityFile =  Path.resolve( __dirname, FILE_LOCATION, 'CommodityFile.json' )
	  let jsonObjCommodityFile =  Path.resolve( FILE_LOCATION, 'CommodityFile.json' )
	
	  let f  =  await new Promise(( res, rej )  => { 
	
	    Fs.writeFile( fileOutputName, JSON.stringify( jsonObj1 ), 'utf8',
	      function ( err ) { 
	        if ( err ) { 
	          console.log( "An error occured while writing JSON Object to File." );
	          return console.log( err );
	         } 
	        // console.log( fileOutputName + "JSON file has been saved." );
	
	        // let targetDir  =  Path.join( __dirname, FILE_LOCATION+'/instruments.json' );
	        let targetDir  =  Path.join( FILE_LOCATION+'/instruments.json' );
	
	
	        return Fs.copyFile( FILE_LOCATION+'/instruments.json', targetDir,
	
	          ( err )  => { 
	            if ( err ) throw err;
	            
	
	
	            Fs.writeFile( jsonObjCommodityFile, JSON.stringify( jsonObjCommodity ), 'utf8', function ( err ) { 
	              if ( err ) { 
	                console.log( "An error occured while writing JSON Object to File."+jsonObjCommodity );
	                return console.log( err );
	               } 
	             }  );
	
	          
	
	
	
	            return Fs.writeFile( instruAll, JSON.stringify( jsonObjAll ), 'utf8', function ( err ) { 
	              if ( err ) { 
	                console.log( "An error occured while writing JSON Object to File." );
	                return console.log( err );
	               } 
	
	
	// console.log( 'instruAll is copied to %s',instruAll )
	
	res( true );
	
	
	
	
	             }  );
	
	
	
	
	
	           }  );
	
	       }  )
	
	   }  );
	
	  console.log( 'code block of downloading completed' )
	
	
	
	  let jsonObj2  =  [];
	  let jsonObjWithOutCriteria  =  [];
	
	
	  let a  =  await getSymbols(  );
	
	
		
	  console.log( accessToken,'ACCESS TOKEN @285' )
	
	    let ohlcs  =  await ohlc( accessToken, a );

		// console.log( ohlcs );



	    let instruments1  =  require( FILE_LOCATION+'/instruments.json' );
	    let instruments  =  instruments1.filter( i =>( i.tradingsymbol.includes( 'NIFTY' ))
		|| i.tradingsymbol.includes( 'BANKNIFTY' )
		
		 )//.slice( 0,10 )
	    
		
		let strikes1  =  await getNearestStrikes_unoptimized( ohlcs, instruments )//.slice( 1,50 );
	

		let strikes = strikes1//.slice( 1,100 );
	    let symbols  =  [];
	    let len1  =  strikes.length;
	
	    console.log( '---------------code block of timer started total strikes',len1 )
	
	    let len  =  len1;
	    let intr  =  setInterval( async (  )  => { 
	      // var a111 = 0;
	
	      let e  =  strikes.pop(  )
	      // console.log( e,'e' )
	      //////////////////////////////////////////////
	
	
	      if ( typeof e  ==  'undefined' ) { 
	        clearInterval( intr );
	
	
	        let jsonObj3  =  await overnightScripts( jsonObj2 )
	
	
	        console.log( jsonObj2.length, 'json obj len' )
	        // console.log( 'Now starting new mint ' );
	
	        let write  =  await writeFinalScriptsTofile( jsonObj3, jsonObjWithOutCriteria );
	
	        console.log( 'finished ' );
	        return;
	        // fetchInstrumentsForNewMint( accessToken );
	
	        return false
	       } 
	      len--;
	
	      //////////////////////////////////////////////
	      let sec  =  len * TIMER / 1000;
	      let min  =  sec / 60
	      let sec1  =  sec % 60
	
	      let t  =  secondsToHms( sec )
	      overAllTimer = sec
	
	
	      let progress = `${ len } , 'left out of ', ${ len1 } , ' ', ${ t } , ' time left', ${ e.tradingsymbol } `;
	

         cl( progress )
	      // console.log( len, 'left out of ', len1, ' ', t, ' time left', e.tradingsymbol );
	      // printProgress( progress )
	
	      if ( e && typeof e !=  'undefined' ) { 
	       
	       
	      try { 
	
	          await setCurrentInstrumentParameters( e );
	      
	      
	         }  catch ( error ) { 
	        console.log( error,'LINE 353' )
	
	        strikes.push( e )
	       } 
	
	
	       } 
	      
	
	
	
	     } , TIMER )
	
	
	
	
	
	
	 
	
	
	
	  return true;
	
	  function   higherLowsCheck( pricePoints ) { 

		
		
		
		let { d0,d1,d2,d3,d4,d5,d6,d7 }  = pricePoints;
		
		if( 


		( d1.low>d2.low &&
		d2.low>d3.low  ) 
		||

		( d1.high>d2.high &&
			d2.high>d3.high )
		
		//&&
		// d3.low>d4.low 
		
		
		 ){ 
		
		return true
		 } else{ 
		
		
		return false;
		 } 
		
		
		
		
		 } 
	
	  async function setCurrentInstrumentParameters( e ) { 
		let instruAll  =  require( FILE_LOCATION+'/instrumentsAll.json' );

		console.log( accessToken,'accessToken @ 415' )
	    let a  =  new pricePoint( e.instrument_token, accessToken );
	
	
	    let c  =  await a.getPricePoints( 30, 'day' );
	
	

		// isHigerLows = higherLowsCheck( c )

		// if( isHigerLows == false ){ 


			
		// 	return false;
		//  } else{ 

		// 	console.log( e.instrument_token,'passed higher lows' )

		//  } 

	    e.pricePoints  =  c;
	
	
	    e.SevenDayMaxMin  =  c.SevenDayMaxMin;
	    e.chart  =  `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${ e.tradingsymbol } /${ e.instrument_token } `;

		let name = e.name;

	

		if( typeof instruAll.find( i =>i.tradingsymbol == e.name )!== 'undefined' ){ 

			let nameinstrumentToken = instruAll.find( i =>i.tradingsymbol == e.name ).instrument_token;
			let stockChart = `https://kite.zerodha.com/chart/ext/ciq/${e.exchange}/${ name } /${ nameinstrumentToken } `;
			e.stockChart = stockChart;
	

		 } 
		

	    e.seletedBuyingMethod  =  'MAX';
	    e.enterNowToTrade  =  false;
	    e.PlacedReverseOrder  =  false;
	    e.hasLiveTarget  =  false;
	    e.hasLivePosition  =  false;
	
	    e.previousPrice  =  0;
	    e.last_price  =  0;
	
	    if ( e.pricePoints ) { 
	
	      let {  otherCriteriaCheck, otherCriteriaObj  }   =  otherCriteria( e );
	      e.otherCriteria  =  otherCriteriaObj;
	      e.otherCriteriaCheck  =  otherCriteriaCheck;
	      if ( otherCriteriaCheck ) { 
	        jsonObj2.push( e );
	       }  else { 
	        jsonObjWithOutCriteria.push( e );
	       } 
	     }  else { 
	      console.log( `${ e.tradingsymbol } : pricePoints not set, so not pushing`, e.pricePoints );
	     } 
	   } 
	
	  async function FunctionProcedureForFutures( e ) { 
	    let instruForFuture  =  require( FILE_LOCATION+'/instrumentsAll.json' );
	
	    let niftyfut  =  instruForFuture.filter( i  => i.name  ==  'NIFTY' && i.expiry  ==  EXPIRY && i.instrument_type  ==  "FUT" )[0];
	    let a  =  new pricePoint( niftyfut.instrument_token, accessToken );
	    let c  =  await a.getPricePoints( 7, 'day' );
	
	    niftyfut.pricePoints  =  c;
	    niftyfut.SevenDayMaxMin  =  c.SevenDayMaxMin;
	
	    niftyfut.chart  =  `https://kite.zerodha.com/chart/ext/ciq/${e.exchange}/${ e.tradingsymbol }/${e.instrument_token } `;
	    niftyfut.seletedBuyingMethod  =  'MAX';
	    niftyfut.enterNowToTrade  =  false;
	    niftyfut.PlacedReverseOrder  =  false;
	
	
	    //  console.log( niftyfut )
	    jsonObj2.push( niftyfut );
	    jsonObjWithOutCriteria.push( niftyfut );
	
	
	    let bankniftyfut  =  instruForFuture.filter( i  => i.name  ==  'BANKNIFTY' && i.expiry  ==  getBankNiftyExpiry(  ) && i.instrument_type  ==  "FUT" )[0];
	
	
	
	
	    let abnf  =  new pricePoint( bankniftyfut.instrument_token, accessToken );
	    let cbnf  =  await abnf.getPricePoints( 7, 'day' );
	
	    bankniftyfut.pricePoints  =  cbnf;
	    bankniftyfut.SevenDayMaxMin  =  cbnf.SevenDayMaxMin;
	
	    bankniftyfut.chart  =  `https://kite.zerodha.com/chart/ext/ciq/${e.exchange}/${ e.tradingsymbol } /${ e.instrument_token } `;
	    bankniftyfut.seletedBuyingMethod  =  'MAX';
	    bankniftyfut.enterNowToTrade  =  false;
	    bankniftyfut.PlacedReverseOrder  =  false;
	
	    //  console.log( bankniftyfut )
	    jsonObj2.push( bankniftyfut );
	    jsonObjWithOutCriteria.push( bankniftyfut );
	   } 
	
 }  catch ( error ) { 
	console.log( error )
//   const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
//   const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
  
//   console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
 }} 







function getNearestStrikes( ohlc, instruments ) { try { 
	
	  const peUpperPercentage  =  1;
	  const peLowerPercentage  =  .97;
	  const ceUpperPercentage  =  1;
	  const ceLowerPercentage  =  .97;
	  
	
	
	  return Promise.resolve( 
	    Object.entries( ohlc ).reduce(( currentInstruments, [item, value] )  => { 
	
	
	      let symbol  =  item.split( ':' )[1];
	      let lastPriceMax  =  value.last_price * peUpperPercentage;
	      let lastPriceMin  =  value.last_price * peLowerPercentage;
	      let lastPrice  =  value.last_price;
	
	      let curInstrument  =  instruments.find( i  => { 
	        if ( symbol== 'NIFTY 50' ) { 
	          symbol  =  'NIFTY';
	         } 
	        if ( symbol== 'NIFTY BANK' ) { 
	          symbol  =  'BANKNIFTY';
	         } 
	        return i.name== symbol;
	       }  );
	
	
	
	      console.log( instruments.length );
	
	      return;
	      // console.log( curInstrument )
	
	     
	
	      if ( curInstrument ) { 
	
	
	        console.log(  )
	
	
	        if ( curInstrument.instrument_type== 'FUT' && ( curInstrument.name== 'NIFTY' || curInstrument.name== 'BANKNIFTY' )) { 
	          
	          console.log( curInstrument.tradingsymbol )
	         
	
	          curInstrument.spot_price  =  lastPrice;
	          currentInstruments.push( curInstrument );
	         }  else if ( curInstrument.instrument_type== 'CE' && curInstrument.strike > lastPrice /** ceLowerPercentage && curInstrument.strike < lastPrice * ceUpperPercentage*/ ) { 
	        
	          console.log( curInstrument )
	          
	          curInstrument.spot_price  =  lastPrice;
	          currentInstruments.push( curInstrument );
	         }  else if ( curInstrument.instrument_type== 'PE' && curInstrument.strike < lastPrice /** peUpperPercentage && curInstrument.strike > lastPrice * peLowerPercentage*/ ) { 
	          curInstrument.spot_price  =  lastPrice;
	
	          console.log( curInstrument )
	          currentInstruments.push( curInstrument );
	         } 
	       } 
	    return currentInstruments;
	     } , [] )
	
	
	
	   );
	
 }  catch ( error ) { 
  const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
  const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
  
  console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
 }} 


async function getSymbols(  ) { try { 
	
	
	
	  let instruments  =  require( FILE_LOCATION+'/instruments.json' );
	
	  let st  =  instruments.filter( i  => i.exchange  ==  'NFO' )
	    .map(( i )  => i.name )
	    .filter(( x, i, a )  => a.indexOf( x )== i );
	
	  let st2  =  instruments
	    .map(( i )  => i.instrument_token )
	    .filter(( x, i, a )  => a.indexOf( x )== i );
	
	  let instTockens  =  st.map(( s )  => { 
	  
	    let ar  =  instruments.filter( 
	      ( i )  => i.tradingsymbol  ==  s && i.exchange  ==  "NSE"
	     );
	
	    if ( typeof ar[0] !=  "undefined" ) { 
	      let instrument_token1;
	      if ( ar.length ) { 
	        let {  instrument_token  }   =  ar[0];
	        instrument_token1  =  instrument_token;
	       }  else { 
	        instrument_token1  =  0;
	       } 
	
	      return instrument_token1;
	     } 
	
	   }  );
	
	
	  let symboList  =  st.map(( s )  => { 
	
	    // console.log( 'from get symbls', s )
	
	    if ( s  ==  'NIFTY' ) { 
	      s  =  "NIFTY 50"
	
	     } 
	
	    if ( s  ==  'BANKNIFTY' ) { 
	      s  =  "NIFTY BANK"
	
	     } 
	    return "NSE:" + s;
	   }  ).filter(( x, i, a )  => a.indexOf( x )== i );;
	
	
	
	
	  let instruAll  =  require( FILE_LOCATION+'/instrumentsAll.json' );
	
	
	  let needed = ['NIFTY 50','INDIA VIX','NIFTY BANK'];
	  
	  
	  let segments = instruAll .filter( i =>i.segment == 'INDICES' && needed.includes( i.tradingsymbol ))
	
	
	    .map( j =>j.tradingsymbol )
	
	
	  console.log( symboList.length,'Total stocks ' )
	  console.log( 'segments length',segments.length )
	
	
	  // console.log( segments )
	
	
	
	  symboList.push( ...segments )
	
	  // console.log( symboList.length,'Total stocks after ' )
	  return symboList;
	
	
	
	  // let f =  await  this.getOHLC( this.accessToken, symboList );
	  // let t = await  this.getNearestStrikes(  );
	
	
	
	
	
	
	
	
	
	  // return st;
	
 }  catch ( error ) { 
  const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
  const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
  
  console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
 }} 
// let access_token  =  'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';









async function writeFinalScriptsTofile( jsonObj2, jsonObjWithOutCriteria ) { 


 try { 
	 return new Promise( async ( res, rej )  => { 
	
	
	
	
	
	
	    let fileOutputName  =  FILE_LOCATION+'/instrumentsForMining.json';
	    let targetDir  =  Path.join( FILE_LOCATION+'/instrumentsForMining.json' );
	
	    let out  =  await createAndMoveFileFromJson( fileOutputName, jsonObj2, targetDir );
	
	
	    let fileOutputNameWithOutCriteria  =  FILE_LOCATION+'/instrumentsForMiningWithOutCriteria.json';
	    let out2  =  await createAndMoveFileFromJson( fileOutputNameWithOutCriteria, jsonObjWithOutCriteria, targetDir );
	
	    res( out )
	    return;
	
	
	
	
	
	   }  )
	
	  return;
 }  catch ( error ) { 
  const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
  const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
  
  console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
 } 

 } 



function createAndMoveFileFromJson( fileOutputName, jsonObj2, targetDir ) { 

try { 
	  return new Promise(( res, rej )  => { 
	
	
	
	
	    Fs.writeFile( fileOutputName, JSON.stringify( jsonObj2 ), 'utf8',
	
	      function ( err ) { 
	        if ( err ) { 
	          console.log( "An error occured while writing JSON Object to File." );
	          return console.log( err );
	         } 
	        // console.log( fileOutputName + "JSON file has been saved." );
	
	
	        Fs.copyFile( FILE_LOCATION+'/instrumentsForMining.json', targetDir,
	          ( err )  => { 
	            if ( err ) throw err;
	            // console.log( 'source.txt was copied to destination.txt' );
	            res( true );
	            return;
	           }  );
	
	
	          res( true );
	          return;
	
	        
	
	       }  );
	      res( true );
	
	      return;
	
	   }  )
	
 }  catch ( error ) { 
  const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
  const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
  
  console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
 } 
 } 

function overnightScripts( jsonObj2 ) { 


  return new Promise( async ( res, rej )  => { 






    let overNights  =  []
    let pos  =  await getHoldingInstruments( access_token );


    if( typeof pos == 'undefined' ){ 

      console.log( 'failed to load holdings line@1002' );
      return ;
     } 

    let posln  =  pos.length

    console.log( 'total overnight ', posln )


    let PostionsTimer  =  setInterval( async (  )  => { 


      let e  =  pos.pop(  )
      posln--;



      if ( typeof e  ==  'undefined' ) { 
        console.warn( 'CLEARING POSITION FOR OVERNIGHT SCRIPTS' )
        clearInterval( PostionsTimer )

        res( jsonObj2 )

        console.log( 'where am i', jsonObj2.length )
        return false;
       } 
      try { 

        console.log( ' overnight left', posln, 'e', e );
        let instruAll  =  require( FILE_LOCATION+'/instrumentsAll.json' );

        let ln  =  jsonObj2.find( ci  => ci.tradingsymbol  ==  e )

       

		
        if ( typeof ln == 'undefined' ) { 


			console.log(  ' %s ABSENT IN TODAYS SCRIPT  ',e );
   
          let i  =  instruAll.filter( i  => i.tradingsymbol  ==  e )[0];
          let a  =  new pricePoint( i.instrument_token, access_token );
          let c  =  await a.getPricePoints( 7, 'day' );

	

          if ( typeof c  ==  'undefined' ) { 

            console.log( 'big problem with price points' )

            return false
           } 
          // console.log( c,'c' )
          i.pricePoints  =  c;
          i.SevenDayMaxMin  =  c.SevenDayMaxMin;

          i.chart  =  `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${ i.tradingsymbol } /${ i.instrument_token } `;
          i.seletedBuyingMethod  =  'MAX'
          i.enterNowToTrade  =  false;
          i.PlacedReverseOrder  =  false;

          console.log( 'pushing ', e, 'the overnight script' );
          jsonObj2.push( i );


         }  else { 

          console.log( 'Instrument ', e, 'Found no issues' )
         } 

       } 

      catch ( error ) { 

        const lineNumber  =  error.stack.split( '\n' )[1].match( /\d+/ )[0];
        const functionName  =  error.stack.split( '\n' )[1].match( /\w+\s+\w+/ )[0].trim(  );
        
        console.error( `Error occurred in function "${ functionName } " on line ${ lineNumber } ` );
        console.log( error, 'error of position check' )
       } 








     } , 505 ) //pos for each


// res( true )


   }  )
 } 


async function attachMIsPricePoints( jsonObj2, accessToken ) { 

  return;
  return new Promise( async ( res, rej )  => { 

    const interval  =  333;
    let delayTimer  =  setInterval( async (  )  => { 

      let misPricePoints1  =  new misPricePoints(  )
      let pp  =  await misPricePoints1.getMisTargets(  )

      res( pp )

     } , interval );




   }  )
 } 


function getBankNiftyExpiry(  ){ 

	let { bankNifty }  = getNextThursday(  );

	return bankNifty;
 } 
function getCurrentExpiryDate(  ) { 


	// const moment  =  require( 'moment' );

	


	return '2023-12-14'
let { nifty }   = getNextThursday(  );
return nifty;
// let m = moment(  );

return "2023-11-02";
	
	const lastThursday  =  getLastThursdayOfMonth( m );
	console.log( `Last Thursday of the month: ${ lastThursday } ` );
	


	return  lastThursday;
 } 

function getLastThursdayOfMonth( date = moment(  )) { 
	// Get the last day of the month
	const lastDayOfMonth  =  date.endOf( 'month' );
  
	// Find the last Thursday of the month
	let lastThursday  =  lastDayOfMonth.clone(  ).startOf( 'day' ).subtract( 1, 'day' );
	while ( lastThursday.day(  ) !==  4 ) { 
	  lastThursday.subtract( 1, 'day' );
	 } 
  
	// Check if the last Thursday falls on a holiday
	const holidays  =  [
	  '2022-01-26',
	  '2022-03-01',
	  '2022-03-18',
	  '2022-04-14',
	  '2022-04-15',
	  '2022-05-03',
	  '2022-08-09',
	  '2022-08-15',
	  '2022-08-31',
	  '2022-10-05',
	  '2022-10-24',
	  '2022-10-26',
	  '2022-11-08',
	  '2023-01-26',
	  '2023-03-07',
	  '2023-03-30',
	  '2023-04-04',
	  '2023-04-07',
	  '2023-04-14',
	  '2023-04-21',
	  '2023-05-01',
	  '2023-06-28',
	  '2023-08-15',
	  '2023-09-19',
	  '2023-10-02',
	  '2023-10-24',
	  '2023-11-14',
	  '2023-11-27',
	  '2023-12-25'
	];
  
	if ( holidays.includes( lastThursday.format( 'YYYY-MM-DD' )) ) { 
	  // If the last Thursday falls on a holiday, get the previous day
	  lastThursday.subtract( 1, 'day' );
	 } 
  
	// Check if there are less than 14 days to the last Thursday
	if ( lastDayOfMonth.diff( lastThursday, 'days' ) < 14 ) { 
	  // If there are less than 14 days, get the last Thursday of the next month
	  const nextMonth  =  date.add( 1, 'month' );
	  return getLastThursdayOfMonth( nextMonth );
	 } 
  
	// Return the last Thursday and the holidays array
	return {  lastThursday: lastThursday.format( 'YYYY-MM-DD' ), holidays  } ;
   } 


