//get nr4 instruments

let instruments=require('./appv3/public/instruments/instrumentsForMining.json');
const Axios = require('axios')
require('dotenv').config()
const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');
const api_key=process.env.api_key;
const ZerodhaAPI=require('./ZerodhaAPI');
const FormData = require('form-data');

const cluster = require("cluster");
const os = require("os");

const maxTradableConst=100000;

const covered=false;

let hours,minutes,seconds;

let LivePositionTotalAmount=-1;

if(LivePositionTotalAmount == -1) {


  const maxAmountPerStock=0;
}else 
if(LivePositionTotalAmount<maxTradableConst){

  const maxAmountPerStock=20000;

} else if(LivePositionTotalAmount>maxTradableConst){

  const maxAmountPerStock=0;

}





const maxTradableAmount=200000;

let breakoutTrading=true;



let ProposedAmount;
let OrderPlacedAmountBySoftware;


// const procedureForLongTradeForNewMint=require('./procedureForLongTradeForNewMint');
// const procedureForShortTradeForNewMint=
// require('./procedureForShortTradeForNewMint');

const TIMER=1500;
let access_token_global;

console.log(api_key)

let today = new Date().toISOString().slice(0, 10);

let liveOrders=[],livePositions=[] ;

let numCPUs= os.cpus().length;


if(false){
  if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {

      console.log('iside fork loop')
      cluster.fork();


      cluster.on("exit", function(worker) {

      //   if (code !==  0 && !worker.exitedAfterDisconnect) {
      //     cluster.fork();
      // }
        console.log("Worker", worker.id, " has exited.")});



      
    }
  }else{

   


  } 

}


async function coverOrders(){
  let livePositionsTmp = await getPositions(access_token_global);

  let livePositionsSelected = livePositionsTmp.net.filter(
    (p) => p.exchange  ==  "NFO" && p.quantity > 0 && p.product == 'MIS'
  );


  console.log(livePositionsSelected);

}




async function newMint(){


    try {


if(minutes%2 == 0){

  coverOrders()

}

      let t=await   getAccesssToken();

      let p1=await getPositions(access_token_global);
      let lo=await getOrders(access_token_global);
        let instrument_tokens=instruments.map(i=>parseInt(i.instrument_token));

        // console.log(instrument_tokens)

        
        
      
      console.log(instruments.length,'access_token_global',access_token_global)

      var KiteTicker = require("kiteconnect").KiteTicker;
      var ticker = new KiteTicker({
          api_key: api_key,
          access_token: access_token_global
      });

      ticker.connect();

      console.log(ticker.connected(),api_key)

      ticker.on("connect", ()=>{

        ticker.subscribe(instrument_tokens);
        ticker.setMode(ticker.modeLTP, instrument_tokens);


      ticker.on("order_update", async  (orderUpdates)=>{


        let  liveOrders1= await  getOrders(access_token_global)
        let  livePositions1= await  getPositions(access_token_global)

      
        if(typeof livePositions1!='object' ){

        }

       
        console.log(liveOrders1)
        liveOrders=liveOrders1.filter(o=>o.exchange == 'NFO' && o.product == 'MIS');
     
        livePositions=livePositions1.net.filter(o=>o.exchange == 'NFO'
         && o.product == 'MIS');


    
      });

      ticker.on("ticks", (ticks)=>{

// console.log(ticks[0])


        let pvsToken=0;

        ticks.forEach(tick => {


          // console.log(tick)
         
          
let instrument_token=tick.instrument_token;
if(pvsToken == instrument_token){

  return false;
}
pvsToken=instrument_token;

let last_price=tick.last_price;

let previous_price=instruments.filter(i=>i.instrument_token == instrument_token)[0].last_price

let d1=instruments.filter(i=>i.instrument_token == instrument_token)[0].
pricePoints.d1;

let tradingsymbol=instruments.filter(i=>i.instrument_token == instrument_token)[0].tradingsymbol


if(typeof d1  == 'undefined'){

  // console.log('d1',d1)
return false;
}

// console.log(tick,'tick')


  
setLastPriceAndPreviousPriceToInstrument(instrument_token,last_price)

let shortEntryPrice;
let LongEntryPrice;
let longEntryStopLoss
let longEntryTarget;
let shortEntryTarget;
let shortEntryStopLoss;

if(breakoutTrading){

  // console.log(ticks[0],'here')
 shortEntryPrice=instruments.filter(i=>i.instrument_token == instrument_token)[0].
pricePoints.d1.low;

// shortEntryPrice=instruments.filter(i=>i.instrument_token == instrument_token)[0].
// pricePoints.pivotPointObject.bc.toFixed(1)

 LongEntryPrice=instruments.filter(i=>i.instrument_token == instrument_token)[0].
pricePoints.d1.high;

if(typeof LongEntryPrice == 'undefined') return false;
if(typeof shortEntryPrice == 'undefined') return false;


 longEntryTarget=instruments.filter(i=>i.instrument_token == instrument_token)[0].
pricePoints.d1.rangeBreakOutTarget;

//  longEntryStopLoss=instruments.filter(i=>i.instrument_token == instrument_token)[0].
// pricePoints.d1.low;


 longEntryStopLoss=instruments.filter(i=>i.instrument_token == instrument_token)[0].
 pricePoints.pivotPointObject.bc.toFixed(1)


 shortEntryTarget=instruments.filter(i=>i.instrument_token == instrument_token)[0].
pricePoints.d1.rangeBreakDownTarget;

 shortEntryStopLoss=instruments.filter(i=>i.instrument_token == instrument_token)[0].
pricePoints.d1.high;




let entry=false;
}

if(!breakoutTrading){
  

  
  shortEntryPrice=instruments.filter(i=>i.instrument_token == instrument_token)[0].
  pricePoints.d1.high;
  
 LongEntryPrice=instruments.filter(i=>i.instrument_token == instrument_token)[0].
  pricePoints.d1.low;
  

  if(typeof LongEntryPrice == 'undefined') return false;
  if(typeof shortEntryPrice == 'undefined') return false;
 
 
  longEntryTarget=instruments.filter(i=>i.instrument_token == instrument_token)[0].
  pricePoints.d1.high;
  
  longEntryStopLoss=instruments.filter(i=>i.instrument_token == instrument_token)[0].
  pricePoints.d1.rangeBreakDownTarget;
  
  
 shortEntryTarget=instruments.filter(i=>i.instrument_token == instrument_token)[0].
  pricePoints.d1.low;
  
 shortEntryStopLoss=instruments.filter(i=>i.instrument_token == instrument_token)[0].
  pricePoints.d1.rangeBreakOutTarget;



  


}

// console.log(LongEntryPrice);


//has live order for this script

//has live position for this script

//has order placed by software 

// console.log(previous_price)
if(previous_price == 0){



    return false;
}

// console.log(tick)
// '(!hasLiveOrder(instrument_token) && !hasLivePosition(instrument_token) && !hasOrderPlacedByMint(instrument_token))
// console.log(hasLiveOrder(instrument_token)  ,
// hasLivePosition(instrument_token) ,hasOrderPlacedByMint(instrument_token),tradingsymbol )

if((!hasLiveOrder(instrument_token) && 
!hasLivePosition(instrument_token) && !hasOrderPlacedByMint(instrument_token))){

   /// means no live order or  position

  
  

   if(hours>15) 
   if(minutes>5)

   {
console.log('Time over',hours,':',minutes)
    return false;
   }
  


    //procedureForLong if range break out



let dbchk=hasOrderPlacedByMint(instrument_token);
if(!dbchk){

// console.log('dbchk',dbchk,tradingsymbol)
// setOrderPlacedByMint(instrument_token,true);


if(breakoutTrading){


  
// console.log(last_price,LongEntryPrice,previous_price)
    if(last_price>LongEntryPrice && previous_price<LongEntryPrice &&
       previous_price!=0){
        procedureForLongTradeForNewMint(instrument_token)
    }else if(last_price<=shortEntryPrice &&
       previous_price>shortEntryPrice &&
      previous_price!=0 ){

        procedureForShortTradeForNewMint(instrument_token)

      }

     
    }


    if(!breakoutTrading){

      // console.log('hi')
      // if(typeof LongEntryPrice == 'undefined') return false;
      // if(typeof LongEntryPrice == 'undefined') return false;


      if(last_price<LongEntryPrice){

        // console.log('long',tradingsymbol,LongEntryPrice,shortEntryPrice,last_price)
      }
    
    
      if(last_price>shortEntryPrice){
    
        // console.log('short',tradingsymbol,LongEntryPrice,shortEntryPrice,last_price)
      }
     

                if(last_price>=LongEntryPrice && previous_price<LongEntryPrice &&
                  previous_price!=0){
                  procedureForLongTradeForNewMint(instrument_token)
              }else if(last_price<=shortEntryPrice &&
                  previous_price>shortEntryPrice &&
                previous_price!=0 ){
          

                  console.log('no short trade')
                  return ;
                  //procedureForShortTradeForNewMint(instrument_token)
          
                }


    }




  }


    
    
    }
    
   //now check whther there is a position  


  //  console.log('hasLivePosition(instrument_token)',hasLivePosition(instrument_token))
   if(hasLivePosition(instrument_token)){


    console.log(tradingsymbol,longEntryTarget,longEntryStopLoss,last_price)

//check long or short

let qty=livePositions.filter(lp=>lp.instrument_token == instrument_token).

reduce((total,cur)=>{


  

  total=total+cur.quantity
return total
},0)
// pvs=0;


let sym=instruments.filter(i=>i.instrument_token == instrument_token)[0].tradingsymbol;
// console.log(sym,'has live position qty',qty)


let StatusOfStopLossortarget=getStatusOfStopLossortarget(instrument_token);

// console.log(StatusOfStopLossortarget,'StatusOfStopLossortarget')

if(StatusOfStopLossortarget == true){


  // console.log('Already placed a target/StopLoss  for ',sym)
return false  //exiting

}


if(qty<0){



ProcedureForShortCovering(instrument_token,qty,last_price)

}else if(qty>0){

  console.log(instrument_token,qty,last_price)

  ProcedureForLongCovering(instrument_token,qty,last_price)

}





   }


  }); //ticker foreach
});//ticker

});//kite on connect




           
   


let int2=setInterval(async ()  =>{

  var d = new Date();
        hours = d.getHours();
        minutes = d.getMinutes();
        seconds = d.getSeconds();

        console.log(hours,minutes,seconds)

},1000);

     
    


    let intt=setInterval(async ()  =>{

      try {

        



        let  liveOrders1= await  getOrders(access_token_global)
        let  livePositions11= await  getPositions(access_token_global)


        let livePositions1=livePositions11.net;

        console.log(livePositions1,'livePositions1')
        // console.log(livePositions1.net)

        if(typeof livePositions1!='object' ){

return false;
        }

        // console.log(livePositions1.net,'livePositions1.net')
  

        // console.log(typeof liveOrders1,'liveOrders1')

        if(typeof liveOrders1!='object'){

          return false;
        }
        liveOrders=liveOrders1.filter(o=>o.exchange == 'NFO' && 
        o.product == 'MIS');



        console.log(livePositions1,'livePositions1')
        livePositions=livePositions1.net.filter(o=>o.exchange == 'NFO'
         && 
        o.product == 'MIS' && o.quantity!=0);

// console.log(livePositions1.net.length,livePositions1.day.length)
        let total=0;
        LivePositionTotalAmount=0;
//         LivePositionTotalAmount=livePositions.reduce((total,current)=>{




//           console.log('currentvalue', 
//           Math.abs(current.quantity)*current.average_price)
//           console.log(total,'total')
// total=total + Math.ceil(Math.abs(current.quantity)*current.average_price)




//         },0)
LivePositionTotalAmount=0;
livePositions.forEach(e=>{

  LivePositionTotalAmount= Math.ceil(Math.abs(e.quantity)*
  e.average_price)

});


console.log(LivePositionTotalAmount,'LivePositionTotalAmount')

        // console.log('orderupdates',LivePositionTotalAmount,'LivePositionTotalAmount')

   let a=     instruments.
   filter(i=>i.hasOrderPlacedByMint == true).map(m=>m.tradingsymbol);
  //  console.log(a,'List of order placed by Mint')
        
      } catch (error) {
        

        console.log(error,'the above error happned when calling positions ')
      }
   

      
      },TIMER)
        
   
   
  
  // subscribe for ltp in socket
  
  
  
  
  // long procedure
  
  //short procedure
  // if range break out buy
  
  //if bought check for stop lossor tgt
  
  // if tgt or stoploss sell
    
}  //trchy cat

catch(err){

  console.log('error in something buy or seell---------------------')
}

}//new mint ends



function PlacedtargetOrStopLoss(instrument_token,status){

  instruments.filter(i=>i.instrument_token == instrument_token)[0].PlacedtargetOrStopLoss=status
}


function getStatusOfStopLossortarget(instrument_token){


  return   instruments.filter(i=>i.instrument_token == instrument_token)[0].
  PlacedtargetOrStopLoss


}


function ProcedureForShortCovering(instrument_token,qty,last_price)


{


  qty=qty*-1; //revreser the quantity

  // let liveProfitApprox=(instrument.pricePoints.d1.low-last_price)*qty

  let gainStokcPrice=(maxAmountPerStock*10)

  let tradingsymbol=instruments.filter(i=>i.instrument_token == instrument_token)[0].tradingsymbol
  let instrument=instruments.filter(i=>i.instrument_token == instrument_token)[0]
  let exchange=instrument.exchange;
  let target;
  let stopLoss;



if(!breakoutTrading){

  // let rangeBreakDownTarget1=instrument.pricePoints.d1.rangeBreakDownTarget;

  // let tgt3pc=Math.ceil(instrument.pricePoints.d1.low*.99)
  
  //  target=Math.min(rangeBreakDownTarget1,tgt3pc)
  //  target=instrument.pricePoints.d1.low;
   target=instrument.pricePoints.d1.high*.98
  
  //  stopLoss=instrument.pricePoints.d1.high;

  stopLoss=Math.ceil(instrument.pricePoints.d1.high*1.01)
  //  stopLoss=instrument.pricePoints.d1.rangeBreakOutTarget;



}

if(breakoutTrading || exchange == 'NFO'){
  let rangeBreakDownTarget1=instrument.pricePoints.d1.rangeBreakDownTarget;

  let tgt3pc=Math.ceil(instrument.pricePoints.d1.low*.99)
  
   target=Math.min(rangeBreakDownTarget1,tgt3pc)
  
   stopLoss=instrument.pricePoints.d1.high;
}





let transaction_type='BUY';









  

  if(last_price<=target){
    console.log('ProcedureForShortCovering',tradingsymbol,qty,
    'target:',target,'sl:',stopLoss,'last_price',last_price)
  
//mark as set target

console.log('triger for target ',tradingsymbol)

PlacedtargetOrStopLoss(instrument_token,true)

let Price=target

//place order 
buildOrderArrayAndPlaceOrder(instrument_token,transaction_type,qty,Price,exchange)

return 

  }


  if(last_price>=stopLoss){
    console.log('ProcedureForShortCovering',tradingsymbol,qty,
    'target:',target,'sl:',stopLoss,'last_price',last_price)
  
    //mark as set target

    console.log('triger for stop loss',tradingsymbol)
    
    PlacedtargetOrStopLoss(instrument_token,true)
    
    let Price=stopLoss
    
    //place order 
    buildOrderArrayAndPlaceOrder(instrument_token,transaction_type,qty,Price,exchange)
    
    return 
    
      }




}


 function ProcedureForLongCovering(instrument_token,qty,last_price){

  

  qty=qty; //revreser the quantity

  let tradingsymbol=instruments.filter(i=>i.instrument_token == instrument_token)[0].tradingsymbol
  let instrument=instruments.filter(i=>i.instrument_token == instrument_token)[0]

  let target;
  let stopLoss;

  let exchange=instrument.exchange;
  if(!breakoutTrading ){

    // target=instrument.pricePoints.d1.high
    target=instrument.pricePoints.d1.low*1.02

    stopLoss=Math.ceil(instrument.pricePoints.d1.low*.99)
    // stopLoss=instrument.pricePoints.d1.rangeBreakDownTarget;



  }


  if(breakoutTrading || exchange == 'NFO'){
 
    let rangeBreakDownTarget1=instrument.pricePoints.d1.rangeBreakOutTarget
  
  
  
  // let targetPC=Math.ceil(instrument.pricePoints.d1.high*1.01)
  
  //  target=Math.min(rangeBreakDownTarget1,targetPC);
   target=rangeBreakDownTarget1;
  stopLoss=instrument.pricePoints.pivotPointObject.bc.toFixed(1)
  // stopLoss=instrument.pricePoints.d1.low;
    }

let transaction_type='SELL';



// console.log('ProcedureForLongCovering',tradingsymbol,qty,
//   'target:',target,'sl:',stopLoss,'last_price',last_price)


  

  if(last_price>=target){
   
  
//mark as set target

PlacedtargetOrStopLoss(instrument_token,true)

let Price=target

//place order 
buildOrderArrayAndPlaceOrder(instrument_token,transaction_type,qty,Price,exchange)

return 

  }


  if(last_price<=stopLoss){
    console.log('ProcedureForShortCovering',tradingsymbol,qty,
    'target:',target,'sl:',stopLoss,'last_price',last_price)
  
    //mark as set target
    
    PlacedtargetOrStopLoss(instrument_token,true)
    
    let Price=stopLoss
    
    //place order 
    buildOrderArrayAndPlaceOrder(instrument_token,transaction_type,qty,Price,exchange)
    
    return 
    

 }

 }


function  buildOrderArray(tradingsymbol, transaction_type, qty, order_type, Price,exchange) {
  let order = {};

  //   order.variety = this.selectedVariety;

  order.variety = "regular";
  //  order.variety = "amo";

  order.params = {};
  order.params.exchange = exchange;
  order.params.tradingsymbol = tradingsymbol;
  order.params.transaction_type = transaction_type;

  order.params.quantity = qty;

  order.params.product = "MIS";
  order.params.order_type = order_type;
  order.params.validity = "DAY";

  order.params.price = Price;


  let ar=[]
  ar.push(order)
  return ar;
}

function setLastPriceAndPreviousPriceToInstrument(instrument_token,last_price){
    
    instruments.filter(i=>i.instrument_token == instrument_token)[0].previous_price=instruments.filter(i=>i.instrument_token == instrument_token)[0].last_price
    instruments.filter(i=>i.instrument_token == instrument_token)[0].last_price=last_price;
    
}

async  function   getOrders(accessToken){

let lo=await   ZerodhaAPI.getOrders(accessToken);

 return lo;
}


async function getPositions(accessToken){

    let ltps =await ZerodhaAPI.getPositions(accessToken)

    return ltps;
}

function hasLivePosition(instrument_token){

  // console.log(livePositions,'livePositions')
  let  ln= livePositions.filter(lp=>lp.instrument_token == instrument_token).length

  if(ln>0){

    return true
  }else{

    return false;
  }


}


function setOrderPlacedByMint(instrument_token,status){

  // console.log('has placed by mint')

    instruments.filter(lp=>lp.instrument_token == instrument_token )[0]
    .hasOrderPlacedByMint=status;
    
    
    let ts=instruments.filter(i=>i.instrument_token == instrument_token)[0].tradingsymbol

    let s=instruments.
    filter(lp=>lp.instrument_token == instrument_token)[0].hasOrderPlacedByMint



   let chk=hasOrderPlacedByMint(instrument_token);
  //  console.log(chk,'chk inside setting placedorder as status',s,ts)

  //  process.exit();

}

function hasOrderPlacedByMint(instrument_token){

  // console.log(instrument_token);
    let  ln= instruments.
    filter(lp=>lp.instrument_token == instrument_token )[0].hasOrderPlacedByMint
  return ln;


    let ts=instruments.filter(i=>i.instrument_token == 
      instrument_token)[0].tradingsymbol
//  console.log(ln,'len mint',ts)

    if(ln == true){
  
      return true
    }else if (typeof ln == 'undefined'){
  // console.log(typeof ln)
      return false;
    }

}

function hasLiveOrder(instrument_token){
    let  ln= liveOrders.filter(lp=>lp.instrument_token == instrument_token).length

    if(ln>0){
  
      return true
    }else{
  
      return false;
    }

}



async function getAccesssToken(){


    const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
  
    access_token_global= await AccesTocken.findOne({ 'date': today  },'access_token').then(e=>e.access_token);

}

function buildOrderArrayNo(tradingsymbol, transaction_type, qty, order_type, Price) {
    let order = {};

    //   order.variety = this.selectedVariety;

    order.variety = "regular";
    //  order.variety = "amo";

    order.params = {};
    order.params.exchange = "NFO";
    order.params.tradingsymbol = tradingsymbol;
    order.params.transaction_type = transaction_type;

    order.params.quantity = qty;

    order.params.product = "NRML";
    order.params.order_type = order_type;
    order.params.validity = "DAY";

    order.params.price = Price;

    // return order;

    let ar=[]
    ar.push(order)
    return ar;
  }





function buildOrderArrayAndPlaceOrder(instrument_token,transaction_type,qty,Price,exchange){


  let p=instruments.filter(p1=>p1.instrument_token == instrument_token)[0];
  
  // let Price = p.pricePoints.d1.low;
  let tradingsymbol = p.tradingsymbol;

  // let exchange=p.exchange;
 
  let lot_size =qty
  let order_type = "LIMIT";
 
  // let transaction_type = transaction_type
  let orderArray= buildOrderArray(
    tradingsymbol,
    transaction_type,
  
    lot_size,
    order_type,
    Price,exchange
  );


  let data1 = JSON.stringify(orderArray);

  let data = {};

  data.accessToken = access_token_global;
  data.ZerodhaParams = data1;


  let s=[];
let sessionString=JSON.stringify(s);

console.log('firing stop loss or target',data1)

ZerodhaAPI.PlaceTarget(access_token_global,data1,sessionString);

return;
}


function procedureForLongTradeForNewMint(instrument_token){
  let chk=hasOrderPlacedByMint(instrument_token);

  // console.log('chkinside',chk,'instrument_token',instrument_token)
  if(chk == true){

    return false
  }
  

    
  setOrderPlacedByMint(instrument_token,true)
    
    
    let p=instruments.filter(p1=>p1.instrument_token == instrument_token)[0];
  
    let Price;
    if(breakoutTrading){

      Price = p.pricePoints.d1.high;
    } 
    
    if(!breakoutTrading){

     Price = p.pricePoints.d1.low;
    }
  


    let tradingsymbol = p.tradingsymbol;
    //  let lot_size =Math.floor(maxAmountPerStock/Price)
    // let lot_size =1
    let order_type = "LIMIT";




    let exchange=p.exchange;
    
    let lot_size;

    if(exchange == 'NFO'){
      lot_size=p.lot_size
      Price = p.pricePoints.d1.high;

    }else{

      lot_size =Math.floor(maxAmountPerStock/Price)

    }

   
    let transaction_type = "BUY";
    let orderArray= buildOrderArray(
      tradingsymbol,
      transaction_type,
    
      lot_size,
      order_type,
      Price,exchange
    );


    let data1 = JSON.stringify(orderArray);

    let data = {};

    data.accessToken = access_token_global;
    data.ZerodhaParams = data1;


    let s=[];
let sessionString=JSON.stringify(s);

// console.log(data1,'order data1 longing ')

ZerodhaAPI.PlaceTarget(access_token_global,data1,sessionString);
  
    
 
    
    // console.log(orderArray,'order aray long trade')
  }



  function procedureForShortTradeForNewMint(instrument_token){

return false;
    ///ProcedureForShort if range break down

    let chk=hasOrderPlacedByMint(instrument_token);


    // console.log('chkinside',chk)
    if(chk == true){

      return false
    }
    
     setOrderPlacedByMint(instrument_token,true)
    
    
    let p=instruments.filter(p1=>p1.instrument_token == instrument_token)[0];

    let exchange=p.exchange;
    
    let lot_size;
    let Price;
    if(breakoutTrading){
      Price = p.pricePoints.d1.low;
    }

    if(!breakoutTrading){
     Price = p.pricePoints.d1.high;
    }


   

    if(exchange == 'NFO'){
      lot_size=p.lot_size

      Price = p.pricePoints.d1.low;


    }else{

      lot_size =Math.floor(maxAmountPerStock/Price)

    }

   
    
     
   
    let tradingsymbol = p.tradingsymbol;
    // let lot_size = p.quantity;
    // let lot_size = 1;
    
   
    let order_type = "LIMIT";
   
    let transaction_type = "SELL";
    let orderArray= buildOrderArray(
      tradingsymbol,
      transaction_type,
    
      lot_size,
      order_type,
      Price,exchange
    );
    

    let data1 = JSON.stringify(orderArray);

    let data = {};

    data.accessToken = access_token_global;
    data.ZerodhaParams = data1;


    let s=[];
let sessionString=JSON.stringify(s);

// console.log(data1,'order data1 shorting ')

ZerodhaAPI.PlaceTarget(access_token_global,data1,sessionString);
   // PlaceTarget(access_token_global,ZerodhaParams,sessionString)
    
    // console.log(orderArray,'order aray short trade')
    //place order
    
    }
  
    newMint();