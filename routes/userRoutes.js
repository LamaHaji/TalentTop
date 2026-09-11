const express = require('express');
const router = express.Router();
const db = require('../config/db');

//لوحة المتصدرين
router.get('/leaderboard', (req, res) => {
    const sql = `
        SELECT Users.id, Users.username, SUM(Evaluations.score) AS total_points
        FROM Users
        JOIN Submissions ON Users.id = Submissions.user_id
        JOIN Evaluations ON Submissions.id = Evaluations.submission_id
        GROUP BY Users.id
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
            Users.id,
            Users.username,
            COUNT(DISTINCT Submissions.id) AS total_submissions,
            IFNULL(SUM(Evaluations.score), 0) AS total_points
        FROM Users
        LEFT JOIN Submissions ON Users.id = Submissions.user_id
        LEFT JOIN Evaluations ON Submissions.id = Evaluations.submission_id
        WHERE Users.id = ?
        GROUP BY Users.id
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