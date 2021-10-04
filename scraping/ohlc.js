var KiteConnect = require("kiteconnect").KiteConnect;
require('dotenv').config()
const api_key=process.env.api_key;


async function ohlc(access_token,instrument_tokens){

    console.log('instrument token',instrument_tokens);

    // return ;
    // return false;
    var kc2 = new KiteConnect({
        api_key: api_key,
        access_token: access_token
      });

    //   console.log(kc2
    
    
    let instruments=[];


    instrument_tokens.forEach(element => {
        // let instrument="NSE:"+element;
        let instrument=element;
        instruments.push(instrument)
    });





// console.log(instruments)

     return  kc2.getOHLC(instruments)
     
//      .then(r=>{
// // console.log('r',r)
//         return r
//      })

}

module.exports=ohlc;