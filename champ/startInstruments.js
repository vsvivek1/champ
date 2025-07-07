// startInstruments.js
import { fork } from 'child_process';

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});


// Define your instrument names
let instrumentsCat = ['BANKNIFTY', 'NIFTY','MIDCPNIFTY', 'FINNIFTY',"SENSEX"  ]; //'MIDCPNIFTY', 'FINNIFTY',

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
        console.log(`${instrumentName} process exited with code ${code}`);
    });
}

// Start a process for each instrument
instrumentsCat.forEach((instrument) => startProcess(instrument));
