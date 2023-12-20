const fs  =  require( "fs" );

var moment = require( 'moment' )
  const instruments  =  require( "./appv3/public/instruments/instrumentsForMining.json" );



  

    //return moment( iso ).format( "DD" );

  
  instruments.forEach( element  => { 
    
console.log( element.pricePoints.d1.normalDate )



let m = moment(  );

let h = moment(  ).hours(  );
let mnt = moment(  ).minutes(  );
let day = moment(  ).isoWeekday(  )

console.log( day );

return


// if( 
    
//     element.pricePoints &&
//     element.pricePoints.d1  &&
//     element.pricePoints.d1.normalDate 
    
//      )
// if( element.pricePoints.d1.normalDate.split( "-" )[0]!= 22 ){ 



//     console.log( element.tradingsymbol,'has issue with date' )
//  } 


   }  );
