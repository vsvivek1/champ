const fs = require("fs");

const { getKiteConnectInstance } = require('../getKiteConnectInstance.js');
const instruments = require("../appv3/public/instruments/instrumentsAll.json");
const { connectToDatabase } = require('../connectToDatabase.js');
var KiteConnect = require("kiteconnect").KiteConnect;
const { getTodaysAccessToken } = require('../getTodaysAccessToken.js');

console.log('starting test');

async function test() {
  await connectToDatabase();
  const kite = await getKiteConnectInstance();
  const XLSX = require("xlsx");
const dayjs = require("dayjs");
 var accessTokenDoc= await getTodaysAccessToken();
 console.log(accessTokenDoc ,'accessTokenDoc ');

 kite.setAccessToken(accessTokenDoc);

downloadPositionsMinuteData(kite)
/**
 * Download minute data of all instruments in positions
 * from today 09:15 to 15:30 and save to Excel
 *
 * @param {KiteConnect} kc
 */
async function downloadPositionsMinuteData(kc) {

    try {

        const pos = await kc.getPositions();

        const allPositions = [
            ...(pos.day || []),
            ...(pos.net || [])
        ];

        // Remove duplicate instrument_tokens
        const uniqueMap = {};
        allPositions.forEach(p => {
            uniqueMap[p.instrument_token] = p;
        });

        const instruments = Object.values(uniqueMap);

        if (instruments.length === 0) {
            console.log("No positions found");
            return;
        }

        console.log(`Downloading ${instruments.length} instruments`);

        // FIXED market time range
        const today = dayjs().format("YYYY-MM-DD");

        const from = `${today} 09:15:00`;
        const to   = `${today} 15:30:00`;

        const workbook = XLSX.utils.book_new();

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
                    console.log(`No data for ${inst.tradingsymbol}`);
                    continue;
                }


                console.log(data)
                const rows = data.map(d => ({
                    Time: dayjs(d.date).format("HH:mm"),
                    Open: d.open,
                    High: d.high,
                    Low: d.low,
                    Close: d.close,
                    Volume: d.volume,
                    oi: d.oi
                }));

                const sheet =
                    XLSX.utils.json_to_sheet(rows);

                const sheetName =
                    inst.tradingsymbol.substring(0, 31);

                XLSX.utils.book_append_sheet(
                    workbook,
                    sheet,
                    sheetName
                );

            } catch (err) {

                console.error(
                    `Error ${inst.tradingsymbol}:`,
                    err.message
                );

            }
        }

        const fileName =
            dayjs().format("YYYY-MM-DD") + ".xlsx";

        XLSX.writeFile(workbook, fileName);

        console.log("Saved:", fileName);

    } catch (err) {

        console.error(err.message);

    }
}



}

test()