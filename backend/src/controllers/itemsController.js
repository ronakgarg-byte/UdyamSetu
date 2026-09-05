const { pool, inMemoryStore, isPostgres } = require('../config/db');
const crypto = require('crypto');
const { extractBahiKhataFromImage, parsePrice } = require('../services/ocrService');

function parseNum(val) {
  if (val === undefined || val === null || val === '') return 0.0;
  const num = parseFloat(val);
  return isNaN(num) ? 0.0 : num;
}

async function saveItems(req, res) {
  try {
    const { userId } = req.params;
    const { items = [] } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    const sanitizedItems = items.map((it) => ({
      desc: (it.desc || it.description || '').trim(),
      sellPrice: parseNum(it.sellPrice ?? it.sell_price),
      costPrice: parseNum(it.costPrice ?? it.cost_price),
      seasonal: it.seasonal === 'yes' || it.seasonal === true,
    }));

    if (isPostgres()) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM items WHERE user_id = $1', [userId]);

        const savedRows = [];
        for (const it of sanitizedItems) {
          if (!it.desc && it.sellPrice === 0 && it.costPrice === 0) continue;
          const result = await client.query(
            `INSERT INTO items (user_id, description, sell_price, cost_price, seasonal)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, description as desc, sell_price as "sellPrice", cost_price as "costPrice", CASE WHEN seasonal THEN 'yes' ELSE 'no' END as seasonal`,
            [userId, it.desc, it.sellPrice, it.costPrice, it.seasonal]
          );
          savedRows.push(result.rows[0]);
        }

        await client.query('COMMIT');
        return res.json({ success: true, items: savedRows });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else {
      const savedItems = sanitizedItems
        .filter((it) => it.desc || it.sellPrice > 0 || it.costPrice > 0)
        .map((it) => ({
          id: crypto.randomUUID(),
          desc: it.desc,
          sellPrice: it.sellPrice,
          costPrice: it.costPrice,
          seasonal: it.seasonal ? 'yes' : 'no',
        }));

      inMemoryStore.items.set(userId, savedItems);
      return res.json({ success: true, items: savedItems });
    }
  } catch (err) {
    console.error('Error in saveItems:', err);
    return res.status(500).json({ error: 'Failed to save items', details: err.message });
  }
}

async function getItems(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (isPostgres()) {
      const result = await pool.query(
        `SELECT id, description as desc, sell_price as "sellPrice", cost_price as "costPrice", 
                CASE WHEN seasonal THEN 'yes' ELSE 'no' END as seasonal
         FROM items 
         WHERE user_id = $1 
         ORDER BY created_at ASC`,
        [userId]
      );
      return res.json({ success: true, items: result.rows });
    } else {
      const items = inMemoryStore.items.get(userId) || [];
      return res.json({ success: true, items });
    }
  } catch (err) {
    console.error('Error in getItems:', err);
    return res.status(500).json({ error: 'Failed to retrieve items', details: err.message });
  }
}

/**
 * Scan handwritten Bahi Khata photo and return transcribed 3-column table
 */
async function scanBahiKhata(req, res) {
  try {
    const { imageBase64, image, mimeType, text } = req.body || {};

    if (!imageBase64 && !image && !text) {
      return res.status(400).json({
        error: 'Please provide an image photo of your Bahi Khata or text table.',
      });
    }

    const result = await extractBahiKhataFromImage({
      imageBase64: imageBase64 || image,
      mimeType: mimeType || 'image/jpeg',
      text: text || '',
    });

    return res.json({
      success: true,
      items: result.items || [],
      rowCount: result.rowCount || (result.items ? result.items.length : 0),
      notes: result.notes || 'Bahi Khata scanned successfully',
      engine: result.engine || 'ocr-vision',
    });
  } catch (err) {
    console.error('Error in scanBahiKhata:', err);
    return res.status(500).json({
      error: 'Failed to scan Bahi Khata',
      details: err.message,
    });
  }
}

module.exports = {
  saveItems,
  getItems,
  scanBahiKhata,
};
