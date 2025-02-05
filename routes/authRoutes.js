const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
   const { username, firstname, lastname, password } = req.body;

   try {
       console.log("Signup request received:", req.body); // Debugging log

       if (!username || !firstname || !lastname || !password) {
           return res.status(400).json({ message: "All fields are required" });
       }

       const existingUser = await User.findOne({ username });
       if (existingUser) return res.status(400).json({ message: "Username already taken" });

       const hashedPassword = await bcrypt.hash(password, 10);
       const newUser = new User({ username, firstname, lastname, password: hashedPassword });

       await newUser.save();

       res.status(201).json({ message: "User created successfully" });
   } catch (error) {
       console.error("Signup Error:", error); // Log full error
       res.status(500).json({ message: "Error creating user", error: error.message });
   }
});

module.exports = router;


 
