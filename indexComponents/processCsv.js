const fs = require('fs');
const csv = require('csv-parser');

var firstKey1='';

// Function to read a CSV file, extract the first column, and save as JSON
function convertCsvToJson(csvFilePath) {
    const jsonArray = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv({ skipLines: 1 })) // Skip the first row
        .on('data', (row) => {
            // Extract the symbol column (first column)

            const [firstKey, firstValue] = Object.entries(row)[0];
            firstKey1=firstKey;
            // console.log(firstValue);
            // return;
            const tradingSymbol = firstValue; // Assuming 'SYMBOL \n' is the column name

            // Add the trading symbol to the JSON array
            jsonArray.push({ 'trading_symbol': tradingSymbol });
        })
        .on('end', () => {
            // Write the JSON array to a new file
            // const jsonFilePath = `${csvFilePath.split('.csv')[0]}.json`;
            const jsonFilePath = `${firstKey1}.json`;
            fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));
            console.log(`Converted ${csvFilePath} to JSON and saved as ${jsonFilePath}`);
        });
}

// Function to iterate through all CSV files in a directory
function convertAllCsvFilesToJson(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            // Check if file is CSV
            if (file.endsWith('.csv')) {
                // const csvFilePath = `${directoryPath}/${file}`;
                const csvFilePath = `${directoryPath}${file}`;
                convertCsvToJson(csvFilePath);
                // removeCsvFile(csvFilePath)
            }
        });
    });
}

// Example usage: Provide the directory path containing CSV files
const directoryPath = './';

// function removeCsvFile(csvFilePath) {
//     fs.unlink(csvFilePath, (err) => {
//         if (err) {
//             console.error(`Error removing file ${csvFilePath}:`, err);
//         } else {
//             console.log(`File ${csvFilePath} has been successfully removed.`);
//         }
//     });
// }

convertAllCsvFilesToJson(directoryPath);
