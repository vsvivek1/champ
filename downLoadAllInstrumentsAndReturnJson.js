const Fs = require('fs');
const Path = require('path');
const Fetch = require('./fetch.js');
const csvToJson = require("csvtojson");
const scriptDirectory  =  __dirname;
const FILE_LOCATION  =  Path.join( scriptDirectory, 'appv3', 'public', 'instruments' );

const fs = require('fs').promises;

async function writeJsonToFile(jsonData, fileName) {
    try {
        // Convert JSON object to string
        const jsonString = JSON.stringify(jsonData, null, 2); // null, 2 for pretty formatting

        // Write JSON string to file
        await fs.writeFile(fileName, jsonString);

        

        //console.log('JSON data has been written to', fileName);

      

        return;
    } catch (err) {
        console.error('Error writing JSON to file:', err);

        return;
    }
}






async function waitForFile(file, timeout = 10000) {
  const start = Date.now();
  while (!Fs.existsSync(file)) {
    if (Date.now() - start > timeout) {
      throw new Error("CSV download timed out: " + file);
    }
    await new Promise(r => setTimeout(r, 200));
  }
}

async function downLoadAllInstrumentsAndReturnJson() {
	let dl = await Fetch.downloadInstruments();
   





	 const fileInputName = Path.join(FILE_LOCATION, 'instruments.csv');

      await waitForFile(fileInputName);



	let csvresult = await csvToJson().fromFile(fileInputName);
	writeJsonToFile(csvresult, ""+scriptDirectory+"/all_instruments.json");

	Fs.unlink(fileInputName, function (err) {
		if (err) return console.log(err);
		// console.log( 'file deleted successfully' );
	});
	return csvresult;
}
exports.downLoadAllInstrumentsAndReturnJson = downLoadAllInstrumentsAndReturnJson;
