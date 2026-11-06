/*
Get today's Kite access token, and if there is none, do the login.

Before this, the token came only from cron: a login ran in the morning,
wrote the row, and every other process read it. All three cron lines are
DISABLED, so the row was often simply not there -- chartApp then started
with accessToken -1, every Kite call failed, and the process looked alive
and was blind. That is incident 3 in incidents-2026-11-05.md.

chartApp now asks for the token through here instead, so it can get its
own session with nothing scheduled and nobody at the keyboard.

The login is login.js (NOT autologin.js). autologin.js only drives the
Kite screens and takes a screenshot -- it never captures request_token and
never writes a token anywhere, so it can never satisfy
getTodaysAccessToken. login.js captures request_token off the callback
URL, exchanges it for the access token and upserts the row for today.

It is run as a child process, not required in. login.js ends with
process.exit() and closes the mongoose connection in its finally block,
which would take chartApp's own database connection down with it.

Two guards, because this gets called from guardRefresh and that runs every
15 seconds:

  - one login at a time. Callers that arrive while a login is running wait
    on the same promise instead of starting a second Chrome.
  - a cooldown after a failure. A login that fails for a standing reason
    (TOTP secret changed, Kite down, no Chrome) would otherwise launch a
    fresh Chrome every 15 seconds until the machine gives up.
*/

const path = require('path');
const { spawn } = require('child_process');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');

/*
LOGIN_SCRIPT is overridable so the spawn wrapper can be tested against a
stub. A real login replaces today's token, which blinds the chartApp that
is already running on the old one -- not something to do to prove the
child process plumbing works.
*/
const LOGIN_SCRIPT = process.env.LOGIN_SCRIPT || path.join(__dirname, 'login.js');

// a Kite login with TOTP and the callback redirect takes ~30-60s on this machine
const LOGIN_TIMEOUT_MS = Number(process.env.LOGIN_TIMEOUT_MS || 3 * 60 * 1000);

// how long to wait after a failed login before trying again
const LOGIN_COOLDOWN_MS = Number(process.env.LOGIN_COOLDOWN_MS || 5 * 60 * 1000);

let inFlight = null;      // the running login, shared by every caller
let lastFailAt = 0;       // when the last login failed, for the cooldown
let lastError = '';       // why it failed, for the status endpoint

/*
The cooldown lives on disk, not just in this variable.

chartApp exits when it cannot get a session, and pm2 has autorestart on
with no restart_delay -- so it comes straight back. A cooldown held only
in memory dies with the process, and the fresh one launches another Chrome
at once. A login that fails for a standing reason (TOTP secret changed,
Kite down, no Chrome) would spawn Chrome in a tight loop until the machine
gives up. Keeping the timestamp in a file means a restarted process waits
out the same cooldown and exits cheaply instead.
*/
const COOLDOWN_FILE = path.join(__dirname, '.loginCooldown.json');

function readCooldown() {
    try {
        const saved = JSON.parse(require('fs').readFileSync(COOLDOWN_FILE, 'utf8'));
        if (saved && Number(saved.lastFailAt) > 0) {
            lastFailAt = Number(saved.lastFailAt);
            lastError = String(saved.lastError || 'a login failed in an earlier run');
        }
    } catch (e) { /* no file, or junk in it: no cooldown, which is the safe default */ }
}

function writeCooldown() {
    try {
        require('fs').writeFileSync(COOLDOWN_FILE, JSON.stringify({ lastFailAt, lastError }));
    } catch (e) {
        console.log('⚠️ could not save the login cooldown', e.message);
    }
}

readCooldown();

function hasToken(t) {
    return !!t && t !== -1 && t !== '-1';
}

/*
Run login.js and wait for it to exit. Resolves either way -- the caller
decides what a failure means. Its output is prefixed and passed through,
because when a 09:00 login fails this log is the only account of why.
*/
function runLogin() {
    return new Promise(resolve => {

        console.log('🔑 no Kite session for today -- running login.js');

        const child = spawn(process.execPath, [LOGIN_SCRIPT], {
            cwd: __dirname,
            env: { ...process.env, LOGIN_HEADLESS: '1' },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        const say = buf => String(buf).split('\n')
            .filter(l => l.trim())
            .forEach(l => console.log('   login |', l));

        child.stdout.on('data', say);
        child.stderr.on('data', say);

        const killAt = setTimeout(() => {
            console.log(`⏱️ login.js passed ${Math.round(LOGIN_TIMEOUT_MS / 1000)}s -- killing it`);
            try { child.kill('SIGKILL'); } catch (e) { /* already gone */ }
        }, LOGIN_TIMEOUT_MS);

        child.on('error', err => {
            clearTimeout(killAt);
            resolve({ ok: false, error: err.message });
        });

        child.on('exit', (code, signal) => {
            clearTimeout(killAt);
            if (code === 0) return resolve({ ok: true });
            resolve({ ok: false, error: signal ? `killed by ${signal}` : `exit ${code}` });
        });
    });
}

/*
The token for today, logging in if needed.

  force: true  -- log in even though a row already exists. For a session
                  that is present but dead (Kite answering TokenException);
                  the login upserts today's row, so the dead token is
                  replaced rather than added to.

Returns the token, or -1 if there is still none.
*/
async function ensureTodaysAccessToken({ force = false } = {}) {

    if (!force) {
        const have = await getTodaysAccessToken();
        if (hasToken(have)) return have;
    }

    const sinceFail = Date.now() - lastFailAt;
    if (lastFailAt && sinceFail < LOGIN_COOLDOWN_MS) {
        const wait = Math.ceil((LOGIN_COOLDOWN_MS - sinceFail) / 1000);
        console.log(`🔑 login is in cooldown for another ${wait}s (last failure: ${lastError})`);
        return -1;
    }

    if (!inFlight) {
        inFlight = runLogin().finally(() => { inFlight = null; });
    }
    const result = await inFlight;

    if (!result.ok) {
        lastFailAt = Date.now();
        lastError = result.error;
        writeCooldown();
        console.log(`❌ login.js failed: ${result.error}`);
        return -1;
    }

    /*
    login.js said it succeeded, so read the row back rather than trusting
    it. The exit code only tells us the script finished; the token has to
    be in the DB for every other process to see it too.
    */
    const fresh = await getTodaysAccessToken();
    if (!hasToken(fresh)) {
        lastFailAt = Date.now();
        lastError = 'login.js exited 0 but wrote no token for today';
        writeCooldown();
        console.log(`❌ ${lastError}`);
        return -1;
    }

    lastFailAt = 0;
    lastError = '';
    writeCooldown();
    console.log('✅ Kite session is live');
    return fresh;
}

// for /api/authStatus, so the page can say why there is no session
function loginStatus() {
    return {
        running: !!inFlight,
        lastError: lastError || null,
        cooldownSecondsLeft: lastFailAt
            ? Math.max(0, Math.ceil((LOGIN_COOLDOWN_MS - (Date.now() - lastFailAt)) / 1000))
            : 0,
    };
}

exports.ensureTodaysAccessToken = ensureTodaysAccessToken;
exports.loginStatus = loginStatus;
