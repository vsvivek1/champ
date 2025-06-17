const fs = require('fs')

const ObjectsToCsv = require('objects-to-csv')

let instruments=require('./appv3/shared/instruments/instrumentsForMining.json');

const mongoose=require('mongoose');
const Path = require('path')
const Axios = require('axios');
let AccesTocken=require('./models/AccessTokens');
require('dotenv').config()

const api_key=process.env.api_key;

const TIMER=500;
var KiteConnect = require("kiteconnect").KiteConnect;

let today = new Date().toISOString().slice(0, 10);





async function main(access_token){

    var kc = new KiteConnect({
        api_key: api_key,
        access_token: access_token
      }); 
    
   let  erroroutFile='./actutalTrade-'+'2022-04-22'+'.text';
    let a= await  kc.getPositions()
    let a1=a.net //.filter(ax=>ax.product == 'NRML');

    const csv = new ObjectsToCsv(a1)

    await csv.toDisk(erroroutFile)

let a2=a1.filter(ax=>ax.product == 'NRML')
.filter(ay=>ay.last_price>ay.sell_price)
.filter(az=>az.quantity == 0)

;


    console.log(a2,'a2');

}










// let filename='./trades-'+today+'.text';

let d='2022-04-22';
let filename='./trades-'+d+'.text';


async function tradeResults(access_token){

fs.readFile(filename, 'utf8' , async  (err, data) => {
  if (err) {
    console.error(err)
    return
  }


  console.log(typeof data)

  
 let data1= data.replace(/\""/g, "")

let data2=data1.replace(/\\/g,"").replace(/},{/g,'}*{').split('*');



// let a9='{"type":Entry,"tradingsymbol":NTPC22MAR138CE,"entry_price":0.8,"target":1.1,"stoploss":0.5}';
// let b=JSON.parse(a9);
// console.log(b)

// return false;
// console.log( data2.length)


let data3=[]
data2.forEach(e=>{

  

  try {
    data3.push(JSON.parse(e))
  
  } catch (error) {
    console.log('error',error)
  }



})

//  return ;


//  return 

// data1.forEach(e=>{

//    e= e.replace('"\\r\\n','')
// })


// let data2=data1.filter(e=>e.includes('Buy'));

// data2.forEach(
    
//     e=>e=e.replace('Buy instrument ','')
    
//     )
  
// data1.pop();

// let a=[]

// data2.forEach(e=>{

// a.push(JSON.parse(e))
// })


let a11=data3.filter(a=>a.type == 'Entry');

let a1=[...new Set(a11.map(a => JSON.stringify(a)))].map(a => JSON.parse(a))




a1.forEach(e=>{
  let o=instruments.filter(i=>i.tradingsymbol == e.tradingsymbol)[0]


  e.instrument=o;

  if(typeof o == 'undefined'){

   e.instrument_token=0
  }else{

    e.instrument_token= o.instrument_token
  }

})

let instr=a1.map(a11=>  {

  let o=instruments.filter(i=>i.tradingsymbol == a11.tradingsymbol)[0]

  if(typeof o == 'undefined'){

    return 0
  }else{

    return o.instrument_token
  }
} )


// for each a   get current mkt price and tell its profit or loss

var kc = new KiteConnect({
  api_key: api_key,
  access_token: access_token
});     
let ltps= await  kc.getLTP(instr);       



let profit=0;


let today = new Date().toISOString().slice(0, 10);
    let erroroutFile='./tradeResult-'+d+'.csv';



    let out=[]

    let list=[]
a1.forEach(element => {
  
let lp=ltps[element.instrument_token]

if(typeof lp == 'undefined'){

  return false
}

element.last_price=lp.last_price
element.profit_day_end=(lp.last_price-element.entry_price)*element.instrument.lot_size


// let trade=element.tradingsymbol+','+element.profit_day_end+','+element.instrument.lot_size

let tradingsymbol=element.tradingsymbol

let profit=element.profit_day_end
let trade={tradingsymbol,profit};

list.push(trade)
console.log(trade)

profit=profit+element.profit_day_end;
    //  fs.appendFile(erroroutFile, JSON.stringify(trade), 'utf8', function (err) {
    //    if (err) {
    //        console.log("An error occured while writing JSON Object to File.");
    //        return console.log(err);
    //    }

    //   });



});

const csv = new ObjectsToCsv(list)

await csv.toDisk(erroroutFile)

console.log('total profit',profit)

})

;

}

const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{

  AccesTocken.findOne({ 'date': today  },'access_token').then(e=>{  
  let  access_token=e.access_token;
    // let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';
  

    // main(access_token)
tradeResults(access_token)

    // getHoldingInstruments(access_token)

  });
               
   ;
  

});