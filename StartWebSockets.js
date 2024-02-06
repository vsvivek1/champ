let AccesTocken=require('./models/AccessTokens');
let  Enable=true;

const mongoose=require('mongoose');
let ProxyTrade=false;

var startedWebSockets=false;
let today = new Date().toISOString().slice(0, 10);
const api_key=process.env.api_key;

module.exports=function StartWebSockets(socket,io,access_token){



    if(startedWebSockets == true){
        console.log('websockets alrady started');

//         console.log(socket);

// return;
        // return false;
    }
   
 


    //   socket.on('forceDisconnect', r=>{
    //     var KiteTicker = require("kiteconnect").KiteTicker;
    //     var ticker = new KiteTicker({
    //     api_key: api_key,
    //     access_token: access_token
    //     });
        
    // console.log(r,'force disconenct')
    //     ticker.unsubscribe(r);
    // });
    
    
    
    
    
    socket.on('order-book',e=>{
      
      io.emit('send-order',e)//emit to all
    
    
      // socket.broadcast.emit('send-order',e) //emit to all exept tosender
      // console.log('orderbook',e)
    
    });
    
    
    
    
    socket.on('subscribe-orders',async r=>{

      
    
      const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
      let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
    
      let access_token_global= await AccesTocken.findOne({ 'date': today  },'access_token').then(e=>e.access_token);
    
    
    
    //  console.log('subscribe-orders')
        var KiteTicker = require("kiteconnect").KiteTicker;
        var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token_global
        });
    
    
      
      ticker.disconnect()
      let a=  ticker.connect();
    
    ticker.on("error",(e)=>console.log(e.Error,'error -ticker error @2090'))
    
        let max_retryopt=300;
        let max_delayopt=5;
        ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
    
        var items =JSON.parse(r);
    
    //    console.log({items})
       console.log('hre',ticker);
    
      // console.log(ticker.connected(),'ticker.connected')
        ticker.on("connect", ()=>{
        
            var items =JSON.parse(r);
    
    
            console.warn('NUMBER OF SCRIPTS FOR WEBSOCKETS IS %s ',r.length)
    
             
            ticker.subscribe(items);
            ticker.setMode(ticker.modeFull, items);
            
     
    
            let proxyTick=[];
    
            let count=0;

            count = proxyTradeProcedure(count);
              
        
            ticker.on("ticks", (ticks)=>{
    
           
              

              if(! startedWebSockets){

                startedWebSockets=true;
              }
    
                io.emit('send-realtime-subscription',ticks)
    
            
    
                
            });
    
    
            ticker.on("order_update", (orderUpdates)=>{
    
    
              io.emit('order_update',orderUpdates)
          
  
          
          
           
          
          });
    
    
    
    
    
        });
    
          
        // console.log('instruments',r)
    })
    
    
    
    socket.on('subscribe-GTT',async r=>{
        
      const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
      let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
    
      let access_token_global= await AccesTocken.findOne({ 'date': today  },'access_token').then(e=>e.access_token);
    
    
    
      console.log('subscribe-orders')
        var KiteTicker = require("kiteconnect").KiteTicker;
        var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token_global
        });
    
      
        ticker.connect();
    
        let max_retryopt=300;
        let max_delayopt=5;
        ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
    
      
        ticker.on("connect", ()=>{
        
            var items =JSON.parse(r);
    
    
             
            ticker.subscribe(items);
            ticker.setMode(ticker.modeFull, items);
            
     
            ticker.on("ticks", (ticks)=>{
    
                io.emit('send-GTT',ticks)
    
                
            });
    
        });
    
          
        // console.log('instruments',r)
    })
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    socket.on('subscribe-orders-mining',r=>{
        
     console.log('for minining')
        var KiteTicker = require("kiteconnect").KiteTicker;
        var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token_global
        });
    
        // console.log('ticker',ticker)
        ticker.connect();
    
        let max_retryopt=300;
        let max_delayopt=5;
        ticker.autoReconnect(Enable, max_retryopt, max_delayopt)
        ticker.on("connect", ()=>{
            // console.log('r',r)
            var items =JSON.parse(r);
    
          //  console.log(items,'items1-subscribe-orders-mining')
             
    
        // let r=   tocker.unsubscribe(items);
    
        // console.log('unsubscribe',r)
    
        //    return false;
    
            ticker.subscribe(items);
            ticker.setMode(ticker.modeLTP, items);
         
            
            ticker.on("ticks", (ticks)=>{
    // console.log(ticks,'ticks')
                io.emit('send-realtime-subscription-mining',ticks)
    
                // console.log('ticks1',ticks)
            });
    
        });
    
          
        
    })
    
    
    
    

  function proxyTradeProcedure(count) {
    if (ProxyTrade) {

      if (count  ==  0) {

        const getTickgenerator = require('./backtest/tickGenerator');

        setInterval(e => {
          let tick1 = getTickgenerator(ticks, io);
          io.emit('send-realtime-subscription', tick1);
        }, 1000);



        count = count + 1;
      }
    }
    return count;
  }
    /////////////////////io part
    
    
    
    
    
    
    
    
      
    }