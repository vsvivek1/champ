const fs = require('fs');
const path = require('path');

function updateJSONFile(filePath, newData, replaceExisting = false) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (accessErr) => {
      if (accessErr) {
        // If the file doesn't exist, create it with the provided data
        const directory = path.dirname(filePath);
        fs.mkdirSync(directory, { recursive: true }); // Create directory recursively if it doesn't exist
        fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            reject(writeErr);
            return;
          }
          resolve('JSON file created and updated successfully');
        });
      } else {
        // If the file exists
        fs.readFile(filePath, 'utf8', (readErr, fileData) => {
          if (readErr) {
            reject(readErr);
            return;
          }

          let jsonData;
          try {
            // Parse the JSON data
            jsonData = JSON.parse(fileData);
          } catch (parseError) {
            reject(parseError);
            return;
          }

          if (replaceExisting) {
            // Replace existing data with new data
            jsonData = newData;
          } else {
            // Merge existing data with new data
            Object.assign(jsonData, newData);
          }

          // Write the updated JSON data back to the file
          fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
              reject(writeErr);
              return;
            }
            resolve('JSON file updated successfully');
          });
        });
      }
    });
  });
}

// Example usage:
//const filePath = '/Users/vivekvs/findnew/appv3/public/instruments/instrumentsForMiningX.json';

;

module.exports=updateJSONFile;
