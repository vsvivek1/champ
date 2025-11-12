
const puppeteer = require('puppeteer');
const { totp } = require('otplib');
const crypto = require('crypto');

const speakeasy = require('speakeasy');

const secret = 'ACQF3EOCBCTCD7KSGOI3QZ4VHLNFOZQH'; // paste your copied key here

const token = speakeasy.totp({
  secret,
  encoding: 'base32'
});


async function login({
  url,
  userSelector,
  passSelector,
  submitSelector,
  username,
  password,
  headless = false,
  waitAfterSubmitMs = 5000,
  pauseFor2FA = false, // if true, script will pause after submitting for manual 2FA input
}) {
  if (!url || !userSelector || !passSelector || !submitSelector) {
    throw new Error('Missing required parameters: url, userSelector, passSelector, submitSelector');
  }
  if (!username || !password) {
    throw new Error('Missing username or password. Provide via env or arguments.');
  }

  const browser = await puppeteer.launch({ headless, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    // optional: set a viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the username field and type username
    console.log('Waiting for user selector', userSelector);
    await page.waitForSelector(userSelector, { visible: true, timeout: 15000 });
    await page.click(userSelector, { clickCount: 3 });
    await page.type(userSelector, username, { delay: 1000 }); // small human-like delay

    // Wait for the password field and type password
    console.log('Waiting for password selector', passSelector);
    await page.waitForSelector(passSelector, { visible: true, timeout: 15000 });
    await page.click(passSelector, { clickCount: 3 });
    await page.type(passSelector, password, { delay: 500 });

    // Optionally show the typed values (be careful in logs — avoid printing secrets in production)
    console.log('Credentials entered. Submitting form...');

    // Wait for submit button and click it
    await page.waitForSelector(submitSelector, { visible: true, timeout: 15000 });


    await Promise.all([
      page.click(submitSelector),


      // page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      //   // navigation might not happen (AJAX submit) — ignore timeout here
      // }),
  
  
    ]);

    console.log('Submit action performed.');

    await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 }).catch(() => {});


     await page.waitForSelector('#userid', { visible: true, timeout: 15000 });
    await page.click('#userid', { clickCount: 3 });
       await page.type('#userid', token, { delay: 500 });
          await page.click(submitSelector);

          await   page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      //   // navigation might not happen (AJAX submit) — ignore timeout here
      });
  



    // if (pauseFor2FA) {
  

    //   console.log('Paused for manual 2FA entry. Press ENTER in this terminal when you finished 2FA (or close the browser).');
    //   await waitForEnter();
    //   console.log('Continuing after user confirmed 2FA.');
    // } else {
    //   // wait a bit for the page to settle and check for successful login indicator
    //   await page.waitForTimeout(waitAfterSubmitMs);
    // }

    // Example: check if some element that only shows when logged in is present
    // const loggedInSelector = '#profile, .account, .logout';
    // if (await page.$(loggedInSelector)) console.log('Likely logged in!');
    // else console.log('Login may not have succeeded — check page state manually.');

    // Save screenshot for debugging
    // await page.screenshot({ path: 'after-login.png', fullPage: false });
    // console.log('Saved screenshot after login: after-login.png');

  } catch (err) {
    console.error('Error during login:', err.message || err);
    throw err;
  } finally {
    // keep browser open if headless false and you want to inspect; otherwise close
    if (headless) {
     console.log('Closing browser (headless=true).');
     // await browser.close();
    } else {
      console.log('Browser left open (headless=false). Close manually when done, or set headless=true to auto-close.');
    }
  }
}

// Helper to wait for Enter keypress in terminal
function waitForEnter() {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });
}

// ---- CLI / env handling ----
(async () => {
  try {
    const argv = process.argv.slice(2);
    // Allow quick CLI invocation with: node auto-login.js url userSel passSel submitSel
    const [cliUrl, cliUserSel, cliPassSel, cliSubmitSel] = argv;

    const url = cliUrl || process.env.TARGET_URL || 'https://kite.zerodha.com/connect/login?api_key=wkcurst2vu5obug7'
   // const userSelector = cliUserSel || process.env.USER_SELECTOR || 'input[name="username"], input#username';
   // const passSelector = cliPassSel || process.env.PASS_SELECTOR || 'input[name="password"], input#password';
    const submitSelector = cliSubmitSel || process.env.SUBMIT_SELECTOR || 'button[type="submit"], input[type="submit"]';
   // const username = process.env.USERNAME || process.env.USER_ID;
   // const password = process.env.PASSWORD;
    const headless = process.env.HEADLESS !== 'false' ? false : true; // default false for visibility
    const pauseFor2FA = (process.env.PAUSE_FOR_2FA === 'true');

var username =  'DV3463';
var password =  '$$gauri1234';
var userSelector = '#userid';
var passSelector = '#password';

    await login({
      url,
      userSelector,
      passSelector,
      submitSelector,
      username,
      password,
      headless,
      pauseFor2FA,
    });
  } catch (err) {
    console.error('Fatal:', err.message || err);
   // process.exit(1);
  }
})();
