require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// تقديم ملفات الواجهة الأمامية (frontend) مباشرة
app.use(express.static(path.join(__dirname, 'frontend')));

// مسارات الـ APIs
app.use('/', authRoutes);
app.use('/', challengeRoutes);
app.use('/', evaluationRoutes);
app.use('/', userRoutes);

// أي رابط غير موجود (لا صفحة ولا API) يحصل على صفحة 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', '404.html'));
});

app.use(errorHandler);

// تشغيل السيرفر
app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('Visit: http://localhost:3000');
});