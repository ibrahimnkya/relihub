import db from '../db.js';

async function migrate() {
  try {
    console.log('Starting migration: Add modules to companies');
    
    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='companies' AND column_name='modules'
    `;
    const res = await db.query(checkQuery);
    
    if (res.rowCount === 0) {
      console.log('Adding "modules" column to "companies" table...');
      await db.query('ALTER TABLE companies ADD COLUMN modules JSONB DEFAULT \'[]\'::jsonb');
      console.log('Column added successfully.');
    } else {
      console.log('Column "modules" already exists.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
