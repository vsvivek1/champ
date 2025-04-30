const express= require('express');
const path =require('path')
const mongoose=require('mongoose');
let ohlc=require('./scraping/ohlc');

const NseApi=require('./scraping/nse');

const axios =require('axios');

const Order=require('./models/Orders');


// let AccesTocken=require('./models/AccessTokens');

// var io = require('socket.io')(server);


// var io = require('socket.io')(3000,{

//   cors:{

//     origin:['http://127.0.0.1:9090:7000']
//   }

// })


// io.on('connection',socket=>{

//   console.log('socketid',socket.id);
//   socket.on('order-book',e=>{
    

//     io.emit('send-order',e)//emit to all


//     // socket.broadcast.emit('send-order',e) //emit to all exept tosender
//     console.log('orderbook',e)

//   });
  
  
// })





const fs = require('fs');
require('dotenv').config()

const ZerodhaAPI=require('./ZerodhaAPI');

const Scraping=require("./scraping/index.js")
const CI=require("./scraping/ci.js")

const app=express();
var history = require('connect-history-api-fallback');

process.on('uncaughtException', function(err) {
  console.log(err);
});


app.use(history());

let port = process.env.PORT;
if (port  ==  null || port  ==  "") {
  const port =9090;
}





const  bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, './findiapp/dist')));


let pricePoint=require('./pricePoints.js');

let AccesTocken=require('./models/AccessTokens');
let NarrowRange=require('./models/NarrowRange');

// console.log('NarrowRange',NarrowRange)

app.use(bodyParser.json());

// console.log('file started')

// console.log('app',app)


// https://kite.zerodha.com/connect/login?v=3&api_key=wkcurst2vu5obug7

const api_key=process.env.api_key;

let request_tocken;

const api_secret=process.env.api_secret;
// let access_token;
let access_token=process.env.ACCESS_TOCKEN;



var KiteConnect = require("kiteconnect").KiteConnect;
const { exit } = require('process');
const { isError } = require('util');

var kc = new KiteConnect({
	api_key: api_key
});


app.post('/api/setRequestTocken/',(req,res)=>{

  request_tocken=req.body.Request_tocken;

  console.log('request_tocken',request_tocken)

let at=  ZerodhaAPI.generateSession(request_tocken).then(r=>{
  // console.log('at',r)

  let today = new Date().toISOString().slice(0, 10);let at={};
at._id=new mongoose.Types.ObjectId();
at.date=today
at.user_id=r.user_id;
at.access_token=r.access_token;

let AccessTockenModel=new AccesTocken(at)
AccessTockenModel.save();
// const AtModel=new AccessTocken(at);

// AtModel.save().then(res=>{

//   console.log('result from mongo',res)
// }).catch(e=>console.log(e));


  res.status(200).send(r)



}).catch(e=>console.log('it happens inside',e));




return false;
  
  // .then(
  //   res=>{

  //     res.status(200).send(res)
  //   }
  // );
   
    
     
    
    // getAccessTocken(request_tocken)
  
      if(access_token){
       
        // getHoldingsFromZerodha();
        // getHistoricalData(access_token);
      }
  })









// https://127.0.0.1:9090:8000/?action=login&status=success&request_token=fz6liE6nCV6EgM64TR4k5w3DxM3Qkqdq
let holdings=[];


function getHistoricalData(access_token,symbol='INE002A01018',start='2021-03-10',end='2019-03-10'){

  console.log('access tocken from historical data',access_token);
  console.log('\n \n access tocken from historical data api_key',api_key);

  if(access_token == null){

    console.log('No acceess tocken insdie get historical data');
  }

  console.log('access tocken from historical data',access_token);

  // instrument_token, interval, from_date, to_date, continuous

  // let api_key='wkcurst2vu5obug7';
  var kc2 = new KiteConnect({
    api_key: api_key,
    access_token: access_token
  });


  console.log('this is kc2',kc2.getHistoricalData('IDEA','DAY','2021-03-01','2021-03-10',true))



  var d1= new Date();
  let today=d1.toISOString().split('T')[0];

  let d2=new Date();
  d2.setFullYear(d2.getFullYear() - 2);

   symbol='IDEA'
 kc2.getHistoricalData(symbol,'day',d2,d1,true).then(res=>{

  console.log('historical sbin',res)

  return res;
 }).catch(err=>{

  console.log('got an error',err)

  
  
    });

}





// let access_tocken;

// console.log('kc',kc)
// kc.request_access_token(res=>{
//   access_tocken=res;
//   console.log('access_tocken',access_tocken)

// })




// let holdings=JSON.parse(fs.readFileSync('holdings.json'));

// app.use(express.static(path.join(__dirname, '../findiapp/build')));



app.get('/Validate', (req,res) => {

  // res.send(req.params);

  res.sendFile(path.join(__dirname, '../app/dist/index.html'));
});




app.get('/api/getOrders/:accessToken',(req,res)=>{  let accessToken=req.params.accessToken;

  let holding=[]

  let orders=[];
  ZerodhaAPI.getOrders(accessToken).then(r=>{

    orders=r;
   
    ZerodhaAPI.getHoldingsFromZerodha(accessToken).then(h=>{
    
holding=h;

return h;
// console.log('h inside',h)
    
    }).then(
re=>{

   
  orders.forEach(r1=>{

    // console.log('r1',r1.instrument_tocken)

  

    let holdingDetailOfstock=holding.filter(h=>{

      // console.log('h.instrument_tocken',h.instrument_token)
      // console.log('r1.instrument_tocken',r1.instrument_token)
      
     return  h.instrument_token == r1.instrument_token
     

    })[0];

    
// console.log('holdingDetailOfstock',holdingDetailOfstock);
   
    if(typeof(holdingDetailOfstock)!='undefined'){
      r1.holding_details=holdingDetailOfstock;
      r1.gain=(r1.price*r1.quantity)-(holdingDetailOfstock.average_price*r1.quantity)

      // console.log('holdingDetailOfstock',holdingDetailOfstock)
      
      // r1.holding_details
      // console.log('r1.holding_details',r1.holding_details)


    }else{

      // r1.holding_details=holdingDetailOfstock;
      // r1.gain=(r1.price*r1.quantity)-(holdingDetailOfstock.average_price*r1.quantity)

      // console.log('r1.holding_details undefined',r1.holding_details)
   
   
      }
   
   
    // console.log('holdingDetailOfstock',holdingDetailOfstock)
    // r1.holding=holdingDetailOfstock

    // console.log('r1.holding_details',r1.holding_details)

   })

}


    ).then(
    r=>  res.send(orders)

    ) .catch(e=>console.log('it happens inside',e));
    
    ;

    

   
    // r[0].holding={'abc':123};
  

   
  })

    
})

async function execute (res){

  let s= Scraping.scrap();
  return s; 
 
}


app.get('/api/longBuildUp', (req,res) => {  
  let s2=execute().then(
  s=>{

    res.send(s)
    // console.log('exe',s)
  }
  
  ).catch(e=>console.log('it happens inside',e));;

});

app.get('/hld',(req,res)=>{

  
  res.send('hi /')

    res.json(holdings)
})


async function executeCI(href,accessToken){
  // console.log('href',href)

  let s= await CI.scrap(href,accessToken);

  console.log('s',s)
  return s; 
  return CI.scrap(href);
  }

  // let url="/api/getOHLC/symbols/"+ arr+'/accessToken/'+accessToken;;


app.post('/api/CancelOrders', async (req,res) => {
  
 let arr=JSON.parse(req.body.arr)
 let accessToken=req.body.accessToken;
 var kc = new KiteConnect({
  api_key: api_key,
  access_token: accessToken
});


let promises=[];
arr.forEach(async a=>{
try {
  console.log('a.variety',a.variety,'a.order_id',a.order_id)
  let o=await  kc.cancelOrder(a.variety, a.order_id)


  let b=await kc.getOrderHistory(a.order_id);
  console.log('etOrderHistory',b)

  // promises.push(o);
  console.log('cancel orders ',o);
} catch (error) {

  res.send('not-ok')
  console.log('cancel order error',error)
}
  })

// promises.all(promises).then(r=>{

//   res.send('ok')

// })
 


});


app.get('/api/getOHLC/symbols/:arr/accessToken/:accessToken', async (req,res) => {
  
 let arr=JSON.parse(req.params.arr)
 let accessToken=req.params.accessToken;

//  if(typeof(arr) == 'string'){

//   console.log('newe parse',JSON.parse(arr),typeof(JSON.parse(arr)))
//  }

//  console.log('accessToken',typeof(arr))
//  return accessToken;
 
 let ohlcs=await ohlc(accessToken,arr);

 console.log('ohls',ohlcs);

 res.send(ohlcs)
});

app.post('/api/postOHLC', async (req,res) => {
  
 let arr=JSON.parse(req.body.symbols)
 let accessToken=req.body.accessToken;

//  if(typeof(arr) == 'string'){

//   console.log('newe parse',JSON.parse(arr),typeof(JSON.parse(arr)))
//  }

//  console.log('accessToken',typeof(arr))
//  return accessToken;
 
try {
  let ohlcs=await ohlc(accessToken,arr);

  console.log('ohls',ohlcs,'ohls');
 
  res.send(ohlcs)
} catch (error) {
  console.log(error,'error')
}

});




app.post('/api/PlaceBracketOrderInServer/', async (req,res) => {


  console.log('test')
      let arr=JSON.parse(req.body.instruments)
      let accessToken=req.body.accessToken;
      let ltps =await ZerodhaAPI.PlaceBracketOrder(accessToken,arr); 
      res.status(200).send(ltps)
      // res.send(ltps)
 });

 app.get('/api/getMargins/accessTocken/:accessToken', async (req,res) => {



      
      let accessToken=req.params.accessToken;
      let margins =await ZerodhaAPI.getMargins(accessToken); 
      res.status(200).send(margins)
      // res.send(ltps)
 });
 
app.post('/api/getPositions', async (req,res) => {


  
      let accessToken=req.body.accessToken;
      let ltps =await ZerodhaAPI.getPositions(accessToken); 
      res.status(200).send(ltps)
      // res.send(ltps)
 });

 app.get('/api/getMargins/accessTocken/:accessToken', async (req,res) => {



      
      let accessToken=req.params.accessToken;
      let margins =await ZerodhaAPI.getMargins(accessToken); 
      res.status(200).send(margins)
      // res.send(ltps)
 });
 
 
 app.get('/api/getLTP/accessToken/:accessToken/instruments/:instruments', async (req,res) => {


  console.log('test')
      let arr=JSON.parse(req.params.instruments)
      let accessToken=req.params.accessToken;
      let ltps =await ZerodhaAPI.GetLTP(accessToken,arr); 
      res.status(200).send(ltps)
      // res.send(ltps)
 });
 
 app.post('/api/getLTP/accessToken', async (req,res) => {


  // console.log('test')
      let arr=JSON.parse(req.body.instruments)
      let accessToken=req.body.accessToken;
      let ltps =await ZerodhaAPI.GetLTP(accessToken,arr); 
      res.status(200).send(ltps)
      // res.send(ltps)
 });
 
 app.post('/api/modifyOrders', async (req,res) => {

      let ordersString=JSON.parse(req.body.ordersString);
      let accessToken=req.body.accessToken;

      // console.log('ordersString',ordersString);
      // return false;
      let ltps =await ZerodhaAPI.modifyOrder(accessToken,ordersString); 
      res.send(ltps)
 });

app.get('/api/getStrategy/scanner/:href/accessToken/:accessToken', async (req,res) => {

 let href=req.params.href
 let accessToken=req.params.accessToken

let a1=await CI.scrap(href,accessToken).then(a=>{
  res.send(a)
});


});
app.get('/api/OptionChain/:optionChainType/accessToken/:accessToken', async (req,res) => {

 let href=req.params.optionChainType
 let accessToken=req.params.accessToken
// res.send('hi');

let a1=await CI.optionChain(href,accessToken).then(a=>{
  res.send(a)
});


});

app.get('/hld',(req,res)=>{

  
  res.send('hi /')

    res.json(holdings)
})




app.post('/api/fetchSymbolsForTheCategory',async (req,res)=>{
  
  // console.log('symbols');

  // return;

  let accessToken=req.body.accessToken;
  let category=req.body.category;

  console.log('accessToken in route',accessToken)

  // return false;
 
 try {
  const symbols=await NseApi.fetchScripts(category,accessToken)

  StartServerConnections();
  res.send(symbols)

  // console.log('symbols',symbols)
   
 } catch (error) {
   console.log('ERROR FOR FETCH SYMBOLS FOR CATEGORY',error)
 }
 
 

});


app.post('/api/PlaceTarget',(req,res)=>{
  

  let accessToken=req.body.accessToken;
  let ZerodhaParams=req.body.ZerodhaParams;
  let sessionString=req.body.sessionString;
  // console.log('zerodhaparamas',ZerodhaParams)

  ZerodhaAPI.PlaceTarget(accessToken,ZerodhaParams,sessionString).then(r=>{

    console.log('zerodhaparamas',ZerodhaParams)
    res.send(r)
  }).catch(e=>console.log('it happens inside',e));
});

app.post('/api/getQuoteFromZerodha',(req,res)=>{
  

  let accessToken=req.body.accessToken;
  let arryOfInstruments=req.body.arryOfInstruments;

  res.send('11'); return;
  
  // ZerodhaAPI.getQuoteFromZerodha(accessToken,arryOfInstruments).then(r=>{

  //   console.log('zerodhaparamas',ZerodhaParams)
  //   res.send(r)
  // })
});



app.get('/api/getInstruments/:accessToken',(req,res)=>{
  ZerodhaAPI.getInstruments(req.params.accessToken).then(r=>{


    let eq=r.filter(r1=> {
      
     return  r1.segment == 'NSE' && r1.exchange == 'NSE' && r1.instrument_type == 'EQ' && r1.name!=''


    })
    res.send(eq);
    // console.log('r',eq)
  }).catch(e=>{

    console.log('error',e)
  });

});


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function getMinRange(res,e){
    let minRanges=[];   

    let c=0;
  let h1={};
  h1.instrument_token=e.instrument_token;
  h1.historical=res

  res.forEach(h2 => {
    h2.range=Math.abs(h2.high-h2.low)
  });


  let minValue=Math.min.apply(Math, res.map(function(o) { return o.range; }))

  let min=res.filter(a=>a.range == minValue)[0];


  let d3=new Date();
d3.setDate(d3.getDate() -1);
// d3.setHours(24, 00, 0);
let ln=res.length;
let yday1=res[res.length-1]

// console.log('yday1',yday1.date,ln);

// let yday= d3.toISOString().slice(0,10);
let yday= d3.toISOString()



let mindate=min.date.toISOString().slice(0,10,res)
 var dateIST = new Date(min.date.toISOString());
     
//// min date utc to ist////
try {
  // var dateIST = new Date(min.date.toISOString());
  // var dateIST = new Date(min.date.toISOString());

  var mindate1=min.date;
  
} catch (error) {
  console.log(error);
  var mindate1=0;
  
}
try {
  var ydate=yday1.date;
  
} catch (error) {
  console.log(error);
  var ydate=-1;
}



//date shifting for IST timezone (+5 hours and 30 minutes)
dateIST.setHours(dateIST.getHours() + 5); 
dateIST.setMinutes(dateIST.getMinutes() + 30);

//// min date utc to ist////

// console.log('dateIST::',dateIST,'mindate',mindate,'yday',d3.toISOString())

    if(ydate == mindate1){

      // console.log()
    // if(true){

      let m={};
      m.generatedDate=new Date();;
      m.instrument_token=e.instrument_token
      m.tradingsymbol=e.tradingsymbol
      m.date=mindate;
      m.range=min.range;
      m.low=min.low;
      m.high=min.high
      m._id=new mongoose.Types.ObjectId();

      console.log(m)

//       let Nr=new NarrowRange(m);
// Nr.save().then(r=>{

// })
      minRanges.push(m)
      // console.log('MINIMUM RANGE FOUND',e.tradingsymbol,m,yday);
    return m;

    }else{
c=c+1;
      // console.log('not a minimum range',e.tradingsymbol)
      // console.log('not a minimum range',e.tradingsymbol,minValue,min,yday)
      let a={};
return a;
    }
    // return h1
    }



async function GetStocks(req){

  
  let minRanges=[];
  var kc = new KiteConnect({
    api_key: api_key,
    access_token: req.params.accessToken
  });


  let eq1;

  let instru=kc.getInstruments();


let eq=instru.then(
    r=>{
      let eq=r.filter(r1=>r1.segment == 'NSE' && r1.exchange == 'NSE' && r1.instrument_type == 'EQ' && r1.name!='');
    
      // eq1=eq

      
      return eq;
    
    }
    
      ).catch(e=>{

        console.log('error in function get stocks with error',e)
      })

      // eq.then(r=>console.log('------------------ b4 retur ',r))

      
      return eq;

}


async function NrRange(req) {
  let minRanges=[];
  var kc2 = new KiteConnect({
    api_key: api_key,
    access_token: req.params.accessToken
  });
  var interval = 100; 
  let eq=await GetStocks(req);
  let eq1=eq.slice(0,100); 

  var d1= new Date();
  let today=d1.toISOString().split('T')[0];   

  d1.setDate(d1.getDate()+2);

  let d2=new Date();
  d2.setDate(d2.getDate() - 6);

 let promises=  eq1.map(async (e,index)=>{
  setTimeout(function  () {
  
 return  kc2.getHistoricalData(e.instrument_token,'day',d2,d1,false,1)
                                  
    .then(
res=>{

  let mr=getMinRange(res,e);
  // console.log('res',mr)
  return mr
}).catch(e=>console.log('it happens inside',e));;
    
  },interval*index)
});


// console.log('promise from nr range',promises)
return promises;
  

}

async function NrRange1(req) {

  let minRanges=[];
  var kc2 = new KiteConnect({
    api_key: api_key,
    access_token: req.params.accessToken
  });

  

  let eq=await GetStocks(req);

    let eq1=eq.slice(0,10); 

    var d1= new Date();
    let today=d1.toISOString().split('T')[0];   
  
    d1.setDate(d1.getDate()+2);

    let d2=new Date();
    d2.setDate(d2.getDate() - 6);


    var kc2 = new KiteConnect({
      api_key: api_key,
      access_token: req.params.accessToken
    });

    let x=[]

    // let c=1;
    var interval = 100; 

    let ln=eq1.length;

    var promises = [];

    let historical=[];
    let h=await Promise.all(
    eq1.map(async (e,index)=>{
    
      setTimeout(async function  () {

// await e.instrument_token;
       
                     let r=            await    kc2.getHistoricalData(e.instrument_token,'day',d2,d1,false,1)
                                  
                                      .then(
                                  res=>{

                                    let mr=getMinRange(res,e);
                                    return mr
                                  }
                                  
                                        ).then(h1=>{

                                          historical.push(h1);

                                          
                                        }) .then(
r=>{


  return historical;
}

                                        )                                     
                                        
                                        .catch(e=>console.log('it happens inside',e)
                                        
                                        )

        

    },index*interval)

    let out=[];

  
  })
    ).then(
r=>{

  console.log('historical from promise all',historical)
  console.log('historical from promise all H',h1)

  return historical;

}

    ).catch(e=>console.log('it happens inside',e));

   

  
}


async function exeNrange(req){
  let n=await NrRange(req);
  return n;
    
    

    
}

app.get('/api/NrInstruments/:accessToken/range/:range',(req,res)=>{
  


let a=exeNrange(req);
a.then(r=>{

Promise.all(r).then(values=>{

  console.log('from api call -values',values)
  res.send(values)
 
  // console.log('from api call -values',values)


}) .catch(e=>console.log('it happens inside promise all ',e))

})


    
  })



  
  



  

   
  






  
 

app.get('/api/getHistoricalData/symbol/:symbol/accessToken/:accessToken/start/:start/end/:end/intervel/:intervel', async (req, res) => {
let accessToken=req.params.accessToken;
let symbol=req.params.symbol;
let start=req.params.start.replace(/T|Z|\.\d{3}/g, ' ').trim();
let end=req.params.end.replace(/T|Z|\.\d{3}/g, ' ').trim();

console.log('start',start,'end',end)



// start='2021-07-23'
// end='2021-07-23'

// async function historicalData(accessToken,symbol,start,end){
  var kc = new KiteConnect({
    api_key: api_key,
    access_token: accessToken
  });


  try {

    console.log(symbol,'day',start,end)
    let result= await kc.getHistoricalData(symbol,'day',start,end);

    console.log('result',result)

//    let date=result[0].date


   
// var s = new Date(date).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});

// result[0].date=s;


// }
  console.log('result',result)
res.send(result);
    
  } catch (error) {
    console.log('errir',error);
    StartServerConnections()
 
 
  }
   

      
    
  });
  
  
  app.get('/api/holdings/:accessToken', (req, res) => {
    
  //  consoe.log(req.accessToken)   

   ZerodhaAPI.getHoldingsFromZerodha(req.params.accessToken).then(r=>{


    
    if(typeof(r) == 'undefined'){

console.log('ndefined fired')
  res.status(200).send('err');



    }else{


      res.send(r);
      // res.json(r.filter(h=>(h.quantity+h.t1_quantity)!=0));
    }
    
   }).catch(e=>{
     console.log('error',e)
   });
 
   
    
  });

app.get('/api/getAccessTocken', (req, res) => {
    
   
    // res.send('got it');

console.log('request_tocken',request_tocken)
return;
  let AccessTocken= getAccessTocken(request_tocken);
  res.send(AccessTocken);
    
  });

  async function  ExeCPriceFunction(tocken,accessToken){


    // setTimeout(async () => {
      let a=new pricePoint(tocken,accessToken);
      let c=await a.getPricePoints();
      return c;
      
    // }, 2000);
   
    
        

}
  app.get('/api/pricePoints/:instrument_tocken/accessToken/:accessToken',(req,res)=>{


    // setInterval


    let instrument_tocken=req.params.instrument_tocken;
    let accessToken=req.params.accessToken;

     let prices=ExeCPriceFunction(req.params.instrument_tocken,accessToken);

 prices.then(r=>{


  // console.log('received instrument token',req.params.instrument_tocken,'prices',r)
  let encodedPrices=JSON.stringify(r)
  res.send(encodedPrices);

 }) .catch(e=>console.log('it happens inside prices',e))


//  res.send(123);
  
  
  })




  app.get('/*', (req,res) => {
    res.sendFile(path.join(__dirname, '/app/build/index.html'));
  });



// io.on('connection', function(client) {
//     console.log('Client connected...',client.id);

//     client.on('join', function(data) {
//         console.log(data);
//     });
//   });

///webscokets server

let today = new Date().toISOString().slice(0, 10);

// origin:['http://127.0.0.1:9090:7000','http://127.0.0.1:9090:8080','http://127.0.0.1:9090:9090'],

var io = require('socket.io')(4000,{

    cors:{

      'Access-Control-Allow-Origin' : '*',
  
      origin:['*'],
 
        credentials:true,
        

    }
  
  })
///webscokets server

StartServerConnections()///

function StartServerConnections(){

const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{

  console.log('mongo db connected ');
  app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);

    // console.log('io',io)


    AccesTocken.findOne({ 'date': today  },'access_token').then(e=>{              
               
      let access_token=e.access_token;
  
  /////////////////////io part

    
  io.on('connection',socket=>{
   

   


    socket.on('forceDisconnect', (r)=>{

      
      var KiteTicker = require("kiteconnect").KiteTicker;
      var ticker = new KiteTicker({
      api_key: api_key,
      access_token: access_token
      });
      
console.log(r,'force disconenct')
      ticker.unsubscribe(r);



      ticker.on("order_update", (orderUpdates)=>{


        io.emit('order_update',orderUpdates)
    
        console.log('orderupdates',orderUpdates)
    
    
     
    
    });

      
      // socket.disconnect();
  });

  StartWebSockets(socket,access_token);
  sktForMKVStrategy(socket,access_token);
  startWebSocketsOnTrade(socket,access_token);
  sktForMint(access_token,socket);



  



  });
})

.catch(e=>console.log('error',access_token));
;

   
 

})
}).catch(error=>{

  console.log('mongo db connect error',error)

  // StartServerConnections()
})

}

function   sktForMint(access_token,socket){

  var KiteTicker = require("kiteconnect").KiteTicker;
  var ticker = new KiteTicker({
  api_key: api_key,
  access_token: access_token
  });
  
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
  if(items.lenght){

    console.log('items comming in ticker on connect  subscribe',items.length)
  }


  // console.log('subscribe-scripts-for-mint on connect',items);
  
  // console.log(ticker,'ticker')
   
  ticker.subscribe(items);
  ticker.setMode(ticker.modeFull, items);

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
ticker.on("connect", ()=>{

  // console.log('viveeeek',ticker)


ticker.on("order_update", (orderUpdates)=>{


    io.emit('order_update',orderUpdates)

    console.log('orderupdates',orderUpdates)

});

});


// console.log('instruments',r)




/////////////////////io part








}



function StartWebSockets(socket,access_token){


  socket.on('forceDisconnect', r=>{
    var KiteTicker = require("kiteconnect").KiteTicker;
    var ticker = new KiteTicker({
    api_key: api_key,
    access_token: access_token
    });
    
console.log(r,'force disconenct')
    ticker.unsubscribe(r);
});




// console.log('socketid',socket.id);
socket.on('order-book',e=>{
  
  io.emit('send-order',e)//emit to all


  // socket.broadcast.emit('send-order',e) //emit to all exept tosender
  // console.log('orderbook',e)

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
        // console.log('r',r)
        var items =JSON.parse(r);

     // console.log('items1',items)
         
        ticker.subscribe(items);
        ticker.setMode(ticker.modeFull, items);
        
        
        ticker.on("ticks", (ticks)=>{

            io.emit('send-realtime-subscription',ticks)

            console.log('ticks1',ticks)
        });

    });

      
    // console.log('instruments',r)
})




socket.on('subscribe-orders-mining',r=>{
    
 console.log('for minining')
    var KiteTicker = require("kiteconnect").KiteTicker;
    var ticker = new KiteTicker({
        api_key: api_key,
        access_token: access_token
    });

    // console.log('ticker',ticker)
    ticker.connect();
    ticker.on("connect", ()=>{
        // console.log('r',r)
        var items =JSON.parse(r);

       console.log(items,'items1-subscribe-orders')
         
        ticker.subscribe(items);
        ticker.setMode(ticker.modeFull, items);
        
        
        ticker.on("ticks", (ticks)=>{

            io.emit('send-realtime-subscription',ticks)

            console.log('ticks1',ticks)
        });

    });

      
    // console.log('instruments',r)
})




/////////////////////io part








  
}