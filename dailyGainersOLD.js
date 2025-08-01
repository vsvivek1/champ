const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');
let instru=require('./appv3/public/instruments/instrumentsForMiningWithOutCriteria.json');
let zero=require('./ZerodhaAPI');
const ohlc=require('./scraping/ohlc');
const { errors } = require('puppeteer');
const TIMER=333;
const pricePoint = require('./pricePoints');

const ZerodhaAPI = require('./ZerodhaAPI');

const EXPIRY='2022-06-30';
async function main(){

    function today1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD')
    } 
    
    function yesterday1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD').subtract(1,'days')
    }



    let today=today1();;


<!--  
const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }); -->

let access_token= await AccesTocken.findOne({ 'date': today },'access_token').then(e=>e.access_token);


let accessToken=access_token;

let a = await getSymbols();

      try {

        let ohlcs = await ohlc(accessToken, a);
        let instruments1 = require('./appv3/public/instruments/instruments.json');
        let instruments = instruments1//.slice(0,1000)

        let getNearestStrikes=require('./getNearestStrikes');
            let strikes = await getNearestStrikes(ohlcs, instruments)

        let symbols = [];
        let len1 = strikes.length;

        console.log('---------------code block of timer started')

        let len =len1;
        let intr = setInterval(async () => {
          // var a111=0;

          let e = strikes.pop()
          // console.log(e,'e')
//////////////////////////////////////////////


              if (typeof e == 'undefined') 
              {
                clearInterval(intr);


                let jsonObj3=await overnightScripts(jsonObj2)


              console.log(jsonObj2.length,'json obj len')
              console.log('Now starting new mint ');

              let write=await writeFinalScriptsTofile(jsonObj3,jsonObjWithOutCriteria);

              console.log('finished ');
              return ;
              // fetchInstrumentsForNewMint(accessToken);

              return false
              }
len --;

//////////////////////////////////////////////
     let sec=len*TIMER/1000;
        let min=sec/60
        let sec1=sec%60

        let t=secondsToHms(sec)


          console.log(len, 'left out of ', len1,' ',t ,' time left',e.tradingsymbol);


          if(len == (len1-1)){

            let instruForFuture=require('./appv3/public/instruments/instruments.json');
        
           let niftyfut= instruForFuture.filter(i=>i.name == 'NIFTY' && i.expiry == EXPIRY && i.instrument_type == "FUT" )[0];
           let a = new pricePoint(niftyfut.instrument_token, accessToken);
           let c = await a.getPricePoints(7, 'day');
           
           niftyfut.pricePoints = c;
           niftyfut.SevenDayMaxMin = c.SevenDayMaxMin;

           niftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
           niftyfut.seletedBuyingMethod = 'MAX'
           niftyfut.buyNow = false;


          //  console.log(niftyfut)
           jsonObj2.push(niftyfut)
           jsonObjWithOutCriteria.push(niftyfut)
           

           let bankniftyfut= instruForFuture.filter(i=>i.name == 'BANKNIFTY' && i.expiry == EXPIRY && i.instrument_type == "FUT" )[0]
          



           let abnf = new pricePoint(bankniftyfut.instrument_token, accessToken);
           let cbnf = await abnf.getPricePoints(7, 'day');
           
           bankniftyfut.pricePoints = cbnf;
           bankniftyfut.SevenDayMaxMin = cbnf.SevenDayMaxMin;

           bankniftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
           bankniftyfut.seletedBuyingMethod = 'MAX'
           bankniftyfut.buyNow = false;

          //  console.log(bankniftyfut)
           jsonObj2.push(bankniftyfut)
           jsonObjWithOutCriteria.push(bankniftyfut)

          // return false;
          }



          // if (len > 0)
          if (typeof e!='undefined')
          {

            let a = new pricePoint(e.instrument_token, accessToken);
            let c = await a.getPricePoints(7, 'day');
        
            e.pricePoints = c;
            e.SevenDayMaxMin = c.SevenDayMaxMin;

            e.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
            e.seletedBuyingMethod = 'MAX'
            e.buyNow = false;


            if(typeof e.pricePoints == 'undefined'){
              console.log('pricePoints undefined ',e.tradingsymbol)

              return;
            }
            if(e.pricePoints.length == 0){

              console.log('pricePoints not set for ',e.tradingsymbol);

              return ;
            }else{






let otherCriteriaCheck=otherCriteria(e);

// let otherCriteriaCheck =true; //logic moved lastly
// if(e.pricePoints.nr4 == true)
console.log(otherCriteriaCheck,'otherCriteriaCheck')

if(otherCriteriaCheck)

{


  console.log(otherCriteriaCheck,'otherCriteriaCheck')
  jsonObj2.push(e)
}else{

  jsonObjWithOutCriteria.push(e)
  // console.log('no nr 4',e.tradingsymbol)
}
              
              
            }
         
          
     

      
          }

       

        }, TIMER)


     



      }
      
      catch (error) {

                        console.log('some error',error)
                 
      }



      return true;


    }
    



















main();



function others()

{
//////////////////////


let body=Math.abs(e.pricePoints.yesterday.close-e.pricePoints.yesterday.open);
let candleColor=(e.pricePoints.yesterday.close-e.pricePoints.yesterday.open>0) ?'green':'red';
let upperShadow;
let lowerShadow;
if(candleColor == 'green'){
upperShadow=e.pricePoints.yesterday.high-e.pricePoints.yesterday.close;
lowerShadow=e.pricePoints.yesterday.open-e.pricePoints.yesterday.low;

}else{
upperShadow=e.pricePoints.yesterday.high-e.pricePoints.yesterday.open;
lowerShadow=e.pricePoints.yesterday.close-e.pricePoints.yesterday.low;

}



// let candleRangeYesterday;



// && lowerShadow>body
let ob={body,upperShadow,candleColor}

// && e.pricePoints.d1.range< e.pricePoints.d2.range
if( candleColor == 'green'  && upperShadow*4<body && e.pricePoints.d1.range< e.pricePoints.d2.range ){

tradables.push(e.instrument_token)
// console.log(e.tradingsymbol,'tradable','body',ob)
}


}



async function getSymbols() {


    let instruments = require('./appv3/public/instruments/instruments.json');
  
    let st = instruments.filter(i => i.exchange  ==  'NFO')
      .map((i) => i.name)
      .filter((x, i, a) => a.indexOf(x)  == i);
  
    let st2 = instruments
      .map((i) => i.instrument_token)
      .filter((x, i, a) => a.indexOf(x)  == i);
  
    let instTockens = st.map((s) => {
      // console.log(s,'s')
      let ar = instruments.filter(
        (i) => i.tradingsymbol  ==  s && i.exchange  ==  "NSE"
      );
  
      if (typeof ar[0] != "undefined") {
        let instrument_token1;
        if (ar.length) {
          let { instrument_token } = ar[0];
          instrument_token1 = instrument_token;
        } else {
          instrument_token1 = 0;
        }
  
        return instrument_token1;
      }
  
    });
  
  
    let symboList = st.map((s) => {
  
      console.log('from get symbls', s)
  
      if (s  ==  'NIFTY') {
        s = "NIFTY 50"
  
      }
  
      if (s  ==  'BANKNIFTY') {
        s = "NIFTY BANK"
  
      }
      return "NSE:" + s;
    }).filter((x, i, a) => a.indexOf(x)  == i);;
  
  
  
  
  
  
    return symboList;
  
    // let f= await  this.getOHLC(this.accessToken, symboList);
    // let t=await  this.getNearestStrikes();
  
  
  
  
  
  
  
  
  
    // return st;
  }


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
  








