var KiteConnect  =  require( "kiteconnect" ).KiteConnect;
// const accessToken  =  require( './models/AccessTokens' );
const mongoose  =  require( 'mongoose' );
const con  =  require( './MongoseConnect' )
const api_secret = process.env.api_secret;
const api_key = process.env.api_key;
require( 'dotenv' ).config(  );
const Order = require( './models/Orders' );
const FailedOrder = require( './models/FailedOrder' );


class ZerodhaAPI { 

// self =  this;

    constructor(  ) { 
        const url  =  process.env.MONGO_URL + process.env.DB_NAME;
        const myDbName  =  process.env.DB_NAME;

      // var self = this;
        
        
        // mongoose.connect( url + myDbName, { 
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true
        //  }  );

        // this.access_token = access_token;


        // this.getAccessTocken(  );
     } 



    static async NrInstruments( accessToken,range ){ 
      var kc  =  new KiteConnect( { 
        api_key: api_key,


        access_token: accessToken
       }  );

      let instruments =  await  kc.getInstruments(  ); 
      
      let eq = 0;

     }   
    
    static async modifyOrder( accessToken,ordersString ){    
      var kc  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  ); 

      var modifiedOrderResults = [];
if( ordersString.length == 0 ){ 

  console.log( 'modify order for stopp loss ordersString.length 0 ' )

  return false
 } else{ 
  console.log( 'order string',typeof( ordersString ))

 } 

      

      // return false;
    //  return
     
    
    //  ordersString.map( async o =>{ 
      let t1;

if( ordersString.length == 1 ){ 

   t1 = 0;
 } else{ 

   t1 = 501;
 } 
    
    
      let timer = setInterval( async (  ) =>{ 

let o =  ordersString.pop(  );

if( typeof o == 'undefined' ){ 


  clearInterval( timer );

  return modifiedOrderResults ;

 } 
//04952355442
      try { 

        /// trading symbol is not there check that
        console.log( 'order string',o.variety,o.order_id,o.params,o.tradingsymbol,'\n','\n','\n','\n', );

        let modifiedOrderResult =  await  kc.modifyOrder( o.variety, o.order_id, o.params ) ;

        
        console.log( '\n','\n','\n','\n','modifiedOrderResult',modifiedOrderResult,'\n','\n','\n','\n', )
        modifiedOrderResults.push(  modifiedOrderResult );
       }  catch ( error ) { 
        console.log( 'SOME ERROR',error )


        if( error.message == 'Maximum allowed order modifications exceeded.' ){ 


          console.log( 'what to do max orders hogaya' );
          // let o2 = await  kc.cancelOrder( o.variety, o.order_id );
        
          // console.log( 'order cancelled',o2 )

          // return o2;

          // cancelordt
         } 
       } 

     

       } ,t1 )
          
   

     } 
    
    
    static async GetLTP( accessToken,instruments ){    
      var kc  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  );     
      let ltps =  await  kc.getLTP( instruments );       
    return ltps;

     }   
    
    static async getMargins( accessToken ){    
      var kc  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  );   
      
      // console.log( 'getMargins( accessToken )',accessToken );
      let ltps =  await  kc.getMargins(  );       
    return ltps;

     } 

    static async getInstruments( accessToken ){ 

      var kc  =  new KiteConnect( { 
        api_key: api_key,


        access_token: accessToken
       }  );

      let instruments =  await  kc.getInstruments(  );



      let ins =  instruments.filter( i =>{ 
        
      return  true;
      return   i.instrument_type = 'FUT' && i.name!= '' && i.segment == 'NSE'
        
       }  )

// console.log( 'ins',ins )
      let ln = ins.length;
      // let outer = ln/500;

      let ar = []
      let outer = [];
      let i = ins.forEach(( i,index ) =>{ 


        let sym = i.segment+":"+i.tradingsymbol;
ar.push( sym );

if( index%500 == 0 ){ 
  let t
  kc.getQuote( t ).then( r =>{ 

    if( r.oi!= 0 ) { 

      t = r;
     } 
// console.log( 'qoute',t );

   }  )

  outer.push( ar );
  ar = [];


 } 



       }  )


      // console.log( 'outer',outer )
      return ins;
     } ;
    
static IsJsonString( str ) { 
  try { 
      JSON.parse( str );
   }  catch ( e ) { 
      return false;
   } 
  return true;
 } 



    static async PlaceBracketOrder( accessToken,ZerodhaParams,sessionString ){ 
      var kc  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  );


      let session = {  } ;

      let s = ZerodhaAPI .IsJsonString( sessionString )
      if( s ){ 

        let session = JSON.parse( sessionString );
       } 
      

      let arr = JSON.parse( arr1 );
      arr.forEach( a =>{ 
        // let testObj = Object.keys( a ).length== 0 && a.constructor== Object
        
        let a1 = {  } ;
        if( JSON.stringify( a )!= JSON.stringify( a1 ))
        { 
           
               kc.placeOrder( a.variety, a.params )
        
                   .then( order_id =>{ 
        
                    console.log( 'order_id',order_id.order_id )
        
        // let res = JSON.parse( order_id );
        let id = order_id.order_id
                    const order = new Order( { 
        
                      orderDetail:a,
                      order_id:id,
                      session:session
                     }  );
                  
                    order.save(  ).then( r =>{ 
                  
                      // console.log( 'r',r )
                     }  ) .catch( e =>console.log( 'errror in saving order',e )) ;  
        
                    console.log( id )
                    }  ).catch(( e ) =>{ 
        
                    console.log( 'error',e )
                    }  )
        
                   } else{ 
        
                    console.log( 'empty' )
                   } 
        
                   }  )


     } 

    static async PlaceTarget( accessToken,ZerodhaParams,sessionString ){ 
       

      // console.log( 'essionString',sessionString );
      // return false;


      return new Promise(( res,rej ) =>{ 


     
      let session = {  } ;

      let s = ZerodhaAPI .IsJsonString( sessionString )
      if( s ){ 

        let session = JSON.parse( sessionString );
       } 
      
      

      
        var kc  =  new KiteConnect( { 
            api_key: api_key,
            access_token: accessToken
           }  );
        //   return ZerodhaParams;
          let arr = JSON.parse( ZerodhaParams );

        //  console.log( 'this is array before strigify test',arr );
let response = [];

let currentId = -1;

let out = [];
          // arr.forEach( async a =>{ 

            let tm = setInterval( async (  ) =>{ 

let a = arr.pop(  );

if( typeof a == 'undefined' ){ 

clearInterval( tm );
res( out );
return ;

 } 

// let testObj = Object.keys( a ).length== 0 && a.constructor== Object


// console.log( a,'a' )
let a1 = {  } ;


if( typeof a.variety == 'undefined' ){ 

  return false;
 } 



if( JSON.stringify( a )!= JSON.stringify( a1 ))//ch3cnking of null value of aa  was a workaround
{ 
   

  // console.log( a.variety,'a.variety',a.params,'a.params' );


     let placeOrderOutput = await   kc.placeOrder( a.variety, a.params )

           .then( order_id =>{ 

            // console.log( 'order_id',order_id.order_id )

// let res = JSON.parse( order_id );
let id = order_id.order_id

currentId = order_id.order_id;

out.push( order_id.order_id )
            const order = new Order( { 

              orderDetail:a,
              order_id:id,
              session:session
             }  );

            if( currentId ){ 

              let resObj = {  } ;
              resObj.orderDetail = a;
              resObj.order_id = currentId
              resObj.session = session;
              resObj.status = 'COMPLETED'
              resObj.error_msg = 'NO_ERROR'
              
              response.push( resObj )

             } 

            
          
            // order.save(  ).then( r =>{ 
          
            //   // console.log( 'r',r )
            //  }  ) .catch( e =>console.log( 'errror in saving order',e )) ;  

            // console.log( id,'order id' )
            }  ).catch(( e ) =>{ 

            console.log( 'BUY/SELL ERROR',e.message )

            let resObj = {  } ;
            resObj.orderDetail = a;
            resObj.order_id = currentId;
            resObj.session = session;
            resObj.status = 'FAILED'
            resObj.error_msg = e;
            response.push( resObj )

            // console.log( 'error response', resObj );

            // const FailedOrder1 = new FailedOrder( resObj );
          
            // FailedOrder1.save(  )

            }  ).catch( e =>console.log( 'errror in saving  failed order',e )) ; 

          

           } else{ 

            console.log( 'empty' )
           } 

         

           } ,501 )



         }  )

     } 


    static async getOrders( accessToken ){ 
      var kc  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  );

      // return accessToken;
      // return accessToken;

      let out;
      let orders = await kc.getOrders(  ).then( 

res =>{ 
out = res;

 } 

       ).catch( e =>{ 

        out = e;
       }  );
      return out;
      
     } 


    static convertIsoDateToIST( iso ){       let moment = require( 'moment' );
        
        return moment( iso ).format( 'DD-MM HH:mm' )
    
     } 

    static async getHourlyCandleLows( accessToken,symbols1 ){ try { 
	
	      return new Promise(( res,rej ) =>{ 
	        var kc2  =  new KiteConnect( { 
	          api_key: api_key,
	          access_token: accessToken
	         }  );
	
	
	
	        let totalTime = 333*symbols1.length;
	      
	
	        let moment = require( 'moment' );
	      
	        let from =  moment(  ).subtract( 1, "days" ).hours( 9 ).minute( 15 ).format( 'Y-MM-DD HH:mm:ss' );
	        let to =  moment(  ).format( 'Y-MM-DD HH:mm:ss' );//.toString(  )//.format( 'Y-MM-DD hh:mm:ss' );
	   
	let symbols = symbols1//.slice( 0,20 )
	        let out = [];
	
	     var ln = [...symbols].length;   
	     var instrumentsForMining1  =  require( "./appv3/public/instruments/instrumentsForMining.json" );
	    //  var instrumentsForMining1  =  require( "./appv3/public/instruments/instrumentsForCommodity.json" );
	   
	    
	    const ti = 501;
	let t = setInterval( async (  ) =>{ 
	 
	
	
	  let symbol = symbols.pop(  )
	
	
	
	
	
	  
	  if( typeof symbol == 'undefined' ){ 
	
	       res( out );
	  clearInterval( t );
	
	  return 
	     } 
	
	    console.log(  "%s out of %s time left is %s of %s fetiching %s",   
	    
	    symbols.length ,ln,symbols.length*ti/( 1000 ),totalTime/( 1000 ),symbol )
	
	  try { 
	
	    let res =  await kc2.getHistoricalData( symbol,'15minute',from,to,false );
	
	  
	    ln--
	
	
	
	    let ob = {  } ;
	
	    ob.instrument = instrumentsForMining1.filter( i =>i.instrument_token == symbol )[0]
	    ob.instrument_token = symbol;
	
	
	    let ln2 = res.length;
	res.forEach(( e,index,resObj ) =>{ 
	
	e.dateIST = ZerodhaAPI.convertIsoDateToIST( e.date )
	
	e.range = ( e.high-e.low ).toFixed( 1 );
	e.rangeBreakOutTarget = e.high+( e.range/2 ).toFixed( 1 );
	e.rangeBreakDownTarget = e.low-( e.range/2 ).toFixed( 1 );
	
	
	// console.log( e.range,e.rangeBreakOutTarget,e.rangeBreakDownTarget,'e.range' )
	
	// if( index >3 ){ 
	
	  let c1 = resObj[ln2-4]
	  let c2 = resObj[ln2-3]
	  let c3 = resObj[ln2-2]
	  let c4 = resObj[ln2-1];
	
	  if( 
	    typeof c1  == 'undefined' ||
	    typeof c2  == 'undefined' ||
	    typeof c3  == 'undefined' ||
	    typeof c4  == 'undefined' 
	    
	    
	     ){ 
	
	
	      return false;
	     } 
	
	  c1.range = c1.high-c1.low;
	  c2.range = c2.high-c2.low;
	  c4.range = c4.high-c4.low;
	  c3.range = c3.high-c3.low;
	
	  if( Math.min( c1.range,c2.range,c3.range,c4.range ) == c4.range && c4.range!= 0 ){ 
	
	
	    e.nr4 = true
	// console.log( c1.range,c2.range,c3.range,c4.range,'nr4 true' )
	
	   } else{ 
	    e.nr4 = false;
	
	   } 
	
	
	//  } 
	
	
	 }  )
	
	
	
	
	    ob.prices = res
	
	    // console.log( res,'res' )
	
	    if( res.length == 0 ){ 
	
	      console.log( res,'res' )
	
	      console.log( ob.instrument.tradingsymbol,'is missing ',{ symbol }  )
	     } 
	
	    // let out1 = { [symbol]:ob } 
	      out.push( ob )
	
	   } 
	    catch ( error ) { 
	     console.log( error, 'this error ano' )
	     } 
	  
	   
	  
	
	
	 } ,ti )
	
	
	      
	         }  )
	
	
	     
	    
 }  catch ( error ) { 
	console.log( 'error in zerodha api get hourlycandle low function',error,this )
 }} 



   static async getHourlyCandleLowsCommodity( accessToken,symbols1 ){ 
      return new Promise(( res,rej ) =>{ 
        var kc2  =  new KiteConnect( { 
          api_key: api_key,
          access_token: accessToken
         }  );



        let totalTime = 333*symbols1.length;
      

        let moment = require( 'moment' );
      
        let from =  moment(  ).subtract( 4, "days" ).hours( 15 ).minute( 15 ).format( 'Y-MM-DD HH:mm:ss' );
        let to =  moment(  ).format( 'Y-MM-DD HH:mm:ss' );//.toString(  )//.format( 'Y-MM-DD hh:mm:ss' );
   
let symbols = symbols1//.slice( 0,20 )
        let out = [];

     var ln = [...symbols].length;   
    //  var instrumentsForMining1  =  require( "./appv3/public/instruments/instrumentsForMining.json" );
    var instrumentsForMining1  =  require( "./appv3/public/instruments/instrumentsForCommodity.json" );
     
let t = setInterval( async (  ) =>{ 
 


  let symbol = symbols.pop(  )





  
  if( typeof symbol == 'undefined' ){ 

       res( out );
  clearInterval( t );
  return 
     } 
    // console.log( { symbol }  )
    let tradingsymbol = instrumentsForMining1.filter( i =>i.instrument_token == symbol )[0].tradingsymbol

    console.log(  "%s out of %s time left is %s of %s fetiching %s",   
    
    symbols.length ,ln,symbols.length*333/( 1000*60 ),totalTime/( 1000*60 ),tradingsymbol )

  try { 

    let res =  await kc2.getHistoricalData( symbol,'15minute',from,to,false );

  
    ln--



    let ob = {  } ;

    ob.instrument = instrumentsForMining1.filter( i =>i.instrument_token == symbol )[0]

    // console.log( ob.instrument )
    ob.instrument_token = symbol;


    let count = 0;

res.forEach(( e,index,resObj ) =>{ 

  count = count+1;
e.dateIST = ZerodhaAPI.convertIsoDateToIST( e.date )
console.log( { index } ,'index' )
if( index >3 ){ 

  let c1 = resObj[index-3]
  let c2 = resObj[index-2]
  let c3 = resObj[index-1]
  let c4 = resObj[index];

  c1.range = c1.high-c1.low;
  c2.range = c2.high-c2.low2
  c4.range = c4.high-c4.low;
  c3.range = c3.high-c3.low;

  if( Math.min( c1.range,c2.range,c3.range,c4.range ) == c4.range ){ 

console.log( c1.range,c2.range,c3.range,c4.range,'nr4 true' )

   } else{ 

    console.log( c1.range,c2.range,c3.range,c4.range,'nr4 false' )
   } 


 } 


 }  )

    ob.prices = res;

    

    let out1 = { [symbol]:ob } 

    if( res.length!= 0 ){ 
      console.log( res,'res' )
      out.push( ob )

     } 
     
   } 
    catch ( error ) { 
     console.log( error, 'this error ano' )
     } 
  
   
  


 } ,501 )


      
         }  )


     
     } 
  

    static async getClosingCandleData( accessToken,symbols ){ 

      return new Promise(( res,rej ) =>{ 


     
      var kc2  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  );


      let moment = require( 'moment' );
      // subtract( 1, 'days' )
        let from =  moment(  ).hours( 9 ).minute( 15 ).format( 'Y-MM-DD HH:mm:ss' );
        let to =  moment(  ).format( 'Y-MM-DD HH:mm:ss' );//.toString(  )//.format( 'Y-MM-DD hh:mm:ss' );


   

        let out = [];

     var ln = symbols.length;   
let t = setInterval( async (  ) =>{ 


  let symbol = symbols.pop(  )
  try { 
    // console.log( symbol )
    let res =  await kc2.getHistoricalData( symbol,'day',from,to,false );
    let ob = { symbol:res } ;
   
    out.push( ob )
    // console.log( res )
   } 
    catch ( error ) { 
      // console.log( error )
     } 
  
    
    ln--;
if( ln == 0 ){ 
  res( out );
clearInterval( t )

 } 

    
  


 } ,501 )


      
         }  )
       } 
    

    


    static async getPositions( accessToken ){ 

      // let misPricePoints = require( './class/misPricePoints' );

      // let pp  =  misPricePoints( accessToken, )
    

      var kc  =  new KiteConnect( { 
        api_key: api_key,
        access_token: accessToken
       }  );

      // return accessToken;
      // return accessToken;

      let out;
      let orders = await kc.getPositions(  ).then( 

res =>{ 
out = res;

 } 

       ).catch( e =>{ 

        out = e;
       }  );
      return out;
      
     } 

    static async  getHoldingsFromZerodha ( accessToken ) { 
        var kc  =  new KiteConnect( { 
          api_key: api_key,
          access_token: accessToken
         }  );
        let tmp;
        
        console.log( 'accessToken',accessToken )
      let holding  =  await  kc.getHoldings(  ).then( res =>{ 
            
      tmp = res;
      
   
         }  ).catch( err =>{ 
      
      console.log( 'got an error',err )

      return err;
      
         }  );
      
      
        // let access_tocken = getAccessTocken( request_tocken );
        
      
        return tmp
        // .forEach( h =>h.selected = false );
      
       } 
   
   

      static async getDaysPrice( accessToken,instrument_token ){ 
        var kc  =  new KiteConnect( { 
          api_key: api_key,
          access_token: accessToken,
         }  );
       let result =  await kc2.getHistoricalData( instrument_token, '5minute', 
        this.FromDate(  ), this.ToDate(  ), false )


       } 
      static async  getQuoteFromZerodha ( accessToken,aryOfInstruments ) { 

        
        var kc  =  new KiteConnect( { 
          api_key: api_key,
          access_token: accessToken,
         }  );


  
       return kc.getQuote( aryOfInstruments ).then( res =>{ 
        // console.log( 'getQuoteFromZerodha ',res )
        return res

        
           
   
      
   
         }  ).catch( err =>{ 
      
      console.log( 'got an error from get quote from zerodha ',err )
      
         }  );
      
      
      
      
       } 



    static FromDate(  ) { 
        var moment  =  require( 'moment' );
    
        
    
        return moment( { hour: 9, minute: 15 }  ).format( 'Y-M-D hh:mm:ss' );
    
     } 
    
   static ToDate(  ) { 
        var moment  =  require( 'moment' );
    
      
    
        return moment( { hour: 15, minute: 30 }  ).format( 'Y-M-D hh:mm:ss' );
    
     } 
    static async generateSession( request_tocken ) { 

        var kc  =  new KiteConnect( { 
            api_key: api_key
         }  );
        
        if( request_tocken!= null ){ 

            let access_token
          let session = await  kc.generateSession( request_tocken, api_secret );

          return session;
          

         } 
       

     } 

    getAccessTocken( request_tocken ) { 


        //check todays access toekn is stored in  mongo

        let today  =  new Date(  ).toISOString(  ).slice( 0, 10 );
        let qry  =  {  } ;
        qry.date  =  today;
        accessToken.find( qry ).then( r  => { 

                if ( r.length  ==  0 ) { 
                    //else get it and store it

                  

                 } 


                return getAccessTocken;

             } 

           
         );
    return;

    // accessToken.deleteMany( qry ).then( r =>console.log( 'r',r ))
    // return;


    // const At = new accessToken(  );

    // console.log( 'at',At )
    accessToken.find( qry ).then( r  => { 

        console.log( r )
     }  );
    return;

    accessToken.find( qry, res  => console.log( res ))
    return false;



    //return access token

    //initialize kc object using access token


    if ( access_token  ==  null ) { 

        kc.generateSession( request_tocken, api_secret )
            .then( function ( response ) { 



                access_token  =  response.access_token;


                console.log( 'Success in getting access tocken', access_token )
             }  )
            .catch( function ( err ) { 
                console.log( 'Getting request Tocken Failed', err );
             }  );

     } 


    return getAccessTocken;
 } 



 } 

let a  =  new ZerodhaAPI( '123' );

module.exports  =  ZerodhaAPI;