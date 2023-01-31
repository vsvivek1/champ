const HistoricalTick=require('./HistoricalTick');

async function getHistoricalTicks(){

let hs=new HistoricalTick('');
let a=await hs.updateAccessToken();

let access_token=hs.accessToken;
console.log('function statred with access token',access_token)
// let b=hs.getSymbolListFromInstruments();

 let hdata=await hs.downloadHistoricalData();


//  console.dir(hdata[0],'hdata')




}

getHistoricalTicks()