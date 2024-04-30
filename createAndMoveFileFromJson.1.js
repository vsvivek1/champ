const fs = require('fs');
const { FILE_LOCATION } = require('./FetchInstruments.js');

function createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir) {
	return new Promise((resolve, reject) => {
		fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8', (err) => {
			if (err) {
				console.error("An error occurred while writing JSON Object to File.");
				reject(err);
				return;
			}

			fs.copyFile(FILE_LOCATION + '/instrumentsForMining.json', targetDir, (err) => {
				if (err) {
					console.error("An error occurred while copying the file.");
					reject(err);
					return;
				}
				console.log('File copied successfully.');
				resolve(true);
			});
		});
	});
}
