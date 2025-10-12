function formatMessage(obj, fields, multiline = true) {
  const separator = multiline ? "\n" : ", ";

  return fields
    .map((field, index) => {
      const key = field.key || field;
      const label = field.label || key;
      let value = obj[key];

      // Format amount and datetime
      if (key === "amount" && value && value.toString) value = value.toString();
      if (key === "datetime" && value) value = new Date(value).toLocaleString();

      // First two fields: normal/bold
      if (index < 2) {
        return `${label}: ${value ?? "N/A"}`;
      }

      // Remaining fields: monospace for smaller appearance
      return `${label}: ${value ?? "N/A"}`;
    })
    .join(separator);
}

function generateExpenseMessage(content) {
  // Split first two fields and remaining fields
  const firstTwo = expenseMessageFields.slice(0, 2);
  const rest = expenseMessageFields.slice(2);

  // Format first two normally
  const firstTwoText = formatMessage(content, firstTwo);

  // Format remaining in monospace
  const restText = '```\n' + formatMessage(content, rest) + '```';

  return `${expenseMessageHeader}\n${firstTwoText}\n${restText}`;
}

// Header and fields
const expenseMessageHeader = "*New expense added*";
const expenseMessageFields = [
  { key: "name", label: "🟢 Expense" },
  { key: "amount", label: "💰 Amount" },
  { key: "type", label: "📂 Type" },
  { key: "subtype", label: "🔖 Subtype" },
  { key: "datetime", label: "🕒 Date/Time" },
  { key: "payment_mode", label: "💳 Paid by" },
  { key: "consumer", label: "👤 expense For" },
  { key: "vendor", label: "🏪 Paid to" }
];

module.exports = { generateExpenseMessage };
