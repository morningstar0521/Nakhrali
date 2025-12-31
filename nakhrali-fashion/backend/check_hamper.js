const { pool } = require('./config/db');

async function checkHamper() {
    try {
        const hamperId = '714aeb93-fa4b-4a83-8e40-e31185357bd9';
        
        console.log('Checking hamper:', hamperId);
        
        // Check hamper_products
        const { rows: hamperProducts } = await pool.query(
            'SELECT * FROM hamper_products WHERE hamper_id = $1',
            [hamperId]
        );
        console.log('\nHamper products:', JSON.stringify(hamperProducts, null, 2));
        
        // Check the actual query used in getAllHampers
        const { rows: hampers } = await pool.query(`
            SELECT 
                h.*,
                STRING_AGG(
                    CONCAT(p.id, ':', p.name, ':', p.price, ':', hp.quantity), '||'
                ) as products
            FROM hampers h
            LEFT JOIN hamper_products hp ON h.id = hp.hamper_id
            LEFT JOIN products p ON hp.product_id = p.id
            WHERE h.id = $1
            GROUP BY h.id
        `, [hamperId]);
        
        console.log('\nQuery result:', JSON.stringify(hampers, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkHamper();
