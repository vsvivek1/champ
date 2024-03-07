require('dotenv').config({ path: '../.env' }); // // Load environment variables from .env file
const KiteConnect = require("kiteconnect").KiteConnect;
let pricePoint=require('./../pricePoints');
var path  =  require( 'path' );
const fs = require('fs').promises;
var KiteTicker = require("kiteconnect").KiteTicker;
console.clear();

const TIMER=333;

const getAccessToken = require("../common-functions/getAccessToken");

module.exports=class CustomGTT {
  constructor() {
    this.api_key = process.env.api_key; // Accessing API_KEY from .env
    this.access_token = null;
    this.kc = null;
    this.instruments = null;
    this.holdings=null;
    this.ticker=null;
    this.tokens=null;
    this.targets=[];

    this.orders=[]

    const now = new Date();
    this.hours = now.getHours();
  this.minutes = now.getMinutes();
  this.seconds = now.getSeconds();

  this.day=now.getDay();
        // Extract hours and minutes
        
        setInterval(()=>{

          const now = new Date();
          this.hours = now.getHours();
        this.minutes = now.getMinutes();
        this.seconds = now.getSeconds();



        },1*1000)

        
  }

  async initialize() {
    try {
      this.access_token = await getAccessToken();
      if (!this.access_token) {
        console.error("Access token is null or undefined.");
        return; // Stop further initialization if access token is not available
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

   let  filtredStocks=[...this.holdings]//.slice(1,5)//.map(i=>i.instrument_token);
    let result = [];
    let count = 1;
    const ln = filtredStocks.length;

    const t = setInterval(async () => {
      const stock = filtredStocks.pop();

      if (typeof stock === 'undefined') {
        clearInterval(t);
        console.log("Processing finished.");
        // console.log(this.holdings);
       await  this.checkSellPrice();

        console.log('total Holdings',result.length)

      /*  

        console.log('created orders',a) */
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

async placeOrder(instrument,next){
await this.getHoldings();

let variety;


let holding=this.holdings.filter(h=>h.instrument_token==instrument.instrument_token)[0];

//console.log(holding,'holding')

if(
  this.hours>15 && this.hours<9
  || (this.hours==15 && this.minutes>30) || (this.hours==9 && this.minutes<15)

  
  ){

    variety='amo'

  }else{
    variety='regular'

  }


  let params={};
  params.quantity=holding.quantity;

  params.exchange=holding.exchange
  params.product='CNC';
  params.order_type='LIMIT'
  params.tradingsymbol=holding.tradingsymbol;
  params.transaction_type='SELL';
  params.price=next;

//let qty=holding.quantity;

try {

  console.log(params,variety);

  //return;
  let r=await this.kc.placeOrder(variety,params);
  console.log(r);
} catch (error) {
console.error('KC error',error)


}


}


async getOrders(){

  this.orders=await this.kc.getOrders();

  console.log(this.orders)

}

async createTargetOrders(){


  this.targets.forEach(async (t)=>{


    console.log('1')
  //let  s= ticks.filter(t2=>t.instrument_token==t2.instrument_token)[0];

   // if(typeof s=='undefined') return;

    let instrument=this.instruments.find(i=>i.instrument_token==t.instrument_token);

    let holding=this.holdings.find(h=>h.instrument_token==t.instrument_token)

    let avg=holding.average_price;


    let tradingsymbol=instrument.tradingsymbol;
    let placedOrder=instrument.placedOrder;


    
    //const rangePercentage = 5/ 100; // 0.25% expressed as a decimal


   /*  const lowerBound = s.last_price * (1 - rangePercentage);
    const upperBound = s.last_price * (1 + rangePercentage);
 */


    
    if(!placedOrder && typeof instrument.last_price!='undefined'){

      console.log('2')
     let next=t.levels.filter(level=>level>Max(avg*1.01,instrument_last_price))[0];



     try {
      let a=await this.placeOrder(instrument,next);
      instrument.placedOrder=true;
     } catch (error) {
      console.error(error,'error')
     }

   //  console.log(a,'a')
    }
    
    return;
    
    let a = t.levels.some(level => {


       
        //console.log('t.levels',tradingsymbol,'last_pri e is',s.last_price,'levels',t.levels,lowerBound )

        if(level >= lowerBound && level <= upperBound){

         console.log('t.levels',tradingsymbol,'last_price is',s.last_price,'lastPrice ranges',lowerBound,level,upperBound )
        }
   

        return level >= lowerBound && s.last_price <= level;
    });
    
    //console.log(a,);

  //console.log(a)

   // console.log('ontock',this.targets,s.last_price,'s','ticks')

 })
}


async onTicks(ticks) {



  

  if(this.seconds==30){
    
    console.log('Tick Working Time now is: ', this.hours,this.minutes,this.seconds)
    this.holdings.forEach(h=>{

    
    
      let tick= ticks.filter(t=>t.instrument_token==h.instrument_token)[0];
   
      if(typeof tick=='undefined'){

        console.log('no tick tick',tick)

        return;
      } 
   
      //console.log(tick)
   
      h.last_price=tick.last_price
   
      //console.log('h.last price',h.last_price)
   
     })

    await this.createTargetOrders();
  }

  
  
  let s
    if(typeof this.targets=='undefined' || this.targets.length==0) return;


    
   


  
   //console.log(s,'yes')

//   console.log("Ticks", ticks);
}

async subscribeTokens(){

    console.log('subscribe tokens')


 this.ticker.on("connect",()=>{
    console.log('subscribe inside',this.tokens)
    this.ticker.subscribe(this.tokens);
    this.ticker.setMode(this.ticker.modeFull, this.tokens);

    this.ticker.on("/*  */ticks", );
    this.ticker.on("ticks", (ti)=>{


     
      this.onTicks(ti)
     // console.log(ti)
    });

   

   } );
   

}
  async startWebSockets(){
    this.ticker.connect();
    






//   var items = [738561];
  



  }


}


/*  CustomGTT; */

// Example usage:

