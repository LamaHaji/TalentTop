const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

//اضافة تحدي
router.post('/challenges', verifyToken, requireAdmin, (req, res) => {
    const { title, description, difficulty } = req.body;

    const sql = `
        INSERT INTO challenges (title, description, difficulty)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [title, description, difficulty], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error adding challenge');
        }

        res.send('Challenge added successfully');
    });
});

//عرض التحديات
router.get('/challenges', (req, res) => {
    db.query('SELECT * FROM challenges', (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});

//رفع الحلول
router.post('/submit', (req, res) => {
    const { user_id, challenge_id, solution_text, solution_link } = req.body;

    const sql = `
        INSERT INTO submissions (user_id, challenge_id, solution_text, solution_link)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_id, challenge_id, solution_text, solution_link], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error submitting solution');
        }

        res.send('Solution submitted successfully');
    });
});

//عرض الحلول
router.get('/submissions', (req, res) => {
    db.query('SELECT * FROM submissions', (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});

module.exports = router;
