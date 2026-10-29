/*

chartAlerts.js -- push chartApp events to the phone (appOptions app) via FCM.

Device tokens come from the `devices` collection, which the phone app
upserts itself on every launch -- no hardcoded token to go stale.
Firebase credentials: MobileAlerts/serviceAccountKey.json (gitignored).
If either is missing, alerts are skipped with one log line; chartApp
keeps running either way.

*/

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const CHANNEL_ID = 'chart_alerts';      // must match the app's channel
const DEDUP_MS = 60 * 1000;             // same alert key at most once a minute

let admin = null;
let ready = false;
const lastSent = new Map();             // key -> ms

function initAlerts() {
    try {
        admin = require('firebase-admin');
        const sa = JSON.parse(fs.readFileSync(
            path.join(__dirname, 'MobileAlerts', 'serviceAccountKey.json'), 'utf8'));
        if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
        ready = true;
        console.log('📱 phone alerts on');
    } catch (e) {
        console.log('⚠️ phone alerts off:', e.message || e);
    }
}

async function deviceTokens() {
    const docs = await mongoose.connection.db.collection('devices').find({}).toArray();
    return [...new Set(docs.map(d => d.fcm_token).filter(Boolean))];
}

/*
title/body are what the phone shows. key dedups repeats (defaults to
title+body); pass a key like `naked:SYMBOL` to group related alerts.
Never throws -- an alert failing must not break trading code.
*/
async function alertPhone(title, body, { key } = {}) {
    if (!ready) return;
    const k = key || `${title}|${body}`;
    const now = Date.now();
    if (now - (lastSent.get(k) || 0) < DEDUP_MS) return;
    lastSent.set(k, now);
    try {
        const tokens = await deviceTokens();
        if (tokens.length == 0) { console.log('⚠️ alert skipped, no device registered:', title); return; }
        const res = await admin.messaging().sendEachForMulticast({
            tokens,
            notification: { title, body },
            android: { priority: 'high', notification: { channelId: CHANNEL_ID, sound: 'default' } },
        });
        // drop tokens of uninstalled / reset apps so they don't pile up
        const dead = [];
        res.responses.forEach((r, i) => {
            const code = r.error && r.error.code;
            if (code == 'messaging/registration-token-not-registered' ||
                code == 'messaging/invalid-registration-token') dead.push(tokens[i]);
        });
        if (dead.length) await mongoose.connection.db.collection('devices').deleteMany({ fcm_token: { $in: dead } });
        console.log(`📱 alert → ${res.successCount}/${tokens.length}: ${title} — ${body}`);
    } catch (e) {
        console.log('⚠️ alert failed:', e.message || e);
    }
}

// Market hours in IST, whatever timezone the server runs in.
function marketOpenIst(now = new Date()) {
    const ist = new Date(now.getTime() + (5.5 * 60 + now.getTimezoneOffset()) * 60000);
    const day = ist.getDay();
    if (day == 0 || day == 6) return false;
    const m = ist.getHours() * 60 + ist.getMinutes();
    return m >= 9 * 60 + 15 && m <= 15 * 60 + 30;
}

module.exports = { initAlerts, alertPhone, marketOpenIst };
