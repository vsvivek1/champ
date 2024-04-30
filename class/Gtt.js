"use strict";
const TIMER=333;
require('dotenv').config({path:'../../findiserver/.env'});

let moment=require('moment');
const mongoose=require('mongoose');
let AccesTocken=require('../models/AccessTokens');
const { writeFinalScriptsTofile } = require('./writeFinalScriptsTofile');

let axios=require('axios');


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


// const axios = require('axios');

// const axios = require('axios');

async function getIndexStocks() {
    try {
        const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20MIDCAP%2050',
  headers: { 
    'Cookie': 'ak_bmsc=934BE0192CC9F8D49910D040C2D9C13F~000000000000000000000000000000~YAAQdSdzaOjj72GNAQAA2Q6VhBZ3Pj8Hso42SsTP6u5dQxOa9K5BxPHqKxjmEAZzOUGgxk4HpAmVt3PRhgGSQj4lBPTj5s97DXuzibPw6ray67xp2VlWi9OpJ/BYzFozkuBS8Q40I3p990L4PW9CNcP96a7b2JFLdlue8UaIjAtbKmpxqySCKHMej2f11hhbsc+IiNbAUhRl+SLeoosTgYmB0Y9TaCMFG7sRG0xKogHzpFAPwhl3DHj2nda+9o5eH9vAcsXtotiV62R3yhAiqYeMUFjQ84hQ9l9Ds+1FzpwaesC/UXJC9Nm1Qs0DjdUFbZKX55lUl9s9GFs50cvCjZZ1zbekKf0JQZbqwdM+mFmmCRmfMX4sTa+LP9/s5w==; bm_sv=B3FA0B05B962A4F6807ED09662013347~YAAQxfY3F+OvhVaNAQAAdReqhBa9MK8JJ7ZAx1/pMveAvn6pVabshtehnD2LPAN4caX8uDl0Kwl/U2AcqHGnN1FE2bVR426+/L2M+UQWCr4BXyBcfHWC7D99fP1KNTGOUdCUDe0fp+YqB0eScA+577hcKtdbULM39eGlbMB7EzCS27WawTtgl7MaZlgHMUk/telpYX8Z5uRIVqKqhcOH4W5n400fFJImJ6PASK1t5aiaI0aWizRd3BP6BQ20kgrQseo=~1'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

}catch(e){

    
}
}

// Call the function
// getIndexStocks()



// getIndexStocks();

// process.exit();

class Gtt {

    constructor() {


        this.instruments=require('../appv3/public/instruments/instrumentsAll.json');

     let tmp =this.getGttStocks();
        this.stocks=tmp  //.slice(1,100)

        this.accessToken;

    }
    getStocksTradingSymbolname(stock){

return this.instruments.find(i=>i.instrument_token==stock).tradingsymbol

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
            // let nse1=require('./../nifty.json');
            
            
           // let nse1=require('../indexComponents/Fo.json');
            let nse1=require('../indexComponents/NIFTY500MULTICAP.json');
            let nifty=nse1.map(n=>n.trading_symbol)
            // let nifty=nse1.data.map(n=>n.trading_symbol)

          
    
            
    
    let filtredStocks=this.instruments.filter(i=>nifty.includes(i.tradingsymbol)).map(j=>j.instrument_token);

    // console.log(filtredStocks);

    // return
    
    // console.log(nifty,stock,this.getStocksTradingSymbolname(stock));
    
        // let ln=this.stocks.length;
        let ln=filtredStocks.length;
    

    
       
    let count=1;
    
    
    
    if(true){
        let t=setInterval(async ()=>{
    
    
    
            
            // var stock=this.stocks.pop();
            var stock=filtredStocks.pop();

            // console.log(stock);
            // return;

            
            // return;
            // exit;
    
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
    
    

                //  console.log(instrument);

                //  return;
                let tradingsymbol=instrument.tradingsymbol;
    
                // console.log(stock,'stock',this.accessToken);
    
            let pp=new pricePoint(stock, this.accessToken);
    
            // pp.initiateKiteConnect();
            pp.initiateKiteConnect();
            
    
           try {

            let pp2=null
            try {
                 pp2=await pp.getPricePoints()
            } catch (error2) {

                console.log(error2,'error2')

                return;
                
            }
             instrument.pricePoints=pp2

            //  console.log(pp2);

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