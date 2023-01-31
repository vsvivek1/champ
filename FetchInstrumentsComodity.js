const Fs = require('fs')
const mongoose = require('mongoose');
const Path = require('path')
const Axios = require('axios');

const Fetch = require('./fetch.js')

const csvToJson = require("csvtojson");

const TIMER = 500;
var KiteConnect = require("kiteconnect").KiteConnect;


require('dotenv').config()
let access_token;
let AccesTocken = require('./models/AccessTokens');
const api_key = process.env.api_key;

const pricePoint = require('./pricePoints');

const ZerodhaAPI = require('./ZerodhaAPI');

const ohlc = require('./scraping/ohlc')
let today = new Date().toISOString().slice(0, 10);

const instruAll = './appv3/public/instruments/instrumentsAll.json';

const EXPIRY = getCurrentExpiryDate();



async function fetchInstrumentsForMining(accessToken) {
  let dl = await Fetch.downloadInstruments();

  let fileInputName = Path.resolve(__dirname, 'instruments', 'instruments.csv')

 


  
  
  let jsonObjCommodityFile= Path.resolve(__dirname, 'instruments', 'instrumentsForCommodity.json')


  let csvresult = await csvToJson().fromFile(fileInputName)

  Fs.unlink(fileInputName ,function(err){
    if(err) return console.log(err);
    console.log('file deleted successfully');
})





 

  let jsonObjMultiple = 
  csvresult.filter(j => ((j.exchange == 'MCX' && j.expiry.includes("2023-01-31"))))

  let jsonObj1=jsonObjMultiple.filter((curr,index,arr)=>arr.indexOf(curr)==index)


    ;



  let jsonObjAll = csvresult.filter(j => ((j.exchange == 'MCX') ));
  

  let fileOutputName = Path.resolve(__dirname, 'instruments', 'instrumentsForCommodity.json')


  let f = await new Promise((res, rej) => {

    Fs.writeFile(fileOutputName, JSON.stringify(jsonObj1), 'utf8',
      function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }
        console.log(fileOutputName + " JSON file has been saved.");
        res('ok')
          });


          
      })



  console.log('code block of downloading completed');






  let jsonObj2 = [];
  let jsonObjWithOutCriteria = [];



  try {

    let instruments1 = require('./appv3/public/instruments/instrumentsForCommodity.json');

    let strikes = instruments1.filter(r=>r.instrument_type=='FUT')
    
    
    //.map(m=>m.instrument_token)




    let symbols = [];
    let len1 = strikes.length;

    console.log('---------------code block of timer started')

    let len = len1;
    let intr = setInterval(async () => {

      let e = strikes.pop()
   

      console.log(e)


      if (typeof e == 'undefined'  || strikes.length==0) {
        clearInterval(intr);


        // let jsonObj3 = await overnightScripts(jsonObj2)


        console.log(jsonObj2.length, 'json obj len')
 
        let write = await writeFinalScriptsTofile(jsonObj2, jsonObjWithOutCriteria);

        console.log('finished ');
        return;
     

        return false
      }
      len--;

      //////////////////////////////////////////////
      let sec = len * TIMER / 1000;
      let min = sec / 60
      let sec1 = sec % 60

      let t = secondsToHms(sec)

      console.log(len, 'left out of ', len1, ' ', t, ' time left', e.tradingsymbol);
  

      if (typeof e != 'undefined') {

        let a = new pricePoint(e.instrument_token, accessToken);
        let c = await a.getPricePoints(7, 'day');
// console.log(c,'c')
        e.pricePoints = c;
        e.SevenDayMaxMin = c.SevenDayMaxMin;

        e.chart = `https://kite.zerodha.com/chart/ext/ciq/MCX-OPT/${e.tradingsymbol}/${e.instrument_token}`;
        e.seletedBuyingMethod = 'MAX'
        e.enterNowToTrade = false;
        e.PlacedReverseOrder = false;


        if (typeof e.pricePoints == 'undefined') {
          console.log('pricePoints undefined ', e.tradingsymbol)

          return;
        }
        if (e.pricePoints.length == 0) {

          console.log('pricePoints not set for ', e.tradingsymbol);

          return;
        } else {

       
          let { otherCriteriaCheck, otherCriteriaObj } = otherCriteria(e);

          e.otherCriteria = otherCriteriaObj;
          e.otherCriteriaCheck = otherCriteriaCheck;

      
          if (otherCriteriaCheck) {


            jsonObj2.push(e)
          } else {
           jsonObjWithOutCriteria.push(e)
    
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
    if (candleColor == 'green') {
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

      && (candleColor == 'red' && body > upperShadow * 2)
      || (candleColor == 'green' && body > upperShadow * 2)

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



const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(r => {

  return AccesTocken.findOne({ 'date': today }, 'access_token').then(async e => {
    access_token = e.access_token;
    let t = await fetchInstrumentsForMining(access_token);

  });

  ;


  return;

});


async function writeFinalScriptsTofile(jsonObj2, jsonObjWithOutCriteria) {


  return new Promise(async (res, rej) => {






    let fileOutputName = 'instruments/instrumentsForCommodity.json';
    let targetDir = Path.join(__dirname, '/app/instrumentsForCommodity.json');

    let out = await createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir);


    let fileOutputNameWithOutCriteria =
     'instruments/instrumentsForCommodityWithOutCriteria.json';
    let out2 = await createAndMoveFileFromJson(fileOutputNameWithOutCriteria, jsonObjWithOutCriteria, targetDir);

    res(out)





  })

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


        Fs.copyFile('instruments/instrumentsForCommodity.json', targetDir,
          (err) => {
            if (err) throw err;
            console.log('source.txt was copied to destination.txt');
          });




        res(true);

      });


  })

}

function overnightScripts(jsonObj2, jsonObjWithOutCriteria) {


  return new Promise(async (res, rej) => {



    console.log(access_token, 'access_token')


    let overNights = []
    let pos = await getHoldingInstruments(access_token);

    let posln = pos.length

    console.log('total overnight ', posln)


    let PostionsTimer = setInterval(async () => {


      let e = pos.pop()
      posln--;



      if (typeof e == 'undefined') {
        console.warn('clearing postion timer')
        clearInterval(PostionsTimer)

        res(jsonObj2)

        console.log('where am i', jsonObj2.length)
        return false;
      }
      try {

        console.log(' overnight left', posln, 'e', e);
        let instruAll = require('./appv3/public/instruments/instrumentsAll.json');

        let ln = jsonObj2.filter(ci => ci.tradingsymbol == e).length;

        console.log(ln, 'is presnett', e);
        if (ln == 0) {

          // console.log(e,'Holding instrument Not Found');
          let i = instruAll.filter(i => i.tradingsymbol == e)[0];
          let a = new pricePoint(i.instrument_token, access_token);
          let c = await a.getPricePoints(7, 'day');

          if (typeof c == 'undefined') {

            console.log('big problem with price points')

            return false
          }
          // console.log(c,'c')
          i.pricePoints = c;
          i.SevenDayMaxMin = c.SevenDayMaxMin;

          i.chart = `https://kite.zerodha.com/chart/ext/ciq/MCX-OPT/${i.tradingsymbol}/${i.instrument_token}`;
          i.seletedBuyingMethod = 'MAX'
          i.enterNowToTrade = false;

          console.log('pushing', e)
          jsonObj2.push(i);


        } else {

          console.log('Instrument ', e, 'Found no issues')
        }

      }

      catch (error) {


        console.log(error, 'error of position check')
      }








    }, 600) //pos for each





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



  d1 = "2023-01-31"
  console.log('Expiry date', d1)


  return d1
}


