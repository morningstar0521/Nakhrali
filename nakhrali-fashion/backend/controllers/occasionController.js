const { pool } = require('../config/db');

// @desc    Get all active occasions
// @route   GET /api/occasions
// @access  Public
exports.getOccasions = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT * FROM gift_occasions
            WHERE active = true
            ORDER BY "order" ASC
        `;

        const result = await client.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            occasions: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Get all occasions (admin)
// @route   GET /api/occasions/all
// @access  Private/Admin
exports.getAllOccasions = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT * FROM gift_occasions
            ORDER BY "order" ASC
        `;

        const result = await client.query(query);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            occasions: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Create occasion
// @route   POST /api/occasions
// @access  Private/Admin
exports.createOccasion = async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, image, active, order } = req.body;

        const query = `
            INSERT INTO gift_occasions (title, description, image, active, "order", created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await client.query(query, [
            title,
            description || null,
            image,
            active !== undefined ? active : true,
            order || 0,
            req.user.id
        ]);

        res.status(201).json({
            success: true,
            occasion: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Update occasion
// @route   PUT /api/occasions/:id
// @access  Private/Admin
exports.updateOccasion = async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, image, active, order } = req.body;

        const query = `
            UPDATE gift_occasions
            SET title = COALESCE($1, title),
                description = $2,
                image = COALESCE($3, image),
                active = COALESCE($4, active),
                "order" = COALESCE($5, "order")
            WHERE id = $6
            RETURNING *
        `;

        const result = await client.query(query, [
            title,
            description,
            image,
            active,
            order,
            req.params.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Occasion not found'
            });
        }

        res.status(200).json({
            success: true,
            occasion: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};

// @desc    Delete occasion
// @route   DELETE /api/occasions/:id
// @access  Private/Admin
exports.deleteOccasion = async (req, res) => {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM gift_occasions WHERE id = $1 RETURNING id';
        const result = await client.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Occasion not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Occasion deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        client.release();
    }
};
