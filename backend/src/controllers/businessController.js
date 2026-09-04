const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');

async function saveBusiness(req, res) {
  try {
    const { userId } = req.params;
    const { type, what, workers, hours, address, location, district, state, pincode, lat, lng } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const workersNum = workers !== undefined && workers !== '' ? parseInt(workers, 10) : 0;

    if (isPostgres()) {
      const result = await pool.query(
        `INSERT INTO businesses (user_id, type, what, workers, hours, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           type = EXCLUDED.type,
           what = EXCLUDED.what,
           workers = EXCLUDED.workers,
           hours = EXCLUDED.hours,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, type || '', what || '', workersNum, hours || '']
      );
      return res.json({ success: true, business: { ...result.rows[0], address, location, district, state, pincode, lat, lng } });
    } else {
      const existing = inMemoryStore.businesses.get(userId) || {
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      const business = {
        ...existing,
        type: type || '',
        what: what || '',
        workers: workersNum,
        hours: hours || '',
        address: address || existing.address || '',
        location: location || existing.location || '',
        district: district || existing.district || '',
        state: state || existing.state || '',
        pincode: pincode || existing.pincode || '',
        lat: lat || existing.lat || null,
        lng: lng || existing.lng || null,
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.businesses.set(userId, business);
      return res.json({ success: true, business });
    }
  } catch (err) {
    console.error('Error in saveBusiness:', err);
    return res.status(500).json({ error: 'Failed to save business info', details: err.message });
  }
}

async function getBusiness(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const result = await pool.query('SELECT * FROM businesses WHERE user_id = $1', [userId]);
      return res.json({ success: true, business: result.rows[0] || null });
    } else {
      const business = inMemoryStore.businesses.get(userId) || null;
      return res.json({ success: true, business });
    }
  } catch (err) {
    console.error('Error in getBusiness:', err);
    return res.status(500).json({ error: 'Failed to retrieve business info', details: err.message });
  }
}

module.exports = {
  saveBusiness,
  getBusiness,
};
