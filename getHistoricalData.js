
require('dotenv').config()
// require('dotenv').config()


let pricePoint=require('./pricePoints.js');




async function  ExeCPriceFunction(){

    let a=new pricePoint('138396420');
    let c=await a.getPricePoints();
    console.log('c',c)
    
        

}


ExeCPriceFunction();


// console.log('pp',pp)
return;


// dotenv.config();
var KiteConnect = require("kiteconnect").KiteConnect;

// console.log('env',process.env.api_key)
// console.log('ACCESS_TOCKEN',process.env.ACCESS_TOCKEN)
// return false;

// let api_key=process.env.api_key;
const api_key = 'wkcurst2vu5obug7'
let access_token=process.env.ACCESS_TOCKEN;

var kc2 = new KiteConnect({
    api_key: api_key,
    access_token: access_token
  });
// instruments

function dateBforeXMonths(monthsToAdvance){

    var d = new Date();
d.setMonth(d.getMonth() - monthsToAdvance);

return d.toISOString().slice(0, 10);
}

function today(){
    var d = new Date();
    return d.toISOString().slice(0, 10);
}




function getXmonthMaximum(arr,mon1){

     

    let mon=(mon1-1)*71;
let XmonthData=arr.slice(global.globalPrevious,mon)

console.log('previous',global.globalPrevious)
// console.log('len',XmonthData);
let maxValue=Math.max.apply(Math, XmonthData.map(function(o) { return o.high; }))

let max=arr.filter(a=>a.high == maxValue)[0];

global.globalPrevious=mon1;
return max;

}
function getXmonthMinimum(arr,mon1){

   
    let mon=(mon1-1)*7;
let XmonthData=arr.slice(global.globalPreviousMin,mon)

// console.log('previousMin',global.globalPrevious)
// console.log('len',XmonthData);
let minValue=Math.min.apply(Math, XmonthData.map(function(o) { return o.low; }))

let min=arr.filter(a=>a.low == minValue)[0];

global.globalPreviousMin=mon1;
return min;

}


// let d1=dateBforeXMonths(3);
// console.log(d1);
// return;

//1 month 3 month 1, 1, 2, 3, 5, 8, 13 ,21,34,56,90




  kc2.getHistoricalData('138396420','day',dateBforeXMonths(34),today(),false).then(res=>{




  let sorted=  res.sort((a,b)=>{


     return  new Date(a.date )- new Date(b.date)
    });




    let len=sorted.length;
    let first=sorted[0];

    let v=getXmonthMaximum(sorted,2)
global.globalPrevious=0;
let st=new Set();


    for(i=2;i<90;i++){

        let ob={};
        ob.date=getXmonthMaximum(sorted,i).date;
        ob.high=getXmonthMaximum(sorted,i).high;
        
       let a= JSON.stringify(ob);

    //    console.log(ob.date,ob.high)

       st.add(a)

    //    console.log(a);

    }
    let stMin=new Set();
    global.globalPreviousMin=0;
    
    for(i=2;i<90;i++){

        let ob={};
        ob.date=getXmonthMinimum(sorted,i).date;
        ob.low=getXmonthMinimum(sorted,i).low;
        
       let a= JSON.stringify(ob);

       stMin.add(a)

    //    console.log(ob.date,ob.low)

    }


    // console.log('maxes',i,getXmonthMaximum(sorted,i).date,getXmonthMaximum(sorted,i).high)

    Array.from(st).forEach(s=>{

        console.log('maxes',JSON.parse(s))
    })
    
    Array.from(stMin).forEach(s=>{

        console.log('stMin',JSON.parse(s))
    })
    


  }).catch(err=>{

    console.log('error',err)
  })


  kc2.getInstruments('NSE').then(res=>{


let idea=res.filter(r=>{
    
    r.instrument_type == 'EQ' && r.last_price>5
})

    console.log('get instruments',idea)
  })

//   console.log('this is kc2',)