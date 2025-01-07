const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true, sparse: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'user', 'guest'], // Define allowed roles
        default: 'user', // Default role
    },
});

module.exports = mongoose.model("User", userSchema);