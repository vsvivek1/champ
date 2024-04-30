const Path = require('path');
const { FILE_LOCATION, createAndMoveFileFromJson } = require('./FetchInstruments.js');

// let access_token  =  'WqDJozv3KifY6ZwVOUtF4R2kXvWXBkHA';
async function writeFinalScriptsTofile(jsonObj2, jsonObjWithOutCriteria) {


	try {
		return new Promise(async (res, rej) => {






			let fileOutputName = FILE_LOCATION + '/instrumentsForMining.json';
			let targetDir = Path.join(FILE_LOCATION + '/instrumentsForMining.json');

			let out = await createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir);


			let fileOutputNameWithOutCriteria = FILE_LOCATION + '/instrumentsForMiningWithOutCriteria.json';
			let out2 = await createAndMoveFileFromJson(fileOutputNameWithOutCriteria, jsonObjWithOutCriteria, targetDir);

			res(out);
			return;





		});

		return;
	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}

}
exports.writeFinalScriptsTofile = writeFinalScriptsTofile;