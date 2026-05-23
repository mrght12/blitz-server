const bcrypt = require('bcryptjs');
const sql = require('../../lib/db');
const { generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: 'Все поля обязательны' });

        const existing = await sql`SELECT id FROM users WHERE username = ${username} OR email = ${email}`;
        if (existing.length > 0) return res.status(400).json({ message: 'Пользователь уже существует' });

        const hash = await bcrypt.hash(password, 10);
        const result = await sql`
            INSERT INTO users (username, email, password_hash)
            VALUES (${username}, ${email}, ${hash})
            RETURNING id, username, avatar_url, bio, is_blitz_plus, is_verified, is_gold_verified, language
        `;

        const user = result[0];
        const token = generateToken(user.id, user.username);

        return res.status(201).json({
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
