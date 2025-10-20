const express = require("express");
const router = express.Router();
 
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

// used onsole cron-job.org site \ https://console.cron-job.org/jobs/create
// pjagaidshfl@gm/xxxxxxx@git


router.get("/run-daily", async (req, res) => {
  try {
      res.status(200).json({ message: "daily schedular start successfully" });
   await sendDailyMessage();
   
  
 } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router.get("/ping", async (req, res) => {
  try {
   await sendDailyMessage();
     res.status(200).json({ message: "ping success" });
  
 } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
 

module.exports = router; 
