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
  .connect(dbURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
// Routes
const itemRoutes = require("./routes/itemRoutes");
app.use("/api/items", itemRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
