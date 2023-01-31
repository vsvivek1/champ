const puppeteer = require('puppeteer');
const url = 'https://chartink.com/screeners';
const cheerio = require('cheerio');
let Instruments=require('../getInstruments.js');
const fs = require('fs')

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
 
    // console.log('html',html)

    // console.log('cheerio',cheerio)

    try {
    var  $ = cheerio.load(html);
    } catch (error) {
      console.log('errror',error)
    }
  

   
    let ois=[];
    // console.log('ois2',ois)
    $('.striped .list-group-item a').each((index, element) => {
      
     let text= $(element).text();
     let href=$(element).attr('href');
     let strategy={};
     strategy.id=index;
     strategy.text=text;
     strategy.href=href;
     
console.log('strategy',strategy);
ois.push(strategy);



      });

    
      return ois;

    }).then(ois=>{
      try {
      let  json = JSON.stringify(ois);
        const data = fs.writeFileSync('./strategies.json', json)
        //file written successfully
      } catch (err) {
        console.error(err)
      }


    })
  .catch(function(err) {
    //handle error
  });
}





}
function execute(){
  
    Scraping.scrap();
  }
execute()



module.exports = Scraping;