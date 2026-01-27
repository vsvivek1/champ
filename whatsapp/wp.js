const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;
let isReady = false;

/**
 * Initialize WhatsApp client once
 */
function initWhatsApp() {
  if (client) return;

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox'],
    }
  });

  client.on('qr', qr => {
    console.log('📱 Scan this QR in WhatsApp (Linked Devices)');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    console.log('✅ WhatsApp is ready');
  });

  client.on('auth_failure', msg => {
    console.error('❌ WhatsApp auth failure:', msg);
  });

  client.initialize();
}

/**
 * Send WhatsApp message
 * @param {string} message
 * @param {string} phone  Example: 919876543210
 */
async function sendWhatsAppAlert(message, phone) {
  if (!client) initWhatsApp();

  // Wait until WhatsApp is ready
  while (!isReady) {
    await new Promise(r => setTimeout(r, 500));
  }

  const chatId = phone.includes('@c.us')
    ? phone
    : `${phone}@c.us`;

  await client.sendMessage(chatId, message);
  console.log('📨 Message sent to', phone);
}

sendWhatsAppAlert("⚠️ Trade exited at SL", "919847599946");

// module.exports = {
//   initWhatsApp,
//   sendWhatsAppAlert
// };
