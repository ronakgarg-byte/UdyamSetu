const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/udyam_setu',
});

async function runMigrations() {
  console.log('🔄 [Migration] Starting Udyam Setu database migrations...');
  const client = await pool.connect();
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf-8');

    console.log('📄 [Migration] Applying schema.sql...');
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('✅ [Migration] Schema applied successfully.');

    console.log('🌱 [Migration] Applying seeds.sql...');
    await client.query('BEGIN');
    await client.query(seedsSql);
    await client.query('COMMIT');
    console.log('✅ [Migration] Master seeds inserted successfully.');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('📊 [Migration] Verified active tables in database:');
    res.rows.forEach((r) => console.log(`   - ${r.table_name}`));
    
    console.log('🎉 [Migration] All migrations completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ [Migration Error]:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
