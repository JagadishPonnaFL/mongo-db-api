const express = require("express");
const router = express.Router();
const Type = require("../models/types");
const verifyToken = require("../middlewares/verifyToken");

router.use(verifyToken);

// CREATE
router.post("/", async (req, res) => {
  try {
    const type = new Type(req.body);
    const savedType = await type.save();
    res.status(201).json(savedType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const types = await Type.find();
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const type = await Type.findById(req.params.id);
    if (!type) return res.status(404).json({ message: "Type not found" });
    res.status(200).json(type);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedType = await Type.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedType) return res.status(404).json({ message: "Type not found" });
    res.status(200).json(updatedType);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE ALL
router.delete("/", async (req, res) => {
  try {
    const result = await Type.deleteMany({});
    res.status(200).json({ message: "All types deleted successfully", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deletedType = await Type.findByIdAndDelete(req.params.id);
    if (!deletedType) return res.status(404).json({ message: "Type not found" });
    res.status(200).json({ message: "Type deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;