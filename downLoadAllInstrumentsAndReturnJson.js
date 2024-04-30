const Fs = require('fs');
const Path = require('path');
const Fetch = require('./fetch.js');
const csvToJson = require("csvtojson");
const scriptDirectory  =  Path.dirname( process.argv[1] );
const FILE_LOCATION  =  Path.join( scriptDirectory, 'appv3', 'public', 'instruments' );








async function downLoadAllInstrumentsAndReturnJson() {
	let dl = await Fetch.downloadInstruments();





	let fileInputName = Path.resolve(__dirname, FILE_LOCATION, 'instruments.csv');



	let csvresult = await csvToJson().fromFile(fileInputName);


	Fs.unlink(fileInputName, function (err) {
		if (err) return console.log(err);
		// console.log( 'file deleted successfully' );
	});
	return csvresult;
}
exports.downLoadAllInstrumentsAndReturnJson = downLoadAllInstrumentsAndReturnJson;
