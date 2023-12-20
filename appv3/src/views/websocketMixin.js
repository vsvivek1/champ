import sessionMixin from '@/views/sessionMixin';

export default { 
mixins:[sessionMixin],
data(  ){ 
return{ 
connectionOpened:false,


 } 

 } ,
computed:{ 
    api_key(  ){ 

        return this.session.api_key;
     } ,
    access_token(  ){ 

        return this.session.access_token;
     } 

 } ,
mounted(  ){ 
this.initiateWebSockets(  );

 } ,
methods:{ 
     initiateWebSockets(  ){ 
        // Javascript example.
        console.log( 'websockets function' )

        const promise1=new Promise(  ( res,rej )=>{ 
            

        
            let wsUrl=`wss://ws.kite.trade?api_key=${ this.api_key } &access_token=${ this.access_token } `
    
            
            var ws = new WebSocket( wsUrl );
           
            res( ws );
            resj( 'FAILED TO OPEN WEB SOCKET SERVICE FROM ZERODHA' )
            
                         }  );


                        promise1.then( ws=>{ 

                            var message = { "a": "subscribe", "v": [408065, 884737] } ;
                            console.log( 'wsUrl',ws )
                            // 
                            ws.onopen = function(  ) { 
                                ws.send( JSON.stringify( message ))

                             } ;

                            ws.onmessage = function( event ) { 
                                console.debug( "WebSocket message received:", event );
                               } ;


                         }  );



                       
      
        // ws.onopen(  )=function(  ){ 

        //     this.connectionOpened=true;
        // primise1.then(  )
        //  } 

       

     
//         ws.onclose(  )=function(  ){ 

// this.connectionOpened=false;
//          } 

      
//         ws.onmessage=function( event ) { 
//             console.debug( "WebSocket message received:", event );
//            } ;

return false;


        
        
                   } ,


 } 
 } 