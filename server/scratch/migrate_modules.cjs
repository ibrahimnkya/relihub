const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mafuta_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    console.log('Starting migration: Add modules to companies');
    
    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='companies' AND column_name='modules'
    `;
    const res = await pool.query(checkQuery);
    
    if (res.rowCount === 0) {
      console.log('Adding "modules" column to "companies" table...');
      await pool.query('ALTER TABLE companies ADD COLUMN modules JSONB DEFAULT \'[]\'::jsonb');
      console.log('Column added successfully.');
    } else {
      console.log('Column "modules" already exists.');
    }
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    await pool.end();
    process.exit(1);
  }
}

migrate();
