const express = require("express");
const router = express.Router();
const Income = require("../models/Income");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

// CREATE
router.post("/", async (req, res) => {
  try {
    // Merge req.body with CreatedBy and CreatedName
    const incomeData = {
      ...req.body,
      CreatedBy: req.user.mobile, // Extracted from the token
      CreatedName: req.user.name, 
      CreatedDate: new Date()// Extracted from the token
    };
     

    const newIncome = new Income(incomeData);
    console.log("New Income:", newIncome); // Debugging

    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const incomes = await Income.find();
    res.status(200).json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedIncome = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedIncome) return res.status(404).json({ message: "Income not found" });
    res.status(200).json(updatedIncome);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deletedIncome = await Income.findByIdAndDelete(req.params.id);
    if (!deletedIncome) return res.status(404).json({ message: "Income not found" });
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;