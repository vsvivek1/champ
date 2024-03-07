const { parentPort } = require('worker_threads');

// Some heavy computation or other tasks
const result = doHeavyComputation();

// Send result back to the main thread
parentPort.postMessage(result);

function doHeavyComputation() {
  // Your heavy computation logic goes here
  return 'Result of heavy computation';
}