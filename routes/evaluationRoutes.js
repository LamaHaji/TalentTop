const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

//تقييم الحلول
router.post('/evaluate', verifyToken, requireAdmin, (req, res) => {
    const { submission_id, score, feedback } = req.body;

    const sql = `
        INSERT INTO Evaluations (submission_id, score, feedback)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [submission_id, score, feedback], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error evaluating submission');
        }

        res.send('Evaluation added successfully');
    });
});

//عرض التقييمات
router.get('/evaluations', (req, res) => {
    db.query('SELECT * FROM Evaluations', (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});

module.exports = router;