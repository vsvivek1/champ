const  hourlyPricePointsofLiveDay = require("./appv3/public/instruments/instrumentsForMining.json");
const  instruments = require("./appv3/public/instruments/instrumentsAll.json");



// let a=instruments.filter(r=>r.instrument_type=="FUT" && r.exchange=="MCX"  && r.expiry.includes('2023-01-31')).map(i=>i.expiry)


// console.log(a)
// console.log(instruments.pricePoints.quote)

let i=require("./appv3/public/instruments/hourlyCandleData.json")



function isZeroVolumeCandle(tradingsymbol){
    // filter(i1=>i1.tradingsymbol==tradingsymbol)[0]
let prices=i.filter(item=>{

  return  item.prices.map(k=>k.volume).filter(j=>j==0).length<2;

})

// .map(i=>i.instrument.tradingsymbol).sort((a,b)=>a-b)

//.length






console.log(prices,'p')


}
let tradingsymbol='CROMPTON22DEC375CE';

isZeroVolumeCandle('CROMPTON22DEC375CE')

