const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');

function parseNum(val) {
  if (val === undefined || val === null || val === '') return 0.0;
  const num = parseFloat(val);
  return isNaN(num) ? 0.0 : num;
}

async function saveExpenses(req, res) {
  try {
    const { userId } = req.params;
    const body = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const rent = parseNum(body.rent);
    const electricity = parseNum(body.electricity);
    const raw_materials = parseNum(body.rawMaterials ?? body.raw_materials);
    const transport = parseNum(body.transport);
    const wages = parseNum(body.wages);
    const packaging = parseNum(body.packaging);
    const emi = parseNum(body.emi);
    const other = parseNum(body.other);

    if (isPostgres()) {
      const result = await pool.query(
        `INSERT INTO expenses (user_id, rent, electricity, raw_materials, transport, wages, packaging, emi, other, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id)
         DO UPDATE SET
           rent = EXCLUDED.rent,
           electricity = EXCLUDED.electricity,
           raw_materials = EXCLUDED.raw_materials,
           transport = EXCLUDED.transport,
           wages = EXCLUDED.wages,
           packaging = EXCLUDED.packaging,
           emi = EXCLUDED.emi,
           other = EXCLUDED.other,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, rent, electricity, raw_materials, transport, wages, packaging, emi, other]
      );
      return res.json({ success: true, expenses: result.rows[0] });
    } else {
      const existing = inMemoryStore.expenses.get(userId) || {
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      const expenses = {
        ...existing,
        rent,
        electricity,
        raw_materials,
        transport,
        wages,
        packaging,
        emi,
        other,
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.expenses.set(userId, expenses);
      return res.json({ success: true, expenses });
    }
  } catch (err) {
    console.error('Error in saveExpenses:', err);
    return res.status(500).json({ error: 'Failed to save expenses info', details: err.message });
  }
}

async function getExpenses(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const result = await pool.query('SELECT * FROM expenses WHERE user_id = $1', [userId]);
      return res.json({ success: true, expenses: result.rows[0] || null });
    } else {
      const expenses = inMemoryStore.expenses.get(userId) || null;
      return res.json({ success: true, expenses });
    }
  } catch (err) {
    console.error('Error in getExpenses:', err);
    return res.status(500).json({ error: 'Failed to retrieve expenses info', details: err.message });
  }
}

module.exports = {
  saveExpenses,
  getExpenses,
};
