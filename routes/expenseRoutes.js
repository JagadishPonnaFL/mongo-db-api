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
      const summary = await getExpenseAggregates(
        ["PNM", "Jagadish", "Nagendra"]
      );
      await sendMessage(WHAPI_GROUP_ID, generateExpenseMessage(savedExpense, summary));
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

 async function getExpenseAggregates(persons = []) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const result = await Expense.aggregate([
    {
      $facet: {
        // 1️⃣ Month total (exclude loans)
        monthTotal: [
          {
            $match: {
              datetime: { $gte: startOfMonth, $lte: endOfMonth },
              subtype: { $ne: "Loans" },
            },
          },
          {
            $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } },
          },
        ],

        // 2️⃣ Paid totals — by payment_mode
        paidTotals: [
          {
            $match: { payment_mode: { $in: persons } },
          },
          {
            $group: {
              _id: "$payment_mode",
              totalPaid: { $sum: { $toDouble: "$amount" } },
            },
          },
        ],

        // 3️⃣ Received totals — by vendor (where subtype = loan)
        receivedTotals: [
          {
            $match: {
              vendor: { $in: persons },
              subtype: "Loans",
            },
          },
          {
            $group: {
              _id: "$vendor",
              totalReceived: { $sum: { $toDouble: "$amount" } },
            },
          },
        ],
      },
    },
    {
      // 4️⃣ Merge paid + received per person
      $project: {
        _id: 0,
        monthTotal: { $ifNull: [{ $arrayElemAt: ["$monthTotal.total", 0] }, 0] },
        merged: {
          $map: {
            input: persons,
            as: "person",
            in: {
              name: "$$person",
              paid: {
                $ifNull: [
                  {
                    $first: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$paidTotals",
                            as: "p",
                            cond: { $eq: ["$$p._id", "$$person"] },
                          },
                        },
                        as: "r",
                        in: "$$r.totalPaid",
                      },
                    },
                  },
                  0,
                ],
              },
              received: {
                $ifNull: [
                  {
                    $first: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$receivedTotals",
                            as: "v",
                            cond: { $eq: ["$$v._id", "$$person"] },
                          },
                        },
                        as: "r",
                        in: "$$r.totalReceived",
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        monthTotal: 1,
        personTotals: "$merged",
      },
    },
  ]);

  return result[0] || { monthTotal: 0, personTotals: [] };
}
module.exports = router;