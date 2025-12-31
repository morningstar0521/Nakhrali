const { pool } = require('./config/db');

async function checkAll() {
    try {
        // Check all hampers
        const { rows: hampers } = await pool.query('SELECT id, name FROM hampers LIMIT 5');
        console.log('Hampers:', hampers);
        
        // Check all hamper_products
        const { rows: hp } = await pool.query('SELECT * FROM hamper_products LIMIT 10');
        console.log('\nHamper products:', hp);
        
        // Check product IDs and their types
        const { rows: products } = await pool.query('SELECT id, name FROM products LIMIT 5');
        console.log('\nProducts:', products);
        console.log('First product ID type:', typeof products[0]?.id, products[0]?.id);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAll();
