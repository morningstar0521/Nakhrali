const { pool } = require('../config/db');

// Get all hampers (admin)
const getAllHampers = async (req, res) => {
    try {
        const query = `
            SELECT 
                h.*,
                o.title as occasion_name,
                b.name as box_name,
                json_agg(
                    json_build_object(
                        'product_id', hp.product_id,
                        'quantity', hp.quantity,
                        'name', p.name,
                        'price', p.price,
                        'category', p.category,
                        'images', p.images
                    )
                ) as products
            FROM hampers h
            LEFT JOIN gift_occasions o ON h.occasion_id = o.id
            LEFT JOIN gift_boxes b ON h.box_id = b.id
            LEFT JOIN hamper_products hp ON h.id = hp.hamper_id
            LEFT JOIN products p ON hp.product_id = p.id
            GROUP BY h.id, o.title, b.name
            ORDER BY h.created_at DESC
        `;
        
        const result = await pool.query(query);
        res.json({ hampers: result.rows });
    } catch (error) {
        console.error('Error fetching all hampers:', error);
        res.status(500).json({ message: 'Error fetching hampers', error: error.message });
    }
};

// Get active hampers only (public)
const getActiveHampers = async (req, res) => {
    try {
        const query = `
            SELECT 
                h.*,
                o.title as occasion_name,
                b.name as box_name,
                json_agg(
                    json_build_object(
                        'product_id', hp.product_id,
                        'quantity', hp.quantity,
                        'name', p.name,
                        'price', p.price,
                        'category', p.category,
                        'images', p.images
                    )
                ) as products
            FROM hampers h
            LEFT JOIN gift_occasions o ON h.occasion_id = o.id
            LEFT JOIN gift_boxes b ON h.box_id = b.id
            LEFT JOIN hamper_products hp ON h.id = hp.hamper_id
            LEFT JOIN products p ON hp.product_id = p.id
            WHERE h.is_active = true
            GROUP BY h.id, o.title, b.name
            ORDER BY h.created_at DESC
        `;
        
        const result = await pool.query(query);
        res.json({ hampers: result.rows });
    } catch (error) {
        console.error('Error fetching active hampers:', error);
        res.status(500).json({ message: 'Error fetching hampers', error: error.message });
    }
};

// Get hamper by ID
const getHamperById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                h.*,
                o.title as occasion_name,
                b.name as box_name,
                b.price as box_price,
                json_agg(
                    json_build_object(
                        'product_id', hp.product_id,
                        'quantity', hp.quantity,
                        'name', p.name,
                        'price', p.price,
                        'category', p.category,
                        'images', p.images
                    )
                ) as products
            FROM hampers h
            LEFT JOIN gift_occasions o ON h.occasion_id = o.id
            LEFT JOIN gift_boxes b ON h.box_id = b.id
            LEFT JOIN hamper_products hp ON h.id = hp.hamper_id
            LEFT JOIN products p ON hp.product_id = p.id
            WHERE h.id = $1
            GROUP BY h.id, o.title, b.name, b.price
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Hamper not found' });
        }
        
        res.json({ hamper: result.rows[0] });
    } catch (error) {
        console.error('Error fetching hamper:', error);
        res.status(500).json({ message: 'Error fetching hamper', error: error.message });
    }
};

// Get hampers by occasion
const getHampersByOccasion = async (req, res) => {
    try {
        const { occasionId } = req.params;
        
        const query = `
            SELECT 
                h.*,
                o.title as occasion_name,
                b.name as box_name,
                json_agg(
                    json_build_object(
                        'product_id', hp.product_id,
                        'quantity', hp.quantity,
                        'name', p.name,
                        'price', p.price,
                        'category', p.category,
                        'images', p.images
                    )
                ) as products
            FROM hampers h
            LEFT JOIN gift_occasions o ON h.occasion_id = o.id
            LEFT JOIN gift_boxes b ON h.box_id = b.id
            LEFT JOIN hamper_products hp ON h.id = hp.hamper_id
            LEFT JOIN products p ON hp.product_id = p.id
            WHERE h.occasion_id = $1 AND h.is_active = true
            GROUP BY h.id, o.title, b.name
            ORDER BY h.created_at DESC
        `;
        
        const result = await pool.query(query, [occasionId]);
        res.json({ hampers: result.rows });
    } catch (error) {
        console.error('Error fetching hampers by occasion:', error);
        res.status(500).json({ message: 'Error fetching hampers', error: error.message });
    }
};

// Create hamper
const createHamper = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { name, description, occasion_id, box_id, image, is_active, total_price, products } = req.body;
        
        if (!name || !products || products.length === 0) {
            return res.status(400).json({ message: 'Name and products are required' });
        }
        
        // Insert hamper
        const hamperQuery = `
            INSERT INTO hampers (name, description, occasion_id, box_id, image, total_price, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const hamperResult = await client.query(hamperQuery, [
            name,
            description || null,
            occasion_id || null,
            box_id || null,
            image || null,
            total_price,
            is_active !== false
        ]);
        
        const hamperId = hamperResult.rows[0].id;
        
        // Insert hamper products
        for (const product of products) {
            await client.query(
                'INSERT INTO hamper_products (hamper_id, product_id, quantity) VALUES ($1, $2, $3)',
                [hamperId, product.product_id, product.quantity || 1]
            );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({
            message: 'Hamper created successfully',
            hamper: hamperResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating hamper:', error);
        res.status(500).json({ message: 'Error creating hamper', error: error.message });
    } finally {
        client.release();
    }
};

// Update hamper
const updateHamper = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { name, description, occasion_id, box_id, image, is_active, total_price, products } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        
        // Update hamper
        const hamperQuery = `
            UPDATE hampers
            SET name = $1,
                description = $2,
                occasion_id = $3,
                box_id = $4,
                image = $5,
                total_price = $6,
                is_active = $7,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `;
        
        const hamperResult = await client.query(hamperQuery, [
            name,
            description || null,
            occasion_id || null,
            box_id || null,
            image || null,
            total_price,
            is_active !== false,
            id
        ]);
        
        if (hamperResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Hamper not found' });
        }
        
        // Delete existing hamper products
        await client.query('DELETE FROM hamper_products WHERE hamper_id = $1', [id]);
        
        // Insert updated products
        if (products && products.length > 0) {
            for (const product of products) {
                await client.query(
                    'INSERT INTO hamper_products (hamper_id, product_id, quantity) VALUES ($1, $2, $3)',
                    [id, product.product_id, product.quantity || 1]
                );
            }
        }
        
        await client.query('COMMIT');
        
        res.json({
            message: 'Hamper updated successfully',
            hamper: hamperResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating hamper:', error);
        res.status(500).json({ message: 'Error updating hamper', error: error.message });
    } finally {
        client.release();
    }
};

// Delete hamper
const deleteHamper = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        
        // Delete hamper products first (foreign key constraint)
        await client.query('DELETE FROM hamper_products WHERE hamper_id = $1', [id]);
        
        // Delete hamper
        const result = await client.query('DELETE FROM hampers WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Hamper not found' });
        }
        
        await client.query('COMMIT');
        
        res.json({ message: 'Hamper deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting hamper:', error);
        res.status(500).json({ message: 'Error deleting hamper', error: error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    getAllHampers,
    getActiveHampers,
    getHamperById,
    getHampersByOccasion,
    createHamper,
    updateHamper,
    deleteHamper
};
