const jwt = require('jsonwebtoken');

function verifyToken(req) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try { return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET); }
    catch (e) { return null; }
}

function generateToken(userId, username) {
    return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { verifyToken, generateToken };
