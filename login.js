const puppeteer = require("puppeteer");
const axios = require("axios");
const { totp } = require("otplib");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const AccessToken = require("./models/AccessTokens");
const { connectToDatabase, closeDatabaseConnection } = require("./connectToDatabase.js");
require("dotenv").config();

// ---- ENV (supports UPPER/lower)
const env = process.env;
const API_KEY     = env.API_KEY     || env.api_key;
const API_SECRET  = env.API_SECRET  || env.api_secret;
const USER_ID     = env.USER_ID     || env.user_id;
const PASSWORD    = env.PASSWORD    || env.password;
const TOTP_SECRET = env.TOTP_SECRET || env.totp_secret;
// Use .env REDIRECT_URL or fallback to the one you sent me
const REDIRECT_URL = env.REDIRECT_URL || "https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net/validate";

if (!API_KEY || !API_SECRET || !USER_ID || !PASSWORD || !TOTP_SECRET) {
  console.error("❌ Missing env: API_KEY, API_SECRET, USER_ID, PASSWORD, TOTP_SECRET");
  process.exit(1);
}

const TOKEN_FILE = "./.kite_token.json";
const KITE_LOGIN_URL =
  `https://kite.zerodha.com/connect/login?v=3` +
  `&api_key=${encodeURIComponent(API_KEY)}` +
  `&redirect_url=${encodeURIComponent(REDIRECT_URL)}`;
const KITE_TOKEN_URL = "https://api.kite.trade/session/token";

totp.options = { step: 30, window: [1, 1] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function next6amIST_UTC_ISO() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utcMs + 5.5 * 3600000);
  const target = new Date(ist);
  target.setHours(6, 0, 0, 0);
  if (ist >= target) target.setDate(target.getDate() + 1);
  return new Date(target.getTime() - 5.5 * 3600000).toISOString();
}

function saveAccessToken({ access_token, request_token }) {
  const doc = {
    api_key: API_KEY,
    request_token,
    access_token,
    generated_at: new Date().toISOString(),
    expires_at: next6amIST_UTC_ISO(),
    redirect_url: REDIRECT_URL,
    source: "headless_totp_login",
  };
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(doc, null, 2));
  console.log(`🎯 Saved to ${TOKEN_FILE}`);
}

async function saveAccessTokenToMongo({ access_token, user_id }) {
  const today = new Date().toISOString().slice(0, 10);
  const connected = await connectToDatabase();
  if (!connected) throw new Error("❌ Could not connect to MongoDB to save access token");

  await AccessToken.findOneAndUpdate(
    { date: today },
    { $set: { user_id, access_token }, $setOnInsert: { _id: new mongoose.Types.ObjectId(), date: today } },
    { upsert: true }
  );
  console.log(`🎯 Saved access token to MongoDB for ${today}`);
}

async function exchangeForAccessToken(requestToken) {
  const checksum = crypto
    .createHash("sha256")
    .update(`${API_KEY}${requestToken}${API_SECRET}`)
    .digest("hex");

  const form = new URLSearchParams();
  form.append("api_key", API_KEY);
  form.append("request_token", requestToken);
  form.append("checksum", checksum);

  const { data } = await axios.post(KITE_TOKEN_URL, form.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 45000,
  });

  const accessToken = data?.data?.access_token;
  const userId = data?.data?.user_id;
  if (!accessToken) throw new Error(`Unexpected Kite response: ${JSON.stringify(data)}`);
  return { accessToken, userId };
}

async function waitForRedirectToCallback(browser, currentPage, timeoutMs = 70000) {
  const deadline = Date.now() + timeoutMs;

  // 1) Watch existing page’s URL
  while (Date.now() < deadline) {
    try {
      const url = currentPage.url();
      if (url.startsWith(REDIRECT_URL)) return currentPage;
    } catch {}
    await sleep(300);
  }

  // 2) If not, try any newly opened page
  const targets = await browser.targets();
  for (const t of targets) {
    if (t.type() === "page" && t.url().startsWith(REDIRECT_URL)) {
      return await t.page();
    }
  }

  // 3) Keep polling targets for a bit
  while (Date.now() < deadline) {
    const t = await browser.waitForTarget(
      (x) => x.type() === "page" && x.url().startsWith(REDIRECT_URL),
      { timeout: Math.max(0, deadline - Date.now()) }
    ).catch(() => null);
    if (t) return await t.page();
  }

  return null;
}

async function typeIntoFieldAndVerify(node, value) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await node.click({ clickCount: 3 });
    await node.press("Backspace").catch(() => {});
    await node.type(value, { delay: 100 });
    const actual = await node.evaluate((el) => el.value);
    if (actual === value) return true;
  }
  return false;
}

async function typeTotp(page, otp) {
  const selectors = ["#pin", 'input[name="twofa-value"]', 'input[autocomplete="one-time-code"]', "#userid", 'input[type="number"]', 'input[type="password"]'];
  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 8000 });
      const nodes = await page.$$(sel);
      if (nodes.length === 1) {
        return await typeIntoFieldAndVerify(nodes[0], otp);
      }
      if (nodes.length >= 6 && otp.length === 6) {
        let allOk = true;
        for (let i = 0; i < 6; i++) {
          const ok = await typeIntoFieldAndVerify(nodes[i], otp[i]);
          if (!ok) allOk = false;
        }
        if (allOk) return true;
      }
    } catch {}
  }
  return false;
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: puppeteer.executablePath(),
    dumpio: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1280,800",
      "--disable-features=site-per-process,IsolateOrigins",
    ],
    protocolTimeout: 120000,
  });

  let page = await browser.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(90000);

  // Make it less “headless-y”
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.chrome = { runtime: {} };
  });

  try {
    // 1) Load Kite login with your redirect_url
    await page.goto(KITE_LOGIN_URL, { waitUntil: "domcontentloaded" });

    // 2) Credentials (current DOM uses #userid and #password)
    await page.waitForSelector("#userid", { timeout: 20000 });
    await page.type("#userid", USER_ID, { delay: 10 });

    await page.waitForSelector("#password", { timeout: 20000 });
    await page.type("#password", PASSWORD, { delay: 10 });

    // 3) Submit credentials
    await page.click("button[type='submit']");
    await sleep(800);

    // 4) TOTP page (same tab or new tab)—wait for it to appear, following tab swaps
    const start = Date.now();
    let otpEntered = false;
    while (Date.now() - start < 35000 && !otpEntered) {
      const pages = await browser.pages();
      const newest = pages[pages.length - 1];
      if (newest !== page) page = newest;

      const otp = totp.generate(TOTP_SECRET);
      otpEntered = await typeTotp(page, otp);
      if (otpEntered) {
        console.log("Generated TOTP:", otp);
        await page.click("button[type='submit']");
      } else {
        await sleep(250);
      }
    }
    if (!otpEntered) {
      try {
        await page.screenshot({ path: "./.login_debug.png" });
        const inputs = await page.$$eval("input", (els) =>
          els.map((el) => ({ id: el.id, name: el.name, type: el.type, autocomplete: el.autocomplete }))
        );
        console.error("🔎 Page URL at failure:", page.url());
        console.error("🔎 Inputs on page:", JSON.stringify(inputs));
        console.error("🔎 Screenshot saved to ./.login_debug.png");
      } catch (debugErr) {
        console.error("🔎 Failed to capture debug info:", debugErr.message);
      }
      throw new Error("❌ Could not find TOTP input on 2FA screen");
    }

    // 6) Wait for **redirect to your callback URL** and capture request_token
    const callbackPage = await waitForRedirectToCallback(browser, page, 70000);
    if (!callbackPage) {
      try {
        const allPages = await browser.pages();
        const urls = allPages.map((p) => {
          try { return p.url(); } catch { return "<err>"; }
        });
        console.error("🔎 Expected REDIRECT_URL prefix:", REDIRECT_URL);
        console.error("🔎 Open tab URLs at timeout:", JSON.stringify(urls));
        await page.screenshot({ path: "./.login_debug_redirect.png" });
        console.error("🔎 Screenshot saved to ./.login_debug_redirect.png");
      } catch (debugErr) {
        console.error("🔎 Failed to capture debug info:", debugErr.message);
      }
      throw new Error("❌ Did not see redirect to your REDIRECT_URL");
    }

    const redirectedUrl = callbackPage.url();
    console.log("Redirected to:", redirectedUrl);

    const requestToken = new URL(redirectedUrl).searchParams.get("request_token");
    if (!requestToken) throw new Error("❌ request_token not found on callback URL");

    console.log("✅ request_token:", requestToken);

    // 7) Exchange for access_token and save
    const { accessToken, userId } = await exchangeForAccessToken(requestToken);
    console.log("🎯 access_token:", accessToken);
    saveAccessToken({ access_token: accessToken, request_token: requestToken });
    await saveAccessTokenToMongo({ access_token: accessToken, user_id: userId });
  } finally {
    try { await browser.close(); } catch {}
    try { await closeDatabaseConnection(); } catch {}
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err?.response?.data || err?.message || err);
    process.exit(1);
  });
