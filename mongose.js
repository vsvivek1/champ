const AcceesTocken = require( './models/AccessTokens' );
const mongoose = require( 'mongoose' );
require( 'dotenv' ).config(  );
const url = process.env.MONGO_URL+process.env.DB_NAME;
const myDbName = process.env.DB_NAME;
mongoose.connect( url+myDbName,{  useNewUrlParser: true,useUnifiedTopology: true  }  );

let today = new Date(  ).toISOString(  ).slice( 0,10 );


const At = new AcceesTocken( 

    { 
        _id:new mongoose.Types.ObjectId(  ),
        date:today,
        access_token:123,
        customerId:'DV',
        age:123

     } 

    

 );

At.save(  ).then( res =>{ 

    console.log( 'result of saving',res )
 }  ).catch(( e ) =>{ 

    console.log( 'got an error',e )
 }  )