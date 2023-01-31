var KiteConnect = require("kiteconnect").KiteConnect;
const mongoose = require('mongoose');
const con = require('./MongoseConnect')

const pricePoint = require('./pricePoints');
const api_secret = process.env.api_secret;
const api_key = process.env.api_key;
require('dotenv').config();

const Fs = require('fs')
const ZerodhaAPI = require('./ZerodhaAPI');

let today = new Date().toISOString().slice(0, 10);

const instrumentsForMining = require('./appv3/public/instruments/instrumentsForMining.json');
// const { setInterval } = require("timers/promises");

var totalTime1=0;
// module.exports = 
class HourlyData {

    constructor(accessToken='wbVwUGoQ3CKJwBFjhU1Nu9wF4ADhTfmg') {
        
this.accessToken=accessToken;
this.totalTime=0;



    }




 getZeroVolumeCandleScripts(jsonObj2){
   

    console.log('Whole instruments length',jsonObj2.length)
        let prices=jsonObj2.filter(item=>{
        
          return  item.prices.map(k=>k.volume).filter(j=>j==0).length<2;
        


        })
        
        console.log('Zero candles filteted length instruments length',prices.length)
        return prices
        // .map(i=>i.instrument.tradingsymbol).sort((a,b)=>a-b)
        
        //.length
        
        
        
        
        
        
        // console.log(prices,'p')
        
        
        }


async  getHoldingInstruments(access_token) {


    try {
  
      var kc = new KiteConnect({
        api_key: api_key,
        access_token: access_token
      });
  
      let pos = await kc.getPositions();
      // console.log(pos)
  
  
  
  
      // const inquirer = require('inquirer')
  
      //     var questions = [
      //       {
      //         type: 'input',
      //         name: 'name',
      //         message: "What's your name?"
      //       }
      //     ]
  
      //     inquirer.prompt(questions).then(answers => {
      //       console.log(`Hi ${answers['name']}!`)
      //     })
  
      return pos.net.filter(a=>a.quantity!=0).
      
      map(p => p.tradingsymbol )
      // console.log((pos))
  
    } catch (error) {
      console.log('error', error)
    }
  
  
  
  
  }
  


         overnightScripts(jsonObj2, jsonObjWithOutCriteria,access_token) {


            return new Promise(async (res, rej) => {
          
          
          
              console.log(access_token, 'access_token')
          
          
              let overNights = []
              let pos1 = await this.getHoldingInstruments(access_token);
          

              let pos=pos1//.filter(i=>i.quantity!=0);
              let posln = pos.length
          
              console.log('total overnight ', posln)

              // return ;
          
          
              let PostionsTimer = setInterval(async () => {
          
          
                let e = pos.pop()
                posln--;
          
          
          
                if (typeof e == 'undefined') {
                  console.warn('clearing postion timer')
                  clearInterval(PostionsTimer)
          
                  res(jsonObj2)
          
                  console.log('where am i', jsonObj2.length)
                  return false;
                }
                try {
          
                  console.log(' overnight left', posln, 'e', e);
                  let instruAll = require('./appv3/public/instruments/instrumentsAll.json');
          
                  let ln = jsonObj2.filter(ci => ci.tradingsymbol == e).length;
          
                  console.log(ln, 'is presnett', e);
                  if (ln == 0) {
          
                    // console.log(e,'Holding instrument Not Found');
                    let i = instruAll.filter(i => i.tradingsymbol == e)[0];
                    let a = new pricePoint(i.instrument_token, access_token);
                    let c = await a.getPricePoints(7, 'day');
          
                    if (typeof c == 'undefined') {
          
                      console.log('big problem with price points')
          
                      return false
                    }
                    // console.log(c,'c')
                    i.pricePoints = c;
                    i.SevenDayMaxMin = c.SevenDayMaxMin;
          
                    i.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${i.tradingsymbol}/${i.instrument_token}`;
                    i.seletedBuyingMethod = 'MAX'
                    i.enterNowToTrade = false;
                    i.PlacedReverseOrder = false;
          
                    console.log('pushing', e)
                    jsonObj2.push(i);
          
          
                  } else {
          
                    console.log('Instrument ', e, 'Found no issues')
                  }
          
                }
          
                catch (error) {
          
          
                  console.log(error, 'error of position check')
                }
          
          
          
          
          
          
          
          
              }, 501) //pos for each
          
          
          // res(true)
          
          
            })
          }
          

  async   fetchHourlyData() {

    return new Promise(async (res,rej)=>{


        let createAndMoveFileFromJson = require('./createAndMoveFileFromJson');
        console.log('timer for hourly lows')
         let instruments = require('./appv3/public/instruments/instrumentsForMining.json')
        //  let instruments = require('./appv3/public/instruments/instrumentsForCommodity.json')

        let symbols = instruments.
        
        //filter(ix=>ix.instrument_type=="FUT").
        
        map(r => r.instrument_token ).filter((val,index,arr)=>{
            return arr.indexOf(val)==index
        })
       
        

        console.log(symbols,symbols.length)


        let s= symbols.length

        this.totalTime=s*333;
        totalTime1=s*333;
//         if(s!=2){


// setTimeout(()=>{
//     console.log('calling again')
//     this.fetchHourlyData()
  


// },
// // this.totalTime+2*60*1000
//  5*1000

// )
          
//         }
        
        //.slice(1,10)

     console.log(this.accessToken,'this.accessToken')

     let symbols1=symbols//.splice(1,5);

        let jsonObj2 = await ZerodhaAPI.getHourlyCandleLows(this.accessToken,
             symbols1)
console.log(jsonObj2.length,'json obj')

this.totalTime=jsonObj2.length*333;

        let targetDir = './appv3/public/instruments/hourlyCandleData.json'
        let fileOutputName = './appv3/public/instruments/hourlyCandleData.json'
        
        //    let targetDir = './appv3/public/instruments/hourlyCandleDataCommodity.json'
        // let fileOutputName = './appv3/public/instruments/hourlyCandleDataCommodity.json'

        console.log(jsonObj2.length,'jsonObj2')


        let out= this.getZeroVolumeCandleScripts(jsonObj2);

        let out2 = await this.overnightScripts(out,out,this.accessToken)

    //   let a= await  createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir)
      let a= await  createAndMoveFileFromJson(fileOutputName, out, targetDir)


    //   console.log(a,'a')

      res('hi')
return;

})

    }



    async updateAccessToken() {


        return new Promise(async (res, rej) => {




            const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
            let mongo = await mongoose.connect(uri, 
                { useNewUrlParser: true, useUnifiedTopology: true });

                let AccesTocken = require('./models/AccessTokens');
                
            let access_token_global = await
             AccesTocken.findOne({ 'date': today }, 'access_token')
             
             .
            
            then(e => e.access_token);
           

            this.accessToken = access_token_global

            res(access_token_global);

         return;

        })

        // return ;
    }





}

// (async function(){
//     console.log('immediate start');
//     let a = new HourlyData()
//    let b =await  a.updateAccessToken();

//   let c= await  a.fetchHourlyData()
//  let d= await a.test()


//    mongoose.disconnect()

// })()

(async function(){
    console.log('immediate start');
    let a = new HourlyData()
   let b =await  a.updateAccessToken();

  
  let c= await  a.fetchHourlyData()



   mongoose.disconnect()

   

})() //imodiate start




// (async function(){
   
    setInterval(()=>{
       
        
         var d = new Date();
                    let hours = d.getHours();
                    let minutes = d.getMinutes();
                    let seconds = d.getSeconds();
                
                    let times=[16,36,46,1]
                   
        
                     if (hours<16 & times.includes(minutes))
        
                    //  if(1)
                    
                    {
          (async function(){
            console.log('starting inside loop %s hours %s minutes',hours,minutes);
            let a = new HourlyData()
           let b =await  a.updateAccessToken();
        
          
          let c= await  a.fetchHourlyData()
        
        
        
           mongoose.disconnect()
        
           
        
        })()
        
        
                    }
        
        },1*60*1000)  ///main loop of timers that is when to start
        
    
// })()




