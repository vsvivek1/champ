const Fs = require('fs')
const pricePoint = require('./pricePoints');



function otherCriteria(e) {

  try {


    let retObj;
    let body = Math.abs(e.pricePoints.yesterday.close - e.pricePoints.yesterday.open);
    let candleColor = (e.pricePoints.yesterday.close - e.pricePoints.yesterday.open > 0) ? 'green' : 'red';
    let upperShadow;
    let lowerShadow;
    if (candleColor == 'green') {
      upperShadow = e.pricePoints.yesterday.high - e.pricePoints.yesterday.close;
      lowerShadow = e.pricePoints.yesterday.open - e.pricePoints.yesterday.low;

    } else {
      upperShadow = e.pricePoints.yesterday.high - e.pricePoints.yesterday.open;
      lowerShadow = e.pricePoints.yesterday.close - e.pricePoints.yesterday.low;

    }

    let ob = { body, upperShadow, candleColor, lowerShadow }

    // console.log(ob)
    // && body<=lowerShadow

    
    if (e.pricePoints.d1.range < e.pricePoints.d2.range

      && (candleColor == 'red' && body > upperShadow * 2)
      || (candleColor == 'green' && body > upperShadow * 2)

    ) {



      // return true;  ///temoratry
      console.log(ob)


      retObj = { 'otherCriteriaCheck': true, 'otherCriteriaObj': ob }
      return retObj
      tradables.push(e.instrument_token)

    } 
    
    
    
    else {

      retObj = { 'otherCriteriaCheck': true, 'otherCriteriaObj': ob }
      return retObj
    }

  } catch (e) {


    console.log('error', e)
    return false;

  }
}
module.exports=

async function updateMissingScriptInInstrumetsFile(instrument_token,accessToken){

let targetInstru=require('./appv3/public/instruments/instrumentsForMining.json');
let sourceInstru=require('./appv3/public/instruments/instrumentsAll.json');

/// check if its already there


console.log(instrument_token,'here')

if(typeof instrument_token=='undefined'){

  return false;
}
let ln=targetInstru.filter(i=>i.instrument_token==instrument_token).length
console.log('updating trading symbol',instrument_token)


// return 
if(ln>0){
console.log(instrument_token+' Already Updated')
return false;

}

// let IT=sourceInstru.filter(i=>i.instrument_token==instrument_token)
// [0].instrument_token;


let instrument=sourceInstru.filter(i=>i.instrument_token==instrument_token)[0]
let a = new pricePoint(instrument_token, accessToken);
let c = await a.getPricePoints(7, 'day');
instrument.pricePoints = c;

instrument.SevenDayMaxMin = c.SevenDayMaxMin;

instrument.chart = `https://kite.zerodha.com/chart/ext/ciq/NFO-OPT/${instrument_token}/${instrument_token}`;
instrument.seletedBuyingMethod = 'MAX'
instrument.buyNow = false;

let { otherCriteriaCheck, otherCriteriaObj } = otherCriteria(instrument);

instrument.otherCriteria = otherCriteriaObj;
instrument.otherCriteriaCheck = otherCriteriaCheck;








targetInstru.push(instrument);


let fileOutputName='./appv3/public/instruments/instrumentsForMining.json'
let targetDir='./app'
let t=await createAndMoveFileFromJson(fileOutputName,targetInstru,
    targetDir)

    console.log(t,'promise')

   
    


}


function createAndMoveFileFromJson(fileOutputName,jsonObj2,
    targetDir){

    return new Promise((res,rej)=>{
    
    
    
    
      Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8',
    
    function (err) {    
                      if (err) {
                      console.log("An error occured while writing JSON Object to File.");
                      return console.log(err);
                      }
                       console.log(fileOutputName+"JSON file has been saved.");
    
    
                    Fs.copyFile(fileOutputName, targetDir, 
                    (err) => {
                              if (err) throw err;
                              console.log('source.txt was copied to destination.txt');
                              });
    
    
    
    
                              res(true);
    
                    });
    
    
                  })
      
    }