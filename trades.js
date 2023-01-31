const fs = require('fs')

const ObjectsToCsv = require('objects-to-csv')

let instruments=require('./appv3/public/instruments/instrumentsForMining.json');

const mongoose=require('mongoose');
const Path = require('path')
const Axios = require('axios');
let AccesTocken=require('./models/AccessTokens');
require('dotenv').config()

const api_key=process.env.api_key;

const TIMER=500;
var KiteConnect = require("kiteconnect").KiteConnect;

let today = new Date().toISOString().slice(0, 10);
async function main(access_token){

    var kc = new KiteConnect({
        api_key: api_key,
        access_token: access_token
      }); 
    
  //  let  erroroutFile='./actutalTrade-'+'2022-04-22'+'.text';
    let a= await  kc.getTrades()




let a2=a.map(i=>i.tradingsymbol)


let b2=a2.map(element => {
    
let b= a.filter(i=>i.tradingsymbol==element);



let tmp=[...a.filter(j=>j.tradingsymbol!=element)];

console.log(a.length)
a=[...tmp];
return b;

});

    // console.log(b2.length,'a2');

}


function success(){

  instruments.
  
  
  
  forEach(a => {
    
    let gain=a.pricePoints.d1.high-a.pricePoints.d2.high

    if(gain>0){

      a.pricePoints.d1.gain=gain;
      a.pricePoints.d1.pc=gain*100/a.pricePoints.d2.high;

    }

    else{
      a.pricePoints.d1.gain=0
      a.pricePoints.d1.pc=0;

    }
 


    if(gain>0){


      let loss=a.pricePoints.d2.high-a.pricePoints.d1.low

      if(loss>0){
  
        a.pricePoints.d1.loss=loss;
        a.pricePoints.d1.lpc=loss*100/a.pricePoints.d2.high;
      }else{
  
        a.pricePoints.d1.loss=0
        a.pricePoints.d1.lpc=0
  
      }


    }

   
 
// if(a.pricePoints.d1.lpc!=0)
// console.log(a.pricePoints.d1.lpc)

  });



  // return 

  // a.pricePoints.d1.lpc>0 &&

  
let s = instruments.filter(a=>{

return   a.pricePoints.d1.gain>0 &&
a.pricePoints.d1.open<a.pricePoints.d2.high



&& a.pricePoints.d1.low<a.pricePoints.d2.low

  })

  // console.log(s.length)
  console.log(s.
    
    sort((b,a)=>b.pricePoints.d1.lpc-a.pricePoints.d1.lpc).
    
    
    
    map(a=>
    {

      let o={}

      o.tradingsymbol=a.tradingsymbol;
      o.high=a.pricePoints.d2.high;
      o.pc=a.pricePoints.d1.pc;
      o.lpc=a.pricePoints.d1.lpc;

      return o

    }

    

    

    
    )
    
    
    
    )
}


const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{

  AccesTocken.findOne({ 'date': today  },'access_token').then(e=>{  
  let  access_token=e.access_token;
    // let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';
  

    // main(access_token)
    // main(access_token)

    success()
    // getHoldingInstruments(access_token)

  });
               
   ;
  

});
