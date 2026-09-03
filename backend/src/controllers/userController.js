const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');

async function createUser(req, res) {
  try {
    const { name, age, gender, phone, preferred_language = 'en', district = 'Varanasi', state = 'Uttar Pradesh' } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const ageNum = age !== undefined && age !== '' ? parseInt(age, 10) : null;
    const phoneStr = phone ? String(phone).trim() : '';

    if (isPostgres()) {
      const result = await pool.query(
        `INSERT INTO users (name, age, gender, phone, preferred_language, district, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name.trim(), ageNum, gender || null, phoneStr, preferred_language, district, state]
      );
      const user = result.rows[0];
      return res.status(201).json({ success: true, userId: user.id, user });
    } else {
      const id = crypto.randomUUID();
      const user = {
        id,
        name: name.trim(),
        age: ageNum,
        gender: gender || '',
        phone: phoneStr,
        preferred_language,
        district,
        state,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.users.set(id, user);
      return res.status(201).json({ success: true, userId: id, user });
    }
  } catch (err) {
    console.error('Error in createUser:', err);
    return res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
}

async function getUser(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ success: true, user: result.rows[0] });
    } else {
      const user = inMemoryStore.users.get(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({ success: true, user });
    }
  } catch (err) {
    console.error('Error in getUser:', err);
    return res.status(500).json({ error: 'Failed to retrieve user', details: err.message });
  }
}

module.exports = {
  createUser,
  getUser,
};
