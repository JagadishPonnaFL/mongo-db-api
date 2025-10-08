const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const expenseSchema = new mongoose.Schema({
  RecordId: { type: Number, unique: true }, // Auto-incremented serial number
  name: { type: String, required: true },
  amount: { type: mongoose.Types.Decimal128, required: true },
  type: { type: String, required: true },
  subtype: { type: String },
  datetime: { type: Date, required: true },
  payment_mode: { type: String, required: true },
  consumer: { type: String, required: true },
  notes: { type: String },
  vendor: { type: String },
  location: { type: String },
  receipt_url: { type: String },
  CreatedBy: { type: String }, // Ensure this is defined
  CreatedName: { type: String }, // Ensure this is defined
  CreatedDate: { type: Date, required: true },
  isReccuring:{type:Boolean,default:false}
});

// Add auto-increment plugin for the RecordId field
expenseSchema.plugin(AutoIncrement, { inc_field: "RecordId" });

module.exports = mongoose.model("Expense", expenseSchema);