const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();
// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const dbURI =process.env.MONGO_URI;;
mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
// Routes
const itemRoutes = require("./routes/itemRoutes");
app.use("/api/items", itemRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/api/expenses", expenseRoutes);

const incomeRoutes = require("./routes/incomeRoutes");
app.use("/api/incomes", incomeRoutes);

const typesParentroutes = require("./routes/typesParentRoutes");
app.use("/api/typesParent", typesParentroutes);

const typesRoutes = require("./routes/typesRoutes");
app.use("/api/types", typesRoutes);
// Start server

// drop indexs 
//const result = await mongoose.connection.db.collection('users').dropIndex('email_1');
 //       console.log('Index dropped:', result);
//
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
const { initWhatsApp } = require('./services/whatsapp');
 
