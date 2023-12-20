import {  io  }  from "socket.io-client";
const socket  =  io( "http://127.0.0.1:4000"

,
{ 
    transports: ['websocket'],

 } 
 );
export default { 

    
    mounted(  ) { 
        // this.cl( 'mounted' )
           var cl = this.cl;
        
        
           this.setTradingType(  );
        
            this.itype  =  this.$route.params.itype;
            this.loopGetQuotesAndMutateInstruments(  );
        
            this.nifty = this.instruments.filter( i =>i.segment == 'INDICES' );
        
        
            this.getMargins(  );
            setInterval((  ) =>{ 
        
        this.getMargins(  );
        
        
        this.loopGetQuotesAndMutateInstruments(  );
        this.nifty = this.instruments.filter( i =>i.segment == 'INDICES' );
        
         } ,20*60*1000 )  
        
        
        
        
        
        
        
        
            var d  =  new Date(  );
            this.hours  =  d.getHours(  );
            this.minutes  =  d.getMinutes(  );
            this.seconds  =  d.getSeconds(  );
        
        
            ( async(  ) =>{ 
        
              await this.refreshTradeStatus(  );
        
              this. placeTargetsForLiveScripts(  )
        
             }  )(  )
        
        
        
            let fifteenSeconds  =  15* 1000;
            let fifteenSecondsTimer  =  setInterval((  )  => { 
        
        
              this.globalConsoleLogs = [];
              //this.$router.go(  );
             } , fifteenSeconds );
        
        
          
        
            let TenMinutes  =  10 * 60 * 1000;
            let FiveMinutesTimer  =  setInterval((  )  => { 
        
        
              this.globalConsoleLogs = [];
              //this.$router.go(  );
             } , TenMinutes );
        
            let thirtyMinute  =  25 * 60 * 1000;
        
            let thirtyMinuteTimer  =  setInterval( async (  )  => { 
              let thirtyMiniutesBefore  =  new Date(  );
              thirtyMiniutesBefore.setMinutes( thirtyMiniutesBefore.getMinutes(  ) - 2 );
        
         
             
             
          
            
        
              return;
              // let iso = now.toISOString(  )
        
              //  & lo.order_timestamp>0
        
              let order_ids  =  this.liveOrders
                .filter(( lo )  => { 
                  return ( 
                    lo.status  ==  "OPEN" &&
                    lo.exchange  ==  this.itype &&
                    // lo.tradingsymbol.includes( "FUT" ) &&
                    lo.transaction_type  ==  "BUY" &&
                    thirtyMiniutesBefore - new Date( lo.order_timestamp ) > 0
                   );
                 }  )
                .map(( o )  => { 
                  let ob  =  {  } ;
                  ob.order_id  =  o.order_id;
                  ob.variety  =  o.variety;
        
                  return ob;
                 }  );
        
              this.cl( order_ids, "live orderss to be canceled" );
        
              if ( order_ids.length > 0 ) { 
                // this.CancelOrders( order_ids );
               } 
             } , thirtyMinute );
        
            let fifteenSecTimer  =  setInterval( async (  )  => { 
        
              let a  =  await this.refreshTradeStatus(  );
             
             } , 60 * 1000 );
        
            let placingTimer  =  window.setInterval( async (  )  => { 
        
           
              
             
        
              let ln  =  this.orderArray.length;
        
              // this.cl( 'order array length1',ln,JSON.stringify( this.orderArray ))
        
              // this.cl( 'this.orderArray.',this.orderArray )
        
              // clock
        
              if ( this.laggingCheckDigit  ==  this.CurrentCheckDigit ) { 
                this.webSocketNotActive  =  true;
        
                //reload window
        
                // this.$router.go(  );
               }  else { 
                this.webSocketNotActive  =  false;
               } 
              this.laggingCheckDigit  =  this.CurrentCheckDigit;
              var d  =  new Date(  );
              this.hours  =  d.getHours(  );
              this.minutes  =  d.getMinutes(  );
              this.seconds  =  d.getSeconds(  );
        
              let times = [17,47,37,2]
                   
        
                   if ( this.hours<16 & times.includes( this.minutes ) && ( this.seconds>56 && this.seconds<58 )
                    
                     ){ 
        
                    ///procedureTocancelEntryOrdersIfAny
        
                    // this.$router.go(  )
                    } 
        
        
                   this.placeTargetsForLiveScripts(  )
        
              // if ( this.livePositions.length > 0 ) { 
              //   // let r  =  await this.getHourlyCandleLows(  );
              //  } 
        
              let hourlyhandleFetchingMinutes  =  [1, 16, 31, 46];
              if ( hourlyhandleFetchingMinutes.includes( this.minutes )) { 
                // if ( this.livePositions.length > 0 )
                if ( true ) { 
                  // let r  =  await this.getHourlyCandleLows(  );
                 } 
        
                if (( this.hours < 15 ) & this.times.includes( this.minutes )) { 
                  //geting candle data in 31 st minutes of each hour
                 } 
               } 
             } , 2*60 * 1000 );
        
            // *Math.max( this.orderArray.length,1 )
        
            if ( this.chat_id  ==  -1 ) { 
              this.getChatId(  ).then(( chat_id )  => { 
                var d  =  new Date(  );
        
                let today  =  d.toLocaleString(  ).slice( 0, 10 );
        
                var txt  =  "Welcome to Trading on " + today;
                this.sendToTelegramGroup( txt );
               }  );
             } 
            // this.triggerWebsocktsInServer(  );
        
            //  window.setInterval((  )  => { 
            //   console.clear(  );
        
            //     } ,250000 )
        
            // window. setInterval((  )  => { 
            //     var d  =  new Date(  );
            //     this.hours  =  d.getHours(  );
            //     this.minutes  =  d.getMinutes(  );
            //     this.seconds  =  d.getSeconds(  );
        
            //   } ,1000 )
        
            // this.getOrders(  );
        
            // if ( this.livePositions.length > 0 ) { 
            //   // this.getHourlyCandleLows(  );
            //  } 
           
        
        // ( async (  ) =>{ 
        
        //   let kk = await    this.setInstrumentTokens(  );
        
        //  }  )(  );
        
        
            
        
            //  let tmp = [...this.instrument_tokens,14523906]
        
            //  this.cl( this.instrumentTokens,111 );
        
          
        // ( async (  ) =>{ 
        
        
        //   // let instrumentsForMining1  = await this.requireJson( "../../../instruments/" + this.setter )//.then( r =>r.json(  ))
        //   let instrumentsForMining1  = await this.requireJson( "../../../instruments/instrumentsForMining.json" )//.then( r =>r.json(  ))
        
        
        //   let instrumentsForMining  =  instrumentsForMining1
        //   .filter( 
        //     ( i )  =>  true
            
        //    )
        //   .filter(( item, index, arr )  => arr.indexOf( item )== index );
        
        
        //   this.instruments = [...instrumentsForMining];
        //     this.instrumentTokens = this.instruments.map( i =>parseInt( i.instrument_token ));
        
        
        
        //  }  )(  )
            
        
          
        
            socket.on( "send-realtime-subscription", ( s )  => { 
        
        
              // this.cl( 'inside send-realtime-subscription' );
              this.mutateWithLtp( s );
        
              this.CurrentTick  =  [...s];
             }  );
        
            socket.on( "order_update", async ( orderUpdates )  => { 
        
              let temp1,tmp2
              if( orderUpdates.status == "UPDATE" || orderUpdates.pending_quantity!== 0  ){ 
        
        
                let temp1 = JSON.stringify( orderUpdates );
            let tmp2 = JSON.stringify( this.previousOrderUpdate );
        
            if( temp1 == tmp2 ){ 
        
              // this.cl( 'same order update' );
              this.previousOrderUpdate = orderUpdates;
              return false
             } 
            this.previousOrderUpdate = orderUpdates
        
        
          let k = await  this.procedureTocancelEntryOrdersIfAny(  );
          cansole.log( 'cancelling orders',a )
                let a   =  await this.refreshTradeStatus(  );
        
        this.cl( 'update order uodate',orderUpdates,{ a }  );
        
        
        
        return false
               } 
              
         temp1 = JSON.stringify( orderUpdates );
             tmp2 = JSON.stringify( this.previousOrderUpdate );
        
            if( temp1 == tmp2 ){ 
        
              // this.cl( 'same order update' );
              this.previousOrderUpdate = orderUpdates;
              return false
             } 
            this.previousOrderUpdate = orderUpdates;
        
            
        
        this.processOrderUpdate( orderUpdates )
        
           
        
        //// if entry order executed 
        ///placce reverse order
        
        //if reverse order executed 
        
        ///rest everything 
        
        
        //       if ( true ) { 
               
        
        //         if ( this.refreshingStatus  ==  true ) { 
        //           this.cl( "update in progress" );
        
        //           return false;
        //          } 
        //         this.refreshingStatus  =  true;
        
        // // let t  =  await this.refreshTradeStatus(  );
        
        // if( orderUpdates.status == "COMPLETE" || orderUpdates.status == "CANCELLED" ){ 
        
        // // let t  =  await this.placeTargetsForLiveScripts(  );
        //  } 
                
        
        //         this.refreshingStatus  =  false;
        //        } 
        
        
             }  );
        
            //   setInterval( async (  )  => { 
            //  this.getOrders;
        
            //    } , 30000 );
           } ,
    watch: { 
        orderArray( n, o ) { 
          // this.cl( n,o )
    
          let orderArrays  =  [...this.orderArray];
    
          if ( orderArrays.length > 0 ) { 
            orderArrays.forEach( async ( orderArray )  => { 
             
              // this.cl( "place order result", a );
              this.cl( "Actual Firing", JSON.stringify( orderArray ));
             }  );
    
            this.orderArray  =  [];
           } 
         } ,
       } ,
    



 } 