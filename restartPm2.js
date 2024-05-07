const pm2 = require('pm2');

// Function to restart PM2 process
function restartPM2Process(filePath, callback) {
  // Connect to PM2
  pm2.connect((error) => {
    if (error) {
      console.error('Error connecting to PM2:', error);
      return callback(error);
    }

    // Restart the process
    pm2.restart(filePath, (restartError) => {
      if (restartError) {
        console.error('Error restarting process:', restartError);
        pm2.disconnect(); // Disconnect from PM2
        return callback(restartError);
      }

      console.log('Process restarted successfully');
      pm2.disconnect(); // Disconnect from PM2
      return callback(null);
    });
  });
}

module.exports = restartPM2Process;