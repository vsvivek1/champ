const instruments = require( './appv3/public/instruments/instruments.json' );

module.exports  =  class Instruments { 
    static getInstrumentToken( symbol ){ 
 let b =    instruments.filter( i =>{ 
return i.tradingsymbol.trim(  ) == symbol


     }  )[0]
    // console.log( 'b',b )
    return b
    // console.log( 'b',b )
 } 

 } 
// let a = getInstrumentToken( "IDEA" )

// console.log( 'a',a );

// fs.readFile( instruments, function( err, data ) { 
      
//     // Check for errors
//     if ( err ) throw err;
   
//     // Converting to JSON
//     const users  =  JSON.parse( data );
      
//     console.log( users ); // Print users 
//  }  );
// // console.log( 'len',len );