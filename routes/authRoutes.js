const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO Users (username, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error registering user');
            }

            res.send('User registered successfully');
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error hashing password');
    }
});

// تسجيل الدخول
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `
        SELECT * FROM Users
        WHERE email = ?
    `;

    db.query(sql, [email], async (err, result) => {
        if (err) {
            return res.status(500).send('Server error');
        }

        if (result.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = result[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );

                res.json({
                    message: 'Login successful',
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                res.status(401).send('Invalid email or password');
            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Error verifying password');
        }
    });
});

module.exports = router;