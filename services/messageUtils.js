


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

function generateExpenseMessage(content,summary="") {
  // Split first two fields and remaining fields
  const firstTwo = expensezMessageFieldsTelugu.slice(0, 2);
  const rest = expensezMessageFieldsTelugu.slice(2);

  // Format first two normally
  const firstTwoText = formatMessage(content, firstTwo);

  // Format remaining in monospace
  const restText = '```\n' + formatMessage(content, rest) + '```';

  return `${expenseMessageHeader}\n${firstTwoText}\n${restText}\n ${formatExpenseSummary(summary)}`; //
}

// Header and fields
const expenseMessageHeader = "*కొత్త ఖర్చు*";
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
const expensezMessageFieldsTelugu = [
  { key: "name", label: "🟢 ఖర్చు పేరు" },           // Expense name
  { key: "amount", label: "💰 ఎంత ఖర్చు" }, // How much was spent
  { key: "type", label: "📂 ఖర్చు టైపు" },           // Expense type
  { key: "subtype", label: "🔖 సబ్ టైపు" },        // Subtype
  { key: "datetime", label: "🕒 డేట్ & టైమ్" },      // Date and Time
  { key: "payment_mode", label: "💳 డబ్బు ఎలా ఇచ్చారు" }, // How was it paid
  { key: "consumer", label: "👤 ఎవరి కోసం" },         // For whom
  { key: "vendor", label: "🏪 ఎవరికిచ్చారు" }         // Paid to whom
]


function formatExpenseSummary(summary) {
  debugger;
  if (!summary) return "";

  const { monthTotal = 0, personTotals = [] } = summary;

  // Format numbers to Indian commas (e.g. 12,34,567)
  const format = (n) =>
    Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Start with month total
  let output = `ఈ నెల ఖర్చు: ${format(monthTotal)}`;

  // Append each person's paid/received summary
  for (const p of personTotals) {
    const name = p.name || "Unknown";
    const paid = format(p.paid || 0);
    const received = format(p.received || 0);
    output += `, ${name}: ${received}/${paid}`;
  }

  return output;
}


module.exports = { generateExpenseMessage };
