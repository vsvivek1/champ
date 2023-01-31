require('dotenv').config()
const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');
const api_key=process.env.api_key;

let today = new Date().toISOString().slice(0, 10);


var io = require('socket.io')(4000,{

    cors:{
  
      origin:['*']
    }
  
  })
  
  
  
  


// const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{


    AccesTocken.findOne({ 'date': today  },'access_token').then(e=>{

        
        


       
        
        
        
        let access_token=e.access_token;

        
// console.log('e.access_token',e.access_token)
    
   
        // var KiteTicker = require("kiteconnect").KiteTicker;
        // var ticker = new KiteTicker({
        //     api_key: api_key,
        //     access_token: access_token
        // });
        
        // ticker.connect();
        // ticker.on("ticks", onTicks);
        // ticker.on("connect", subscribe);
      
        
        // function onTicks(ticks) {
        //     console.log("Ticks", ticks);
        // }
        
        // function subscribe() {
        //     var items = [884737];
        //     ticker.subscribe(items);
        //     ticker.setMode(ticker.modeFull, items);
        // }
        
   
   /////////////////////io part

   var io = require('socket.io')(4000,{

    cors:{
           origin:"*"
    }
  
  })


   io.on('connection',socket=>{
  
    console.log('socketid',socket.id);
    socket.on('order-book',e=>{
      
  
      io.emit('send-order',e)//emit to all
  
  
      // socket.broadcast.emit('send-order',e) //emit to all exept tosender
      console.log('orderbook',e)
  
    });



    socket.on('subscribe-orders',r=>{
        

        
        var KiteTicker = require("kiteconnect").KiteTicker;
        var ticker = new KiteTicker({
            api_key: api_key,
            access_token: access_token
        });

        // console.log('ticker',ticker)
        ticker.connect();
        ticker.on("connect", ()=>{
            console.log('r',r)
            var items =JSON.parse(r);

            // console.log('items',items)
             
            ticker.subscribe(items);
            ticker.setMode(ticker.modeFull, items);
            
            
            ticker.on("ticks", (ticks)=>{

                io.emit('send-realtime-subscription',ticks)

                console.log('ticks',ticks)
            });

        });

        

       

        // console.log('instruments',r)
    })
    
    
  })
   /////////////////////io part
   
   
   
   
   
   
    }).catch(e=>console.log('error',access_token));



});






// const access_token="Arz3PuShYFOUtfrx4SBUD2dGi1E05alM";

