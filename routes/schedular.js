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

router.get("/run-daily", async (req, res) => {
  try {
   await sendDailyMessage();
     res.status(200).json({ message: "daily schedular run successfully" });
  
 } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
 

module.exports = router; 
