const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const KiteConnect = require("kiteconnect").KiteConnect;

async function getKiteConnectInstance(accessToken ) {



   
   
   /*  api_key: 'wkcurst2vu5obug7',
    root: 'https://api.kite.trade',
    timeout: 7000,
    debug: false,
    access_token: 'h4PDfAU5o3I5n6ETBD1igCwJW3Xgxwis',
    default_login_uri: 'https://kite.zerodha.com/connect/login',
    session_expiry_hook: null,
    PRODUCT_MIS: 'MIS',
    PRODUCT_CNC: 'CNC',
    PRODUCT_NRML: 'NRML',
    PRODUCT_CO: 'CO',
    PRODUCT_BO: 'BO',
    ORDER_TYPE_MARKET: 'MARKET',
    ORDER_TYPE_LIMIT: 'LIMIT',
    ORDER_TYPE_SLM: 'SL-M',
    ORDER_TYPE_SL: 'SL',
    VARIETY_REGULAR: 'regular',
    VARIETY_BO: 'bo',
    VARIETY_CO: 'co',
    VARIETY_AMO: 'amo',
    VARIETY_ICEBERG: 'iceberg',
    VARIETY_AUCTION: 'auction',
    TRANSACTION_TYPE_BUY: 'BUY',
    TRANSACTION_TYPE_SELL: 'SELL',
    VALIDITY_DAY: 'DAY',
    VALIDITY_IOC: 'IOC',
    VALIDITY_TTL: 'TTL',
    EXCHANGE_NSE: 'NSE',
    EXCHANGE_BSE: 'BSE',
    EXCHANGE_NFO: 'NFO',
    EXCHANGE_CDS: 'CDS',
    EXCHANGE_BCD: 'BCD',
    EXCHANGE_BFO: 'BFO',
    EXCHANGE_MCX: 'MCX',
    MARGIN_EQUITY: 'equity',
    MARGIN_COMMODITY: 'commodity',
    STATUS_CANCELLED: 'CANCELLED',
    STATUS_REJECTED: 'REJECTED',
    STATUS_COMPLETE: 'COMPLETE',
    GTT_TYPE_OCO: 'two-leg',
    GTT_TYPE_SINGLE: 'single',
    GTT_STATUS_ACTIVE: 'active',
    GTT_STATUS_TRIGGERED: 'triggered',
    GTT_STATUS_DISABLED: 'disabled',
    GTT_STATUS_EXPIRED: 'expired',
    GTT_STATUS_CANCELLED: 'cancelled',
    GTT_STATUS_REJECTED: 'rejected',
    GTT_STATUS_DELETED: 'deleted',
    POSITION_TYPE_DAY: 'day',
    POSITION_TYPE_OVERNIGHT: 'overnight',
    setAccessToken: [Function (anonymous)],
    setSessionExpiryHook: [Function (anonymous)],
    getLoginURL: [Function (anonymous)],
    generateSession: [Function (anonymous)],
    invalidateAccessToken: [Function (anonymous)],
    renewAccessToken: [Function (anonymous)],
    invalidateRefreshToken: [Function (anonymous)],
    getProfile: [Function (anonymous)],
    getMargins: [Function (anonymous)],
    placeOrder: [Function (anonymous)],
    modifyOrder: [Function (anonymous)],
    cancelOrder: [Function (anonymous)],
    exitOrder: [Function (anonymous)],
    getOrders: [Function (anonymous)],
    getOrderHistory: [Function (anonymous)],
    getTrades: [Function (anonymous)],
    getOrderTrades: [Function (anonymous)],
    orderMargins: [Function (anonymous)],
    orderBasketMargins: [Function (anonymous)],
    getHoldings: [Function (anonymous)],
    getAuctionInstruments: [Function (anonymous)],
    getPositions: [Function (anonymous)],
    convertPosition: [Function (anonymous)],
    getInstruments: [Function (anonymous)],
    getQuote: [Function (anonymous)],
    getOHLC: [Function (anonymous)],
    getLTP: [Function (anonymous)],
    getHistoricalData: [Function (anonymous)],
    getTriggerRange: [Function (anonymous)],
    getMFOrders: [Function (anonymous)],
    placeMFOrder: [Function (anonymous)],
    cancelMFOrder: [Function (anonymous)],
    getMFSIPS: [Function (anonymous)],
    placeMFSIP: [Function (anonymous)],
    modifyMFSIP: [Function (anonymous)],
    cancelMFSIP: [Function (anonymous)],
    getMFHoldings: [Function (anonymous)],
    getMFInstruments: [Function (anonymous)],
    getGTTs: [Function (anonymous)],
    getGTT: [Function (anonymous)],
    _getGTTPayload: [Function (anonymous)],
    placeGTT: [Function (anonymous)],
    modifyGTT: [Function (anonymous)],
    deleteGTT: [Function (anonymous)],
    validatePostback: [Function (anonymous)] */


  
   require('dotenv').config();
   const api_secret = process.env.api_secret;
   //const api_key = process.env.api_key;
   const api_key = 'wkcurst2vu5obug7';

if(!accessToken ){

   accessToken = await getTodaysAccessToken();

}

   //console.log(accessToken ,'accessToken  from kiote donnect instance ');
   


   const kite = new KiteConnect({
      api_key: api_key
   });

   //console.log('4m kc inst',accessToken );
   kite.setAccessToken(accessToken);

  
   return kite;
}
module.exports=getKiteConnectInstance;
exports.getKiteConnectInstance = getKiteConnectInstance;
