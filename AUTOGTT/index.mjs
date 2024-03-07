import CustomGTT from './CustomGtt.js';

function CheckNewDayOrInvalidAccessToken(gtt) {
  const now = new Date();
  if (gtt.day !== now.getDay() || gtt.access_token == null) {

    gtt.day =now.getDay();
    console.log("It's a new day or access token is not available.");
    return true; // Indicate that a new day or invalid access token
  }
  return false;
}

(async () => {
  const gtt = new CustomGTT();

  // Initial check
  if (CheckNewDayOrInvalidAccessToken(gtt)) {


    await gtt.initialize();
    await gtt.getHoldings();
    await gtt.processStocks();
    await gtt.startWebSockets();
    await gtt.subscribeTokens();
    await gtt.createTargetOrders()
    // Handle the case of a new day or invalid access token
    return;
  }

 
  //await gtt.createTargetOrders();
})();

console.log('index');

// Check every hour
const checkInterval = 1000 * 60 ; // 1 hour in milliseconds
setInterval(async () => {
  const gtt = new CustomGTT();
  if (CheckNewDayOrInvalidAccessToken(gtt)) {
    // Handle the case of a new day or invalid access token
    return;
  }
}, checkInterval);
