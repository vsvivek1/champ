"use strict";
const TIMER=501;
require('dotenv').config({path:'../../findiserver/.env'});

let moment=require('moment');
const mongoose=require('mongoose');
let AccesTocken=require('../models/AccessTokens');
const { writeFinalScriptsTofile } = require('./writeFinalScriptsTofile');



// {path:__dirname+'/./../'}

// import {getStockPricePoints,
//     getLevels,
//     getGTTS,
//     deleteGTT,
//     mutateWithLtp,
//     startSockets,
//     getPercentage,
//     getCurrentGttList,
//     getCurrentTick,
//     getStocksPricePointsFiltered,
//     getUpperShadowGreaterThanBody,
//     getReds,
//     getGreens,
//     getGttAmountPerManualOrder,
//     getStockPricePointsLoader,} from '../appv3/src/components/gttComponent.js'
class Gtt {

    constructor() {


        this.instruments=require('../appv3/public/instruments/instrumentsAll.json');

     let tmp =this.getGttStocks();
        this.stocks=tmp  .slice(1,100)

        this.accessToken;

    }

    getGttStocks() {

        

   
        
        return this.instruments.filter(f=>
            f.exchange == 'NSE')
        
        .map(i=>i.instrument_token).filter((stock,index,arr)=>{

   
            return arr.indexOf(stock) == index

        })            
        .sort((a,b)=> a-b ).
        filter(f=>!(f.includes('NIFTY')||f.includes('BANKNIFTY')))

    }


  async  getPricePointsOfStocks(){




let result=[]

  
        return new Promise(async (res,rej)=>{

// try {
                const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
                let mongo=await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
                
                
                let today= moment().format('Y-MM-DD');
                let at1  = await AccesTocken.
                findOne({ 'date': today },'access_token').then(e=>e.access_token);
        
        
          
            
                this.accessToken=at1;      
        
        console.log(at1,'ACCEESS TOKEN',today)
        
    
            
            let pricePoint=require('./../pricePoints');
            let nse1=require('./../nifty.json');
            let nifty=nse1.data.map(n=>n.symbol)
    
            
    
    
    
        let ln=this.stocks.length;
    
    
       
    let count=1;
    
    
    
    if(true){
        let t=setInterval(async ()=>{
    
    
    
            
            var stock=this.stocks.pop();
    
            if(typeof stock == 'undefined' ){
    
                res(result);
                clearInterval(t);
                writeFinalScriptsTofile(result);
                return ;
            }
    
            console.log(count ,' of ',ln)
            count++;
    
            let instrument=this.instruments.
            filter(i=>i.instrument_token
                 == stock)[0];
    
    
                let tradingsymbol=instrument.tradingsymbol;
    
                // console.log(stock,'stock',this.accessToken);
    
            let pp=new pricePoint(stock, this.accessToken);
    
            // pp.initiateKiteConnect();
            pp.initiateKiteConnect();
            
    
           try {
             let pp2=await pp.getPricePoints()
             instrument.pricePoints=pp2

             console.log(pp2);

            //  instrument.pricePoints.forEach(r1 => {
            //     const supportLevels = getLevels(r1);
            //     r1.supportLevels = supportLevels;
            //   });


           } catch (error) {

            console.error(error,'some error @131')
            return;
            
           }
    
            if(nifty.includes(tradingsymbol)){
                instrument.group='NIFTY'
    
            }
    
    
            result.push(instrument);
    
    // console.log(pp2)
    
        },TIMER)
    
    
    }
} 



    

    )



}

}



  try {
    // const element = array[index];
    (async () => {
    // Assuming Gtt class is defined
    let n = new Gtt();

    // Check if the method exists before calling it
    if (typeof n.getGttStocks === 'function') {
        let n2 = n.getGttStocks();
        console.log(n2);

        // Assuming getPricePointsOfStocks is an asynchronous method, use async/await
        await n.getPricePointsOfStocks();


    } else {
        console.log('getGttStocks method not found on the instance');
    }

})();

} catch (e) {
    console.log('GETTING SOME ERROR', e);
}



// console.log(n2)


//  module.exports = Gtt;;