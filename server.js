const express= require('express');
const path =require('path')
const mongoose=require('mongoose');
let ohlc=require('./scraping/ohlc');
const cluster = require("cluster");
const os = require("os");
const api_key=process.env.api_key;
let AccesTocken=require('./models/AccessTokens');
;
let  Enable=true;
let ProxyTrade=false;
const cors = require('cors')
const pgRoutes = require('./postgresDB/pg_routes.js');

const NseApi=require('./scraping/nse');


const fetchFunction=require('./fetchFunction');

const axios =require('axios');

const Order=require('./models/Orders');

const StartServerConnections=require('./StartServerConnections.js');

const commonFunctions=require('./common_functions.js')


let pricePoint=require('./pricePoints.js');

let access_token_global;









const fs = require('fs');
require('dotenv').config()

const ZerodhaAPI=require('./ZerodhaAPI');

const Scraping=require("./scraping/index.js")
const CI=require("./scraping/ci.js")

const app=express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
var history = require('connect-history-api-fallback');

process.on('uncaughtException', function(err) {
  console.log(err);
});


app.use(history());

let port = process.env.PORT;
if (port  ==  null || port  ==  "") {
  const port =9090;
}

// let port = 9091



const  bodyParser = require("body-parser");


const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker('./workerForFetchInstruments.js');
  worker.on('message', (message) => {
    console.log('Received message from secondary thread:', message);
  });
} else {
  console.log('This is the secondary thread.');
}

app.use(express.static(path.join(__dirname, './appv3/dist')));
// app.use(express.static(path.join(__dirname, './appreact/build')));

// app.use('/api/react', express.static(path.join(__dirname, './appreact/build')))


// app.use(express.static('files'))


app.use('/postgres', pgRoutes);

let NarrowRange=require('./models/NarrowRange');

// console.log('NarrowRange',NarrowRange)

app.use(bodyParser.json());

// console.log('file started')

// console.log('app',app)


// https://kite.zerodha.com/connect/login?v=3&api_key=wkcurst2vu5obug7



let request_tocken;

const api_secret=process.env.api_secret;
// let access_token;
let access_token=process.env.ACCESS_TOCKEN;



var KiteConnect = require("kiteconnect").KiteConnect;

// KiteConnect.invalidateAccessToken();
const { exit } = require('process');
const { isError } = require('util');

var kc = new KiteConnect({
	api_key: api_key
});


const { spawn } = require('child_process');
app.post('/api/fetch-instruments', (req, res) => {
  const script = spawn('node', ['./FetchInstruments']);

  // Listen for output from the script
  script.stdout.on('data', (data) => {
    console.log(`Script output: ${data}`);
  });

  // Listen for errors from the script
  script.stderr.on('data', (data) => {
    console.error(`Script error: ${data}`);
  });

  // Listen for the script to exit
  script.on('close', (code) => {
    console.log(`Script exited with code ${code}`);

    res.send({
      message: 'FetchInstruments script finished executing',
      code: code
    });
  });
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


console.log(at.access_token,'at.access_token accesst token note')

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

  res.sendFile(path.join(__dirname, '../appv3/dist/index.html'));
});


app.post('/api/FetchInstruments', (req, res) => {
  // Read the JSON file from the specified path

  console.log('got it');
  const filePath = path.join(__dirname, '/appv3/public/instruments/instrumentsForMining.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read file:', err);
      res.status(500).json({ error: 'Failed to fetch instruments' });
    } else {
      // Parse the JSON data and send it as response
      const instruments = JSON.parse(data);
      res.json(instruments);
    }
  });
});

app.post('/api/getHourlyCandleLows', async (req,res) =>{
  let access_token=req.body.accessToken;
  let symbols_json=req.body.symbols_json;

  let symbols=JSON.parse(symbols_json)
  let a= await ZerodhaAPI.getHourlyCandleLows(access_token,symbols)
  res.send(a)
  // res(a)
});


const TradeStrategy = require('./models/tradeStrategy');

app.post('/api/writeTradeStrategy', async (req, res) => {
  const { accessToken, tradingSymbol, timeOfBuy, buyPrice, quantity, strategyName, Date } = req.body;


  try {
    const tradeStrategy = new TradeStrategy({
      accessToken,
      tradingSymbol,
      timeOfBuy,
      buyPrice,
      quantity,
      strategyName,
      Date
    });
    await tradeStrategy.save();
    res.status(201).send('Trade strategy saved successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});




app.post('/api/triggers',(req,res)=>{
  const Trigger = require('./models/Triggers.js')
;

const triggerData = req.body;

  // Create a new trigger instance
  const trigger = new Trigger(triggerData);

  // Save the trigger to the database
  trigger.save()
    .then(() => {
      res.json({ message: 'Trigger saved successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to save trigger' });
    });

} );


app.post('/api/getOrdersPost',(req,res)=>{

let accessToken=req.body.accessToken;
ZerodhaAPI.getOrders(accessToken).then(r=>{

res.send(r)

});
})



app.post('/api/updateJsonFileWithData',(req,res)=>{
  const updateJSONFile =require('./updateJsonFile.js') ;

  let filePath=req.body.filePath;
  let newData=req.body.instruments;

  console.log('here filw writing');
  const replaceExisting = true; // Set this flag to true if you want to replace existing data, false to merge

  updateJSONFile(filePath, newData, replaceExisting)
    .then((message) => {
      console.log(message);
    })
    .catch((error) => {
      console.error('Error updating/creating JSON file:', error);
    })
});


app.get('/api/getOrders/:accessToken',(req,res)=>{  let accessToken=req.params.accessToken;

  console.log('here it is ',accessToken)

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
   
  }
  
  ).catch(e=>console.log('it happens inside',e));;

});



app.get('/hld',(req,res)=>{

  
  res.send('hi /')

    res.json(holdings)
})



app.delete('/api/deleteGTT/:trigger_id/',async(req,res)=>{

  console.log(req.headers.authorization.split(' ')[1],'req')

  let accessToken=req.headers.authorization.split(' ')[1];
 
  let trigger_id=req.params.trigger_id;
 
  var kc = new KiteConnect({
   api_key: api_key,
   access_token: accessToken
 });
 
let out =await kc.deleteGTT(trigger_id);
console.log(out,'gtt deletion')
  // deleteGTT

})
app.post('/api/GTT',async (req,res)=>{
console.log('gtt')
  // let today = new Date().toISOString().slice(0, 10);
  let fileName = '/'+'pricePoints.json';
    
  try {
    let pp=0;
     pp=require('./pricePoints'+fileName)
    //  console.log(pp)

 res.send(pp)
    
  } catch (error) {
console.log(error)

    res.send(error)

  }
  
    
})

app.get('/api/dailyGainers/:accessTocken',async (req,res)=>{

  let dailygainers=require('./dailyGainers');
 let a= await dailygainers()
  res.send(a)

    
})

app.get('/api/dailyLosers/:accessTocken',async (req,res)=>{

  letdailyLosers=require('./dailyGainers');
 let a= await dailyLosers()
  res.send(a)

    
})

app.post('/api/updateMissingScriptInInstrumetsFile/',
(req,res)=>{

  console.log('updateMissingScriptInInstrumetsFile');



  let updateMissingScriptInInstrumetsFile=require('./updateMissingScriptInInstrumetsFile.js')
  

  let instrument_token=req.body.instrument_token
  let accessToken=req.body.accessToken

  console.log(instrument_token,'instrument_token from update mssing script')
  updateMissingScriptInInstrumetsFile(instrument_token,accessToken)
  
  // res.send('hi /')

    // res.json(holdings)
})


const executeCI=commonFunctions.executeCI;

  // let url="/api/getOHLC/symbols/"+ arr+'/accessToken/'+accessToken;;
  app.post('/api/WriteTrades', async (req,res) => {
  
 
    // let trade='\r\n'+req.body.trade;
    let trade=req.body.trade;
   

    let today = new Date().toISOString().slice(0, 10);
    let erroroutFile='./trades-'+today+'.text';

    console.log(trade)
     fs.appendFile(erroroutFile, JSON.stringify(trade), 'utf8', function (err) {
       if (err) {
           console.log("An error occured while writing JSON Object to File.");
           return console.log(err);
       }
          //  console.log("Error file has been saved.",erroroutFile);
   })
   
   });

app.post('/api/CancelOrders', async (req,res) => {
  
 let arr=JSON.parse(req.body.arr)
 let accessToken=req.body.accessToken;
 var kc = new KiteConnect({
  api_key: api_key,
  access_token: accessToken
});


let promises=[];
arr.forEach(async a=>{


  if(a!=null){


    try {

    console.log('a.variety',a.variety,'a.order_id',a.order_id)
    let o=await  kc.cancelOrder(a.variety, a.order_id)
  
  
    let b=await kc.getOrderHistory(a.order_id);
    console.log('etOrderHistory',b)
    res.send(b)
    // promises.push(o);
    console.log('cancel orders ',o);
  } catch (error) {
  
    res.send('not-ok')
    console.log('cancel order error',error)
  }
  }
 
  })
});

// app.post('/api/FetchInstruments', async (req,res) => {
  
 
//  let accessToken=req.body.accessToken;

//  console.log('this is from fetch instruments route ',accessToken)
//  //fetchInstrumentsForMining(accessToken)
// });



// promises.all(promises).then(r=>{

//   res.send('ok')

// })
 





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

 
try {
  let ohlcs=await ohlc(accessToken,arr);

  console.log('ohls',ohlcs,'ohls');
 
  res.send(ohlcs)
} catch (error) {
  console.log(error,'error-ohlc @655')
}

});

app.post('/api/getGTTs',async (req,res)=>{
  let accessToken=req.body.accessToken;
  try {
    var kc = new KiteConnect({
      api_key: api_key,
      access_token: accessToken
    });

let gtts=await kc.getGTTs();

res.send(gtts)

console.log(gtts,'gtts')

  }catch(e){

    console.log(e,'gtt getting error')
  }

});


app.post('/api/PlaceGTT', async (req,res) => {
  
 let params=req.body.params;
 let accessToken=req.body.accessToken;


//  print(params);
 
try {
  var kc = new KiteConnect({
    api_key: api_key,
    access_token: accessToken
    // debug:True
  });

  // kc.GTT_STATUS_ACTIVE

  
  params.trigger_type=kc.GTT_TYPE_SINGLE;

  params.orders.order_type=kc.ORDER_TYPE_LIMIT;

  console.log(params,'here');



  let out=await kc.placeGTT(params);

  res.send(out);
  return;

} catch (error) {
  console.log(error,'this error')
}

});


app.post('/api/getLatestPricesOfClosedScripts', async (req,res) => {
  
 let arr=JSON.parse(req.body.symbols)
 let accessToken=req.body.accessToken;

 
try {
  let ohlcs=await ohlc(accessToken,arr);



  // console.log('ohls',ohlcs,'ohls');

let ret= Object.keys(ohlcs).map(e=>{
let ob={}
ob.last_price=ohlcs[e].last_price;
ob.instrument_token=e

return ob;



  })
 
  res.send(ret)
} catch (error) {
  console.log(error,'error -ohlc 738')
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

 app.post('/api/getMargins/accessTocken/', async (req,res) => {



      
      let accessToken=req.body.access_token;
      let margins =await ZerodhaAPI.getMargins(accessToken); 

      // console.log(margins,',martrins')
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
 
 app.get('/api/btstOptions', async (req,res) => {

  console.clear();


//   res('ok')
//  return ;
     
      // let accessToken=req.body.accessToken;
      const btst = require("./btst");
     try {

      let bts =await btst(); 


      // console.log(bts,'bts')
      res.status(200).send(bts)
      // res.send(ltps)

      return
       
     } catch (error) {
       console.log(error,'error in btst')
     }
     
      
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

 console.log('href1',href)

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

  res.send(symbols)

  // console.log('symbols',symbols)
   
 } catch (error) {
   console.log('ERROR FOR FETCH SYMBOLS FOR CATEGORY',error)
 }
 
 

});


app.post('/api/PlaceTarget',async (req,res)=>{
  

  let accessToken=req.body.accessToken;
  let ZerodhaParams=req.body.ZerodhaParams;
  let sessionString=req.body.sessionString;
  // console.log('zerodhaparamas',ZerodhaParams)

 let z=await  ZerodhaAPI.PlaceTarget(accessToken,ZerodhaParams,sessionString).then(r=>{

    // console.log('zerodhaparamas after result ',ZerodhaParams)
    res.send(r)
  }).catch(e=>console.log('it happens inside',e));
});

app.post('/api/getQuoteFromZerodha',async (req,res)=>{
  

  let accessToken=req.body.accessToken;
  let arryOfInstruments=req.body.arryOfInstruments;

  let a=await ZerodhaAPI.getQuoteFromZerodha (accessToken,arryOfInstruments);



  res.send(a);
  
  
});



app.get('/api/getInstruments/:accessToken',(req,res)=>{
  ZerodhaAPI.getInstruments(req.params.accessToken).then(r=>{


    let eq=r.filter(r1=> {
      
     return  r1.segment == 'NSE' && r1.exchange == 'NSE' && r1.instrument_type == 'EQ' && r1.name!=''


    })
    res.send(eq);
    // console.log('r',eq)
  }).catch(e=>{

    console.log('error-get instruments 975',e)
  });

});


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



var getMinRange=commonFunctions.getMinRange;

var GetStocks=commonFunctions.GetStocks;




const NrRange=commonFunctions.NrRange;


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
let intervel=req.params.intervel;

// console.log('start',start,'end',end,intervel)



// start='2021-07-23'
// end='2021-07-23'

// async function historicalData(accessToken,symbol,start,end){
  var kc = new KiteConnect({
    api_key: api_key,
    access_token: accessToken
  });


  try {

    console.log(symbol,intervel,start,end)
    let result= await kc.getHistoricalData(symbol,intervel,start,end,0,1);


    result.forEach(r=>{


      r.IST=convertToIndianTime(r.date);

    })
    // console.log('result',result)

//    let date=result[0].date


   
// var s = new Date(date).toLocaleString(undefined, {timeZone: 'Asia/Kolkata'});

// result[0].date=s;


// }
  // console.log('result',result)
res.send(result);
    
  } catch (error) {
    console.log(`GET HISTOTICAL DATE ERROR FOR SYMBOL ${symbol}`,error); 
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
     console.log('error @ 1399 get holdings',e)
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

app.get('/api/fetchInstrumentsForMining/accessToken/:accessToken',(req,res)=>{

  let accessToken=req.params.accessToken;

  fetchInstrumentsForMining(accessToken)

});


app.get('/api/triggerWebsocktsInServer/accessToken/:accessToken',(req,res)=>{

  let accessToken=req.params.accessToken;

  // startIoConnections();

});



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
    res.sendFile(path.join(__dirname, '/appv3/dist/index.html'));
  });





///webscokets server

let today = new Date().toISOString().slice(0, 10);


const http = require('http')
const server = http.createServer(app)






///webscokets server

StartServerConnections(app,port,today)///




const StartWebSockets=require('./StartWebSockets');

var io = require('socket.io')(4000,{

  cors:{
         origin:"*"
  }

})


io.on('connection',socket=>{
  StartWebSockets(socket,io)
});


const proxyTrade=require('./proxyTrade') ;

function convertToIndianTime(utcTimeString) {
  // Create a Date object from the UTC time string
  const utcDate = new Date(utcTimeString);

  // Set the time zone to Indian Standard Time (IST)
  const options = { timeZone: 'Asia/Kolkata' };

  // Format the date and time using IST
  const indianTimeString = utcDate.toLocaleString('en-IN', options);

  return indianTimeString;
}

  
    
  