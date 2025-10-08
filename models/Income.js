const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const incomeSchema = new mongoose.Schema({
  incomeId: { type: Number, unique: true }, // Auto-incremented serial number
  source: { type: String, required: true },
  amount: { type: mongoose.Types.Decimal128, required: true },
  payment_mode: { type: String, required: true },
  datetime: { type: Date, required: true },
  notes: { type: String },
  createdBy: { type: String }, // Ensure this is defined
  createdName: { type: String }, // Ensure this is defined
  createdDate: { type: Date },
  isReccuring:{type:Boolean,default:false}
});

// Add auto-increment plugin for the IncomeId field
incomeSchema.plugin(AutoIncrement, { inc_field: "IncomeId" });

module.exports = mongoose.model("Income", incomeSchema);