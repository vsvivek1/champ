const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
let Instruments = require('../getInstruments.js');
let pricePoint = require('../pricePoints.js');

class CI {
  constructor() {
    console.log('from ci');
  }

  static async ExeCPriceFunction(token, accessToken) {
    let a = new pricePoint(token, accessToken);
    return await a.getPricePoints();
  }

  static async execPriceWithDelay(instrument_token, accessToken) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          let pricepoints = await CI.ExeCPriceFunction(instrument_token, accessToken);
          resolve(JSON.stringify(pricepoints));
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  }

 static async scrap(href, accessToken) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const url = href === "LongBuildUp"
    ? "https://www.moneycontrol.com/stocks/fno/marketstats/futures/openint_inc/homebody.php?opttopic=openint_inc&optinst=allfut&sel_mth=1&sort_order=0"
    : `https://chartink.com/screener/${href}`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let browser;
    try {
      const puppeteer = (await import("puppeteer-extra")).default;
      const StealthPlugin = (await import("puppeteer-extra-plugin-stealth")).default;
      puppeteer.use(StealthPlugin());

      browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
        ],
        defaultViewport: { width: 1366, height: 850 },
      });

      const page = await browser.newPage();

      // spoof browser fingerprint
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

      // block heavy assets
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "font", "media", "stylesheet"].includes(type)) return req.abort();
        req.continue();
      });

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });

      // try consent/cookie clicks
      for (const sel of [
        "#onetrust-accept-btn-handler",
        "button[aria-label='Accept All']",
        "button:has-text('Accept')"
      ]) {
        try {
          await page.waitForSelector(sel, { timeout: 2000 });
          await page.click(sel);
          await sleep(300);
        } catch {}
      }

      if (href === "LongBuildUp") {
        const candidates = [".tblList", "table.tblList", "table.tablList", "table.tbl_list"];
        let found;
        for (const sel of candidates) {
          try {
            await page.waitForSelector(sel, { timeout: 10000 });
            await page.waitForFunction(
              (s) => (document.querySelector(s)?.querySelectorAll("tr").length || 0) > 1,
              { timeout: 10000 },
              sel
            );
            found = sel;
            break;
          } catch {}
        }
        if (!found) throw new Error("Moneycontrol table not found");

        const data = await page.$$eval(`${found} tr`, (rows) => {
          const out = [];
          for (const row of rows) {
            const tds = row.querySelectorAll("td");
            if (tds.length < 12) continue;

            const txt = (i) => (tds[i]?.textContent || "").trim();
            const html = (i) => (tds[i]?.innerHTML || "").trim();

            const symbol = txt(0);
            const expiry = txt(1);
            const ltp = txt(2).replace(/,/g, "");
            const ch = txt(3);
            const [chg, , chgPcRaw] = ch.split(" ");
            const changePc = parseFloat(chgPcRaw);
            const tdHiLow = String(html(4)).split("<br>");
            const strip = (s) => (s || "").replace(/<[^>]*>/g, "").trim();
            const high = strip(tdHiLow[0]);
            const low = strip(tdHiLow[1]);
            const avg = txt(5).replace(/,/g, "");
            const oi = txt(6);
            const volPc = parseFloat((txt(7).split("%")[0] || "").trim());
            const vol = txt(8);
            const oiPc = parseFloat((txt(11).split("%")[0] || "").trim());

            if (Number.isFinite(changePc) && Number.isFinite(oiPc) && Number.isFinite(volPc) &&
                changePc > 0 && oiPc > 0 && volPc > 1) {
              out.push({
                symbol,
                instrument_token: "UNKNOWN_TOKEN",
                expiry,
                ltp,
                change: chg,
                changePc,
                high,
                low,
                avg,
                oi,
                oiPc,
                vol,
                volPc,
                selected: true,
              });
            }
          }
          return out;
        });

        for (const r of data) {
          r.instrument_token =
            (globalThis.Instruments?.getInstrumentToken?.(r.symbol)) || "UNKNOWN_TOKEN";
        }

        await browser.close();
        return data;
      } else {
        let ready = false;
        try {
          await page.waitForSelector(".scan_results_table tbody tr", { timeout: 12000 });
          await page.waitForFunction(
            () => document.querySelectorAll(".scan_results_table tbody tr").length > 0,
            { timeout: 10000 }
          );
          ready = true;
        } catch {}

        let data = [];
        if (ready) {
          data = await page.$$eval(".scan_results_table tbody tr", (rows) =>
            rows.map((tr) => {
              const tds = tr.querySelectorAll("td");
              const symbol = (tds[2]?.querySelector("a")?.textContent || "").trim();
              const change = parseFloat((tds[4]?.textContent || "").trim().split("%")[0]);
              const price = parseFloat((tds[5]?.textContent || "").trim());
              return { symbol, changePc: change, price };
            }).filter(r => r.symbol && Number.isFinite(r.changePc) && Number.isFinite(r.price))
          );
        }

        data = data.map((r) => ({
          ...r,
          instrument_token:
            (globalThis.Instruments?.getInstrumentToken?.(r.symbol)) || "UNKNOWN_TOKEN",
          selected: true,
          ohlc: "",
        }));

        await browser.close();
        return data;
      }
    } catch (err) {
      if (browser) try { await browser.close(); } catch {}
      if (attempt === 2) {
        console.error("Scrape failed:", err?.message || err);
        return [];
      }
      await sleep(1200);
    }
  }
  return [];
}



  static async optionChain() {
    const url = 'https://www.edelweiss.in/market/nse-option-chain';

    return puppeteer.launch().then(async (browser) => {
      const page = await browser.newPage();
      await page.goto(url);
      const html = await page.content();
      await browser.close();
      
      let $ = cheerio.load(html);
      let ois = [];

      $('.table.ed tbody tr').each((index, element) => {
        let oc = {
          CallOi: $(element).children("td").eq(1).text().trim().replace('-', 0),
          CallOiChange: $(element).children("td").eq(2).text().trim().replace('-', 0),
          CallOiVolume: $(element).children("td").eq(3).text().trim().replace('-', 0),
          CallOiIV: $(element).children("td").eq(4).text().trim().replace('-', 0),
          CallOiLTP: $(element).children("td").eq(5).text().trim().replace('-', 0),
          CallOiPriceChange: $(element).children("td").eq(6).text().trim().replace('-', 0),
          CallOiBidQty: $(element).children("td").eq(7).text().trim().replace('-', 0),
          CallOiBidprice: $(element).children("td").eq(8).text().trim().replace('-', 0),
          CallOiAskprice: $(element).children("td").eq(9).text().trim().replace('-', 0),
          CallOiAskQty: $(element).children("td").eq(10).text().trim().replace('-', 0),
          StrikePrice: $(element).children("td").eq(11).text().trim().replace('-', 0),
        };

        ois.push(oc);
      });

      return ois;
    }).catch((error) => {
      console.error('Error in optionChain function:', error);
      return [];
    });
  }
}

module.exports = CI;
