
const fs = require("fs");
const instruments = require("./appv3/public/instruments/instrumentsForMining.json");

main();

async function main() {
  let getAccessToken = require("./common-functions/getAccessToken");
  // import StartServerConnections from "./StartServerConnections";
  let a = await getAccessToken();
  console.log(a);

  process.exit();
}

function writeOutputToFile(filePath) {
    let filteredInstruments = instruments.filter(i => i.name == 'BANKNIFTY' && i.segment == 'NFO-FUT');
    let data = JSON.stringify(filteredInstruments, null, 2);

    fs.writeFile(filePath, data, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

const filepath='./out.txt'
writeOutputToFile('./out.txt') 

