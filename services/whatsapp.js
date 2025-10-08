// services/whatsapp.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

// 1️⃣ Define session path (persistent folder)
const sessionPath = process.env.WA_SESSION_PATH || path.join(__dirname, '../data/whatsapp_auth');
fs.mkdirSync(sessionPath, { recursive: true }); // create folder if missing

// 2️⃣ Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: sessionPath }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    }
});

// 3️⃣ Event: QR code (first-time login)
client.on('qr', (qr) => {
    console.log('📱 Scan this QR code with WhatsApp mobile:');
    qrcode.generate(qr, { small: true });; // you can use qrcode-terminal if you want terminal QR
});

// 4️⃣ Event: client ready
client.on('ready', () => {
    console.log('✅ WhatsApp client ready');
});

// 5️⃣ Event: client authenticated
client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated');
});

// 6️⃣ Event: client disconnected
client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp disconnected:', reason);
    console.log('➡️ Restarting client...');
    client.initialize(); // auto-restart
});

// 7️⃣ Function to send message to group
const sendGroupMessage = async (groupName, message) => {
    try {
        // Wait until client is ready
        if (!client.info || !client.info.wid) {
            console.log('Client not ready yet, retrying...');
            await new Promise(res => setTimeout(res, 3000)); // wait 3 seconds
        }

        const chats = await client.getChats(); // fetch all chats
        const group = chats.find(c => c.name === groupName && c.isGroup);

        if (!group) {
            console.log(`❌ Group "${groupName}" not found`);
            return;
        }

        await client.sendMessage(group.id._serialized, message);
        console.log(`✅ Message sent to group "${groupName}"`);
    } catch (err) {
        console.error('❌ Error sending message:', err);
    }
};


// 8️⃣ Initialize client
client.initialize();

// 9️⃣ Export function to use in routes
module.exports = {
    client,
    sendGroupMessage
};
