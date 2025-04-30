const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Short description of the expense
  amount: { type: mongoose.Types.Decimal128, required: true }, // Precise decimal value for currency
  type: { type: String, required: true }, // Main category (e.g., "Food & Dining")
  subtype: { type: String }, // Optional subcategory (e.g., "Restaurants & Cafes")
  datetime: { type: Date, required: true }, // Full timestamp (e.g., "2025-04-28T19:45:00Z")
  payment_mode: { type: String, required: true }, // Payment method (e.g., "UPI", "Credit Card")
  consumer: { type: String, required: true }, // Who made the expense
  notes: { type: String }, // Optional notes
  recurring: { type: String }, // "Yes", "No", "Monthly", "Yearly", etc.
  vendor: { type: String }, // Optional vendor/store name
  location: { type: String }, // Optional physical or online location
  receipt_url: { type: String }, // Optional link to receipt image/file
});

module.exports = mongoose.model("Expense", expenseSchema);