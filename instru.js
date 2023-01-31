const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');

// let instru=require('./appv3/public/instruments/instrumentsForMining.json');
let instru=require('./appv3/public/instruments/instrumentsForMining.json');

let zero=require('./ZerodhaAPI');

const ohlc=require('./scraping/ohlc')
//let instru=require('./appv3/public/instruments/instrumentsMIS.json');

// console.log(instru)




async function main(){

    function today1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD')
    } 
    
    function yesterday1(){

        let moment=require('moment');
    
        return moment().format('Y-MM-DD').subtract(1,'days')
    }



    let today=today1();;


    // return ;
const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });

let access_token= await AccesTocken.findOne({ 'date': today },'access_token').then(e=>e.access_token);

let tradables=[];
instru.forEach(e=>{

if(e.name=='NIFTY') return false;

let body=Math.abs(e.pricePoints.yesterday.close-e.pricePoints.yesterday.open);
let candleColor=(e.pricePoints.yesterday.close-e.pricePoints.yesterday.open>0) ?'green':'red';
let upperShadow;
let lowerShadow;
if(candleColor=='green'){
upperShadow=e.pricePoints.yesterday.high-e.pricePoints.yesterday.close;
lowerShadow=e.pricePoints.yesterday.open-e.pricePoints.yesterday.low;

}else{
upperShadow=e.pricePoints.yesterday.high-e.pricePoints.yesterday.open;
lowerShadow=e.pricePoints.yesterday.close-e.pricePoints.yesterday.low;

}



// let candleRangeYesterday;



// && lowerShadow>body
let ob={body,upperShadow,candleColor}

// && e.pricePoints.d1.range< e.pricePoints.d2.range
if( candleColor=='green'  && upperShadow*4<body && e.pricePoints.d1.range< e.pricePoints.d2.range ){

tradables.push(e.instrument_token)
// console.log(e.tradingsymbol,'tradable','body',ob)
}

})


let ohlcs=await ohlc(access_token,tradables);



// let ohl =await kc2.getOHLC(instruments)


let breakouts=[];

let percentages=[]
Object.keys(ohlcs).forEach(e=>{

let tradingsymbol=  instru.filter(i=>i.instrument_token==e)[0].tradingsymbol;
let chart=  instru.filter(i=>i.instrument_token==e)[0].chart;
let yesterdayHigh=  instru.filter(i=>i.instrument_token==e)[0].pricePoints.d1.high;

// console.log(e)

let todayHigh=ohlcs[e].ohlc.high;
ohlcs[e].tradingsymbol=tradingsymbol
ohlcs[e].chart=chart;

if(todayHigh>yesterdayHigh){
    ohlcs[e].breakoutDiff=todayHigh-yesterdayHigh;
    ohlcs[e].breakoutPc=(todayHigh-yesterdayHigh)*100/yesterdayHigh;
    percentages.push(ohlcs[e].breakoutPc)
    breakouts.push(ohlcs[e])
}

})


//  console.dir(breakouts.sort((a,b)=>a.breakoutPc-b.breakoutPc),breakouts.length,Object.keys(ohlcs).length);
// console.log(Math.max(...percentages),'min',Math.min(...percentages),'avg',percentages.reduce((a, b) => a + b, 0) / percentages.length));

// return false;






let tradables1=[32450562]

let accessToken=access_token;
console.log(tradables.length)
let a = await zero.getQuoteFromZerodha (accessToken,tradables)



let losers=[];
let gainers=[];

let totProf=0;
Object.keys(a).forEach(e=>{

// console.log(e)

let last_price=a[e].last_price;
// console.log(last_price)


let ob=instru.filter(i=>i.instrument_token==e)[0];


if(last_price>ob.pricePoints.yesterday.high )
{
let prof=(last_price - ob.pricePoints.yesterday.high)*ob.lot_size
// console.log(ob.tradingsymbol)
// let sym=

totProf=totProf+prof;

let g={}
g.tradingsymbol=ob.tradingsymbol;
g.chart=ob.chart;
g.gainOverBreakOut=last_price-ob.pricePoints.yesterday.high;
g.gainOverBreakOutperLot=(last_price-ob.pricePoints.yesterday.high)*ob.lot_size;
g.gainOverBreakOutperGainPc=(last_price-ob.pricePoints.yesterday.high)*100/ob.pricePoints.yesterday.high;
gainers.push(g)

}else{

let loss=( ob.pricePoints.yesterday.high-last_price )*ob.lot_size

totProf=totProf-loss
let g={}
g.tradingsymbol=ob.tradingsymbol;
g.loseOverBreakOut=last_price-ob.pricePoints.yesterday.high;
g.loseOverBreakOutperLot=(last_price-ob.pricePoints.yesterday.high)*ob.lot_size;
g.loseOverBreakOutperGainPc=(last_price-ob.pricePoints.yesterday.high)*100/ob.pricePoints.yesterday.high;
g.chart=ob.chart;
losers.push(g)

}




})




console.log(gainers.sort((a,b)=>b.gainOverBreakOutperGainPc-a.gainOverBreakOutperGainPc),'out')
//   console.log(losers.sort((a,b)=>b.gainOverBreakOutperGainPc-a.gainOverBreakOutperGainPc),'out')
// instru.forEach(e=>{

// // console.log(a)

// let last_price=a[e.]
// console.log(last_price)

// })

console.log('losers', losers.length,'gainers',gainers.length,'ratio' ,
gainers.length/losers.length,'profit',totProf)


}


main();

// date();







// var shell = require("shelljs");

// shell.exec("echo shell.exec works");
// shell.exec("cd findiapp/");
// shell.exec("ls");
// shell.exec("pwd");