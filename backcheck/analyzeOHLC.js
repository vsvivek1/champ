const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const readline = require('readline');

// Function to prompt user for file selection
const promptFileSelection = (files) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Available CSV files:');
    files.forEach((file, index) => console.log(`${index + 1}. ${file}`));

    rl.question('Select a file by number: ', (answer) => {
      const index = parseInt(answer, 10) - 1;
      if (index >= 0 && index < files.length) {
        resolve(files[index]);
      } else {
        console.log('Invalid selection. Please try again.');
        rl.close();
        resolve(promptFileSelection(files));
      }
    });
  });
};

// Function to parse CSV file into JSON
const parseCSVToJSON = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Function to convert JSON data to candlestick format
const convertToCandlestick = (data) => {
  return data.map(record => ({
    timestamp: new Date(record.Date), // Adjust based on your timestamp format
    open: parseFloat(record.Open),
    high: parseFloat(record.High),
    low: parseFloat(record.Low),
    close: parseFloat(record.Close),
  }));
};

// Function to format timestamp into a readable string
const formatTimestamp = (timestamp) => {
  return timestamp.toISOString().replace('T', ' ').replace('Z', '');
};

// Function to check if the closing price is above the opening price
const isCloseAboveOpen = (candlestick) => {
  return candlestick.close > candlestick.open;
};

// Function to identify hammer candles based on bottom shadow criteria
const isHammerCandle = (prevCandle) => {
  const body = Math.abs(prevCandle.close - prevCandle.open);
  const bottomShadow = prevCandle.open - prevCandle.low;
  return bottomShadow >= 3 * body;
};

// Function to analyze trading scenarios and calculate targets and profits
const analyzeTradingScenarios = (candlesticks) => {
  const scenarios = [];
  const qty = 1000; // Quantity for profit calculation
  
  for (let i = 1; i < candlesticks.length; i++) {
    const prev = candlesticks[i - 1];
    const curr = candlesticks[i];

    if (isCloseAboveOpen(curr) && isHammerCandle(prev) && curr.close > prev.high) {
      const target = curr.high + (curr.high - prev.low); // Target calculation
      const stopLoss = prev.low - (curr.high - prev.low); // Stop loss calculation
      const buyPrice = curr.close;
      
      // Calculate profit for 1000 qty
      const targetProfit = (target - buyPrice) * qty;
      const stopLossLoss = (buyPrice - stopLoss) * qty;

      scenarios.push({
        timestamp: formatTimestamp(curr.timestamp),
        buyPrice,
        target,
        stopLoss,
        targetProfit,
        stopLossLoss
      });
    }
  }

  return scenarios;
};

// Main function to process CSV files and analyze scenarios
const processCSVFiles = async (directory) => {
  try {
    const files = fs.readdirSync(directory).filter(file => path.extname(file) === '.csv');
    const selectedFile = await promptFileSelection(files);
    const filePath = path.join(directory, selectedFile);
    console.log(`Processing file: ${filePath}`);

    const jsonData = await parseCSVToJSON(filePath);
    const candlestickData = convertToCandlestick(jsonData);
    const scenarios = analyzeTradingScenarios(candlestickData);

    console.log(`Trading Scenarios for ${selectedFile}:`);
    scenarios.forEach(scenario => {
      console.log(`Timestamp: ${scenario.timestamp}`);
      console.log(`Buy Price: ${scenario.buyPrice}`);
      console.log(`Target: ${scenario.target}`);
      console.log(`Stop Loss: ${scenario.stopLoss}`);
      console.log(`Target Profit (for 1000 qty): ${scenario.targetProfit.toFixed(2)}`);
      console.log(`Stop Loss Loss (for 1000 qty): ${scenario.stopLossLoss.toFixed(2)}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error processing files:', error);
  }
};

// Replace with your directory path containing CSV files
const directoryPath = './';
processCSVFiles(directoryPath);
