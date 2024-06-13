
/// plan for intra day

///// subscribe tokens
/// ohlc less than open 

/* // main.js
const { connectToDatabase } = require('../connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js'); */
//import  instruAll  from '../appv3/public/instruments/instrumentsAll.json' assert { type: 'json' }
import  instruAll  from '../appv3/public/instruments/instrumentsForMining.json' assert { type: 'json' }
//const { connectToDatabase } = require('../connectToDatabase.js');
import {getKiteConnectInstance}   from '../getKiteConnectInstance.js';
import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import { io } from 'socket.io-client';


//const socket = io('http://localhost:4000');


import  {connectToDatabase} from '../connectToDatabase.js'
var con=connectToDatabase();
var accessTokenDoc= await getTodaysAccessToken()
var filteredInstruments = instruAll//.filter(instrument => instrument.exchange === 'NSE');
var orders;
var positions;
var netPositions;
var dayPositions;
var nfoOrders;
var openNFOorders
var openNFOBUYorders
var openNFOSELLorders
var scriptAboveOpen;
var ticksAboveOpen;
var tradingsymbolsAboveOpen;
var insrumentTokensAboveOpen;
var instrumentsAboveOpen;

setInterval(async ()=>{

orders=await kite.getOrders();
nfoOrders=orders.filter(i=>i.exchange=='NFO')
openNFOorders=orders.filter(s=>s.status=='OPEN')
openNFOBUYorders=nfoOrders.filter(s=>s.transaction_type=='BUY')
openNFOSELLorders=nfoOrders.filter(s=>s.transaction_type=='SELL')
let p=await kite.getPositions();

netPositions=p.net;
dayPositions=p.day;
positions=p;

for(var i=0;i<instrumentsAboveOpen.length;i++){

    setTimeout(()=>{

        kite.getHistoricalData()
    },333)
}

//console.log(orders,'orders')

},1*1000); 


const kite =await  getKiteConnectInstance();
const instrument_tokens=filteredInstruments.map(a=>parseInt(a.instrument_token));
//console.log(instrument_tokens)

let k= kite.api_key
let k2= kite.access_token


console.log(k,k2);


import { KiteTicker } from "kiteconnect";



function onTicks(ticks) {

   ticksAboveOpen=ticks.filter((t)=>{

      //  return t.ohlc.open<t.last_price && t.ohlc.open!=0  && t.change<-10
        return t.ohlc.open<t.last_price && t.ohlc.open!=0 
    });

instrumentsAboveOpen=ticksAboveOpen.map(a=>a.instrument_token)
scriptAboveOpen=instruAll.filter(i=>instrumentsAboveOpen.includes(parseInt(i.instrument_token)))
insrumentTokensAboveOpen=instruAll.filter(i=>instrumentsAboveOpen.includes(parseInt(i.instrument_token)))
tradingsymbolsAboveOpen=   scriptAboveOpen.map(a=>a.tradingsymbol)
//insrumentTokensAboveOpen=scriptAboveOpen.map(a=>a.tr)

//console.log("Ticks", shorts);

   console.log(instrumentsAboveOpen,'scriptAboveOpen',tradingsymbolsAboveOpen)

   return;
   
}

function subscribe() {
    var items = instrument_tokens

   
    ticker.subscribe(items);
    ticker.setMode(ticker.modeFull, items);
}

var ticker = new KiteTicker({
    api_key: kite.api_key,
    access_token: kite.access_token
});

let con2=ticker.connect();
console.log('here2',con2,ticker.connected())
ticker.on("ticks", onTicks);
ticker.on("connect", subscribe);

