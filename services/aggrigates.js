const Expense = require("../models/expense");

async function getExpenseAggregates() {
  const now = new Date();

  // 🔹 Define date ranges
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 🔹 Start of week (Monday)
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 🔹 Step 1: Auto-fetch distinct payment_mode values from DB
  const persons = await Expense.distinct("payment_mode");
  if (!persons || persons.length === 0) {
    return { monthTotal: 0, weekTotal: 0, dayTotal: 0, personTotals: [] };
  }

  // 🔹 Step 2: Aggregation
  const result = await Expense.aggregate([
    {
      $facet: {
        // 1️⃣ Month total
        monthTotal: [
          {
            $match: {
              datetime: { $gte: startOfMonth, $lte: endOfMonth },
              subtype: { $ne: "Loans" },
            },
          },
          { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
        ],

        // 2️⃣ Week total
        weekTotal: [
          {
            $match: {
              datetime: { $gte: startOfWeek, $lte: endOfWeek },
              subtype: { $ne: "Loans" },
            },
          },
          { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
        ],

        // 3️⃣ Day total
        dayTotal: [
          {
            $match: {
              datetime: { $gte: startOfDay, $lte: endOfDay },
              subtype: { $ne: "Loans" },
            },
          },
          { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } },
        ],

        // 4️⃣ Paid totals
        paidTotals: [
          { $match: { payment_mode: { $in: persons } } },
          {
            $group: {
              _id: "$payment_mode",
              totalPaid: { $sum: { $toDouble: "$amount" } },
            },
          },
        ],

        // 5️⃣ Received totals
        receivedTotals: [
          { $match: { vendor: { $in: persons }, subtype: "Loans" } },
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
      // 6️⃣ Combine all results
      $project: {
        _id: 0,
        monthTotal: { $ifNull: [{ $arrayElemAt: ["$monthTotal.total", 0] }, 0] },
        weekTotal: { $ifNull: [{ $arrayElemAt: ["$weekTotal.total", 0] }, 0] },
        dayTotal: { $ifNull: [{ $arrayElemAt: ["$dayTotal.total", 0] }, 0] },
        personTotals: {
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
  ]);

  // 🔹 Step 3: Clean output
  return result[0] || { monthTotal: 0, weekTotal: 0, dayTotal: 0, personTotals: [] };
}

module.exports = { getExpenseAggregates };