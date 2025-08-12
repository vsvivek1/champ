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
  let url = href === "LongBuildUp"
    ? 'https://www.moneycontrol.com/stocks/fno/marketstats/futures/openint_inc/homebody.php?opttopic=openint_inc&optinst=allfut&sel_mth=1&sort_order=0'
    : `https://chartink.com/screener/${href}`;

  console.log('Fetching:', url);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    let ois = [];

    if (href === 'LongBuildUp') {
      $('.tblList tr').each((index, element) => {
        const tds = $(element).find('td');
        if (tds.length < 12) return;

        const symbol = tds.eq(0).text().trim();
        const instrument_token = Instruments.getInstrumentToken(symbol) || "UNKNOWN_TOKEN";
        const expiry = tds.eq(1).text().trim();
        const ltp = tds.eq(2).text().trim().replace(/,/g, "");
        const change = tds.eq(3).text().split(" ")[0];
        const changePc = tds.eq(3).text().split(" ")[2];
        const tdHiLow = String(tds.eq(4).html()).split('<br>');
        const high = tdHiLow[0];
        const low = tdHiLow[1];
        const avg = tds.eq(5).text().trim().replace(/,/g, "");
        const oi = tds.eq(6).text().trim();
        const vol = tds.eq(8).text().trim();
        const volPc = tds.eq(7).text().trim().split('%')[0];
        const oiPc = tds.eq(11).text().trim().split('%')[0];

        if (!isNaN(parseFloat(changePc)) && !isNaN(oiPc) && parseFloat(changePc) > 0 && parseFloat(oiPc) > 0 && parseFloat(volPc) > 1) {
          ois.push({
            symbol,
            instrument_token,
            expiry,
            ltp,
            change,
            changePc,
            high,
            low,
            avg,
            oi,
            oiPc,
            vol,
            volPc,
            selected: true
          });
        }
      });

    } else {
      $('.scan_results_table tbody tr').each((index, element) => {
        const tds = $(element).find('td');
        const symbol = tds.eq(2).find('a').text().trim();
        const change = parseFloat(tds.eq(4).text().trim().split('%')[0]);
        const price = parseFloat(tds.eq(5).text().trim());
        const instrument_token = Instruments.getInstrumentToken(symbol) || "UNKNOWN_TOKEN";

        if (!instrument_token || isNaN(change) || isNaN(price)) return;

        ois.push({
          symbol,
          instrument_token,
          changePc: change,
          price,
          selected: true,
          ohlc: ''
        });
      });
    }

    return ois;
  } catch (error) {
    console.error('Error in scrap function:', error);
    return [];
  }
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
