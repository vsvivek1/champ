var KiteConnect = require("kiteconnect").KiteConnect;
const mongoose = require('mongoose');
const con = require('../MongoseConnect')
require('dotenv').config(({ path: "../.env" }))
const api_secret=process.env.api_secret;
const api_key=process.env.api_key;

let AccesTocken=require('../models/AccessTokens');
const Fs = require('fs')
const ZerodhaAPI=require('../ZerodhaAPI');

let today = new Date().toISOString().slice(0, 10);
const TIME_INT=200;

const instrumentsForMining=require('../appv3/public/instruments/instrumentsForMining.json');
// const { setInterval } = require("timers/promises");

module.exports=class HistoricalTick{

constructor(accessToken){
this.accessToken=accessToken;


}


  
  
  
createAndMoveFileFromJson(fileOutputName,jsonObj2,targetDir){
  
  return new Promise((res,rej)=>{
  
  
  
  
    Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8',
  
  function (err) {    
                    if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                    }
                     console.log(fileOutputName+"JSON file has been saved.");
  
  
                  Fs.copyFile(fileOutputName, targetDir, 
                  (err) => {
                            if (err) throw err;
                            console.log('source.txt was copied to destination.txt');

                            return ;
                            });
  
  
  
  
                            res(true);

                            return ;
  
                  });
  
  return ;
                })
    
  }


async updateAccessToken(){


    return new Promise(async (res,rej)=>{



   
    const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
  
    let access_token_global= await AccesTocken.findOne({ 'date': today  },'access_token').then(e=>e.access_token);
  

    this.accessToken=access_token_global

    res(access_token_global);

    return;

})
}


async getmarketQuotes(symbols){

  return new Promise((res,rej)=>{  let ln=symbols.length;



// let out=[];


let tick1=0;

console.log(ln)
let t=setInterval(async ()=>{



  let symbol1=symbols.slice(t1,t1+500)

  let ln=symbol1.length;

  if(ln == 0){

    res(ln)
  }
  // console.log(ln,t1,'hi')

  // t1=t1+500;

},1000)
// return false;
//  let a= await  ZerodhaAPI.getQuoteFromZerodha(this.accessToken,aryOfInstruments)
})

}


downloadHistoricalData(){

    return new Promise(async (res,rej)=>{

       let symbols=this.getSymbolListFromInstruments()
     
        var kc2 = new KiteConnect({
          api_key: api_key,
          access_token: this.accessToken
        });
  

        let moment=require('moment');
        // subtract(1, 'days')
          let from= moment().subtract(2,'days').hours(9).minute(15).format('Y-MM-DD HH:mm:ss');
          let to= moment().format('Y-MM-DD HH:mm:ss');//.toString()//.format('Y-MM-DD hh:mm:ss');
  
 
     
  
          let out=[];
  
       var ln=symbols.length;
       
       var ln2=0;

      //  console.log('hi',ln)


  //  let a=    await  this.getmarketQuotes(symbols)
       
      // return false;

      let totalTime=TIME_INT*ln/1000;

      // console.log(symbols)
  let t=setInterval(async ()=>{
  
  
    let symbol=symbols.pop()

    // console.log(symbol)
    try {
      

  

      // console.log(kc2)
      let res= await kc2.getHistoricalData(symbol,'minute',from,to,false);

      // console.log('res');

      // return ;

     let ob={};
     ob[symbol]=res;
     
      out.push(ob)
    }
      catch (error) {
     

        console.log(error)
      }
    
      
      ln--;

      let left=ln*TIME_INT/1000/60

      console.log('Time left %s min of %s',left,
      
      totalTime/60)


   if(ln == ln2)
  // if(ln>100)
  
  {
    res(out);
    console.log('over',out)
    let fileOutputName='ticks.json',jsonObj2=out,targetDir='.././appv3/public/instruments/ticks.json'
    this.createAndMoveFileFromJson(fileOutputName,jsonObj2,targetDir)
    mongoose.disconnect();
  clearInterval(t)
  
  }
  
      
    
  
  
  },TIME_INT)
  
  
        
          })


}

getSymbolListFromInstruments(){

return instrumentsForMining.map(r=>r.instrument_token)
    

}


getHistoricalTicks(){



}

}