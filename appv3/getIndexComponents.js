const fs = require('fs');
const axios = require('axios');
const indexList = require('./indexList.json');

// Function to fetch data and save result
async function fetchDataAndSave(url, fileName) {
    try {
        const response = await axios.get(url);
        const data = response.data.data;
        fs.writeFileSync(`indexComponent/${fileName}.json`, JSON.stringify(data, null, 4));
        console.log(`Saved ${fileName}.json`);
    } catch (error) {
        console.error(`Failed to fetch data for ${fileName}`, error.code);
    }
}

// URL and file name
const url = 'https://iislliveblob.niftyindices.com/jsonfiles/equitystockwatch/EquityStockWatchNIFTY%20SMALLCAP%20250.json?{}&_=1707467612183';
// const fileName = 'EquityStockWatchNIFTY SMALLCAP 250';

// Fetch data and save



indexList.forEach(entry => {
    const tradingIndexName = entry.Trading_Index_Name;
    var fileName=entry.Trading_Index_Name;

    console.log(fileName,'fileName')
    // const indexLongName = entry.Index_long_name.replace(/%20/g, ' ');
    const url = `https://iislliveblob.niftyindices.com/jsonfiles/equitystockwatch${tradingIndexName}.json?{}&_=${Date.now()}`;
    fetchDataAndSave(url, fileName);
});