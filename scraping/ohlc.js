var KiteConnect = require("kiteconnect").KiteConnect;
require('dotenv').config()
// const api_key=process.env.api_key;
const api_key='wkcurst2vu5obug7'


async function ohlc(access_token,instrument_tokens){    var kc2 = new KiteConnect({
        api_key: api_key,
        access_token: access_token
      });

    
    let instruments=[];


    instrument_tokens.forEach(element => {
     
        let instrument=element;
        instruments.push(instrument)
    });






let ohl =await kc2.getOHLC(instruments)

     return  ohl
     


}

module.exports=ohlc;