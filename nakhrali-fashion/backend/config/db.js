const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    password: 'L_Czy9$AVn-+Bmn',
    host: 'db.xwflnrmbijiddknaedpa.supabase.co',
    port: 5432,
    database: 'postgres'
});

// Test connection and initialize database
const connectDB = async () => {
    try {
        // Test connection
        const client = await pool.connect();
        console.log(`PostgreSQL Connected: ${client.host}`);

        // Initialize schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schema);
        console.log('Database schema initialized successfully');

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
            try {
                const migrationPath = path.join(migrationsDir, file);
                if (fs.existsSync(migrationPath)) {
                    const migration = fs.readFileSync(migrationPath, 'utf8');
                    await client.query(migration);
                    console.log(`Migration ${file} executed successfully`);
                }
            } catch (migrationError) {
                // Migration might already be applied, log and continue
                console.log(`Migration ${file}: ${migrationError.message}`);
            }
        }

        client.release();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Export pool for queries
module.exports = { pool, connectDB };
