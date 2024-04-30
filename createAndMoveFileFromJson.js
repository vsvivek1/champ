const Fs  =  require( 'fs' )

module.exports = function createAndMoveFileFromJson( fileOutputName,jsonObj2,targetDir ){ 



  
    return new Promise(( res,rej ) =>{ 
    
    
    
    
  Fs.writeFile( fileOutputName, JSON.stringify( jsonObj2 ), 'utf8',
    
    function ( err ) {     
                      if ( err ) { 
                      console.log( "An error occured while writing JSON Object to File." );
                      // return console.log( err );

                      rej( err );
                      return;
                       } 
                       console.log( fileOutputName+" JSON file has been saved." );
    
    
                    // Fs.copyFile( fileOutputName, targetDir, 
                    // ( err )  => { 
                    //           if ( err ) throw err;
                    //           console.log( 'source.txt was copied to destination.txt' );
  
                    //           res( 'ok' )
                    //           return ;
                    //            }  );
    
    
    
    
                           

                              console.log( fileOutputName,'is moved' )
                             
                              res( 'ok here' );
  
                               return ;
    
                     }  );

                 
                    
     return 123;
                   }  )
      
     } 


exports.createAndMoveFileFromJson = createAndMoveFileFromJson;