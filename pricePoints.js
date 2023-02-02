var KiteConnect = require("kiteconnect").KiteConnect;
var moment=require('moment');

module.exports = 
class pricePoint {

  
  constructor(stock_tocken, accessToken) {
    require('dotenv').config()
    // dotenv.config();

    this.counter=0;




    this.stock_tocken = stock_tocken;

    this.accessToken = accessToken;

    this.pricePointData = []
    // this.getPricePoints();
  }

 


  yNdays(yesterdayData){


let yesterDay={};




if(typeof yesterdayData!='object'){

  return yesterDay;
  // return false;
}
    
      yesterDay.date = yesterdayData.date;

      yesterDay.normalDate=this.convertIsoDateToIST(yesterdayData.date)


// console.log(yesterdayData ,'yday date')
   
      yesterDay.low = yesterdayData.low;
      yesterDay.high = yesterdayData.high;
      yesterDay.close = yesterdayData.close;
      yesterDay.open = yesterdayData.open;

      yesterDay.range = Math.abs(yesterdayData.high - yesterdayData.low);

      yesterDay.rangeBreakOutTarget = yesterdayData.high + yesterDay.range;
      yesterDay.rangeBreakDownTarget = yesterdayData.low - yesterDay.range;

      return yesterDay;

  }


  convertIsoDateToIST(iso) {
  

    return moment(iso).format("DD-MM HH:mm");
  }
  

  dateBforeXMonths(monthsToAdvance) {

    var d = new Date();
    d.setMonth(d.getMonth() - monthsToAdvance);

    return d.toISOString().slice(0, 10);
  }



  dateBeforeXdays(daysToAdvance){



    var d = new Date();

let dayOfWeek=d.getDay();

daysToAdvance=daysToAdvance+5

// if(dayOfWeek==1 ||  dayOfWeek==5 ||  dayOfWeek==6){

//   daysToAdvance=daysToAdvance+2

// }

    d.setDate(d.getDay() - daysToAdvance);

    return d.toISOString().slice(0, 10);

  }

  today() {


    // var d = new Date();
    // d.setDate(d.getDate()+1)
    // return d.toLocaleString('sv').slice(0, 10);


    let moment=require('moment');
    
    return moment().format('Y-MM-DD')
  }

  getHeikinAshiValues(dayBeforeYesterdayData,yesterdayData){

    let Ha={}
    // Open = (open of previous bar + close of previous bar) divided by 2
    // Close = (open + close + high + low of current bar) divided by 4
    // High = the maximum value from the high, open, or close of the current period
    // Low = the minimum value from the low, open, or close of the current period
try{
    
    Ha.Open=(dayBeforeYesterdayData.open+dayBeforeYesterdayData.close)/2;
    Ha.Close=(yesterdayData.open+yesterdayData.close+yesterdayData.high+yesterdayData.low)/4;

    Ha.High=Math.max(yesterdayData.open,yesterdayData.close,yesterdayData.high,yesterdayData.low)
    Ha.Low=Math.min(yesterdayData.open,yesterdayData.close,yesterdayData.high,yesterdayData.low)

    return Ha;

  }catch(e){


    return Ha;
  
  }

  }

  getPivotPoints(data) {

    let high = data.high;
    let low = data.low;
    let close = data.close;

    let pp = Math.floor((high + low + close) / 3);

    let ob = {};
    ob.r1 = Math.floor(2 * pp - low);
    ob.s1 = Math.floor(2 * pp - high);

    ob.r2 = Math.floor(pp + (high - low));
    ob.s2 = Math.floor(pp - (high - low));

    ob.r3 = Math.floor(high + 2 * (pp - low));
    ob.s3 = Math.floor(low - 2 * (high - pp));
    ob.pivotPoint = pp;
    ob.high = high;
    ob.low = low;
    ob.close = close;


    let bc1 = (high + low) / 2;

    let tc1 = (pp - bc1) + pp;



    let bc = Math.min(bc1, tc1, pp);
    let tc = Math.max(bc1, tc1, pp);

    ob.bc = bc;
    ob.tc = tc;





    return ob;

    let pro = new Promise((resolve, reject) => {

      resolve(ob)
    })

    return pro;


  }

async getHourlyPricePoints(){
let HourlyPricePoints=require('./class/misPricePoints');


let interval='60minute';


let hPricePoints=new HourlyPricePoints(this.stock_tocken,this.accessToken,interval);



return new Promise(async (res,rej)=>{

  let pp=await hPricePoints.getMisTargets();
  res(pp);
  return 
})


  }


  getXmonthMaximum(arr, mon1) {




    let mon = (mon1 - 1) * 31;


    let XmonthData = arr.slice(global.globalPrevious, mon)

   
    let maxValue = Math.max.apply(Math, XmonthData.map(function (o) { return o.high; }))

    let max = arr.filter(a => a.high == maxValue)[0];

    global.globalPrevious = mon1;
    return max;

  }
  getXmonthMinimum(arr, mon1) {


   // let mon = (mon1 - 1) * 7;
    let mon = (mon1 - 1) * 31;
    let XmonthData = arr.slice(global.globalPreviousMin, mon)

 
    let minValue = Math.min.apply(Math, XmonthData.map(function (o) { return o.low; }))

    let min = arr.filter(a => a.low == minValue)[0];

    global.globalPreviousMin = mon1;
    return min;

  }

  

async getXDaysPricePoints(days,stock_tocken){
  var kc2 = new KiteConnect({
    api_key: process.env.api_key,
    access_token: this.accessToken
  });

  let b = await kc2.getHistoricalData(stock_tocken, 'day', 
  this.dateBforeXMonths(days), this.today(), false).then(
    async res => {
      let sorted = res.sort((a, b) => {


        return new Date(a.date) - new Date(b.date)
      });



    }
  )



}


getNDayMaxAndMin(data,n){


try {

  let ar1=data.map(d=>parseFloat(d.high));
  let ar2=data.map(d=>parseFloat(d.low));
  let max= Math.max(...ar1)

  let min=Math.min(...ar2);

  let obj={};
  obj.Max=max;
  obj.Min=min;
  
  return obj;

} catch (error) {
  console.log('some error',error)
}



 

}

  async getPricePoints(duration=34,durationType='month') {


    return new Promise(async (res,rej)  =>{


    

    var kc2 = new KiteConnect({
      api_key: process.env.api_key,
      access_token: this.accessToken
    });


    let retOb = {};
    let startDay;

    if(durationType=='month'){
      startDay=this.dateBforeXMonths(duration);

    }else  if(durationType=='day'){

startDay=this.dateBeforeXdays(duration)

    }



    // 
    let b = await kc2.getHistoricalData(this.stock_tocken, 'day', 
    startDay, this.today(), false).then(async res => {


      
      





      let sorted = res.sort((a, b) => {


        return new Date(a.date) - new Date(b.date)
      })



      

        


      let len = sorted.length;
      let first = sorted[len - 1];

      retOb.SevenDayMaxMin=this. getNDayMaxAndMin(sorted,7)

  
     

      let date = new Date();

      let hrs = date.getHours();
      let minutes = date.getMinutes()

  
      
    


      let yesterdayData;
      let dayBeforeYesterdayData;

      
      let d7data,d6data,d5data,d4data,d3data,d2data,d1data,d0data;
      if (hrs > 9 && hrs <= 15) {

       

        yesterdayData = sorted[len - 2];

        const instruAll = require('./appv3/public/instruments/instrumentsAll.json');;

// console.log(this.stock_tocken,'this.stock_tocken')

// if ts=
       let ts= instruAll .filter(f=>f.instrument_token==this.stock_tocken)[0]
       .tradingsymbol

var dd1=new Date(yesterdayData.date);

var dd2=dd1.getFullYear()+'-' + (dd1.getMonth()+1) + '-'+dd1.getDate();//prints expected format.



        // console.log( dd2,yesterdayData.high,' yesterdayData.date high',ts);


        dayBeforeYesterdayData = sorted[len - 3];
        d7data=sorted[len - 8];
        d6data=sorted[len - 7];
        d5data=sorted[len - 6];
        d4data=sorted[len - 5];
        d3data=sorted[len - 4];
        d2data=sorted[len - 3];
        d1data=sorted[len - 2];
        d0data=sorted[len - 1];

        // console.log(d0data,'dodata')



        //asume placing during day time
      } else {
        yesterdayData = sorted[len-1];
        dayBeforeYesterdayData = sorted[len - 2];


        d7data=sorted[len - 7];
        d6data=sorted[len - 6];
        d5data=sorted[len -5];
        
        




        d4data=sorted[len - 4];
        d3data=sorted[len - 3];
        d2data=sorted[len - 2];
        d1data=sorted[len - 1];
        // d0data=sorted[len - 0];
      }



      
      retOb.d0= this.yNdays(d0data);
      retOb.d1= this.yNdays(d1data)
      retOb.d2= this.yNdays(d2data);
      retOb.d3= this.yNdays(d3data); 
      retOb.d4= this.yNdays(d4data);

     
       retOb.d5= this.yNdays(d5data); 

       retOb.d6= this.yNdays(d6data);
       retOb.d7= this.yNdays(d7data);

      if(retOb.d1.range<Math.min(retOb.d2.range,retOb.d3.range,retOb.d4.range,retOb.d5.range,retOb.d6.range,retOb.d7.range)){

        retOb.nr7=true
      }else{
retOb.nr7=false

      }


      if(retOb.d1.range<Math.min(retOb.d2.range,retOb.d3.range,retOb.d4.range)){

        retOb.nr4=true
      }else{
retOb.nr4=false

      }



//console.log('NR7',retOb.nr7)
      let heikinAshiValues=this.getHeikinAshiValues(dayBeforeYesterdayData,yesterdayData)
      retOb.heikinAshi=heikinAshiValues;



      try {
        
     
      yesterdayData.token = this.stock_tocken;
    } catch (error) {
      yesterdayData={};
      yesterdayData.token = this.stock_tocken;
    }
      
      let pivotPoints = this.getPivotPoints(yesterdayData);
      let pivotPointJson = JSON.stringify(pivotPoints);
      let pivotPointObject = pivotPoints;

      




      let yesterDay = {};
    
      yesterDay.date = yesterdayData.date;
      yesterDay.low = yesterdayData.low;
      yesterDay.high = yesterdayData.high;
      yesterDay.close = yesterdayData.close;
      yesterDay.open = yesterdayData.open;

      yesterDay.range = Math.abs(yesterdayData.high - yesterdayData.low);

      yesterDay.rangeBreakOutTarget = yesterdayData.high + yesterDay.range;
      yesterDay.rangeBreakDownTarget = yesterdayData.low - yesterDay.range;

      yesterDay.pivot = pivotPoints.pivotPoint;
      yesterDay.pivotBc = pivotPoints.bc;
      yesterDay.pivotTc = pivotPoints.tc;
      yesterDay.pivotR1 = pivotPoints.r1;
      yesterDay.pivotR2 = pivotPoints.r2;
      yesterDay.pivotR3 = pivotPoints.r3;
      yesterDay.pivotS1 = pivotPoints.s1;
      yesterDay.pivotS2 = pivotPoints.s2;
      yesterDay.pivotS3 = pivotPoints.s3;
      




      yesterDay.length = len;


      let yesterdayJson = JSON.stringify(yesterDay);


 


      let qoute=await kc2.getQuote(this.stock_tocken).then(r=>{

   

        yesterDay.qoute=r[this.stock_tocken];
      });


    

  
      retOb.pivotPoints = pivotPointJson;

if(typeof(yesterDay)=='undefined'){

  retOb.yesterday ={}
}else{
  retOb.yesterday = yesterDay;

}
      


      retOb.pivotPointObject = pivotPointObject;

 

      // st.add(pivotPointJson);

      global.globalPrevious = 0;

    
      let st = new Set();

      let candles=Math.floor(sorted.length/31);


      //candle valuye was 90 previos;y

      for (let i = 2; i < candles; i++) {

        let ob = {};


let tmp=this.getXmonthMaximum(sorted, i);

if(typeof(tmp)!='undefined'){
  ob.date = tmp.date;

  

}else{
  console.log('xmont max  undefined',sorted,'i',i)

}

     
        let max = this.getXmonthMaximum(sorted, i);
        if (typeof (max) != 'undefined') {

          if (max.hasOwnProperty('high')) {

            ob.high = max.high;
          }
        }






        let a = JSON.stringify(ob);


        st.add(a)


      }



      let stMin = new Set();
      global.globalPreviousMin = 0;



      for (let i = 2; i < candles; i++) {

        let ob = {};
        ob.date = this.getXmonthMinimum(sorted, i).date;
        ob.level = this.getXmonthMinimum(sorted, i).low;
        // ob.pivotPoints=pivotPointJson;
        // ob.yesterDay=yesterdayJson;

        let a = JSON.stringify(ob);

        stMin.add(a)


      }


      //using sets to remove any duplicates if any

      let pricePointLocal = []

      Array.from(st).forEach(s => {
        // pricePointLocal.push(JSON.parse(s))
        this.pricePointData.push(JSON.parse(s));

      })

      Array.from(stMin).forEach(s => {
        // pricePointLocal.push(JSON.parse(s))
        this.pricePointData.push(JSON.parse(s));

      })


      let pricePointFinal = {};
      // pricePointFinal.prices=JSON.stringify(pricePointLocal);
      // pricePointLocal.pivotPoint=pivotPointJson;
      // pricePointLocal.yesterday=yesterdayJson;

      // this.pricePointData.push(pricePointFinal);



    }).catch(err => {

      console.log('error', err)
    })

    // return this.pricePointData;




    let pp = this.pricePointData.sort((a, b) => {

      return a.level - b.level
    });

    retOb.pricePoints = pp;


    let hourlyPricePoints=await this.getHourlyPricePoints()
    

   retOb.hourlyPricePoints=hourlyPricePoints;
    
res(retOb)
    return retOb;



  })//end of promise
  }


}


