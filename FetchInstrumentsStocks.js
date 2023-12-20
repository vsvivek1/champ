const Fs = require('fs')
const mongoose = require('mongoose');
const Path = require('path')
const Axios = require('axios');

const Fetch = require('./fetch.js')

const csvToJson = require("csvtojson");

// const misPricePoints = require('./misPricePoints')

const TIMER = 501;
var KiteConnect = require("kiteconnect").KiteConnect;


require('dotenv').config()
let access_token;
let AccesTocken = require('./models/AccessTokens');
const api_key = process.env.api_key;

const pricePoint = require('./pricePoints');

const ZerodhaAPI = require('./ZerodhaAPI');

const ohlc = require('./scraping/ohlc')
let today = new Date().toISOString().slice(0, 10);
// const fetchInstrumentsForNewMint=require('./FetchInstrumentsForNewMint.js')

const instruAll = './appv3/public/instruments/instrumentsAll.json';

const EXPIRY = getCurrentExpiryDate();




// module.exports = 
// module.exports=



async function fetchInstrumentsForMining(accessToken) {




  let dl = await Fetch.downloadInstruments();





  let fileInputName = Path.resolve(__dirname, 'instruments', 'instruments.csv')



  let csvresult = await csvToJson().fromFile(fileInputName)


  //  || j.exchange  ==  'NSE'

  const  nifty = require("./nifty.json");



  let b=nifty.data.map(a=>a.symbol);

  let jsonObjMultiple = 
  csvresult.filter(j => (
    (
      
      j.exchange  ==  'NSE' 
      
      && j.instrument_type  ==  "EQ"   && b.includes(j.tradingsymbol)
      )
    
    
    ))

  let jsonObj1=jsonObjMultiple;

  

  let jsonObjAll = csvresult.filter(j => ((j.exchange  ==  'NSE')));
  
  







  let fileOutputName = Path.resolve(__dirname, 'instruments', 'instrumentsForMiningStocksBasic.json')
  
  

  let f = await new Promise((res, rej) => {

    Fs.writeFile(fileOutputName, JSON.stringify(jsonObj1), 'utf8',
      function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
        console.log(fileOutputName + "JSON file has been saved.");

        let targetDir = Path.join(__dirname, '/app/instrumentsForMining.json');


        // return Fs.copyFile('./appv3/public/instruments/instrumentsForMining.json', targetDir,

        //   (err) => {
        //     if (err) throw err;
        //     console.log('/instruments/instrumentsForMining.json was copied to ' + targetDir);

        //   });

      })

  });

  console.log('code block of downloading completed')



  let jsonObj2 = [];
  let jsonObjWithOutCriteria = [];


//   let a = await getSymbols();

  try {

    let ohlcs = await ohlc(accessToken, a);
    let instruments1 = require('./appv3/public/instruments/instrumentsForMiningStocksBasic.json');
    let instruments = instruments1.map(e=>e.tradingsymbol)//.slice(0,1000)
    // let strikes = await getNearestStrikes(ohlcs, instruments)


    let strikes=instruments;
    let symbols = [];
    let len1 = strikes.length;

    console.log('---------------code block of timer started')

    let len = len1;
    let intr = setInterval(async () => {
      // var a111=0;

      let e = strikes.pop()
      console.log(e,'e')
      //////////////////////////////////////////////


      if (typeof e  ==  'undefined') {
        clearInterval(intr);


        let jsonObj3 = jsonObj2


        console.log(jsonObj2.length, 'json obj len')
  

        let write = await writeFinalScriptsTofile(jsonObj3, jsonObjWithOutCriteria);

        console.log('finished ');
        return;
    

      
      }
      len--;

      //////////////////////////////////////////////
      let sec = len * TIMER / 1000;
      let min = sec / 60
      let sec1 = sec % 60

      let t = secondsToHms(sec)


      console.log(len, 'left out of ', len1, ' ', t, ' time left', e.tradingsymbol);


      // if (len  ==  (len1 - 1)) 
    



      // if (len > 0)
      if (typeof e != 'undefined') {

        let a = new pricePoint(e.instrument_token, accessToken);
        let c = await a.getPricePoints(7, 'day');

        e.pricePoints = c;
        e.SevenDayMaxMin = c.SevenDayMaxMin;

        e.chart = `https://kite.zerodha.com/chart/ext/ciq/NSE-OPT/${e.tradingsymbol}/${e.instrument_token}`;
        e.seletedBuyingMethod = 'MAX'
        e.enterNowToTrade = false;
        e.PlacedReverseOrder = false;


        if (typeof e.pricePoints  ==  'undefined') {
          console.log('pricePoints undefined ', e.tradingsymbol)

          return;
        }
        if (e.pricePoints.length  ==  0) {

          console.log('pricePoints not set for ', e.tradingsymbol);

          return;
        } else {


          // retObj={'othercriteriaCheck':false,'otherCriteriaObj':ob}


          let { otherCriteriaCheck, otherCriteriaObj } = otherCriteria(e);

          e.otherCriteria = otherCriteriaObj;
          e.otherCriteriaCheck = otherCriteriaCheck;

          // let otherCriteriaCheck =true; //logic moved lastly
          // if(e.pricePoints.nr4 == true)
          // console.log(otherCriteriaCheck, 'otherCriteriaCheck1', 'otherCriteriaObj', otherCriteriaObj)

          if (otherCriteriaCheck) {


            jsonObj2.push(e)
          } else {

            jsonObjWithOutCriteria.push(e)
            // console.log('no nr 4',e.tradingsymbol)



          }


        }





      }



    }, TIMER)






  }

  catch (error) {

    console.log('some error', error)

  }



  return true;


}







function otherCriteria(e) {

  try {


    let retObj;
    let body = Math.abs(e.pricePoints.yesterday.close - e.pricePoints.yesterday.open);
    let candleColor = (e.pricePoints.yesterday.close - e.pricePoints.yesterday.open > 0) ? 'green' : 'red';
    let upperShadow;
    let lowerShadow;
    if (candleColor  ==  'green') {
      upperShadow = e.pricePoints.yesterday.high - e.pricePoints.yesterday.close;
      lowerShadow = e.pricePoints.yesterday.open - e.pricePoints.yesterday.low;

    } else {
      upperShadow = e.pricePoints.yesterday.high - e.pricePoints.yesterday.open;
      lowerShadow = e.pricePoints.yesterday.close - e.pricePoints.yesterday.low;

    }

    let ob = { body, upperShadow, candleColor, lowerShadow }

    // console.log(ob)
    // && body<=lowerShadow

    
    if (e.pricePoints.d1.range < e.pricePoints.d2.range

      && (candleColor  ==  'red' && body > upperShadow * 2)
      || (candleColor  ==  'green' && body > upperShadow * 2)

    ) {



      // return true;  ///temoratry
      // console.log(ob)


      retObj = { 'otherCriteriaCheck': true, 'otherCriteriaObj': ob }
      return retObj
      tradables.push(e.instrument_token)

    } 
    
    
    
    else {

      retObj = { 'otherCriteriaCheck': true, 'otherCriteriaObj': ob }
      return retObj
    }

  } catch (e) {


    console.log('error', e)
    return false;

  }
}





















/// for testing



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




async function getHoldingInstruments(access_token) {


  try {

    var kc = new KiteConnect({
      api_key: api_key,
      access_token: access_token
    });

    let pos = await kc.getPositions();
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

    return pos.net.map(p => p.tradingsymbol)
    // console.log((pos))

  } catch (error) {
    console.log('error', error)
  }




}


function getNearestStrikes(ohlc, instruments) {


  return new Promise((resolve, reject) => {







    // console.log('from neearest strikeds with ohlc1',ohlc)

    currentInstruments = [];

    let len = Object.keys(ohlc).length;

    // console.log('objlen',len);

    // return false;


    Object.keys(ohlc).forEach(async item => {
      // console.log('item',item)
      let symbol = item.split(':')[1];

      console.log('symbol', symbol)





      let last_price_max = ohlc[item].last_price * 1.03
      let last_price_min = ohlc[item].last_price * .97

      let last_price = ohlc[item].last_price;


      if (symbol  ==  'NIFTY 50') {

        console.log('NIFTY 50', last_price)
      }
      if (symbol  ==  'NIFTY BANK') {

        console.log('NIFTY BANK', last_price)
      }

      let curInstrument = instruments.filter(


        i => {

          if (symbol  ==  'NIFTY 50') {

            symbol = 'NIFTY'
          }


          if (symbol  ==  'NIFTY BANK') {

            symbol = 'BANKNIFTY'
          }

          return i.name  ==  symbol
        }

      ).filter(i => {

        // console.log('i.name',i.name)

        if (i.name  ==  'NIFTY') {

          console.log('NIFTY', i.tradingsymbol, last_price)
        }
        if (i.name  ==  'BANKNIFTY') {

          console.log('NIFTY BANK', i.tradingsymbol, last_price)
        }



        if (i.instrument_type  ==  'EQ') {

          if (i.name  ==  'NIFTY' || i.name  ==  'BANKNIFTY') {

            console.log('its EQure', i.tradingsymbol)
            return true

          }
        }

        // console.log('i.instrument_type',i.instrument_type)
        if (i.instrument_type  ==  'CE') {


          /// if ce strike between 1.05 pc and 1.1 pc

          //if pe between strike .95 to .9


          //           console.log("variable", variable);
          // if (i.strike < last_price_max && i.strike > last_price_min) 
          if (i.strike > last_price *1.02 && i.strike < last_price * 1.05)


          // console.log('ceeeee yeee')
          {


            if (i.name  ==  'NIFTY') {

              console.log('NIFTY 50', i.tradingsymbol)
            }
            if (i.name  ==  'BANKNIFTY') {

              console.log('NIFTY BANK', i.tradingsymbol)
            }

            return true
          }
        }

        else if (i.instrument_type  ==  'PE') {

          // console.log('pee yeee')

          // if (i.strike < last_price_max && i.strike > last_price_min) {
          if (i.strike < last_price * .98 && i.strike > last_price * .93) {


            if (i.name  ==  'NIFTY') {

              console.log('NIFTY 50', i.tradingsymbol)
            }
            if (i.name  ==  'BANKNIFTY') {

              console.log('NIFTY BANK', i.tradingsymbol)
            }


            return true
          }
        }

      }).map(r => {




        r.spot_price = last_price


        return r







      })
      // console.log('curInstrument',curInstrument)

      currentInstruments.push(...curInstrument);




      len = len - 1;
      if (len  ==  0) {
        /// currrent positions

        currentInstruments1 = currentInstruments.map(c => {

          if (typeof c.tradingsymbol != 'undefined') return c

        }





        );


        currentInstruments = [...currentInstruments1]


        // console.log(currentInstruments,'cur instr');




        // tradingsymbol: 'OBEROIRLTY22FEB880PE',


        resolve(currentInstruments);

return;


        // console.log(pos,'pos')

      }

    })










  })

}



async function getSymbols() {


  let instruments = require('./appv3/public/instruments/instrumentsForMining.json');

  let st = instruments.filter(i => i.exchange  ==  'NSE')
    .map((i) => i.name)
    .filter((x, i, a) => a.indexOf(x)  === i);

  let st2 = instruments
    .map((i) => i.instrument_token)
    .filter((x, i, a) => a.indexOf(x)  === i);

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
  }).filter((x, i, a) => a.indexOf(x)  === i);;






  return symboList;

  // let f= await  this.getOHLC(this.accessToken, symboList);
  // let t=await  this.getNearestStrikes();









  // return st;
}
// let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';






const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(r => {
  // console.log(r)
  return AccesTocken.findOne({ 'date': today }, 'access_token').then(async e => {    access_token = e.access_token;
   

    let t = await fetchInstrumentsForMining(access_token);
    mongoose.disconnect();

  




   

  });

  ;


  return;

});


async function writeFinalScriptsTofile(jsonObj2, jsonObjWithOutCriteria) {


  return new Promise(async (res, rej) => {






    let fileOutputName = 'instruments/instrumentsForMiningStocks.json';
    let targetDir = Path.join(__dirname, '/app/instrumentsForMiningStocks.json');

    let out = await createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir);


    let fileOutputNameWithOutCriteria = 'instruments/instrumentsForMiningWithOutCriteria.json';
    let out2 = await createAndMoveFileFromJson(fileOutputNameWithOutCriteria, jsonObjWithOutCriteria, targetDir);

    res(out)
    return;





  })

  return;

}



function createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir) {

  return new Promise((res, rej) => {




    Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8',

      function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
        console.log(fileOutputName + "JSON file has been saved.");


        Fs.copyFile('instruments/instrumentsForMiningStocks.json', targetDir,
          (err) => {
            if (err) throw err;
            console.log('source.txt was copied to destination.txt');
            res(true);
            return;
          });


          res(true);
          return;

        

      });
      res(true);

      return;

  })

}



async function attachMIsPricePoints(jsonObj2, accessToken) {

  return;
  return new Promise(async (res, rej) => {

    const interval = 501;
    let delayTimer = setInterval(async () => {

      let misPricePoints1 = new misPricePoints()
      let pp = await misPricePoints1.getMisTargets()

      res(pp)

    }, interval);




  })
}

function getCurrentExpiryDate() {


  let d = new Date();
  d.setDate(d.getDate())
  d.setMonth(d.getMonth() + 1);

  let index = { 1: -4, 2: -5, 3: -6, 4: 0, 5: -1, 6: -2 }
  d.setDate(0);
  let lastDaysWeekDay = d.getDay()
  let out = index[lastDaysWeekDay]

  d.setDate(d.getDate() + out);


  let today = new Date();

  if (d - 14 < today) {
    ///next month expiry
    d.setMonth(d.getMonth() + 2);

    let index = { 1: -4, 2: -5, 3: -6, 4: 0, 5: -1, 6: -2 }
    d.setDate(0);
    let lastDaysWeekDay = d.getDay()
    let out = index[lastDaysWeekDay]

    d.setDate(d.getDate() + out);

  }

  // let d1 = d.toISOString().split('T')[0];



  d1 = "2022-10-27"
  console.log('Expiry date', d1)


  return d1
}


