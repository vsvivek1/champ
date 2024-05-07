export default{

    mounted(){ 

        // console.log(this.instrumentTokens,'this.instrumentTokens')
      
        
      
        // setInterval(()=>{
      
         
      
      
        // },1000)
        this.getCurrentFNOPositions() ;
      
        const currentDate  =  new Date().toISOString().split( 'T' )[0];
          const existingData  =  JSON.parse( localStorage.getItem( currentDate ))
      
          // console.log( existingData,'existingData' )
          // this.globalConsoleLogs = existingData;
        const originalLog  =  console.log;
      
          // Define a new console.log function that writes to the logs array
      
          console.log  =  ( ...args )  => { 
            const message  =  args.join( ' ' );
            this.logs.push( message );
            originalLog.apply( console, args );
           } ;
      
        this.fetchInstruments(); 
      
      
        setInterval(() =>{ 
      
      this.trailingStopLossWithLtp();
      
         } ,60*1000 )
      
      
        // const urlForMiningInstruments = "../../../instruments/instrumentsForMining.json"
        // fetch( urlForMiningInstruments ).then( r =>r.json()).then( d =>
        // { 
      
        //   this.instruments = d;
      
        //   this.instrumentTokens = this.instruments.map( i =>parseInt( i.instrument_token ));
      
        //   socket.emit( "subscribe-orders", JSON.stringify( this.instrumentTokens ));
      
        //  } 
       
        
        
        //  )
      
        var urlForHourlyCandles = "../../../instruments/hourlyCandleData.json";

       // var urlAll='./appv3/public/instruments/instrumentsAll.json';'
      
        fetch( urlForHourlyCandles )
        .then( response  => response.json()) // Convert the response to a JSON object
        .then( data  => { 
          // Store the JSON data in a variable
           hourlyPricePointsofLiveDay1  =  data;
      
          // Do something with the jsonData variable
          // console.log( instruments );
         }  )
        .catch( error  => console.error( error ));
             // this.cl( 'mounted' )
             var cl = this.cl;
              
              
              this.setTradingType();
           
               this.itype  =  this.$route.params.itype;
               this.loopGetQuotesAndMutateInstruments();
           
               this.nifty = this.instruments.filter( i =>i.segment == 'INDICES' );
           
           
               this.getMargins();
               setInterval(() =>{ 
           
           this.getMargins();
           
           
           this.loopGetQuotesAndMutateInstruments();
           this.nifty = this.instruments.filter( i =>i.segment == 'INDICES' );
           
            } ,20*60*1000 )  
           
           
           
           
           
           
           
           
               var d  =  new Date();
               this.hours  =  d.getHours();
               this.minutes  =  d.getMinutes();
               this.seconds  =  d.getSeconds();
           
           
               ( async() =>{ 
           
                 await this.refreshTradeStatus();
           
                 this. placeTargetsForLiveScripts()
           
                }  )()
           
           
           
               let fifteenSeconds  =  15* 1000;
               let fifteenSecondsTimer  =  setInterval(()  => { 
           
           
                 this.globalConsoleLogs = [];
                 //this.$router.go();
                } , fifteenSeconds );
           
           
             
           
               let TenMinutes  =  10 * 60 * 1000;
               let FiveMinutesTimer  =  setInterval(()  => { 
           
           
                 this.globalConsoleLogs = [];
                 //this.$router.go();
                } , TenMinutes );
           
               let twoMinute  =  2 * 60 * 1000;
           
               let thirtyMinuteTimer  =  setInterval( async ()  => { 
                 let thirtyMiniutesBefore  =  new Date();
                 thirtyMiniutesBefore.setMinutes( thirtyMiniutesBefore.getMinutes() - 30 );
           
            
                
                
             
               
           
                //  return;
                
           
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
                  //  this.CancelOrders( order_ids );
                  } 
      
      
      
                } , twoMinute );
      
      
      
      
             let misOrderids =   this.allOrders.filter( i =>i.product == 'MIS' )   .map(( o )  => { 
                     let ob  =  {  } ;
                     ob.order_id  =  o.order_id;
                     ob.variety  =  o.variety;
           
                     return ob;
                    }  );
      
      
      
           
               let fifteenSecTimer  =  setInterval( async ()  => { 
           
                 let a  =  await this.refreshTradeStatus();
      
      
      if( this.hours == 15 ){ 
      
      
        let misOrderids =   this.allOrders.filter( i =>i.product == 'MIS' )   .map(( o )  => { 
                     let ob  =  {  } ;
                     ob.order_id  =  o.order_id;
                     ob.variety  =  o.variety;
           
                     return ob;
                    }  );
      
      
                   //LOST 20 K DUE TO THIS STUPIDITY IE NOT CACELLING MIS ORDERS AFTER 3 PM
                   this.cl( misOrderids, "CANCENLLING MIS ORDERS AFTER 3 PM PLS CHECK" );
           
           if ( misOrderids.length > 0 ) { 
             this.CancelOrders( misOrderids );
            } 
      
                   
                   
      
       } 
      
                
                } , 60 * 1000 );
      
      
      
               let oneSecTimer = setInterval(() =>{ 
      
                var d  =  new Date();
                 this.hours  =  d.getHours();
                 this.minutes  =  d.getMinutes();
                 this.seconds  =  d.getSeconds();

                 if(this.seconds==2){

                  this.initiateHistoricalDataFetch(this.instrumentTokens);
                 }
      
               if( this.seconds == 55 ){ 
      
                // this. getOneMinuteData()
      
      //console.log(this.instrumentTokens);
              
                console.log( 'ohlc data at 53 sec',this.ohlcData, this.accessToken )
                }  
      
                } ,10000 )
           
               let placingTimer  =  window.setInterval( async ()  => { 
           
              
                 
                
           
                 let ln  =  this.orderArray.length;
           
               
           
                 if ( this.laggingCheckDigit  ==  this.CurrentCheckDigit ) { 
                   this.webSocketNotActive  =  true;
           
                   //reload window
           
                  //  this.$router.go();
                  }  else { 
                   this.webSocketNotActive  =  false;
                  } 
                 this.laggingCheckDigit  =  this.CurrentCheckDigit;
                //  var d  =  new Date();
                //  this.hours  =  d.getHours();
                //  this.minutes  =  d.getMinutes();
                //  this.seconds  =  d.getSeconds();
           
                 let times = [17,47,37,2]
                      
           
                      if ( this.hours<16 & times.includes( this.minutes ) && ( this.seconds>56 && this.seconds<58 )
                       
                        ){ 
           
                       ///procedureTocancelEntryOrdersIfAny
           
                       // this.$router.go()
                       } 
           
           
                      this.placeTargetsForLiveScripts()
           
                 // if ( this.livePositions.length > 0 ) { 
                 //   // let r  =  await this.getHourlyCandleLows();
                 //  } 
           
                 let hourlyhandleFetchingMinutes  =  [1, 16, 31, 46];
                 if ( hourlyhandleFetchingMinutes.includes( this.minutes )) { 
                   // if ( this.livePositions.length > 0 )
                   if ( true ) { 
                     // let r  =  await this.getHourlyCandleLows();
                    } 
           
                   if (( this.hours < 15 ) & this.times.includes( this.minutes )) { 
                     //geting candle data in 31 st minutes of each hour
                    } 
                  } 
                } , 3*60 * 1000 );
           
               // *Math.max( this.orderArray.length,1 )
           
               if ( this.chat_id  ==  -1 ) { 
                 this.getChatId().then(( chat_id )  => { 
                   var d  =  new Date();
           
                   let today  =  d.toLocaleString().slice( 0, 10 );
           
                   var txt  =  "Welcome to Trading on " + today;
                   this.sendToTelegramGroup( txt );
                  }  );
                } 
              
           
               
           
               
           
             
           
               socket.on( "send-realtime-subscription", ( s )  => { 
           
           
       
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
           
           
             let k = await  this.procedureTocancelEntryOrdersIfAny();
             cansole.log( 'cancelling orders',a )
                   let a   =  await this.refreshTradeStatus();
           
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
           
              
           
           
           
           
                }
                
                
                );
           
          
      
      
       } ,
      

}