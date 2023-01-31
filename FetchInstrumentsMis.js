const Fs = require('fs')
const mongoose=require('mongoose');
const Path = require('path')
const Axios = require('axios');

const csvToJson = require("csvtojson");

const TIMER=500;
var KiteConnect = require("kiteconnect").KiteConnect;


require('dotenv').config()
let access_token;
let AccesTocken=require('./models/AccessTokens');
const api_key=process.env.api_key;

const pricePoint = require('./pricePoints');

const ZerodhaAPI = require('./ZerodhaAPI');

const ohlc = require('./scraping/ohlc')
let today = new Date().toISOString().slice(0, 10);
// const fetchInstrumentsForNewMint=require('./FetchInstrumentsForNewMint.js')

const EXPIRY=getCurrentExpiryDate();

function getCurrentExpiryDate(){


  let d=new Date();
d.setDate(d.getDate())
d.setMonth(d.getMonth()+1);

let index={1:-4,2:-5,3:-6,4:0,5:-1,6:-2}
d.setDate(0);
let lastDaysWeekDay=d.getDay()
let out=index[lastDaysWeekDay]

d.setDate(d.getDate()+out);


let today=new Date();

if(d-14<today){
///next month expiry
d.setMonth(d.getMonth()+2);

let index={1:-4,2:-5,3:-6,4:0,5:-1,6:-2}
d.setDate(0);
let lastDaysWeekDay=d.getDay()
let out=index[lastDaysWeekDay]

d.setDate(d.getDate()+out);

}

let d1= d.toISOString().split('T')[0];



d1="2022-06-30"
console.log('Expiry date',d1)


return d1
}

async function downloadInstruments() {


  return new Promise(async (resolve, reject) => {

  let url = "https://api.kite.trade/instruments";
  const path = Path.resolve(__dirname, 'instruments', 'instruments.csv')
  const writer = Fs.createWriteStream(path)

  let response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })



  let d1= await response.data.pipe(writer)

  
    writer.on('finish',()=> resolve('downlaoded'))
    writer.on('error', ()=> reject('not downloaded'))
  })
}



// module.exports = 
// module.exports=



async function fetchInstrumentsForMiningMIS(accessToken) {

 

  let dl=await downloadInstruments();


 let instruAll = './appv3/public/instruments/instrumentsAll.json';


 let fileInputName  = Path.resolve(__dirname, 'instruments', 'instruments.csv')
 let fileOutputName  = Path.resolve(__dirname, 'instruments', 'instrumentsMIS.json')


 let  csvresult=await   csvToJson().fromFile(fileInputName)



 let jsonObj1 =csvresult.filter(j => ((j.exchange == 'NFO' && j.expiry == EXPIRY &&  (j.name == 'NIFTY' || j.name == 'BANKNIFTY') )));
 
 
 let jsonObjAll =csvresult.filter(j => ((j.exchange == 'NFO' )|| j.exchange == 'NSE'));
          
    

 console.log(jsonObj1.length,'hi')



 let f=await 
 
 new Promise( (res,rej)=>{
 
 Fs.writeFile(fileOutputName, JSON.stringify(jsonObj1), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }
  console.log(fileOutputName+"JSON file has been saved.");

  let targetDir = Path.join(__dirname, '/app/instrumentsMIS.json');


  return Fs.copyFile('./appv3/public/instruments/instrumentsMIS.json', targetDir, (err) => {
    if (err) throw err;
    console.log('/instruments/instrumentsMIS.json was copied to '+targetDir);


   

   return  Fs.writeFile(instruAll, JSON.stringify(jsonObjAll), 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }



  return Fs.copyFile('./appv3/public/instruments/instrumentsAll.json', targetDir, (err) => {
    if (err) throw err;
    console.log('instrumentsAll.json was copied to /instruments/instrumentsAll.json');

    res(true)
    return ;

  });

    });


   
   
   // return 123;
  });

})

 });

console.log(f,'f')

let jsonObj2 = [];


let a = await getSymbols();

      try {

        let ohlcs = await ohlc(accessToken, a);
        let instruments = require('./appv3/public/instruments/instrumentsMIS.json');
            let strikes = await getNearestStrikes(ohlcs, instruments)


        let symbols = [];


        let len1 = strikes.length;
        let intr = setInterval(async () => {




          let e = strikes.pop()
          let len = strikes.length;

        let sec=len*TIMER/1000;
        let min=sec/60
        let sec1=sec%60

        let t=secondsToHms(sec)


          console.log(len, 'left out of ', len1,' ',t ,' time left',e.tradingsymbol);


          if(len==(len1-1)){

            let instruForFuture=require('./appv3/public/instruments/instrumentsMIS.json');
        
           let niftyfut= instruForFuture.filter(i=>i.name=='NIFTY' && i.expiry==EXPIRY && i.instrument_type=="FUT" )[0];
           let a = new pricePoint(niftyfut.instrument_token, accessToken);
           let c = await a.getPricePoints(7, 'day');
           
           niftyfut.pricePoints = c;
           niftyfut.SevenDayMaxMin = c.SevenDayMaxMin;

           niftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
           niftyfut.seletedBuyingMethod = 'MAX'
           niftyfut.buyNow = false;


          //  console.log(niftyfut)
           jsonObj2.push(niftyfut)
           

           let bankniftyfut= instruForFuture.filter(i=>i.name=='BANKNIFTY' && i.expiry==EXPIRY && i.instrument_type=="FUT" )[0]
          



           let abnf = new pricePoint(bankniftyfut.instrument_token, accessToken);
           let cbnf = await abnf.getPricePoints(7, 'day');
           
           bankniftyfut.pricePoints = cbnf;
           bankniftyfut.SevenDayMaxMin = cbnf.SevenDayMaxMin;

           bankniftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
           bankniftyfut.seletedBuyingMethod = 'MAX'
           bankniftyfut.buyNow = false;

          //  console.log(bankniftyfut)
           jsonObj2.push(bankniftyfut)

          // return false;
          }

          if (len > 0) {





            let a = new pricePoint(e.instrument_token, accessToken);
            let c = await a.getPricePoints(7, 'day');
        
            e.pricePoints = c;
            e.SevenDayMaxMin = c.SevenDayMaxMin;

            e.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
            e.seletedBuyingMethod = 'MAX'
            e.buyNow = false;

            if(e.pricePoints.length==0){

              console.log('pricePoints not set for ',e.tradingsymbol)
            }else{


// if(e.pricePoints.nr4==true)

let otherCriteriaCheck=otherCriteria(e)
if(otherCriteriaCheck)

{


  console.log(otherCriteriaCheck,'otherCriteriaCheck')
  jsonObj2.push(e)
}else{

  console.log('no nr 4',e.tradingsymbol)
}
              
              
            }
         
          
     

      
          }

          if (len == 0) {

      
           console.log('Now starting new mint ');

          // fetchInstrumentsForNewMint(accessToken);


            clearInterval(intr);
         
           



      

  

console.log('git jsonBoj2',jsonObj2.length)
/////////////////////////////

let fileOutputName = 'instruments/instrumentsMIS.json';

Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }
  console.log("JSON file has been saved.");



  let targetDir = Path.join(__dirname, '/app/instrumentsMIS.json');


  Fs.copyFile('instruments/instrumentsMIS.json', targetDir, (err) => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
  });
  

  return    jsonObj2;  

});







          }

        }, TIMER)


     



      }
      
      catch (error) {


        //for try cathc
        let erroroutFile = './error.text'
        Fs.appendFile(erroroutFile, JSON.stringify(error), 'utf8', function (err) {
          if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
          }
          console.log("Error file has been saved.", erroroutFile);
        });
        console.log(error)
      }



      


    }
    
 



























/// for testing



 function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay; 
}




async function getHoldingInstruments(access_token){


  try {

    var kc = new KiteConnect({
      api_key: api_key,
      access_token: access_token
    });
  
    let pos=await kc.getPositions();
// console.log(pos)




// const inquirer = require('inquirer')

//     var questions = [
//       {
//         type: 'input',
//         name: 'name',
//         message: "What's your name?"
//       }
//     ]
    
//     inquirer.prompt(questions).then(answers => {
//       console.log(`Hi ${answers['name']}!`)
//     })

    return pos.net.map(p=>p.tradingsymbol)
    // console.log((pos))
    
  } catch (error) {
    console.log('error',error)
  }
 

 

}


function getNearestStrikes(ohlc, instruments) {


  return new Promise((resolve, reject) => {







    // console.log('from neearest strikeds with ohlc1',ohlc)

    currentInstruments = [];

  let len=Object.keys(ohlc).length;

  // console.log('objlen',len);

  // return false;


    Object.keys(ohlc).forEach(async item  => {
      // console.log('item',item)
      let symbol = item.split(':')[1];

      console.log('symbol', symbol)





      let last_price_max = ohlc[item].last_price * 1.01
      let last_price_min = ohlc[item].last_price * .97

      let last_price = ohlc[item].last_price;


      if (symbol == 'NIFTY 50') {

        console.log('NIFTY 50', last_price)
      }
      if (symbol == 'NIFTY BANK') {

        console.log('NIFTY BANK', last_price)
      }

      let curInstrument = instruments.filter(


        i => {

          if (symbol == 'NIFTY 50') {

            symbol = 'NIFTY'
          }


          if (symbol == 'NIFTY BANK') {

            symbol = 'BANKNIFTY'
          }

          return i.name == symbol
        }

      ).filter(i => {

// console.log('i.name',i.name)

        if (i.name == 'NIFTY') {

          console.log('NIFTY', i.tradingsymbol, last_price)
        }
        if (i.name == 'BANKNIFTY') {

          console.log('NIFTY BANK', i.tradingsymbol, last_price)
        }



        if(i.instrument_type=='FUT'){

        if(i.name=='NIFTY' || i.name=='BANKNIFTY'){

          console.log('its future',i.tradingsymbol)
          return true

        }
        }

        // console.log('i.instrument_type',i.instrument_type)
        if (i.instrument_type == 'CE') {


          /// if ce strike between 1.05 pc and 1.1 pc

          //if pe between strike .95 to .9


          //           console.log("variable", variable);
          // if (i.strike < last_price_max && i.strike > last_price_min) 
          if (i.strike > last_price*1.01 && i.strike < last_price*1.07 ) 


          // console.log('ceeeee yeee')
          {


            if (i.name == 'NIFTY') {

              console.log('NIFTY 50', i.tradingsymbol)
            }
            if (i.name == 'BANKNIFTY') {

              console.log('NIFTY BANK', i.tradingsymbol)
            }

            return true
          }
        }

        else if (i.instrument_type == 'PE') {

          // console.log('pee yeee')

          // if (i.strike < last_price_max && i.strike > last_price_min) {
          if (i.strike < last_price*.99 && i.strike > last_price*.93) {


            if (i.name == 'NIFTY') {

              console.log('NIFTY 50', i.tradingsymbol)
            }
            if (i.name == 'BANKNIFTY') {

              console.log('NIFTY BANK', i.tradingsymbol)
            }


            return true
          }
        }

      }).map(r => {

        r.spot_price = last_price

        return r;

      })
      // console.log('curInstrument',curInstrument)

      currentInstruments.push(...curInstrument);




len=len-1;
      if(len==0){
            /// currrent positions

            currentInstruments1=currentInstruments.map(c=>
              
{

  if(typeof c.tradingsymbol!='undefined') return c

}
           
              
              
              
              
              );


              currentInstruments=[...currentInstruments1]


        // console.log(currentInstruments,'cur instr');






        resolve(currentInstruments);

        


      

      }

    })









   
  })

}



async function getSymbols() {


  let instruments = require('./appv3/public/instruments/instrumentsMIS.json');

  let st = instruments.filter(i => i.exchange == 'NFO')
    .map((i) => i.name)
    .filter((x, i, a) => a.indexOf(x) === i);

  let st2 = instruments
    .map((i) => i.instrument_token)
    .filter((x, i, a) => a.indexOf(x) === i);

  let instTockens = st.map((s) => {
    // console.log(s,'s')
    let ar = instruments.filter(
      (i) => i.tradingsymbol == s && i.exchange == "NSE"
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

    if (s == 'NIFTY') {
      s = "NIFTY 50"

    }

    if (s == 'BANKNIFTY') {
      s = "NIFTY BANK"

    }
    return "NSE:" + s;
  }).filter((x, i, a) => a.indexOf(x) === i);;






  return symboList;

  // let f= await  this.getOHLC(this.accessToken, symboList);
  // let t=await  this.getNearestStrikes();









  // return st;
}
// let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';

// fetchInstrumentsForMiningMIS(access_token);

// module.exports=fetchInstrumentsForMiningMIS





const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{

  AccesTocken.findOne({ 'date': today  },'access_token').then(async e=>{  
    access_token=e.access_token;
    // let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';
  
   fetchInstrumentsForMiningMIS(access_token);


    // getHoldingInstruments(access_token)

  });
               
   ;
  

});


function otherCriteria(e){



  let body=Math.abs(e.pricePoints.yesterday.close-e.pricePoints.yesterday.open);
  let candleColor=(e.pricePoints.yesterday.close-e.pricePoints.yesterday.open>0) ?'green':'red';
  let upperShadow;
  let lowerShadow;
  if(candleColor=='green'){
  upperShadow=e.pricePoints.yesterday.high-e.pricePoints.yesterday.close;
  lowerShadow=e.pricePoints.yesterday.open-e.pricePoints.yesterday.low;
  
  }else{
  upperShadow=e.pricePoints.yesterday.high-e.pricePoints.yesterday.open;
  lowerShadow=e.pricePoints.yesterday.close-e.pricePoints.yesterday.low;
  
  }
  // && lowerShadow>body
  let ob={body,upperShadow,candleColor}
  if( candleColor=='green' && body>upperShadow ){
  

    return true
  // tradables.push(e.instrument_token)

}else{

  return false;
}
}