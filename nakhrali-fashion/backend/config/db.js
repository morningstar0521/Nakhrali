const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection and initialize database
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Supabase PostgreSQL Connected');

    // Initialize schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('Schema initialized');
    }

    // Run migrations
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = [
      'add_banner_redirect_link.sql',
      'add_gift_boxes.sql',
      'add_gift_occasions.sql',
      'add_hampers.sql',
      'add_product_attributes.sql',
      'update_category_constraint.sql',
      'add_user_dashboard.sql'
    ];

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      if (fs.existsSync(migrationPath)) {
        try {
          const migration = fs.readFileSync(migrationPath, 'utf8');
          await client.query(migration);
          console.log(`Migration ${file} applied`);
        } catch (e) {
          console.log(`Migration ${file} skipped`);
        }
      }
    }

    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
