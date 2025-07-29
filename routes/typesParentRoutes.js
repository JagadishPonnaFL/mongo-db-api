const express = require("express");
const router = express.Router();
const TypesParent = require("../models/typesParent");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

// CREATE
router.post("/", async (req, res) => {
  try {
    const typesParent = new TypesParent(req.body);
    const saved = await typesParent.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const all = await TypesParent.find();
    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const item = await TypesParent.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await TypesParent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// DELETE ALL
router.delete("/", async (req, res) => {
  try {
    const result = await TypesParent.deleteMany({});
    res.status(200).json({ message: "All parent types deleted successfully", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await TypesParent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;