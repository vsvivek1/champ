function getUniqueNames(jsonArray) {
   const uniqueNames = new Set();
   jsonArray.forEach(item => {
      if (item.name) {
         uniqueNames.add(item.name);
      }
   });
   return Array.from(uniqueNames);
}

function getUniqueInstruments(jsonArray) {
   const uniqueNames = new Set();
   jsonArray.forEach(item => {
      if (item.instrument_token) {
         uniqueNames.add(parseInt(item.instrument_token));
      }
   });
   return Array.from(uniqueNames);
}

function getUniqueTradingSymbols(jsonArray) {
   const uniqueNames = new Set();
   jsonArray.forEach(item => {
      if (item.instrument_token) {
         uniqueNames.add(item.tradingsymbol);
      }
   });
   return Array.from(uniqueNames);
}
exports.getUniqueNames = getUniqueNames;
exports.getUniqueInstruments = getUniqueInstruments;
exports.getUniqueTradingSymbols = getUniqueTradingSymbols;
