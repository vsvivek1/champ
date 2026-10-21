const fs = require("fs");

const { getKiteConnectInstance } = require('../getKiteConnectInstance.js');
const instruments1 = require("../appv3/public/instruments/instrumentsAll.json");
const { connectToDatabase } = require('../connectToDatabase.js');
var KiteConnect = require("kiteconnect").KiteConnect;
const { getTodaysAccessToken } = require('../getTodaysAccessToken.js');
const instrumentsForMining = require('../appv3/shared/instruments/instrumentsForMining.json')// assert { type: "json" };
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require("../learning/serviceAccountKey.json"))
});



///use seperate threads for fetch data // check latrere// remind me nexttime whane i start odeing thing file can u do that ??   

async function sendNotification(title, body) {
  await admin.messaging().send({
    token: "f3RVzEC8TZCsaajYiXKZJz:APA91bEIPDhDl699GVvmTaAwmusipTc91mRu1BHs8jCnKjTeWvpftK7feRQQxV-RKkLCrAjx0qyOP9RrS0BabEipncV6_OiVX-KVpiWvVk91DJH8FAyaVcHw",
    notification: {
      title: title,
      body: body,
    }
  });

  console.log("Notification sent!");
}


async function alertOIDrops () {
  await connectToDatabase();
  const kite = await getKiteConnectInstance();

const dayjs = require("dayjs");
 var accessTokenDoc= await getTodaysAccessToken();


 kite.setAccessToken(accessTokenDoc);


setInterval(() => {

    const now = dayjs();

    const start = dayjs().hour(9).minute(15).second(0);
    const end   = dayjs().hour(15).minute(30).second(0);

    const isMarketTime = true//now.isAfter(start) && now.isBefore(end);
    const isSecondOne = now.second() === 2;

    if (isMarketTime && isSecondOne) {
        alertOIDrops(kite);
    }

}, 1*1000);// every 10 minutes


async function alertOIDrops(kc) {

    try {

        // const pos = await kc.getPositions();

        // const allPositions = [
        //     ...(pos.day || []),
        //     ...(pos.net || [])
        // ];

  

        const instruments = instrumentsForMining//.map(i=>i.instrument_token[i]);

        if (instruments.length === 0) {
            console.log("No positions found");
            return;
        }

     
        const today = dayjs().format("YYYY-MM-DD");

        var from = `${today} 09:15:00`;

  

        const to   = `${today} 15:30:00`;



        for (const inst of instruments) {

            try {

            

                const data = await kc.getHistoricalData(
                    inst.instrument_token,
                    "minute",
                    from,
                    to,
                    false,
                    true
                );

                if (!data || data.length === 0) {
               
                    continue;
                }


               // console.log(data)
          const rows = data.map(async (d, i) => {
    const prevOi = i > 0 ? data[i - 1].oi : null;
    const deltaOi = prevOi !== null ? d.oi - prevOi : 0;

    if(deltaOi < -5) {  
        const chart = `https://kite.zerodha.com/chart/ext/ciq/${inst.exchange}/${inst.tradingsymbol}/${inst.instrument_token}`;

      await  sendNotification(`OI Drop Alert for ${inst.tradingsymbol}`, `OI dropped by ${deltaOi} at ${dayjs(d.date).format("HH:mm")} for ${inst.tradingsymbol} → ${chart}`);

console.log(
    `Buying check: OI drop of ${deltaOi} at ${dayjs(d.date).format("HH:mm")} for ${inst.tradingsymbol} → ${chart}`
);
   if(deltaOi > 5) {  
        const chart = `https://kite.zerodha.com/chart/ext/ciq/${inst.exchange}/${inst.tradingsymbol}/${inst.instrument_token}`;

              await  sendNotification(`OI Drop Alert for ${inst.tradingsymbol}`, `OI dropped by ${deltaOi} at ${dayjs(d.date).format("HH:mm")} for ${inst.tradingsymbol} → ${chart}`);

console.log(
    `Warning caution: selling check OI increase of ${deltaOi} at ${dayjs(d.date).format("HH:mm")} for ${inst.tradingsymbol} → ${chart}`
);
    }
}


    //sendAlert()



});

             
            } catch (err) {

                console.error(
                    `Error ${inst.tradingsymbol}:`,
                    err.message
                );

            }
        }

     

    } catch (err) {

        console.error(err.message);

    }
}



}

alertOIDrops()