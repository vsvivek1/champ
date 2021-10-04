const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const axios =require('axios');
let pricePoint=require('../pricePoints.js');
let Instruments=require('../getInstruments.js');

// /home/kseb/findependence/findiserver/models/StocksInIndex.js

let StocksInIndexModel=require('../models/StocksInIndex.js')


const stockSymbolCategories=require("./stockSymbolCategories.json");

class NseApi{


  static async  fetchScripts(category,accessToken){

 console.log('accessToken inside fetch scripts ',category)


let qry={};
qry.indexName=category
 let StockFind1=await StocksInIndexModel.findOne(qry)



//  let StockFind=StockFind1[0];

let chk=JSON.stringify({})
//  console.log('StockFind',JSON.stringify(StockFind1.stocks)!=chk)


//  return false;




// if(JSON.stringify(StockFind1.stocks)!=chk){
if(StockFind1!==null){




  StockFind1.stocks.forEach(s=>{

    s.instrument_token=Instruments.getInstrumentToken(s.symbol).instrument_token;


  })



  return new Promise((res,rej)=>{

res(StockFind1.stocks);

  })

}else if(StockFind1===null)


//  if(JSON.stringify(StockFind1.stocks)==chk)
 
 {
  let url=`https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/${category}StockWatch.json;`

  // console.log('url',url)
        
return   axios.get(url).then(r=>{

  // return r.data;

  let ob={};
  ob.indexName=category;
  ob.stocks=[...r.data.data];


  let StocksInIndex=new StocksInIndexModel(
ob

  );

  StocksInIndex.save().then(r=>{
console.log('saved',r)

  })

  let ret= [...r.data.data];
 
ret.forEach(e=>{

  e.instrument_token=Instruments.getInstrumentToken(e.symbol).instrument_token;


})
   return ret;


      }).catch(e=>{

console.log('error in feting',e)

      });


 }
        

  }

  static optionChain(){

    let url="https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY"


axios.get(url).then(r=>{

      console.log(r.data.records.data.filter(d=>d.strikePrice==15000))
        
    //     .filter(d=>{

    //     d.strikePrice==17000
    //   }))

   
})

return;
  }



}


module.exports=NseApi;


NseApi.fetchScripts('nifty')
// NseApi.optionChain()





