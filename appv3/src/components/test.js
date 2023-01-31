let hourlyPricePointsofLiveDay1 =require("../../../appv3/public/instruments/hourlyCandleData.json");;

console.log(hourlyPricePointsofLiveDay1.length)
let t1=hourlyPricePointsofLiveDay1.filter(h=>h.prices.length==0).map(i=>i.instrument_token)

console.log(t1,'t1');

