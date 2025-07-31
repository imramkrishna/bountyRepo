const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        const isValidPassword = await bcrypt.compare(password, user.password);

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            'hardcoded-secret'
        );

        res.json({
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
