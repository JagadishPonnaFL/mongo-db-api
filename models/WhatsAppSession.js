const mongoose = require('mongoose');

const WhatsAppSessionSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  sessionData: { type: Object }
});

module.exports = mongoose.model('WhatsAppSession', WhatsAppSessionSchema);
