
const { connectToDatabase } = require('./connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { downLoadAllInstrumentsAndReturnJson } = require('./downLoadAllInstrumentsAndReturnJson.js');
const Path  =  require( 'path' );
const { getNFOScripts } = require('./getNFOScripts.js');
const { getScriptsExpiringBeforeNextThursday } = require('./getScriptsExpiringBeforeNextThursday.js');
const { getScriptsExpiringToday } = require('./getScriptsExpiringBeforeNextThursday.js');
const { getUniqueNames } = require('./getUniqueNames.js');
const { getUniqueInstruments } = require('./getUniqueNames.js');
const { getUniqueTradingSymbols } = require('./getUniqueNames.js');
const { getKiteConnectInstance } = require('./getKiteConnectInstance.js');

const fs = require('fs').promises;
//const restartPM2Process = require('./restartPM2Process');
const scriptDirectory  =  Path.dirname( process.argv[1] );
const FILE_LOCATION  =  Path.join( scriptDirectory, 'appv3', 'public', 'instruments' );

let indexOptions={
    "NIFTY": "NIFTY 50",
    "NIFTYNXT50": "NIFTY NEXT 50",
    "BANKNIFTY": "NIFTY BANK",
    "FINNIFTY": "NIFTY FIN SERVICE",
    "MIDCPNIFTY": "NIFTY MIDCAP SELECT (MIDCPNIFTY)"
  }

async function writeJsonToFile(jsonData, fileName) {
    try {
        // Convert JSON object to string
        const jsonString = JSON.stringify(jsonData, null, 2); // null, 2 for pretty formatting

        // Write JSON string to file
        await fs.writeFile(fileName, jsonString);

        

        console.log('JSON data has been written to', fileName);

      

        return;
    } catch (err) {
        console.error('Error writing JSON to file:', err);

        return;
    }
}

const pricePoints =require('./pricePoints');

function filterByName(jsonArray, names = ['NIFTY', 'BANKNIFTY']) {
   return jsonArray.filter(item => names.includes(item.name));
}

var con=connectToDatabase();

function calculateStrikeDifferences(instruments1, name,ltp) {
    var instruments = instruments1.filter(i => i.name == name && i.segment == 'NFO-OPT' && i.instrument_type == 'PE');

    // Sort instruments by strike price
    let sortedInstruments = instruments.sort((a, b) => parseInt(a.strike) - parseInt(b.strike));


    let b=sortedInstruments.map(i=>i.strike).filter(i=>i<ltp);
    let ln=b.length;

    return b[ln-1]-b[ln-2];
   // console.log(b[ln-1]-b[ln-2])
   // process.exit();

    // Calculate the common difference between consecutive strike prices
    let commonDifference = parseInt(sortedInstruments[1].strike) - parseInt(sortedInstruments[0].strike);


   // console.log(commonDifference);

  //  process.exit()
    return commonDifference;
}

const { exec } = require('child_process');
const { clearCustomQueryHandlers } = require('puppeteer');
const { disconnect, set } = require('mongoose');



async function main(params) {
    
    exec('clear');
   console.clear();
 
   var accessTokenDoc= await getTodaysAccessToken(params)
  let allScriptJson=await  downLoadAllInstrumentsAndReturnJson()

  await writeJsonToFile(allScriptJson,'./appv3/public/instruments/instrumentsAll.json')


 
 

 
  



   
var nfoScripts=getNFOScripts(allScriptJson)

var exp=getScriptsExpiringBeforeNextThursday(nfoScripts);
var expToday=getScriptsExpiringToday(nfoScripts);











//var tokens=

//var niftyBankNiftyBeforeNearestExpiry=filterByName(exp)

//var names=getUniqueNames(niftyBankNiftyBeforeNearestExpiry)
var names=getUniqueNames(expToday)
var selectedOptions=[];

let fullJson=[];

var instruments=getUniqueInstruments(expToday)
var symbols=getUniqueTradingSymbols(expToday)
const kite =await  getKiteConnectInstance();

let indexInstruments=allScriptJson.filter(i=> i.segment== 'INDICES' && i.exchange=='NSE');
//let indexInstrumentsAndStocks=allScriptJson.filter(i=>  i.exchange=='NSE' && i.segment== 'INDICES');




let all=new Set();
let allNames=allScriptJson.filter(i=> i.segment=='NFO-OPT' && i.exchange=='NFO')

.map(m=>m.name)
.forEach(e=>{

    //console.log(e);
    

    all.add(e)
}) 


/* console.log(indexInstruments)
process.exit() */
let indexNames=indexInstruments.map(i=>i.tradingsymbol)
/* console.log(indexNames)
process.exit(); */


names.forEach(async (name)=>{





let instruNameFeild=typeof indexOptions[name]=='undefined'?name:indexOptions[name];
;
//var instruments=getUniqueInstruments(niftyBankNiftyBeforeNearestExpiry)



//var symbols=getUniqueTradingSymbols(niftyBankNiftyBeforeNearestExpiry)








//var diff =calculateStrikeDifferences(niftyBankNiftyBeforeNearestExpiry,name);






console.log('THE NAME IS ',name,instruNameFeild)





let indexInstrument=indexInstruments.find(i=>i.name==instruNameFeild)


if(typeof indexInstrument=='undefined'){

  return;
}

//let indexInstrument=indexInstruments.find(i=>i.name==instruNameFeild)



var quote=await kite.getLTP(indexInstrument.instrument_token)


var ltp=quote[indexInstrument.instrument_token]['last_price']








var diff =calculateStrikeDifferences(expToday,name,ltp);







var strikeAbove=(Math.ceil(ltp/diff)*diff)
var strikeBelow=(Math.floor(ltp/diff)*diff)

/* console.log(strikeBelow,'above',indexInstrument.tradingsymbol);

process.exit(); */

var requiredAbove=strikeAbove//+diff;
var requiredBelow=strikeBelow//-diff;

/* let callOptions = niftyBankNiftyBeforeNearestExpiry.filter(option => {
   return requiredAbove && option.instrument_type === 'CE' && parseInt(option.strike) > requiredAbove;
}); */

let callOptions = expToday.filter(option => {
   return requiredAbove && option.instrument_type === 'CE' && parseInt(option.strike) == requiredAbove;
});

let putOptions = expToday.filter(option => {
   return requiredBelow && option.instrument_type === 'PE' && parseInt(option.strike) == requiredBelow;
});
/* let putOptions = niftyBankNiftyBeforeNearestExpiry.filter(option => {
   return requiredBelow && option.instrument_type === 'PE' && parseInt(option.strike) < requiredBelow;
}); */

// Sort options based on strike price


callOptions.sort((a, b) => parseInt(b.strike) - parseInt(a.strike));
putOptions.sort((a, b) => parseInt(b.strike) - parseInt(a.strike));

// Select the nearest option in each category
const callOptionAbove = callOptions.length > 0 ? callOptions[0] : null;
const putOptionBelow = putOptions.length > 0 ? putOptions[0] : null;
/* console.log(callOptions[callOptions.length-1]);
process.exit(); */

if (callOptionAbove) {
    selectedOptions.push(callOptionAbove);
}
if (putOptionBelow) {
    selectedOptions.push(putOptionBelow);
}

//console.log(selectedOptions,'sel options');

//console.log(indexInstrument,'nameToken',name,ltp,strikeAbove,strikeBelow);


})

//console.log(selectedOptions);
/* console.log("Call option above:", callOptionAbove);
console.log("Put option below:", putOptionBelow); */


 // Your array of selected options



// Initial call to popOption() to start the process



await popOption(selectedOptions,fullJson,accessTokenDoc);

console.log('here 158')





//const { exec } = require('child_process');

// Command to restart PM2 process

//await closeDatabaseConnection();
return;

//ltp(n/*  */ames[1])

            //console.log(con,"AccesTocken",lp,strikeAbove,strikeBelow,'hi',diff)
}




async function popOption(selectedOptions,fullJson,accessTokenDoc) {

   /*  return new Promise((res,rej)=>{


        res(true)

    }); */

    if(typeof selectedOptions=='undefined') return;


    let timer=setInterval(async ()=>{

        if (selectedOptions.length > 0) {

       
        
            const option = selectedOptions.pop();
          
    
       
           
    
          
            
           
         // try {
              await setPricePointsToInstrument( option, fullJson,accessTokenDoc);
      //console.log(c,'c');
       /*    } catch (error) {
            
    
            console.log('185 error')
          } */
    
           
    
          //console.log(pp);
    
            // Call popOption() recursively after 333 milliseconds
           
        } else {
    
            //fullJson 

          
            // Array is empty, reset the timer
           

            clearInterval(timer);
            console.log("Array is empty. Resetting timer.");

            const command = 'pm2 restart ./server.js';

// Execute the command
setTimeout(()=> {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    
    
    const command2 = 'pm2  save';
    exec(command2, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}
        
        \n
  LAST TIME EXECUTED',${Date()})
        
        
        `);
      });

      
    
},3*1000);

setTimeout(()=>{
  console.log(`LAST TIME EXECUTED',${Date()}`)

},5*1000)
            //disconnect();

            //return;
           // return;
           //clearTimeout(timer);
        }


    },500)


    console.log('236')
    return;
    
}





async function setPricePointsToInstrument( option, fullJson,accessTokenDoc) {

    
    return new Promise(async (resolve, reject) => {
        try {

            let pp=new pricePoints(option.instrument_token,accessTokenDoc);
    await  pp.initiateKiteConnect()
    console.log(option.instrument_token,'instru token inside seting function');
            let c = await pp.getPricePoints(7, 'day');
            option.pricePoints = c;
            option.SevenDayMaxMin = c.SevenDayMaxMin;

            option.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${option.tradingsymbol}/${option.instrument_token}`;
            option.selectedBuyingMethod = 'MAX';
            option.buyNow = false;

            option.noTradingNow=false;
            option.canTakeFreshTrade=true;
            

            console.log('pushing option', option.tradingsymbol);
            fullJson.push(option);
            console.log('new length', fullJson.length);

            //console.log(fullJson.length,'full json len',selectedOptions.length)
            writeJsonToFile(fullJson,'./appv3/public/instruments/instrumentsForMining.json')

            resolve(fullJson);
        } catch (error) {
            reject(error);
        }
    });
}

//main();

main();
 setInterval(()=>{
console.time('start')
   main();
   console.timeEnd('start')
//disconnect()
},30*60*1000) 
//disconnect();