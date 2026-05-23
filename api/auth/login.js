const bcrypt = require('bcryptjs');
const sql = require('../../lib/db');
const { generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { username, password } = req.body;
        const users = await sql`SELECT * FROM users WHERE username = ${username} OR email = ${username}`;
        if (users.length === 0) return res.status(401).json({ message: 'Неверный логин или пароль' });

        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ message: 'Неверный логин или пароль' });

        const token = generateToken(user.id, user.username);

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                avatarUrl: user.avatar_url,
                bio: user.bio,
                isBlitzPlus: user.is_blitz_plus,
                isVerified: user.is_verified,
                isGoldVerified: user.is_gold_verified,
                language: user.language,
                subscribersCount: 0,
                subscriptionsCount: 0
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Ошибка сервера' });
    }
};
