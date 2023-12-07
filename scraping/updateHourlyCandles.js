const KiteConnect = require('kiteconnect').KiteConnect;
const getAccessTokenModel = require('./common-functions/getAccessToken');
let api_key=process.env.api_key;

console.log(api_key);




    async function main() {
        let a = await getAccessToken();
       let access_token=a;

       print(a)
      
}
main();