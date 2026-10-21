const fs = require("fs");

const { getKiteConnectInstance } = require('../getKiteConnectInstance.js');
const instruments1 = require("../appv3/public/instruments/instrumentsAll.json");
const { connectToDatabase } = require('../connectToDatabase.js');
var KiteConnect = require("kiteconnect").KiteConnect;
const { getTodaysAccessToken } = require('../getTodaysAccessToken.js');
const instrumentsForMining = require('../appv3/shared/instruments/instrumentsForMining.json')// assert { type: "json" };

console.log('starting test');
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json"))
});

async function sendNotification(title, body) {
  await admin.messaging().send({
    token: "f3RVzEC8TZCsaajYiXKZJz:APA91bEIPDhDl699GVvmTaAwmusipTc91mRu1BHs8jCnKjTeWvpftK7eRQQxV-RKkLCrAjx0qyOP9RrS0BabEipncV6_OiVX-KVpiWvVk91DJH8FAyaVcHw",
    notification: {
      title: title,
      body: body,
    }
  });

  console.log("Notification sent!");
}


async function test() {
  await connectToDatabase();
  const kite = await getKiteConnectInstance();
  const XLSX = require("xlsx");
const dayjs = require("dayjs");
 var accessTokenDoc= await getTodaysAccessToken();
 console.log(accessTokenDoc ,'accessTokenDoc ');

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

}, 1000);// every 10 minutes

//alertOIDrops(kite)
/**
 * Download minute data of all instruments in positions
 * from today 09:15 to 15:30 and save to Excel
 *
 * @param {KiteConnect} kc
 */
async function alertOIDrops(kc) {

    try {

        const pos = await kc.getPositions();

        const allPositions = [
            ...(pos.day || []),
            ...(pos.net || [])
        ];

        // Remove duplicate instrument_tokens
        // const uniqueMap = {};
        // allPositions.forEach(p => {


        //     uniqueMap[p.instrument_token] = p;
        // });

      //  const instruments = Object.values(uniqueMap);

        const instruments = instrumentsForMining//.map(i=>i.instrument_token[i]);

        if (instruments.length === 0) {
            console.log("No positions found");
            return;
        }

       // console.log(`Downloading ${instruments.length} instruments`);

        // FIXED market time range
        const today = dayjs().format("YYYY-MM-DD");

        var from = `${today} 09:15:00`;

       // var from = dayjs().subtract(10, "minute").format("YYYY-MM-DD HH:mm:ss");

        const to   = `${today} 15:30:00`;

      //  const workbook = XLSX.utils.book_new();

        for (const inst of instruments) {

            try {

                console.log(`Fetching ${inst.tradingsymbol}`);

                const data = await kc.getHistoricalData(
                    inst.instrument_token,
                    "minute",
                    from,
                    to,
                    false,
                    true
                );

                if (!data || data.length === 0) {
                  await  sendNotification(`No data for ${inst.tradingsymbol}`, `No historical data found for ${inst.tradingsymbol} from ${from} to ${to}.`);
                    console.log(`No data for ${inst.tradingsymbol}`);
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
   if(deltaOi > 3) {  
        const chart = `https://kite.zerodha.com/chart/ext/ciq/${inst.exchange}/${inst.tradingsymbol}/${inst.instrument_token}`;

              await  sendNotification(`OI Drop Alert for ${inst.tradingsymbol}`, `OI dropped by ${deltaOi} at ${dayjs(d.date).format("HH:mm")} for ${inst.tradingsymbol} → ${chart}`);

console.log(
    `Warning caution: selling check OI increase of ${deltaOi} at ${dayjs(d.date).format("HH:mm")} for ${inst.tradingsymbol} → ${chart}`
);
    }
}


    //sendAlert()


    return {
        Time: dayjs(d.date).format("HH:mm"),
        Open: d.open,
        High: d.high,
        Low: d.low,
        Close: d.close,
        Volume: d.volume,
        oi: d.oi,
        deltaOi: deltaOi
    };
});

                // const sheet =
                //     XLSX.utils.json_to_sheet(rows);

                // const sheetName =
                //     inst.tradingsymbol.substring(0, 31);

                // XLSX.utils.book_append_sheet(
                //     workbook,
                //     sheet,
                //     sheetName
                // );

            } catch (err) {

                console.error(
                    `Error ${inst.tradingsymbol}:`,
                    err.message
                );

            }
        }

        // const fileName =
        //     dayjs().format("YYYY-MM-DD") + ".xlsx";

        // XLSX.writeFile(workbook, fileName);

        // console.log("Saved:", fileName);

    } catch (err) {

        console.error(err.message);

    }
}



}

test()