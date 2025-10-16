const cron = require("node-cron");
const { generateDailyMessage } =require("../services/messageUtils");
const { sendMessage } = require("../services/whatsapp");
const {getExpenseAggregates} =require("../services/aggrigates");

const WHAPI_GROUP_ID = process.env.WHAPI_GROUP_ID;
// This function will run at 10 PM every day
async function sendDailyMessage() {
    console.log("urring");
    
    (async () => {
          const summary = await getExpenseAggregates();
          await sendMessage(WHAPI_GROUP_ID, await generateDailyMessage(summary));
        })();
}

// Schedule: second, minute, hour, day of month, month, day of week
 cron.schedule("1 22 * * *", async () => {
  await sendDailyMessage();
}, {
  timezone: "Asia/Kolkata" // Set timezone if needed
});
