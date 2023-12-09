process.stdout.write('\033c');
const Fs = require('fs')
const mongoose = require('mongoose');
const Path = require('path')
const Axios = require('axios');

const Fetch = require('./fetch.js')

const csvToJson = require("csvtojson");

let moment= require('moment');
// const FILE_LOCATION='./appv3/public/instruments'

const scriptDirectory = Path.dirname(process.argv[1]);
const FILE_LOCATION = Path.join(scriptDirectory, 'appv3', 'public', 'instruments');


let ce_upper_percentage=1.02;
let ce_lower_percentage=1;

let pe_upper_percentage=1;
let pe_lower_percentage=.98;
const TIMER =200 ;
let today = new Date().toISOString().slice(0,10)

// console.log(today);
// return;



main();
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});


function main() {

	try{
  const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(r => {
    // console.log(r)
    return AccesTocken.findOne({ 'date': today }, 'access_token').then(async (e) => {

      access_token = e.access_token;


	  console.log(access_token,'access token from here')
      await fetchInstrumentsForMining(access_token);




    });

    ;


  });
}catch(e){

	console.log('ERROR AT MAIN FUNCTION ',e)
}
}

function printProgress(progress){
 try {
	 process.stdout.write(progress );
	  process.stdout.clearLine(0);
	  process.stdout.cursorTo(0);
	  process.stdout.write("\n");
	 
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}
}

function cl(i){

  console.log(i)
}



var overAllTimer;




var KiteConnect = require("kiteconnect").KiteConnect;




require('dotenv').config()
let access_token;
let AccesTocken = require('./models/AccessTokens');
// const api_key = process.env.api_key;
const api_key = 'wkcurst2vu5obug7'



const pricePoint = require('./pricePoints');

const ZerodhaAPI = require('./ZerodhaAPI');

const ohlc = require('./scraping/ohlc');
const { getNextThursday } = require('./getNextThursday.js');
// let today = new Date().toISOString()//.slice(0, 10);
// const fetchInstrumentsForNewMint=require('./FetchInstrumentsForNewMint.js')

const instruAll = FILE_LOCATION+'/instrumentsAll.json';

const EXPIRY = getCurrentExpiryDate();
console.log(EXPIRY,'EXPIRY')




// module.exports = 
// module.exports=
function removeDuplicates(arr){

  try {
	const uniqueArray = arr.filter((value, index) => {
	    const _value = JSON.stringify(value);
	    return index === arr.findIndex(obj => {
	      return JSON.stringify(obj) === _value;
	    });
	  });
	
	  return uniqueArray
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}

}

function  convertIsoDateToIST(iso) {
  
try {
	
	  return moment(iso).format("DD-MM HH:mm");
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}
}


async function fetchInstrumentsForMining(accessToken) {try {
	

	
	  let dl = await Fetch.downloadInstruments();
	
	
	
	
	
	  let fileInputName = Path.resolve(__dirname, FILE_LOCATION, 'instruments.csv')
	
	
	
	  let csvresult = await csvToJson().fromFile(fileInputName)
	
	
	  Fs.unlink(fileInputName ,function(err){
	    if(err) return console.log(err);
	    // console.log('file deleted successfully');
	})
	
	
	 
	  let jsonObjMultiple = 
	  csvresult.filter(j => (
	    (
	      
	      j.exchange == 'NFO' && (j.expiry == EXPIRY 
			// || j.expiry == getBankNiftyExpiry()
		  ) 
	      
	   
	      )
	    
	    
	    ))
	

	  let jsonObj1=jsonObjMultiple;
	
	  let jsonObjAll = csvresult//.filter(j => ((j.exchange == 'NFO') || j.exchange == 'NSE'));
	  
	  
	  let jsonObjCommodity = csvresult.filter(j => ((j.exchange == 'MCX') 
	  ));
	
	
	
	
	
	
	
	//   let fileOutputName = Path.resolve(__dirname, FILE_LOCATION,
	//    'instruments.json')
	   
	 
	   let fileOutputName = Path.resolve( FILE_LOCATION,
	   'instruments.json')
	  
	  
	//   let jsonObjCommodityFile= Path.resolve(__dirname, FILE_LOCATION, 'CommodityFile.json')
	  let jsonObjCommodityFile= Path.resolve(FILE_LOCATION, 'CommodityFile.json')
	
	  let f = await new Promise((res, rej) => {
	
	    Fs.writeFile(fileOutputName, JSON.stringify(jsonObj1), 'utf8',
	      function (err) {
	        if (err) {
	          console.log("An error occured while writing JSON Object to File.");
	          return console.log(err);
	        }
	        // console.log(fileOutputName + "JSON file has been saved.");
	
	        // let targetDir = Path.join(__dirname, FILE_LOCATION+'/instruments.json');
	        let targetDir = Path.join(FILE_LOCATION+'/instruments.json');
	
	
	        return Fs.copyFile(FILE_LOCATION+'/instruments.json', targetDir,
	
	          (err) => {
	            if (err) throw err;
	            
	
	
	            Fs.writeFile(jsonObjCommodityFile, JSON.stringify(jsonObjCommodity), 'utf8', function (err) {
	              if (err) {
	                console.log("An error occured while writing JSON Object to File."+jsonObjCommodity);
	                return console.log(err);
	              }
	            });
	
	          
	
	
	
	            return Fs.writeFile(instruAll, JSON.stringify(jsonObjAll), 'utf8', function (err) {
	              if (err) {
	                console.log("An error occured while writing JSON Object to File.");
	                return console.log(err);
	              }
	
	
	// console.log('instruAll is copied to %s',instruAll)
	
	res(true);
	
	
	
	
	            });
	
	
	
	
	
	          });
	
	      })
	
	  });
	
	  console.log('code block of downloading completed')
	
	
	
	  let jsonObj2 = [];
	  let jsonObjWithOutCriteria = [];
	
	
	  let a = await getSymbols();
	
	
		
	  console.log(accessToken,'ACCESS TOKEN @285')
	
	    let ohlcs = await ohlc(accessToken, a);

		// console.log(ohlcs);



	    let instruments1 = require(FILE_LOCATION+'/instruments.json');
	    let instruments = instruments1.filter(i=>(i.tradingsymbol.includes('NIFTY'))
		|| i.tradingsymbol.includes('BANKNIFTY')
		
		)//.slice(0,10)
	    
		
		let strikes1 = await getNearestStrikes_unoptimized(ohlcs, instruments)//.slice(1,50);
	

		let strikes=strikes1//.slice(1,100);
	    let symbols = [];
	    let len1 = strikes.length;
	
	    console.log('---------------code block of timer started total strikes',len1)
	
	    let len = len1;
	    let intr = setInterval(async () => {
	      // var a111=0;
	
	      let e = strikes.pop()
	      // console.log(e,'e')
	      //////////////////////////////////////////////
	
	
	      if (typeof e == 'undefined') {
	        clearInterval(intr);
	
	
	        let jsonObj3 = await overnightScripts(jsonObj2)
	
	
	        console.log(jsonObj2.length, 'json obj len')
	        // console.log('Now starting new mint ');
	
	        let write = await writeFinalScriptsTofile(jsonObj3, jsonObjWithOutCriteria);
	
	        console.log('finished ');
	        return;
	        // fetchInstrumentsForNewMint(accessToken);
	
	        return false
	      }
	      len--;
	
	      //////////////////////////////////////////////
	      let sec = len * TIMER / 1000;
	      let min = sec / 60
	      let sec1 = sec % 60
	
	      let t = secondsToHms(sec)
	      overAllTimer=sec
	
	
	      let progress=`${len}, 'left out of ', ${len1}, ' ', ${t}, ' time left', ${e.tradingsymbol}`;
	

         cl(progress)
	      // console.log(len, 'left out of ', len1, ' ', t, ' time left', e.tradingsymbol);
	      // printProgress(progress)
	
	      if (e && typeof e != 'undefined') {
	       
	       
	      try {
	
	          await setCurrentInstrumentParameters(e);
	      
	      
	        } catch (error) {
	        console.log(error,'LINE 353')
	
	        strikes.push(e)
	      }
	
	
	      }
	      
	
	
	
	    }, TIMER)
	
	
	
	
	
	
	 
	
	
	
	  return true;
	
	  function   higherLowsCheck(pricePoints) {

		// console.log('from fn')
		// const pricePoints = cis.pricePoints;
		
		
		let {d0,d1,d2,d3,d4,d5,d6,d7}=pricePoints;
		
		if(


		(d1.low>d2.low &&
		d2.low>d3.low ) 
		||

		(d1.high>d2.high &&
			d2.high>d3.high)
		
		//&&
		// d3.low>d4.low 
		
		
		){
		
		return true
		}else{
		
		
		return false;
		}
		
		
		
		
		}
	
	  async function setCurrentInstrumentParameters(e) {
		let instruAll = require(FILE_LOCATION+'/instrumentsAll.json');

		console.log(accessToken,'accessToken @ 415')
	    let a = new pricePoint(e.instrument_token, accessToken);
	
	
	    let c = await a.getPricePoints(30, 'day');
	
	

		// isHigerLows=higherLowsCheck(c)

		// if(isHigerLows==false){


			
		// 	return false;
		// }else{

		// 	console.log(e.instrument_token,'passed higher lows')

		// }

	    e.pricePoints = c;
	
	
	    e.SevenDayMaxMin = c.SevenDayMaxMin;
	    e.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;

		let name=e.name;

	

		if(typeof instruAll.find(i=>i.tradingsymbol==e.name)!=='undefined'){

			let nameinstrumentToken=instruAll.find(i=>i.tradingsymbol==e.name).instrument_token;
			let stockChart=`https://kite.zerodha.com/chart/ext/ciq/NSE/${name}/${nameinstrumentToken}`;
			e.stockChart=stockChart;
	

		}
		

	    e.seletedBuyingMethod = 'MAX';
	    e.enterNowToTrade = false;
	    e.PlacedReverseOrder = false;
	    e.hasLiveTarget = false;
	    e.hasLivePosition = false;
	
	    e.previousPrice = 0;
	    e.last_price = 0;
	
	    if (e.pricePoints) {
	
	      let { otherCriteriaCheck, otherCriteriaObj } = otherCriteria(e);
	      e.otherCriteria = otherCriteriaObj;
	      e.otherCriteriaCheck = otherCriteriaCheck;
	      if (otherCriteriaCheck) {
	        jsonObj2.push(e);
	      } else {
	        jsonObjWithOutCriteria.push(e);
	      }
	    } else {
	      console.log(`${e.tradingsymbol}: pricePoints not set, so not pushing`, e.pricePoints);
	    }
	  }
	
	  async function FunctionProcedureForFutures(e) {
	    let instruForFuture = require(FILE_LOCATION+'/instrumentsAll.json');
	
	    let niftyfut = instruForFuture.filter(i => i.name == 'NIFTY' && i.expiry == EXPIRY && i.instrument_type == "FUT")[0];
	    let a = new pricePoint(niftyfut.instrument_token, accessToken);
	    let c = await a.getPricePoints(7, 'day');
	
	    niftyfut.pricePoints = c;
	    niftyfut.SevenDayMaxMin = c.SevenDayMaxMin;
	
	    niftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
	    niftyfut.seletedBuyingMethod = 'MAX';
	    niftyfut.enterNowToTrade = false;
	    niftyfut.PlacedReverseOrder = false;
	
	
	    //  console.log(niftyfut)
	    jsonObj2.push(niftyfut);
	    jsonObjWithOutCriteria.push(niftyfut);
	
	
	    let bankniftyfut = instruForFuture.filter(i => i.name == 'BANKNIFTY' && i.expiry == getBankNiftyExpiry() && i.instrument_type == "FUT")[0];
	
	
	
	
	    let abnf = new pricePoint(bankniftyfut.instrument_token, accessToken);
	    let cbnf = await abnf.getPricePoints(7, 'day');
	
	    bankniftyfut.pricePoints = cbnf;
	    bankniftyfut.SevenDayMaxMin = cbnf.SevenDayMaxMin;
	
	    bankniftyfut.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
	    bankniftyfut.seletedBuyingMethod = 'MAX';
	    bankniftyfut.enterNowToTrade = false;
	    bankniftyfut.PlacedReverseOrder = false;
	
	    //  console.log(bankniftyfut)
	    jsonObj2.push(bankniftyfut);
	    jsonObjWithOutCriteria.push(bankniftyfut);
	  }
	
} catch (error) {
	console.log(error)
//   const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
//   const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
//   console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}}







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


    if(body==0){

      retObj = { 'otherCriteriaCheck': false, 'otherCriteriaObj': ob }
      return retObj
    }

    
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

    const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
    const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
    
    console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
    return false;

  }
}





















/// for testing



function secondsToHms(d) {
  try {
	d = Number(d);
	  var h = Math.floor(d / 3600);
	  var m = Math.floor(d % 3600 / 60);
	  var s = Math.floor(d % 3600 % 60);
	
	  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	  return hDisplay + mDisplay + sDisplay;
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}
}




async function getHoldingInstruments(access_token) {
  try {
    const kc = new KiteConnect({
      api_key: api_key,
      access_token: access_token
    });

    const positions = await kc.getPositions();
    return positions.net.map(p => p.tradingsymbol);
  } catch (error) {
    const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
  }
}



function getNearestStrikes(ohlc, instruments) {try {
	
	  const peUpperPercentage = 1;
	  const peLowerPercentage = .97;
	  const ceUpperPercentage = 1;
	  const ceLowerPercentage = .97;
	  
	
	
	  return Promise.resolve(
	    Object.entries(ohlc).reduce((currentInstruments, [item, value]) => {
	
	
	      let symbol = item.split(':')[1];
	      let lastPriceMax = value.last_price * peUpperPercentage;
	      let lastPriceMin = value.last_price * peLowerPercentage;
	      let lastPrice = value.last_price;
	
	      let curInstrument = instruments.find(i => {
	        if (symbol === 'NIFTY 50') {
	          symbol = 'NIFTY';
	        }
	        if (symbol === 'NIFTY BANK') {
	          symbol = 'BANKNIFTY';
	        }
	        return i.name === symbol;
	      });
	
	
	
	      console.log(instruments.length);
	
	      return;
	      // console.log(curInstrument)
	
	     
	
	      if (curInstrument) {
	
	
	        console.log()
	
	
	        if (curInstrument.instrument_type === 'FUT' && (curInstrument.name === 'NIFTY' || curInstrument.name === 'BANKNIFTY')) {
	          
	          console.log(curInstrument.tradingsymbol)
	         
	
	          curInstrument.spot_price = lastPrice;
	          currentInstruments.push(curInstrument);
	        } else if (curInstrument.instrument_type === 'CE' && curInstrument.strike > lastPrice /** ceLowerPercentage && curInstrument.strike < lastPrice * ceUpperPercentage*/) {
	        
	          console.log(curInstrument)
	          
	          curInstrument.spot_price = lastPrice;
	          currentInstruments.push(curInstrument);
	        } else if (curInstrument.instrument_type === 'PE' && curInstrument.strike < lastPrice /** peUpperPercentage && curInstrument.strike > lastPrice * peLowerPercentage*/) {
	          curInstrument.spot_price = lastPrice;
	
	          console.log(curInstrument)
	          currentInstruments.push(curInstrument);
	        }
	      }
	    return currentInstruments;
	    }, [])
	
	
	
	  );
	
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}}


function getNearestStrikes_unoptimized(ohlc, instruments) {try {
	
	
	
	  return new Promise((resolve, reject) => {
	
	
	
	
	
	
	
	    // console.log('from neearest strikeds with ohlc1',ohlc)
	
	    currentInstruments = [];
	
	    let len = Object.keys(ohlc).length;
	
	    // console.log('objlen',len);
	
	    // return false;
	
	
	    Object.keys(ohlc).forEach(async item => {
	      // console.log('item',item)
	      let symbol = item.split(':')[1];
	
	      // console.log('symbol', symbol)
	
	
	
	
	
	      let last_price_max = ohlc[item].last_price * 1.03
	      let last_price_min = ohlc[item].last_price * .97
	
	      let last_price = ohlc[item].last_price;
	
	
	      if (symbol == 'NIFTY 50') {
	
	        // console.log('NIFTY 50', last_price)
	      }
	      if (symbol == 'NIFTY BANK') {
	
	        // console.log('NIFTY BANK', last_price)
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
	
	          // console.log('NIFTY', i.tradingsymbol, last_price)
	        }
	        if (i.name == 'BANKNIFTY') {
	
	          // console.log('NIFTY BANK', i.tradingsymbol, last_price)
	        }
	
	
	
	        if (i.instrument_type == 'FUT') {
	
	          if (i.name == 'NIFTY' || i.name == 'BANKNIFTY') {
	
	            // console.log('its future', i.tradingsymbol)
	            return true
	
	          }
	        }
	
	        // console.log('i.instrument_type',i.instrument_type)
	        if (i.instrument_type == 'CE') {
	
	
	          /// if ce strike between 1.05 pc and 1.1 pc
	
	          //if pe between strike .95 to .9
	
	
	          //           console.log("variable", variable);
	          // if (i.strike < last_price_max && i.strike > last_price_min) 
	
	
	          // let ce_upper_percentage=1;
	          // let ce_lower_percentage=.97;
	          
	        
	
	
	
	          if (i.strike > last_price * ce_lower_percentage && 
	            i.strike < last_price * ce_upper_percentage)
	
	
	          // console.log('ceeeee yeee')
	          {
	
	
	            if (i.name == 'NIFTY') {
	
	              // console.log('NIFTY 50', i.tradingsymbol)
	            }
	            if (i.name == 'BANKNIFTY') {
	
	              // console.log('NIFTY BANK', i.tradingsymbol)
	            }
	
	            return true
	          }
	        }
	
	        else if (i.instrument_type == 'PE') {
	
	          // console.log('pee yeee')
	
	
	          // let pe_upper_percentage=1.03;
	          // let pe_lower_percentage=1;
	
	          // if (i.strike < last_price_max && i.strike > last_price_min) {
	          if (i.strike < last_price * pe_upper_percentage  && i.strike > last_price * pe_lower_percentage) {
	
	
	            if (i.name == 'NIFTY') {
	
	              // console.log('NIFTY 50', i.tradingsymbol)
	            }
	            if (i.name == 'BANKNIFTY') {
	
	              // console.log('NIFTY BANK', i.tradingsymbol)
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
	      if (len == 0) {
	        /// currrent positions
	
	        currentInstruments1 = currentInstruments.map(c => {
	
	          if (typeof c.tradingsymbol != 'undefined') return c
	
	        }
	
	
	
	
	
	        );
	
	
	        // console.log({currentInstruments1})
	
	        currentInstruments = [...currentInstruments1]
	
	
	
	 let instruAll = require(FILE_LOCATION+'/instrumentsAll.json');
	
	
	  let needed=['NIFTY 50','INDIA VIX','NIFTY BANK'];
	  
	  
	  let segments=instruAll .filter(i=>i.segment=='INDICES' && needed.includes(i.tradingsymbol))
	
	
	    // .map(j=>j.instrument_token)
	
	
	  // console.log(symboList.length,'Total stocks ')

	
	
	  // console.log(segments,'here')
	
	
	
	  currentInstruments.push(...segments)
	
	        // console.log(currentInstruments,'cur instr');
	
	
	
	
	        // tradingsymbol: 'OBEROIRLTY22FEB880PE',
	
	
	        resolve(currentInstruments);
	
	return;
	
	
	        // console.log(pos,'pos')
	
	      }
	
	    })
	
	
	
	
	
	
	
	
	
	  })
	
	
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}}



async function getSymbols() {try {
	
	
	
	  let instruments = require(FILE_LOCATION+'/instruments.json');
	
	  let st = instruments.filter(i => i.exchange == 'NFO')
	    .map((i) => i.name)
	    .filter((x, i, a) => a.indexOf(x) === i);
	
	  let st2 = instruments
	    .map((i) => i.instrument_token)
	    .filter((x, i, a) => a.indexOf(x) === i);
	
	  let instTockens = st.map((s) => {
	  
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
	
	    // console.log('from get symbls', s)
	
	    if (s == 'NIFTY') {
	      s = "NIFTY 50"
	
	    }
	
	    if (s == 'BANKNIFTY') {
	      s = "NIFTY BANK"
	
	    }
	    return "NSE:" + s;
	  }).filter((x, i, a) => a.indexOf(x) === i);;
	
	
	
	
	  let instruAll = require(FILE_LOCATION+'/instrumentsAll.json');
	
	
	  let needed=['NIFTY 50','INDIA VIX','NIFTY BANK'];
	  
	  
	  let segments=instruAll .filter(i=>i.segment=='INDICES' && needed.includes(i.tradingsymbol))
	
	
	    .map(j=>j.tradingsymbol)
	
	
	  console.log(symboList.length,'Total stocks ')
	  console.log('segments length',segments.length)
	
	
	  // console.log(segments)
	
	
	
	  symboList.push(...segments)
	
	  // console.log(symboList.length,'Total stocks after ')
	  return symboList;
	
	
	
	  // let f= await  this.getOHLC(this.accessToken, symboList);
	  // let t=await  this.getNearestStrikes();
	
	
	
	
	
	
	
	
	
	  // return st;
	
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}}
// let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';









async function writeFinalScriptsTofile(jsonObj2, jsonObjWithOutCriteria) {


 try {
	 return new Promise(async (res, rej) => {
	
	
	
	
	
	
	    let fileOutputName = FILE_LOCATION+'/instrumentsForMining.json';
	    let targetDir = Path.join(FILE_LOCATION+'/instrumentsForMining.json');
	
	    let out = await createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir);
	
	
	    let fileOutputNameWithOutCriteria = FILE_LOCATION+'/instrumentsForMiningWithOutCriteria.json';
	    let out2 = await createAndMoveFileFromJson(fileOutputNameWithOutCriteria, jsonObjWithOutCriteria, targetDir);
	
	    res(out)
	    return;
	
	
	
	
	
	  })
	
	  return;
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}

}



function createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir) {

try {
	  return new Promise((res, rej) => {
	
	
	
	
	    Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8',
	
	      function (err) {
	        if (err) {
	          console.log("An error occured while writing JSON Object to File.");
	          return console.log(err);
	        }
	        // console.log(fileOutputName + "JSON file has been saved.");
	
	
	        Fs.copyFile(FILE_LOCATION+'/instrumentsForMining.json', targetDir,
	          (err) => {
	            if (err) throw err;
	            // console.log('source.txt was copied to destination.txt');
	            res(true);
	            return;
	          });
	
	
	          res(true);
	          return;
	
	        
	
	      });
	      res(true);
	
	      return;
	
	  })
	
} catch (error) {
  const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
  const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
  
  console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
}
}

function overnightScripts(jsonObj2) {


  return new Promise(async (res, rej) => {






    let overNights = []
    let pos = await getHoldingInstruments(access_token);


    if(typeof pos=='undefined'){

      console.log('failed to load holdings line@1002');
      return ;
    }

    let posln = pos.length

    console.log('total overnight ', posln)


    let PostionsTimer = setInterval(async () => {


      let e = pos.pop()
      posln--;



      if (typeof e == 'undefined') {
        console.warn('CLEARING POSITION FOR OVERNIGHT SCRIPTS')
        clearInterval(PostionsTimer)

        res(jsonObj2)

        console.log('where am i', jsonObj2.length)
        return false;
      }
      try {

        console.log(' overnight left', posln, 'e', e);
        let instruAll = require(FILE_LOCATION+'/instrumentsAll.json');

        let ln = jsonObj2.find(ci => ci.tradingsymbol == e)

       

		
        if (typeof ln=='undefined') {


			console.log( ' %s ABSENT IN TODAYS SCRIPT  ',e);
   
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

          i.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${i.tradingsymbol}/${i.instrument_token}`;
          i.seletedBuyingMethod = 'MAX'
          i.enterNowToTrade = false;
          i.PlacedReverseOrder = false;

          console.log('pushing ', e, 'the overnight script');
          jsonObj2.push(i);


        } else {

          console.log('Instrument ', e, 'Found no issues')
        }

      }

      catch (error) {

        const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
        const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();
        
        console.error(`Error occurred in function "${functionName}" on line ${lineNumber}`);
        console.log(error, 'error of position check')
      }








    }, 505) //pos for each


// res(true)


  })
}


async function attachMIsPricePoints(jsonObj2, accessToken) {

  return;
  return new Promise(async (res, rej) => {

    const interval = 333;
    let delayTimer = setInterval(async () => {

      let misPricePoints1 = new misPricePoints()
      let pp = await misPricePoints1.getMisTargets()

      res(pp)

    }, interval);




  })
}


function getBankNiftyExpiry(){

	let {bankNifty}=getNextThursday();

	return bankNifty;
}
function getCurrentExpiryDate() {


	// const moment = require('moment');

	


	return '2023-12-14'
let {nifty} =getNextThursday();
return nifty;
// let m=moment();

return "2023-11-02";
	
	const lastThursday = getLastThursdayOfMonth(m);
	console.log(`Last Thursday of the month: ${lastThursday}`);
	


	return  lastThursday;
}

function getLastThursdayOfMonth(date=moment()) {
	// Get the last day of the month
	const lastDayOfMonth = date.endOf('month');
  
	// Find the last Thursday of the month
	let lastThursday = lastDayOfMonth.clone().startOf('day').subtract(1, 'day');
	while (lastThursday.day() !== 4) {
	  lastThursday.subtract(1, 'day');
	}
  
	// Check if the last Thursday falls on a holiday
	const holidays = [
	  '2022-01-26',
	  '2022-03-01',
	  '2022-03-18',
	  '2022-04-14',
	  '2022-04-15',
	  '2022-05-03',
	  '2022-08-09',
	  '2022-08-15',
	  '2022-08-31',
	  '2022-10-05',
	  '2022-10-24',
	  '2022-10-26',
	  '2022-11-08',
	  '2023-01-26',
	  '2023-03-07',
	  '2023-03-30',
	  '2023-04-04',
	  '2023-04-07',
	  '2023-04-14',
	  '2023-04-21',
	  '2023-05-01',
	  '2023-06-28',
	  '2023-08-15',
	  '2023-09-19',
	  '2023-10-02',
	  '2023-10-24',
	  '2023-11-14',
	  '2023-11-27',
	  '2023-12-25'
	];
  
	if (holidays.includes(lastThursday.format('YYYY-MM-DD'))) {
	  // If the last Thursday falls on a holiday, get the previous day
	  lastThursday.subtract(1, 'day');
	}
  
	// Check if there are less than 14 days to the last Thursday
	if (lastDayOfMonth.diff(lastThursday, 'days') < 14) {
	  // If there are less than 14 days, get the last Thursday of the next month
	  const nextMonth = date.add(1, 'month');
	  return getLastThursdayOfMonth(nextMonth);
	}
  
	// Return the last Thursday and the holidays array
	return { lastThursday: lastThursday.format('YYYY-MM-DD'), holidays };
  }


