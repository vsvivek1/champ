// Initialize log queue and a set to track unique messages
const logQueue = [];
const loggedMessages = new Set();

// Original console.log method reference
const originalConsoleLog = console.log;

// Function to override console.log
function overrideConsoleLog() {
  console.log = function (...args) {
    // Format the message
    const message = args.map(arg => (typeof arg == 'object' ? JSON.stringify(arg) : arg)).join(' ');

    // Check if the message has already been logged
    if (!loggedMessages.has(message)) {
      // If not, add it to the log queue and mark it as logged
      logQueue.push(message);
      loggedMessages.add(message);
    }
  };
}

// Function to flush the log queue
function flushLogs() {
  if (logQueue.length > 0) {
    originalConsoleLog('--- Log Start ---');
    logQueue.forEach(log => originalConsoleLog(log));
    originalConsoleLog('--- Log End ---');
    // Clear the log queue after flushing
    logQueue.length = 0;
  }
}

// Function to start the logging mechanism
function startLogging() {
  // Override console.log immediately
  overrideConsoleLog();

  // Flush logs immediately when the app starts
  flushLogs();

  // Set an interval to flush logs every 30 seconds
  //setInterval(flushLogs, 30000);
  setInterval(flushLogs, 5000);
}

// Export the startLogging function
export { startLogging };
