import fs from 'fs';
import csvParser from 'csv-parser';

// Path to your CSV file
const CSV_PATH = 'niftype25050.csv';

// Utility to format dates in Indian time
const formatIST = (date) => date.toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
});

// Parse CSV into array of row objects
const parseCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    let ma20Col;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        if (!ma20Col) {
          ma20Col = Object.keys(data).find(
            col => col.toLowerCase().includes('ma') && col.includes('20')
          );
          if (!ma20Col) {
            return reject(new Error('MA20 column not found in CSV headers'));
          }
        }
        rows.push({
          date: new Date(data['Date']),
          open: parseFloat(data['Open']),
          high: parseFloat(data['High']),
          low: parseFloat(data['Low']),
          close: parseFloat(data['Close']),
          ma20: parseFloat(data[ma20Col])
        });
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
};

// Run backtest
const runBacktest = async () => {
  try {
    const rows = await parseCsv(CSV_PATH);
    rows.sort((a, b) => a.date - b.date);

    const trades = [];
    let inPosition = false;
    let entryTime = null;
    let entryPrice = 0;
    let entryDiff = 0;

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];

      const prevDiff = Math.abs(prev.ma20 - prev.close);
      const currDiff = Math.abs(curr.ma20 - curr.close);

      // Entry: currDiff >= 1.5 * prevDiff
      if (!inPosition && currDiff >= 3 * prevDiff) {
        inPosition = true;
        entryTime = curr.date;
        entryPrice = curr.ma20;
        entryDiff = currDiff;
      }
      // Exit: prev.close > prev.ma20 && curr.close < curr.ma20
      else if (inPosition && prev.close > prev.ma20 && curr.close < curr.ma20) {
        trades.push({
          entryTime,
          entryPrice,
          entryDiff,
          exitTime: curr.date,
          exitPrice: curr.close,
          exitDiff: Math.abs(curr.ma20 - curr.close)
        });
        inPosition = false;
      }
    }

    // Exit any open position at last bar
    if (inPosition) {
      const last = rows[rows.length - 1];
      trades.push({
        entryTime,
        entryPrice,
        entryDiff,
        exitTime: last.date,
        exitPrice: last.close,
        exitDiff: Math.abs(last.ma20 - last.close)
      });
    }

    // Format and display trades
    const output = trades.map(t => ({
      'Entry Time (IST)': formatIST(t.entryTime),
      'Entry Price': t.entryPrice.toFixed(2),
      'Entry Diff': t.entryDiff.toFixed(2),
      'Exit Time (IST)': formatIST(t.exitTime),
      'Exit Price': t.exitPrice.toFixed(2),
      'Exit Diff': t.exitDiff.toFixed(2),
      'P/L': (t.exitPrice - t.entryPrice).toFixed(2)
    }));

    console.table(output);

    // Summary stats
    const wins = trades.filter(t => t.exitPrice > t.entryPrice).length;
    const losses = trades.length - wins;
    const net = trades.reduce((sum, t) => sum + (t.exitPrice - t.entryPrice), 0);

    console.log(`Total Trades: ${trades.length}`);
    console.log(`Winning Trades: ${wins}`);
    console.log(`Losing Trades: ${losses}`);
    console.log(`Net P/L: ${net.toFixed(2)}`);
  } catch (err) {
    console.error('Backtest failed:', err.message);
  }
};

runBacktest();
