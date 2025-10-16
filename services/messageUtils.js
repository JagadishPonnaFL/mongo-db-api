


function generateExpenseMessage(content) {
  const {
    name = "N/A",
    amount = 0,
    type = "",
    subtype = "",
    payment_mode = "",
    datetime = "",
  } = content;
 const fmtDate = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    return `${d.getDate()}-${d.toLocaleString("default", {
      month: "short",
    })},${d.getHours() % 12 || 12}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}${d.getHours() >= 12 ? "am" : "pm"}`;
  };
  let msg = `🧾 *${name.trim()}* \n💰 *₹${fmt(amount)}* - *${payment_mode}*\n`;
  msg += `🛒 ${type}${subtype ? "-" + subtype : ""} \n 🕒 ${fmtDate(datetime)}`;

  return msg;
}


async function generateDailyMessage(summary={}){
 const repeatChar = (char, count) => char.repeat(count);
  const {dayTotal = 0, monthTotal = 0, personTotals = [] } = summary;
  const now = new Date();
  const formatted = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
   let msg=`🕒 ${formatted}\n`;
   let msg1 = `🟩 *ఈ రోజు ఖర్చు- ₹${fmt(dayTotal)}*\n`;
   let msg3 =`🟩 *ఈ నెల ఖర్చు- ₹${fmt(monthTotal)}*\n`;
   let line1=`${repeatChar("_",msg3.length-1)}\n`;
  msg+=msg1+msg3+line1;

  for (const p of personTotals) {
    const paid = fmt(p.paid || 0);
    const recv = fmt(p.received || 0);
    const bal = (p.paid || 0) - (p.received || 0);
    const balTxt = fmt(bal);
    msg += `\n*${p.name}* : ${paid} - ${recv} = *₹${balTxt}*\n`;
  }
  return msg;

}

const fmt = (n) =>
    Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });


module.exports = { generateExpenseMessage , generateDailyMessage};
