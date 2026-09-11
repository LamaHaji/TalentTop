const express = require('express');
const router = express.Router();
const db = require('../config/db');

//لوحة المتصدرين
router.get('/leaderboard', (req, res) => {
    const sql = `
        SELECT users.id, users.username, SUM(evaluations.score) AS total_points
        FROM users
        JOIN submissions ON users.id = submissions.user_id
        JOIN evaluations ON submissions.id = evaluations.submission_id
        GROUP BY users.id
        ORDER BY total_points DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching leaderboard');
        }

        res.json(result);
    });
});

//صفحة الملف الشخصي
router.get('/profile/:id', (req, res) => {
    const userId = req.params.id;

    const sql = `
        SELECT 
            users.id,
            users.username,
            COUNT(DISTINCT submissions.id) AS total_submissions,
            IFNULL(SUM(evaluations.score), 0) AS total_points
        FROM users
        LEFT JOIN submissions ON users.id = submissions.user_id
        LEFT JOIN evaluations ON submissions.id = evaluations.submission_id
        WHERE users.id = ?
        GROUP BY users.id
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error fetching profile');
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result[0]);
    });
});

module.exports = router;