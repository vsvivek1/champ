export async function displayScripts(kc) {


  // Create a mapping of instrument tokens to their respective trading symbols
  const tokenToSymbolMap =global.instrumentsForMining.reduce((map, instrument) => {
    map[instrument.instrument_token] = instrument.tradingsymbol;
    return map;
  }, {});

let it=global.instrumentsForMining

/* .filter(x=>x.qualifiedForTrade) */

.map(r=>r.tradingsymbol )

console.log(it,'qualified scripts');

return;

  // Map instruments to their instrument tokens
  let tokens =global.instrumentsForMining.map(i => i.instrument_token);

  // Fetch quotes for each instrument token using the kit4connect instance (kc)
  const quotes = await Promise.all(
    tokens.map(async (token) => {
      try {
        // Fetch the quote data from kc using the instrument token
        const quoteResponse = await kc.getQuote(token);

        // Check if the response is successful and contains data for the token
        if (quoteResponse.status === "success" && quoteResponse.data[token]) {
          const quoteData = quoteResponse.data[token];
          return {
            token,
            symbol: tokenToSymbolMap[token],
            lastPrice: quoteData.last_price,
            openingPrice: quoteData.ohlc.open
          };
        } else {
          console.error(`No valid data found for token ${token}`);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching quote for token ${token}:`, error);
        return null; // Handle error cases
      }
    })
  );

  // Filter out any null responses
  const validQuotes = quotes.filter(quote => quote !== null);

  // Separate scripts into long and short based on the comparison between last price and opening price
  const scriptsForLong = validQuotes
    .filter(quote => quote.lastPrice > quote.openingPrice)
    .map(quote => quote.symbol);

  const scriptsForShort = validQuotes
    .filter(quote => quote.lastPrice < quote.openingPrice)
    .map(quote => quote.symbol);

  // Display the results
  console.log('Scripts for Long:', scriptsForLong);
  console.log('Scripts for Short:', scriptsForShort);
}
