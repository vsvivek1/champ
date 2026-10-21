
const freezeLimits = [
    { symbol: "NIFTY", lot_size: 75, quantity_freeze_limit: 1800 },
    { symbol: "BANKNIFTY", lot_size: 25, quantity_freeze_limit: 900 },
    { symbol: "FINNIFTY", lot_size: 40, quantity_freeze_limit: 1800 },
    { symbol: "MIDCPNIFTY", lot_size: 75, quantity_freeze_limit: 2800 },
     { symbol: "SENSEX", lot_size: 75, quantity_freeze_limit: 1000 }
  ];
export function getFreezeLimit(tradingSymbol) {

    // Check longer/more specific symbols first -- e.g. "BANKNIFTY" contains
    // "NIFTY" as a substring, so matching in table order would silently give
    // BANKNIFTY/FINNIFTY/MIDCPNIFTY the plain NIFTY freeze limit.
    const sortedLimits = [...freezeLimits].sort((a, b) => b.symbol.length - a.symbol.length);

    for (const item of sortedLimits) {
      if (tradingSymbol.includes(item.symbol)) {
        return item.quantity_freeze_limit;
      }
    }
    return null; // Return null if no match is found
  }
  