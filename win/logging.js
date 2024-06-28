import fs from 'fs';

// Create a writable stream
const logFile = fs.createWriteStream('app.log', { flags: 'a' });

// Override console methods
console.error = (message) => {
  logFile.write(`[ERROR] ${message}\n`);
};

console.warn = (message) => {
  logFile.write(`[WARN] ${message}\n`);
};