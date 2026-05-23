const sql = require('../../lib/db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { query } = req.query;
    if (!query || query.length < 2) return res.status(200).json({ users: [], channels: [], groups: [] });

    const pattern = `%${query}%`;
    const [users, channels] = await Promise.all([
        sql`SELECT id, username, avatar_url, bio, is_verified, is_gold_verified FROM users WHERE username ILIKE ${pattern} LIMIT 20`,
        sql`SELECT id, name, username, description, owner_id FROM channels WHERE name ILIKE ${pattern} OR username ILIKE ${pattern} LIMIT 20`
    ]);

    return res.status(200).json({
        users: users.map(u => ({
            id: u.id, username: u.username, avatarUrl: u.avatar_url,
            bio: u.bio, isVerified: u.is_verified, isGoldVerified: u.is_gold_verified
        })),
        channels: channels.map(c => ({
            id: c.id, name: c.name, username: c.username,
            description: c.description, ownerId: c.owner_id, subscribersCount: 0
        })),
        groups: []
    });
};
