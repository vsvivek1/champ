// startInstruments.js
import { fork } from 'child_process';

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);

  if (reason && reason.message && reason.message.includes('ECONNABORTED')) {
    console.log('ECONNABORTED detected, exiting to restart...');
    process.exit(1); // PM2 will auto-restart
  }
});

// Define your instrument names\\

//'//FINNIFTY'
let instrumentsCat = ['BANKNIFTY', 'NIFTY','MIDCPNIFTY',"SENSEX"  ]; //'MIDCPNIFTY', 'FINNIFTY',


//instrumentsCat =['NIFTY'];
//instruments =['SENSEX','NIFTY'];
//'SENSEX',,'BANKEX'

//'STK' //'BANKEX'


//const instruments = [ 'NIFTY'];
// Function to start a new process for each instrument


function startProcess(instrumentName) {
    const process = fork('./main.mjs', [instrumentName]);
    
    process.on('message', (message) => {
        console.log(`Message from ${instrumentName} process:`, message);
    });

    process.on('error', (error) => {
        console.error(`Error in ${instrumentName} process:`, error);
    });

    process.on('exit', (code) => {
        console.log(global.clock,`${instrumentName} process exited with code ${code}`);
    });
}

// Start a process for each instrument
instrumentsCat.forEach((instrument) => startProcess(instrument));
