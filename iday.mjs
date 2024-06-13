// main.js
import { instruAll } from './instruments/instruAll.js';

const filteredInstruments = instruAll.filter(instrument => instrument.exchange === 'NSE');

console.log(filteredInstruments);
