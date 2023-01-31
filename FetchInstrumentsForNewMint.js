const Fs = require('fs')
const Path = require('path')  
const Axios = require('axios')
const mongoose=require('mongoose');
let AccesTocken=require('./models/AccessTokens');

// const EXPIRY=getCurrentExpiryDate();
const EXPIRY='2022-03-31';

function getCurrentExpiryDate(){


  let d=new Date();
d.setDate(d.getDate())
d.setMonth(d.getMonth()+1);

let index={1:-4,2:-5,3:-6,4:0,5:-1,6:-2}
d.setDate(0);
let lastDaysWeekDay=d.getDay()
let out=index[lastDaysWeekDay]

d.setDate(d.getDate()+out);


let today=new Date();

if(d<today){
///next month expiry
d.setMonth(d.getMonth()+2);

let index={1:-4,2:-5,3:-6,4:0,5:-1,6:-2}
d.setDate(0);
let lastDaysWeekDay=d.getDay()
let out=index[lastDaysWeekDay]

d.setDate(d.getDate()+out);

}

let d1= d.toISOString().split('T')[0];



console.log('Expiry date',d1)

return d1
}


const pricePoint=require('./pricePoints');

const ZerodhaAPI=require('./ZerodhaAPI');

const ohlc=require('./scraping/ohlc')
const TIMER=360;
let today = new Date().toISOString().slice(0, 10);


async function downloadInstruments () {  

    let url="https://api.kite.trade/instruments";
  const path = Path.resolve(__dirname, 'instruments', 'instrumentsForNewMint.csv')
  const writer = Fs.createWriteStream(path)

  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}



// module.exports = 
// module.exports=

//  module.exports = 
function fetchInstrumentsForNewMint(accessToken){






downloadInstruments ()

.then(r=>{





  const csvToJson=require('csvtojson')

  // let fileInputName = 'instruments/instrumentsForNewMint.csv'; 
  let fileOutputName = 'instruments/instrumentsForNewMintFUT.json';

csvToJson()
.fromFile(fileInputName)
.then((jsonObj)=>{
    
    
    console.log(jsonObj.length);
    

let out=[]
 let jsonObj1=  jsonObj.filter(j=>
  
  // (j.exchange=='NFO' && j.segment=='NFO-OPT' && j.expiry ==EXPIRY) && ( j.lot_size*20<20000 &&  j.lot_size*20>16000) ||
  

  (j.exchange == 'NFO' && j.expiry == EXPIRY && (j.name =="BANKNIFTY" || j.name =="NIFTY") && j.segment=='NFO-FUT')
  
  ) 
    


  // console.log(EXPIRY,'EXPIRY')
  
 console.log(jsonObj1.length);

  // return;



 let len=jsonObj1.length;
let jsonObj2=[];

let intr = setInterval(async () => {




  let e = jsonObj1.pop()
  let len1 = jsonObj1.length;

let sec=len*TIMER/1000;
let min=sec/60
let sec1=sec%60

let t=secondsToHms(sec)


  console.log(len1, 'left out of ', len ,' ',t ,' time left');


 

  if (len1 > 0) {





    let a = new pricePoint(e.instrument_token, accessToken);
    let c = await a.getPricePoints(7, 'day');
    //  console.log(c,'pricePoints')
    e.pricePoints = c;
    e.nr7 = c.nr7;
    e.nr4 = c.nr4;
    e.SevenDayMaxMin = c.SevenDayMaxMin;

    e.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${e.tradingsymbol}/${e.instrument_token}`;
    e.seletedBuyingMethod = 'MAX'
    e.buyNow = false;

    console.log(e.tradingsymbol,'nr4',e.nr4)

    if(e.nr4==true || e.segment=='NFO'){
      jsonObj2.push(e)

    }

   

    
  }

  if (len1 == 0) {

    ///push bank nifty and nofty

   
    clearInterval(intr);
   
//fetching current positions and check symbos are there in list 

    /////////////////////////////


// writing file


Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8', function (err) {
  if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
  }
      console.log("JSON file has been saved.");
});
// writing file


let targetDir = Path.join(__dirname, '/findiapp/instrumentsForNewMint.json');
  

Fs.copyFile('instruments/instrumentsForNewMint.json', targetDir, (err) => {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
});


    return jsonObj2;
    return false;

  }

}, TIMER)

  console.log('Total Scripts:',jsonObj2.length);
 
    
  
})

});
}


function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay; 
}


const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(r=>{

  AccesTocken.findOne({ 'date': today  },'access_token').then(e=>{  

    console.log(e)
    let access_token=e.access_token;
    // let access_token = 'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';
  
     fetchInstrumentsForNewMint(access_token)
  });
               
   ;
  

});




