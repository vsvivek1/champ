const puppeteer = require('puppeteer');
const url = 'https://www.moneycontrol.com/stocks/fno/marketstats/futures/openint_inc/homebody.php?opttopic=openint_inc&optinst=allfut&sel_mth=1&sort_order=0';
const cheerio = require('cheerio');
let Instruments=require('../getInstruments.js');

class Scraping {
  constructor() {
 this.a=a;
 console.log('from scraping');

}
static async scrap(){
 
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
  .then(function(html) {
   
    try {
    var  $ = cheerio.load(html);
    } catch (error) {
      console.log('errror',error)
    }
   
    let ois=[];
    // console.log('ois2',ois)
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

                            // console.log('oisinside',ois)



      });

      let w=ois.filter(o=>{
        if(isNaN(parseFloat(o.changePc))||isNaN(o.oiPc)){
console.log('o.voiPc',parseFloat(o.oiPc));

        }else{
         
          return ( o.symbol!='' && parseFloat(o.changePc)>0  && parseFloat(o.oiPc)>0 && parseFloat(o.volPc)>1)

        }
        
        
        
      });
     
      return w;

    })
  .catch(function(err) {
    //handle error
    console.log('error',err)
  });
}



// execute()

}





module.exports = Scraping;