var KiteConnect = require("kiteconnect").KiteConnect;


module.exports = class pricePoint {

  
  constructor(stock_tocken, accessToken) {
    require('dotenv').config()
    // dotenv.config();

    this.counter=0;


    this.stock_tocken = stock_tocken;

    this.accessToken = accessToken;

    this.pricePointData = []
    // this.getPricePoints();
  }

  dateBforeXMonths(monthsToAdvance) {

    var d = new Date();
    d.setMonth(d.getMonth() - monthsToAdvance);

    return d.toISOString().slice(0, 10);
  }

  today() {
    var d = new Date();
    d.setDate(d.getDate()+1)
    return d.toLocaleString('sv').slice(0, 10);
  }

  getHeikinAshiValues(dayBeforeYesterdayData,yesterdayData){


    // Open = (open of previous bar + close of previous bar) divided by 2
    // Close = (open + close + high + low of current bar) divided by 4
    // High = the maximum value from the high, open, or close of the current period
    // Low = the minimum value from the low, open, or close of the current period

    let Ha={}
    Ha.Open=(dayBeforeYesterdayData.open+dayBeforeYesterdayData.close)/2;
    Ha.Close=(yesterdayData.open+yesterdayData.close+yesterdayData.high+yesterdayData.low)/4;

    Ha.High=Math.max(yesterdayData.open,yesterdayData.close,yesterdayData.high,yesterdayData.low)
    Ha.Low=Math.min(yesterdayData.open,yesterdayData.close,yesterdayData.high,yesterdayData.low)

    return Ha;

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


    // TC = (Pivot – BC) + Pivot

    // Pivot = (High + Low + Close)/3

    // BC = (High + Low)/2


    return ob;

    let pro = new Promise((resolve, reject) => {

      resolve(ob)
    })

    return pro;


  }


  getXmonthMaximum(arr, mon1) {



    let mon = (mon1 - 1) * 71;
    let XmonthData = arr.slice(global.globalPrevious, mon)

    // console.log('previous',global.globalPrevious)
    // console.log('len',XmonthData);
    let maxValue = Math.max.apply(Math, XmonthData.map(function (o) { return o.high; }))

    let max = arr.filter(a => a.high == maxValue)[0];

    global.globalPrevious = mon1;
    return max;

  }
  getXmonthMinimum(arr, mon1) {


    let mon = (mon1 - 1) * 7;
    let XmonthData = arr.slice(global.globalPreviousMin, mon)

    // console.log('previousMin',global.globalPrevious)
    // console.log('len',XmonthData);
    let minValue = Math.min.apply(Math, XmonthData.map(function (o) { return o.low; }))

    let min = arr.filter(a => a.low == minValue)[0];

    global.globalPreviousMin = mon1;
    return min;

  }

  

  async getPricePoints() {


    var kc2 = new KiteConnect({
      api_key: process.env.api_key,
      access_token: this.accessToken
    });

    let retOb = {};

    let b = await kc2.getHistoricalData(this.stock_tocken, 'day', 
    this.dateBforeXMonths(34), this.today(), false).then(async res => {


      
      
      // console.log(res,'b')




      let sorted = res.sort((a, b) => {


        return new Date(a.date) - new Date(b.date)
      });



      let len = sorted.length;
      let first = sorted[len - 1];



      // console.log('sorted',sorted[len-1],'this.today()',this.today());

      // break;

      //  console.log('latest',first)

      // let v=this.getXmonthMaximum(sorted,2)
      global.globalPrevious = 0;
      let st = new Set();

      let date = new Date();

      let hrs = date.getHours();
      let minutes = date.getMinutes()

      //d1.toLocaleString( 'sv' );;

      // console.log('hrs', hrs, 'minutes', minutes)
      let yesterdayData;
      let dayBeforeYesterdayData;
      if (hrs > 9 && hrs <= 15) {

        yesterdayData = sorted[len - 2];
        dayBeforeYesterdayData = sorted[len - 3];
        

        // console.log('yesterdayData-trading hrs', yesterdayData.date.toLocaleString('sv'))


        // console.log('sorted[len-1];', sorted[len - 1].date.toLocaleString('sv'))

        //asume placing during day time
      } else {
        yesterdayData = sorted[len-1];
        dayBeforeYesterdayData = sorted[len - 2];
        // console.log('yesterdayData-out of-trading hrs', yesterdayData.date.toLocaleString('sv'))
      }

      let heikinAshiValues=this.getHeikinAshiValues(dayBeforeYesterdayData,yesterdayData)
      retOb.heikinAshi=heikinAshiValues;

      // console.log('retOb.heikinAshi',retOb.heikinAshi)

      yesterdayData.token = this.stock_tocken;

      // console.log('yesterdayData=',yesterdayData)


      // console.log('this.stock_tocken',this.stock_tocken,'yesterdayData',yesterdayData)

      // console.log('yesterdayData',yesterdayData)
      let pivotPoints = this.getPivotPoints(yesterdayData);
      let pivotPointJson = JSON.stringify(pivotPoints);
      let pivotPointObject = pivotPoints;

      




      let yesterDay = {};
      // yesterDay.sayHi = 'hi';
      yesterDay.date = yesterdayData.date;
      yesterDay.low = yesterdayData.low;
      yesterDay.high = yesterdayData.high;
      yesterDay.close = yesterdayData.close;

      yesterDay.range = yesterdayData.high - yesterdayData.low;

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
// console.log('yesterday',yesterDay);

      let yesterdayJson = JSON.stringify(yesterDay);


      //get quote and attach it to yday paramater


      let qoute=await kc2.getQuote(this.stock_tocken).then(r=>{

        // console.log('quote',r[this.stock_tocken].upper_circuit_limit)

        yesterDay.qoute=r[this.stock_tocken];
      });


    

      //return object 
      retOb.pivotPoints = pivotPointJson;

if(typeof(yesterDay)=='undefined'){

  retOb.yesterday ={}
}else{
  retOb.yesterday = yesterDay;

}
      


      retOb.pivotPointObject = pivotPointObject;

 
      // console.log('pivotPointJson',pivotPointJson)

      // st.add(pivotPointJson);

      for (let i = 2; i < 90; i++) {

        let ob = {};

        // console.log('this.getXmonthMaximum(sorted, i',this.getXmonthMaximum(sorted, i))

let tmp=this.getXmonthMaximum(sorted, i);

if(typeof(tmp)!='undefined'){
  ob.date = tmp.date;

  

}else{
  console.log('xmont max  undefined')

}

     
        let max = this.getXmonthMaximum(sorted, i);
        if (typeof (max) != 'undefined') {

          if (max.hasOwnProperty('high')) {

            ob.high = max.high;
          }
        }



        // ob.pivotPoints=pivotPointJson;
        // ob.yesterDay=yesterdayJson;



        let a = JSON.stringify(ob);


        st.add(a)


      }
      let stMin = new Set();
      global.globalPreviousMin = 0;

      for (let i = 2; i < 90; i++) {

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

   
    

    return retOb;

  }


}