// startInstruments.js
import { fork } from 'child_process';

// Define your instrument names
var instruments = ['BANKNIFTY', 'NIFTY','MIDCPNIFTY', 'FINNIFTY',  ]; //'MIDCPNIFTY', 'FINNIFTY',

instruments =['NIFTY','SENSEX'];
//'SENSEX',,'BANKEX'

//'STK' //'BANKEX'


//const instruments = [ 'NIFTY'];
// Function to start a new process for each instrument
function startProcess(instrumentName) {
    const process = fork('./main.js', [instrumentName]);
    
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
instruments.forEach((instrument) => startProcess(instrument));
