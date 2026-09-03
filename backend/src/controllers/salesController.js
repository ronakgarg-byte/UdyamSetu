const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');

async function saveSales(req, res) {
  try {
    const { userId } = req.params;
    const { customersPerDay, dailySales, monthlyRevenue } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const cpd = customersPerDay !== undefined && customersPerDay !== '' ? parseInt(customersPerDay, 10) : 0;
    const ds = dailySales !== undefined && dailySales !== '' ? parseFloat(dailySales) : 0.0;
    const mr = monthlyRevenue !== undefined && monthlyRevenue !== '' && monthlyRevenue !== null ? parseFloat(monthlyRevenue) : null;

    if (isPostgres()) {
      const result = await pool.query(
        `INSERT INTO sales (user_id, customers_per_day, daily_sales, monthly_revenue, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id)
         DO UPDATE SET
           customers_per_day = EXCLUDED.customers_per_day,
           daily_sales = EXCLUDED.daily_sales,
           monthly_revenue = EXCLUDED.monthly_revenue,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, cpd, ds, mr]
      );
      return res.json({ success: true, sales: result.rows[0] });
    } else {
      const existing = inMemoryStore.sales.get(userId) || {
        id: crypto.randomUUID(),
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      const sales = {
        ...existing,
        customers_per_day: cpd,
        daily_sales: ds,
        monthly_revenue: mr,
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.sales.set(userId, sales);
      return res.json({ success: true, sales });
    }
  } catch (err) {
    console.error('Error in saveSales:', err);
    return res.status(500).json({ error: 'Failed to save sales info', details: err.message });
  }
}

async function getSales(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const result = await pool.query('SELECT * FROM sales WHERE user_id = $1', [userId]);
      return res.json({ success: true, sales: result.rows[0] || null });
    } else {
      const sales = inMemoryStore.sales.get(userId) || null;
      return res.json({ success: true, sales });
    }
  } catch (err) {
    console.error('Error in getSales:', err);
    return res.status(500).json({ error: 'Failed to retrieve sales info', details: err.message });
  }
}

module.exports = {
  saveSales,
  getSales,
};
