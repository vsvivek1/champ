export default{


    methods:{
        writeTrades( trade ) { 
            return false;
            // this.cl( "writing trade from write trade", trade );
            let obj  =  {  } ;
            obj.trade  =  trade;
            const url  =  "/api/WriteTrades";
      
            axios.post( url, obj );
           } ,
        writeToMongo(){ 


            let url = "/api/writeToMongo";
      
            let ob = {  } ;
            ob.session = this.session;
            ob.time = moment()
      
           } ,
        retrieveTradeDetailsInLocalStorage( tradingSymbol ) { 

            try { 
                
                      const today  =  new Date().toISOString().slice( 0, 10 )
                      const objectInStorage  =  localStorage.getItem( tradingSymbol )
            
            
            
                      if ( objectInStorage && objectInStorage[today] ) { 
                        const parsedObject  =  JSON.parse( objectInStorage )
                
                        return parsedObject[today];
                     
                      
                      
                       }  else { 
                       return false
                       } 
             }  catch ( error ) { 
                
            console.log( error,'storage retrival error in 1332' )
              return false;
             } 
                
                
                
                 } ,
            
        saveTradeDetailsInLocalStorage( tradingsymbol,entry,target,stopLoss,strategyName ) { 
            const today  =  new Date().toISOString().slice( 0, 10 )
            const objectToStore  = 
            
         {     [today]:
          
          { 
              entry: entry,
              stopLoss: stopLoss,
              target: target,
              strategyName:strategyName
             }} 
            let storedObjects  =  JSON.parse( localStorage.getItem( tradingsymbol )) || {  } 
            if ( storedObjects[today] ) { 
              // alert( `Object for ${ this.tradingSymbol }  with date ${ today }  already exists.` )
              return
             } 
            storedObjects[today]  =  objectToStore
            localStorage.setItem( tradingsymbol, JSON.stringify( storedObjects ))
      
           } ,
        storeTradeDataInLocalStrorage( newTradingObj ){ 
            let today  =  new Date().toISOString().slice( 0, 10 );
          
          // Retrieve existing trading data from local storage
          let tradingData  =  JSON.parse( localStorage.getItem( 'currentDay' )) || [];
          tradingData.push( newTradingObj );
          let updatedDataString  =  JSON.stringify( tradingData );
          
          // Save the updated trading data to local storage with the key 'currentDay'
          localStorage.setItem( today, updatedDataString );
          
           } ,
        async sendTradeStrategy( tradingSymbol,buyPrice,quantity,strategyName ) { 
            const now  =  new Date(); // Get the current date and time
            const date  =  now.toISOString().slice( 0, 10 ); // Get today's date in yyyy-mm-dd format
            const timeOfBuy  =  now.toLocaleString( 'en-US', {  hour12: false  }  ); // Get the current time in 24-hour format as hh:mm:ss
            const url  =  '/api/writeTradeStrategy';
            const params  =  { 
              accessToken: this.accessToken,
              tradingSymbol: tradingSymbol,
              timeOfBuy: timeOfBuy,
              buyPrice: buyPrice,
              quantity: quantity,
              strategyName: strategyName,
              Date: date
             } ;
            try { 
              const response  =  await axios.post( url, params );
              // console.log( response.data,'rsult of mongose save of trade' );
             }  catch ( error ) { 
              console.error( error );
             } 
           } ,
    downloadLogs() { 
        // Join all logs into a single string
        const allLogs  =  this.logs.join( '\n' );
  
        // Create a Blob with the logs and download it
        const blob  =  new Blob( [allLogs], {  type: 'text/plain'  }  );
        const url  =  URL.createObjectURL( blob );
        const link  =  document.createElement( 'a' );
        link.href  =  url;
        link.download  =  'log.txt';
        link.click();
        URL.revokeObjectURL( url );
       } ,

        async  saveTrigger( date, tradingSymbol, entryPrice, exitPrice, entryType, sellTime, triggerName ) { 
            try { 
              const response  =  await axios.post( '/api/triggers', { 
                date,
                tradingsymbol: tradingSymbol,
                entryPrice,
                exitPrice,
                entryType,
                sellTime,
                triggerName
               }  );
              
              console.log( response.data.message ); // Display success message
              
              // Perform any additional actions after successful save
              
             }  catch ( error ) { 
              console.error( 'Failed to save trigger:', error );
              // Handle error case
             } 
           } ,



    }
}