
const freezeLimits = [
    { symbol: "NIFTY", lot_size: 75, quantity_freeze_limit: 1800 },
    { symbol: "BANKNIFTY", lot_size: 25, quantity_freeze_limit: 900 },
    { symbol: "FINNIFTY", lot_size: 40, quantity_freeze_limit: 1800 },
    { symbol: "MIDCPNIFTY", lot_size: 75, quantity_freeze_limit: 2800 }
  ];
export function getFreezeLimit(tradingSymbol) {



    for (const item of freezeLimits) {
      if (tradingSymbol.includes(item.symbol)) {
        
        
return item.quantity_freeze_limit;


      /*   return {
          symbol: item.symbol,
          lot_size: item.lot_size,
          quantity_freeze_limit: item.quantity_freeze_limit
        } */;
      }
    }
    return null; // Return null if no match is found
  }
  