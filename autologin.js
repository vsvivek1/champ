const puppeteer = require('puppeteer');
const speakeasy = require('speakeasy');
//const { initWhatsApp, sendWhatsAppAlert } = require('./whatsapp/wp.js');




//process.exit()
const secret = 'ACQF3EOCBCTCD7KSGOI3QZ4VHLNFOZQH'; // your base32 TOTP secret

// -----------------------
// Helper: sleep
// -----------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -----------------------
// Helper: find selector in any frame
// -----------------------
async function waitForSelectorInAnyFrame(page, selector, timeout = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const frames = page.frames();

    for (const frame of frames) {
      try {
        const el = await frame.$(selector);
        if (el) {
          return { frame, el };
        }
      } catch (_) {}
    }

    await sleep(300);
  }

  throw new Error(`❌ Selector "${selector}" not found in any frame within ${timeout}ms`);
}

// -----------------------
// Main Login Function
// -----------------------
async function login() {

  const url = 'https://kite.zerodha.com/connect/login?api_key=wkcurst2vu5obug7';
  const username = 'DV3463';
  const password = '$$gauri1234';
  const userSelector = '#userid';
  const passSelector = '#password';
  const submitSelector = 'button[type="submit"]';

 const browser = await puppeteer.launch({
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ],
});

  const page = await browser.newPage();

  try {
    console.log('🌍 Opening login page...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // -----------------------
    // Username
    // -----------------------
    console.log('⌨️ Waiting for User ID...');
    await page.waitForSelector(userSelector, { visible: true, timeout: 20000 });
    await page.click(userSelector, { clickCount: 3 });
    await page.type(userSelector, username, { delay: 120 });

    // -----------------------
    // Password
    // -----------------------
    console.log('⌨️ Waiting for Password...');
    await page.waitForSelector(passSelector, { visible: true, timeout: 20000 });
    await page.click(passSelector, { clickCount: 3 });
    await page.type(passSelector, password, { delay: 120 });

    console.log('🚀 Submitting credentials...');
    await page.click(submitSelector);

    // -----------------------
    // Wait for OTP (inside frame-safe)
    // -----------------------
    console.log('🔐 Waiting for External TOTP field...');

    const { frame, el } = await waitForSelectorInAnyFrame(page, '#userid', 30000);

    console.log('✅ OTP field detected');

    const token = speakeasy.totp({
      secret,
      encoding: 'base32',
    });

    console.log('🔢 Generated OTP:', token);

    // Clear and type OTP
    await el.click({ clickCount: 3 });
    await frame.type('#userid', token, { delay: 120 });

    console.log('➡️ Submitting OTP...');
    await page.click(submitSelector);

    // -----------------------
    // Wait for redirect
    // -----------------------
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
      .catch(() => console.log('⚠️ Navigation not detected (SPA mode)'));

    console.log('🎉 Login flow completed');

    // Debug screenshot
    await page.screenshot({ path: 'after-login.png' });
    console.log('📸 Screenshot saved: after-login.png');

  } catch (err) {
    console.error('❌ Login failed:', err.message);
    await page.screenshot({ path: 'error.png' });
    console.log('📸 Error screenshot saved: error.png');
  }
}

login();
