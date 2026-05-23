const sql = require('../../lib/db');
const { verifyToken } = require('../../lib/auth');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const user = verifyToken(req);
    if (!user) return res.status(401).json({ message: 'Не авторизован' });

    const { chatId, text, imageUrl, videoUrl, stickerId, emoji } = req.body;

    const result = await sql`
        INSERT INTO messages (sender_id, chat_id, text, image_url, video_url, sticker_id, emoji)
        VALUES (${user.userId}, ${chatId}, ${text || null}, ${imageUrl || null}, ${videoUrl || null}, ${stickerId || null}, ${emoji || null})
        RETURNING *
    `;

    const m = result[0];
    return res.status(201).json({
        id: m.id, senderId: m.sender_id, chatId: m.chat_id,
        text: m.text, imageUrl: m.image_url, videoUrl: m.video_url,
        stickerId: m.sticker_id, emoji: m.emoji,
        timestamp: new Date(m.created_at).getTime()
    });
};
