

let AccesTocken = require('./models/AccessTokens');
let today  =  new Date(  ).toISOString(  ).slice( 0,10 );

async function getTodaysAccessToken(params) {

   console.log(today)

   const accessTokenDoc = await AccesTocken.findOne({ 'date': today }, 'access_token');
   if (!accessTokenDoc) {
      console.log("Access token not found for today");
      return -1;
   }

   return accessTokenDoc.access_token;
}
exports.getTodaysAccessToken = getTodaysAccessToken;
