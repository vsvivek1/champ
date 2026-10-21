const fs = require("fs");

const { getKiteConnectInstance } = require('../getKiteConnectInstance.js');
const instruments = require("../appv3/public/instruments/instrumentsAll.json");
const { connectToDatabase } = require('../connectToDatabase.js');
var KiteConnect = require("kiteconnect").KiteConnect;

console.log('starting test');

async function test() {
  await connectToDatabase();
  const kite = await getKiteConnectInstance();
  console.log('got kite instance',kite);
}

test()