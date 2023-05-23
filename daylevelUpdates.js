// module.exports
let getAccessToken = require("./common-functions/getAccessToken"); 
let api_key=process.env.api_key;
dayLevelUpdates();

async function  dayLevelUpdates()
{


    const fs = require("fs");
    const instruments = require("./appv3/public/instruments/instrumentsForMining.json");

    // console.log(instruments.length);

    // return;

    let instrument_tokens=instruments.map(i=>JSON.parse(i.instrument_token));


    let ln=instrument_tokens.length;
    let itrations=Math.ceil(ln/2000);

    // console.log(ln,itrations)
    // return


    var KiteConnect = require("kiteconnect").KiteConnect;
    // let api_key=process.env.api_key;
    const api_key = 'wkcurst2vu5obug7'
     api_key='wkcurst2vu5obug7'
    ob={}


    //get accesss token



    let access_token= await getAccessToken();

    console.log(api_key);

  
    var kc = new KiteConnect({
      api_key: api_key,
      access_token: access_token
    });

try {
    
let fullQuote={}

let ins=[...instruments]

for (let k=0;k<itrations;k++){

    let items=ins.slice(1,2000);


    let quotes=await  kc.getQuote(items);
    
    Object.assign(fullQuote,quotes);

    ins.splice(1,2000)


}

     

    console.log(instrument_tokens.length,  Object.keys(fullQuote).length);

    return;
    //   console.log(quotes);

    instruments.forEach(i=>{

let q=quotes[i.instrument_token];

// console.log(q);

let date=new Date();
let hr=date.getHours();


i['d0'+hr]=q;

console.log(i['d0'+hr]);

    })


    
} catch (error) {
    console.log(error)
}
    /// get quottes



    //updates





    return ob
}