const jwt = require('jsonwebtoken');

// Middleware أول: يتحقق أن المستخدم مسجل دخول (عنده Token صحيح)
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).send('No token provided');
    }

    // الشكل المتوقع للـ header هو: "Bearer xxxxx.yyyyy.zzzzz"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Invalid token format');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid or expired token');
        }

        // نخزن معلومات المستخدم المستخرجة من الـ Token داخل req
        // حتى تكون متاحة لأي كود لاحق في نفس الطلب
        req.user = decoded;
        next();
    });
}

// Middleware ثاني: يتحقق أن المستخدم دوره admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied: admin only');
    }
    next();
}

module.exports = { verifyToken, requireAdmin };