const fs = require("fs");

const { getKiteConnectInstance } = require('../getKiteConnectInstance.js');
const instruments = require("../appv3/public/instruments/instrumentsAll.json");
const { connectToDatabase } = require('../connectToDatabase.js');
var KiteConnect = require("kiteconnect").KiteConnect;
const axios = require('axios');

let url="https://www.moneycontrol.com/stocks/fno/marketstats/futures/oi_dec_p_inc/homebody.php?opttopic=stkfut&optinst=stkfut&sel_mth=1&sort_order=0"

console.log('starting test');

async function test() {

 const $ = cheerio.load(data);

  let symbols = [];

  $("table tr").each((i, el) => {
    const symbol = $(el).find("td").first().text().trim();
    if (symbol) symbols.push(symbol);
  });

  console.log(symbols);
 
}

test()