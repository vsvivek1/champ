const fs = require("fs");
const instruments = require("./appv3/public/instruments/instrumentsAll.json");
var KiteConnect = require("kiteconnect").KiteConnect;
// let api_key=process.env.api_key;
let api_key='wkcurst2vu5obug7';
let access_token//=process.env.ACCESS_TOCKEN
function a(){


  
  
  // let at=require( "./common-functions/getAccessToken");
  
  
  // main();
  
 
  
  function writeOutputToFile(filePath) {
      let filteredInstruments = instruments.filter(i => i.segment  ==  "NFO-OPT")[0].pricePoints;
  
      // console.log(filteredInstruments);
  
      // process.exit();
  
      let data = JSON.stringify(filteredInstruments, null, 2);
  
      fs.writeFile(filePath, data, function(err) {
          if (err) {
              return console.log(err);
          }
          console.log("The file was saved!");
      });
  }
  
  const filepath='./out.txt'
  writeOutputToFile('./out.txt') 
  

}


const { Console } = require("console");
// const fs = require('fs');
const { indexOf } = require("lodash");

function filterInstruments() {
  const instruments = JSON.parse(fs.readFileSync('./appv3/public/instruments/instrumentsAll.json'));

  const filteredInstruments = instruments.filter(i=> {
    return  i.segment == "NFO-OPT" && i.exchange == "NFO"
  });

  console.log(filteredInstruments);
}

// filterInstruments();

function b(){

  const fs = require("fs");
  // const instruments = require("./appv3/public/instruments/instrumentsAll.json");
  const instruments = require("./appv3/shared/instruments/instrumentsForMining.json");


  console.log(instruments.length);

  return;
  let a1=instruments.map(i=>i.expiry).filter((i,index,arr)=>{

let m=new Date()
let month=m.getMonth()+1;

if(month<10){

  month="0"+month;
}
// console.log(month);

return arr.indexOf(i) ==index && i.includes("-"+month+"-")

  })
  
  // filter(i=>i.exchange == 'MCX')[0]


  console.log(a1);

}

async function main() {
  let getAccessToken = require("./common-functions/getAccessToken");

  let a = await getAccessToken();
  access_token=a;

  console.log(api_key,access_token);

  var kc2 = new KiteConnect({
    api_key: api_key,
    access_token: access_token
  });

  // console.log( stockPpItem,level );
    
  let ob = {  } ;
  
  ob.params = {  } ;
  
  ob.accessToken = access_token;
  
  // ob.params.tradingsymbol = stockPpItem.tradingsymbol;
  ob.params.tradingsymbol = 'WIPRO';
  ob.params.exchange = 'NSE';
  ob.params.trigger_values = [476.3*(1+.0025)];
  ob.params.last_price = 476;
  ob.params.trigger_type=kc2.GTT_TYPE_SINGLE;
  
  
  
  // console.log( JSON.stringify( ob.params ),'ob params' );
  let order = {  } ;
  order.transaction_type = 'BUY'
  order.quantity = 1;
  order.product = 'CNC'
  order.order_type = kc2.ORDER_TYPE_LIMIT
  order.price = 476;
  
  ob.params.orders = [order]
  
  // let url = "/api/PlaceGTT";
  // axios.post( url,ob ).then( r =>console.log( r,'response' ))

  // let b=kc2.ORDER_TYPE_LIMIT;


  try {
    let b=await kc2.placeGTT(ob.params);
  } catch (error) {
    console.log(error)
  }
  // console.log

  console.log(b);
  

  // kc2.getHistoricalData('12481538','day',,today(),false).


  // console.log(a);

  process.exit();
}

// main();

