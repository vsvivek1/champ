"use strict";
const TIMER=501;
require('dotenv').config({path:'../../findiserver/.env'});
const Path = require('path');
const Fs = require('fs')

;




// {path:__dirname+'/./../'}
class Gtt {

    constructor() {


        this.instruments=require('../appv3/public/instruments/instrumentsAll.json');

        this.stocks=this.getGttStocks();

        this.accessToken;

    }

    getGttStocks() {

        

   
        
        return this.instruments.filter(f=>
            f.exchange=='NSE')
        
        .map(i=>i.instrument_token).filter((stock,index,arr)=>{

   
            return arr.indexOf(stock)==index

        })            
        .sort((a,b)=> a-b ).
        filter(f=>!(f.includes('NIFTY')||f.includes('BANKNIFTY') ))

    }


  async  getPricePointsOfStocks(){
const AccessToken=require('./AccessToken')
let at1=new AccessToken();

let result=[]

    this.accessToken=await at1.getAccessToken()
        return new Promise((res,rej)=>{



        
        let pricePoint=require('./../pricePoints');
        let nse1=require('./../nifty.json');
        let nifty=nse1.data.map(n=>n.symbol)

        



    let ln=this.stocks.length;

   
let count=1;
if(true){
    let t=setInterval(async ()=>{



        
        var stock=this.stocks.pop();

        if(typeof stock=='undefined' ){

            res(result);
            clearInterval(t);
            writeFinalScriptsTofile(result);
            return ;
        }

        console.log(count ,' of ',ln)
        count++;

        let instrument=this.instruments.
        filter(i=>i.instrument_token
            ==stock)[0];


            let tradingsymbol=instrument.tradingsymbol;

        let pp=new pricePoint(stock, this.accessToken);
        

        let pp2=await pp.getPricePoints()
        instrument.pricePoints=pp2

        if(nifty.includes(tradingsymbol)){
            instrument.group='NIFTY'

        }


        result.push(instrument);

// console.log(pp2)

    },TIMER)


}
   



    })



}

}



async function writeFinalScriptsTofile(result){


    return new Promise(async (res,rej)=>{
  
        let today = new Date().toISOString().slice(0, 10);
   
  
  let fileOutputName = './'+'pricePoints_'+today+'.json';
  let targetDir = Path.join(__dirname, '/../pricePoints/'+'pricePoints_'+today+'.json');
  
  let out=await createAndMoveFileFromJson(fileOutputName,result,
    targetDir);
  
  
  
  res(out)
  
  
  
  
  
                })
  
  }
  
  
  
  function createAndMoveFileFromJson(fileOutputName,jsonObj2,targetDir){
  
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




let n=new Gtt();

let n2=n.getGttStocks();

n.getPricePointsOfStocks()


console.log(n2)


//  module.exports = Gtt;;