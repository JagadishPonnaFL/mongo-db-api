const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verifyToken = require('../middlewares/verifyToken');
const verifyRole = require('../middlewares/verifyRole');
const router = express.Router();

router.post('/register', async (req, res) => {
    var res1="";
    try {
        
        const { name, mobile, password ,role} = req.body;
        const allowedRoles = ['admin', 'user', 'guest'];
        const userRole = allowedRoles.includes(role) ? role : 'user';
        // Check if user exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
res1="1st";
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
res1="2nd";
        // Create user
        const newUser = new User({ name, mobile, password: hashedPassword, role: userRole });
        res1="3rd";
        await newUser.save();
        res1="4th";

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: res1+err });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ mobile });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const payload = {
            id: user._id,
            role: user.role,  // Include user role in the payload
        };
        // Generate token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/delete',verifyToken,verifyRole("admin"), async (req, res) => {
    try {
        const { id } = req.body;
        const deletedUser = await User.findByIdAndDelete(id);
       
        if (!deletedUser) return res.status(400).json({ message: 'Invalid user to delete/ user not registered' });
        res.status(200).json({ message: "User deleted successfully" });
         
        
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


 router.get('/checkToken',verifyToken,async (req, res) => {
    try {
        res.status(200).json({ message: "token verified" });
        
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
