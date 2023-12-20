var KiteConnect  =  require( "kiteconnect" ).KiteConnect;
const mongoose  =  require( 'mongoose' );
const con  =  require( './MongoseConnect' )
const api_secret  =  process.env.api_secret;
const api_key  =  process.env.api_key;
require( 'dotenv' ).config(  );

const Fs  =  require( 'fs' )
const ZerodhaAPI  =  require( './ZerodhaAPI' );

let today  =  new Date(  ).toISOString(  ).slice( 0, 10 );

const instrumentsForMining  =  require( './appv3/public/instruments/instrumentsForCommodity.json' );
// const {  setInterval  }   =  require( "timers/promises" );


// module.exports  =  
class HourlyData { 

    constructor( accessToken = 'wbVwUGoQ3CKJwBFjhU1Nu9wF4ADhTfmg' ) { 
        
this.accessToken = accessToken;

     } 


  async   fetchHourlyData(  ) { 

    return new Promise( async ( res,rej ) =>{ 


        let createAndMoveFileFromJson  =  require( './createAndMoveFileFromJson' );
        console.log( 'timer for hourly lows' )
         let instruments  =  require( './appv3/public/instruments/instrumentsForCommodity.json' )
        //  let instruments  =  require( './appv3/public/instruments/instrumentsForCommodity.json' )

       
        let symbols  =  instruments.filter( ix =>ix.instrument_type == "FUT" ).
        
        map( r  => r.instrument_token  ).filter(( val,index,arr ) =>{ 
            return arr.indexOf( val ) == index
         }  )
        

        console.log( symbols,symbols.length )
        
        //.slice( 1,10 )

     console.log( this.accessToken,'this.accessToken' )
        let jsonObj2  =  await ZerodhaAPI.getHourlyCandleLowsCommodity( this.accessToken,
             symbols )
console.log( jsonObj2.length,'json obj' )

        // let targetDir  =  './appv3/public/instruments/hourlyCandleData.json'
        // let fileOutputName  =  './appv3/public/instruments/hourlyCandleData.json'
        
           let targetDir  =  './appv3/public/instruments/hourlyCandleDataCommodity.json'
        let fileOutputName  =  './appv3/public/instruments/hourlyCandleDataCommodity.json'

        console.log( jsonObj2.length,'jsonObj2' )
      let a =  await  createAndMoveFileFromJson( fileOutputName, jsonObj2, targetDir )


    //   console.log( a,'a' )

      res( 'hi' )
return;

 }  )

     } 



    async updateAccessToken(  ) { 


        return new Promise( async ( res, rej )  => { 




            const uri  =  "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites = true&w = majority";
            let mongo  =  await mongoose.connect( uri, 
                {  useNewUrlParser: true, useUnifiedTopology: true  }  );

                let AccesTocken  =  require( './models/AccessTokens' );
                
            let access_token_global  =  await
             AccesTocken.findOne( {  'date': today  } , 'access_token' )
             
             .
            
            then( e  => e.access_token );
           

            this.accessToken  =  access_token_global

            res( access_token_global );

         return;

         }  )

        // return ;
     } 





 } 

// ( async function(  ){ 
//     console.log( 'immediate start' );
//     let a  =  new HourlyData(  )
//    let b  = await  a.updateAccessToken(  );

//   let c =  await  a.fetchHourlyData(  )
//  let d =  await a.test(  )


//    mongoose.disconnect(  )

//  }  )(  )

( async function(  ){ 
    console.log( 'immediate start' );
    let a  =  new HourlyData(  )
   let b  = await  a.updateAccessToken(  );

  
  let c =  await  a.fetchHourlyData(  )



   mongoose.disconnect(  )

   

 }  )(  )

setInterval((  ) =>{ 
// return;
    

 var d  =  new Date(  );
            let hours  =  d.getHours(  );
            let minutes  =  d.getMinutes(  );
            let seconds  =  d.getSeconds(  );
        
            let times = [16,46,31,1]
           

            if ( hours<15 & times.includes( minutes )){ 
  ( async function(  ){ 
    console.log( 'starting inside loop %s hours %s minutes',hours,minutes );
    let a  =  new HourlyData(  )
   let b  = await  a.updateAccessToken(  );

  
  let c =  await  a.fetchHourlyData(  )



   mongoose.disconnect(  )

   

 }  )(  )


             } 

 } ,60*1000 )




