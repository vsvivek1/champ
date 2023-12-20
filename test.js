
function a(){

  const fs = require("fs");
  const instruments = require("./appv3/public/instruments/instrumentsAll.json");
  var KiteConnect = require("kiteconnect").KiteConnect;
  let api_key=process.env.api_key;
  let access_token//=process.env.ACCESS_TOCKEN
  
  
  // let at=require( "./common-functions/getAccessToken");
  
  
  // main();
  
  async function main() {
    let getAccessToken = require("./common-functions/getAccessToken");

    let a = await getAccessToken();
    access_token=a;
  
    var kc2 = new KiteConnect({
      api_key: api_key,
      access_token: access_token
    });
  
  
    
  
    // kc2.getHistoricalData('12481538','day',,today(),false).
  
  
    console.log(a);
  
    process.exit();
  }
  
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
const fs = require('fs');
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
  const instruments = require("./appv3/public/instruments/instrumentsForMining.json");


  console.log(instruments.length);

  return;
  let a1=instruments.map(i=>i.expiry).filter((i,index,arr)=>{

let m=new Date()
let month=m.getMonth()+1;

if(month<10){

  month="0"+month;
}
// console.log(month);

return arr.indexOf(i) ===index && i.includes("-"+month+"-")

  })
  
  // filter(i=>i.exchange == 'MCX')[0]


  console.log(a1);

}

b();