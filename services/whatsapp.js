// services/whatsapp.js
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const WhatsAppSession = require('../models/WhatsAppSession'); // adjust if model path is different

const SESSION_CLIENT_ID = 'main';
const LOCAL_SESSION_PATH = process.env.WA_SESSION_PATH || path.join(__dirname, '../data/whatsapp_auth');

let clientInstance = null;

async function initWhatsApp() {
  // Ensure local folder exists
  fs.mkdirSync(LOCAL_SESSION_PATH, { recursive: true });

  // Try to load saved session from MongoDB (optional restore step)
  try {
    const dbSession = await WhatsAppSession.findOne({ clientId: SESSION_CLIENT_ID });
    if (dbSession && dbSession.sessionData) {
      console.log('📦 Found saved session in DB — writing a local session file (best-effort restore).');
      // Best-effort: write a session.json for traceability / future manual restore
      try {
        fs.writeFileSync(path.join(LOCAL_SESSION_PATH, 'session.json'), JSON.stringify(dbSession.sessionData));
      } catch (err) {
        console.warn('⚠️ Could not write session.json locally:', err.message);
      }
    } else {
      console.log('⚠️ No saved session in DB (first-time login required).');
    }
  } catch (err) {
    console.error('❌ Error checking session in DB:', err);
  }

  // Create client
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: SESSION_CLIENT_ID,
      dataPath: LOCAL_SESSION_PATH
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  // QR — show scannable ASCII QR in the terminal
  client.on('qr', (qr) => {
    console.log('📱 Scan this QR code with WhatsApp mobile (Linked devices → Link a device):');
    qrcode.generate(qr, { small: true });
     console.log(qr);
  });

  // On authenticated — save session object to MongoDB
  client.on('authenticated', async (session) => {
    console.log('🔐 WhatsApp authenticated — saving session to DB...');
    try {
      await WhatsAppSession.findOneAndUpdate(
        { clientId: SESSION_CLIENT_ID },
        { sessionData: session },
        { upsert: true }
      );
      console.log('✅ Session saved to MongoDB');
    } catch (err) {
      console.error('❌ Failed to save session to DB:', err);
    }
  });

  // Ready
  client.on('ready', () => {
    console.log('✅ WhatsApp client ready');
  });

  // Disconnected / Logout handling
  client.on('disconnected', async (reason) => {
    console.log('⚠️ WhatsApp disconnected:', reason);
    // If WhatsApp logged out intentionally, remove saved session from DB (so next run requires QR)
    if (String(reason).toLowerCase().includes('logout')) {
      try {
        await WhatsAppSession.deleteOne({ clientId: SESSION_CLIENT_ID });
        console.log('🗑️ Deleted saved session from DB due to logout');
      } catch (err) {
        console.error('❌ Could not delete session from DB:', err);
      }
    }

    // try to re-init after short delay
    setTimeout(() => {
      try {
        client.initialize();
      } catch (e) {
        console.error('❌ Error re-initializing client:', e);
      }
    }, 2000);
  });

  // Save instance and initialize
  clientInstance = client;
  client.initialize();

  return client;
}

// Helper: wait until client is ready (with retries)
async function waitForClientReady(timeoutMs = 15000) {
  const start = Date.now();
  while (!clientInstance || !clientInstance.info) {
    if (Date.now() - start > timeoutMs) throw new Error('WhatsApp client not ready (timeout)');
    await new Promise(r => setTimeout(r, 500));
  }
  // Sometimes getChats fails if puppeteer not fully loaded — give tiny extra delay
  await new Promise(r => setTimeout(r, 300));
}

// Send message to group by exact group name (retries included)
async function sendGroupMessage(groupName, message, opts = {}) {
  try {
    await waitForClientReady(opts.timeoutMs || 15000);

    // Try to get chats with small retry loop
    let chats;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        chats = await clientInstance.getChats();
        break;
      } catch (err) {
        if (attempt === 4) throw err;
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const group = chats.find(c => c.isGroup && c.name === groupName);
    if (!group) {
      console.warn(`❌ Group "${groupName}" not found. Available group names:`, chats.filter(c => c.isGroup).map(g => g.name));
      return false;
    }

    await clientInstance.sendMessage(group.id._serialized, message);
    console.log(`📤 Message sent to group "${groupName}"`);
    return true;
  } catch (err) {
    console.error('❌ Error sending message:', err);
    return false;
  }
}

// Also provide helper to send to individual number: number must be string with country code (no plus)
async function sendToNumber(numberWithCountryCode, message) {
  try {
    await waitForClientReady();
    const chatId = `${numberWithCountryCode}@c.us`;
    await clientInstance.sendMessage(chatId, message);
    console.log(`📤 Message sent to ${numberWithCountryCode}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending to number:', err);
    return false;
  }
}

module.exports = {
  initWhatsApp,
  sendGroupMessage,
  sendToNumber
};
