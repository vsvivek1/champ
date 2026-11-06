

let AccesTocken = require('./models/AccessTokens');
const { connectToDatabase } = require('./connectToDatabase.js');
/*
"today" is worked out on every call, not once when the file is required.

It used to be a module-level const. A long-running process (chartApp sits
in pm2 for days) therefore kept asking for the date it was STARTED on, so
after midnight every lookup missed and guardRefresh failed every 15
seconds with a stale session -- incident 3 in incidents-2026-11-05.md. The
process looked alive and was blind.
*/
async function getTodaysAccessToken(params={}) {

   const today = new Date().toISOString().slice(0, 10);

   const accessTokenDoc = await AccesTocken.findOne({ 'date': today }, 'access_token');
   if (!accessTokenDoc) {
      console.log("Access token not found for today",today);
      return -1;
   }

   return accessTokenDoc.access_token;
}
exports.getTodaysAccessToken = getTodaysAccessToken;
