const puppeteer = require('puppeteer');

let ohlc=require('./ohlc');

const cheerio = require('cheerio');
let Instruments=require('../getInstruments.js');
const fs = require('fs');
let pricePoint=require('../pricePoints.js');
const { reject } = require('lodash');

class CI {
  constructor() {
 this.a=a;
 console.log('from ci');

}

static async  ExeCPriceFunction(tocken,accessToken){

  let a=new pricePoint(tocken,accessToken);
  let c=await a.getPricePoints();
  // console.log('c',c)
  return c;
  
  
      

}


static async execPriceWithDelay(instrument_token,accessToken)
{

 return  new Promise((resolve,rej)=>{

    setTimeout(function(){
      let pricepoints=CI.ExeCPriceFunction(instrument_token,accessToken);
     return  pricepoints.then(r=>{
       let encodedPrices=JSON.stringify(r);

       resolve(encodedPrices);
       rej('error')
          // return 
         //  
      })
  
    },1000)
  

  })
}
 

static async traverse(){



}

static async ChartInkScan(html){
  try {
    var  $ = cheerio.load(html);
    } catch (error) {
      console.log('errror',error)
    }
  

    let ln=$('.scan_results_table tbody tr').length;
    console.log('number of stocks',ln)

    let ois=[];
    $('.scan_results_table tbody tr').each( (index, element) => {
      
     let symbol=  $(element).children("td").eq(2).children('a').text().trim();
        let change=parseFloat($(element).children("td").eq(4).text().trim().split('%')[0]);
    
     let price=parseFloat($(element).children("td").eq(5).text().trim());
     let instrument={};
     instrument.symbol=symbol;
     let instrument_token=Instruments.getInstrumentToken(symbol);
     instrument.instrument_token=instrument_token;
     instrument.changePc=change;
     instrument.price=price;
     instrument.selected=true;
     instrument.ohlc='';
          ois.push(instrument)

;

      });

      return ois;

}

static async scrap(href,accessToken){
 
 
  let url;
  if(href=="LongBuildUp"){

 url = 'https://www.moneycontrol.com/stocks/fno/marketstats/futures/openint_inc/homebody.php?opttopic=openint_inc&optinst=allfut&sel_mth=1&sort_order=0';

  }else{
     url = 'https://chartink.com/screener/'+href;

  }
  
  // console.log('href',url)

  
 return puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    
    return page.goto(url).then(function() {

      
      return page.content();
    });
  })
  .then( async  function(html) {
      console.log('href',href,href=='LongBuildUp')

    if(href=='LongBuildUp'){

      try {
        var  $ = cheerio.load(html);
        } catch (error) {
          console.log('errror',error)
        }

      let ois=[];
       $('.tblList tr').each((index, element) => {

       
let searchvalue=",";
let newvalue="";

                            let symbol= $(element).children("td").eq(0).text().trim();

                            let instrument_token=Instruments.getInstrumentToken(symbol)
                            let expiry= $(element).children("td").eq(1).text().trim();
                            let ltp= $(element).children("td").eq(2).text().trim().replace(/,/g,"");

                            
                            let change= $(element).children("td").eq(3).text().split(" ")[0];

                            
                            let changePc=$(element).children("td").eq(3).text().split(" ")[2];
                            // let changePc=changePc1.split('%')[0];

                            let tdHiLow=String($(element).children("td").eq(4).html()).split('<br>');
                            
                            let high= tdHiLow[0];
                            let low=tdHiLow[1];

                            let avg= $(element).children("td").eq(5).text().trim().replace(/,/g,"");

                            let avg2;

                            let oi= $(element).children("td").eq(6).text().trim();
                            let oiPc= $(element).children("td").eq(11).text().trim().split('%')[0];
                            let vol= $(element).children("td").eq(8).text().trim();
                            let volPc= $(element).children("td").eq(7).text().trim().split('%')[0];

                            // console.log(symbol,volPc)

                            let selected=true;

                            let ob={symbol,instrument_token,expiry,ltp,change,changePc,high,low,avg,oi,oiPc,vol,volPc,selected};
                            ois.push(ob)

                            console.log('oisinside',ois)



      });

      let w=ois.filter(o=>{
        if(isNaN(parseFloat(o.changePc))||isNaN(o.oiPc)){
console.log('o.voiPc',parseFloat(o.oiPc));

        }else{
         
          return ( o.symbol!='' && parseFloat(o.changePc)>0  && parseFloat(o.oiPc)>0 && parseFloat(o.volPc)>1)

        }
        
        
        
      });
     
      return w;
      // return ois  ;

    }else {
    console.log('url',href)
    try {
    var  $ = cheerio.load(html);
    } catch (error) {
      console.log('errror',error)
    }
  

    let ln=$('.scan_results_table tbody tr').length;
    console.log('number of stocks',ln)

    let ois=[];
    $('.scan_results_table tbody tr').each( (index, element) => {
      
     let symbol=  $(element).children("td").eq(2).children('a').text().trim();
        let change=parseFloat($(element).children("td").eq(4).text().trim().split('%')[0]);
    
     let price=parseFloat($(element).children("td").eq(5).text().trim());
     let instrument={};
     instrument.symbol=symbol;
     let instrument_token=Instruments.getInstrumentToken(symbol);
     instrument.instrument_token=instrument_token;
     instrument.changePc=change;
     instrument.price=price;
     instrument.selected=true;
     instrument.ohlc='';
          ois.push(instrument);



      });
      return ois  

  
    }


  

    }).then(ois=>{
      return ois
    })
  .catch(function(err) {
    //handle error
  });
}
static async optionChain(href,accessToken){

  // console.log(href,accessToken);
  
  const url = 'https://www.edelweiss.in/market/nse-option-chain';

  
 return puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    
    return page.goto(url).then(function() {

      
      return page.content();
    });
  })
  .then( function(html) {
       try {
    var  $ = cheerio.load(html);

    console.log('html',html)
    } catch (error) {
      console.log('errror',error)
    }
  

   
  
    let pricePointDelays=[];

    // let ln=$('#optionChainTable-indices tbody tr').length;
    let ln=$('.table.ed tbody tr').length;
    console.log('number of stocks',ln)

    let ois=[];
    // $('#optionChainTable-indices tbody tr').each( (index, element) => {
    $('.table.ed tbody tr ').each( (index, element) => {
      
     let CallOi = $(element).children("td").eq(1).text().trim().replace('-',0);
     let CallOiChange = $(element).children("td").eq(2).text().trim().replace('-',0);
     let CallOiVolume = $(element).children("td").eq(3).text().trim().replace('-',0);
     let CallOiIV= $(element).children("td").eq(4).text().trim().replace('-',0);
     let CallOiLTP= $(element).children("td").eq(5).text().trim().replace('-',0);
     let CallOiPriceChange= $(element).children("td").eq(6).text().trim().replace('-',0);
     let CallOiBidQty= $(element).children("td").eq(7).text().trim().replace('-',0);
     let CallOiBidprice= $(element).children("td").eq(8).text().trim().replace('-',0);
     let CallOiAskprice= $(element).children("td").eq(9).text().trim().replace('-',0);
     let CallOiAskQty= $(element).children("td").eq(10).text().trim().replace('-',0);
     let StrikePrice= $(element).children("td").eq(11).text().trim().replace('-',0);

let oc={CallOi,CallOiChange,CallOiVolume,CallOiIV,CallOiLTP,CallOiPriceChange,CallOiBidQty
  ,CallOiBidprice,CallOiAskprice,CallOiAskQty,StrikePrice
}


console.log('oc',oc)
        
          ois.push(oc)

;

      });
return ois    

    }).then(ois=>{
      return ois
    })
  .catch(function(err) {
    //handle error
  });
}





}




module.exports = CI;