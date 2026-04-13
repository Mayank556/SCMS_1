const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, userId: user._id, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guest Login
router.post('/guest-login', async (req, res) => {
  try {
    let user = await User.findOne({ email: 'guest@example.com' });
    if (!user) {
      user = new User({
        name: 'Guest User',
        email: 'guest@example.com',
        password: 'guestpassword123', // Static for guest
        role: 'user'
      });
      await user.save();
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, userId: user._id, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
