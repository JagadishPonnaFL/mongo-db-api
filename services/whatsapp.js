// services/whatsapp.js
const axios = require("axios");
require("dotenv").config();

const WHAPI_URL = "https://gate.whapi.cloud/messages/text";
const WHAPI_KEY = process.env.WHAPI_KEY;
const DEFAULT_GROUP_ID = process.env.WHAPI_GROUP_ID;

/**
 * Send message via Whapi to any recipient (individual or group)
 * @param {string} to - WhatsApp number (e.g., "919876543210") or group id (e.g., "12036xxxxx@g.us")
 * @param {string} body - Message text
 */
async function sendMessage(to, body) {
  if (!WHAPI_KEY) {
    console.error("❌ Missing WHAPI_KEY in environment variables");
    return;
  }

  try {
    const response = await axios.post(
      WHAPI_URL,
      { to, body },
      {
        headers: { Authorization: `Bearer ${WHAPI_KEY}` },
      }
    );

    console.log(`✅ Message sent to ${to}:`, response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error sending message:", err.response?.data || err.message);
  }
}

/**
 * Send message to default group (from env)
 * @param {string} body - Message text
 */
async function sendGroupMessage(body) {
  if (!DEFAULT_GROUP_ID) {
    console.error("❌ No WHAPI_GROUP_ID found in .env");
    return;
  }

  return sendMessage(DEFAULT_GROUP_ID, body);
}

module.exports = {
  sendMessage,
  sendGroupMessage,
};
