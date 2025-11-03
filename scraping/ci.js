/**
 * CI module
 * - Uses puppeteer-extra with stealth
 * - Supports:
 *    href === "LongBuildUp" (Moneycontrol)
 *    href === "ShortCovering" (Moneycontrol)
 *    else => Chartink screener slug (e.g., "large-cap-stocks")
 *
 * Exposed:
 *   CI.ExeCPriceFunction(token, accessToken)
 *   CI.execPriceWithDelay(instrument_token, accessToken)
 *   CI.scrap(href, accessToken)
 */

let Instruments = require('../getInstruments.js');
let pricePoint  = require('../pricePoints.js');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function launchBrowser() {
  const puppeteer = (await import('puppeteer-extra')).default;
  const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
  puppeteer.use(StealthPlugin());
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
    defaultViewport: { width: 1366, height: 850 },
  });
}

/**
 * Call the same AJAX endpoint that Chartink uses after you press "Run Scan".
 * Must run inside a loaded Chartink screener page.
 */
async function fetchChartinkResults(page) {
  await page.waitForFunction(() =>
    document.querySelector('meta[name="csrf-token"]') &&
    document.querySelector('textarea[name="scan_clause"]')
  , { timeout: 20000 });

  const payload = await page.evaluate(async () => {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const scanClauseEl = document.querySelector('textarea[name="scan_clause"]');
    const scanClause = scanClauseEl ? scanClauseEl.value : '';
    const params = new URLSearchParams({ scan_clause: scanClause });

    const res = await fetch('/screener/process', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': token,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: params.toString(),
      credentials: 'same-origin',
    });

    const json = await res.json();
    return json?.data || [];
  });

  return payload;
}

class CI {
  constructor() {
    console.log('CI: constructor');
  }

  static async ExeCPriceFunction(token, accessToken) {
    const a = new pricePoint(token, accessToken);
    return await a.getPricePoints();
  }

  static async execPriceWithDelay(instrument_token, accessToken) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const pricepoints = await CI.ExeCPriceFunction(instrument_token, accessToken);
          resolve(JSON.stringify(pricepoints));
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  }

  /**
   * Main scraper
   * @param {string} href - "LongBuildUp" | "ShortCovering" | <chartink-screener-slug>
   * @param {string} accessToken
   * @returns {Promise<Array>}
   */
  static async scrap(href, accessToken) {
    // Build URL once
    let url;
    if (href === 'LongBuildUp') {
      url = 'https://www.moneycontrol.com/stocks/fno/marketstats/futures/openint_inc/homebody.php?opttopic=openint_inc&optinst=allfut&sel_mth=1&sort_order=0';
    } else if (href === 'ShortCovering') {
      url = 'https://www.moneycontrol.com/stocks/fno/marketstats/futures/oi_dec_p_inc/homebody.php?opttopic=oi_dec_p_inc&optinst=allfut&sel_mth=1&sort_order=0';
    } else {
      url = `https://chartink.com/screener/${href}`;
    }

    for (let attempt = 1; attempt <= 2; attempt++) {
      let browser;
      try {
        browser = await launchBrowser();
        const page = await browser.newPage();

        // Spoof UA and language
        await page.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

        // Block heavy assets
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const type = req.resourceType();
          if (['image', 'font', 'media', 'stylesheet'].includes(type)) return req.abort();
          req.continue();
        });

        // Navigate
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        console.log({ href, url, stage: 'goto domcontentloaded' });

        // Handle cookie banners (best-effort)
        for (const sel of [
          '#onetrust-accept-btn-handler',
          "button[aria-label='Accept All']",
          "button:has-text('Accept')",
        ]) {
          try {
            await page.waitForSelector(sel, { timeout: 1500 });
            await page.click(sel);
            await sleep(250);
          } catch {}
        }

        // ================= MONEYCONTROL PATH =================
        if (href === 'LongBuildUp' || href === 'ShortCovering') {
          const mode = href;
          // Try a few selectors the site uses over time
          const candidates = ['.tblList', 'table.tblList', 'table.tablList', 'table.tbl_list'];
          let tableSel;
          for (const sel of candidates) {
            try {
              await page.waitForSelector(sel, { timeout: 15000 });
              await page.waitForFunction(
                (s) => (document.querySelector(s)?.querySelectorAll('tr').length || 0) > 1,
                { timeout: 15000 },
                sel
              );
              tableSel = sel;
              break;
            } catch {}
          }
          if (!tableSel) throw new Error('Moneycontrol table not found');
          console.log('moneycontrol table selector:', tableSel);

          // IMPORTANT: use $eval (single element), NOT $$eval
          const rawRows = await page.$eval(
            tableSel,
            (table, modeFromNode) => {
              const isSC = modeFromNode === 'ShortCovering';
              const isLB = modeFromNode === 'LongBuildUp';

              const pctNum = (s) => {
                if (s == null) return NaN;
                const str = String(s).replace(/[▲▼↑↓()]/g, '');
                const m = str.match(/-?\d+(\.\d+)?(?=%)/);
                return m ? parseFloat(m[0]) : NaN;
              };
              const num = (s) => {
                const n = parseFloat(String(s).replace(/,/g, ''));
                return Number.isFinite(n) ? n : NaN;
              };
              const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, '').trim();
              const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();

              // 1) Build header → index map (robust to reordering/wording)
              const headers = {};
              const headRow =
                table.querySelector('thead tr') ||
                Array.from(table.querySelectorAll('tr')).find((tr) => tr.querySelector('th'));

              if (headRow) {
                const ths = headRow.querySelectorAll('th,td');
                ths.forEach((th, i) => {
                  const h = norm(th.textContent);
                  headers[i] = h;
                });
              }

              // Helper: find column by keywords (first match wins)
              function findCol(keys, fallbackIdx = -1) {
                const entries = Object.entries(headers);
                for (const [idx, h] of entries) {
                  if (keys.some((k) => h.includes(k))) return parseInt(idx, 10);
                }
                return fallbackIdx;
              }

              // Likely header keys
              const col = {
                symbol: findCol(['stock', 'symbol', 'company'], 0),
                expiry: findCol(['expiry', 'exp', 'exp date'], 1),
                ltp:    findCol(['ltp', 'last', 'price', 'last traded'], 2),
                chg:    findCol(['chg', 'change', 'chng'], 3),
                hilo:   findCol(['high/low', 'hi/lo', 'high low', 'hi-low'], 4),
                avg:    findCol(['avg', 'average'], 5),
                oi:     findCol(['oi ', ' open interest', 'o.i'], 6),
                volpc:  findCol(['vol%', 'volume %', 'v%'], 7),
                vol:    findCol(['volume', 'vol '], 8),
                oipc:   findCol(['oi%', 'oi %', 'oi chg', 'oi change', 'chg in oi'], 10), // sometimes 10/11
              };

              const fallback = (i, fb) => (i >= 0 ? i : fb);

              const rows = [];
              const allRows = table.querySelectorAll('tr');

              for (const row of allRows) {
                const tds = row.querySelectorAll('td');
                if (!tds || tds.length < 6) continue; // skip header/tiny rows

                const txt = (i) => (tds[i]?.textContent || '').trim();
                const html = (i) => (tds[i]?.innerHTML || '').trim();

                // SYMBOL (prefer <a> text if present)
                let symIdx = fallback(col.symbol, 0);
                let symbolCellText = txt(symIdx);
                const firstCell = tds[symIdx];
                const codeFromLink = firstCell?.querySelector('a')?.textContent?.trim();
                let symbol = (codeFromLink || symbolCellText || '').toUpperCase();

                // Clean symbol if full name is present
                if (!/^[A-Z0-9]{1,15}$/.test(symbol)) {
                  const rough = symbol.toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/)[0];
                  if (rough && /^[A-Z0-9]{1,15}$/.test(rough)) symbol = rough;
                }

                const expiry   = txt(fallback(col.expiry, 1));
                const ltp      = num(txt(fallback(col.ltp, 2)));
                const chg      = txt(fallback(col.chg, 3));
                const changePc = pctNum(chg);

                // High/Low combined cell
                const hiloRaw  = html(fallback(col.hilo, 4));
                const bits     = String(hiloRaw).split('<br>');
                const high     = stripHtml(bits[0]);
                const low      = stripHtml(bits[1]);

                const avg      = num(txt(fallback(col.avg, 5)));
                const oi       = txt(fallback(col.oi, 6));
                const volPc    = pctNum(txt(fallback(col.volpc, 7)));
                const vol      = txt(fallback(col.vol, 8));
                const oiPc     = pctNum(txt(fallback(col.oipc, 11))); // try 11 if header missing

                if (
                  Number.isFinite(changePc) &&
                  Number.isFinite(oiPc) &&
                  Number.isFinite(volPc) &&
                  volPc > 1 &&
                  (
                    (isSC && changePc > 0 && oiPc < 0) || // Short Covering: price up, OI down
                    (isLB && changePc > 0 && oiPc > 0)    // Long Build-Up: price up, OI up
                  )
                ) {
                  rows.push({
                    symbol,
                    instrument_token: 'UNKNOWN_TOKEN', // map outside this eval
                    expiry,
                    ltp,
                    changePc,
                    high,
                    low,
                    avg,
                    oi,
                    oiPc,
                    vol,
                    volPc,
                    selected: true,
                    ohlc: null,
                  });
                }
              }

              return rows;
            },
            mode // <-- pass mode to the page function
          );

          // Map instrument tokens in Node context
          for (const r of rawRows) {
            try {
              let token = Instruments?.getInstrumentToken?.(r.symbol);
              if (!token && Instruments?.findByName) {
                token = Instruments.findByName(r.symbol)?.instrument_token || token;
              }
              r.instrument_token = token || 'UNKNOWN_TOKEN';
              r.selected = r.instrument_token !== 'UNKNOWN_TOKEN';
            } catch {
              r.instrument_token = 'UNKNOWN_TOKEN';
              r.selected = false;
            }
          }

          console.log('MC mapped sample:', rawRows.slice(0, 3).map(d => [d.symbol, d.instrument_token, d.oiPc]));
          await browser.close();
          return rawRows;
        }

        // ================= CHARTINK PATH =================
        // Load fully so CSRF + scan clause are present
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

        let ciRows = [];
        try {
          ciRows = await fetchChartinkResults(page); // main path
        } catch (e) {
          console.warn('Chartink AJAX fetch failed:', e?.message || e);
          ciRows = [];
        }
        console.log('chartink ajax rows:', ciRows?.length || 0);

        // Fallback: click "Run Scan" and scrape rendered table
        if (!ciRows?.length) {
          try {
            const clicked = await page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('button, a'))
                .find(b => (b.textContent || '').trim().toLowerCase().includes('run scan'));
              if (btn) { btn.click(); return true; }
              return false;
            });

            if (clicked) {
              await page.waitForSelector('#DataTables_Table_0 tbody tr', { timeout: 15000 });
              ciRows = await page.$$eval('#DataTables_Table_0 tbody tr', trs => trs.map(tr => {
                const tds = tr.querySelectorAll('td');
                const symbol = (tds[1]?.textContent || tds[2]?.textContent || '').trim();
                const changePc = parseFloat((tds[4]?.textContent || '0').replace('%',''));
                const price    = parseFloat((tds[5]?.textContent || '0').replace(/,/g,''));
                return symbol ? { nsecode: symbol, per_chg: changePc, close: price } : null;
              }).filter(Boolean));
            }
          } catch (e) {
            console.warn('Chartink fallback scrape failed:', e?.message || e);
          }
        }

        // Normalize + map tokens
        const finalRows = (ciRows || []).map(r => {
          const symbol = (r.nsecode || r.symbol || '').toUpperCase().trim();
          const price  = Number.isFinite(+r.close) ? +r.close : NaN;
          const change = Number.isFinite(+r.per_chg) ? +r.per_chg : NaN;

          let instrument_token = 'UNKNOWN_TOKEN';
          try {
            instrument_token = Instruments?.getInstrumentToken?.(symbol) || 'UNKNOWN_TOKEN';
            if (instrument_token === 'UNKNOWN_TOKEN' && r.name && Instruments?.findByName) {
              instrument_token = Instruments.findByName(r.name)?.instrument_token || 'UNKNOWN_TOKEN';
            }
          } catch {}

          return {
            symbol,
            price,
            changePc: change,
            instrument_token,
            selected: instrument_token !== 'UNKNOWN_TOKEN',
            ohlc: null, // safe default
          };
        });

        console.log('Chartink mapped sample:', finalRows.slice(0, 3).map(d => [d.symbol, d.instrument_token]));
        await browser.close();
        return finalRows;

      } catch (err) {
        if (browser) { try { await browser.close(); } catch {} }
        console.error(`Scrape attempt ${attempt} failed:`, err?.message || err);
        if (attempt === 2) return [];
        await sleep(1200);
      }
    }

    return [];
  }
}

module.exports = CI;
