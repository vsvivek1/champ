const ZerodhaAPI=require('./ZerodhaAPI');

const Scraping=require("./scraping/index.js")
const CI=require("./scraping/ci.js")
var KiteConnect = require("kiteconnect").KiteConnect;
async function executeCI(href,accessToken){
    // console.log('href',href)
  
    let s= await CI.scrap(href,accessToken);
  
    console.log('s',s)
    return s; 
    return CI.scrap(href);
    }

function getHistoricalData(access_token,symbol='INE002A01018',start='2021-03-10',end='2019-03-10'){

    console.log('access tocken from historical data',access_token);
    console.log('\n \n access tocken from historical data api_key',api_key);
  
    if(access_token==null){
  
      console.log('No acceess tocken insdie get historical data');
    }
  
    console.log('access tocken from historical data',access_token);
  
    // instrument_token, interval, from_date, to_date, continuous
  
    // let api_key='wkcurst2vu5obug7';
    var kc2 = new KiteConnect({
      api_key: api_key,
      access_token: access_token
    });
  
  
    console.log('this is kc2',kc2.getHistoricalData('IDEA','DAY','2021-03-01','2021-03-10',true))
  
  
  
    var d1= new Date();
    let today=d1.toISOString().split('T')[0];
  
    let d2=new Date();
    d2.setFullYear(d2.getFullYear() - 2);
  
     symbol='IDEA'
   kc2.getHistoricalData(symbol,'day',d2,d1,true).then(res=>{
  
    console.log('historical sbin',res)
  
    return res;
   }).catch(err=>{
  
    console.log('got an error',err)
  
    
    
      });
  
  }


  function getMinRange(res,e){
    let minRanges=[];   

    let c=0;
  let h1={};
  h1.instrument_token=e.instrument_token;
  h1.historical=res

  res.forEach(h2 => {
    h2.range=Math.abs(h2.high-h2.low)
  });


  let minValue=Math.min.apply(Math, res.map(function(o) { return o.range; }))

  let min=res.filter(a=>a.range==minValue)[0];


  let d3=new Date();
d3.setDate(d3.getDate() -1);
// d3.setHours(24, 00, 0);
let ln=res.length;
let yday1=res[res.length-1]

// console.log('yday1',yday1.date,ln);

// let yday= d3.toISOString().slice(0,10);
let yday= d3.toISOString()



let mindate=min.date.toISOString().slice(0,10,res)
 var dateIST = new Date(min.date.toISOString());
     
//// min date utc to ist////
try {
  // var dateIST = new Date(min.date.toISOString());
  // var dateIST = new Date(min.date.toISOString());

  var mindate1=min.date;
  
} catch (error) {
  console.log(error);
  var mindate1=0;
  
}
try {
  var ydate=yday1.date;
  
} catch (error) {
  console.log(error);
  var ydate=-1;
}



//date shifting for IST timezone (+5 hours and 30 minutes)
dateIST.setHours(dateIST.getHours() + 5); 
dateIST.setMinutes(dateIST.getMinutes() + 30);

//// min date utc to ist////

// console.log('dateIST::',dateIST,'mindate',mindate,'yday',d3.toISOString())

    if(ydate==mindate1){

      // console.log()
    // if(true){

      let m={};
      m.generatedDate=new Date();;
      m.instrument_token=e.instrument_token
      m.tradingsymbol=e.tradingsymbol
      m.date=mindate;
      m.range=min.range;
      m.low=min.low;
      m.high=min.high
      m._id=new mongoose.Types.ObjectId();

      console.log(m)

//       let Nr=new NarrowRange(m);
// Nr.save().then(r=>{

// })
      minRanges.push(m)
      // console.log('MINIMUM RANGE FOUND',e.tradingsymbol,m,yday);
    return m;

    }else{
c=c+1;
      // console.log('not a minimum range',e.tradingsymbol)
      // console.log('not a minimum range',e.tradingsymbol,minValue,min,yday)
      let a={};
return a;
    }
    // return h1
    }
    async function GetStocks(req){

  
        let minRanges=[];
        var kc = new KiteConnect({
          api_key: api_key,
          access_token: req.params.accessToken
        });
      
      
        let eq1;
      
        let instru=kc.getInstruments();
      
      
      let eq=instru.then(
          r=>{
            let eq=r.filter(r1=>r1.segment=='NSE' && r1.exchange=='NSE' && r1.instrument_type=='EQ' && r1.name!='');
          
            // eq1=eq
      
            
            return eq;
          
          }
          
            ).catch(e=>{
      
              console.log('error in function get stocks with error',e)
            })
      
            // eq.then(r=>console.log('------------------ b4 retur ',r))
      
            
            return eq;
      
      }
      
      async function NrRange(req) {
        let minRanges=[];
        var kc2 = new KiteConnect({
          api_key: api_key,
          access_token: req.params.accessToken
        });
        var interval = 100; 
        let eq=await GetStocks(req);
        let eq1=eq.slice(0,100); 
      
        var d1= new Date();
        let today=d1.toISOString().split('T')[0];   
      
        d1.setDate(d1.getDate()+2);
      
        let d2=new Date();
        d2.setDate(d2.getDate() - 6);
      
       let promises=  eq1.map(async (e,index)=>{
        setTimeout(function  () {
        
       return  kc2.getHistoricalData(e.instrument_token,'day',d2,d1,false,1)
                                        
          .then(
      res=>{
      
        let mr=getMinRange(res,e);
        // console.log('res',mr)
        return mr
      }).catch(e=>console.log('it happens inside',e));;
          
        },interval*index)
      });
      
      
      // console.log('promise from nr range',promises)
      return promises;
        
      
      }
      

  
  module.exports={getHistoricalData,getMinRange,GetStocks,executeCI,NrRange}