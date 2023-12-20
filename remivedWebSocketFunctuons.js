
async function socketConectionsForFutureMining(socket,access_token){
    const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
  
    let access_token_global= await AccesTocken.findOne({ 'date': today  },'access_token').then(e=>e.access_token);
    
    
    access_token=access_token_global
  
  
  
    socket.on('subscribe-future-mining',async r=>{
  
  
     console.log(access_token)
    var KiteTicker = require("kiteconnect").KiteTicker;
    var ticker = new KiteTicker({
    api_key: api_key,
    access_token: access_token
    });
  
    ticker.connect();
  
  
  
  ticker.on("error",(e)=>console.log(e.Error,'error-ticker error 1831'))
  let max_retryopt=300;
  let max_delayopt=5;
  ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
  
  
  ticker.on("connect", ()=>{
  
    // console.log('subscribe-future-mining is connected',ticker.connected())
  
  
    var items =JSON.parse(r);        
          ticker.subscribe(items);
  
          // console.log(items,'items')
          ticker.setMode(ticker.modeFull, items);
          
   
          ticker.on("ticks", (ticks)=>{
  
  
            
              io.emit('future-mining-tick',ticks)
  
              // console.log(ticks,'ticks future')
  
              
          });
  
  
  ticker.on("order_update", (orderUpdates)=>{
     
   
  
  });
  
  });
  
  });
  
  
  
  
  
  
  }
  
  function sktForMKVStrategy(socket,access_token){

      /////////////////////io part
    
    
    // socket.on('order-book',e=>{
    
    // io.emit('send-order',e)//emit to all
    
    
    // // socket.broadcast.emit('send-order',e) //emit to all exept tosender
    // console.log('orderbook',e)
    
    // });
    
    
    socket.on('subscribe-script-for-mkv-strategy',r=>{
    
    // console.log()
    var KiteTicker = require("kiteconnect").KiteTicker;
    var ticker = new KiteTicker({
    api_key: api_key,
    access_token: access_token
    });
    
    // console.log('ticker',ticker)
    ticker.connect();
    
    let max_retryopt=300;
    let max_delayopt=5;
    ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
    
    ticker.on("connect", ()=>{
    // console.log('r',r)
    var items =JSON.parse(r);
    
    // console.log('items-subscribe-script-for-mkv-strategy',items)
     
    ticker.subscribe(items);
    ticker.setMode(ticker.modeFull, items);
    
    
    ticker.on("ticks", (ticks)=>{
    
        io.emit('ltp-of-script-for-mkv-strategy',ticks)
    
        //console.log('ticks',ticks)
    });
    
    });
    
    
    // console.log('instruments',r)
    
    
    
    
    
    
    });
    
    
    
    
    
    /////////////////////io part
    
    
    
    
    
    
    
    
    
    
    
    
    }
    function   sktForMint(access_token,socket){

        var KiteTicker = require("kiteconnect").KiteTicker;
        var ticker = new KiteTicker({
        api_key: api_key,
        access_token: access_token
        });
      
        let max_retryopt=300;
        let max_delayopt=5;
        let  Enable=true;
        ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
        
        console.log('hi.....................................................................................');
        // io.on('connection',socket=>{
        
        // console.log(socket,'io')
        // console.log('subscribe-scripts-for-mint',items)
      
      
      socket.on('subscribe-scripts-for-mint',r=>{
      
        var items =JSON.parse(r);
      
        //ittems coming here
        console.log('items comming in socket on subscribe start',items.lenght)
        if(items.lenght){
      
          console.log('items comming in socket on subscribe',items.lenght)
        }
      
      
      
        ticker.connect();
      
        ticker.on("connect", ()=>{
      
         
        var items =JSON.parse(r);
        console.log('items comming in socket on subscribe',items.length)
        if(items.length){
      
          console.log('items comming in ticker on connect  subscribe',items.length)
        }
      
      
        // console.log('subscribe-scripts-for-mint on connect',items);
        
        // console.log(ticker,'ticker')
         
        ticker.subscribe(items);
        ticker.setMode(ticker.modeLTP, items);
      
      });
        
        
        ticker.on("ticks", (ticks)=>{
      
      
         // console.log('tick',ticks);
          // console.log('items comming in socket on subscribe',items.lenght)
          // console.log('items comming in ticker on tick ',items.lenght)
      
          // console.log('ticks',ticks)
            io.emit('ltp-for-mint',ticks)
        
            
        });
        
        
        
        });
      
      
      /////////////////////io part
      
        // })
      }
            

function startWebSocketsOnTrade(socket,access_token){

    socket.on('forceDisconnect', r=>{
    // socket.disconnect();
    
    var KiteTicker = require("kiteconnect").KiteTicker;
    var ticker = new KiteTicker({
    api_key: api_key,
    access_token: access_token
    });
    
    console.log(r,'force disconenct')
    ticker.unsubscribe(r);
    });
    
    
    
    var KiteTicker = require("kiteconnect").KiteTicker;
    var ticker = new KiteTicker({
    api_key: api_key,
    access_token: access_token
    });
    
    // console.log('ticker',ticker)
    ticker.connect();
    
    let max_retryopt=300;
    let max_delayopt=5;
    ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
    ticker.on("connect", ()=>{
    
      // console.log('viveeeek',ticker)
    
    
    ticker.on("order_update", (orderUpdates)=>{
    
    
     
    
        // console.log('orderupdates',orderUpdates)
    
    
     
    
    });
    
    });
    
    
    
    socket.on('subscribe-orders',async r=>{
      
      const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
      let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
    
      let access_token_global= await AccesTocken.findOne({ 'date': today  },'access_token').then(e=>e.access_token);
    
    
    
      
    
      // console.log('r.filter(r=>r == 28807170)',r);
     
    
    
        var KiteTicker = require("kiteconnect").KiteTicker;
        var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token_global
        });
    
    
      
      ticker.disconnect()
      let a=  ticker.connect();
    
    ticker.on("error",(e)=>console.log(e.Error,'error-tocker discomenct 1957'))
    
        let max_retryopt=300;
        let max_delayopt=5;
        ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
    
        var items =JSON.parse(r);
    
        console.log(items,'items from  send-realtime-subscription')
    
        // console.log('items.filter(r=>r == 28807170)',items.filter(r=>r == 28807170));
        // console.log('hre',ticker);
    
      console.log(ticker.connected(),'ticker.connected')
        ticker.on("connect", ()=>{
        
            var items =JSON.parse(r);
    
    
            // console.log(r,'items')
    
             
            ticker.subscribe(items);
            ticker.setMode(ticker.modeFull, items);
            
     
    
            let proxyTick=[];
    
            let count=0;
          
            
            
            ticker.on("ticks", (ticks)=>{
    
          
    
    
           if(ProxyTrade && false){
           }
         else{
    
            io.emit('send-realtime-subscription',ticks)
    
    
            //  console.log(ticks,'ticks')
           }
           
         
          
    
               
                
                // io.emit('send-realtime-subscription',ticks)
    
                
            });
    
    
    
    
    
        });
    
          
        // console.log('instruments',r)
    })
    
    
    
    /////////////////////io part
    
    
    
    
    
    
    
    
    }




    io.on('connection',socket=>{
     
        //   console.log('server connection after io' )
        //  console.log('server connection')
      
      
          socket.on('forceDisconnect', (r)=>{
      
            
            var KiteTicker = require("kiteconnect").KiteTicker;
            var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token_global
            });
            
      console.log(r,'force disconenct')
            ticker.unsubscribe(r);
      
      
      
            ticker.on("order_update", (orderUpdates)=>{
      
      
         
          
              // console.log('orderupdates',orderUpdates)
          
          
           
          
          });
      
            
            // socket.disconnect();
        });
    
        // console.log('sokect',access_token)
        // io.set('origins', '*:*');
        StartWebSockets(socket,access_token);
        // sktForMKVStrategy(socket,access_token);
        startWebSocketsOnTrade(socket,access_token);
    
        socketConectionsForFutureMining(socket,access_token_global);
    
        // proxyTrade(io)
        // sktForMint(access_token,socket);
      
      
      
        
      
      
      
        });

        function startIoConnections(){

          console.log('start io connections')
        io.on('connection',socket=>{
         
          ticker.on("order_update", (orderUpdates)=>{
      
      
       
        
          //  console.log('orderupdates',orderUpdates)
        
        
         
        
        });
         
      
      
          socket.on('forceDisconnect', (r)=>{
      
            
            var KiteTicker = require("kiteconnect").KiteTicker;
            var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token
            });
            
      console.log(r,'force disconenct')
            ticker.unsubscribe(r);
      
      
      
            
      
            
            // socket.disconnect();
        });
      
        // StartWebSockets(socket,access_token);
        // sktForMKVStrategy(socket,access_token);
        // startWebSocketsOnTrade(socket,access_token);
        // sktForMint(access_token,socket);
      
      
      
        
      
      
      
        });
      
      }
      