const { pool } = require('../config/db');

// Get all active gift boxes (public)
const getBoxes = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM gift_boxes WHERE active = true ORDER BY name ASC'
        );
        res.json({ boxes: result.rows });
    } catch (error) {
        console.error('Error fetching gift boxes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all gift boxes (admin only)
const getAllBoxes = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT gb.*, u.full_name as creator_name FROM gift_boxes gb LEFT JOIN users u ON gb.created_by = u.id ORDER BY gb.created_at DESC'
        );
        res.json({ boxes: result.rows });
    } catch (error) {
        console.error('Error fetching all gift boxes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create gift box (admin only)
const createBox = async (req, res) => {
    try {
        const { name, description, price, image, dimensions, color, material, stock, active } = req.body;

        // Validation
        if (!name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        if (parseFloat(price) < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        const result = await pool.query(
            `INSERT INTO gift_boxes 
            (name, description, price, image, dimensions, color, material, stock, active, created_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                name,
                description || null,
                parseFloat(price),
                image || null,
                dimensions || null,
                color || null,
                material || null,
                parseInt(stock) || 0,
                active !== undefined ? active : true,
                req.user.id
            ]
        );

        res.status(201).json({
            message: 'Gift box created successfully',
            box: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating gift box:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update gift box (admin only)
const updateBox = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, dimensions, color, material, stock, active } = req.body;

        // Check if box exists
        const checkBox = await pool.query('SELECT * FROM gift_boxes WHERE id = $1', [id]);
        if (checkBox.rows.length === 0) {
            return res.status(404).json({ message: 'Gift box not found' });
        }

        // Validation
        if (price && parseFloat(price) < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        const result = await pool.query(
            `UPDATE gift_boxes 
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                image = COALESCE($4, image),
                dimensions = COALESCE($5, dimensions),
                color = COALESCE($6, color),
                material = COALESCE($7, material),
                stock = COALESCE($8, stock),
                active = COALESCE($9, active)
            WHERE id = $10
            RETURNING *`,
            [
                name,
                description,
                price ? parseFloat(price) : null,
                image,
                dimensions,
                color,
                material,
                stock !== undefined ? parseInt(stock) : null,
                active,
                id
            ]
        );

        res.json({
            message: 'Gift box updated successfully',
            box: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating gift box:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete gift box (admin only)
const deleteBox = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM gift_boxes WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Gift box not found' });
        }

        res.json({ message: 'Gift box deleted successfully' });
    } catch (error) {
        console.error('Error deleting gift box:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getBoxes,
    getAllBoxes,
    createBox,
    updateBox,
    deleteBox
};
