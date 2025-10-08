function formatMessage(obj, fields, multiline = true) {
  const separator = multiline ? "\n" : ", ";
  return fields
    .map(field => {
      const key = field.key || field;
      const label = field.label || key;
      let value = obj[key];
      if (key === "amount" && value && value.toString) value = value.toString();
      if (key === "datetime" && value) value = new Date(value).toLocaleString();
      return `${label}:- ${value ?? "N/A"}`;
    })
    .join(separator);
}

module.exports = { formatMessage };