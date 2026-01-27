



import { getTodaysAccessToken } from './../../getTodaysAccessToken.js';
import { dirname, join } from 'path';


import  mongoose from 'mongoose';

import { getKiteConnectInstance } from './../../getKiteConnectInstance.js';

import { promises as fs } from 'fs';
//const restartPM2Process = require('./restartPM2Process');
const scriptDirectory  =  dirname( process.argv[1] );
const FILE_LOCATION  =  join( scriptDirectory, 'appv3', 'public', 'instruments' );


async function writeJsonToFile(jsonData, fileName) {
    try {
        // Convert JSON object to string
        const jsonString = JSON.stringify(jsonData, null, 2); // null, 2 for pretty formatting

        // Write JSON string to file
        await fs.writeFile(fileName, jsonString);

        

        //console.log('JSON data has been written to', fileName);

      

        return;
    } catch (err) {
        console.error('Error writing JSON to file:', err);

        return;
    }
}

import pricePoints from '../../pricePoints.js';

function filterByName(jsonArray, names = ['NIFTY', 'BANKNIFTY']) {
   return jsonArray.filter(item => names.includes(item.name));
}







import nifty500 from './nifty500.json' assert { type: "json" };;

async function connectToDatabase() {
    try {
        const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
      

       // console.log(uri)
        mongoose.set('strictQuery', true);
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        return true; // Indicate successful connection
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
        return false; // Indicate failure in connection
    }
}

async function main() {

  let outPut=[]
  const isConnected = await connectToDatabase();
  if (!isConnected) {
      console.error("Failed to connect to MongoDB. Exiting...");
      return;
  }


  const kite =await  getKiteConnectInstance();

 var accessTokenDoc=await getTodaysAccessToken();
  console.log('hi')
  
  await popOption(nifty500,outPut,accessTokenDoc);
   ///console.clear();
 



}




async function popOption(selectedOptions,foutPut,accessTokenDoc) {




    if(typeof selectedOptions=='undefined') return;

  

    let timer=setInterval(async ()=>{

        if (selectedOptions.length > 0) {

       
        
            const option = selectedOptions.pop();
          
    
       
            //console.log(option)
           
    
          
            
           
    
             await setPricePointsToInstrument( option, foutPut,accessTokenDoc);
      
        } else {
    
      
           

            clearInterval(timer);
      
    ;
        }


    },500)


  //  console.log('236')
    return;
    
}





async function setPricePointsToInstrument( option, foutPut,accessTokenDoc) {

    
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
            option.hasStartedGetOrders=false
            option.hasStartedGetLivePositions=false
            option.refreshingTradeStatus=false
            option.hasLiveTarget =false
            option.hasLivePosition =false
            option.hasLiveOrder=false;
            

            console.log('pushing option', option.tradingsymbol);
            foutPut.push(option);
            console.log('new length', foutPut.length);

            //console.log(foutPut.length,'full json len',selectedOptions.length)
           // writeJsonToFile(foutPut,'./appv3/shared/instruments/instrumentsForMining.json')
            writeJsonToFile(foutPut,'./niftyTrading.json')
            

            resolve(foutPut);
        } catch (error) {
            reject(error);
        }
    });
}

main();

