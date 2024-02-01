"use strict";
const Fs = require("fs");

function createAndMoveFileFromJson(fileOutputName, jsonObj2, targetDir) {

    return new Promise((res, rej) => {




        Fs.writeFile(fileOutputName, JSON.stringify(jsonObj2), 'utf8',

            function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
                console.log(fileOutputName + "JSON file has been saved.");


                Fs.copyFile(fileOutputName, targetDir,
                    (err) => {
                        if (err) throw err;
                        console.log('source.txt was copied to destination.txt');
                    });




                res(true);

            });


    });

}
exports.createAndMoveFileFromJson = createAndMoveFileFromJson;
