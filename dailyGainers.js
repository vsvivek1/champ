const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');
 let instru=require('./appv3/shared/instruments/instrumentsForMining.json');
// let instru=require('./appv3/public/instruments/instrumentsForMiningWithOutCriteria.json');

let zero=require('./ZerodhaAPI');
const ohlc=require('./scraping/ohlc');
const { errors } = require('puppeteer');
const TIMER=333;
const pricePoint = require('./pricePoints');

const ZerodhaAPI = require('./ZerodhaAPI');


const EXPIRY='2022-06-30';
module.exports=async function dailygainers(){


  return new Promise(async (res,rej)=>{

    let result=[];
    let gainers=[];
 

    function today1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD')
    } 
    
    function yesterday1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD').subtract(0,'days')
    }



    let today=today1();;
// const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });

let access_token= await AccesTocken.findOne({ 'date': today },'access_token').then(e=>e.access_token);


let accessToken=access_token;



let instrument_tokens1=instru.map(i=>i.instrument_token)


console.log(instrument_tokens1.length,'instrument_tokens1.length')


let start=1;

// let t1=setInterval(async ()=>{

  


  let instrument_tokens= instrument_tokens1.slice(start,1000)
  // instrument_tokens1.splice(1,1000)
  // start=start+1000

  console.log(instrument_tokens.length,'instru token len',start)
  let ln=instrument_tokens.length

  // if(ln == 0){

  //   clearInterval(t1)
  // }

  
  try {
    let ohlc1=await ohlc(access_token,instrument_tokens);


    gainers= getGainers(ohlc1)



    // console.log(g,'gainers.len')
  } catch (error) {
    console.log('ohlc1',error)
  }
  
  



// },333)


// let losers = getLosers(ohlc1)
//  result={gainers,losers}

//  result=gainers;
  // console.log(result.length)
  res(gainers)
  
  
  
  
  
})
  
    // return st;
  }


  async function getGainers(ohlc1){
    let  result=[]

    let result1;
    try {
     
    Object.keys(ohlc1).forEach(e=>{
    
        try {
          
        
    
        let ins=instru.filter(i=>i.instrument_token == 
          e)[0];
          ins.ohlc=ohlc1[e]
    

          // console.log(ins.pricePoints.d1.close!=ins.pricePoints.d1.low)

          // (ins.pricePoints.d1.close!=ins.pricePoints.d1.low) &&
           
          // ins.ohlc.ohlc.close>ins.ohlc.ohlc.open &&
  
          // ins.ohlc.ohlc.open<ins.ohlc.last_price &&
          // ins.pricePoints.d1.close<ins.ohlc.last_price &&
          // (  ins.pricePoints.d1.close<ins.ohlc.ohlc.high)
            
          //   )

// console.log(ins.ohlc.ohlc.open,ins.ohlc.ohlc.close,ins.ohlc.ohlc.high )
          if(


            // ins.pricePoints.d1.close>ins.pricePoints.d1.open && //red or green candle candle
            // ins.ohlc.ohlc.open<ins.ohlc.ohlc.close && ///opening below yesterdays close
            // ins.ohlc.ohlc.high>ins.pricePoints.d1.open ///opening below yesterdays close
            
            
            ins.ohlc.last_price>ins.ohlc.ohlc.open ///opening below yesterdays close
           && ins.ohlc.ohlc.high!=ins.ohlc.ohlc.open // body not zeros
            
            ) 
           
           
    {
    
    
     
      let profit= ins.ohlc.last_price - ins.ohlc.ohlc.open;
      // let profit= ins.ohlc.ohlc.high - ins.ohlc.ohlc.close;
      // let profit= ins.pricePoints.d1.high - ins.ohlc.ohlc.close;
      
      
      let profitPc= profit*100/ins.ohlc.ohlc.open;
      ins.profit=profit;
      ins.profitPc=profitPc;

      ins.profitTot=profit*ins.lot_size;
      
result.push(ins)
      // console.log(ins)
        // return ins
    
    }
            
      } catch (error) {
    
        console.log(error,'error')
          // return null
      }
    
    
      })
      
      
  result1=    result.filter(f=>f!=null)
      
      .sort((a,b)=>{
    
   return b.profitPc-a.profitPc
    
      })
      // .filter(a=>a.profitPc<0)
      



     
      
    } catch (error) {
    console.log(error)
    }
  //  console.log(result,'e')

  // console.log(Object.keys(result),'e')
     return  result1 

  } 
  
  
  async function getLosers(ohlc1){

    try {


      

      result=Object.keys(ohlc1)
 
      .map(e=>{
    
        try {
          
        
    
        let ins=instru.filter(i=>i.instrument_token == 
          e)[0];
          ins.ohlc=ohlc1[e]
    
          if(
           
            (ins.pricePoints.d1.close!=ins.pricePoints.d1.low) &&
            ins.pricePoints.d1.close>ins.ohlc.ohlc.open &&
    
            ins.ohlc.ohlc.open>ins.ohlc.last_price &&
            ins.pricePoints.d1.close>ins.ohlc.last_price 
           
              
              )
    {
    
    
      // console.log('true')
      let loss= ins.ohlc.last_price - ins.pricePoints.d1.close;
      let lossPc= (ins.ohlc.last_price - ins.pricePoints.d1.rangeBreakOutTarget)*100/ins.pricePoints.d1.close;
      ins.loss=loss;
      ins.lossPc=lossPc;
      
        return ins
    
    }
            
      } catch (error) {
    
        // console.log(error)
          return null
      }
    
    
      }).filter(f=>f!=null).sort((a,b)=>{
    
    b.lossPc-a.lossPc
    
      }).slice(0,1)
      
      return  result  
      
    } catch (error) {
    console.log(error)
    }



  }

    function secondsToHms(d) {
      d = Number(d);
     
  
  
  
  
  
  
  
    
  
    // return st;
  }



// (async function(){

// let t=await main();
// console.log(t,'t')

// })()



  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
  
    var hDisplay = h > 0 ? h + (h  ==  1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m  ==  1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s  ==  1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
  }
  








