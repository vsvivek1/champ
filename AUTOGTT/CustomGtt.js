require('dotenv').config({ path: '../.env' }); // // Load environment variables from .env file
const KiteConnect = require("kiteconnect").KiteConnect;
let pricePoint=require('./../pricePoints');
var path  =  require( 'path' );
const fs = require('fs').promises;
var KiteTicker = require("kiteconnect").KiteTicker;
console.clear();

const TIMER=333;

const getAccessToken = require("../common-functions/getAccessToken");

class CustomGTT {
  constructor() {
    this.api_key = process.env.api_key; // Accessing API_KEY from .env
    this.access_token = null;
    this.kc = null;
    this.instruments = null;
    this.holdings=null;
    this.ticker=null;
    this.tokens=null;
    this.targets=[];
  }

  async initialize() {
    try {
      this.access_token = await getAccessToken();
      if (!this.access_token) {
        console.error("Access token is undefined.");
        return;
      }
      
      this.kc = new KiteConnect({
        api_key: this.api_key,
        access_token: this.access_token
      });

      this.ticker = new KiteTicker({
        api_key: this.api_key,
        access_token: this.access_token
      });

      const instrumentsFilePath = path.resolve(__dirname, '../appv3/public/instruments/instrumentsAll.json');
      const instrumentsData = await fs.readFile(instrumentsFilePath, 'utf8');
      this.instruments = JSON.parse(instrumentsData);
    //   console.log(this.instruments,'kkk')
    } catch (error) {
      console.error("Error occurred while initializing:", error);
    }
  }
  async processStocks() {

   let  filtredStocks=[...this.holdings].slice(1,5)//.map(i=>i.instrument_token);
    let result = [];
    let count = 1;
    const ln = filtredStocks.length;

    const t = setInterval(async () => {
      const stock = filtredStocks.pop();

      if (typeof stock === 'undefined') {
        clearInterval(t);
        console.log("Processing finished.");
        // console.log(this.holdings);
        this.checkSellPrice();

        console.log('total ',result.length)
        // Do something with the result, e.g., write to file
        // res(result);
        // writeFinalScriptsTofile(result);
        return;
      }

      console.log(count, ' of ', ln);
      count++;

      var holding = this.holdings.filter(i => i.instrument_token === stock.instrument_token)[0];

      
    //   const instrument = stock;

      if (!holding) {
        console.error(`Instrument not found for token ${stock}`,stock);
        return;
      }

    //   let tradingsymbol = instrument.tradingsymbol;

      let pp = new pricePoint(stock.instrument_token, this.access_token);
    //   pp.initiateKiteConnect();

      try {
        let pp2 = await pp.getPricePoints();
        // console.log(pp2,'pp2')
        holding.pricePoints = pp2;

       
      
      
    
      } catch (error) {
        console.error(error, 'some error @131');
        return;
      }

   

      result.push(holding);
    }, TIMER);
  }


  setPricePoints(){
    // console.log(this.holdings,'h')
    // console.log(this.instruments,'his.instruments')
    // this.holdings.forEach((h=>{

        
    //     // console.log(this.instruments,'his.instruments')

      

    //     h.pricePoints=this.instruments.find(i=>
    //         // console.log(h.instrument_token,i.instrument_token,'it')
    //          i.instrument_token==h.instrument_token
        
            
    //         ).pricePoints
            
    //         // .pricePoints;
        
    //       console.log(h.pricePoints,'hpp')

    // }))

  }
  async getHoldings(refPrice) {
    try {
      if (!this.kc) {
        console.error("KiteConnect instance is not initialized.");
        return;
      }
    this.holdings = await this.kc.getHoldings();

    this.tokens=this.holdings.map(h=>h.instrument_token);

    




    //   console.log("Holdings:", holdings);
    } catch (error) {
      console.error("Error occurred while fetching holdings:", error);
    }
  }

  getLevels( stockPpItem,refPrice ){ 

    let ar = stockPpItem.pricePoints//.pricePoints;
    
    //  console.log(stockPpItem);
    // process.exit()
    
    
    if (
        !stockPpItem
      ) {
        console.log('undefined loop',stockPpItem)
        return false;
      }
    
    
    
    
    // let refPrice = stockPpItem.pricePoints.d1.close;
    
    return ar.map( r =>r.high || r.level
     ).sort(( a,b ) =>a-b ) 
      .map(( r,index,ar ) =>{ 
    
    
    
    if( typeof ar[index+1] == 'undefined' ){ 
    
    
     let ob = {  } 
     ob.level = r;
    ob.support = false;
    
    return ob
    
     } else{ 
    // upperlevelCheck = refPrice<= ar[index+1]
    
    if( ar[index-1]<= refPrice && ar[index+1]>= refPrice && ar[index]<= refPrice ){ 
    
     let ob = {  } 
     ob.level = r;
    ob.support = true;
    
    return ob;
    
     } else{ 
     let ob = {  } 
     ob.level = r;
    ob.support = false;
    
    return ob;
     } 
     } 
     }  )
    
    
    
                 }
async checkSellPrice(){

   
console.log('hi',this.holdings.length,this.instruments.length)
    this.holdings.map(h=>{


    // let i=    this.holdings.find(i=>i.instrument_token==h.instrument_token);

    let pp=h.pricePoints;


if(typeof pp !='undefined'){

    
  let ob= this.getLevels (pp,h.average_price)

  if(ob!=false){

let levels=ob.map(o=>o.level).filter(k=>k>h.average_price*1.05);
   
let target={};
target.tradingsymbol=h.tradingsymbol;
target.instrument_token=h.instrument_token;
target.levels=levels;

this.targets.push(target)

// console.log(levels);

    // process.exit();
  }
    
// h.exitPrices=

}
    

    // console.log(this.holdings.find(i => i.instrument_token === stock.instrument_token));
    // process.exit();

    // pp.filter(pp=>pp.)

    })


}

onTicks(ticks) {
    console.log('ontock',this.targets)
    if(typeof this.targets=='undefined' || this.targets.length==0) return;

   let s= ticks.filter(t=>t.instrument_token=this.targets.instrument_token);

   console.log(s,'yes')

//   console.log("Ticks", ticks);
}

async subscribeTokens(){

    console.log('subscribe')
 this.ticker.on("connect",()=>{
    console.log('subscribe inside',this.tokens)
    this.ticker.subscribe(this.tokens);
    this.ticker.setMode(this.ticker.modeFull, this.tokens);

    this.ticker.on("ticks", this.onTicks);

 

   } );
   

}
  async startWebSockets(){
    this.ticker.connect();
    






//   var items = [738561];
  



  }


}




// Example usage:
(async () => {
  const gtt = new CustomGTT();
  await gtt.initialize();
  await gtt.getHoldings();
 await gtt.processStocks();
 await gtt.startWebSockets();
 await gtt.subscribeTokens()
  
})();
