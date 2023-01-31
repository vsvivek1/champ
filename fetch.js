
const Fs = require('fs')
const mongoose=require('mongoose');
const Path = require('path')
const Axios = require('axios');

const FILE_LOCATION='./appv3/public/instruments';


const csvToJson = require("csvtojson");

const TIMER=500;
var KiteConnect = require("kiteconnect").KiteConnect;


require('dotenv').config()

class Fetch{

    constructor(){
this.a=0

    }

   static async downloadInstruments() {


    return new Promise(async (resolve, reject) => {
  
    let url = "https://api.kite.trade/instruments";
    const path = Path.resolve(__dirname, FILE_LOCATION, 'instruments.csv')
    const writer = Fs.createWriteStream(path)
  
    let response = await Axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
  
  
    let d1= await response.data.pipe(writer)
  
    
      writer.on('finish',()=> resolve('downlaoded'))
      writer.on('error', ()=> reject('not downloaded'))
    })
  }


}

module.exports=Fetch;