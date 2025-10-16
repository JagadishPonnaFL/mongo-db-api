const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const verifyToken = require("../middlewares/verifyToken");
const { sendMessage } = require("../services/whatsapp");
const {generateExpenseMessage } =require("../services/messageUtils")

router.use(verifyToken);
const WHAPI_GROUP_ID = process.env.WHAPI_GROUP_ID;
// CREATE
router.post("/", async (req, res) => {
  try {
    // Merge req.body with CreatedBy and CreatedName
    const expenseData = {
      ...req.body,
      CreatedBy: req.user.mobile, // Extracted from the token
      CreatedName: req.user.name, 
      CreatedDate: new Date()// Extracted from the token
    };
     

    const newExpense = new Expense(expenseData);
    console.log("New Expense:", newExpense); // Debugging

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
    (async () => {
      await sendMessage(WHAPI_GROUP_ID, generateExpenseMessage(savedExpense));
    })();

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedExpense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json(updatedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;