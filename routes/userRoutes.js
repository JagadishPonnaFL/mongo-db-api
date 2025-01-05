const express = require("express");
const router = express.Router();
const User = require("../models/user");
const verifyToken = require("../middlewares/verifyToken");
const verifyRole = require("../middlewares/verifyRole");
 
router.get("/", verifyToken,verifyRole("admin"), async (req, res) => {
    try {
      const items = await User.find();
      res.status(200).json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;