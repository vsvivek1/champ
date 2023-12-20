var KiteConnect = require("kiteconnect").KiteConnect;
require('dotenv').config({path:'../../findiserver/.env'})



module.exports = class misPricePoints {

  
  constructor(stock_tocken, accessToken,interval='minutes') {

    this.stock_tocken =stock_tocken;

    this.accessToken = accessToken;

    this.pricePointData = [],

    this.interval=interval;


  }



  async getMisTargets(){

    // let pp =new misPricePoints('minutes')
  
    let pp2=await this.getXDaysPricePoints()
  
  if(typeof pp2 == 'undefined' ) return [];
  
  
  
  
  return new Promise((res,rej)=>{
    let pp3=pp2.sort((a,b)=>a.high-b.high)
    res(pp3)
  
  
  })
  

  
  
  
  }

  dateBforeXDays(daysToAdvance) {



    var d = new Date();
  
    d.setDate(d.getDate() - daysToAdvance);
  
    

    // console.log(d.toISOString().slice(0, 10),'d.toISOString().slice(0, 10)')

    return d.toISOString().slice(0, 10);
  }


  today() {
    var d = new Date();
    d.setDate(d.getDate()+1)
    return d.toLocaleString('sv').slice(0, 10);
  }


  async getXDaysPricePoints(days){

    const api_key = 'wkcurst2vu5obug7'
    var kc2 = new KiteConnect({
      api_key: api_key,
      access_token: this.accessToken
    });
  


    try {
 

     let b = await kc2.getHistoricalData(this.stock_tocken, '5minute', 
   this.dateBforeXDays(7) , this.today(), false).then(
    res => {
        let sorted = res.sort((a, b) => {
  
  
          return new Date(a.date) - new Date(b.date)
        });

        return sorted
  
  
  
      }
    )

    return b;
  
    
  } catch (error) {
    console.log(error)
  }
   
  
  
  
  }

}


// for(i=0;i<pp3.length;i++){


//   if(i!=0) {

//     let pvshigh=pp3[i-1].high;
//     let currentHigh=pp3[i].high;
  
//     if(currentHigh>pvshigh){

//       let diff=currentHigh-pvshigh
  
//       console.log(pp3[i-1].date,pp3[i].date,'currentHigh',diff ,diff/pvshigh*100)


//     }
//   }
 
// }

// 

  
  // console.log(pp3,'hi')





