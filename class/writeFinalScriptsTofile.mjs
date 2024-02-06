
// const Path = require('path');

import Path from 'path';
const { createAndMoveFileFromJson } = require('./createAndMoveFileFromJson');




export async function writeFinalScriptsTofile(result) {


    return new Promise(async (res, rej) => {

        let today = new Date().toISOString().slice(0, 10);


        let fileOutputName = './' + 'pricePoints.json';
        let targetDir = Path.join(__dirname, '/../pricePoints/' + 'pricePoints.json');

        let out = await createAndMoveFileFromJson(fileOutputName, result,
            targetDir);



        res(out);





    });

}

// writeFinalScriptsTofile;
// module.exports=writeFinalScriptsTofile = writeFinalScriptsTofile;
